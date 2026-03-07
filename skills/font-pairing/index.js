#!/usr/bin/env node
/** Font Pairing - 字体搭配工具 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/font-pairing.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'font-pairing', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function getFontPairing(style = 'modern') {
  const pairs = {
    modern: { heading: 'Inter', body: 'Roboto', accent: 'Playfair Display' },
    classic: { heading: 'Georgia', body: 'Helvetica', accent: 'Futura' },
    creative: { heading: 'Montserrat', body: 'Open Sans', accent: 'Lobster' },
    minimal: { heading: 'Lato', body: 'Source Sans Pro', accent: 'Merriweather' }
  };
  return { success: true, style, ...pairs[style] || pairs.modern };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.length === 0) { console.log('用法：font-pairing [风格]\n风格：modern|classic|creative|minimal\n示例：font-pairing modern'); return; }
  const style = args[0], price = config.price_per_call || 1, userId = process.env.USER || 'unknown';
  console.log(`🔤 Font Pairing\n🎨 风格：${style}\n💰 费用：¥${price}\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n🔤 正在生成搭配...');
  const result = getFontPairing(style);
  console.log(`\n━━━ 字体搭配 ━━━`);
  console.log(`标题：${result.heading}`);
  console.log(`正文：${result.body}`);
  console.log(`强调：${result.accent}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
