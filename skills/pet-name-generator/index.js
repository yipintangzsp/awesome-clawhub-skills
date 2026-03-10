#!/usr/bin/env node
/** 宠物名字生成 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/pet-name-generator.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'pet-name-generator', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function pet_name_generator(pet = '狗', style = '可爱') {
  const names = {
    狗：{ 可爱：['豆豆', '球球', '团团', '暖暖', '甜甜'], 帅气：['闪电', '雷霆', '战神', '王者', '旋风'] },
    猫：{ 可爱：['咪咪', '喵喵', '花花', '雪球', '布丁'], 帅气：['黑豹', '闪电', '影子', '夜煞', '雷霆'] },
    兔：{ 可爱：['小白', '雪球', '团团', '软软', '糯糯'], 帅气：['闪电', '飞毛腿', '小白龙'] },
    鸟：{ 可爱：['啾啾', '叽叽', '小黄', '彩彩', '乐乐'], 帅气：['翱翔', '云霄', '凤凰'] }
  };
  const n = names[pet]?.[style] || ['豆豆', '球球', '团团'];
  return { success: true, pet, style, names: n, count: n.length };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：pet-name-generator [选项]
功能：宠物名字生成
价格：¥2/次

选项:
  --help     显示帮助信息
  --pet      宠物 (狗/猫/兔/鸟，默认 狗)
  --style    风格 (可爱/帅气，默认 可爱)

示例:
  pet-name-generator --pet 猫 --style 可爱
`);
    return;
  }
  
  const price = config.price_per_call || 2, userId = process.env.USER || 'unknown';
  const pet = args.find(a => a.startsWith('--pet='))?.split('=')[1] || '狗';
  const style = args.find(a => a.startsWith('--style='))?.split('=')[1] || '可爱';
  
  console.log(`🐾 宠物名字生成\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在生成...\n');
  const result = pet_name_generator(pet, style);
  
  console.log('━━━ 宠物名字 ━━━');
  console.log(`🐾 宠物：${result.pet} | 风格：${result.style}\n`);
  result.names.forEach((n, i) => console.log(`${i + 1}. ${n}`));
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
