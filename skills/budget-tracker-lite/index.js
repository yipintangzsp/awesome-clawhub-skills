#!/usr/bin/env node
/** 预算追踪精简版 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/budget-tracker-lite.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'budget-tracker-lite', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function budget_tracker_lite(income = 10000, categories = {}) {
  const defaultCats = { 房租：3000, 餐饮：2000, 交通：500, 娱乐：1000, 储蓄：2000, 其他：1500 };
  const cats = { ...defaultCats, ...categories };
  const total = Object.values(cats).reduce((a, b) => a + b, 0);
  const balance = income - total;
  const status = balance >= 0 ? '✅ 预算内' : '⚠️ 超支';
  return { success: true, income, categories: cats, total, balance, status };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：budget-tracker-lite [选项]
功能：预算追踪精简版
价格：¥5/次

选项:
  --help     显示帮助信息
  --income   月收入 (默认 10000)

示例:
  budget-tracker-lite --income 15000
`);
    return;
  }
  
  const price = config.price_per_call || 5, userId = process.env.USER || 'unknown';
  const income = parseInt(args.find(a => a.startsWith('--income='))?.split('=')[1]) || 10000;
  
  console.log(`💰 预算追踪精简版\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在分析...\n');
  const result = budget_tracker_lite(income);
  
  console.log('━━━ 预算分析 ━━━');
  console.log(`💵 月收入：¥${result.income}`);
  console.log(`\n支出分类:`);
  Object.entries(result.categories).forEach(([k, v]) => console.log(`  ${k}: ¥${v}`));
  console.log(`\n总支出：¥${result.total}`);
  console.log(`结余：¥${result.balance}`);
  console.log(`状态：${result.status}`);
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
