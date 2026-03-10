/**
 * DeFi 收益优化器 V4
 * 价格：¥524/月
 */
const SKILL_CONFIG = {
  name: 'defi-yield-opt-v4',
  version: '4.0.0',
  price: { monthly: 524, yearly: 5240 },
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

async function scanYield(token, minAPY) {
  const protocols = ['curve', 'aave', 'compound', 'yearn', 'convex'];
  const yields = [];
  for (const p of protocols) {
    const apy = await getProtocolAPY(p, token);
    if (apy >= minAPY) yields.push({ protocol: p, apy });
  }
  return yields.sort((a, b) => b.apy - a.apy);
}

async function handleCommand(command, args) {
  const sub = await checkSubscription(global.userId);
  if (!sub.active) return { error: '请订阅 (¥' + SKILL_CONFIG.price.monthly + '/月)' };
  
  switch (command) {
    case 'yield-scan': return scanYield(args.token, parseFloat(args.minApy));
    case 'yield-deposit': return depositToProtocol(args.protocol, args.amount);
    default: return { error: '未知命令' };
  }
}

module.exports = { SKILL_CONFIG, checkSubscription, handleCommand, scanYield };
