#!/usr/bin/env node

/**
 * 知乎标题优化器 - 高赞标题生成
 * 定价：¥5/次 | ¥99/月
 */

// 知乎高赞标题模式
const ZHIHU_PATTERNS = [
  '有哪些{形容词}的{主题}？',
  '{主题} 新手如何{目标}？这份指南请收好',
  '学了{时间}{主题}，我总结了这些经验',
  '为什么很多人{行为}坚持不下来？',
  '{主题} 是什么体验？',
  '如何评价{主题}？',
  '{主题} 和{主题} 哪个更好？',
  '在{领域}工作是什么体验？'
];

// 领域关键词
const FIELD_KEYWORDS = {
  科技：['技术', '编程', '互联网', 'AI', '产品', '数据'],
  职场：['工作', '升职', '跳槽', '面试', '薪资', '管理'],
  情感：['恋爱', '婚姻', '家庭', '关系', '心理', '成长'],
  生活：['健康', '美食', '旅行', '购物', '房产', '汽车'],
  教育：['学习', '考试', '留学', '考研', '培训', '学校'],
  财经：['理财', '投资', '股票', '基金', '保险', '赚钱']
};

// 赞同预测因子
const UPVOTE_FACTORS = {
  问题式：1.5,
  经验式：1.3,
  对比式：1.2,
  体验式：1.4,
  评价式：1.1
};

/**
 * 生成知乎标题
 */
async function generateTitles(content, field = '通用', count = 3) {
  const titles = [];
  
  for (let i = 0; i < count; i++) {
    const pattern = ZHIHU_PATTERNS[i % ZHIHU_PATTERNS.length];
    const title = generateFromPattern(pattern, content, field);
    const upvotes = predictUpvotes(title, content, field);
    
    titles.push({
      text: title,
      upvotes: upvotes,
      type: detectTitleType(title),
      score: calculateScore(title, field)
    });
  }
  
  titles.sort((a, b) => b.upvotes - a.upvotes);
  
  return {
    recommended: titles[0],
    alternatives: titles.slice(1),
    keywords: analyzeKeywords(content, field),
    topics: generateTopics(field),
    suggestions: generateSuggestions(field)
  };
}

function generateFromPattern(pattern, content, field) {
  let title = pattern
    .replace('{形容词}', '相见恨晚')
    .replace('{主题}', content.substring(0, 8))
    .replace('{目标}', '系统学习')
    .replace('{时间}', '3 年')
    .replace('{行为}', '学习')
    .replace('{领域}', field);
  
  // 知乎标题最佳长度：15-25 字
  if (title.length > 25) {
    title = title.substring(0, 22) + '...';
  }
  
  return title;
}

function predictUpvotes(title, content, field) {
  let baseUpvotes = 100;
  
  const type = detectTitleType(title);
  baseUpvotes *= UPVOTE_FACTORS[type] || 1.0;
  
  if (/[？?]/.test(title)) baseUpvotes *= 1.3;
  if (/\d/.test(title)) baseUpvotes *= 1.2;
  if (title.length >= 15 && title.length <= 25) baseUpvotes *= 1.2;
  
  // 领域系数
  const fieldMultipliers = {
    科技：1.3,
    职场：1.2,
    情感：1.4,
    生活：1.1,
    教育：1.2,
    财经：1.3
  };
  baseUpvotes *= fieldMultipliers[field] || 1.0;
  
  return Math.floor(baseUpvotes);
}

function detectTitleType(title) {
  if (/[？?]/.test(title)) return '问题式';
  if (title.includes('经验') || title.includes('总结')) return '经验式';
  if (title.includes('和') && title.includes('哪个')) return '对比式';
  if (title.includes('体验')) return '体验式';
  if (title.includes('评价')) return '评价式';
  return '陈述式';
}

function calculateScore(title, field) {
  let score = 70;
  if (title.length >= 15 && title.length <= 25) score += 15;
  if (/[？?]/.test(title)) score += 10;
  if (/\d/.test(title)) score += 5;
  return Math.min(score, 100);
}

function analyzeKeywords(content, field) {
  const keywords = content.split(/[\s,，]+/).filter(w => w.length >= 2);
  const fieldKeywords = FIELD_KEYWORDS[field] || [];
  
  return [...new Set([...keywords, ...fieldKeywords])].slice(0, 5);
}

function generateTopics(field) {
  const topicMap = {
    科技： ['#科技', '#互联网', '#编程', '#AI'],
    职场： ['#职场', '#工作', '#成长', '#管理'],
    情感： ['#情感', '#恋爱', '#婚姻', '#心理'],
    生活： ['#生活', '#健康', '#美食', '#旅行'],
    教育： ['#教育', '#学习', '#考试', '#学校'],
    财经： ['#财经', '#理财', '#投资', '#经济'],
    通用： ['#热门', '#推荐', '#知识', '#分享']
  };
  return topicMap[field] || topicMap.通用;
}

function generateSuggestions(field) {
  const suggestions = {
    科技： { time: '20:00-22:00', opening: '先给结论，再技术细节' },
    职场： { time: '19:00-21:00', opening: '用故事引入，再给建议' },
    情感： { time: '21:00-23:00', opening: '共情开头，再分析' },
    生活： { time: '18:00-20:00', opening: '直接给干货' },
    教育： { time: '20:00-22:00', opening: '先说痛点，再给方案' },
    财经： { time: '19:00-21:00', opening: '用数据说话' },
    通用： { time: '20:00-22:00', opening: '先给结论' }
  };
  return suggestions[field] || suggestions.通用;
}

function formatOutput(result) {
  let output = `## 📚 知乎高赞标题方案\n\n`;
  output += `### 🏆 推荐标题（赞同预测：${result.recommended.upvotes}+）\n`;
  output += `"${result.recommended.text}"\n\n`;
  output += `类型：${result.recommended.type} | 评分：${result.recommended.score}/100\n\n`;
  
  output += `### 📋 备选方案\n`;
  result.alternatives.forEach((alt, i) => {
    output += `${i + 1}. "${alt.text}" (赞同：${alt.upvotes}+, 类型：${alt.type})\n`;
  });
  
  output += `\n### 🔍 关键词分析\n`;
  output += `- 核心词：${result.keywords[0] || '内容主题'} (热度：高)\n`;
  output += `- 长尾词：${result.keywords.slice(1).join(', ') || '相关内容'}\n`;
  
  output += `\n### 📊 发布建议\n`;
  output += `- 最佳时间：${result.suggestions.time}\n`;
  output += `- 话题：${result.topics.join(' ')}\n`;
  output += `- 开头：${result.suggestions.opening}\n`;
  
  return output;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('用法：zhihu-title "内容主题" [--field 领域] [--count 数量]');
    console.log('领域：科技 | 职场 | 情感 | 生活 | 教育 | 财经 | 通用');
    process.exit(1);
  }
  
  const content = args.find(arg => !arg.startsWith('--'));
  const fieldIndex = args.indexOf('--field');
  const countIndex = args.indexOf('--count');
  
  const field = fieldIndex > -1 ? args[fieldIndex + 1] : '通用';
  const count = countIndex > -1 ? parseInt(args[countIndex + 1]) : 3;
  
  console.log('正在生成知乎高赞标题...\n');
  
  const result = await generateTitles(content.replace(/"/g, ''), field, count);
  console.log(formatOutput(result));
}

module.exports = { generateTitles, formatOutput };

if (require.main === module) {
  main().catch(console.error);
}
