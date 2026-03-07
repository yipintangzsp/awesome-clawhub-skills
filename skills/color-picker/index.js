#!/usr/bin/env node
/** Color Picker - 配色工具 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/color-picker.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'color-picker', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generatePalette(baseColor, scheme = 'complementary') {
  const schemes = {
    complementary: [baseColor, '#'+(+baseColor.replace('#','0x')^0xFFFFFF).toString(16).padStart(6,'0')],
    analogous: [baseColor, '#3498db', '#9b59b6'],
    triadic: [baseColor, '#e74c3c', '#2ecc71'],
    monochromatic: [baseColor, shade(baseColor, 20), tint(baseColor, 20)]
  };
  function shade(c,p){return c;} function tint(c,p){return c;}
  return { success: true, base: baseColor, scheme, colors: schemes[scheme] || schemes.analogous };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.length === 0) { console.log('用法：color-picker <基色> [方案]\n方案：complementary|analogous|triadic|monochromatic\n示例：color-picker #3498db analogous'); return; }
  const baseColor = args[0], scheme = args[1] || 'analogous', price = config.price_per_call || 1, userId = process.env.USER || 'unknown';
  console.log(`🎨 Color Picker\n🌈 基色：${baseColor}\n🎭 方案：${scheme}\n💰 费用：¥${price}\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n🎨 正在生成配色...');
  const result = generatePalette(baseColor, scheme);
  console.log(`\n━━━ 配色方案 ━━━`);
  result.colors.forEach((c, i) => console.log(`  ${i+1}. ${c} ████`));
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
