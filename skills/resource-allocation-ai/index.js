#!/usr/bin/env node
/** Resource Allocation AI - 资源分配 AI **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/resource-allocation-ai.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'resource-allocation-ai', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generateResourceAllocation(resources, projects) {
  const resourceList = resources.split(',');
  const projectList = projects.split(',');
  return {
    resources: resourceList,
    projects: projectList,
    optimization: ['技能匹配', '负载均衡', '时间协调', '成本优化', '优先级排序'],
    metrics: ['利用率', '饱和度', '产出比', '满意度', '交付率'],
    strategies: ['动态分配', '弹性调度', '跨项目共享', '外包补充'],
    monitoring: ['实时追踪', '预警通知', '调整建议', '效果评估'],
    deliverables: ['分配方案', '调度计划', '利用报告', '优化建议']
  };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const resourcesArg = args.find(a => a.startsWith('--resources='));
  const projectsArg = args.find(a => a.startsWith('--projects='));
  if (!resourcesArg || !projectsArg) { console.log('用法：resource-allocation-ai --resources=<资源列表> --projects=<项目列表>\n示例：resource-allocation-ai --resources=dev,design,qa --projects=proj-a,proj-b'); return; }
  const resources = resourcesArg.split('=')[1], projects = projectsArg.split('=')[1], price = config.price_per_month || 499, userId = process.env.USER || 'unknown';
  console.log(`💡 Resource Allocation AI\n📦 资源：${resources}\n📁 项目：${projects}\n💰 费用：¥${price}/月\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📋 正在生成资源分配方案...\n');
  const allocation = generateResourceAllocation(resources, projects);
  console.log(`━━━ 资源分配方案 ━━━`);
  console.log(`资源：${allocation.resources.join(', ')}`);
  console.log(`项目：${allocation.projects.join(', ')}`);
  console.log(`优化：${allocation.optimization.join(', ')}`);
  console.log(`指标：${allocation.metrics.join(', ')}`);
  console.log(`策略：${allocation.strategies.join(', ')}`);
  console.log(`监控：${allocation.monitoring.join(', ')}`);
  console.log(`交付物：${allocation.deliverables.join(', ')}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
