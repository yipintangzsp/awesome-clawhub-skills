#!/usr/bin/env node
/** API Doc Generator - API 文档生成 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/api-doc-generator.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'api-doc-generator', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generateDocs(content, format) {
  const endpoints = [];
  const routeRegex = /(app\.(get|post|put|delete)\(['"]([^'"]+)['"]/g);
  let match;
  while ((match = routeRegex.exec(content)) !== null) {
    endpoints.push({ method: match[2].toUpperCase(), path: match[3], description: 'API endpoint' });
  }
  if (endpoints.length === 0) endpoints.push({ method: 'GET', path: '/api/example', description: '示例接口' });
  let doc = '# API 文档\n\n自动生成于 ' + new Date().toISOString() + '\n\n';
  if (format === 'markdown') {
    doc += '## 接口列表\n\n';
    endpoints.forEach(ep => { doc += `### ${ep.method} ${ep.path}\n\n${ep.description}\n\n`; });
  } else if (format === 'json') {
    doc = JSON.stringify({ version: '1.0', generated: new Date().toISOString(), endpoints }, null, 2);
  }
  return { doc, endpointCount: endpoints.length, format };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const inputArg = args.find(a => a.startsWith('--input='));
  const format = args.find(a => a.startsWith('--format='))?.split('=')[1] || 'markdown';
  if (!inputArg) { console.log('用法：api-doc-generator --input=<文件路径> [--format=markdown|json]\n示例：api-doc-generator --input=./src/routes.js'); return; }
  const inputPath = inputArg.split('=')[1], price = config.price_per_month || 19, userId = process.env.USER || 'unknown';
  if (!fs.existsSync(inputPath)) { console.error(`❌ 文件不存在：${inputPath}`); process.exit(1); }
  const content = fs.readFileSync(inputPath, 'utf8');
  console.log(`📝 API Doc Generator\n📁 输入：${inputPath}\n📄 格式：${format}\n💰 费用：¥${price}/月\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📝 正在生成文档...\n');
  const result = generateDocs(content, format);
  console.log(`━━━ API 文档 ━━━`);
  console.log(`接口数量：${result.endpointCount}`);
  console.log(`输出格式：${result.format}\n`);
  console.log(result.doc);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
