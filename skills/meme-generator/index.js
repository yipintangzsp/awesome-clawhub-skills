#!/usr/bin/env node
/** Meme Generator - 表情包生成器 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/meme-generator.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'meme-generator', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generateMeme(template, topText, bottomText) {
  const imageUrl = `https://api.memegen.link/images/${template}/${encodeURIComponent(topText)}/${encodeURIComponent(bottomText)}.png`;
  return { success: true, template, topText, bottomText, imageUrl };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.length < 3) { console.log('用法：meme-generator <模板> "<上方文字>" "<下方文字>"\n模板：drake|distracted|change|success 等'); return; }
  const template = args[0], topText = args[1], bottomText = args[2], price = config.price_per_call || 0.5, userId = process.env.USER || 'unknown';
  console.log(`😂 Meme Generator\n📝 上方：${topText}\n📝 下方：${bottomText}\n💰 费用：¥${price}\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n😂 正在生成...');
  const result = generateMeme(template, topText, bottomText);
  console.log(`\n━━━ 生成完成 ━━━`);
  console.log(`下载：${result.imageUrl}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
