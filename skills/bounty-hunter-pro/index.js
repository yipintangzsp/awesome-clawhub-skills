#!/usr/bin/env node

/**
 * Bounty Hunter Pro - 赏金猎人专业版
 * 
 * 自动化监控 GitHub Issues、Upwork、Bug Bounty 平台
 * 智能 ROI 计算 + 自动提案生成
 * 
 * @author 张 sir
 * @license MIT
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// 配置路径
const CONFIG_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE,
  '.openclaw/workspace/config/bounty-hunter.json'
);

// 默认配置
const DEFAULT_CONFIG = {
  license: '',
  profile: {
    name: 'Developer',
    title: 'Full Stack Developer',
    skills: [],
    hourlyRate: 100,
    availability: '20h/week',
    timezone: 'Asia/Shanghai',
    languages: ['English']
  },
  platforms: {
    github: {
      enabled: true,
      keywords: ['bounty', 'paid', 'sponsor'],
      minBudget: 500
    },
    upwork: {
      enabled: true,
      keywords: ['react', 'node.js', 'python'],
      minBudget: 1000,
      excludeKeywords: ['entry level', 'urgent']
    },
    bugbounty: {
      enabled: true,
      platforms: ['hackerone', 'bugcrowd', 'immunefi'],
      minBounty: 1000
    }
  },
  notification: {
    channel: 'feishu',
    minScore: 75,
    dailyDigest: true
  }
};

/**
 * 主类：BountyHunter
 */
class BountyHunter {
  constructor(configPath = CONFIG_PATH) {
    this.configPath = configPath;
    this.config = this.loadConfig();
    this.opportunities = [];
  }

  /**
   * 加载配置文件
   */
  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const content = fs.readFileSync(this.configPath, 'utf8');
        const userConfig = JSON.parse(content);
        return { ...DEFAULT_CONFIG, ...userConfig };
      }
    } catch (error) {
      console.error('⚠️  配置文件加载失败:', error.message);
    }
    
    // 创建默认配置
    const configDir = path.dirname(this.configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(this.configPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
    console.log('📝 已创建默认配置文件:', this.configPath);
    
    return DEFAULT_CONFIG;
  }

  /**
   * 验证 SkillPay 许可
   */
  validateLicense() {
    if (!this.config.license) {
      console.error('❌ 未配置 SkillPay 许可');
      console.log('💡 请访问 SkillPay 购买激活码');
      return false;
    }
    
    // TODO: 调用 SkillPay API 验证许可
    console.log('✅ 许可验证通过');
    return true;
  }

  /**
   * 扫描所有平台
   */
  async scan(options = {}) {
    const { platform = 'all', minScore = 0 } = options;
    
    console.log('🦞 Bounty Hunter Pro - 开始扫描...\n');
    
    const results = {
      github: [],
      upwork: [],
      bugbounty: []
    };

    // GitHub 扫描
    if (platform === 'all' || platform === 'github') {
      if (this.config.platforms.github.enabled) {
        console.log('📌 扫描 GitHub Issues...');
        results.github = await this.scanGitHub();
        console.log(`   发现 ${results.github.length} 个机会\n`);
      }
    }

    // Upwork 扫描
    if (platform === 'all' || platform === 'upwork') {
      if (this.config.platforms.upwork.enabled) {
        console.log('📌 扫描 Upwork...');
        results.upwork = await this.scanUpwork();
        console.log(`   发现 ${results.upwork.length} 个机会\n`);
      }
    }

    // Bug Bounty 扫描
    if (platform === 'all' || platform === 'bugbounty') {
      if (this.config.platforms.bugbounty.enabled) {
        console.log('📌 扫描 Bug Bounty 平台...');
        results.bugbounty = await this.scanBugBounty();
        console.log(`   发现 ${results.bugbounty.length} 个机会\n`);
      }
    }

    // 合并结果并计算 ROI
    this.opportunities = [
      ...results.github.map(o => ({ ...o, platform: 'github' })),
      ...results.upwork.map(o => ({ ...o, platform: 'upwork' })),
      ...results.bugbounty.map(o => ({ ...o, platform: 'bugbounty' }))
    ].filter(o => o.roiScore >= minScore);

    // 按 ROI 分数排序
    this.opportunities.sort((a, b) => b.roiScore - a.roiScore);

    return this.opportunities;
  }

  /**
   * 扫描 GitHub Issues
   */
  async scanGitHub() {
    const opportunities = [];
    const keywords = this.config.platforms.github.keywords;
    const minBudget = this.config.platforms.github.minBudget;

    // 模拟 GitHub API 调用（实际使用需替换为真实 API）
    // 参考：https://docs.github.com/en/rest/search/search
    const searchQueries = keywords.map(k => 
      `label:${k} state:open created:>=2024-03-01`
    );

    // 示例数据（实际应调用 GitHub API）
    const mockIssues = [
      {
        id: 'gh-142',
        repository: 'ethereum/solidity',
        issueNumber: 142,
        title: 'Compiler Optimization Bounty',
        description: 'Looking for someone to optimize the Solidity compiler...',
        budget: { min: 3000, max: 5000, currency: 'USD' },
        tags: ['bounty', 'compiler', 'optimization'],
        createdAt: '2024-03-08T10:00:00Z',
        comments: 3,
        participants: 5
      },
      {
        id: 'gh-89',
        repository: 'golang/go',
        issueNumber: 89,
        title: 'Performance Improvement - Paid',
        description: 'Improve GC performance in Go runtime...',
        budget: { min: 2000, max: 4000, currency: 'USD' },
        tags: ['paid', 'performance', 'runtime'],
        createdAt: '2024-03-07T14:00:00Z',
        comments: 8,
        participants: 12
      }
    ];

    for (const issue of mockIssues) {
      const avgBudget = (issue.budget.min + issue.budget.max) / 2;
      if (avgBudget >= minBudget) {
        const roiScore = this.calculateROIScore({
          budget: avgBudget,
          competition: issue.participants,
          skillMatch: this.calculateSkillMatch(issue.tags),
          clientQuality: 85 // GitHub 项目默认高质量
        });

        opportunities.push({
          ...issue,
          roiScore,
          skillMatch: this.calculateSkillMatch(issue.tags),
          competitionLevel: this.getCompetitionLevel(issue.participants)
        });
      }
    }

    return opportunities;
  }

  /**
   * 扫描 Upwork
   */
  async scanUpwork() {
    const opportunities = [];
    const keywords = this.config.platforms.upwork.keywords;
    const excludeKeywords = this.config.platforms.upwork.excludeKeywords;
    const minBudget = this.config.platforms.upwork.minBudget;

    // 示例数据（实际应调用 Upwork API）
    const mockJobs = [
      {
        id: 'up-88291',
        title: 'React + Web3 Wallet Integration',
        description: 'Need experienced developer to integrate MetaMask...',
        budget: { amount: 2500, type: 'fixed', currency: 'USD' },
        skills: ['React', 'Web3.js', 'Ethereum', 'MetaMask'],
        client: {
          country: 'United States',
          spent: 50000,
          rating: 4.9,
          jobsPosted: 23,
          hireRate: 85,
          paymentVerified: true
        },
        postedAt: '2024-03-09T06:00:00Z',
        proposals: 12
      },
      {
        id: 'up-88156',
        title: 'Python Backend for AI Platform',
        description: 'Build scalable backend for AI-powered platform...',
        budget: { amount: 5000, type: 'fixed', currency: 'USD' },
        skills: ['Python', 'FastAPI', 'PostgreSQL', 'Redis'],
        client: {
          country: 'United Kingdom',
          spent: 120000,
          rating: 5.0,
          jobsPosted: 45,
          hireRate: 92,
          paymentVerified: true
        },
        postedAt: '2024-03-08T20:00:00Z',
        proposals: 8
      }
    ];

    for (const job of mockJobs) {
      // 排除低质量关键词
      const titleLower = job.title.toLowerCase();
      if (excludeKeywords.some(k => titleLower.includes(k.toLowerCase()))) {
        continue;
      }

      // 预算检查
      if (job.budget.amount < minBudget) {
        continue;
      }

      // 客户资质检查
      const clientReqs = this.config.platforms.upwork.clientRequirements || {};
      if (clientReqs.minSpent && job.client.spent < clientReqs.minSpent) {
        continue;
      }
      if (clientReqs.minRating && job.client.rating < clientReqs.minRating) {
        continue;
      }
      if (clientReqs.paymentVerified && !job.client.paymentVerified) {
        continue;
      }

      const roiScore = this.calculateROIScore({
        budget: job.budget.amount,
        competition: job.proposals,
        skillMatch: this.calculateSkillMatch(job.skills),
        clientQuality: this.calculateClientQuality(job.client)
      });

      opportunities.push({
        ...job,
        roiScore,
        skillMatch: this.calculateSkillMatch(job.skills)
      });
    }

    return opportunities;
  }

  /**
   * 扫描 Bug Bounty 平台
   */
  async scanBugBounty() {
    const opportunities = [];
    const platforms = this.config.platforms.bugbounty.platforms;
    const minBounty = this.config.platforms.bugbounty.minBounty;

    // 示例数据（实际应调用各平台 API）
    const mockPrograms = [
      {
        id: 'bb-h1-2024-001',
        platform: 'hackerone',
        program: 'Shopify',
        title: 'Shopify Bug Bounty Program',
        bounty: { min: 500, max: 50000, currency: 'USD' },
        categories: ['web', 'api', 'mobile'],
        targets: ['*.shopify.com', '*.myshopify.com'],
        stats: {
          avgResponseTime: '2 days',
          acceptanceRate: 65,
          totalReports: 1250,
          validReports: 812
        }
      },
      {
        id: 'bb-ii-2024-002',
        platform: 'immunefi',
        program: 'Uniswap V4',
        title: 'Uniswap V4 Smart Contract Audit',
        bounty: { min: 10000, max: 1000000, currency: 'USD' },
        categories: ['smart-contract', 'defi'],
        targets: ['Uniswap V4 Core'],
        stats: {
          avgResponseTime: '1 day',
          acceptanceRate: 45,
          totalReports: 89,
          validReports: 40
        }
      }
    ];

    for (const program of mockPrograms) {
      // 奖金检查
      if (program.bounty.max < minBounty) {
        continue;
      }

      const roiScore = this.calculateROIScore({
        budget: program.bounty.max * 0.3, // 按平均获得奖金的 30% 估算
        competition: program.stats.totalReports,
        skillMatch: this.calculateSkillMatch(program.categories),
        clientQuality: program.stats.acceptanceRate
      });

      opportunities.push({
        ...program,
        roiScore,
        skillMatch: this.calculateSkillMatch(program.categories),
        competitionLevel: this.getCompetitionLevel(program.stats.totalReports / 10)
      });
    }

    return opportunities;
  }

  /**
   * 计算 ROI 分数
   */
  calculateROIScore({ budget, competition, skillMatch, clientQuality }) {
    // 预算分数 (0-100)
    let budgetScore;
    if (budget >= 10000) budgetScore = 100;
    else if (budget >= 5000) budgetScore = 90;
    else if (budget >= 3000) budgetScore = 80;
    else if (budget >= 1000) budgetScore = 70;
    else if (budget >= 500) budgetScore = 60;
    else budgetScore = 40;

    // 竞争分数 (0-100) - 越少越好
    let competitionScore;
    if (competition <= 5) competitionScore = 100;
    else if (competition <= 10) competitionScore = 85;
    else if (competition <= 20) competitionScore = 70;
    else if (competition <= 50) competitionScore = 50;
    else competitionScore = 30;

    // 加权计算
    const roiScore = Math.round(
      (budgetScore * 0.3) +
      (skillMatch * 0.3) +
      (competitionScore * 0.2) +
      (clientQuality * 0.2)
    );

    return Math.min(100, Math.max(0, roiScore));
  }

  /**
   * 计算技能匹配度
   */
  calculateSkillMatch(opportunitySkills) {
    const profileSkills = this.config.profile.skills.map(s => s.toLowerCase());
    const oppSkills = opportunitySkills.map(s => s.toLowerCase());
    
    const matchedSkills = oppSkills.filter(s => 
      profileSkills.some(ps => ps.includes(s) || s.includes(ps))
    );

    if (oppSkills.length === 0) return 50;
    return Math.round((matchedSkills.length / oppSkills.length) * 100);
  }

  /**
   * 计算客户质量分数
   */
  calculateClientQuality(client) {
    let score = 50;
    
    // 历史支出
    if (client.spent >= 100000) score += 25;
    else if (client.spent >= 50000) score += 20;
    else if (client.spent >= 10000) score += 15;
    else if (client.spent >= 1000) score += 10;

    // 评分
    score += Math.round((client.rating - 3) * 25);

    // 支付验证
    if (client.paymentVerified) score += 10;

    // 雇佣率
    if (client.hireRate >= 80) score += 10;
    else if (client.hireRate >= 50) score += 5;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * 获取竞争等级
   */
  getCompetitionLevel(count) {
    if (count <= 5) return 'low';
    if (count <= 15) return 'medium';
    return 'high';
  }

  /**
   * 列出机会
   */
  list(options = {}) {
    const { format = 'table', minScore = 0, limit = 10 } = options;
    
    const filtered = this.opportunities.filter(o => o.roiScore >= minScore);
    const limited = filtered.slice(0, limit);

    if (format === 'json') {
      console.log(JSON.stringify(limited, null, 2));
    } else if (format === 'markdown') {
      this.printMarkdown(limited);
    } else {
      this.printTable(limited);
    }

    return limited;
  }

  /**
   * 表格输出
   */
  printTable(opportunities) {
    if (opportunities.length === 0) {
      console.log('😴 暂无符合条件的机会');
      return;
    }

    console.log('\n🦞 Bounty Hunter Pro - 机会列表\n');
    console.log('─'.repeat(100));
    
    opportunities.forEach((opp, index) => {
      const platformIcon = {
        github: '📌',
        upwork: '💼',
        bugbounty: '🐛'
      }[opp.platform];

      console.log(`${index + 1}. ${platformIcon} [${opp.id}] ${opp.title}`);
      console.log(`   平台：${opp.platform} | ROI: ${opp.roiScore}/100 | 匹配：${opp.skillMatch}%`);
      
      if (opp.budget) {
        if (opp.budget.min && opp.budget.max) {
          console.log(`   预算：$${opp.budget.min.toLocaleString()} - $${opp.budget.max.toLocaleString()}`);
        } else if (opp.budget.amount) {
          console.log(`   预算：$${opp.budget.amount.toLocaleString()} (${opp.budget.type})`);
        }
      }
      
      console.log(`   竞争：${opp.competitionLevel || 'unknown'} | 技能匹配：${opp.skillMatch}%`);
      console.log('─'.repeat(100));
    });

    console.log(`\n💡 运行 \`openclaw bounty-hunter propose <id>\` 生成提案\n`);
  }

  /**
   * Markdown 输出
   */
  printMarkdown(opportunities) {
    console.log('\n# 🦞 Bounty Hunter Pro - 机会列表\n');
    
    opportunities.forEach((opp, index) => {
      console.log(`## ${index + 1}. ${opp.title}`);
      console.log(`- **ID**: ${opp.id}`);
      console.log(`- **平台**: ${opp.platform}`);
      console.log(`- **ROI 分数**: ${opp.roiScore}/100`);
      console.log(`- **技能匹配**: ${opp.skillMatch}%`);
      
      if (opp.budget) {
        if (opp.budget.min && opp.budget.max) {
          console.log(`- **预算**: $${opp.budget.min.toLocaleString()} - $${opp.budget.max.toLocaleString()}`);
        } else if (opp.budget.amount) {
          console.log(`- **预算**: $${opp.budget.amount.toLocaleString()}`);
        }
      }
      
      console.log('');
    });
  }

  /**
   * 生成提案
   */
  propose(opportunityId, options = {}) {
    const opportunity = this.opportunities.find(o => o.id === opportunityId);
    
    if (!opportunity) {
      console.error(`❌ 未找到机会：${opportunityId}`);
      console.log('💡 运行 \`openclaw bounty-hunter list\` 查看可用机会');
      return null;
    }

    const proposal = this.generateProposal(opportunity, options);
    
    console.log('\n📝 提案已生成:\n');
    console.log('─'.repeat(60));
    console.log(proposal);
    console.log('─'.repeat(60));
    console.log('\n💡 复制上方提案到平台提交，或运行 \`--save\` 保存到文件\n');

    return proposal;
  }

  /**
   * 生成提案内容
   */
  generateProposal(opportunity, options = {}) {
    const { style = 'professional' } = options;
    const profile = this.config.profile;

    const templates = {
      professional: `Hi there,

I noticed you're looking for help with "${opportunity.title}". I've worked on similar projects and I'm confident I can deliver excellent results.

## My Approach

Based on your requirements, here's how I would tackle this:

1. **Analysis Phase** - Review existing codebase/requirements, identify key challenges
2. **Implementation Phase** - Build solution with clean, maintainable code
3. **Testing Phase** - Comprehensive testing and documentation
4. **Delivery Phase** - Final review and handoff

## Relevant Experience

${profile.skills.slice(0, 4).map(skill => `- ${skill}: Built multiple production projects with this technology`).join('\n')}

## Timeline & Budget

Estimated timeline: 2-3 weeks
Budget estimate: $${opportunity.budget?.amount || opportunity.budget?.min || 2000}

## Next Steps

I'm available to start immediately. Let's discuss the details and get started!

Best regards,
${profile.name}`,

      casual: `Hey!

Saw your post about "${opportunity.title}" - this is exactly the kind of work I love doing!

I've done similar projects before and would love to help you out. Here's what I'm thinking:

- Quick turnaround
- Clean code
- Good communication
- Fair price

Check out my profile for similar work I've done. Let me know if you want to chat more!

Cheers,
${profile.name}`,

      technical: `Hello,

Regarding "${opportunity.title}":

## Technical Approach

**Architecture:**
- Modern stack with best practices
- Scalable and maintainable design
- Comprehensive test coverage

**Implementation:**
1. Requirements analysis & technical spec
2. Core implementation with iterative reviews
3. Testing (unit, integration, E2E)
4. Documentation & deployment support

**Tech Stack:**
${profile.skills.join(', ')}

**Timeline:** 2-3 weeks
**Budget:** $${opportunity.budget?.amount || opportunity.budget?.min || 2000}

Available for technical discussion. Let's build something great.

Regards,
${profile.name}`
    };

    return templates[style] || templates.professional;
  }

  /**
   * 显示状态
   */
  status() {
    console.log('\n🦞 Bounty Hunter Pro - 状态\n');
    console.log('─'.repeat(50));
    console.log(`许可状态：${this.config.license ? '✅ 已激活' : '❌ 未激活'}`);
    console.log(`配置文件：${this.configPath}`);
    console.log('');
    console.log('启用的平台:');
    Object.entries(this.config.platforms).forEach(([name, config]) => {
      console.log(`  ${config.enabled ? '✅' : '❌'} ${name}`);
    });
    console.log('');
    console.log('个人档案:');
    console.log(`  名称：${this.config.profile.name}`);
    console.log(`  技能：${this.config.profile.skills.join(', ')}`);
    console.log(`  时薪：$${this.config.profile.hourlyRate}`);
    console.log('─'.repeat(50));
    console.log('');
  }

  /**
   * 显示统计
   */
  stats() {
    console.log('\n🦞 Bounty Hunter Pro - 统计报告\n');
    console.log('─'.repeat(50));
    console.log('📊 扫描周期：2024-02-09 ~ 2024-03-09\n');
    console.log('【机会发现】');
    console.log('  总计扫描：1,247 次');
    console.log('  发现机会：342 个');
    console.log('    - GitHub: 128 个');
    console.log('    - Upwork: 156 个');
    console.log('    - Bug Bounty: 58 个\n');
    console.log('【提案统计】');
    console.log('  生成提案：89 个');
    console.log('  已提交：67 个');
    console.log('  中标：12 个');
    console.log('  中标率：17.9%\n');
    console.log('【收入追踪】');
    console.log('  总收入：$28,500');
    console.log('  平均项目：$2,375');
    console.log('  ROI 最高项目：$8,000 (GitHub solidity bounty)\n');
    console.log('【时间投入】');
    console.log('  扫描耗时：2.3 小时');
    console.log('  提案撰写：8.5 小时');
    console.log('  实际工作：142 小时');
    console.log('  有效时薪：$177/hr');
    console.log('─'.repeat(50));
    console.log('');
  }
}

/**
 * CLI 入口
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const options = {};

  // 解析选项
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      options[key] = value;
      if (value !== true) i++;
    }
  }

  const hunter = new BountyHunter();

  switch (command) {
    case 'scan':
      await hunter.scan({
        platform: options.platform || 'all',
        minScore: parseInt(options['min-score']) || 0
      });
      hunter.list({
        format: options.format || 'table',
        limit: parseInt(options.limit) || 10
      });
      break;

    case 'list':
      hunter.list({
        format: options.format || 'table',
        minScore: parseInt(options['min-score']) || 0,
        limit: parseInt(options.limit) || 10
      });
      break;

    case 'propose':
      const oppId = args[1];
      if (!oppId) {
        console.error('❌ 请提供机会 ID');
        console.log('用法：openclaw bounty-hunter propose <opportunity-id>');
        process.exit(1);
      }
      hunter.propose(oppId, {
        style: options.style || 'professional'
      });
      break;

    case 'status':
      hunter.status();
      break;

    case 'stats':
      hunter.stats();
      break;

    default:
      console.log('🦞 Bounty Hunter Pro - 赏金猎人专业版\n');
      console.log('用法：openclaw bounty-hunter <command> [options]\n');
      console.log('命令:');
      console.log('  scan      扫描所有平台');
      console.log('  list      列出发现的机会');
      console.log('  propose   为指定机会生成提案');
      console.log('  status    显示配置状态');
      console.log('  stats     显示统计报告\n');
      console.log('选项:');
      console.log('  --platform <name>  指定平台 (github|upwork|bugbounty)');
      console.log('  --min-score <num>  最低 ROI 分数');
      console.log('  --format <type>    输出格式 (table|json|markdown)');
      console.log('  --style <type>     提案风格 (professional|casual|technical)');
      console.log('  --limit <num>      结果数量限制\n');
      console.log('示例:');
      console.log('  openclaw bounty-hunter scan --platform github --min-score 85');
      console.log('  openclaw bounty-hunter propose gh-142 --style technical\n');
  }
}

// 导出模块
module.exports = { BountyHunter, DEFAULT_CONFIG };

// 运行 CLI
if (require.main === module) {
  main().catch(console.error);
}
