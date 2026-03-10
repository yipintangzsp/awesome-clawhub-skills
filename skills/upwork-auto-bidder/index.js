#!/usr/bin/env node

/**
 * Upwork Auto Bidder - 自动监控并投标 Upwork 项目
 * @version 1.0.0
 * @author 张 sir
 */

const fs = require('fs');
const path = require('path');

// 配置文件路径
const CONFIG_PATH = path.join(__dirname, 'config.json');
const HISTORY_PATH = path.join(__dirname, 'history.json');

// 默认配置
const DEFAULT_CONFIG = {
  keywords: [],
  minBudget: 0,
  maxBudget: Infinity,
  clientScore: 4.0,
  clientSpent: 0,
  dailyLimit: 20,
  autoBid: false,
  upworkApiKey: ''
};

/**
 * 加载配置
 */
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    }
  } catch (e) {
    console.error('读取配置失败:', e.message);
  }
  return DEFAULT_CONFIG;
}

/**
 * 保存配置
 */
function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  console.log('✅ 配置已保存');
}

/**
 * 监控 Upwork 项目
 */
async function monitorJobs(config) {
  console.log('🔍 开始监控 Upwork 项目...');
  console.log(`   关键词：${config.keywords.join(', ') || '未设置'}`);
  console.log(`   预算范围：$${config.minBudget} - $${config.maxBudget === Infinity ? '∞' : config.maxBudget}`);
  console.log(`   客户评分：≥ ${config.clientScore}`);

  // 模拟监控结果
  const mockJobs = [
    {
      title: 'React Developer Needed for SaaS Platform',
      budget: '$3000-5000',
      clientScore: 4.9,
      clientSpent: '$50K+',
      posted: '10 分钟前',
      url: 'https://upwork.com/jobs/xxx'
    },
    {
      title: 'Node.js API Development',
      budget: '$1500-2500',
      clientScore: 4.7,
      clientSpent: '$10K+',
      posted: '25 分钟前',
      url: 'https://upwork.com/jobs/yyy'
    }
  ];

  console.log(`\n✅ 找到 ${mockJobs.length} 个匹配的项目\n`);
  return mockJobs;
}

/**
 * 生成投标文案
 */
function generateProposal(job) {
  return `
Hi there!

I'm excited about your project: "${job.title}"

### Why Me?
- 5+ years of experience in similar projects
- Portfolio: [your-portfolio-link]
- Available to start immediately

### Proposed Approach
1. Understand your requirements in detail
2. Create technical specification
3. Develop and test iteratively
4. Deploy and provide documentation

### Timeline & Budget
- Estimated time: 2-3 weeks
- Budget: Within your range (${job.budget})

Looking forward to discussing this further!

Best regards,
[Your Name]
  `.trim();
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const config = loadConfig();

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Upwork Auto Bidder - 自动投标工具

用法:
  node index.js [命令] [选项]

命令:
  --start           启动自动投标
  --pause           暂停自动投标
  --config          配置筛选条件
  --status          查看状态
  --history         查看投标历史

配置选项:
  --keywords <k>    关键词 (逗号分隔)
  --min-budget <n>  最低预算
  --max-budget <n>  最高预算
  --client-score <n> 最低客户评分
  --daily-limit <n> 每日投标上限
    `.trim());
    return;
  }

  // 处理命令
  if (args.includes('--config')) {
    const newConfig = { ...config };
    
    const kwArg = args.find(a => a.startsWith('--keywords='));
    if (kwArg) newConfig.keywords = kwArg.split('=')[1].split(',');
    
    const minArg = args.find(a => a.startsWith('--min-budget='));
    if (minArg) newConfig.minBudget = parseInt(minArg.split('=')[1]);
    
    const maxArg = args.find(a => a.startsWith('--max-budget='));
    if (maxArg) newConfig.maxBudget = parseInt(maxArg.split('=')[1]);
    
    const scoreArg = args.find(a => a.startsWith('--client-score='));
    if (scoreArg) newConfig.clientScore = parseFloat(scoreArg.split('=')[1]);
    
    saveConfig(newConfig);
    return;
  }

  if (args.includes('--start')) {
    config.autoBid = true;
    saveConfig(config);
    console.log('🚀 自动投标已启动');
    await monitorJobs(config);
    return;
  }

  if (args.includes('--pause')) {
    config.autoBid = false;
    saveConfig(config);
    console.log('⏸️ 自动投标已暂停');
    return;
  }

  if (args.includes('--status')) {
    console.log('📊 当前状态:');
    console.log(`   自动投标：${config.autoBid ? '✅ 开启' : '❌ 关闭'}`);
    console.log(`   关键词：${config.keywords.join(', ') || '未设置'}`);
    console.log(`   每日限额：${config.dailyLimit}`);
    return;
  }

  // 默认执行监控
  await monitorJobs(config);
}

main().catch(console.error);
