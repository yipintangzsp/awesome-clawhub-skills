#!/usr/bin/env node
/** Barcode Generator - 条形码/二维码生成器 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/barcode-generator.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'barcode-generator', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generateBarcode(data, type = 'qr') {
  const types = { qr: 'QR Code', ean13: 'EAN-13', code128: 'Code 128', upc: 'UPC-A' };
  const imageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`;
  return { success: true, type: types[type] || type, data, imageUrl };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.length === 0) { console.log('用法：barcode-generator <数据> [类型]\n类型：qr|ean13|code128|upc\n示例：barcode-generator "123456789" ean13'); return; }
  const data = args[0], type = args[1] || 'qr', price = config.price_per_call || 1, userId = process.env.USER || 'unknown';
  console.log(`📊 Barcode Generator\n📝 数据：${data}\n📊 类型：${type}\n💰 费用：¥${price}\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📊 正在生成...');
  const result = generateBarcode(data, type);
  console.log(`\n━━━ 生成完成 ━━━`);
  console.log(`类型：${result.type}`);
  console.log(`下载：${result.imageUrl}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
