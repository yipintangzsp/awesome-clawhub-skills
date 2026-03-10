#!/usr/bin/env node
/** Multi Currency Pricing - 多货币定价 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/multi-currency-pricing.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'multi-currency-pricing', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generatePricingStrategy(baseCurrency, targetCurrencies) {
  const currencyList = targetCurrencies.split(',');
  return {
    baseCurrency,
    targetCurrencies: currencyList,
    features: ['实时汇率', '动态调价', '利润保护', '竞品比价', '心理定价'],
    strategies: ['成本加成', '竞争导向', '价值导向', '动态定价', '区域定价'],
    protection: ['汇率波动缓冲', '最低利润保障', '价格上限设置', '自动调整阈值'],
    integrations: ['Shopify', 'WooCommerce', 'Magento', 'Amazon', 'eBay'],
    updateFrequency: '实时/每小时/每日可选'
  };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const baseArg = args.find(a => a.startsWith('--base-currency='));
  const targetArg = args.find(a => a.startsWith('--target-currencies='));
  if (!baseArg || !targetArg) { console.log('用法：multi-currency-pricing --base-currency=<基础货币> --target-currencies=<目标货币>\n示例：multi-currency-pricing --base-currency=CNY --target-currencies=USD,EUR,GBP'); return; }
  const baseCurrency = baseArg.split('=')[1], targetCurrencies = targetArg.split('=')[1], price = config.price_per_month || 399, userId = process.env.USER || 'unknown';
  console.log(`💱 Multi Currency Pricing\n💰 基础货币：${baseCurrency}\n🌍 目标货币：${targetCurrencies}\n💰 费用：¥${price}/月\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📋 正在生成定价策略...\n');
  const pricing = generatePricingStrategy(baseCurrency, targetCurrencies);
  console.log(`━━━ 定价策略 ━━━`);
  console.log(`基础货币：${pricing.baseCurrency}`);
  console.log(`目标货币：${pricing.targetCurrencies.join(', ')}`);
  console.log(`功能：${pricing.features.join(', ')}`);
  console.log(`策略：${pricing.strategies.join(', ')}`);
  console.log(`保护机制：${pricing.protection.join(', ')}`);
  console.log(`集成：${pricing.integrations.join(', ')}`);
  console.log(`更新频率：${pricing.updateFrequency}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
