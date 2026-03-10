#!/usr/bin/env node
/** 卡路里计算器 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/calorie-counter-ai.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'calorie-counter-ai', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function calorie_counter_ai(foods = []) {
  const foodDB = {
    '米饭': { cal: 130, unit: '100g' }, '面条': { cal: 110, unit: '100g' },
    '鸡蛋': { cal: 155, unit: '100g' }, '鸡胸肉': { cal: 165, unit: '100g' },
    '牛肉': { cal: 250, unit: '100g' }, '鱼': { cal: 206, unit: '100g' },
    '苹果': { cal: 52, unit: '100g' }, '香蕉': { cal: 89, unit: '100g' },
    '牛奶': { cal: 42, unit: '100ml' }, '面包': { cal: 265, unit: '100g' }
  };
  let total = 0, details = [];
  foods.forEach(f => {
    const info = foodDB[f.name] || { cal: 100, unit: '100g' };
    const cal = Math.round(info.cal * (f.amount || 1));
    total += cal;
    details.push(`${f.name}: ${cal}大卡`);
  });
  return { success: true, total, details, bmr_estimate: Math.round(total * 1.2) };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：calorie-counter-ai [选项]
功能：卡路里计算器
价格：¥2/次

选项:
  --help     显示帮助信息
  --foods    食物列表，格式：名称：数量 (例：米饭:2,鸡蛋:1)

示例:
  calorie-counter-ai --foods 米饭:2,鸡蛋:1,苹果:1
`);
    return;
  }
  
  const price = config.price_per_call || 2, userId = process.env.USER || 'unknown';
  const foodsArg = args.find(a => a.startsWith('--foods='))?.split('=')[1] || '米饭:1';
  const foods = foodsArg.split(',').map(f => { const [name, amount] = f.split(':'); return { name, amount: parseFloat(amount) || 1 }; });
  
  console.log(`🔢 卡路里计算器\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在计算...');
  const result = calorie_counter_ai(foods);
  
  console.log('\n━━━ 计算结果 ━━━');
  result.details.forEach(d => console.log(`  ${d}`));
  console.log(`\n总计：${result.total}大卡`);
  console.log(`每日需求估算：${result.bmr_estimate}大卡`);
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
