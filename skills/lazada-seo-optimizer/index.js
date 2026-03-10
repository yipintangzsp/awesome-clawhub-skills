#!/usr/bin/env node
/** Lazada SEO Optimizer - Lazada SEO 优化 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/lazada-seo-optimizer.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'lazada-seo-optimizer', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function optimizeSEO(product, keywords) {
  const keywordList = keywords.split(/[,,]/).map(k => k.trim()).filter(k => k);
  const optimizedTitle = `${keywordList.slice(0, 3).join(' ')} ${product} 2026 新款`;
  const description = `【热卖】${product} - ${keywordList.join(', ')}。优质材料，经久耐用。限时优惠，立即下单！`;
  const tags = keywordList.slice(0, 5).map(k => `#${k.replace(/\s/g, '')}`);
  const score = Math.min(100, 60 + keywordList.length * 10);
  return { optimizedTitle, description, tags, score };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const productArg = args.find(a => a.startsWith('--product='));
  const keywordsArg = args.find(a => a.startsWith('--keywords='));
  if (!productArg) { console.log('用法：lazada-seo-optimizer --product="产品名" --keywords="关键词 1，关键词 2"\n示例：lazada-seo-optimizer --product="无线耳机" --keywords="蓝牙，降噪，运动"'); return; }
  const product = productArg.split('=')[1].replace(/"/g, ''), keywords = keywordsArg?.split('=')[1].replace(/"/g, '') || '热卖，新品', price = config.price_per_month || 29, userId = process.env.USER || 'unknown';
  console.log(`📈 Lazada SEO Optimizer\n📦 产品：${product}\n🔑 关键词：${keywords}\n💰 费用：¥${price}/月\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📈 正在优化...\n');
  const result = optimizeSEO(product, keywords);
  console.log(`━━━ SEO 优化结果 ━━━`);
  console.log(`优化评分：${result.score}/100`);
  console.log(`\n优化标题:\n${result.optimizedTitle}`);
  console.log(`\n产品描述:\n${result.description}`);
  console.log(`\n推荐标签：${result.tags.join(' ')}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
