#!/usr/bin/env node
/** 笑话生成 AI **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/joke-generator-ai.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'joke-generator-ai', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function joke_generator_ai(category = '日常') {
  const jokes = {
    日常：[
      { q: '为什么数学书很忧郁？', a: '因为它有太多问题了' },
      { q: '什么动物最安静？', a: '猩猩（猩猩不说话）' },
      { q: '为什么电脑不会感冒？', a: '因为它有防火墙' }
    ],
    职场：[
      { q: '老板最喜欢什么动物？', a: '马（马屁精）' },
      { q: '打工人最讨厌什么天气？', a: '加班（加斑）' }
    ],
    生活：[
      { q: '为什么钱包总是空的？', a: '因为它在减肥' },
      { q: '什么最容易被打破？', a: '承诺' }
    ]
  };
  const j = jokes[category] || jokes.日常;
  const joke = j[Math.floor(Math.random() * j.length)];
  return { success: true, category, joke, count: j.length };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：joke-generator-ai [选项]
功能：笑话生成 AI
价格：¥1/次

选项:
  --help     显示帮助信息
  --category 类别 (日常/职场/生活，默认 日常)

示例:
  joke-generator-ai --category 职场
`);
    return;
  }
  
  const price = config.price_per_call || 1, userId = process.env.USER || 'unknown';
  const category = args.find(a => a.startsWith('--category='))?.split('=')[1] || '日常';
  
  console.log(`😂 笑话生成 AI\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在生成...\n');
  const result = joke_generator_ai(category);
  
  console.log('━━━ 今日笑话 ━━━');
  console.log(`📂 类别：${result.category}\n`);
  console.log(`❓ ${result.joke.q}`);
  console.log(`💡 ${result.joke.a}`);
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
