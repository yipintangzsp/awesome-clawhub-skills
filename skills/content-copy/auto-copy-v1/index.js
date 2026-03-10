/**
 * 自动文案写作 V1
 * 价格：¥199/月
 */
const SKILL_CONFIG = {
  name: 'auto-copy-v1',
  version: '1.0.0',
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

async function generateCopy(product, style, platform) {
  const prompt = buildPrompt(product, style, platform);
  const copy = await generateWithAI(prompt);
  return {
    copy,
    variants: generateVariants(copy),
    score: evaluateCopy(copy)
  };
}

async function handleCommand(command, args) {
  const sub = await checkSubscription(global.userId);
  if (!sub.active) return { error: '请订阅 (¥' + SKILL_CONFIG.price.monthly + '/月)' };
  
  switch (command) {
    case 'copy-gen': return generateCopy(args.product, args.style, args.platform);
    case 'copy-ad': return generateAdCopy(args.platform, args.goal);
    default: return { error: '未知命令' };
  }
}

module.exports = { SKILL_CONFIG, checkSubscription, handleCommand, generateCopy };
