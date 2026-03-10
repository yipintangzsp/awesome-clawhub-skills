#!/usr/bin/env node
/** 喝水提醒机器人 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/water-reminder-bot.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'water-reminder-bot', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function water_reminder_bot(weight = 60, activity = 'low') {
  const base = weight * 30; // ml
  const activityMulti = activity === 'high' ? 1.5 : activity === 'medium' ? 1.2 : 1;
  const daily = Math.round(base * activityMulti);
  const glasses = Math.round(daily / 250);
  const schedule = [];
  for (let h = 8; h <= 20; h += 2) {
    schedule.push(`${h}:00 - 喝${Math.round(glasses / 7)}杯水`);
  }
  return { success: true, daily_ml: daily, glasses, schedule };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：water-reminder-bot [选项]
功能：喝水提醒机器人
价格：¥1/次

选项:
  --help      显示帮助信息
  --weight    体重 (kg, 默认 60)
  --activity  活动量 (low/medium/high, 默认 low)

示例:
  water-reminder-bot --weight 70 --activity medium
`);
    return;
  }
  
  const price = config.price_per_call || 1, userId = process.env.USER || 'unknown';
  const weight = parseFloat(args.find(a => a.startsWith('--weight='))?.split('=')[1]) || 60;
  const activity = args.find(a => a.startsWith('--activity='))?.split('=')[1] || 'low';
  
  console.log(`💧 喝水提醒机器人\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在生成计划...');
  const result = water_reminder_bot(weight, activity);
  
  console.log('\n━━━ 喝水计划 ━━━');
  console.log(`📊 每日推荐：${result.daily_ml}ml (${result.glasses}杯)`);
  console.log('\n⏰ 提醒时间:');
  result.schedule.forEach(s => console.log(`  ${s}`));
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
