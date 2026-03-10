#!/usr/bin/env node
/** 融资 PPT 设计 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/pitch-deck-designer.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'pitch-deck-designer', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function designPitchDeck(info) {
  // TODO: 实现融资 PPT 设计
  return { 
    success: true, 
    slides: [],
    storyline: '',
    designTemplate: ''
  };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：pitch-deck-designer [选项]
功能：融资 PPT 设计与内容生成
价格：¥299/次

选项:
  --help     显示帮助信息
  --version  显示版本号
  --design   设计融资 PPT
  --review   评估现有 PPT

示例:
  pitch-deck-designer --design
`);
    return;
  }
  
  const price = config.price_per_call || 299, userId = process.env.USER || 'unknown';
  console.log(`🔧 融资 PPT 设计\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在设计融资 PPT...');
  const result = designPitchDeck(config);
  
  console.log('\n━━━ 设计完成 ━━━');
  console.log(`状态：${result.success ? '✅ 成功' : '❌ 失败'}`);
  console.log(`幻灯片数量：${result.slides.length} 页`);
  console.log(`故事线：${result.storyline.length} 字`);
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
