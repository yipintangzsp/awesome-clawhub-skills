#!/usr/bin/env node
/** Email Validator - 邮箱验证工具 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/email-validator.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'email-validator', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const valid = regex.test(email);
  const domain = email.split('@')[1];
  const providers = ['gmail.com', 'qq.com', '163.com', 'outlook.com', 'yahoo.com'];
  return { success: true, email, valid, domain, isProvider: providers.includes(domain), disposable: domain?.includes('temp') || domain?.includes('fake') };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.length === 0) { console.log('用法：email-validator <邮箱地址>\n示例：email-validator test@gmail.com'); return; }
  const email = args[0], price = config.price_per_call || 0.5, userId = process.env.USER || 'unknown';
  console.log(`📧 Email Validator\n🔍 邮箱：${email}\n💰 费用：¥${price}\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📧 正在验证...');
  const result = validateEmail(email);
  console.log(`\n━━━ 验证结果 ━━━`);
  console.log(`格式：${result.valid ? '✅ 有效' : '❌ 无效'}`);
  console.log(`域名：${result.domain}`);
  console.log(`服务商：${result.isProvider ? '主流邮箱' : '自定义域名'}`);
  console.log(`临时邮箱：${result.disposable ? '⚠️ 可能是' : '✅ 否'}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
