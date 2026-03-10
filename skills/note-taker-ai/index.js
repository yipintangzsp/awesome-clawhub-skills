#!/usr/bin/env node
/** 笔记整理 AI **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/note-taker-ai.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'note-taker-ai', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function note_taker_ai(topic = '会议', format = 'outline') {
  const templates = {
    outline: { title: '主题', sections: ['背景', '要点', '行动项'] },
    cornell: { title: '主题', cues: ['关键词'], notes: ['详细内容'], summary: '总结' },
    mindmap: { center: '主题', branches: ['分支 1', '分支 2', '分支 3'] }
  };
  const t = templates[format] || templates.outline;
  return { success: true, topic, format, template: t, tags: [`#${topic}`, '#笔记', '#整理'] };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：note-taker-ai [选项]
功能：笔记整理 AI
价格：¥5/次

选项:
  --help     显示帮助信息
  --topic    主题 (默认 会议)
  --format   格式 (outline/cornell/mindmap, 默认 outline)

示例:
  note-taker-ai --topic 学习 --format cornell
`);
    return;
  }
  
  const price = config.price_per_call || 5, userId = process.env.USER || 'unknown';
  const topic = args.find(a => a.startsWith('--topic='))?.split('=')[1] || '会议';
  const format = args.find(a => a.startsWith('--format='))?.split('=')[1] || 'outline';
  
  console.log(`📓 笔记整理 AI\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在整理...\n');
  const result = note_taker_ai(topic, format);
  
  console.log('━━━ 笔记模板 ━━━');
  console.log(`📌 主题：${result.topic} | 格式：${result.format}`);
  console.log(`\n🏷️ 标签：${result.tags.join(' ')}`);
  console.log('\n模板结构:');
  console.log(JSON.stringify(result.template, null, 2));
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
