#!/usr/bin/env node
/** Competitive Intel Suite - 竞争情报套件 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/competitive-intel-suite.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'competitive-intel-suite', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generateCompetitiveIntel(competitors, metrics) {
  const competitorList = competitors.split(',');
  const metricList = metrics.split(',');
  return {
    competitors: competitorList,
    metrics: metricList,
    monitoring: ['产品更新', '价格变化', '营销活动', '用户评价', '融资动态', '人员变动'],
    analysis: ['功能对比', '价格对比', '市场份额', '用户满意度', '品牌声量'],
    sources: ['官网', '应用商店', '社交媒体', '新闻稿', '行业报告', '用户评论'],
    alerts: ['重大更新', '价格调整', '负面舆情', '市场动作'],
    deliverables: ['竞品报告', '对比分析', '趋势追踪', '策略建议']
  };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const competitorsArg = args.find(a => a.startsWith('--competitors='));
  const metricsArg = args.find(a => a.startsWith('--metrics='));
  if (!competitorsArg || !metricsArg) { console.log('用法：competitive-intel-suite --competitors=<竞品列表> --metrics=<监控指标>\n示例：competitive-intel-suite --competitors=A,B,C --metrics=price,features,marketing'); return; }
  const competitors = competitorsArg.split('=')[1], metrics = metricsArg.split('=')[1], price = config.price_per_month || 699, userId = process.env.USER || 'unknown';
  console.log(`🔍 Competitive Intel Suite\n🏢 竞品：${competitors}\n📊 指标：${metrics}\n💰 费用：¥${price}/月\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📋 正在生成竞争情报方案...\n');
  const intel = generateCompetitiveIntel(competitors, metrics);
  console.log(`━━━ 竞争情报方案 ━━━`);
  console.log(`竞品：${intel.competitors.join(', ')}`);
  console.log(`指标：${intel.metrics.join(', ')}`);
  console.log(`监控：${intel.monitoring.join(', ')}`);
  console.log(`分析：${intel.analysis.join(', ')}`);
  console.log(`来源：${intel.sources.join(', ')}`);
  console.log(`告警：${intel.alerts.join(', ')}`);
  console.log(`交付物：${intel.deliverables.join(', ')}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
