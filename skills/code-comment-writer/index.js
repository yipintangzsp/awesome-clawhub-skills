#!/usr/bin/env node
/** Code Comment Writer - 代码注释生成 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/code-comment-writer.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'code-comment-writer', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function addComments(code, style) {
  const funcRegex = /(function\s+(\w+)|(\w+)\s*=\s*(async\s+)?function|(\w+)\s*=\s*(async\s+)?\([^)]*\)\s*=>)/g;
  let annotated = code;
  let count = 0;
  let match;
  while ((match = funcRegex.exec(code)) !== null) {
    const funcName = match[2] || match[3] || match[5] || 'anonymous';
    const comment = style === 'jsdoc' 
      ? `/**\n * ${funcName} 函数\n * @description 自动生成的注释\n * @returns {*} 返回值\n */\n`
      : `// ${funcName} 函数 - 自动生成的注释\n`;
    const index = match.index;
    annotated = annotated.slice(0, index) + comment + annotated.slice(index);
    count++;
  }
  if (count === 0) { annotated = '// 未检测到函数，这是文件级注释\n' + code; count = 1; }
  return { annotated, commentCount: count };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const fileArg = args.find(a => a.startsWith('--file='));
  const style = args.find(a => a.startsWith('--style='))?.split('=')[1] || 'jsdoc';
  if (!fileArg) { console.log('用法：code-comment-writer --file=<文件路径> [--style=jsdoc|single]\n示例：code-comment-writer --file=./src/utils.js'); return; }
  const filePath = fileArg.split('=')[1], price = config.price_per_call || 9, userId = process.env.USER || 'unknown';
  if (!fs.existsSync(filePath)) { console.error(`❌ 文件不存在：${filePath}`); process.exit(1); }
  const code = fs.readFileSync(filePath, 'utf8');
  console.log(`📝 Code Comment Writer\n📁 文件：${filePath}\n🎨 风格：${style}\n💰 费用：¥${price}\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📝 正在生成注释...\n');
  const result = addComments(code, style);
  console.log(`━━━ 注释生成完成 ━━━`);
  console.log(`添加注释：${result.commentCount}处\n`);
  console.log('输出代码:');
  console.log(result.annotated);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
