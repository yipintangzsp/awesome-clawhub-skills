#!/usr/bin/env node
/** 每日名言生成 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/daily-quote-generator.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'daily-quote-generator', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function daily_quote_generator() {
  const quotes = [
    { text: "生活不是等待风暴过去，而是学会在雨中跳舞。", author: "维维安·格林" },
    { text: "成功不是终点，失败不是末日：重要的是继续前进的勇气。", author: "丘吉尔" },
    { text: "你无法改变风向，但可以调整风帆。", author: "吉米·迪恩" },
    { text: "相信你可以，你就已经成功了一半。", author: "罗斯福" },
    { text: "最好的报复是巨大的成功。", author: "弗兰克·西纳特拉" }
  ];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  return { success: true, quote: quote.text, author: quote.author };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：daily-quote-generator [选项]
功能：每日名言生成
价格：¥1/次

选项:
  --help     显示帮助信息
  --version  显示版本号

示例:
  daily-quote-generator
`);
    return;
  }
  
  const price = config.price_per_call || 1, userId = process.env.USER || 'unknown';
  console.log(`📜 每日名言生成\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在生成名言...');
  const result = daily_quote_generator();
  
  console.log('\n━━━ 今日名言 ━━━');
  console.log(`"${result.quote}"`);
  console.log(`—— ${result.author}`);
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
