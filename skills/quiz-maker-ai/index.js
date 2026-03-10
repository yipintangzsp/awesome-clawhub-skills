#!/usr/bin/env node
/** 测验制作 AI **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/quiz-maker-ai.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'quiz-maker-ai', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function quiz_maker_ai(subject = '常识', difficulty = 'medium') {
  const quizzes = {
    常识：[
      { q: '中国首都是？', options: ['北京', '上海', '广州'], a: '北京' },
      { q: '一年有多少天？', options: ['365', '360', '300'], a: '365' }
    ],
    科学：[
      { q: '水的沸点是？', options: ['100°C', '90°C', '110°C'], a: '100°C' },
      { q: '地球是第几颗行星？', options: ['第三', '第二', '第四'], a: '第三' }
    ]
  };
  const q = quizzes[subject] || quizzes.常识;
  return { success: true, subject, difficulty, questions: q, count: q.length };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：quiz-maker-ai [选项]
功能：测验制作 AI
价格：¥3/次

选项:
  --help       显示帮助信息
  --subject    科目 (常识/科学，默认 常识)
  --difficulty 难度 (easy/medium/hard, 默认 medium)

示例:
  quiz-maker-ai --subject 科学 --difficulty hard
`);
    return;
  }
  
  const price = config.price_per_call || 3, userId = process.env.USER || 'unknown';
  const subject = args.find(a => a.startsWith('--subject='))?.split('=')[1] || '常识';
  const difficulty = args.find(a => a.startsWith('--difficulty='))?.split('=')[1] || 'medium';
  
  console.log(`📝 测验制作 AI\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在出题...\n');
  const result = quiz_maker_ai(subject, difficulty);
  
  console.log('━━━ 测验题目 ━━━');
  console.log(`📚 科目：${result.subject} | 难度：${result.difficulty}\n`);
  result.questions.forEach((q, i) => {
    console.log(`${i + 1}. ${q.q}`);
    console.log(`   选项：${q.options.join(' | ')}`);
    console.log(`   答案：${q.a}\n`);
  });
  console.log('━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
