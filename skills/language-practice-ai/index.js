#!/usr/bin/env node
/** 语言练习 AI **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/language-practice-ai.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'language-practice-ai', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function language_practice_ai(language = 'English', level = 'beginner') {
  const phrases = {
    English: {
      beginner: ['Hello!', 'How are you?', 'Thank you', 'Goodbye'],
      intermediate: ['Could you help me?', "I'm looking for...", 'What do you think?'],
      advanced: ['I beg to differ', 'Let me elaborate', 'That being said']
    },
    Japanese: {
      beginner: ['こんにちは', 'ありがとう', 'さようなら'],
      intermediate: ['すみません', 'お願いします', 'わかります'],
      advanced: ['恐れ入ります', '恐縮です', 'ご査収ください']
    }
  };
  const p = phrases[language]?.[level] || ['Hello', 'Thank you', 'Goodbye'];
  return { success: true, language, level, phrases: p, count: p.length, practiceTip: '每天练习 10 分钟' };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：language-practice-ai [选项]
功能：语言练习 AI
价格：¥5/次

选项:
  --help     显示帮助信息
  --language 语言 (English/Japanese, 默认 English)
  --level    水平 (beginner/intermediate/advanced, 默认 beginner)

示例:
  language-practice-ai --language Japanese --level intermediate
`);
    return;
  }
  
  const price = config.price_per_call || 5, userId = process.env.USER || 'unknown';
  const language = args.find(a => a.startsWith('--language='))?.split('=')[1] || 'English';
  const level = args.find(a => a.startsWith('--level='))?.split('=')[1] || 'beginner';
  
  console.log(`🗣️ 语言练习 AI\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在准备...\n');
  const result = language_practice_ai(language, level);
  
  console.log('━━━ 练习内容 ━━━');
  console.log(`🌍 语言：${result.language} | 水平：${result.level}`);
  console.log(`📊 短语数量：${result.count}\n`);
  result.phrases.forEach((p, i) => console.log(`${i + 1}. ${p}`));
  console.log(`\n💡 提示：${result.practiceTip}`);
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
