#!/usr/bin/env node
/** Fitness Plan - 健身计划生成器 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/fitness-plan.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'fitness-plan', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generatePlan(goal, level, days = 4) {
  const goals = { lose: '减脂', gain: '增肌', maintain: '保持' };
  const levels = { beginner: '初级', intermediate: '中级', advanced: '高级' };
  return { success: true, data: {
    goal: goals[goal] || goal, level: levels[level] || level, days,
    weeklyPlan: [
      { day: 1, focus: '胸肌 + 三头', exercises: ['卧推', '俯卧撑', '臂屈伸'] },
      { day: 2, focus: '背肌 + 二头', exercises: ['引体向上', '划船', '弯举'] },
      { day: 3, focus: '休息', exercises: ['拉伸', '有氧'] },
      { day: 4, focus: '腿部', exercises: ['深蹲', '腿举', '箭步蹲'] }
    ],
    tips: ['每天喝 2L 水', '保证 7-8 小时睡眠', '蛋白质摄入充足']
  }};
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.length === 0) { console.log('用法：fitness-plan <目标> [水平] [天数]\n目标：lose|gain|maintain\n水平：beginner|intermediate|advanced\n示例：fitness-plan lose beginner 4'); return; }
  const goal = args[0], level = args[1] || 'beginner', days = parseInt(args[2]) || 4, price = config.price_per_call || 3, userId = process.env.USER || 'unknown';
  console.log(`💪 Fitness Plan\n🎯 目标：${goal}\n📊 水平：${level}\n💰 费用：¥${price}\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n💪 正在生成计划...');
  const result = generatePlan(goal, level, days);
  console.log(`\n━━━ ${result.data.goal}计划 (${result.data.level}) ━━━`);
  console.log(`每周训练：${result.data.days}天`);
  console.log(`\n📅 训练安排:`);
  result.data.weeklyPlan.forEach(day => {
    console.log(`\n第${day.day}天：${day.focus}`);
    day.exercises.forEach(ex => console.log(`  • ${ex}`));
  });
  console.log(`\n💡 建议:`);
  result.data.tips.forEach(tip => console.log(`  • ${tip}`));
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
