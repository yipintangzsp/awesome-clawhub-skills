#!/usr/bin/env node
/** 技能路线图 AI **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/skill-roadmap-ai.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'skill-roadmap-ai', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function skill_roadmap_ai(skill = '编程', duration = '6 个月') {
  const roadmaps = {
    编程：['基础语法', '数据结构', '算法', '项目实战', '进阶框架'],
    设计：['设计原理', '软件工具', '临摹练习', '原创设计', '作品集'],
    写作：['基础写作', '文体练习', '素材积累', '修改润色', '投稿发表'],
    外语：['词汇积累', '语法学习', '听力训练', '口语练习', '实战应用']
  };
  const r = roadmaps[skill] || ['入门', '基础', '进阶', '实战', '精通'];
  const timeline = r.map((s, i) => ({ stage: i + 1, skill: s, duration: `${Math.round(6 / r.length)}个月` }));
  return { success: true, skill, duration, roadmap: r, timeline };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：skill-roadmap-ai [选项]
功能：技能路线图 AI
价格：¥8/次

选项:
  --help     显示帮助信息
  --skill    技能 (编程/设计/写作/外语，默认 编程)
  --duration 时长 (默认 6 个月)

示例:
  skill-roadmap-ai --skill 设计 --duration 12 个月
`);
    return;
  }
  
  const price = config.price_per_call || 8, userId = process.env.USER || 'unknown';
  const skill = args.find(a => a.startsWith('--skill='))?.split('=')[1] || '编程';
  const duration = args.find(a => a.startsWith('--duration='))?.split('=')[1] || '6 个月';
  
  console.log(`🗺️ 技能路线图 AI\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在规划...\n');
  const result = skill_roadmap_ai(skill, duration);
  
  console.log('━━━ 学习路线 ━━━');
  console.log(`🎯 技能：${result.skill} | 时长：${result.duration}\n`);
  result.timeline.forEach(t => console.log(`阶段${t.stage}: ${t.skill} (${t.duration})`));
  console.log('\n💡 建议：坚持练习，及时复盘');
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
