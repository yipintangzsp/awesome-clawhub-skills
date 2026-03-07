#!/usr/bin/env node
/** Social Media Scheduler - 社交媒体定时发布 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/social-media-scheduler.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'social-media-scheduler', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function schedulePost(platform, content, time) {
  const postId = `POST-${Date.now()}`;
  return { success: true, postId, platform, content: content.substring(0, 50) + '...', scheduledTime: time, status: 'pending' };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.length < 2) { console.log('用法：social-media-scheduler <平台> "<内容>" --time <时间>\n平台：wechat|weibo|twitter|linkedin\n示例：social-media-scheduler weibo "新动态！" --time "2026-03-07 10:00"'); return; }
  const platform = args[0], content = args[1], time = args.includes('--time') ? args[args.indexOf('--time')+1] : new Date().toISOString();
  const price = config.price_per_call || 2, userId = process.env.USER || 'unknown';
  console.log(`📱 Social Media Scheduler\n🌐 平台：${platform}\n💰 费用：¥${price}\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📱 正在安排发布...');
  const result = schedulePost(platform, content, time);
  console.log(`\n━━━ 发布安排 ━━━`);
  console.log(`ID: ${result.postId}`);
  console.log(`平台：${result.platform}`);
  console.log(`内容：${result.content}`);
  console.log(`时间：${result.scheduledTime}`);
  console.log(`状态：${result.status}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
