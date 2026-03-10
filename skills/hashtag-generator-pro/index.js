#!/usr/bin/env node
/** 标签生成专业版 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/hashtag-generator-pro.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'hashtag-generator-pro', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function hashtag_generator_pro(topic = '生活', platform = 'xiaohongshu') {
  const tags = {
    xiaohongshu: ['#小红书', '#分享', '#日常', '#生活记录', '#好物分享', '#种草', '#测评', '#推荐'],
    weibo: ['#微博', '#热门', '#话题', '#分享', '#日常', '#生活', '#记录', '#随手拍'],
    douyin: ['#抖音', '#热门', '#推荐', '#流量', '#短视频', '#创作', '#分享', '#记录'],
    instagram: ['#instagram', '#photo', '#daily', '#life', '#share', '#moments', '#love', '#happy']
  };
  const base = tags[platform] || tags.xiaohongshu;
  const custom = [`#${topic}`, `#${topic}分享`, `#${topic}日常`];
  return { success: true, topic, platform, hashtags: [...custom, ...base], count: custom.length + base.length };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：hashtag-generator-pro [选项]
功能：标签生成专业版
价格：¥2/次

选项:
  --help      显示帮助信息
  --topic     主题 (默认 生活)
  --platform  平台 (xiaohongshu/weibo/douyin/instagram, 默认 xiaohongshu)

示例:
  hashtag-generator-pro --topic 美食 --platform douyin
`);
    return;
  }
  
  const price = config.price_per_call || 2, userId = process.env.USER || 'unknown';
  const topic = args.find(a => a.startsWith('--topic='))?.split('=')[1] || '生活';
  const platform = args.find(a => a.startsWith('--platform='))?.split('=')[1] || 'xiaohongshu';
  
  console.log(`# 标签生成专业版\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在生成...\n');
  const result = hashtag_generator_pro(topic, platform);
  
  console.log('━━━ 标签列表 ━━━');
  console.log(`📱 平台：${result.platform} | 主题：${result.topic}`);
  console.log(`📊 数量：${result.count}个\n`);
  console.log(result.hashtags.join(' '));
  console.log('\n\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
