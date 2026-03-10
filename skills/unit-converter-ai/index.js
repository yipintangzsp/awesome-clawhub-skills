#!/usr/bin/env node
/** 单位转换 AI **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/unit-converter-ai.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'unit-converter-ai', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function unit_converter_ai(value = 1, from = 'km', to = 'm') {
  const conversions = {
    length: { km_m: 1000, m_cm: 100, cm_mm: 10, mile_km: 1.609, foot_m: 0.3048 },
    weight: { kg_g: 1000, g_mg: 1000, lb_kg: 0.4536, oz_g: 28.35 },
    temp: { c_f: v => v * 9/5 + 32, f_c: v => (v - 32) * 5/9 }
  };
  let result = value;
  const key = `${from}_${to}`;
  if (conversions.length[key]) result = value * conversions.length[key];
  else if (conversions.weight[key]) result = value * conversions.weight[key];
  else if (key === 'c_f') result = conversions.temp.c_f(value);
  else if (key === 'f_c') result = conversions.temp.f_c(value);
  return { success: true, value, from, to, result: Math.round(result * 1000) / 1000 };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：unit-converter-ai [选项]
功能：单位转换 AI
价格：¥1/次

选项:
  --help     显示帮助信息
  --value    数值 (默认 1)
  --from     原单位
  --to       目标单位

示例:
  unit-converter-ai --value 100 --from c --to f
`);
    return;
  }
  
  const price = config.price_per_call || 1, userId = process.env.USER || 'unknown';
  const value = parseFloat(args.find(a => a.startsWith('--value='))?.split('=')[1]) || 1;
  const from = args.find(a => a.startsWith('--from='))?.split('=')[1] || 'km';
  const to = args.find(a => a.startsWith('--to='))?.split('=')[1] || 'm';
  
  console.log(`🔄 单位转换 AI\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在转换...\n');
  const result = unit_converter_ai(value, from, to);
  
  console.log('━━━ 转换结果 ━━━');
  console.log(`${result.value} ${result.from} = ${result.result} ${result.to}`);
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
