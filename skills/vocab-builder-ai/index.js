#!/usr/bin/env node
/** 词汇构建 AI **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/vocab-builder-ai.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'vocab-builder-ai', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function vocab_builder_ai(level = 'CET4', count = 10) {
  const words = {
    CET4: [{ word: 'abandon', mean: '放弃' }, { word: 'ability', mean: '能力' }, { word: 'abnormal', mean: '异常的' }],
    CET6: [{ word: 'abide', mean: '遵守' }, { word: 'abolish', mean: '废除' }, { word: 'abrupt', mean: '突然的' }],
    IELTS: [{ word: 'academic', mean: '学术的' }, { word: 'accelerate', mean: '加速' }, { word: 'accessible', mean: '可进入的' }]
  };
  const w = words[level] || words.CET4;
  const examples = w.map(v => ({ ...v, example: `The ${v.word} is important.` }));
  return { success: true, level, words: examples.slice(0, count), count: Math.min(count, w.length) };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：vocab-builder-ai [选项]
功能：词汇构建 AI
价格：¥3/次

选项:
  --help     显示帮助信息
  --level    级别 (CET4/CET6/IELTS, 默认 CET4)
  --count    数量 (默认 10)

示例:
  vocab-builder-ai --level IELTS --count 5
`);
    return;
  }
  
  const price = config.price_per_call || 3, userId = process.env.USER || 'unknown';
  const level = args.find(a => a.startsWith('--level='))?.split('=')[1] || 'CET4';
  const count = parseInt(args.find(a => a.startsWith('--count='))?.split('=')[1]) || 10;
  
  console.log(`📚 词汇构建 AI\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在生成...\n');
  const result = vocab_builder_ai(level, count);
  
  console.log('━━━ 词汇学习 ━━━');
  console.log(`📖 级别：${result.level} | 数量：${result.count}\n`);
  result.words.forEach((w, i) => console.log(`${i + 1}. ${w.word} - ${w.mean}`));
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
