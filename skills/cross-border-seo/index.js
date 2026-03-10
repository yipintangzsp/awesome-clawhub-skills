#!/usr/bin/env node
/** Cross Border SEO - 跨境 SEO **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/cross-border-seo.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'cross-border-seo', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generateSEOPlan(markets, languages) {
  const marketList = markets.split(',');
  const languageList = languages.split(',');
  return {
    markets: marketList,
    languages: languageList,
    services: ['关键词研究', '内容优化', '技术 SEO', '外链建设', '本地化 SEO'],
    engines: ['Google', 'Bing', 'Yahoo', 'Baidu', 'Yandex'],
    features: ['多语言站点地图', 'hreflang 标签', '本地内容', 'GBP 优化', '评论管理'],
    tracking: ['排名监控', '流量分析', '转化追踪', '竞品分析'],
    deliverables: ['SEO 报告', '关键词列表', '优化建议', '月度分析']
  };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const marketsArg = args.find(a => a.startsWith('--markets='));
  const languagesArg = args.find(a => a.startsWith('--languages='));
  if (!marketsArg || !languagesArg) { console.log('用法：cross-border-seo --markets=<目标市场> --languages=<语言>\n示例：cross-border-seo --markets=US,UK,DE --languages=en,de'); return; }
  const markets = marketsArg.split('=')[1], languages = languagesArg.split('=')[1], price = config.price_per_month || 599, userId = process.env.USER || 'unknown';
  console.log(`🔍 Cross Border SEO\n🌍 市场：${markets}\n📝 语言：${languages}\n💰 费用：¥${price}/月\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📋 正在生成 SEO 方案...\n');
  const seo = generateSEOPlan(markets, languages);
  console.log(`━━━ SEO 方案 ━━━`);
  console.log(`目标市场：${seo.markets.join(', ')}`);
  console.log(`支持语言：${seo.languages.join(', ')}`);
  console.log(`服务：${seo.services.join(', ')}`);
  console.log(`搜索引擎：${seo.engines.join(', ')}`);
  console.log(`功能：${seo.features.join(', ')}`);
  console.log(`追踪：${seo.tracking.join(', ')}`);
  console.log(`交付物：${seo.deliverables.join(', ')}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
