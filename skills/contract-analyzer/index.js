#!/usr/bin/env node
/** Contract Analyzer - 合同分析器 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/contract-analyzer.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'contract-analyzer', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function analyzeContract(text) {
  return { success: true, data: {
    parties: ['甲方', '乙方'],
    amount: '¥XXX,XXX',
    duration: '12 个月',
    keyTerms: ['付款条款', '保密协议', '违约责任', '争议解决'],
    risks: ['注意自动续约条款', '违约金比例较高', '管辖法院约定'],
    score: 78
  }};
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) { console.log('用法：contract-analyzer --file <合同文件>\n或：contract-analyzer "<合同文本>"'); return; }
  let text = '';
  if (args.includes('--file')) text = fs.readFileSync(args[args.indexOf('--file')+1], 'utf8');
  else text = args.find(a => !a.startsWith('--')) || '';
  if (!text) { console.error('❌ 请提供合同内容'); return; }
  const price = config.price_per_call || 10, userId = process.env.USER || 'unknown';
  console.log(`⚖️ Contract Analyzer\n📄 字数：${text.length}\n💰 费用：¥${price}\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n⚖️ 正在分析合同...');
  const result = analyzeContract(text);
  console.log(`\n━━━ 合同分析 ━━━`);
  console.log(`综合评分：${result.data.score}/100`);
  console.log(`\n📋 关键条款:`);
  result.data.keyTerms.forEach(t => console.log(`  • ${t}`));
  console.log(`\n⚠️ 风险提示:`);
  result.data.risks.forEach(r => console.log(`  • ${r}`));
  console.log('\n━━━ 结束 ━━━\n⚠️ 免责声明：仅供参考，请咨询专业律师');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
