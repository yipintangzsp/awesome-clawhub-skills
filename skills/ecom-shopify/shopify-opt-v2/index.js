/**
 * Shopify 自动优化 V2
 * 价格：¥274/月
 */
const SKILL_CONFIG = {
  name: 'shopify-opt-v2',
  version: '2.0.0',
  price: { monthly: 274, yearly: 2740 },
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

async function auditStore(store) {
  const metrics = await fetchShopifyMetrics(store);
  return {
    speed: metrics.speed,
    seo: metrics.seo,
    conversion: metrics.conversion,
    recommendations: generateRecommendations(metrics)
  };
}

async function handleCommand(command, args) {
  const sub = await checkSubscription(global.userId);
  if (!sub.active) return { error: '请订阅 (¥' + SKILL_CONFIG.price.monthly + '/月)' };
  
  switch (command) {
    case 'shopify-audit': return auditStore(args.store);
    case 'shopify-optimize': return optimizeStore(args.store, args.target);
    default: return { error: '未知命令' };
  }
}

module.exports = { SKILL_CONFIG, checkSubscription, handleCommand };
