#!/usr/bin/env node
/** 名字生成专业版 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/name-generator-pro.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'name-generator-pro', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function name_generator_pro(type = '中文', count = 5) {
  const names = {
    中文：['子轩', '梓涵', '宇轩', '欣怡', '梓萱', '浩然', '诗涵', '俊杰'],
    英文：['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Oliver', 'Sophia', 'Elijah'],
    日文：['桜', '翔太', '美咲', '大輔', '結衣', '健太', '愛', '拓也'],
    韩文：['서연', '민수', '지영', '준호', '수진', '현우', '은지', '태양']
  };
  const n = names[type] || names.中文;
  const shuffled = n.sort(() => Math.random() - 0.5);
  return { success: true, type, names: shuffled.slice(0, count), count: Math.min(count, n.length) };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：name-generator-pro [选项]
功能：名字生成专业版
价格：¥2/次

选项:
  --help     显示帮助信息
  --type     类型 (中文/英文/日文/韩文，默认 中文)
  --count    数量 (默认 5)

示例:
  name-generator-pro --type 英文 --count 10
`);
    return;
  }
  
  const price = config.price_per_call || 2, userId = process.env.USER || 'unknown';
  const type = args.find(a => a.startsWith('--type='))?.split('=')[1] || '中文';
  const count = parseInt(args.find(a => a.startsWith('--count='))?.split('=')[1]) || 5;
  
  console.log(`📛 名字生成专业版\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在生成...\n');
  const result = name_generator_pro(type, count);
  
  console.log('━━━ 生成名字 ━━━');
  console.log(`📋 类型：${result.type} | 数量：${result.count}\n`);
  result.names.forEach((n, i) => console.log(`${i + 1}. ${n}`));
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
