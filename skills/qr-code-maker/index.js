#!/usr/bin/env node
/** 二维码制作 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/qr-code-maker.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'qr-code-maker', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function qr_code_maker(content = 'https://example.com', size = 'medium') {
  const sizes = { small: 200, medium: 300, large: 400 };
  const s = sizes[size] || sizes.medium;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${s}x${s}&data=${encodeURIComponent(content)}`;
  return { success: true, content, size: s, qrUrl, format: 'PNG' };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：qr-code-maker [选项]
功能：二维码制作
价格：¥2/次

选项:
  --help     显示帮助信息
  --content  内容/链接
  --size     尺寸 (small/medium/large, 默认 medium)

示例:
  qr-code-maker --content "https://example.com" --size large
`);
    return;
  }
  
  const price = config.price_per_call || 2, userId = process.env.USER || 'unknown';
  const content = args.find(a => a.startsWith('--content='))?.split('=')[1] || 'https://example.com';
  const size = args.find(a => a.startsWith('--size='))?.split('=')[1] || 'medium';
  
  console.log(`📱 二维码制作\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在生成...\n');
  const result = qr_code_maker(content, size);
  
  console.log('━━━ 二维码信息 ━━━');
  console.log(`📝 内容：${result.content}`);
  console.log(`📏 尺寸：${result.size}x${result.size}px`);
  console.log(`📄 格式：${result.format}`);
  console.log(`\n🔗 下载链接:`);
  console.log(result.qrUrl);
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
