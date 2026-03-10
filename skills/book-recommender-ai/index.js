#!/usr/bin/env node
/** 书籍推荐 AI **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/book-recommender-ai.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'book-recommender-ai', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function book_recommender_ai(genre = '小说', level = '入门') {
  const books = {
    小说：[{ title: '活着', author: '余华', rating: 9.3 }, { title: '百年孤独', author: '马尔克斯', rating: 9.2 }, { title: '追风筝的人', author: '胡赛尼', rating: 8.9 }],
    成长：[{ title: '被讨厌的勇气', author: '岸见一郎', rating: 8.6 }, { title: '蛤蟆先生去看心理医生', author: '戴博德', rating: 8.5 }],
    商业：[{ title: '穷查理宝典', author: '查理·芒格', rating: 8.9 }, { title: '原则', author: '瑞·达利欧', rating: 8.3 }],
    历史：[{ title: '明朝那些事儿', author: '当年明月', rating: 9.1 }, { title: '人类简史', author: '赫拉利', rating: 9.0 }]
  };
  const b = books[genre] || books.小说;
  return { success: true, genre, level, books: b, count: b.length };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：book-recommender-ai [选项]
功能：书籍推荐 AI
价格：¥3/次

选项:
  --help     显示帮助信息
  --genre    类型 (小说/成长/商业/历史，默认 小说)
  --level    水平 (入门/进阶，默认 入门)

示例:
  book-recommender-ai --genre 商业 --level 进阶
`);
    return;
  }
  
  const price = config.price_per_call || 3, userId = process.env.USER || 'unknown';
  const genre = args.find(a => a.startsWith('--genre='))?.split('=')[1] || '小说';
  const level = args.find(a => a.startsWith('--level='))?.split('=')[1] || '入门';
  
  console.log(`📚 书籍推荐 AI\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在推荐...\n');
  const result = book_recommender_ai(genre, level);
  
  console.log('━━━ 书籍推荐 ━━━');
  console.log(`📖 类型：${result.genre} | 水平：${result.level}\n`);
  result.books.forEach((b, i) => console.log(`${i + 1}. 《${b.title}》- ${b.author} ⭐${b.rating}`));
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
