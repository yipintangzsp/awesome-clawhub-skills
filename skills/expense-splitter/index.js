#!/usr/bin/env node
/** 费用分摊器 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/expense-splitter.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'expense-splitter', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function expense_splitter(total = 100, people = 2) {
  const perPerson = Math.round(total / people * 100) / 100;
  const remainder = Math.round((total - perPerson * people) * 100) / 100;
  return { success: true, total, people, perPerson, remainder, method: 'AA 制' };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：expense-splitter [选项]
功能：费用分摊器
价格：¥2/次

选项:
  --help     显示帮助信息
  --total    总金额 (默认 100)
  --people   人数 (默认 2)

示例:
  expense-splitter --total 500 --people 5
`);
    return;
  }
  
  const price = config.price_per_call || 2, userId = process.env.USER || 'unknown';
  const total = parseFloat(args.find(a => a.startsWith('--total='))?.split('=')[1]) || 100;
  const people = parseInt(args.find(a => a.startsWith('--people='))?.split('=')[1]) || 2;
  
  console.log(`💵 费用分摊器\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在计算...\n');
  const result = expense_splitter(total, people);
  
  console.log('━━━ 分摊结果 ━━━');
  console.log(`💰 总金额：¥${result.total}`);
  console.log(`👥 人数：${result.people}`);
  console.log(`\n每人应付：¥${result.perPerson}`);
  if (result.remainder !== 0) console.log(`零头：¥${result.remainder}`);
  console.log(`\n方式：${result.method}`);
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
