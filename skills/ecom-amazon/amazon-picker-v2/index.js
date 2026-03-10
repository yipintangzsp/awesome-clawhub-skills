/**
 * 亚马逊自动选品 V2
 * 价格：¥374/月
 */
const SKILL_CONFIG = {
  name: 'amazon-picker-v2',
  version: '2.0.0',
  price: { monthly: 374, yearly: 3740 },
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

async function scanProducts(category, minMargin) {
  const products = await fetchAmazonData(category);
  return products.filter(p => p.margin >= minMargin)
    .sort((a, b) => b.sales - a.sales);
}

async function handleCommand(command, args) {
  const sub = await checkSubscription(global.userId);
  if (!sub.active) return { error: '请订阅 (¥' + SKILL_CONFIG.price.monthly + '/月)' };
  
  switch (command) {
    case 'amazon-scan': return scanProducts(args.category, parseFloat(args.minMargin));
    case 'amazon-analyze': return analyzeProduct(args.asin);
    default: return { error: '未知命令' };
  }
}

module.exports = { SKILL_CONFIG, checkSubscription, handleCommand };
