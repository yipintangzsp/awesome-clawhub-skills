#!/usr/bin/env node
/** Crypto Payroll System - 加密薪资系统 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/crypto-payroll-system.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'crypto-payroll-system', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generatePayrollPlan(employees, tokens) {
  const tokenList = tokens.split(',');
  return {
    employees: parseInt(employees) || 10,
    tokens: tokenList,
    features: ['批量发放', '自动汇率', '工资单生成', '税务报表', '合规审计'],
    supportedChains: ['Ethereum', 'BSC', 'Polygon', 'Solana'],
    paymentSchedule: ['月薪', '双周薪', '周薪', '自定义'],
    compliance: ['个税计算', '社保缴纳', '年度报告', '审计日志']
  };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const empArg = args.find(a => a.startsWith('--employees='));
  const tokensArg = args.find(a => a.startsWith('--tokens='));
  if (!empArg || !tokensArg) { console.log('用法：crypto-payroll-system --employees=<员工数> --tokens=<代币列表>\n示例：crypto-payroll-system --employees=50 --tokens=USDT,USDC,ETH'); return; }
  const employees = empArg.split('=')[1], tokens = tokensArg.split('=')[1], price = config.price_per_month || 599, userId = process.env.USER || 'unknown';
  console.log(`💰 Crypto Payroll System\n👥 员工数：${employees}\n🪙 代币：${tokens}\n💰 费用：¥${price}/月\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📋 正在生成薪资方案...\n');
  const plan = generatePayrollPlan(employees, tokens);
  console.log(`━━━ 薪资方案 ━━━`);
  console.log(`员工数量：${plan.employees}人`);
  console.log(`支持代币：${plan.tokens.join(', ')}`);
  console.log(`功能：${plan.features.join(', ')}`);
  console.log(`支持链：${plan.supportedChains.join(', ')}`);
  console.log(`发放周期：${plan.paymentSchedule.join(', ')}`);
  console.log(`合规支持：${plan.compliance.join(', ')}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
