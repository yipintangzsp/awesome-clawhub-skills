#!/usr/bin/env node

/**
 * 社交媒体爆款预测器
 * 定价：¥5/次 | ¥99/月
 */

// 平台配置
const PLATFORMS = {
  抖音：{ weight: 1.0, tags: ['#抖音', '#热门', '#推荐'] },
  小红书：{ weight: 0.9, tags: ['#小红书', '#种草', '#分享'] },
  微博：{ weight: 0.7, tags: ['#微博', '#热搜', '#话题'] },
  公众号：{ weight: 0.8, tags: ['#公众号', '#微信', '#文章'] }
};

// 爆款元素权重
const VIRAL_ELEMENTS = {
  话题热度：25,
  情绪触发：20,
  实用价值：20,
  视觉吸引：15,
  互动潜力：10,
  时效性：10
};

/**
 * 预测爆款概率
 */
async function predictViral(content, platform = '抖音', optimize = false) {
  const result = {
    content: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
    platform,
    predictTime: new Date().toISOString(),
    viralScore: 0,
    platformScores: {},
    elements: {},
    strengths: [],
    weaknesses: [],
    suggestions: [],
    tags: []
  };
  
  // 分析内容元素
  result.elements = analyzeElements(content);
  
  // 计算各平台得分
  for (const [plat, config] of Object.entries(PLATFORMS)) {
    const score = calculateScore(result.elements, plat);
    result.platformScores[plat] = score;
  }
  
  // 主平台得分
  result.viralScore = result.platformScores[platform] || 50;
  
  // 分析优劣势
  analyzeStrengthsWeaknesses(result.elements, result);
  
  // 生成优化建议
  if (optimize || result.viralScore < 70) {
    result.suggestions = generateSuggestions(result.elements, platform);
  }
  
  // 推荐标签
  result.tags = generateTags(content, platform);
  
  return result;
}

/**
 * 分析内容元素
 */
function analyzeElements(content) {
  return {
    话题热度：detectTopicHeat(content),
    情绪触发：detectEmotion(content),
    实用价值：detectValue(content),
    视觉吸引：50, // 需要图片分析，简化处理
    互动潜力：detectInteraction(content),
    时效性：detectTimeliness(content)
  };
}

function detectTopicHeat(content) {
  const hotTopics = ['减肥', '赚钱', '职场', '情感', '学习', '旅游', '美食'];
  const matches = hotTopics.filter(t => content.includes(t));
  return Math.min(50 + matches.length * 10, 100);
}

function detectEmotion(content) {
  const emotionWords = ['太', '超', '巨', '绝', '爆', '哭', '笑', '爱', '恨', '惊喜'];
  const matches = emotionWords.filter(w => content.includes(w));
  return Math.min(40 + matches.length * 8, 100);
}

function detectValue(content) {
  const valueWords = ['教程', '攻略', '指南', '方法', '技巧', '干货', '必备'];
  const matches = valueWords.filter(w => content.includes(w));
  return Math.min(50 + matches.length * 10, 100);
}

function detectInteraction(content) {
  const interactionWords = ['收藏', '点赞', '评论', '分享', '关注', '留言'];
  const matches = interactionWords.filter(w => content.includes(w));
  return Math.min(30 + matches.length * 15, 100);
}

function detectTimeliness(content) {
  const timeWords = ['2026', '最新', '今天', '现在', '刚刚', '新鲜'];
  const matches = timeWords.filter(w => content.includes(w));
  return Math.min(50 + matches.length * 10, 100);
}

/**
 * 计算平台得分
 */
function calculateScore(elements, platform) {
  let score = 0;
  let totalWeight = 0;
  
  for (const [element, value] of Object.entries(elements)) {
    const weight = VIRAL_ELEMENTS[element] || 10;
    score += value * weight;
    totalWeight += weight;
  }
  
  let baseScore = Math.round(score / totalWeight);
  
  // 平台系数
  const platformBonus = {
    抖音：elements.情绪触发 > 70 ? 10 : 0,
    小红书：elements.实用价值 > 70 ? 10 : 0,
    微博：elements.话题热度 > 70 ? 10 : 0,
    公众号：elements.实用价值 > 60 ? 5 : 0
  };
  
  return Math.min(baseScore + (platformBonus[platform] || 0), 99);
}

/**
 * 分析优劣势
 */
function analyzeStrengthsWeaknesses(elements, result) {
  const elementNames = {
    话题热度：'话题热度高',
    情绪触发：'情绪触发强',
    实用价值：'实用价值高',
    视觉吸引： '视觉吸引力强',
    互动潜力：'互动潜力大',
    时效性： '时效性好'
  };
  
  for (const [element, value] of Object.entries(elements)) {
    if (value >= 70) {
      result.strengths.push(`[✓] ${elementNames[element]}`);
    } else if (value < 50) {
      result.weaknesses.push(`[!] ${element}较弱`);
    }
  }
}

/**
 * 生成优化建议
 */
function generateSuggestions(elements, platform) {
  const suggestions = [];
  
  if (elements.情绪触发 < 60) {
    suggestions.push('增加情绪化表达，使用"太""绝""爆"等词');
  }
  if (elements.互动潜力 < 50) {
    suggestions.push('添加互动引导："收藏""点赞""评论"');
  }
  if (elements.时效性 < 50) {
    suggestions.push('加入时效词："最新""2026""刚刚"');
  }
  if (platform === '抖音' && elements.视觉吸引 < 60) {
    suggestions.push('优化封面：对比图 + 大字标题');
  }
  if (platform === '小红书') {
    suggestions.push('增加 emoji 使用，提升视觉吸引力');
  }
  
  return suggestions.slice(0, 5);
}

/**
 * 生成标签
 */
function generateTags(content, platform) {
  const baseTags = PLATFORMS[platform]?.tags || ['#热门'];
  const hotTopics = ['减肥', '赚钱', '职场', '情感', '学习']
    .filter(t => content.includes(t))
    .map(t => `#${t}`);
  
  return [...hotTopics, ...baseTags].slice(0, 8);
}

/**
 * 格式化输出
 */
function formatOutput(result) {
  let output = `## 📊 爆款概率预测报告\n\n`;
  output += `**内容：** ${result.content}\n`;
  output += `**平台：** ${result.platform}\n`;
  output += `**预测时间：** ${result.predictTime.split('T')[0]}\n\n`;
  
  output += `### 🎯 爆款概率：${result.viralScore}%\n\n`;
  
  // 平台表现
  output += `### 📈 平台表现预测\n`;
  for (const [plat, score] of Object.entries(result.platformScores)) {
    const level = score >= 70 ? '高' : score >= 50 ? '中高' : '中';
    output += `- ${plat}: ${score}%（${level}）\n`;
  }
  output += `\n`;
  
  // 优势
  if (result.strengths.length > 0) {
    output += `### ✅ 优势元素\n`;
    result.strengths.forEach(s => output += `${s}\n`);
    output += `\n`;
  }
  
  // 待优化
  if (result.weaknesses.length > 0) {
    output += `### ⚠️ 待优化\n`;
    result.weaknesses.forEach(w => output += `${w}\n`);
    output += `\n`;
  }
  
  // 建议
  if (result.suggestions.length > 0) {
    output += `### 💡 优化建议\n`;
    result.suggestions.forEach((s, i) => output += `${i + 1}. ${s}\n`);
    output += `\n`;
  }
  
  output += `### 🔥 推荐标签\n`;
  output += result.tags.join(' ');\n`;
  
  return output;
}

/**
 * CLI 入口
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('用法：viral-predict "内容描述" [--platform 平台] [--optimize]');
    console.log('平台：抖音 | 小红书 | 微博 | 公众号');
    process.exit(1);
  }
  
  const content = args.find(arg => !arg.startsWith('--'));
  const platformIndex = args.indexOf('--platform');
  const optimize = args.includes('--optimize');
  
  const platform = platformIndex > -1 ? args[platformIndex + 1] : '抖音';
  
  console.log('正在分析爆款概率...\n');
  
  const result = await predictViral(content.replace(/"/g, ''), platform, optimize);
  console.log(formatOutput(result));
}

module.exports = { predictViral, formatOutput };

if (require.main === module) {
  main().catch(console.error);
}
