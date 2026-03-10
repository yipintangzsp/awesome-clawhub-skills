#!/usr/bin/env node
/** 表情包文案制作 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/meme-caption-maker.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'meme-caption-maker', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function meme_caption_maker(scenario = '上班') {
  const captions = {
    上班：['周一的我', '下班前 5 分钟', '老板说加班', '工资到账瞬间'],
    学习：['考试前的我', '看到成绩时', '开学第一天', '写作业时'],
    生活：['减肥时的我', '月底的我', '起床时的我', '看到美食时'],
    社交：['群聊时的我', '被@时', '发朋友圈后', '收到消息时']
  };
  const c = captions[scenario] || captions.上班;
  const templates = c.map(t => ({ top: t, bottom: '太真实了' }));
  return { success: true, scenario, captions: c, templates, count: c.length };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：meme-caption-maker [选项]
功能：表情包文案制作
价格：¥2/次

选项:
  --help       显示帮助信息
  --scenario   场景 (上班/学习/生活/社交，默认 上班)

示例:
  meme-caption-maker --scenario 学习
`);
    return;
  }
  
  const price = config.price_per_call || 2, userId = process.env.USER || 'unknown';
  const scenario = args.find(a => a.startsWith('--scenario='))?.split('=')[1] || '上班';
  
  console.log(`😂 表情包文案制作\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在创作...\n');
  const result = meme_caption_maker(scenario);
  
  console.log('━━━ 表情包文案 ━━━');
  console.log(`🎭 场景：${result.scenario} | 数量：${result.count}个\n`);
  result.templates.forEach((t, i) => console.log(`${i + 1}. 上：${t.top} | 下：${t.bottom}`));
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
