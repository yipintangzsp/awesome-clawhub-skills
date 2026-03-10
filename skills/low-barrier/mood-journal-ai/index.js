#!/usr/bin/env node
/** 心情日记 AI **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/mood-journal-ai.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'mood-journal-ai', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function mood_journal_ai(mood = 'happy', note = '') {
  const moods = {
    happy: { score: 8, color: '🟢', advice: '保持好心情，分享快乐！' },
    neutral: { score: 5, color: '🟡', advice: '平淡的一天，找点小乐趣' },
    sad: { score: 3, color: '🔵', advice: '难过很正常，和朋友聊聊' },
    anxious: { score: 4, color: '🟠', advice: '深呼吸，做点放松的事' },
    angry: { score: 3, color: '🔴', advice: '冷静一下，运动发泄' }
  };
  const m = moods[mood] || moods.neutral;
  return { success: true, mood, ...m, note, timestamp: new Date().toISOString() };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：mood-journal-ai [选项]
功能：心情日记 AI
价格：¥2/次

选项:
  --help     显示帮助信息
  --mood     心情 (happy/neutral/sad/anxious/angry, 默认 happy)
  --note     备注 (可选)

示例:
  mood-journal-ai --mood happy --note 今天完成了项目
`);
    return;
  }
  
  const price = config.price_per_call || 2, userId = process.env.USER || 'unknown';
  const mood = args.find(a => a.startsWith('--mood='))?.split('=')[1] || 'happy';
  const note = args.find(a => a.startsWith('--note='))?.split('=')[1] || '';
  
  console.log(`📔 心情日记 AI\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在记录...');
  const result = mood_journal_ai(mood, note);
  
  console.log('\n━━━ 心情记录 ━━━');
  console.log(`${result.color} 心情：${result.mood}`);
  console.log(`📊 评分：${result.score}/10`);
  if (note) console.log(`📝 备注：${note}`);
  console.log(`💡 建议：${result.advice}`);
  console.log(`⏰ 时间：${new Date(result.timestamp).toLocaleString('zh-CN')}`);
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
