/**
 * 空投自动检测 V5
 * 价格：¥299/月
 */
const SKILL_CONFIG = {
  name: 'airdrop-detector-v5',
  version: '5.0.0',
  price: { monthly: 299, yearly: 2990 },
  currency: 'CNY'
};

const AIRDROP_PROJECTS = [
  'layerzero', 'zksync', 'starknet', 'optimism', 'arbitrum',
  'polygon', 'avalanche', 'fantom', 'cosmos', 'near'
];

async function checkSubscription(userId) {
  const res = await fetch('https://api.skillpay.com/subscription/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skill_id: SKILL_CONFIG.name, user_id: userId })
  });
  return res.json();
}

async function scanAirdrops(wallet) {
  const eligible = [];
  for (const project of AIRDROP_PROJECTS) {
    const status = await checkEligibility(wallet, project);
    if (status.eligible) eligible.push({ project, ...status });
  }
  return eligible;
}

async function handleCommand(command, args) {
  const sub = await checkSubscription(global.userId);
  if (!sub.active) return { error: '请订阅 (¥' + SKILL_CONFIG.price.monthly + '/月)' };
  
  switch (command) {
    case 'airdrop-scan': return scanAirdrops(args.wallet);
    case 'airdrop-track': return trackProject(args.project);
    default: return { error: '未知命令' };
  }
}

module.exports = { SKILL_CONFIG, checkSubscription, handleCommand, scanAirdrops };
