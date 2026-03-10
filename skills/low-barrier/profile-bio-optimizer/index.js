#!/usr/bin/env node
/** 个人简介优化 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/profile-bio-optimizer.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'profile-bio-optimizer', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function profile_bio_optimizer(role = '创作者', style = 'professional') {
  const bios = {
    professional: [
      `${role} | 专注分享干货`,
      `资深${role} | 帮助 1000+ 人成长`,
      `${role}从业者 | 持续输出价值`
    ],
    casual: [
      `一个有趣的${role}`,
      `${role}打工人 | 爱生活爱分享`,
      `普通${role}的不普通日常`
    ],
    creative: [
      `用${role}的方式看世界`,
      `${role}艺术家 | 创造美好`,
      `${role} | 把热爱变成事业`
    ]
  };
  const b = bios[style] || bios.professional;
  return { success: true, role, style, bios: b, tips: '添加 emoji 更生动 | 突出核心价值 | 保持真实' };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：profile-bio-optimizer [选项]
功能：个人简介优化
价格：¥3/次

选项:
  --help     显示帮助信息
  --role     角色 (默认 创作者)
  --style    风格 (professional/casual/creative, 默认 professional)

示例:
  profile-bio-optimizer --role 摄影师 --style creative
`);
    return;
  }
  
  const price = config.price_per_call || 3, userId = process.env.USER || 'unknown';
  const role = args.find(a => a.startsWith('--role='))?.split('=')[1] || '创作者';
  const style = args.find(a => a.startsWith('--style='))?.split('=')[1] || 'professional';
  
  console.log(`👤 个人简介优化\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在优化...\n');
  const result = profile_bio_optimizer(role, style);
  
  console.log('━━━ 简介选项 ━━━');
  console.log(`📌 角色：${result.role} | 风格：${result.style}\n`);
  result.bios.forEach((b, i) => console.log(`${i + 1}. ${b}`));
  console.log(`\n💡 提示：${result.tips}`);
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
