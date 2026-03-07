#!/usr/bin/env node
/** Content Rewriter - 内容改写器 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/content-rewriter.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'content-rewriter', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function rewriteContent(text, tone) {
  const tones = { formal: '正式', casual: '随意', professional: '专业', friendly: '友好' };
  let rewritten = text.replace(/你好/g, '您好').replace(/谢谢/g, '感谢').replace(/但是/g, '然而');
  if (tone === 'formal') rewritten = rewritten.replace(/搞/g, '处理').replace(/弄/g, '完成');
  return { success: true, original: text.length, rewritten, tone: tones[tone] || tone };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) { console.log('用法：content-rewriter "<文本>" --tone <风格>\n风格：formal|casual|professional|friendly'); return; }
  let text = args.find(a => !a.startsWith('--')), tone = args.includes('--tone') ? args[args.indexOf('--tone')+1] : 'casual';
  if (!text) { console.error('❌ 请提供文本'); return; }
  const price = config.price_per_call || 1.5, userId = process.env.USER || 'unknown';
  console.log(`✍️ Content Rewriter\n📝 字数：${text.length}\n💰 费用：¥${price}\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n✍️ 正在改写...');
  const result = rewriteContent(text, tone);
  console.log(`\n━━━ 改写结果 ━━━`);
  console.log(`风格：${result.tone}`);
  console.log(`\n${result.rewritten}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
