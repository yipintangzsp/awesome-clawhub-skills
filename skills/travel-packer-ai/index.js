#!/usr/bin/env node
/** 旅行打包 AI **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/travel-packer-ai.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'travel-packer-ai', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function travel_packer_ai(destination = '海边', days = 3) {
  const essentials = {
    海边：['泳衣', '防晒霜', '墨镜', '沙滩鞋', '毛巾'],
    山区：['登山鞋', '冲锋衣', '背包', '水壶', '防晒帽'],
    城市：['舒适鞋', '轻便外套', '充电宝', '地图', '相机'],
    商务：['西装', '皮鞋', '笔记本电脑', '名片', '文件夹']
  };
  const e = essentials[destination] || essentials.城市;
  const clothes = Math.ceil(days / 2) + 1;
  return { success: true, destination, days, essentials: e, clothesCount: clothes, checklist: [...e, `衣物${clothes}套`, '洗漱用品', '证件'] };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：travel-packer-ai [选项]
功能：旅行打包 AI
价格：¥3/次

选项:
  --help        显示帮助信息
  --destination 目的地 (海边/山区/城市/商务，默认 海边)
  --days        天数 (默认 3)

示例:
  travel-packer-ai --destination 山区 --days 5
`);
    return;
  }
  
  const price = config.price_per_call || 3, userId = process.env.USER || 'unknown';
  const destination = args.find(a => a.startsWith('--destination='))?.split('=')[1] || '海边';
  const days = parseInt(args.find(a => a.startsWith('--days='))?.split('=')[1]) || 3;
  
  console.log(`🧳 旅行打包 AI\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在生成...\n');
  const result = travel_packer_ai(destination, days);
  
  console.log('━━━ 打包清单 ━━━');
  console.log(`📍 目的地：${result.destination} | 天数：${result.days}天\n`);
  console.log('必备物品:');
  result.essentials.forEach(i => console.log(`  ✓ ${i}`));
  console.log(`\n衣物：${result.clothesCount}套`);
  console.log('\n完整清单:');
  result.checklist.forEach(i => console.log(`  □ ${i}`));
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
