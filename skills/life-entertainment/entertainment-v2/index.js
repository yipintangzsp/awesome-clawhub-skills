/**
 * 娱乐休闲助手 V2
 * 价格：¥124/月
 */
const SKILL_CONFIG = {
  name: 'entertainment-v2',
  version: '2.0.0',
  price: { monthly: 124, yearly: 1240 },
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

async function recommendEntertainment(type, preferences) {
  switch (type) {
    case 'movie': return recommendMovies(preferences);
    case 'music': return generatePlaylist(preferences);
    case 'travel': return planTrip(preferences);
    case 'activity': return suggestActivities(preferences);
    default: return { error: '未知类型' };
  }
}

async function handleCommand(command, args) {
  const sub = await checkSubscription(global.userId);
  if (!sub.active) return { error: '请订阅 (¥' + SKILL_CONFIG.price.monthly + '/月)' };
  
  switch (command) {
    case 'entertain-movie': return recommendEntertainment('movie', args);
    case 'entertain-travel': return recommendEntertainment('travel', args);
    default: return { error: '未知命令' };
  }
}

module.exports = { SKILL_CONFIG, checkSubscription, handleCommand, recommendEntertainment };
