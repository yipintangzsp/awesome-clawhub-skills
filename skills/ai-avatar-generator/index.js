#!/usr/bin/env node
/** AI Avatar Generator - AI 头像生成 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/ai-avatar-generator.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'ai-avatar-generator', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generateAvatar(style, gender) {
  const styles = { cartoon: '卡通', realistic: '写实', anime: '动漫', pixel: '像素' };
  const imageUrl = `https://api.dicebear.com/7.x/${style}/seed/${Date.now()}.svg`;
  return { success: true, style: styles[style] || style, gender, imageUrl };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.length === 0) { console.log('用法：ai-avatar-generator <风格> [性别]\n风格：cartoon|realistic|anime|pixel\n示例：ai-avatar-generator anime female'); return; }
  const style = args[0], gender = args[1] || 'random', price = config.price_per_call || 2, userId = process.env.USER || 'unknown';
  console.log(`🎨 AI Avatar Generator\n🎭 风格：${style}\n💰 费用：¥${price}\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n🎨 正在生成头像...');
  const result = generateAvatar(style, gender);
  console.log(`\n━━━ 头像生成完成 ━━━`);
  console.log(`风格：${result.style}`);
  console.log(`下载：${result.imageUrl}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
