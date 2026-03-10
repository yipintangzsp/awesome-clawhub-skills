#!/usr/bin/env node
/** Social Listening Suite - 社交监听套件 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/social-listening-suite.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'social-listening-suite', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generateListeningPlan(keywords, platforms) {
  const keywordList = keywords.split(',');
  const platformList = platforms.split(',');
  return {
    keywords: keywordList,
    platforms: platformList,
    features: ['实时监听', '情感分析', '话题聚类', 'KOL 识别', '危机预警'],
    metrics: ['提及量', '情感倾向', '覆盖人数', '互动量', '声量份额'],
    analysis: ['品牌健康度', '竞品对比', '话题趋势', '用户画像', '内容分析'],
    alerts: ['负面预警', '热度异常', '竞品动态', '行业趋势'],
    deliverables: ['监听报告', '情感分析', '竞品对比', '优化建议']
  };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const keywordsArg = args.find(a => a.startsWith('--keywords='));
  const platformsArg = args.find(a => a.startsWith('--platforms='));
  if (!keywordsArg || !platformsArg) { console.log('用法：social-listening-suite --keywords=<监听关键词> --platforms=<社交平台>\n示例：social-listening-suite --keywords=品牌名，产品名 --platforms=weibo,wechat,xiaohongshu'); return; }
  const keywords = keywordsArg.split('=')[1], platforms = platformsArg.split('=')[1], price = config.price_per_month || 599, userId = process.env.USER || 'unknown';
  console.log(`📢 Social Listening Suite\n🔍 关键词：${keywords}\n📱 平台：${platforms}\n💰 费用：¥${price}/月\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📋 正在生成监听方案...\n');
  const listening = generateListeningPlan(keywords, platforms);
  console.log(`━━━ 社交监听方案 ━━━`);
  console.log(`关键词：${listening.keywords.join(', ')}`);
  console.log(`平台：${listening.platforms.join(', ')}`);
  console.log(`功能：${listening.features.join(', ')}`);
  console.log(`指标：${listening.metrics.join(', ')}`);
  console.log(`分析：${listening.analysis.join(', ')}`);
  console.log(`告警：${listening.alerts.join(', ')}`);
  console.log(`交付物：${listening.deliverables.join(', ')}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
