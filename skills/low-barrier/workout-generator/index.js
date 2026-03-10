#!/usr/bin/env node
/** 健身计划生成 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/workout-generator.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'workout-generator', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function workout_generator(level = 'beginner', focus = 'full') {
  const workouts = {
    beginner: { full: ['深蹲 15 次', '俯卧撑 10 次', '平板支撑 30 秒', '开合跳 20 次'], rest: '每个动作休息 30 秒，循环 3 组' },
    intermediate: { full: ['深蹲 25 次', '俯卧撑 20 次', '平板支撑 60 秒', '波比跳 15 次'], rest: '每个动作休息 20 秒，循环 4 组' },
    advanced: { full: ['深蹲 50 次', '俯卧撑 40 次', '平板支撑 120 秒', '波比跳 30 次'], rest: '每个动作休息 15 秒，循环 5 组' }
  };
  const w = workouts[level]?.[focus] || workouts.beginner.full;
  return { success: true, level, focus, exercises: w, rest: workouts[level]?.rest || workouts.beginner.rest, duration: level === 'advanced' ? 45 : level === 'intermediate' ? 30 : 20 };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：workout-generator [选项]
功能：健身计划生成
价格：¥3/次

选项:
  --help     显示帮助信息
  --level    水平 (beginner/intermediate/advanced, 默认 beginner)
  --focus    重点 (full/upper/lower/core, 默认 full)

示例:
  workout-generator --level intermediate --focus upper
`);
    return;
  }
  
  const price = config.price_per_call || 3, userId = process.env.USER || 'unknown';
  const level = args.find(a => a.startsWith('--level='))?.split('=')[1] || 'beginner';
  const focus = args.find(a => a.startsWith('--focus='))?.split('=')[1] || 'full';
  
  console.log(`💪 健身计划生成\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在生成计划...\n');
  const result = workout_generator(level, focus);
  
  console.log('━━━ 健身计划 ━━━');
  console.log(`📊 水平：${level} | 重点：${focus}`);
  console.log(`⏱️ 预计时长：${result.duration}分钟`);
  console.log('\n动作:');
  result.exercises.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
  console.log(`\n💡 ${result.rest}`);
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
