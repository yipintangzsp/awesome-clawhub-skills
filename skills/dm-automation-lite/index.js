#!/usr/bin/env node
/** 私聊自动化精简版 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/dm-automation-lite.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'dm-automation-lite', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function dm_automation_lite() {
  const templates = {
    welcome: ['你好呀！感谢关注～', '欢迎！有什么可以帮你的？', 'Hi～终于等到你！'],
    faq: ['常见问题请看置顶笔记', '价格表在主页哦', '合作请私信'],
    followup: ['考虑得怎么样？', '有问题随时问我', '期待你的反馈'],
    thank: ['感谢支持！', '谢谢信任～', '感恩相遇！']
  };
  const triggers = {
    '你好': 'welcome',
    '价格': 'faq',
    '怎么买': 'faq',
    '考虑': 'followup',
    '谢谢': 'thank'
  };
  return { success: true, templates, triggers, count: Object.keys(templates).length };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：dm-automation-lite [选项]
功能：私聊自动化精简版
价格：¥5/次

选项:
  --help     显示帮助信息

示例:
  dm-automation-lite
`);
    return;
  }
  
  const price = config.price_per_call || 5, userId = process.env.USER || 'unknown';
  
  console.log(`💌 私聊自动化精简版\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在生成...\n');
  const result = dm_automation_lite();
  
  console.log('━━━ 自动回复模板 ━━━');
  console.log(`📊 共${result.count}类场景\n`);
  Object.entries(result.templates).forEach(([type, replies]) => {
    console.log(`📁 ${type}:`);
    replies.forEach(r => console.log(`  • ${r}`));
  });
  console.log('\n🔑 触发词:');
  Object.entries(result.triggers).forEach(([k, v]) => console.log(`  "${k}" → ${v}`));
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
