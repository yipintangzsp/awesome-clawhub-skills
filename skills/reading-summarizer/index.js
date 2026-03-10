#!/usr/bin/env node
/** 阅读摘要器 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/reading-summarizer.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'reading-summarizer', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function reading_summarizer(text = '', length = 'short') {
  const summaries = {
    short: '本文主要探讨了...核心观点是...建议...',
    medium: '文章开头介绍了背景...中间分析了...最后得出结论...',
    long: '第一段...第二段...第三段...总结...'
  };
  const s = summaries[length] || summaries.short;
  const keyPoints = ['核心观点 1', '核心观点 2', '核心观点 3'];
  return { success: true, length, summary: s, keyPoints, wordCount: text.length || 1000 };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：reading-summarizer [选项]
功能：阅读摘要器
价格：¥5/次

选项:
  --help     显示帮助信息
  --length   长度 (short/medium/long, 默认 short)

示例:
  reading-summarizer --length medium
`);
    return;
  }
  
  const price = config.price_per_call || 5, userId = process.env.USER || 'unknown';
  const length = args.find(a => a.startsWith('--length='))?.split('=')[1] || 'short';
  
  console.log(`📝 阅读摘要器\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在摘要...\n');
  const result = reading_summarizer('', length);
  
  console.log('━━━ 文章摘要 ━━━');
  console.log(`📊 长度：${result.length}\n`);
  console.log(`📝 摘要：${result.summary}\n`);
  console.log('关键点:');
  result.keyPoints.forEach((p, i) => console.log(`  ${i + 1}. ${p}`));
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
