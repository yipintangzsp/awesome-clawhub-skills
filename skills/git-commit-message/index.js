#!/usr/bin/env node
/** Git Commit Message - Git commit 生成 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/git-commit-message.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'git-commit-message', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generateCommit(diff) {
  const types = [
    { pattern: /fix|bug|错误|修复/i, type: 'fix', emoji: '🐛' },
    { pattern: /feat|feature|新|添加/i, type: 'feat', emoji: '✨' },
    { pattern: /refactor|重构|优化/i, type: 'refactor', emoji: '♻️' },
    { pattern: /docs|文档|readme/i, type: 'docs', emoji: '📝' },
    { pattern: /style|格式|样式/i, type: 'style', emoji: '💄' },
    { pattern: /test|测试/i, type: 'test', emoji: '✅' },
    { pattern: /chore|构建 | 配置/i, type: 'chore', emoji: '🔧' }
  ];
  let commitType = { type: 'chore', emoji: '🔧' };
  for (const t of types) { if (t.pattern.test(diff)) { commitType = t; break; } }
  const changes = diff.split('\n').filter(l => l.startsWith('+') || l.startsWith('-')).length;
  const files = (diff.match(/diff --git/g) || []).length;
  const message = `${commitType.emoji} ${commitType.type}: 更新代码 (修改${files}个文件，${changes}行变更)`;
  const body = `变更摘要:\n${diff.split('\n').filter(l => l.startsWith('+') || l.startsWith('-')).slice(0, 10).join('\n')}`;
  return { message, body, type: commitType.type, changes, files };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const diffArg = args.find(a => a.startsWith('--diff='));
  if (!diffArg) { console.log('用法：git-commit-message --diff="git diff 输出"\n示例：git-commit-message --diff="diff --git..."'); return; }
  const diff = diffArg.split('=')[1].replace(/"/g, ''), price = config.price_per_month || 9, userId = process.env.USER || 'unknown';
  console.log(`📝 Git Commit Message\n📊 变更分析中...\n💰 费用：¥${price}/月\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📝 正在生成 commit 信息...\n');
  const result = generateCommit(diff);
  console.log(`━━━ Commit 信息 ━━━`);
  console.log(`类型：${result.type}`);
  console.log(`文件数：${result.files}`);
  console.log(`变更行数：${result.changes}\n`);
  console.log(`Commit Message:`);
  console.log(result.message);
  console.log(`\n详细描述:\n${result.body}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
