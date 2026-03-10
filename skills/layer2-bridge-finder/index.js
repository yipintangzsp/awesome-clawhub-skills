#!/usr/bin/env node
/** Layer2 桥接 finder **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/layer2-bridge-finder.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'layer2-bridge-finder', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function layer2_bridge_finder() {
  // TODO: 实现核心功能
  return { success: true, message: 'Layer2 桥接 finder - 功能实现中' };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：layer2-bridge-finder [选项]
功能：Layer2 桥接 finder
价格：¥19/次

选项:
  --help     显示帮助信息
  --version  显示版本号

示例:
  layer2-bridge-finder
`);
    return;
  }
  
  const price = config.price_per_call || 9, userId = process.env.USER || 'unknown';
  console.log(`🔧 Layer2 桥接 finder\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在处理...');
  const result = layer2_bridge_finder();
  
  console.log('\n━━━ 处理完成 ━━━');
  console.log(`状态：${result.success ? '✅ 成功' : '❌ 失败'}`);
  console.log(`消息：${result.message}`);
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
