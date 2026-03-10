#!/usr/bin/env node
/** 密码生成专业版 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/password-generator-pro.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'password-generator-pro', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function password_generator_pro(length = 16, includeSpecial = true) {
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const num = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  let chars = lower + upper + num;
  if (includeSpecial) chars += special;
  let pwd = '';
  for (let i = 0; i < length; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  const strength = length >= 16 && includeSpecial ? '强' : length >= 12 ? '中' : '弱';
  return { success: true, password: pwd, length, strength, tips: '定期更换密码 | 不要重复使用' };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：password-generator-pro [选项]
功能：密码生成专业版
价格：¥2/次

选项:
  --help          显示帮助信息
  --length        长度 (默认 16)
  --special       包含特殊字符 (true/false, 默认 true)

示例:
  password-generator-pro --length 20 --special true
`);
    return;
  }
  
  const price = config.price_per_call || 2, userId = process.env.USER || 'unknown';
  const length = parseInt(args.find(a => a.startsWith('--length='))?.split('=')[1]) || 16;
  const includeSpecial = args.find(a => a.startsWith('--special='))?.split('=')[1] !== 'false';
  
  console.log(`🔐 密码生成专业版\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在生成...\n');
  const result = password_generator_pro(length, includeSpecial);
  
  console.log('━━━ 生成密码 ━━━');
  console.log(`🔑 ${result.password}`);
  console.log(`\n长度：${result.length}位`);
  console.log(`强度：${result.strength}`);
  console.log(`\n💡 ${result.tips}`);
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
