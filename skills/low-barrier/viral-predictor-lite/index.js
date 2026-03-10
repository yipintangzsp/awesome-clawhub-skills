#!/usr/bin/env node
/** 爆款预测精简版 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/viral-predictor-lite.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'viral-predictor-lite', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function viral_predictor_lite(title = '', tags = 5) {
  const factors = [
    { name: '标题吸引力', score: title.length > 10 && title.length < 30 ? 8 : 5 },
    { name: '话题热度', score: 7 },
    { name: '发布时间', score: 8 },
    { name: '标签数量', score: tags >= 5 && tags <= 10 ? 9 : 6 },
    { name: '内容质量', score: 7 }
  ];
  const total = factors.reduce((s, f) => s + f.score, 0);
  const avg = Math.round(total / factors.length);
  const prediction = avg >= 8 ? '🔥 爆款潜力高' : avg >= 6 ? '📈 有潜力' : '📊 需优化';
  return { success: true, factors, total, avg, prediction, suggestions: ['优化标题', '增加互动', '选择高峰时间'] };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：viral-predictor-lite [选项]
功能：爆款预测精简版
价格：¥5/次

选项:
  --help     显示帮助信息
  --title    标题
  --tags     标签数量 (默认 5)

示例:
  viral-predictor-lite --title "我的创业故事" --tags 8
`);
    return;
  }
  
  const price = config.price_per_call || 5, userId = process.env.USER || 'unknown';
  const title = args.find(a => a.startsWith('--title='))?.split('=')[1] || '';
  const tags = parseInt(args.find(a => a.startsWith('--tags='))?.split('=')[1]) || 5;
  
  console.log(`🔥 爆款预测精简版\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在分析...\n');
  const result = viral_predictor_lite(title, tags);
  
  console.log('━━━ 爆款分析 ━━━');
  console.log(`📊 综合评分：${result.avg}/10`);
  console.log(`🔮 预测：${result.prediction}\n`);
  console.log('维度分析:');
  result.factors.forEach(f => console.log(`  ${f.name}: ${f.score}/10`));
  console.log(`\n💡 建议：${result.suggestions.join(' | ')}`);
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
