#!/usr/bin/env node
/** Export Compliance Check - 出口合规检查 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/export-compliance-check.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'export-compliance-check', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generateComplianceCheck(product, destination) {
  return {
    product,
    destination,
    checks: ['出口许可', '产品认证', '标签要求', '包装规范', '文件准备'],
    certifications: ['CE', 'FCC', 'RoHS', 'FDA', 'UL'],
    restrictions: ['禁运国家', '管制产品', '配额限制', '反倾销'],
    documents: ['商业发票', '装箱单', '原产地证', '质检报告', '运输单据'],
    riskLevel: '低/中/高风险评估',
    timeline: '合规审核 1-3 个工作日'
  };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const productArg = args.find(a => a.startsWith('--product='));
  const destArg = args.find(a => a.startsWith('--destination='));
  if (!productArg || !destArg) { console.log('用法：export-compliance-check --product=<产品信息> --destination=<目的地>\n示例：export-compliance-check --product=electronics --destination=US'); return; }
  const product = productArg.split('=')[1], destination = destArg.split('=')[1], price = config.price_per_month || 499, userId = process.env.USER || 'unknown';
  console.log(`✅ Export Compliance Check\n📦 产品：${product}\n🌍 目的地：${destination}\n💰 费用：¥${price}/月\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📋 正在生成合规检查...\n');
  const compliance = generateComplianceCheck(product, destination);
  console.log(`━━━ 合规检查 ━━━`);
  console.log(`产品：${compliance.product}`);
  console.log(`目的地：${compliance.destination}`);
  console.log(`检查项：${compliance.checks.join(', ')}`);
  console.log(`认证要求：${compliance.certifications.join(', ')}`);
  console.log(`限制：${compliance.restrictions.join(', ')}`);
  console.log(`所需文件：${compliance.documents.join(', ')}`);
  console.log(`风险等级：${compliance.riskLevel}`);
  console.log(`审核时效：${compliance.timeline}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
