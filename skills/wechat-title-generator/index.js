#!/usr/bin/env node

/**
 * 公众号标题生成器 - 微信爆款标题
 * 定价：¥5/次 | ¥99/月
 */

// 10w+ 爆款标题模式
const VIRAL_PATTERNS = [
  '{年龄}+{感悟}，{建议}',
  '真正{形容词}的人，都{行为}',
  '那个{特征}的{人}，凭什么{结果}？',
  '写给所有{状态}的{人}',
  '{数字}+{主题}，{建议}',
  '{时间}过去了，我才明白{道理}',
  '{对比}：{A} 和{B} 的差距',
  '{问题}？{答案}'
];

// 情绪触发词
const EMOTION_WORDS = {
  悬念：['揭秘', '曝光', '真相', '背后', '竟然', '没想到'],
  共鸣：['扎心', '泪目', '破防', '真实', '懂了', '谁懂'],
  利益：['必备', '干货', '收藏', '有用', '价值', '提升'],
  故事：['那年', '曾经', '后来', '现在', '终于', '原来'],
  干货：['指南', '攻略', '方法', '技巧', '清单', '模板']
};

// 发布建议
const PUBLISH_TIPS = {
  职场： { time: '08:00-09:00', cover: '办公场景 + 大字' },
  情感： { time: '21:00-23:00', cover: '人物特写 + 暖色' },
  成长： { time: '07:00-08:00', cover: '励志图片 + 金句' },
  理财： { time: '20:00-21:00', cover: '数据图表 + 标题' },
  健康： { time: '06:00-07:00', cover: '清新图片 + 提示' },
  通用： { time: '21:00-22:00', cover: '高对比 + 大字' }
};

/**
 * 生成公众号标题
 */
async function generateTitles(content, style = '混合', count = 3) {
  const styles = style === '混合' 
    ? ['悬念', '共鸣', '利益', '故事', '干货']
    : [style];
  
  const titles = [];
  
  for (let i = 0; i < count; i++) {
    const currentStyle = styles[i % styles.length];
    const pattern = VIRAL_PATTERNS[i % VIRAL_PATTERNS.length];
    const words = EMOTION_WORDS[currentStyle];
    
    const title = generateFromPattern(pattern, content, words);
    const openRate = predictOpenRate(title, content);
    
    titles.push({
      text: title,
      style: currentStyle,
      openRate: openRate,
      score: calculateScore(title)
    });
  }
  
  titles.sort((a, b) => b.openRate - a.openRate);
  
  const category = detectCategory(content);
  const tips = PUBLISH_TIPS[category] || PUBLISH_TIPS.通用;
  
  return {
    recommended: titles[0],
    alternatives: titles.slice(1),
    coverSuggestion: tips.cover,
    publishTime: tips.time,
    summary: generateSummary(content),
    tags: generateTags(category)
  };
}

function generateFromPattern(pattern, content, words) {
  const word = words[Math.floor(Math.random() * words.length)];
  
  let title = pattern
    .replace('{年龄}', '30 岁')
    .replace('{感悟}', '才明白的道理')
    .replace('{建议}', '越早懂越好')
    .replace('{形容词}', '厉害')
    .replace('{行为}', '戒掉了这 5 个习惯')
    .replace('{特征}', '从不加班')
    .replace('{人}', '同事')
    .replace('{结果}', '升职最快')
    .replace('{状态}', '正在硬扛')
    .replace('{时间}', '5 年')
    .replace('{道理}', '这个道理')
    .replace('{对比}', '人与人之间的差距')
    .replace('{A}', '30 岁')
    .replace('{B}', '40 岁')
    .replace('{问题}', '为什么你总是存不下钱')
    .replace('{答案}', '答案在这里')
    .replace('{数字}', '5 个')
    .replace('{主题}', '理财习惯');
  
  // 公众号标题最佳长度：20-30 字
  if (title.length > 30) {
    title = title.substring(0, 27) + '...';
  }
  
  return title;
}

function predictOpenRate(title, content) {
  let baseRate = 5.0;
  
  if (/\d/.test(title)) baseRate += 2.0;
  if (/[？?]/.test(title)) baseRate += 1.5;
  if (title.length >= 15 && title.length <= 25) baseRate += 2.0;
  if (/[，,]/.test(title)) baseRate += 0.5;
  
  return Math.min(baseRate, 20.0);
}

function calculateScore(title) {
  let score = 70;
  if (title.length >= 15 && title.length <= 25) score += 15;
  if (/[？?!]/.test(title)) score += 10;
  if (/\d/.test(title)) score += 5;
  return Math.min(score, 100);
}

function detectCategory(content) {
  if (content.includes('职场') || content.includes('工作')) return '职场';
  if (content.includes('情感') || content.includes('爱情')) return '情感';
  if (content.includes('成长') || content.includes('学习')) return '成长';
  if (content.includes('理财') || content.includes('钱')) return '理财';
  if (content.includes('健康') || content.includes('身体')) return '健康';
  return '通用';
}

function generateSummary(content) {
  return content.substring(0, 54) + '...';
}

function generateTags(category) {
  const tagMap = {
    职场： ['#职场', '#成长', '#工作', '#升职'],
    情感： ['#情感', '#爱情', '#婚姻', '#家庭'],
    成长： ['#成长', '#学习', '#自律', '#人生'],
    理财： ['#理财', '#赚钱', '#投资', '#财务'],
    健康： ['#健康', '#养生', '#运动', '#生活'],
    通用： ['#热门', '#推荐', '#干货', '#分享']
  };
  return tagMap[category] || tagMap.通用;
}

function formatOutput(result) {
  let output = `## 📱 公众号爆款标题方案\n\n`;
  output += `### 🏆 推荐标题（打开率预测：${result.recommended.openRate}%）\n`;
  output += `"${result.recommended.text}"\n\n`;
  output += `风格：${result.recommended.style} | 评分：${result.recommended.score}/100\n\n`;
  
  output += `### 📋 备选方案\n`;
  result.alternatives.forEach((alt, i) => {
    output += `${i + 1}. "${alt.text}" (打开率：${alt.openRate}%, 风格：${alt.style})\n`;
  });
  
  output += `\n### 🎨 封面建议\n`;
  output += `- 类型：${result.coverSuggestion}\n`;
  
  output += `\n### 📊 发布建议\n`;
  output += `- 最佳时间：${result.publishTime}\n`;
  output += `- 摘要：${result.summary}\n`;
  output += `- 话题标签：${result.tags.join(' ')}\n`;
  
  return output;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('用法：wechat-title "内容描述" [--style 风格] [--count 数量]');
    console.log('风格：悬念 | 共鸣 | 利益 | 故事 | 干货 | 混合');
    process.exit(1);
  }
  
  const content = args.find(arg => !arg.startsWith('--'));
  const styleIndex = args.indexOf('--style');
  const countIndex = args.indexOf('--count');
  
  const style = styleIndex > -1 ? args[styleIndex + 1] : '混合';
  const count = countIndex > -1 ? parseInt(args[countIndex + 1]) : 3;
  
  console.log('正在生成公众号爆款标题...\n');
  
  const result = await generateTitles(content.replace(/"/g, ''), style, count);
  console.log(formatOutput(result));
}

module.exports = { generateTitles, formatOutput };

if (require.main === module) {
  main().catch(console.error);
}
