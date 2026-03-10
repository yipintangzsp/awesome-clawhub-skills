#!/usr/bin/env node
/** 抽认卡生成 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/flashcard-generator.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'flashcard-generator', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function flashcard_generator(subject = '英语', count = 5) {
  const cards = {
    英语：[{ q: 'Hello', a: '你好' }, { q: 'Thank you', a: '谢谢' }, { q: 'Goodbye', a: '再见' }],
    历史：[{ q: '秦朝建立时间', a: '公元前 221 年' }, { q: '唐朝都城', a: '长安' }],
    科学：[{ q: '水的化学式', a: 'H2O' }, { q: '光速', a: '30 万 km/s' }]
  };
  const c = cards[subject] || cards.英语;
  return { success: true, subject, cards: c.slice(0, count), count: Math.min(count, c.length) };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：flashcard-generator [选项]
功能：抽认卡生成
价格：¥3/次

选项:
  --help     显示帮助信息
  --subject  科目 (英语/历史/科学，默认 英语)
  --count    数量 (默认 5)

示例:
  flashcard-generator --subject 历史 --count 10
`);
    return;
  }
  
  const price = config.price_per_call || 3, userId = process.env.USER || 'unknown';
  const subject = args.find(a => a.startsWith('--subject='))?.split('=')[1] || '英语';
  const count = parseInt(args.find(a => a.startsWith('--count='))?.split('=')[1]) || 5;
  
  console.log(`🃏 抽认卡生成\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在生成...\n');
  const result = flashcard_generator(subject, count);
  
  console.log('━━━ 抽认卡 ━━━');
  console.log(`📚 科目：${result.subject} | 数量：${result.count}\n`);
  result.cards.forEach((c, i) => console.log(`${i + 1}. Q: ${c.q} | A: ${c.a}`));
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
