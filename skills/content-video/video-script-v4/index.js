/**
 * 视频脚本生成 V4
 * 价格：¥349/月
 */
const SKILL_CONFIG = {
  name: 'video-script-v4',
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

async function generateScript(topic, duration, platform) {
  const structure = getScriptStructure(platform, duration);
  const script = await generateWithAI({ topic, structure });
  return {
    script,
    scenes: divideIntoScenes(script),
    tags: generateTags(topic, platform)
  };
}

async function handleCommand(command, args) {
  const sub = await checkSubscription(global.userId);
  if (!sub.active) return { error: '请订阅 (¥' + SKILL_CONFIG.price.monthly + '/月)' };
  
  switch (command) {
    case 'script-gen': return generateScript(args.topic, parseInt(args.duration), args.platform);
    case 'script-optimize': return optimizeScript(args.script, args.platform);
    default: return { error: '未知命令' };
  }
}

module.exports = { SKILL_CONFIG, checkSubscription, handleCommand, generateScript };
