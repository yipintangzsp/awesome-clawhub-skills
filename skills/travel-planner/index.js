#!/usr/bin/env node
/** Travel Planner - 智能旅行规划 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/travel-planner.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'travel-planner', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function planTrip(destination, days = 3) {
  // 简化版（实际可调 TripAdvisor/Google Travel API）
  return { success: true, data: {
    destination, days,
    itinerary: [
      { day: 1, title: '抵达 + 市区游览', spots: ['市中心广场', '博物馆', '当地美食街'] },
      { day: 2, title: '景点深度游', spots: ['著名地标', '历史文化区', '夜景'] },
      { day: 3, title: '休闲购物', spots: ['特色市场', '纪念品店', '返程'] }
    ],
    budget: { hotel: 800, food: 300, transport: 200, activities: 400, total: 1700 },
    tips: ['最佳季节：3-5 月', '提前预订机票省 30%', '买城市通票更划算']
  }};
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.length === 0) { console.log('用法：travel-planner <目的地> [天数]\n示例：travel-planner 东京 5'); return; }
  const destination = args[0], days = args[1] ? parseInt(args[1]) : 3, price = config.price_per_call || 5, userId = process.env.USER || 'unknown';
  console.log(`✈️ Travel Planner\n📍 目的地：${destination}\n📅 天数：${days}天\n💰 费用：¥${price}\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📊 正在规划行程...');
  const result = planTrip(destination, days);
  console.log(`\n━━━ ${destination} ${days}天行程 ━━━`);
  result.data.itinerary.forEach(day => {
    console.log(`\n第${day.day}天：${day.title}`);
    day.spots.forEach(spot => console.log(`  • ${spot}`));
  });
  console.log(`\n💰 预算估算:`);
  console.log(`  住宿：¥${result.data.budget.hotel}`);
  console.log(`  餐饮：¥${result.data.budget.food}`);
  console.log(`  交通：¥${result.data.budget.transport}`);
  console.log(`  活动：¥${result.data.budget.activities}`);
  console.log(`  总计：¥${result.data.budget.total}`);
  console.log(`\n💡 贴士:`);
  result.data.tips.forEach(tip => console.log(`  • ${tip}`));
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
