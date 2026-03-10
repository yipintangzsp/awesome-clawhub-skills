#!/usr/bin/env node
/** AI Meeting Assistant - AI 会议助手 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/ai-meeting-assistant.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'ai-meeting-assistant', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generateSummary(transcript) {
  const lines = transcript.split('\n').filter(l => l.trim());
  const actionItems = [];
  const decisions = [];
  lines.forEach(line => {
    if (/需要 | 要 | 必须|should|must|action/i.test(line)) actionItems.push(line.trim());
    if (/决定 | 确定|agree|decided|conclusion/i.test(line)) decisions.push(line.trim());
  });
  return { duration: `${Math.ceil(lines.length / 10)}分钟`, participants: new Set(lines.map(l => l.split(':')[0])).size, actionItems, decisions, summary: `会议共${lines.length}行发言，提取${actionItems.length}项待办，${decisions.length}项决议` };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const fileArg = args.find(a => a.startsWith('--transcript='));
  if (!fileArg) { console.log('用法：ai-meeting-assistant --transcript=<会议记录文件>\n示例：ai-meeting-assistant --transcript=./meeting.txt'); return; }
  const filePath = fileArg.split('=')[1], price = config.price_per_month || 29, userId = process.env.USER || 'unknown';
  if (!fs.existsSync(filePath)) { console.error(`❌ 文件不存在：${filePath}`); process.exit(1); }
  const transcript = fs.readFileSync(filePath, 'utf8');
  console.log(`📝 AI Meeting Assistant\n📁 文件：${filePath}\n💰 费用：¥${price}/月\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📝 正在生成会议纪要...\n');
  const result = generateSummary(transcript);
  console.log(`━━━ 会议纪要 ━━━`);
  console.log(`时长：${result.duration}`);
  console.log(`参会人数：${result.participants}`);
  console.log(`\n待办事项 (${result.actionItems.length}):`);
  result.actionItems.forEach((item, i) => console.log(`  ${i+1}. ${item}`));
  console.log(`\n决议 (${result.decisions.length}):`);
  result.decisions.forEach((item, i) => console.log(`  ${i+1}. ${item}`));
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
