#!/usr/bin/env node
/** 文案写作 AI **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/caption-writer-ai.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'caption-writer-ai', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function caption_writer_ai(topic = '日常', style = 'casual') {
  const templates = {
    casual: [
      `今天也是${topic}的一天呢～`,
      `记录${topic}的小美好 ✨`,
      `${topic}日常 | 生活需要仪式感`,
      `关于${topic}的一些碎片 📸`
    ],
    professional: [
      `深度分享：${topic}的见解`,
      `${topic} | 专业视角解读`,
      `探讨${topic}的可能性`,
      `${topic}实践心得`
    ],
    funny: [
      `${topic}翻车现场😂`,
      `当${topic}遇到我...`,
      `${topic}：理想 vs 现实`,
      `救命！${topic}也太难了`
    ],
    emotional: [
      `${topic}让我想到的`,
      `关于${topic}的碎碎念`,
      `今天被${topic}治愈了`,
      `${topic} | 一些心里话`
    ]
  };
  const caps = templates[style] || templates.casual;
  return { success: true, topic, style, captions: caps, count: caps.length };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：caption-writer-ai [选项]
功能：文案写作 AI
价格：¥3/次

选项:
  --help     显示帮助信息
  --topic    主题 (默认 日常)
  --style    风格 (casual/professional/funny/emotional, 默认 casual)

示例:
  caption-writer-ai --topic 旅行 --style emotional
`);
    return;
  }
  
  const price = config.price_per_call || 3, userId = process.env.USER || 'unknown';
  const topic = args.find(a => a.startsWith('--topic='))?.split('=')[1] || '日常';
  const style = args.find(a => a.startsWith('--style='))?.split('=')[1] || 'casual';
  
  console.log(`✍️ 文案写作 AI\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在创作...\n');
  const result = caption_writer_ai(topic, style);
  
  console.log('━━━ 文案选项 ━━━');
  console.log(`📝 主题：${result.topic} | 风格：${result.style}`);
  console.log(`📊 数量：${result.count}条\n`);
  result.captions.forEach((c, i) => console.log(`${i + 1}. ${c}`));
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
