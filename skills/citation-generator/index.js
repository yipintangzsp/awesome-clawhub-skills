#!/usr/bin/env node
/** 引用格式生成 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/citation-generator.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'citation-generator', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function citation_generator(type = 'APA', title = '示例文章', author = '张三', year = 2024) {
  const formats = {
    APA: `${author} (${year}). ${title}. Journal Name, 1(1), 1-10.`,
    MLA: `${author}. "${title}." Journal Name, vol. 1, no. 1, ${year}, pp. 1-10.`,
    Chicago: `${author}. "${title}." Journal Name 1, no. 1 (${year}): 1-10.`,
    GB: `${author}. ${title}[J]. 期刊名，${year}, 1(1): 1-10.`
  };
  const f = formats[type] || formats.APA;
  return { success: true, type, title, author, year, citation: f };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：citation-generator [选项]
功能：引用格式生成
价格：¥3/次

选项:
  --help     显示帮助信息
  --type     格式 (APA/MLA/Chicago/GB, 默认 APA)
  --title    标题
  --author   作者
  --year     年份

示例:
  citation-generator --type MLA --title "AI 研究" --author 李四 --year 2023
`);
    return;
  }
  
  const price = config.price_per_call || 3, userId = process.env.USER || 'unknown';
  const type = args.find(a => a.startsWith('--type='))?.split('=')[1] || 'APA';
  const title = args.find(a => a.startsWith('--title='))?.split('=')[1] || '示例文章';
  const author = args.find(a => a.startsWith('--author='))?.split('=')[1] || '张三';
  const year = args.find(a => a.startsWith('--year='))?.split('=')[1] || 2024;
  
  console.log(`📚 引用格式生成\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在生成...\n');
  const result = citation_generator(type, title, author, parseInt(year));
  
  console.log('━━━ 引用格式 ━━━');
  console.log(`📝 格式：${result.type}`);
  console.log(`\n${result.citation}`);
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
