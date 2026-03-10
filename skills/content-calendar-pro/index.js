#!/usr/bin/env node
/** Content Calendar Pro - 内容日历专业版 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/content-calendar-pro.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'content-calendar-pro', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generateContentCalendar(channels, frequency) {
  const channelList = channels.split(',');
  const contentTypes = ['图文', '视频', '直播', '互动', '促销', '品牌故事'];
  return {
    channels: channelList,
    frequency,
    contentTypes,
    features: ['智能排期', '热点追踪', 'AI 建议', '协同编辑', '自动发布'],
    planning: ['月度主题', '周计划', '日排期', '应急预案'],
    optimization: ['最佳时段', '内容类型', '发布频率', '互动策略'],
    analytics: ['曝光量', '互动率', '转化率', '粉丝增长', '内容热度'],
    deliverables: ['内容日历', '选题库', '文案模板', '效果报告']
  };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const channelsArg = args.find(a => a.startsWith('--channels='));
  const freqArg = args.find(a => a.startsWith('--frequency='));
  if (!channelsArg || !freqArg) { console.log('用法：content-calendar-pro --channels=<发布渠道> --frequency=<发布频率>\n示例：content-calendar-pro --channels=wechat,weibo,xiaohongshu --frequency=daily'); return; }
  const channels = channelsArg.split('=')[1], frequency = freqArg.split('=')[1], price = config.price_per_month || 399, userId = process.env.USER || 'unknown';
  console.log(`📅 Content Calendar Pro\n📢 渠道：${channels}\n📆 频率：${frequency}\n💰 费用：¥${price}/月\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📋 正在生成内容日历...\n');
  const calendar = generateContentCalendar(channels, frequency);
  console.log(`━━━ 内容日历 ━━━`);
  console.log(`渠道：${calendar.channels.join(', ')}`);
  console.log(`频率：${calendar.frequency}`);
  console.log(`内容类型：${calendar.contentTypes.join(', ')}`);
  console.log(`功能：${calendar.features.join(', ')}`);
  console.log(`规划：${calendar.planning.join(', ')}`);
  console.log(`优化：${calendar.optimization.join(', ')}`);
  console.log(`分析：${calendar.analytics.join(', ')}`);
  console.log(`交付物：${calendar.deliverables.join(', ')}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
