/**
 * 爆款标题生成 V4
 * 价格：¥249/月
 */
const SKILL_CONFIG = {
  name: 'viral-title-v4',
  version: '4.0.0',
  price: { monthly: 249, yearly: 2490 },
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

async function generateTitles(topic, platform, count = 10) {
  const templates = getTitleTemplates(platform);
  const titles = [];
  for (let i = 0; i < count; i++) {
    titles.push({
      title: applyTemplate(templates[i % templates.length], topic),
      ctr: predictCTR(topic, platform)
    });
  }
  return titles.sort((a, b) => b.ctr - a.ctr);
}

async function handleCommand(command, args) {
  const sub = await checkSubscription(global.userId);
  if (!sub.active) return { error: '请订阅 (¥' + SKILL_CONFIG.price.monthly + '/月)' };
  
  switch (command) {
    case 'title-gen': return generateTitles(args.topic, args.platform);
    case 'title-ab-test': return abTestTitles(args.title1, args.title2);
    default: return { error: '未知命令' };
  }
}

module.exports = { SKILL_CONFIG, checkSubscription, handleCommand, generateTitles };
