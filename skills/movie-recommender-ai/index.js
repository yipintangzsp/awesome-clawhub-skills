#!/usr/bin/env node
/** 电影推荐 AI **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/movie-recommender-ai.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'movie-recommender-ai', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function movie_recommender_ai(genre = '喜剧', mood = '轻松') {
  const movies = {
    喜剧：[{ title: '夏洛特烦恼', year: 2015, rating: 7.8 }, { title: '西虹市首富', year: 2018, rating: 6.9 }, { title: '你好，李焕英', year: 2021, rating: 7.7 }],
    动作：[{ title: '战狼 2', year: 2017, rating: 7.1 }, { title: '流浪地球', year: 2019, rating: 7.9 }, { title: '长津湖', year: 2021, rating: 7.4 }],
    爱情：[{ title: '泰坦尼克号', year: 1997, rating: 9.4 }, { title: '你的婚礼', year: 2021, rating: 5.9 }, { title: '我要我们在一起', year: 2021, rating: 5.9 }],
    科幻：[{ title: '星际穿越', year: 2014, rating: 9.3 }, { title: '盗梦空间', year: 2010, rating: 9.3 }, { title: '三体', year: 2023, rating: 8.5 }]
  };
  const m = movies[genre] || movies.喜剧;
  return { success: true, genre, mood, movies: m, count: m.length };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：movie-recommender-ai [选项]
功能：电影推荐 AI
价格：¥3/次

选项:
  --help     显示帮助信息
  --genre    类型 (喜剧/动作/爱情/科幻，默认 喜剧)
  --mood     心情 (默认 轻松)

示例:
  movie-recommender-ai --genre 科幻 --mood 烧脑
`);
    return;
  }
  
  const price = config.price_per_call || 3, userId = process.env.USER || 'unknown';
  const genre = args.find(a => a.startsWith('--genre='))?.split('=')[1] || '喜剧';
  const mood = args.find(a => a.startsWith('--mood='))?.split('=')[1] || '轻松';
  
  console.log(`🎬 电影推荐 AI\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在推荐...\n');
  const result = movie_recommender_ai(genre, mood);
  
  console.log('━━━ 电影推荐 ━━━');
  console.log(`🎭 类型：${result.genre} | 心情：${result.mood}\n`);
  result.movies.forEach((m, i) => console.log(`${i + 1}. 《${m.title}》(${m.year}) ⭐${m.rating}`));
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
