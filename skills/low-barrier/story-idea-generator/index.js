#!/usr/bin/env node
/** 故事创意生成 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/story-idea-generator.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'story-idea-generator', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function story_idea_generator(genre = '日常') {
  const ideas = {
    日常：['第一次尝试的经历', '意外发现的美好', '从失败到成功', '普通人的不平凡一天'],
    励志：['逆袭故事', '坚持的力量', '突破舒适圈', '梦想成真记'],
    情感：['错过的遗憾', '重逢的感动', '陌生人的温暖', '成长的代价'],
    悬疑：['神秘来电', '消失的物品', '意外的真相', '双重身份']
  };
  const g = ideas[genre] || ideas.日常;
  const hooks = ['你绝对想不到...', '事情是这样的...', '那天我...', '说出来你可能不信...'];
  return { success: true, genre, ideas: g, hooks, count: g.length };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：story-idea-generator [选项]
功能：故事创意生成
价格：¥2/次

选项:
  --help     显示帮助信息
  --genre    类型 (日常/励志/情感/悬疑，默认 日常)

示例:
  story-idea-generator --genre 励志
`);
    return;
  }
  
  const price = config.price_per_call || 2, userId = process.env.USER || 'unknown';
  const genre = args.find(a => a.startsWith('--genre='))?.split('=')[1] || '日常';
  
  console.log(`📖 故事创意生成\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在生成...\n');
  const result = story_idea_generator(genre);
  
  console.log('━━━ 故事创意 ━━━');
  console.log(`📚 类型：${result.genre} | 数量：${result.count}个\n`);
  console.log('💡 创意:');
  result.ideas.forEach((i, idx) => console.log(`  ${idx + 1}. ${i}`));
  console.log('\n🎣 开头钩子:');
  result.hooks.forEach(h => console.log(`  • ${h}`));
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
