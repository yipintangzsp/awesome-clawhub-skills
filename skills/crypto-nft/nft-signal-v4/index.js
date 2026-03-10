/**
 * NFT 交易信号 V4
 * 价格：¥349/月
 */
const SKILL_CONFIG = {
  name: 'nft-signal-v4',
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

async function analyzeNFT(collection) {
  const data = await fetchNFTData(collection);
  return {
    floorPrice: data.floor,
    volume24h: data.volume,
    trend: data.trend,
    signal: generateSignal(data)
  };
}

function generateSignal(data) {
  if (data.trend === 'up' && data.volume > data.avg) return 'BUY';
  if (data.trend === 'down') return 'SELL';
  return 'HOLD';
}

async function handleCommand(command, args) {
  const sub = await checkSubscription(global.userId);
  if (!sub.active) return { error: '请订阅 (¥' + SKILL_CONFIG.price.monthly + '/月)' };
  
  switch (command) {
    case 'nft-scan': return analyzeNFT(args.collection);
    case 'nft-signal': return generateSignal(await fetchNFTData(args.collection));
    default: return { error: '未知命令' };
  }
}

module.exports = { SKILL_CONFIG, checkSubscription, handleCommand };
