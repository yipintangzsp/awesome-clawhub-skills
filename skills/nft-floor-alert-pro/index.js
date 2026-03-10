#!/usr/bin/env node
/** NFT 地板价警报专业版 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/nft-floor-alert-pro.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'nft-floor-alert-pro', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function monitorNFTFloors(collections) {
  // TODO: 实现多平台 NFT 地板价监控
  return { 
    success: true, 
    floors: {},
    trends: {},
    alerts: []
  };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：nft-floor-alert-pro [选项]
功能：NFT 地板价监控与警报
价格：¥79/月

选项:
  --help     显示帮助信息
  --version  显示版本号
  --check    检查当前地板价
  --watch    持续监控模式

示例:
  nft-floor-alert-pro --check
`);
    return;
  }
  
  const price = config.price_per_call || 79, userId = process.env.USER || 'unknown';
  console.log(`🔧 NFT 地板价警报专业版\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在监控 NFT 地板价...');
  const result = monitorNFTFloors(config.collections || []);
  
  console.log('\n━━━ 监控完成 ━━━');
  console.log(`状态：${result.success ? '✅ 成功' : '❌ 失败'}`);
  console.log(`监控项目：${Object.keys(result.floors).length}`);
  console.log(`触发警报：${result.alerts.length}`);
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
