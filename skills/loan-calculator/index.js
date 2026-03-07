#!/usr/bin/env node
/** Loan Calculator - 贷款计算器 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/loan-calculator.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'loan-calculator', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function calculateLoan(principal, rate, years) {
  const monthlyRate = rate / 100 / 12;
  const months = years * 12;
  const monthlyPayment = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  const totalPayment = monthlyPayment * months;
  const totalInterest = totalPayment - principal;
  return { success: true, monthlyPayment: monthlyPayment.toFixed(2), totalPayment: totalPayment.toFixed(2), totalInterest: totalInterest.toFixed(2), principal };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.length < 3) { console.log('用法：loan-calculator <金额> <年利率%> <年数>\n示例：loan-calculator 1000000 4.5 30'); return; }
  const principal = parseFloat(args[0]), rate = parseFloat(args[1]), years = parseInt(args[2]), price = config.price_per_call || 1, userId = process.env.USER || 'unknown';
  console.log(`🏠 Loan Calculator\n💰 贷款：¥${principal.toLocaleString()}\n📊 利率：${rate}%\n📅 期限：${years}年\n💰 费用：¥${price}\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n🏠 正在计算...');
  const result = calculateLoan(principal, rate, years);
  console.log(`\n━━━ 计算结果 ━━━`);
  console.log(`月供：¥${parseFloat(result.monthlyPayment).toLocaleString('zh-CN', {minimumFractionDigits: 2})}`);
  console.log(`总还款：¥${parseFloat(result.totalPayment).toLocaleString('zh-CN', {minimumFractionDigits: 2})}`);
  console.log(`总利息：¥${parseFloat(result.totalInterest).toLocaleString('zh-CN', {minimumFractionDigits: 2})}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
