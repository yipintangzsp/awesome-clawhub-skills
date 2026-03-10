#!/usr/bin/env node
/** 评论回复 AI **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/comment-reply-ai.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'comment-reply-ai', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function comment_reply_ai(commentType = 'praise', style = 'friendly') {
  const replies = {
    praise: {
      friendly: ['谢谢喜欢～', '开心对你有帮助！', '比心❤️'],
      professional: ['感谢认可', '会继续输出优质内容', '感谢支持'],
      funny: ['被你发现了哈哈', '低调低调～', '膨胀了膨胀了']
    },
    question: {
      friendly: ['好问题！...', '让我想想...', '这个嘛...'],
      professional: ['详细来说...', '从专业角度...', '建议是...'],
      funny: ['你难倒我了', '这个问题价值连城', '让我查查字典']
    },
    negative: {
      friendly: ['理解你的感受', '感谢反馈', '会改进的'],
      professional: ['感谢建议', '会认真考虑', '欢迎私聊交流'],
      funny: ['扎心了老铁', '我错了还不行吗', '求放过～']
    }
  };
  const r = replies[commentType]?.[style] || ['谢谢评论', '感谢互动', '欢迎交流'];
  return { success: true, commentType, style, replies: r, count: r.length };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：comment-reply-ai [选项]
功能：评论回复 AI
价格：¥2/次

选项:
  --help       显示帮助信息
  --type       评论类型 (praise/question/negative, 默认 praise)
  --style      回复风格 (friendly/professional/funny, 默认 friendly)

示例:
  comment-reply-ai --type question --style professional
`);
    return;
  }
  
  const price = config.price_per_call || 2, userId = process.env.USER || 'unknown';
  const type = args.find(a => a.startsWith('--type='))?.split('=')[1] || 'praise';
  const style = args.find(a => a.startsWith('--style='))?.split('=')[1] || 'friendly';
  
  console.log(`💬 评论回复 AI\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在生成...\n');
  const result = comment_reply_ai(type, style);
  
  console.log('━━━ 回复建议 ━━━');
  console.log(`📝 类型：${result.commentType} | 风格：${result.style}\n`);
  result.replies.forEach((r, i) => console.log(`${i + 1}. ${r}`));
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
