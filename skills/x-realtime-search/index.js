#!/usr/bin/env node

/**
 * X Realtime Search Skill
 * 实时搜索 X (Twitter) 平台内容
 * 
 * 功能:
 * - 调用本地 Grok 桥接服务搜索 X
 * - 返回摘要 + 推文列表 + 情感分析
 * - 支持筛选（时间/用户类型/语言）
 * 
 * 定价：¥10/次，¥99/月，¥999/年
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// 配置路径
const CONFIG_PATH = path.join(__dirname, 'config.json');
const SKILLPAY_API = process.env.SKILLPAY_API_URL || 'https://api.skillpay.com';

/**
 * 加载配置
 */
function loadConfig() {
  try {
    const configData = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('❌ 配置文件不存在或格式错误');
    console.error('请运行：cp config.example.json config.json');
    process.exit(1);
  }
}

/**
 * 验证 SkillPay 支付
 */
async function verifyPayment(userId, planType = 'single') {
  try {
    const response = await axios.post(`${SKILLPAY_API}/verify`, {
      userId,
      skillId: 'x-realtime-search',
      planType
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.SKILLPAY_API_KEY}`
      }
    });
    
    return response.data.valid;
  } catch (error) {
    console.error('⚠️  支付验证失败:', error.message);
    return false;
  }
}

/**
 * 调用 Grok 桥接服务搜索 X
 */
async function searchX(query, options = {}) {
  const config = loadConfig();
  
  const params = {
    query,
    timeRange: options.time || '24h',
    userType: options.userType || 'all',
    language: options.lang || 'auto',
    limit: Math.min(options.limit || 20, 100),
    minLikes: options.minLikes || 0,
    minRetweets: options.minRetweets || 0
  };

  try {
    const response = await axios.post(`${config.grokBridge.url}/search`, params, {
      headers: {
        'Authorization': `Bearer ${config.grokBridge.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    return response.data;
  } catch (error) {
    console.error('❌ 搜索失败:', error.message);
    if (error.response) {
      console.error('API 响应:', error.response.data);
    }
    throw error;
  }
}

/**
 * 情感分析
 */
async function analyzeSentiment(tweets) {
  const config = loadConfig();
  
  const texts = tweets.slice(0, 20).map(t => t.text);
  
  try {
    const response = await axios.post(`${config.grokBridge.url}/sentiment`, {
      texts,
      model: config.sentiment.model
    }, {
      headers: {
        'Authorization': `Bearer ${config.grokBridge.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    return response.data.results;
  } catch (error) {
    console.error('⚠️  情感分析失败:', error.message);
    return tweets.map(() => ({ sentiment: 'unknown', confidence: 0 }));
  }
}

/**
 * 生成搜索摘要
 */
function generateSummary(searchResult, sentiments) {
  const totalTweets = searchResult.tweets.length;
  
  // 计算情感分布
  const sentimentCount = { positive: 0, neutral: 0, negative: 0, unknown: 0 };
  sentiments.forEach(s => {
    sentimentCount[s.sentiment]++;
  });

  const sentimentPercent = {
    positive: Math.round((sentimentCount.positive / totalTweets) * 100),
    neutral: Math.round((sentimentCount.neutral / totalTweets) * 100),
    negative: Math.round((sentimentCount.negative / totalTweets) * 100)
  };

  // 提取趋势关键词
  const keywords = searchResult.trends?.slice(0, 5).map(t => `#${t}`) || [];

  return {
    totalTweets,
    sentiment: sentimentPercent,
    keywords,
    topTweets: searchResult.tweets.slice(0, 5).map((tweet, i) => ({
      rank: i + 1,
      user: tweet.user,
      likes: tweet.likes,
      text: tweet.text.substring(0, 100) + '...'
    }))
  };
}

/**
 * 格式化输出
 */
function formatOutput(query, options, summary) {
  let output = `\n🔍 搜索结果："${query}" (过去 ${options.time || '24h'})\n\n`;
  output += `📈 共找到 ${summary.totalTweets} 条推文\n\n`;

  if (options.sentiment) {
    output += `【情感分布】\n`;
    output += `✅ 正面：${summary.sentiment.positive}%\n`;
    output += `⚠️  中性：${summary.sentiment.neutral}%\n`;
    output += `❌ 负面：${summary.sentiment.negative}%\n\n`;
  }

  output += `【热门推文】\n`;
  summary.topTweets.forEach(tweet => {
    output += `${tweet.rank}. ${tweet.user} (${tweet.likes.toLocaleString()}👍)\n`;
    output += `   "${tweet.text}"\n\n`;
  });

  if (summary.keywords.length > 0) {
    output += `【趋势关键词】\n${summary.keywords.join(' ')}\n`;
  }

  return output;
}

/**
 * 导出数据
 */
function exportData(query, options, searchResult, sentiments, format) {
  const data = {
    query,
    timeRange: options.time,
    totalResults: searchResult.tweets.length,
    sentiment: sentiments,
    tweets: searchResult.tweets,
    trends: searchResult.trends,
    exportedAt: new Date().toISOString()
  };

  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);
    
    case 'csv':
      const headers = ['User', 'Text', 'Likes', 'Retweets', 'Sentiment', 'Timestamp'];
      const rows = searchResult.tweets.map((tweet, i) => [
        tweet.user,
        `"${tweet.text.replace(/"/g, '""')}"`,
        tweet.likes,
        tweet.retweets,
        sentiments[i]?.sentiment || 'unknown',
        tweet.timestamp
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    case 'markdown':
      let md = `# X 搜索结果：${query}\n\n`;
      md += `**时间范围**: ${options.time}\n`;
      md += `**结果数量**: ${searchResult.tweets.length}\n\n`;
      md += `## 热门推文\n\n`;
      searchResult.tweets.slice(0, 10).forEach((tweet, i) => {
        md += `${i + 1}. **${tweet.user}** (${tweet.likes}👍)\n`;
        md += `   > ${tweet.text}\n\n`;
      });
      return md;
    
    default:
      return JSON.stringify(data, null, 2);
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🐾 X Realtime Search - 实时 X 平台搜索

用法:
  /x-search "关键词" [选项]

选项:
  --time <范围>      时间范围：1h, 6h, 24h, 7d, 30d (默认：24h)
  --user-type <类型> 用户类型：all, verified, influencers (默认：all)
  --lang <语言>      语言代码：zh, en, ja, ko (默认：auto)
  --sentiment        启用情感分析
  --limit <数量>     结果数量：1-100 (默认：20)
  --export <格式>    导出格式：json, csv, markdown
  --min-likes <数>   最小点赞数
  --min-retweets <数> 最小转发数

示例:
  /x-search "AI agent"
  /x-search "crypto" --time 6h --user-type verified
  /x-search "人工智能" --sentiment --lang zh --limit 50

定价:
  ¥10/次 | ¥99/月 | ¥999/年
`);
    process.exit(0);
  }

  // 解析参数
  const query = args.find(arg => !arg.startsWith('--'));
  const options = {
    time: args.find((_, i) => args[i] === '--time')?.[1] || '24h',
    userType: args.find((_, i) => args[i] === '--user-type')?.[1] || 'all',
    lang: args.find((_, i) => args[i] === '--lang')?.[1] || 'auto',
    sentiment: args.includes('--sentiment'),
    limit: parseInt(args.find((_, i) => args[i] === '--limit')?.[1] || '20'),
    export: args.find((_, i) => args[i] === '--export')?.[1],
    minLikes: parseInt(args.find((_, i) => args[i] === '--min-likes')?.[1] || '0'),
    minRetweets: parseInt(args.find((_, i) => args[i] === '--min-retweets')?.[1] || '0')
  };

  if (!query) {
    console.error('❌ 请提供搜索关键词');
    process.exit(1);
  }

  console.log(`🔍 正在搜索："${query}"...`);

  try {
    // 执行搜索
    const searchResult = await searchX(query, options);
    console.log(`✅ 找到 ${searchResult.tweets.length} 条推文`);

    // 情感分析（如果启用）
    let sentiments = [];
    if (options.sentiment) {
      console.log('📊 正在进行情感分析...');
      sentiments = await analyzeSentiment(searchResult.tweets);
    }

    // 生成摘要
    const summary = generateSummary(searchResult, sentiments);

    // 输出结果
    if (options.export) {
      const exported = exportData(query, options, searchResult, sentiments, options.export);
      const filename = `x-search-${Date.now()}.${options.export}`;
      fs.writeFileSync(filename, exported);
      console.log(`💾 结果已导出到：${filename}`);
    } else {
      const output = formatOutput(query, options, summary);
      console.log(output);
    }

  } catch (error) {
    console.error('❌ 搜索失败:', error.message);
    process.exit(1);
  }
}

// 导出模块（供其他模块使用）
module.exports = {
  searchX,
  analyzeSentiment,
  generateSummary,
  formatOutput,
  exportData,
  verifyPayment
};

// 运行主函数
if (require.main === module) {
  main();
}
