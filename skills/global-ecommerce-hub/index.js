#!/usr/bin/env node
/** Global Ecommerce Hub - 全球电商中心 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/global-ecommerce-hub.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'global-ecommerce-hub', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generateEcommercePlan(platforms, markets) {
  const platformList = platforms.split(',');
  const marketList = markets.split(',');
  return {
    platforms: platformList,
    markets: marketList,
    features: ['店铺管理', '订单聚合', '库存同步', '物流追踪', '客服工单'],
    currencies: ['USD', 'EUR', 'GBP', 'JPY', 'CNY'],
    integrations: ['Amazon', 'eBay', 'Shopify', 'AliExpress', 'Etsy'],
    analytics: ['销售报表', '利润分析', '库存预警', '市场趋势'],
    automation: ['自动定价', '自动补货', '自动回复', '自动发货']
  };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const platformsArg = args.find(a => a.startsWith('--platforms='));
  const marketsArg = args.find(a => a.startsWith('--markets='));
  if (!platformsArg || !marketsArg) { console.log('用法：global-ecommerce-hub --platforms=<平台列表> --markets=<目标市场>\n示例：global-ecommerce-hub --platforms=amazon,ebay,shopify --markets=US,EU,JP'); return; }
  const platforms = platformsArg.split('=')[1], markets = marketsArg.split('=')[1], price = config.price_per_month || 799, userId = process.env.USER || 'unknown';
  console.log(`🌍 Global Ecommerce Hub\n🛒 平台：${platforms}\n🌐 市场：${markets}\n💰 费用：¥${price}/月\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📋 正在生成电商方案...\n');
  const ecommerce = generateEcommercePlan(platforms, markets);
  console.log(`━━━ 电商方案 ━━━`);
  console.log(`支持平台：${ecommerce.platforms.join(', ')}`);
  console.log(`目标市场：${ecommerce.markets.join(', ')}`);
  console.log(`功能：${ecommerce.features.join(', ')}`);
  console.log(`货币：${ecommerce.currencies.join(', ')}`);
  console.log(`集成：${ecommerce.integrations.join(', ')}`);
  console.log(`分析：${ecommerce.analytics.join(', ')}`);
  console.log(`自动化：${ecommerce.automation.join(', ')}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
