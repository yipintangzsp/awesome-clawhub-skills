#!/usr/bin/env node
/** 小费计算器 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/tip-calculator-pro.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'tip-calculator-pro', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function tip_calculator_pro(bill = 100, rate = 15) {
  const tip = Math.round(bill * rate / 100 * 100) / 100;
  const total = bill + tip;
  return { success: true, bill, rate, tip, total };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：tip-calculator-pro [选项]
功能：小费计算器
价格：¥1/次

选项:
  --help     显示帮助信息
  --bill     账单金额 (默认 100)
  --rate     小费比例 (默认 15)

示例:
  tip-calculator-pro --bill 200 --rate 20
`);
    return;
  }
  
  const price = config.price_per_call || 1, userId = process.env.USER || 'unknown';
  const bill = parseFloat(args.find(a => a.startsWith('--bill='))?.split('=')[1]) || 100;
  const rate = parseFloat(args.find(a => a.startsWith('--rate='))?.split('=')[1]) || 15;
  
  console.log(`🧮 小费计算器\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在计算...\n');
  const result = tip_calculator_pro(bill, rate);
  
  console.log('━━━ 计算结果 ━━━');
  console.log(`📋 账单：¥${result.bill}`);
  console.log(`💵 小费 (${result.rate}%): ¥${result.tip}`);
  console.log(`\n总计：¥${result.total}`);
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
