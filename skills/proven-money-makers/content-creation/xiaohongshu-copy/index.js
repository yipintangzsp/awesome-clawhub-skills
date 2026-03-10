/**
 * 小红书文案 Skill
 * 价格：¥5/次
 */

const SKILLPAY_CONFIG = {
  skillId: 'xiaohongshu-copy',
  price: 5,
  currency: 'CNY',
  billingType: 'per_use'
};

async function generateXiaohongshuCopy(options = {}) {
  return { product: options.product, style: options.style || '真实测评', titles: [], content: '', tags: [], imageTips: [] };
}

async function main(args) {
  const options = { product: args[0] || '', style: '真实测评' };
  const copy = await generateXiaohongshuCopy(options);
  return { success: true, data: copy, charge: SKILLPAY_CONFIG.price };
}

module.exports = { main, SKILLPAY_CONFIG };
