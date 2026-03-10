#!/usr/bin/env node
/** International CS Bot - 国际客服机器人 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/international-cs-bot.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'international-cs-bot', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generateCSBot(languages, channels) {
  const langList = languages.split(',');
  const channelList = channels.split(',');
  return {
    languages: langList,
    channels: channelList,
    features: ['智能问答', '订单查询', '退货处理', '多轮对话', '情感识别'],
    integrations: ['Shopify', 'WooCommerce', 'Magento', 'Zendesk', 'Intercom'],
    automation: ['自动回复率 80%+', '平均响应<1 秒', '满意度评分', '工单自动生成'],
    analytics: ['会话量统计', '问题解决率', '客户满意度', '热点问题分析'],
    support: ['英语', '中文', '日语', '韩语', '德语', '法语', '西班牙语']
  };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const languagesArg = args.find(a => a.startsWith('--languages='));
  const channelsArg = args.find(a => a.startsWith('--channels='));
  if (!languagesArg || !channelsArg) { console.log('用法：international-cs-bot --languages=<支持语言> --channels=<客服渠道>\n示例：international-cs-bot --languages=en,zh,ja --channels=webchat,email,whatsapp'); return; }
  const languages = languagesArg.split('=')[1], channels = channelsArg.split('=')[1], price = config.price_per_month || 499, userId = process.env.USER || 'unknown';
  console.log(`🤖 International CS Bot\n🌍 语言：${languages}\n📞 渠道：${channels}\n💰 费用：¥${price}/月\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n📋 正在生成客服方案...\n');
  const csbot = generateCSBot(languages, channels);
  console.log(`━━━ 客服方案 ━━━`);
  console.log(`支持语言：${csbot.languages.join(', ')}`);
  console.log(`客服渠道：${csbot.channels.join(', ')}`);
  console.log(`功能：${csbot.features.join(', ')}`);
  console.log(`集成：${csbot.integrations.join(', ')}`);
  console.log(`自动化：${csbot.automation.join(', ')}`);
  console.log(`分析：${csbot.analytics.join(', ')}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
