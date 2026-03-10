#!/usr/bin/env node
/** AI Data Analyst - AI 数据分析师 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/ai-data-analyst.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'ai-data-analyst', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function analyzeData(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  const data = lines.slice(1).map(line => line.split(','));
  const insights = [];
  insights.push(`数据总量：${data.length}条记录`);
  insights.push(`字段数量：${headers.length}个 (${headers.join(', ')})`);
  if (data.length > 0) {
    const numericCols = headers.map((h, i) => ({ name: h, index: i, values: data.map(row => parseFloat(row[i]) || 0) })).filter(c => c.values.some(v => v > 0));
    numericCols.forEach(col => {
      const avg = col.values.reduce((a, b) => a + b, 0) / col.values.length;
      const max = Math.max(...col.values);
      const min = Math.min(...col.values);
      insights.push(`${col.name}: 平均=${avg.toFixed(2)}, 最大=${max}, 最小=${min}`);
    });
  }
  return { records: data.length, columns: headers, insights };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const fileArg = args.find(a => a.startsWith('--data='));
  if (!fileArg) { console.log('用法：ai-data-analyst --data=<CSV 文件路径>\n示例：ai-data-analyst --data=./sales.csv'); return; }
  const filePath = fileArg.split('=')[1], price = config.price_per_month || 39, userId = process.env.USER || 'unknown';
  if (!fs.existsSync(filePath)) { console.error(`❌ 文件不存在：${filePath}`); process.exit(1); }
  const csvContent = fs.readFileSync(filePath, 'utf8');
  console.log(`📊 AI Data Analyst\n📁 文件：${filePath}\n💰 费用：¥${price}/月\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📊 正在分析数据...\n');
  const result = analyzeData(csvContent);
  console.log(`━━━ 数据分析结果 ━━━`);
  result.insights.forEach(insight => console.log(`• ${insight}`));
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
