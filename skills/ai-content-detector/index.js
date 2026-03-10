#!/usr/bin/env node
/** AI Content Detector - AI 内容检测 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/ai-content-detector.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'ai-content-detector', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function detectAI(text) {
  const aiPatterns = [
    { pattern: /Additionally|Furthermore|Moreover/gi, weight: 2 },
    { pattern: /crucial|pivotal|vital|testament/gi, weight: 2 },
    { pattern: /delve|underscore|highlight|showcase/gi, weight: 2 },
    { pattern: /In conclusion|In summary/gi, weight: 3 },
    { pattern: /It is important to note/gi, weight: 3 },
    { pattern: /I hope this helps|Certainly|Great question/gi, weight: 4 }
  ];
  let score = 0;
  aiPatterns.forEach(({ pattern, weight }) => {
    const matches = text.match(pattern);
    if (matches) score += matches.length * weight;
  });
  const confidence = Math.min(100, Math.round((score / text.length) * 1000));
  return { isAI: confidence > 50, confidence, details: `检测到${score}个 AI 特征` };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const textArg = args.find(a => a.startsWith('--text='));
  if (!textArg) { console.log('用法：ai-content-detector --text="要检测的文本"\n示例：ai-content-detector --text="Additionally, this is crucial..."'); return; }
  const text = textArg.split('=')[1].replace(/"/g, ''), price = config.price_per_call || 9, userId = process.env.USER || 'unknown';
  console.log(`🔍 AI Content Detector\n📝 检测文本长度：${text.length}字符\n💰 费用：¥${price}\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n🔍 正在分析...\n');
  const result = detectAI(text);
  console.log(`━━━ 检测结果 ━━━`);
  console.log(`AI 可能性：${result.isAI ? '高' : '低'}`);
  console.log(`置信度：${result.confidence}%`);
  console.log(`详情：${result.details}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
