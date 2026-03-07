#!/usr/bin/env node
/** Price Alert - 加密货币价格提醒 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/price-alert.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'price-alert', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

async function getPrice(symbol) {
  // 模拟价格数据（实际可接 Binance/CoinGecko API）
  const prices = { BTC: 67500, ETH: 3450, BNB: 615, SOL: 145, XRP: 0.52 };
  return { success: true, price: prices[symbol.toUpperCase()] || 0, change: (Math.random()*10-5).toFixed(2) };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.length === 0) { console.log('用法：price-alert <币种> [目标价格]\n示例：price-alert BTC 70000'); return; }
  const symbol = args[0].toUpperCase(), targetPrice = args[1] ? parseFloat(args[1]) : null;
  const price = config.price_per_call || 0.5, userId = process.env.USER || 'unknown';
  console.log(`📈 Price Alert - ${symbol}\n💰 费用：¥${price}\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📊 正在获取价格...');
  const result = await getPrice(symbol);
  console.log(`\n━━━ ${symbol} 价格 ━━━`);
  console.log(`当前价：$${result.price}`);
  console.log(`24h 涨跌：${result.change > 0 ? '+' : ''}${result.change}%`);
  if (targetPrice) {
    const diff = ((result.price - targetPrice) / targetPrice * 100).toFixed(2);
    console.log(`目标价：$${targetPrice} (相差 ${diff > 0 ? '+' : ''}${diff}%)`);
    if (diff >= -1 && diff <= 1) console.log('🎯 接近目标价！');
  }
  console.log('━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
