#!/usr/bin/env node
/** LinkedIn Post Generator - 专业帖子生成器 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/linkedin-post-generator.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const price = config.price_per_call || 5;
  const topic = args.join(' ') || 'career growth';
  
  console.log('💼 LinkedIn Post Generator');
  console.log('💰 费用：¥' + price);
  console.log('🎯 生成专业帖子和文案\n');
  console.log('🧪 测试模式：跳过收费\n');
  
  const hooks = [
    'I learned this the hard way...',
    'Unpopular opinion about ' + topic + '...',
    'After 10 years in the industry...',
    'The truth about ' + topic + ' nobody talks about',
    '3 lessons from my ' + topic + ' journey'
  ];
  
  const structure = `Hook (1-2 行) - 吸引注意
Story/Insight (3-5 行) - 分享经历
Key Takeaway (2-3 行) - 核心观点
CTA (1 行) - 引导互动`;
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💼 LinkedIn 帖子方案');
  console.log('━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('【主题】' + topic + '\n');
  
  console.log('【Hook 建议】');
  hooks.forEach((h, i) => console.log(`${i+1}. ${h}`));
  console.log();
  
  console.log('【帖子结构】');
  console.log(structure + '\n');
  
  console.log('💡 发布建议：周二 - 周四早 8 点');
  console.log('━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
