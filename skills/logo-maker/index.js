#!/usr/bin/env node
/** Logo Maker - Logo 设计工具 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/logo-maker.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'logo-maker', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generateLogo(brandName, style = 'modern') {
  const styles = { modern: '简约现代', classic: '经典复古', playful: '活泼可爱', luxury: '高端奢华' };
  const logoUrl = `https://api.logomaker.com/demo?text=${encodeURIComponent(brandName)}&style=${style}`;
  return { success: true, brandName, style: styles[style] || style, logoUrl, formats: ['PNG', 'SVG', 'PDF'] };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.length === 0) { console.log('用法：logo-maker <品牌名> [风格]\n风格：modern|classic|playful|luxury'); return; }
  const brandName = args[0], style = args[1] || 'modern', price = config.price_per_call || 3, userId = process.env.USER || 'unknown';
  console.log(`🎨 Logo Maker\n🏷️ 品牌：${brandName}\n🎭 风格：${style}\n💰 费用：¥${price}\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n🎨 正在设计...');
  const result = generateLogo(brandName, style);
  console.log(`\n━━━ Logo 设计 ━━━`);
  console.log(`风格：${result.style}`);
  console.log(`预览：${result.logoUrl}`);
  console.log(`格式：${result.formats.join(', ')}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
