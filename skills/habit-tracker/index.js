#!/usr/bin/env node
/** Habit Tracker - 习惯追踪器 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/habit-tracker.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'habit-tracker', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function createHabitPlan(habits) {
  const templates = {
    exercise: { name: '运动', streak: 0, tips: ['从每天 10 分钟开始', '找运动伙伴', '设定固定时间'] },
    reading: { name: '阅读', streak: 0, tips: ['每天读 10 页', '带书随身', '睡前阅读'] },
    water: { name: '喝水', streak: 0, tips: ['用大水杯', '设提醒', '起床先喝水'] },
    sleep: { name: '早睡', streak: 0, tips: ['固定作息', '睡前不用手机', '营造黑暗环境'] }
  };
  return { success: true, habits: habits.map(h => templates[h] || { name: h, streak: 0, tips: ['坚持就是胜利！'] }) };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.length === 0) { console.log('用法：habit-tracker <习惯 1> [习惯 2] [...]\n示例：habit-tracker exercise reading water'); return; }
  const habits = args, price = config.price_per_call || 1, userId = process.env.USER || 'unknown';
  console.log(`✅ Habit Tracker\n📋 习惯：${habits.join(', ')}\n💰 费用：¥${price}\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n✅ 正在生成计划...');
  const result = createHabitPlan(habits);
  console.log(`\n━━━ 习惯追踪计划 ━━━`);
  result.habits.forEach((h, i) => {
    console.log(`\n${i+1}. ${h.name}`);
    console.log(`   连续打卡：${h.streak}天`);
    console.log(`   💡 建议：${h.tips.join(' | ')}`);
  });
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
