/**
 * 链上套利机器人 V2
 * 价格：¥249/月
 */
const SKILL_CONFIG = {
  name: 'chain-arb-bot-v2',
  version: '2.0.0',
  price: { monthly: 249, yearly: 2490 },
  currency: 'CNY'
};

async function checkSubscription(userId) {
  const response = await fetch('https://api.skillpay.com/subscription/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skill_id: SKILL_CONFIG.name, user_id: userId })
  });
  return response.json();
}

async function handleCommand(command, args) {
  const sub = await checkSubscription(global.userId);
  if (!sub.active) return { error: '请订阅 (¥' + SKILL_CONFIG.price.monthly + '/月)' };
  
  switch (command) {
    case 'arb-monitor': return monitorDEX(args.token, args.dex);
    case 'arb-execute': return executeArb(args.buy, args.sell, args.amount);
    default: return { error: '未知命令' };
  }
}

module.exports = { SKILL_CONFIG, checkSubscription, handleCommand };
