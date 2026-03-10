#!/usr/bin/env node
/** Metaverse Office - 元宇宙办公室 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/metaverse-office.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'metaverse-office', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generateMetaverseOffice(company, employees) {
  return {
    company,
    employees: parseInt(employees) || 50,
    spaces: ['接待大厅', '会议室', '工位区', '休息区', '活动场地'],
    features: ['虚拟化身', '空间音频', '屏幕共享', '白板协作', '文件共享'],
    integrations: ['Zoom', 'Teams', 'Google Meet', 'Notion', 'Slack'],
    customization: ['品牌 Logo', '装修风格', '家具定制', '互动装置'],
    platforms: ['Decentraland', 'Sandbox', 'Spatial', 'Horizon'],
    deliverables: ['虚拟办公室', '用户指南', '培训文档', '技术支持']
  };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const companyArg = args.find(a => a.startsWith('--company='));
  const employeesArg = args.find(a => a.startsWith('--employees='));
  if (!companyArg || !employeesArg) { console.log('用法：metaverse-office --company=<公司名> --employees=<员工数>\n示例：metaverse-office --company=ABC-Corp --employees=100'); return; }
  const company = companyArg.split('=')[1], employees = employeesArg.split('=')[1], price = config.price_per_month || 999, userId = process.env.USER || 'unknown';
  console.log(`🏢 Metaverse Office\n🏷️ 公司：${company}\n👥 员工：${employees}\n💰 费用：¥${price}/月\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📋 正在生成元宇宙办公室方案...\n');
  const office = generateMetaverseOffice(company, employees);
  console.log(`━━━ 元宇宙办公室 ━━━`);
  console.log(`公司：${office.company}`);
  console.log(`员工容量：${office.employees}人`);
  console.log(`空间：${office.spaces.join(', ')}`);
  console.log(`功能：${office.features.join(', ')}`);
  console.log(`集成：${office.integrations.join(', ')}`);
  console.log(`定制：${office.customization.join(', ')}`);
  console.log(`平台：${office.platforms.join(', ')}`);
  console.log(`交付物：${office.deliverables.join(', ')}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
