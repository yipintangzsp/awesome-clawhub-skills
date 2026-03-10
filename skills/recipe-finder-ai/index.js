#!/usr/bin/env node
/** 食谱查找 AI **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/recipe-finder-ai.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'recipe-finder-ai', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function recipe_finder_ai(ingredient = '鸡蛋', difficulty = 'easy') {
  const recipes = {
    鸡蛋：[
      { name: '番茄炒蛋', time: '10 分钟', difficulty: 'easy' },
      { name: '蛋炒饭', time: '15 分钟', difficulty: 'easy' },
      { name: '蒸蛋羹', time: '20 分钟', difficulty: 'easy' }
    ],
    鸡肉：[
      { name: '宫保鸡丁', time: '30 分钟', difficulty: 'medium' },
      { name: '可乐鸡翅', time: '40 分钟', difficulty: 'easy' },
      { name: '黄焖鸡', time: '50 分钟', difficulty: 'medium' }
    ]
  };
  const r = recipes[ingredient] || recipes.鸡蛋;
  const filtered = difficulty === 'easy' ? r.filter(x => x.difficulty === 'easy') : r;
  return { success: true, ingredient, difficulty, recipes: filtered, count: filtered.length };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：recipe-finder-ai [选项]
功能：食谱查找 AI
价格：¥3/次

选项:
  --help       显示帮助信息
  --ingredient 主要食材
  --difficulty 难度 (easy/medium/hard, 默认 easy)

示例:
  recipe-finder-ai --ingredient 鸡肉 --difficulty medium
`);
    return;
  }
  
  const price = config.price_per_call || 3, userId = process.env.USER || 'unknown';
  const ingredient = args.find(a => a.startsWith('--ingredient='))?.split('=')[1] || '鸡蛋';
  const difficulty = args.find(a => a.startsWith('--difficulty='))?.split('=')[1] || 'easy';
  
  console.log(`🍳 食谱查找 AI\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在查找...\n');
  const result = recipe_finder_ai(ingredient, difficulty);
  
  console.log('━━━ 推荐食谱 ━━━');
  console.log(`🥚 食材：${result.ingredient} | 难度：${result.difficulty}\n`);
  result.recipes.forEach((r, i) => console.log(`${i + 1}. ${r.name} (${r.time})`));
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
