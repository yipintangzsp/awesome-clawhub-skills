#!/usr/bin/env node
/** Influencer ROI Tracker - 网红 ROI 追踪 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/influencer-roi-tracker.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'influencer-roi-tracker', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generateROITracker(campaigns, platforms) {
  const platformList = platforms.split(',');
  return {
    campaigns: campaigns.split(','),
    platforms: platformList,
    metrics: ['曝光量', '互动率', '点击率', '转化率', 'ROI', 'CPA'],
    tracking: ['专属链接', '优惠码', '像素追踪', 'UTM 参数', '归因模型'],
    analysis: ['KOL 排名', '平台对比', '内容分析', '受众画像', '最佳时段'],
    optimization: ['预算分配', 'KOL 筛选', '内容优化', '投放时机'],
    deliverables: ['效果报告', 'ROI 分析', '优化建议', 'KOL 榜单']
  };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const campaignsArg = args.find(a => a.startsWith('--campaigns='));
  const platformsArg = args.find(a => a.startsWith('--platforms='));
  if (!campaignsArg || !platformsArg) { console.log('用法：influencer-roi-tracker --campaigns=<活动列表> --platforms=<平台>\n示例：influencer-roi-tracker --campaigns=summer,winter --platforms=instagram,tiktok,youtube'); return; }
  const campaigns = campaignsArg.split('=')[1], platforms = platformsArg.split('=')[1], price = config.price_per_month || 499, userId = process.env.USER || 'unknown';
  console.log(`📊 Influencer ROI Tracker\n📝 活动：${campaigns}\n📱 平台：${platforms}\n💰 费用：¥${price}/月\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📋 正在生成 ROI 追踪方案...\n');
  const roi = generateROITracker(campaigns, platforms);
  console.log(`━━━ ROI 追踪方案 ━━━`);
  console.log(`活动：${roi.campaigns.join(', ')}`);
  console.log(`平台：${roi.platforms.join(', ')}`);
  console.log(`核心指标：${roi.metrics.join(', ')}`);
  console.log(`追踪方式：${roi.tracking.join(', ')}`);
  console.log(`分析维度：${roi.analysis.join(', ')}`);
  console.log(`优化方向：${roi.optimization.join(', ')}`);
  console.log(`交付物：${roi.deliverables.join(', ')}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
