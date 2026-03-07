#!/usr/bin/env node
/** Testimonial Generator - 客户评价生成器 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/testimonial-generator.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'testimonial-generator', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generateTestimonial(product, tone = 'positive') {
  const templates = {
    positive: [
      `使用${product}后，我的工作效率提升了 50%！强烈推荐！`,
      `${product}真的超出了我的预期，客服也很棒！`,
      `这是我用过最好的${product}，物超所值！`
    ],
    neutral: [
      `${product}整体不错，还有一些改进空间。`,
      `性价比可以的${product}，值得尝试。`
    ]
  };
  const texts = templates[tone] || templates.positive;
  const text = texts[Math.floor(Math.random() * texts.length)];
  const names = ['张先生', '李女士', '王总', '陈经理', '刘小姐'];
  return { success: true, product, tone, text, author: names[Math.floor(Math.random() * names.length)], rating: tone === 'positive' ? 5 : 4 };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.length === 0) { console.log('用法：testimonial-generator <产品名> [语气]\n语气：positive|neutral'); return; }
  const product = args[0], tone = args[1] || 'positive', price = config.price_per_call || 1, userId = process.env.USER || 'unknown';
  console.log(`💬 Testimonial Generator\n📦 产品：${product}\n💰 费用：¥${price}\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n💬 正在生成...');
  const result = generateTestimonial(product, tone);
  console.log(`\n━━━ 客户评价 ━━━`);
  console.log(`${'⭐'.repeat(result.rating)} ${result.author}`);
  console.log(`"${result.text}"`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
