#!/usr/bin/env node
/** 习惯打卡追踪 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/habit-streak-tracker.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'habit-streak-tracker', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function habit_streak_tracker(habit = '早起', streak = 7) {
  const levels = [
    { min: 1, title: '🌱 新手', msg: '刚开始，继续加油！' },
    { min: 7, title: '🌿 入门', msg: '一周坚持，很棒！' },
    { min: 21, title: '🌳 养成', msg: '21 天习惯养成！' },
    { min: 66, title: '🏆 大师', msg: '66 天自动化习惯！' },
    { min: 100, title: '👑 传奇', msg: '百日传奇！' }
  ];
  const level = levels.slice().reverse().find(l => streak >= l.min) || levels[0];
  return { success: true, habit, streak, ...level, nextMilestone: levels.find(l => l.min > streak)?.min || '已完成所有目标' };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：habit-streak-tracker [选项]
功能：习惯打卡追踪
价格：¥1/次

选项:
  --help     显示帮助信息
  --habit    习惯名称 (默认 早起)
  --streak   连续天数 (默认 7)

示例:
  habit-streak-tracker --habit 运动 --streak 30
`);
    return;
  }
  
  const price = config.price_per_call || 1, userId = process.env.USER || 'unknown';
  const habit = args.find(a => a.startsWith('--habit='))?.split('=')[1] || '早起';
  const streak = parseInt(args.find(a => a.startsWith('--streak='))?.split('=')[1]) || 7;
  
  console.log(`✅ 习惯打卡追踪\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在追踪...');
  const result = habit_streak_tracker(habit, streak);
  
  console.log('\n━━━ 打卡进度 ━━━');
  console.log(`📌 习惯：${result.habit}`);
  console.log(`🔥 连续：${result.streak}天`);
  console.log(`🏅 等级：${result.title}`);
  console.log(`💪 ${result.msg}`);
  console.log(`🎯 下一目标：${result.nextMilestone}天`);
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
