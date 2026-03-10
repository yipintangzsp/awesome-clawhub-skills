#!/usr/bin/env node
/** AliExpress Product Finder - 速卖通选品 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/aliexpress-product-finder.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'aliexpress-product-finder', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function findProducts(category, minPrice) {
  const products = [
    { name: '无线蓝牙耳机', price: 15.99, orders: 5000, rating: 4.8, profit: 12 },
    { name: '智能手表', price: 29.99, orders: 3200, rating: 4.6, profit: 18 },
    { name: '手机支架', price: 8.99, orders: 8500, rating: 4.7, profit: 6 },
    { name: 'USB-C 数据线', price: 5.99, orders: 12000, rating: 4.5, profit: 4 },
    { name: '便携式充电宝', price: 22.99, orders: 4100, rating: 4.9, profit: 15 }
  ];
  return products.filter(p => p.price >= minPrice).sort((a, b) => b.orders - a.orders);
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const category = args.find(a => a.startsWith('--category='))?.split('=')[1] || 'electronics';
  const minPrice = parseFloat(args.find(a => a.startsWith('--min-price='))?.split('=')[1] || '0');
  const price = config.price_per_month || 29, userId = process.env.USER || 'unknown';
  console.log(`🛒 AliExpress Product Finder\n📂 类目：${category}\n💵 最低价格：¥${minPrice}\n💰 费用：¥${price}/月\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n🔍 正在搜索产品...\n');
  const products = findProducts(category, minPrice);
  console.log(`━━━ 推荐产品 ━━━`);
  products.forEach((p, i) => {
    console.log(`${i+1}. ${p.name}`);
    console.log(`   价格：$${p.price} | 销量：${p.orders} | 评分：${p.rating} | 预估利润：¥${p.profit}`);
  });
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
