#!/usr/bin/env node
/** Unit Converter - 单位转换器 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/unit-converter.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'unit-converter', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function convert(value, from, to) {
  const rates = {
    length: { m: 1, km: 0.001, cm: 100, mm: 1000, ft: 3.28084, in: 39.3701, mi: 0.000621371 },
    weight: { kg: 1, g: 1000, lb: 2.20462, oz: 35.274, t: 0.001 },
    temp: { c: 'c', f: 'f', k: 'k' }
  };
  if (from === 'c' && to === 'f') return { success: true, result: (value * 9/5 + 32).toFixed(2), from: `${value}°C`, to: `${(value * 9/5 + 32).toFixed(2)}°F` };
  if (from === 'f' && to === 'c') return { success: true, result: ((value - 32) * 5/9).toFixed(2), from: `${value}°F`, to: `${((value - 32) * 5/9).toFixed(2)}°C` };
  const result = value * rates.length[to] / rates.length[from] || value * rates.weight[to] / rates.weight[from];
  return { success: true, result: result.toFixed(4), from: `${value} ${from}`, to: `${result.toFixed(4)} ${to}` };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.length < 3) { console.log('用法：unit-converter <数值> <单位> <目标单位>\n示例：unit-converter 100 m km\n支持：长度 (m/km/cm/mm/ft/in/mi), 重量 (kg/g/lb/oz/t), 温度 (c/f/k)'); return; }
  const value = parseFloat(args[0]), from = args[1], to = args[2], price = config.price_per_call || 0.5, userId = process.env.USER || 'unknown';
  console.log(`🔄 Unit Converter\n📊 转换：${value} ${from} → ${to}\n💰 费用：¥${price}\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n🔄 正在转换...');
  const result = convert(value, from, to);
  console.log(`\n━━━ 转换结果 ━━━`);
  console.log(`${result.from} = ${result.to}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
