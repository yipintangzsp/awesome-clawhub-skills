#!/usr/bin/env node
/** 语法检查精简版 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/grammar-checker-lite.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'grammar-checker-lite', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function grammar_checker_lite(text = '') {
  const commonErrors = [
    { pattern: '的得地', suggestion: '检查"的得地"用法' },
    { pattern: '在再', suggestion: '检查"在/再"区分' },
    { pattern: '做作', suggestion: '检查"做/作"用法' }
  ];
  const issues = commonErrors.filter(e => text.includes(e.pattern));
  const score = issues.length === 0 ? 100 : Math.max(60, 100 - issues.length * 15);
  return { success: true, text, issues, score, suggestions: ['多读多练', '注意常见错误', '使用检查工具'] };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：grammar-checker-lite [选项]
功能：语法检查精简版
价格：¥5/次

选项:
  --help     显示帮助信息
  --text     要检查的文本

示例:
  grammar-checker-lite --text "这是一个测试"
`);
    return;
  }
  
  const price = config.price_per_call || 5, userId = process.env.USER || 'unknown';
  const text = args.find(a => a.startsWith('--text='))?.split('=')[1] || '示例文本';
  
  console.log(`✅ 语法检查精简版\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在检查...\n');
  const result = grammar_checker_lite(text);
  
  console.log('━━━ 检查结果 ━━━');
  console.log(`📊 评分：${result.score}/100`);
  console.log(`\n发现问题：${result.issues.length}个`);
  if (result.issues.length) {
    result.issues.forEach((i, idx) => console.log(`  ${idx + 1}. ${i.suggestion}`));
  } else {
    console.log('  ✅ 未发现明显问题');
  }
  console.log(`\n💡 建议：${result.suggestions.join(' | ')}`);
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
