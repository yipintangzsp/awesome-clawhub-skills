#!/usr/bin/env node
/** Invoice Generator - 发票生成器 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/invoice-generator.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'invoice-generator', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generateInvoice(company, amount, items) {
  const invoiceNo = `INV-${Date.now()}`;
  return { success: true, invoiceNo, company, amount, items, date: new Date().toISOString().split('T')[0] };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.length < 2) { console.log('用法：invoice-generator <公司名> <金额> [项目...]\n示例：invoice-generator "XX 公司" 5000 咨询服务 设计费'); return; }
  const company = args[0], amount = parseFloat(args[1]), items = args.slice(2) || ['服务费用'], price = config.price_per_call || 3, userId = process.env.USER || 'unknown';
  console.log(`📄 Invoice Generator\n🏢 公司：${company}\n💰 金额：¥${amount}\n💰 费用：¥${price}\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📄 正在生成发票...');
  const result = generateInvoice(company, amount, items);
  console.log(`\n━━━ 发票详情 ━━━`);
  console.log(`发票号：${result.invoiceNo}`);
  console.log(`日期：${result.date}`);
  console.log(`公司：${result.company}`);
  console.log(`项目：${result.items.join(', ')}`);
  console.log(`总额：¥${result.amount}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
