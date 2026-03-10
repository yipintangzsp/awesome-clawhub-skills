/**
 * 财务管理助手 V4
 * 价格：¥349/月
 */
const SKILL_CONFIG = {
  name: 'finance-manager-v4',
  version: '4.0.0',
  price: { monthly: 349, yearly: 3490 },
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

async function manageFinance(type, data) {
  switch (type) {
    case 'expense': return logExpense(data);
    case 'income': return logIncome(data);
    case 'budget': return setBudget(data);
    case 'analysis': return analyzeFinances(data);
    default: return { error: '未知类型' };
  }
}

async function handleCommand(command, args) {
  const sub = await checkSubscription(global.userId);
  if (!sub.active) return { error: '请订阅 (¥' + SKILL_CONFIG.price.monthly + '/月)' };
  
  switch (command) {
    case 'finance-log': return manageFinance(args.type, args.data);
    case 'finance-budget': return manageFinance('budget', args);
    default: return { error: '未知命令' };
  }
}

module.exports = { SKILL_CONFIG, checkSubscription, handleCommand, manageFinance };
