/**
 * 跨境自动定价 V1
 * 价格：¥299/月
 */
const SKILL_CONFIG = {
  name: 'cross-border-price-v1',
  version: '1.0.0',
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

async function calculatePrice(basePrice, market, margin) {
  const rate = await getExchangeRate(market);
  const tariff = await getTariffRate(market);
  const competitorPrice = await getCompetitorPrice(market);
  
  return {
    finalPrice: basePrice * rate * (1 + tariff) * (1 + margin),
    competitorPrice,
    recommended: true
  };
}

async function handleCommand(command, args) {
  const sub = await checkSubscription(global.userId);
  if (!sub.active) return { error: '请订阅 (¥' + SKILL_CONFIG.price.monthly + '/月)' };
  
  switch (command) {
    case 'price-auto': return autoPricing(args.market, parseFloat(args.margin));
    case 'price-adjust': return adjustPrice(args.product);
    default: return { error: '未知命令' };
  }
}

module.exports = { SKILL_CONFIG, checkSubscription, handleCommand };
