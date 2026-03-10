#!/usr/bin/env node
/** 饮食计划 AI **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/meal-planner-ai.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'meal-planner-ai', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function meal_planner_ai(goal = 'balance', meals = 3) {
  const plans = {
    balance: { breakfast: '燕麦粥 + 鸡蛋 + 水果', lunch: '糙米饭 + 鸡胸肉 + 蔬菜', dinner: '鱼肉 + 沙拉 + 红薯' },
    lose: { breakfast: '全麦面包 + 蛋白 + 黑咖啡', lunch: '藜麦沙拉 + 虾仁', dinner: '蔬菜汤 + 豆腐' },
    gain: { breakfast: '牛奶 + 香蕉 + 坚果 + 全麦面包', lunch: '牛肉饭 + 鸡蛋 + 牛油果', dinner: '三文鱼 + 意面 + 蔬菜' }
  };
  const p = plans[goal] || plans.balance;
  const snacks = meals > 3 ? ['上午：酸奶', '下午：坚果'] : [];
  return { success: true, goal, meals: { ...p }, snacks, calories: goal === 'lose' ? 1500 : goal === 'gain' ? 2500 : 2000 };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：meal-planner-ai [选项]
功能：饮食计划 AI
价格：¥3/次

选项:
  --help     显示帮助信息
  --goal     目标 (balance/lose/gain, 默认 balance)
  --meals    餐数 (3-5, 默认 3)

示例:
  meal-planner-ai --goal lose --meals 4
`);
    return;
  }
  
  const price = config.price_per_call || 3, userId = process.env.USER || 'unknown';
  const goal = args.find(a => a.startsWith('--goal='))?.split('=')[1] || 'balance';
  const meals = parseInt(args.find(a => a.startsWith('--meals='))?.split('=')[1]) || 3;
  
  console.log(`🍽️ 饮食计划 AI\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在生成计划...\n');
  const result = meal_planner_ai(goal, meals);
  
  console.log('━━━ 饮食计划 ━━━');
  console.log(`🎯 目标：${goal} | 热量：${result.calories}大卡/天`);
  console.log(`\n🌅 早餐：${result.meals.breakfast}`);
  console.log(`☀️ 午餐：${result.meals.lunch}`);
  console.log(`🌙 晚餐：${result.meals.dinner}`);
  if (result.snacks.length) {
    console.log('\n🍿 加餐:');
    result.snacks.forEach(s => console.log(`  ${s}`));
  }
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
