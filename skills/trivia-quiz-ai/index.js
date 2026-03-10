#!/usr/bin/env node
/** 知识问答 AI **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/trivia-quiz-ai.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'trivia-quiz-ai', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function trivia_quiz_ai(category = '常识', count = 5) {
  const questions = {
    常识：[
      { q: '中国首都是？', a: '北京', options: ['北京', '上海', '广州'] },
      { q: '一年有多少天？', a: '365', options: ['365', '360', '300'] },
      { q: '最大的洋是？', a: '太平洋', options: ['太平洋', '大西洋', '印度洋'] }
    ],
    科学：[
      { q: '水的化学式是？', a: 'H2O', options: ['H2O', 'CO2', 'O2'] },
      { q: '光速是多少？', a: '30 万 km/s', options: ['30 万 km/s', '20 万 km/s', '40 万 km/s'] }
    ],
    历史：[
      { q: '秦朝建立于？', a: '公元前 221 年', options: ['公元前 221 年', '公元前 200 年', '公元前 300 年'] },
      { q: '唐朝都城是？', a: '长安', options: ['长安', '洛阳', '开封'] }
    ]
  };
  const q = questions[category] || questions.常识;
  return { success: true, category, questions: q.slice(0, count), count: Math.min(count, q.length) };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：trivia-quiz-ai [选项]
功能：知识问答 AI
价格：¥2/次

选项:
  --help     显示帮助信息
  --category 类别 (常识/科学/历史，默认 常识)
  --count    题目数量 (默认 5)

示例:
  trivia-quiz-ai --category 科学 --count 10
`);
    return;
  }
  
  const price = config.price_per_call || 2, userId = process.env.USER || 'unknown';
  const category = args.find(a => a.startsWith('--category='))?.split('=')[1] || '常识';
  const count = parseInt(args.find(a => a.startsWith('--count='))?.split('=')[1]) || 5;
  
  console.log(`🧠 知识问答 AI\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在出题...\n');
  const result = trivia_quiz_ai(category, count);
  
  console.log('━━━ 知识问答 ━━━');
  console.log(`📚 类别：${result.category} | 题目：${result.count}道\n`);
  result.questions.forEach((q, i) => {
    console.log(`${i + 1}. ${q.q}`);
    console.log(`   选项：${q.options.join(' | ')}`);
    console.log(`   答案：${q.a}\n`);
  });
  console.log('━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
