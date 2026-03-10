#!/usr/bin/env node
/** 礼物创意生成 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/gift-idea-generator.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'gift-idea-generator', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function gift_idea_generator(recipient = '朋友', budget = 200) {
  const gifts = {
    朋友：[{ name: '定制相册', price: 100 }, { name: '文创产品', price: 150 }, { name: '体验券', price: 200 }],
    家人：[{ name: '健康礼品', price: 300 }, { name: '家居用品', price: 200 }, { name: '食品礼盒', price: 150 }],
    恋人：[{ name: '首饰', price: 500 }, { name: '香水', price: 400 }, { name: '定制礼物', price: 300 }],
    同事：[{ name: '办公用品', price: 100 }, { name: '茶叶', price: 150 }, { name: '小摆件', price: 80 }]
  };
  const g = gifts[recipient] || gifts.朋友;
  const filtered = g.filter(x => x.price <= budget);
  return { success: true, recipient, budget, gifts: filtered, count: filtered.length };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：gift-idea-generator [选项]
功能：礼物创意生成
价格：¥3/次

选项:
  --help      显示帮助信息
  --recipient 对象 (朋友/家人/恋人/同事，默认 朋友)
  --budget    预算 (默认 200)

示例:
  gift-idea-generator --recipient 恋人 --budget 500
`);
    return;
  }
  
  const price = config.price_per_call || 3, userId = process.env.USER || 'unknown';
  const recipient = args.find(a => a.startsWith('--recipient='))?.split('=')[1] || '朋友';
  const budget = parseInt(args.find(a => a.startsWith('--budget='))?.split('=')[1]) || 200;
  
  console.log(`🎁 礼物创意生成\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在生成...\n');
  const result = gift_idea_generator(recipient, budget);
  
  console.log('━━━ 礼物推荐 ━━━');
  console.log(`👤 对象：${result.recipient} | 预算：¥${result.budget}\n`);
  if (result.gifts.length) {
    result.gifts.forEach((g, i) => console.log(`${i + 1}. ${g.name} - ¥${g.price}`));
  } else {
    console.log('预算内暂无推荐，可提高预算');
  }
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
