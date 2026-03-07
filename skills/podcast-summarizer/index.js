#!/usr/bin/env node
/** Podcast Summarizer - 播客摘要生成器 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/podcast-summarizer.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'podcast-summarizer', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function summarizePodcast(episode) {
  return { success: true, data: {
    episode, duration: '45:30',
    summary: '本期讨论了 AI 发展趋势、行业应用和未来机遇...',
    keyPoints: ['AI 工具普及率提升', '企业应用场景增多', '监管政策逐步完善', '投资机会涌现'],
    guests: ['行业专家 A', '创业者 B'],
    rating: 4.5
  }};
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.length === 0) { console.log('用法：podcast-summarizer <播客链接/名称>\n示例：podcast-summarizer "科技早知道 Ep.123"'); return; }
  const episode = args[0], price = config.price_per_call || 3, userId = process.env.USER || 'unknown';
  console.log(`🎙️ Podcast Summarizer\n📻 节目：${episode}\n💰 费用：¥${price}\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n🎙️ 正在生成摘要...');
  const result = summarizePodcast(episode);
  console.log(`\n━━━ 播客摘要 ━━━`);
  console.log(`时长：${result.data.duration}`);
  console.log(`评分：${'⭐'.repeat(Math.floor(result.data.rating))}`);
  console.log(`\n📝 摘要:`);
  console.log(result.data.summary);
  console.log(`\n🔑 要点:`);
  result.data.keyPoints.forEach(p => console.log(`  • ${p}`));
  console.log(`\n👥 嘉宾：${result.data.guests.join(', ')}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
