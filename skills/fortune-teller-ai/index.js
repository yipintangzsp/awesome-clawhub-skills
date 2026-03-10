#!/usr/bin/env node
/** 算命 AI **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/fortune-teller-ai.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'fortune-teller-ai', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function fortune_teller_ai(zodiac = '龙', type = '运势') {
  const fortunes = {
    运势：['今日运势极佳', '有意外惊喜', '小心小人', '财运亨通', '注意健康'],
    爱情：['桃花运旺', '单身者有机会', '感情升温', '避免争吵', '适合表白'],
    事业：['工作顺利', '有晋升机会', '注意细节', '合作有利', '宜创新']
  };
  const lucks = ['大吉', '吉', '中吉', '小吉', '平', '小凶', '凶'];
  const f = fortunes[type] || fortunes.运势;
  const fortune = f[Math.floor(Math.random() * f.length)];
  const luck = lucks[Math.floor(Math.random() * lucks.length)];
  return { success: true, zodiac, type, fortune, luck, tip: '娱乐仅供参考' };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：fortune-teller-ai [选项]
功能：算命 AI
价格：¥2/次

选项:
  --help     显示帮助信息
  --zodiac   生肖
  --type     类型 (运势/爱情/事业，默认 运势)

示例:
  fortune-teller-ai --zodiac 龙 --type 爱情
`);
    return;
  }
  
  const price = config.price_per_call || 2, userId = process.env.USER || 'unknown';
  const zodiac = args.find(a => a.startsWith('--zodiac='))?.split('=')[1] || '龙';
  const type = args.find(a => a.startsWith('--type='))?.split('=')[1] || '运势';
  
  console.log(`🔮 算命 AI\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在占卜...\n');
  const result = fortune_teller_ai(zodiac, type);
  
  console.log('━━━ 运势预测 ━━━');
  console.log(`🐲 生肖：${result.zodiac}`);
  console.log(`📋 类型：${result.type}`);
  console.log(`\n🎯 运势：${result.fortune}`);
  console.log(`🍀 运气：${result.luck}`);
  console.log(`\n💡 ${result.tip}`);
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
