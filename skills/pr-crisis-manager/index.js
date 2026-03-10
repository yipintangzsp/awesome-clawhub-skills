#!/usr/bin/env node
/** PR Crisis Manager - PR 危机管理 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/pr-crisis-manager.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'pr-crisis-manager', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generateCrisisPlan(crisisType, severity) {
  const severityLevels = { low: '低', medium: '中', high: '高', critical: '严重' };
  return {
    crisisType,
    severity: severityLevels[severity.toLowerCase()] || severity,
    response: ['快速响应', '事实核查', '声明发布', '媒体沟通', '后续跟进'],
    timeline: ['0-2 小时：内部响应', '2-4 小时：初步声明', '24 小时：详细回应', '72 小时：解决方案'],
    channels: ['官方网站', '社交媒体', '新闻发布会', '媒体采访', '行业沟通'],
    metrics: ['舆情热度', '情感倾向', '媒体覆盖', '品牌影响'],
    deliverables: ['危机评估', '应对方案', '声明稿件', '复盘报告']
  };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const typeArg = args.find(a => a.startsWith('--crisis-type='));
  const severityArg = args.find(a => a.startsWith('--severity='));
  if (!typeArg || !severityArg) { console.log('用法：pr-crisis-manager --crisis-type=<危机类型> --severity=<严重程度>\n示例：pr-crisis-manager --crisis-type=产品质量 --severity=high'); return; }
  const crisisType = typeArg.split('=')[1], severity = severityArg.split('=')[1], price = config.price_per_crisis || 999, userId = process.env.USER || 'unknown';
  console.log(`🚨 PR Crisis Manager\n⚠️ 类型：${crisisType}\n📊 级别：${severity}\n💰 费用：¥${price}/次\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📋 正在生成危机应对方案...\n');
  const crisis = generateCrisisPlan(crisisType, severity);
  console.log(`━━━ 危机应对方案 ━━━`);
  console.log(`危机类型：${crisis.crisisType}`);
  console.log(`严重程度：${crisis.severity}`);
  console.log(`应对步骤：${crisis.response.join(' → ')}`);
  console.log(`时间线:`);
  crisis.timeline.forEach(t => console.log(`  ${t}`));
  console.log(`沟通渠道：${crisis.channels.join(', ')}`);
  console.log(`监测指标：${crisis.metrics.join(', ')}`);
  console.log(`交付物：${crisis.deliverables.join(', ')}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
