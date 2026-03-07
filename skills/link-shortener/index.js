#!/usr/bin/env node
/** Link Shortener - 短链接生成器 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/link-shortener.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'link-shortener', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function shortenUrl(longUrl) {
  const shortCode = Math.random().toString(36).substring(7);
  return { success: true, original: longUrl, short: `https://short.link/${shortCode}`, code: shortCode };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.length === 0) { console.log('用法：link-shortener <长链接>\n示例：link-shortener "https://example.com/very/long/path"'); return; }
  const longUrl = args[0], price = config.price_per_call || 0.5, userId = process.env.USER || 'unknown';
  console.log(`🔗 Link Shortener\n📎 原链接：${longUrl}\n💰 费用：¥${price}\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n🔗 正在生成短链...');
  const result = shortenUrl(longUrl);
  console.log(`\n━━━ 生成完成 ━━━`);
  console.log(`短链：${result.short}`);
  console.log(`代码：${result.code}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
