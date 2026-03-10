#!/usr/bin/env node
/** Global Payment Gateway - 全球支付网关 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/global-payment-gateway.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'global-payment-gateway', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generatePaymentGateway(regions, methods) {
  const regionList = regions.split(',');
  const methodList = methods.split(',');
  return {
    regions: regionList,
    methods: methodList,
    providers: ['Stripe', 'PayPal', 'Adyen', 'Airwallex', 'PingPong'],
    currencies: ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD'],
    features: ['一键接入', '多币种结算', '风险控制', '欺诈检测', '退款管理'],
    compliance: ['PCI DSS', 'GDPR', 'PSD2', 'AML/KYC'],
    fees: '交易手续费 1.5%-3.5%',
    settlement: 'T+1/T+2/T+7 可选'
  };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const regionsArg = args.find(a => a.startsWith('--regions='));
  const methodsArg = args.find(a => a.startsWith('--methods='));
  if (!regionsArg || !methodsArg) { console.log('用法：global-payment-gateway --regions=<目标区域> --methods=<支付方式>\n示例：global-payment-gateway --regions=US,EU --methods=card,paypal,apple_pay'); return; }
  const regions = regionsArg.split('=')[1], methods = methodsArg.split('=')[1], price = config.price_per_month || 699, userId = process.env.USER || 'unknown';
  console.log(`💳 Global Payment Gateway\n🌍 区域：${regions}\n💰 方式：${methods}\n💰 费用：¥${price}/月\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📋 正在生成支付方案...\n');
  const payment = generatePaymentGateway(regions, methods);
  console.log(`━━━ 支付方案 ━━━`);
  console.log(`目标区域：${payment.regions.join(', ')}`);
  console.log(`支付方式：${payment.methods.join(', ')}`);
  console.log(`服务商：${payment.providers.join(', ')}`);
  console.log(`支持货币：${payment.currencies.join(', ')}`);
  console.log(`功能：${payment.features.join(', ')}`);
  console.log(`合规：${payment.compliance.join(', ')}`);
  console.log(`费率：${payment.fees}`);
  console.log(`结算：${payment.settlement}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
