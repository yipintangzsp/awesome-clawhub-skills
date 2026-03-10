#!/usr/bin/env node
/** 帖子调度精简版 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/post-scheduler-lite.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'post-scheduler-lite', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function post_scheduler_lite(platform = 'xiaohongshu', frequency = 'daily') {
  const schedules = {
    xiaohongshu: { best: ['8:00', '12:00', '18:00', '21:00'], tip: '早晚高峰流量大' },
    weibo: { best: ['9:00', '12:00', '18:00', '22:00'], tip: '午休和睡前是高峰' },
    douyin: { best: ['11:00', '14:00', '19:00', '23:00'], tip: '晚间流量最高' },
    instagram: { best: ['10:00', '14:00', '19:00'], tip: '周末表现更好' }
  };
  const s = schedules[platform] || schedules.xiaohongshu;
  const postsPerWeek = frequency === 'daily' ? 7 : frequency === 'weekly' ? 3 : 5;
  return { success: true, platform, frequency, bestTimes: s.best, tip: s.tip, postsPerWeek };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：post-scheduler-lite [选项]
功能：帖子调度精简版
价格：¥5/次

选项:
  --help       显示帮助信息
  --platform   平台 (xiaohongshu/weibo/douyin/instagram, 默认 xiaohongshu)
  --frequency  频率 (daily/weekly/custom, 默认 daily)

示例:
  post-scheduler-lite --platform douyin --frequency weekly
`);
    return;
  }
  
  const price = config.price_per_call || 5, userId = process.env.USER || 'unknown';
  const platform = args.find(a => a.startsWith('--platform='))?.split('=')[1] || 'xiaohongshu';
  const frequency = args.find(a => a.startsWith('--frequency='))?.split('=')[1] || 'daily';
  
  console.log(`📅 帖子调度精简版\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在排期...\n');
  const result = post_scheduler_lite(platform, frequency);
  
  console.log('━━━ 发布计划 ━━━');
  console.log(`📱 平台：${result.platform}`);
  console.log(`📊 频率：${result.frequency} | 每周${result.postsPerWeek}篇`);
  console.log(`\n⏰ 最佳时间:`);
  result.bestTimes.forEach(t => console.log(`  ${t}`));
  console.log(`\n💡 提示：${result.tip}`);
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
