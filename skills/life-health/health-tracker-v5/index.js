/**
 * 健康管理助手 V5
 * 价格：¥299/月
 */
const SKILL_CONFIG = {
  name: 'health-tracker-v5',
  version: '5.0.0',
  price: { monthly: 299, yearly: 2990 },
  currency: 'CNY'
};

async function checkSubscription(userId) {
  const res = await fetch('https://api.skillpay.com/subscription/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skill_id: SKILL_CONFIG.name, user_id: userId })
  });
  return res.json();
}

async function trackHealth(type, data) {
  switch (type) {
    case 'meal': return logMeal(data);
    case 'exercise': return logExercise(data);
    case 'sleep': return logSleep(data);
    case 'weight': return logWeight(data);
    default: return { error: '未知类型' };
  }
}

async function handleCommand(command, args) {
  const sub = await checkSubscription(global.userId);
  if (!sub.active) return { error: '请订阅 (¥' + SKILL_CONFIG.price.monthly + '/月)' };
  
  switch (command) {
    case 'health-log': return trackHealth(args.type, args.data);
    case 'health-plan': return generatePlan(args.goal, parseInt(args.days));
    default: return { error: '未知命令' };
  }
}

module.exports = { SKILL_CONFIG, checkSubscription, handleCommand, trackHealth };
