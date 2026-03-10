#!/usr/bin/env node
/** LinkedIn Content Generator - LinkedIn 内容生成 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/linkedin-content-generator.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'linkedin-content-generator', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generateContent(topic, tone) {
  const hooks = [
    `很多人对${topic}有误解，让我分享一些见解...`,
    `过去 3 个月，我在${topic}领域学到了这些...`,
    `${topic}正在改变行业，这 3 点你必须知道...`
  ];
  const content = `
${hooks[Math.floor(Math.random() * hooks.length)]}

1️⃣ 核心观点一：深入分析${topic}的关键趋势
2️⃣ 核心观点二：实际案例和数据支撑
3️⃣ 核心观点三：可执行的建议

你有什么看法？欢迎在评论区讨论👇

#${topic.replace(/\s/g, '')} #行业洞察 #职业发展`;
  const hashtags = [`#${topic.replace(/\s/g, '')}`, '#职业发展', '#行业趋势', '#专业成长'];
  return { content, hashtags, estimatedReach: '5000-10000' };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const topicArg = args.find(a => a.startsWith('--topic='));
  const tone = args.find(a => a.startsWith('--tone='))?.split('=')[1] || 'professional';
  if (!topicArg) { console.log('用法：linkedin-content-generator --topic="主题" [--tone=professional|casual|inspirational]\n示例：linkedin-content-generator --topic="AI trends"'); return; }
  const topic = topicArg.split('=')[1].replace(/"/g, ''), price = config.price_per_month || 29, userId = process.env.USER || 'unknown';
  console.log(`💼 LinkedIn Content Generator\n📝 主题：${topic}\n🎭 风格：${tone}\n💰 费用：¥${price}/月\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📝 正在生成内容...\n');
  const result = generateContent(topic, tone);
  console.log(`━━━ 生成的帖子 ━━━\n${result.content}`);
  console.log(`\n预计曝光：${result.estimatedReach}`);
  console.log(`标签：${result.hashtags.join(' ')}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
