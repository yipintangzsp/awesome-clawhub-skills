#!/usr/bin/env node
/** Customer Journey Mapper - 客户旅程映射 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/customer-journey-mapper.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'customer-journey-mapper', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generateJourneyMap(persona, touchpoints) {
  const touchpointList = touchpoints.split(',');
  const stages = ['认知', '考虑', '购买', '使用', '忠诚', '推荐'];
  return {
    persona,
    touchpoints: touchpointList,
    stages,
    analysis: ['用户目标', '行为路径', '情绪曲线', '痛点识别', '机会点'],
    metrics: ['转化率', '停留时间', '跳出率', '满意度', 'NPS'],
    optimization: ['触点优化', '内容个性化', '流程简化', '体验提升'],
    deliverables: ['旅程地图', '分析报告', '优化方案', '执行建议']
  };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const personaArg = args.find(a => a.startsWith('--persona='));
  const touchpointsArg = args.find(a => a.startsWith('--touchpoints='));
  if (!personaArg || !touchpointsArg) { console.log('用法：customer-journey-mapper --persona=<用户画像> --touchpoints=<触点>\n示例：customer-journey-mapper --persona=年轻白领 --touchpoints=website,social,email,app'); return; }
  const persona = personaArg.split('=')[1], touchpoints = touchpointsArg.split('=')[1], price = config.price_per_month || 599, userId = process.env.USER || 'unknown';
  console.log(`🗺️ Customer Journey Mapper\n👤 画像：${persona}\n📍 触点：${touchpoints}\n💰 费用：¥${price}/月\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📋 正在生成旅程地图...\n');
  const journey = generateJourneyMap(persona, touchpoints);
  console.log(`━━━ 客户旅程地图 ━━━`);
  console.log(`用户画像：${journey.persona}`);
  console.log(`触点：${journey.touchpoints.join(', ')}`);
  console.log(`阶段：${journey.stages.join(' → ')}`);
  console.log(`分析维度：${journey.analysis.join(', ')}`);
  console.log(`核心指标：${journey.metrics.join(', ')}`);
  console.log(`优化方向：${journey.optimization.join(', ')}`);
  console.log(`交付物：${journey.deliverables.join(', ')}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
