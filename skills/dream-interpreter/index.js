#!/usr/bin/env node
/** 解梦 AI **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/dream-interpreter.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'dream-interpreter', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function dream_interpreter(dream = '飞翔') {
  const interpretations = {
    飞翔：'代表自由和突破，你可能渴望摆脱束缚',
    掉落：'代表不安全感，可能面临压力或失去控制',
    考试：'代表焦虑，可能对某事准备不足',
    追逐：'代表逃避，可能有不愿面对的问题',
    牙齿：'代表变化，可能面临人生转折',
    水：'代表情绪，水面平静表示内心平和'
  };
  const i = interpretations[dream] || '梦境反映潜意识，建议记录细节';
  return { success: true, dream, interpretation: i, category: '心理', tip: '梦境仅供参考' };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：dream-interpreter [选项]
功能：解梦 AI
价格：¥3/次

选项:
  --help     显示帮助信息
  --dream    梦境关键词

示例:
  dream-interpreter --dream 飞翔
`);
    return;
  }
  
  const price = config.price_per_call || 3, userId = process.env.USER || 'unknown';
  const dream = args.find(a => a.startsWith('--dream='))?.split('=')[1] || '飞翔';
  
  console.log(`🌙 解梦 AI\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在解析...\n');
  const result = dream_interpreter(dream);
  
  console.log('━━━ 梦境解析 ━━━');
  console.log(`🌌 梦境：${result.dream}`);
  console.log(`📖 解析：${result.interpretation}`);
  console.log(`\n💡 ${result.tip}`);
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
