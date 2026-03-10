#!/usr/bin/env node
/** 睡眠追踪 AI **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/sleep-tracker-ai.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'sleep-tracker-ai', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function sleep_tracker_ai(hours = 7, quality = 'good') {
  const analysis = {
    excellent: { score: 90, tip: '睡眠质量极佳，继续保持！' },
    good: { score: 75, tip: '睡眠良好，注意规律作息' },
    fair: { score: 60, tip: '睡眠质量一般，建议改善环境' },
    poor: { score: 40, tip: '睡眠质量较差，建议就医咨询' }
  };
  const recHours = hours >= 7 && hours <= 9;
  const a = analysis[quality] || analysis.good;
  return {
    success: true, hours, quality, score: recHours ? a.score : a.score - 10,
    tip: a.tip, recommendation: recHours ? '睡眠时长合适' : `建议睡${7.5}小时`
  };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：sleep-tracker-ai [选项]
功能：睡眠追踪 AI
价格：¥2/次

选项:
  --help     显示帮助信息
  --hours    睡眠时长 (默认 7)
  --quality  睡眠质量 (excellent/good/fair/poor, 默认 good)

示例:
  sleep-tracker-ai --hours 8 --quality excellent
`);
    return;
  }
  
  const price = config.price_per_call || 2, userId = process.env.USER || 'unknown';
  const hours = parseFloat(args.find(a => a.startsWith('--hours='))?.split('=')[1]) || 7;
  const quality = args.find(a => a.startsWith('--quality='))?.split('=')[1] || 'good';
  
  console.log(`😴 睡眠追踪 AI\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在分析...');
  const result = sleep_tracker_ai(hours, quality);
  
  console.log('\n━━━ 睡眠分析 ━━━');
  console.log(`⏱️ 时长：${result.hours}小时`);
  console.log(`⭐ 质量：${result.quality}`);
  console.log(`📊 评分：${result.score}/100`);
  console.log(`💡 建议：${result.tip}`);
  console.log(`📝 ${result.recommendation}`);
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
