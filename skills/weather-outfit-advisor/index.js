#!/usr/bin/env node
/** 天气穿搭建议 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/weather-outfit-advisor.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'weather-outfit-advisor', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function weather_outfit_advisor(temp = 25, condition = '晴') {
  const outfits = {
    hot: { temp: '>28', outfit: '短袖 T 恤 + 短裤/短裙 + 凉鞋', tips: '注意防晒，带遮阳帽' },
    warm: { temp: '20-28', outfit: '薄长袖 + 牛仔裤/休闲裤 + 运动鞋', tips: '舒适透气为主' },
    cool: { temp: '15-20', outfit: '卫衣/针织衫 + 长裤 + 外套', tips: '早晚温差大，带外套' },
    cold: { temp: '<15', outfit: '毛衣 + 厚外套 + 长裤 + 靴子', tips: '注意保暖，可加围巾' }
  };
  let category = temp > 28 ? 'hot' : temp >= 20 ? 'warm' : temp >= 15 ? 'cool' : 'cold';
  return { success: true, temperature: temp, condition, ...outfits[category] };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：weather-outfit-advisor [选项]
功能：天气穿搭建议
价格：¥2/次

选项:
  --help     显示帮助信息
  --temp     温度 (默认 25)
  --condition 天气状况 (默认 晴)

示例:
  weather-outfit-advisor --temp 20 --condition 多云
`);
    return;
  }
  
  const price = config.price_per_call || 2, userId = process.env.USER || 'unknown';
  const temp = parseInt(args.find(a => a.startsWith('--temp='))?.split('=')[1]) || 25;
  const condition = args.find(a => a.startsWith('--condition='))?.split('=')[1] || '晴';
  
  console.log(`👔 天气穿搭建议\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在分析天气...');
  const result = weather_outfit_advisor(temp, condition);
  
  console.log('\n━━━ 穿搭建议 ━━━');
  console.log(`🌡️ 温度：${result.temperature}°C | ${result.condition}`);
  console.log(`👕 推荐：${result.outfit}`);
  console.log(`💡 提示：${result.tips}`);
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
