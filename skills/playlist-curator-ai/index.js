#!/usr/bin/env node
/** 歌单策划 AI **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/playlist-curator-ai.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'playlist-curator-ai', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function playlist_curator_ai(mood = 'happy', genre = 'pop') {
  const playlists = {
    happy: { pop: ['阳光彩虹小白马', '今天你要嫁给我', '小幸运'], rock: ['我相信', '倔强', '海阔天空'] },
    sad: { pop: ['后来', '成全', '说散就散'], rock: ['海阔天空', '光辉岁月', '不再犹豫'] },
    relax: { pop: ['稻香', '简单爱', '晴天'], rock: ['平凡之路', '蓝莲花', '曾经的你'] },
    energy: { pop: ['最炫民族风', '小苹果', '卡路里'], rock: ['追梦赤子心', '夜空中最亮的星'] }
  };
  const p = playlists[mood]?.[genre] || ['稻香', '小幸运', '晴天'];
  return { success: true, mood, genre, songs: p, count: p.length, duration: p.length * 4 };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：playlist-curator-ai [选项]
功能：歌单策划 AI
价格：¥3/次

选项:
  --help     显示帮助信息
  --mood     心情 (happy/sad/relax/energy, 默认 happy)
  --genre    风格 (pop/rock, 默认 pop)

示例:
  playlist-curator-ai --mood energy --genre rock
`);
    return;
  }
  
  const price = config.price_per_call || 3, userId = process.env.USER || 'unknown';
  const mood = args.find(a => a.startsWith('--mood='))?.split('=')[1] || 'happy';
  const genre = args.find(a => a.startsWith('--genre='))?.split('=')[1] || 'pop';
  
  console.log(`🎵 歌单策划 AI\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在策划...\n');
  const result = playlist_curator_ai(mood, genre);
  
  console.log('━━━ 推荐歌单 ━━━');
  console.log(`😊 心情：${result.mood} | 风格：${result.genre}`);
  console.log(`⏱️ 时长：约${result.duration}分钟\n`);
  result.songs.forEach((s, i) => console.log(`${i + 1}. ${s}`));
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
