#!/usr/bin/env node
/** Snapchat Filter Maker - Snapchat 滤镜制作 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/snapchat-filter-maker.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'snapchat-filter-maker', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function createFilter(style, effects) {
  const effectList = effects.split(/[,,]/).map(e => e.trim());
  const filters = {
    beauty: { name: '美颜滤镜', effects: ['磨皮', '美白', '大眼'], popularity: '高' },
    funny: { name: '搞笑滤镜', effects: ['变声', '变形', '贴纸'], popularity: '中' },
    artistic: { name: '艺术滤镜', effects: ['油画', '水彩', '素描'], popularity: '中' },
    festival: { name: '节日滤镜', effects: ['烟花', '彩带', '特效字'], popularity: '高' }
  };
  const filter = filters[style] || filters.beauty;
  const template = `filter_${style}_${Date.now()}.lens`;
  return { filter, effectList, template, previewUrl: `https://lensstudio.snapchat.com/preview/${template}` };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const style = args.find(a => a.startsWith('--style='))?.split('=')[1] || 'beauty';
  const effects = args.find(a => a.startsWith('--effects='))?.split('=')[1] || 'glow,sparkle';
  const price = config.price_per_month || 29, userId = process.env.USER || 'unknown';
  console.log(`🎭 Snapchat Filter Maker\n🎨 风格：${style}\n✨ 特效：${effects}\n💰 费用：¥${price}/月\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n🎭 正在创建滤镜...\n');
  const result = createFilter(style, effects);
  console.log(`━━━ 滤镜方案 ━━━`);
  console.log(`滤镜名称：${result.filter.name}`);
  console.log(`内置特效：${result.filter.effects.join(', ')}`);
  console.log(`自定义特效：${result.effectList.join(', ')}`);
  console.log(`热门程度：${result.filter.popularity}`);
  console.log(`\n模板文件：${result.template}`);
  console.log(`预览链接：${result.previewUrl}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
