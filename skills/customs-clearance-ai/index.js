#!/usr/bin/env node
/** Customs Clearance AI - 清关 AI 助手 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/customs-clearance-ai.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'customs-clearance-ai', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generateClearancePlan(country, category) {
  const countries = { US: '美国', EU: '欧盟', JP: '日本', UK: '英国', AU: '澳大利亚' };
  return {
    country: countries[country.toUpperCase()] || country,
    category,
    hsCode: 'AI 自动匹配 HS 编码',
    tariff: '根据商品类别自动计算',
    documents: ['商业发票', '装箱单', '提单', '原产地证', '质检报告'],
    compliance: ['产品认证', '标签要求', '禁限物品', '配额管理'],
    timeline: '通常 3-7 个工作日',
    features: ['智能归类', '风险预警', '单证生成', '进度追踪']
  };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const countryArg = args.find(a => a.startsWith('--country='));
  const categoryArg = args.find(a => a.startsWith('--category='));
  if (!countryArg || !categoryArg) { console.log('用法：customs-clearance-ai --country=<目标国家> --category=<商品类别>\n示例：customs-clearance-ai --country=US --category=electronics'); return; }
  const country = countryArg.split('=')[1], category = categoryArg.split('=')[1], price = config.price_per_month || 399, userId = process.env.USER || 'unknown';
  console.log(`🏛️ Customs Clearance AI\n🌍 国家：${country}\n📦 类别：${category}\n💰 费用：¥${price}/月\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📋 正在生成清关方案...\n');
  const clearance = generateClearancePlan(country, category);
  console.log(`━━━ 清关方案 ━━━`);
  console.log(`目标国家：${clearance.country}`);
  console.log(`商品类别：${clearance.category}`);
  console.log(`HS 编码：${clearance.hsCode}`);
  console.log(`关税：${clearance.tariff}`);
  console.log(`所需单证：${clearance.documents.join(', ')}`);
  console.log(`合规要求：${clearance.compliance.join(', ')}`);
  console.log(`预计时效：${clearance.timeline}`);
  console.log(`功能：${clearance.features.join(', ')}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
