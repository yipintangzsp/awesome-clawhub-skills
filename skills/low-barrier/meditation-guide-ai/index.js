#!/usr/bin/env node
/** 冥想引导 AI **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/meditation-guide-ai.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'meditation-guide-ai', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function meditation_guide_ai(duration = 10, focus = 'breath') {
  const guides = {
    breath: { title: '呼吸冥想', steps: ['闭眼放松', '深吸气 4 秒', '屏息 4 秒', '缓慢呼气 6 秒', '重复循环'] },
    body: { title: '身体扫描', steps: ['从脚趾开始', '感受每个部位', '释放紧张', '向上移动', '到达头顶'] },
    mind: { title: '正念冥想', steps: ['观察思绪', '不评判', '回到当下', '感受呼吸', '保持觉察'] },
    sleep: { title: '睡眠冥想', steps: ['放松身体', '想象宁静场景', '缓慢呼吸', '放下思绪', '进入梦乡'] }
  };
  const g = guides[focus] || guides.breath;
  return { success: true, duration, focus, ...g, cycles: Math.round(duration / 2) };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：meditation-guide-ai [选项]
功能：冥想引导 AI
价格：¥3/次

选项:
  --help     显示帮助信息
  --duration 时长 (分钟，默认 10)
  --focus    焦点 (breath/body/mind/sleep, 默认 breath)

示例:
  meditation-guide-ai --duration 15 --focus body
`);
    return;
  }
  
  const price = config.price_per_call || 3, userId = process.env.USER || 'unknown';
  const duration = parseInt(args.find(a => a.startsWith('--duration='))?.split('=')[1]) || 10;
  const focus = args.find(a => a.startsWith('--focus='))?.split('=')[1] || 'breath';
  
  console.log(`🧘 冥想引导 AI\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在准备引导...\n');
  const result = meditation_guide_ai(duration, focus);
  
  console.log('━━━ 冥想引导 ━━━');
  console.log(`📋 类型：${result.title}`);
  console.log(`⏱️ 时长：${result.duration}分钟`);
  console.log(`🔄 循环：${result.cycles}次`);
  console.log('\n步骤:');
  result.steps.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
