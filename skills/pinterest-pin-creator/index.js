#!/usr/bin/env node
/** Pinterest Pin Creator - Pinterest 图片生成 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/pinterest-pin-creator.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'pinterest-pin-creator', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function createPin(niche, keywords) {
  const keywordList = keywords.split(/[,,]/).map(k => k.trim());
  const pinIdeas = [
    { title: `${niche} Ideas You Need to See`, description: `Discover the best ${niche} inspiration. ${keywordList.join(', ')} styles for your home.`, colors: ['#E8D5B5', '#8B7355', '#F5F5DC'] },
    { title: `10 ${niche} Trends for 2026`, description: `Stay ahead with these ${niche} trends. Perfect for ${keywordList.join(' and ')} lovers.`, colors: ['#D4A574', '#6B4423', '#FFF8DC'] },
    { title: `Ultimate ${niche} Guide`, description: `Everything you need to know about ${niche}. Tips for ${keywordList.join(', ')} designs.`, colors: ['#C9B896', '#5C4033', '#FAF0E6'] }
  ];
  const specs = { width: 1000, height: 1500, format: 'PNG', fontSize: '48px bold' };
  return { pinIdeas, specs, bestTimeToPost: '晚上 7-9 点' };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const nicheArg = args.find(a => a.startsWith('--niche='));
  const keywordsArg = args.find(a => a.startsWith('--keywords='))?.split('=')[1] || 'trending, popular';
  if (!nicheArg) { console.log('用法：pinterest-pin-creator --niche=<领域> [--keywords="关键词 1，关键词 2"]\n示例：pinterest-pin-creator --niche="home-decor" --keywords="modern, minimalist"'); return; }
  const niche = nicheArg.split('=')[1], keywords = keywordsArg.replace(/"/g, ''), price = config.price_per_month || 19, userId = process.env.USER || 'unknown';
  console.log(`📌 Pinterest Pin Creator\n🎨 领域：${niche}\n🔑 关键词：${keywords}\n💰 费用：¥${price}/月\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n🎨 正在生成 Pin 图方案...\n');
  const result = createPin(niche, keywords);
  console.log(`━━━ Pin 图方案 ━━━`);
  result.pinIdeas.forEach((pin, i) => {
    console.log(`\n方案${i+1}:`);
    console.log(`标题：${pin.title}`);
    console.log(`描述：${pin.description}`);
    console.log(`配色：${pin.colors.join(', ')}`);
  });
  console.log(`\n📐 规格：${result.specs.width}x${result.specs.height} ${result.specs.format}`);
  console.log(`🕐 最佳发布：${result.bestTimeToPost}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
