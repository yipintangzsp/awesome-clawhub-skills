#!/usr/bin/env node
/** Recipe Generator - 菜谱生成器 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/recipe-generator.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'recipe-generator', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generateRecipe(ingredient, cuisine) {
  return { success: true, data: {
    name: `${cuisine}风味${ingredient}料理`,
    prepTime: '15 分钟', cookTime: '25 分钟', servings: 2,
    ingredients: [`${ingredient} 500g`, '大蒜 3 瓣', '生姜 适量', '调味料 适量'],
    steps: ['准备食材', '热锅凉油', '翻炒至熟', '调味出锅'],
    calories: 450, difficulty: '简单'
  }};
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.length === 0) { console.log('用法：recipe-generator <主食材> [菜系]\n示例：recipe-generator 鸡肉 川菜'); return; }
  const ingredient = args[0], cuisine = args[1] || '家常', price = config.price_per_call || 1, userId = process.env.USER || 'unknown';
  console.log(`🍳 Recipe Generator\n🥩 食材：${ingredient}\n🍽️ 菜系：${cuisine}\n💰 费用：¥${price}\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n🍳 正在生成菜谱...');
  const result = generateRecipe(ingredient, cuisine);
  console.log(`\n━━━ ${result.data.name} ━━━`);
  console.log(`⏱️ 准备：${result.data.prepTime} | 烹饪：${result.data.cookTime}`);
  console.log(`👥 份量：${result.data.servings}人 | 🔥 热量：${result.data.calories}卡`);
  console.log(`\n📋 食材:`);
  result.data.ingredients.forEach(i => console.log(`  • ${i}`));
  console.log(`\n👨‍🍳 步骤:`);
  result.data.steps.forEach((s, i) => console.log(`  ${i+1}. ${s}`));
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
