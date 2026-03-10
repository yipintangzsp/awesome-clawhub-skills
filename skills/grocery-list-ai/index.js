#!/usr/bin/env node
/** 购物清单 AI **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/grocery-list-ai.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'grocery-list-ai', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function grocery_list_ai(meals = 3, people = 2) {
  const categories = {
    蔬菜：['青菜', '西红柿', '胡萝卜'],
    水果：['苹果', '香蕉', '橙子'],
    肉类：['鸡肉', '猪肉', '牛肉'],
    调料：['盐', '酱油', '醋'],
    主食：['大米', '面条', '面包']
  };
  const list = Object.entries(categories).map(([cat, items]) => ({ category: cat, items: items.slice(0, meals) }));
  return { success: true, meals, people, list, estimatedCost: meals * people * 30 };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：grocery-list-ai [选项]
功能：购物清单 AI
价格：¥2/次

选项:
  --help     显示帮助信息
  --meals    餐数 (默认 3)
  --people   人数 (默认 2)

示例:
  grocery-list-ai --meals 5 --people 4
`);
    return;
  }
  
  const price = config.price_per_call || 2, userId = process.env.USER || 'unknown';
  const meals = parseInt(args.find(a => a.startsWith('--meals='))?.split('=')[1]) || 3;
  const people = parseInt(args.find(a => a.startsWith('--people='))?.split('=')[1]) || 2;
  
  console.log(`🛒 购物清单 AI\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在生成...\n');
  const result = grocery_list_ai(meals, people);
  
  console.log('━━━ 购物清单 ━━━');
  console.log(`👨‍👩‍👧‍👦 人数：${result.people} | 餐数：${result.meals}`);
  console.log(`💰 预估花费：¥${result.estimatedCost}\n`);
  result.list.forEach(c => {
    console.log(`${c.category}:`);
    c.items.forEach(i => console.log(`  • ${i}`));
  });
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
