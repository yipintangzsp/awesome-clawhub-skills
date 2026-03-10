#!/usr/bin/env node
/** AI Code Reviewer - AI 代码审查 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/ai-code-reviewer.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'ai-code-reviewer', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function reviewCode(code) {
  const issues = [];
  if (code.includes('var ')) issues.push({ type: 'warning', msg: '使用 let/const 替代 var' });
  if (code.includes('==')) issues.push({ type: 'warning', msg: '使用 === 替代 ==' });
  if (code.includes('console.log')) issues.push({ type: 'info', msg: '移除生产环境的 console.log' });
  if (code.length > 500 && !code.includes('//') && !code.includes('/*')) issues.push({ type: 'warning', msg: '添加代码注释' });
  if ((code.match(/function/g) || []).length > 10) issues.push({ type: 'info', msg: '考虑拆分大函数' });
  const score = Math.max(0, 100 - issues.length * 15);
  return { score, issues, lines: code.split('\n').length };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const fileArg = args.find(a => a.startsWith('--file='));
  if (!fileArg) { console.log('用法：ai-code-reviewer --file=<文件路径>\n示例：ai-code-reviewer --file=./src/index.js'); return; }
  const filePath = fileArg.split('=')[1], price = config.price_per_month || 29, userId = process.env.USER || 'unknown';
  if (!fs.existsSync(filePath)) { console.error(`❌ 文件不存在：${filePath}`); process.exit(1); }
  const code = fs.readFileSync(filePath, 'utf8');
  console.log(`🔍 AI Code Reviewer\n📁 文件：${filePath}\n📝 代码行数：${code.split('\n').length}\n💰 费用：¥${price}/月\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n🔍 正在审查代码...\n');
  const result = reviewCode(code);
  console.log(`━━━ 代码审查结果 ━━━`);
  console.log(`质量评分：${result.score}/100`);
  console.log(`发现问题：${result.issues.length}个\n`);
  result.issues.forEach((issue, i) => console.log(`${i+1}. [${issue.type}] ${issue.msg}`));
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
