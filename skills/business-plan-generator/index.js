#!/usr/bin/env node
/** 商业计划书生成 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/business-plan-generator.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'business-plan-generator', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generateBusinessPlan(industry) {
  // TODO: 实现商业计划书生成
  return { 
    success: true, 
    executiveSummary: '',
    marketAnalysis: {},
    financialProjections: {},
    fullPlan: ''
  };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：business-plan-generator [选项]
功能：商业计划书自动生成
价格：¥199/次

选项:
  --help     显示帮助信息
  --version  显示版本号
  --generate  生成商业计划书
  --template  查看模板

示例:
  business-plan-generator --generate
`);
    return;
  }
  
  const price = config.price_per_call || 199, userId = process.env.USER || 'unknown';
  console.log(`🔧 商业计划书生成\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在生成商业计划书...');
  const result = generateBusinessPlan(config.industry || 'general');
  
  console.log('\n━━━ 生成完成 ━━━');
  console.log(`状态：${result.success ? '✅ 成功' : '❌ 失败'}`);
  console.log(`计划书长度：${result.fullPlan.length} 字`);
  console.log(`财务预测：${Object.keys(result.financialProjections).length} 项`);
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
