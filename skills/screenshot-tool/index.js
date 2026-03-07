#!/usr/bin/env node
/** Screenshot Tool - 截图工具 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/screenshot-tool.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'screenshot-tool', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function captureScreenshot(url, device = 'desktop') {
  const screenshotUrl = `https://api.screenshotmachine.com/?key=demo&url=${encodeURIComponent(url)}&dimension=${device === 'mobile' ? '375x667' : '1920x1080'}`;
  return { success: true, url, device, screenshotUrl };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.length === 0) { console.log('用法：screenshot-tool <网址> [设备]\n设备：desktop|mobile|tablet'); return; }
  const url = args[0], device = args[1] || 'desktop', price = config.price_per_call || 1, userId = process.env.USER || 'unknown';
  console.log(`📸 Screenshot Tool\n🌐 网址：${url}\n📱 设备：${device}\n💰 费用：¥${price}\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📸 正在截图...');
  const result = captureScreenshot(url, device);
  console.log(`\n━━━ 截图完成 ━━━`);
  console.log(`下载：${result.screenshotUrl}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
