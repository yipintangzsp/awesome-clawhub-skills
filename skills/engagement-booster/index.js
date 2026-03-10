#!/usr/bin/env node
/** 互动提升器 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/engagement-booster.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'engagement-booster', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function engagement_booster() {
  const tips = [
    '发布后 1 小时内积极回复评论',
    '在文案末尾添加互动问题',
    '使用投票/问答功能',
    '与同领域博主互动',
    '固定时间发布培养习惯',
    '回复每条评论增加权重',
    '使用热门话题标签',
    '@好友增加传播'
  ];
  const ctas = [
    '你觉得呢？评论区聊聊',
    '点赞收藏不迷路',
    '关注我获取更多干货',
    '转发给需要的朋友',
    '评论区告诉我你的想法'
  ];
  return { success: true, tips, ctas, count: tips.length + ctas.length };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：engagement-booster [选项]
功能：互动提升器
价格：¥3/次

选项:
  --help     显示帮助信息

示例:
  engagement-booster
`);
    return;
  }
  
  const price = config.price_per_call || 3, userId = process.env.USER || 'unknown';
  
  console.log(`💬 互动提升器\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在生成...\n');
  const result = engagement_booster();
  
  console.log('━━━ 互动技巧 ━━━');
  console.log(`📊 共${result.count}条建议\n`);
  console.log('💡 运营技巧:');
  result.tips.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
  console.log('\n📣 互动话术:');
  result.ctas.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
