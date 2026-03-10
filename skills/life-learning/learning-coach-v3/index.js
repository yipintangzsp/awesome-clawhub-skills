/**
 * 学习成长教练 V3
 * 价格：¥199/月
 */
const SKILL_CONFIG = {
  name: 'learning-coach-v3',
  version: '3.0.0',
  price: { monthly: 199, yearly: 1990 },
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

async function createLearningPlan(subject, hours) {
  const topics = await getTopicHierarchy(subject);
  const schedule = await optimizeSchedule(topics, hours);
  const resources = await findResources(subject);
  
  return { schedule, resources, milestones: generateMilestones(schedule) };
}

async function handleCommand(command, args) {
  const sub = await checkSubscription(global.userId);
  if (!sub.active) return { error: '请订阅 (¥' + SKILL_CONFIG.price.monthly + '/月)' };
  
  switch (command) {
    case 'learn-plan': return createLearningPlan(args.subject, parseInt(args.hours));
    case 'learn-review': return generateReview(args.topic);
    default: return { error: '未知命令' };
  }
}

module.exports = { SKILL_CONFIG, checkSubscription, handleCommand, createLearningPlan };
