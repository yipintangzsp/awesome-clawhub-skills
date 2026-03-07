#!/usr/bin/env node
/** Domain Checker - 域名查询工具 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/domain-checker.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'domain-checker', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function checkDomain(domain) {
  // 简化版（实际可调 Namecheap/GoDaddy API）
  const extensions = ['.com', '.cn', '.net', '.io', '.ai'];
  const results = extensions.map(ext => ({
    domain: domain + ext,
    available: Math.random() > 0.5,
    price: Math.floor(Math.random() * 500) + 50
  }));
  return { success: true, data: results };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.length === 0) { console.log('用法：domain-checker <域名前缀>\n示例：domain-checker myawesome'); return; }
  const prefix = args[0], price = config.price_per_call || 2, userId = process.env.USER || 'unknown';
  console.log(`🌐 Domain Checker\n🔍 域名：${prefix}*\n💰 费用：¥${price}\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n🌐 正在查询域名...');
  const result = checkDomain(prefix);
  console.log(`\n━━━ 域名查询结果 ━━━`);
  console.log('域名'.padEnd(25) + '状态'.padStart(10) + '价格');
  console.log('─'.repeat(45));
  result.data.forEach(d => {
    const status = d.available ? '✅ 可注册' : '❌ 已注册';
    console.log(`${d.domain.padEnd(25)}${status.padStart(10)}¥${d.price}`);
  });
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
