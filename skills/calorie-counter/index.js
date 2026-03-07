#!/usr/bin/env node
/** Calorie Counter - 卡路里计算器 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/calorie-counter.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'calorie-counter', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function calculateBMR(weight, height, age, gender) {
  // Mifflin-St Jeor 公式
  const base = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

function calculateTDEE(bmr, activity) {
  const levels = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very: 1.9 };
  return bmr * (levels[activity] || 1.2);
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.length < 4) { console.log('用法：calorie-counter <体重 kg> <身高 cm> <年龄> <性别> [活动水平]\n活动水平：sedentary|light|moderate|active|very\n示例：calorie-counter 70 175 30 male moderate'); return; }
  const weight = parseFloat(args[0]), height = parseFloat(args[1]), age = parseInt(args[2]), gender = args[3], activity = args[4] || 'sedentary';
  const price = config.price_per_call || 1, userId = process.env.USER || 'unknown';
  console.log(`🍎 Calorie Counter\n⚖️ 体重：${weight}kg | 身高：${height}cm\n🎂 年龄：${age} | 性别：${gender}\n💰 费用：¥${price}\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n🍎 正在计算...');
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activity);
  console.log(`\n━━━ 计算结果 ━━━`);
  console.log(`基础代谢 (BMR): ${Math.round(bmr)} 大卡/天`);
  console.log(`每日消耗 (TDEE): ${Math.round(tdee)} 大卡/天`);
  console.log(`\n📊 建议:`);
  console.log(`  减脂：${Math.round(tdee - 500)} 大卡/天`);
  console.log(`  保持：${Math.round(tdee)} 大卡/天`);
  console.log(`  增肌：${Math.round(tdee + 300)} 大卡/天`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
