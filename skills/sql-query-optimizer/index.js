#!/usr/bin/env node
/** SQL Query Optimizer - SQL 查询优化 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/sql-query-optimizer.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'sql-query-optimizer', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function optimizeQuery(query) {
  const issues = [];
  const suggestions = [];
  if (/SELECT\s+\*/i.test(query)) { issues.push('使用 SELECT *'); suggestions.push('明确指定需要的列名'); }
  if (!/WHERE/i.test(query)) { issues.push('缺少 WHERE 条件'); suggestions.push('添加过滤条件减少扫描行数'); }
  if (/LIKE\s+['"]%/i.test(query)) { issues.push('前缀模糊匹配'); suggestions.push('考虑使用全文索引'); }
  if (/ORDER\s+BY.*RAND\(\)/i.test(query)) { issues.push('RAND() 排序'); suggestions.push('使用应用层随机或缓存'); }
  if (!/LIMIT/i.test(query) && query.length > 100) { issues.push('缺少 LIMIT'); suggestions.push('添加 LIMIT 限制返回行数'); }
  const optimized = query.replace(/SELECT\s+\*/i, 'SELECT id, name, created_at').replace(/\s+/g, ' ').trim();
  const score = Math.max(0, 100 - issues.length * 20);
  return { issues, suggestions, optimized, score };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const queryArg = args.find(a => a.startsWith('--query='));
  if (!queryArg) { console.log('用法：sql-query-optimizer --query="SQL 查询语句"\n示例：sql-query-optimizer --query="SELECT * FROM users"'); return; }
  const query = queryArg.split('=')[1].replace(/"/g, ''), price = config.price_per_month || 29, userId = process.env.USER || 'unknown';
  console.log(`📊 SQL Query Optimizer\n📝 查询长度：${query.length}字符\n💰 费用：¥${price}/月\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📊 正在分析查询...\n');
  const result = optimizeQuery(query);
  console.log(`━━━ 查询优化结果 ━━━`);
  console.log(`优化评分：${result.score}/100`);
  if (result.issues.length > 0) {
    console.log(`\n发现问题 (${result.issues.length}):`);
    result.issues.forEach((issue, i) => console.log(`  ${i+1}. ⚠️ ${issue}`));
  }
  if (result.suggestions.length > 0) {
    console.log(`\n优化建议:`);
    result.suggestions.forEach((s, i) => console.log(`  ${i+1}. 💡 ${s}`));
  }
  console.log(`\n优化后查询:\n${result.optimized}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
