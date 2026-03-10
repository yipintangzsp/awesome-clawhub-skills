# Bounty Hunter Pro 完整文档

## 🦞 概述

**Bounty Hunter Pro** 是专为开发者、安全研究员、自由职业者设计的被动收入工具。它 24/7 监控全球赏金机会，用 AI 帮你筛选高价值项目并生成专业提案。

### 为什么需要这个工具？

1. **信息过载** - 每天数百个新机会分散在多个平台
2. **时间浪费** - 手动筛选耗时，错过最佳申请时机
3. **提案疲劳** - 每次都要重新写类似的自我介绍
4. **机会成本** - 低价值项目占据精力，错过真正的好机会

### 核心价值

- ⏰ **节省时间** - 自动化监控，每天节省 2-3 小时
- 💰 **提高收入** - 聚焦高 ROI 机会，时薪提升 50%+
- 🎯 **精准匹配** - AI 分析技能匹配度，避免无效申请
- 📈 **数据驱动** - 基于历史数据优化投标策略

---

## 🚀 快速开始

### 1. 安装技能

```bash
# 通过 ClawHub 安装
openclaw clawhub install bounty-hunter-pro

# 或手动克隆到 skills 目录
git clone https://github.com/your-repo/bounty-hunter-pro.git ~/.openclaw/workspace/skills/bounty-hunter-pro
```

### 2. 激活 SkillPay 许可

```bash
# 购买后获得激活码
openclaw skillpay activate bounty-hunter-pro <YOUR-LICENSE-KEY>
```

### 3. 配置个人档案

创建 `~/.openclaw/workspace/config/bounty-hunter.json`：

```json
{
  "license": "BHP-2024-XXXX-XXXX-XXXX",
  "profile": {
    "name": "张 sir",
    "title": "Full Stack Developer & Security Researcher",
    "skills": [
      "JavaScript", "TypeScript", "React", "Node.js",
      "Python", "Solidity", "Smart Contract Audit",
      "Penetration Testing", "Web3"
    ],
    "hourlyRate": 150,
    "availability": "20h/week",
    "timezone": "Asia/Shanghai",
    "languages": ["English", "Chinese"]
  },
  "platforms": {
    "github": {
      "enabled": true,
      "keywords": ["bounty", "paid", "sponsor", "grant"],
      "minBudget": 500,
      "repositories": [
        "ethereum/solidity",
        "golang/go",
        "rust-lang/rust"
      ]
    },
    "upwork": {
      "enabled": true,
      "keywords": ["react", "node.js", "python", "blockchain", "web3", "smart contract"],
      "minBudget": 1000,
      "maxBudget": 50000,
      "excludeKeywords": ["entry level", "urgent", "asap", "fix bug"],
      "clientRequirements": {
        "minSpent": 1000,
        "minRating": 4.5,
        "paymentVerified": true
      }
    },
    "bugbounty": {
      "enabled": true,
      "platforms": ["hackerone", "bugcrowd", "immunefi", "yeswehack"],
      "minBounty": 1000,
      "categories": ["web", "api", "smart-contract", "mobile"],
      "excludeCategories": ["hardware", "iot"]
    }
  },
  "notification": {
    "channel": "feishu",
    "telegramBot": "",
    "minScore": 75,
    "dailyDigest": true,
    "digestTime": "08:00"
  },
  "proposal": {
    "template": "default",
    "includePortfolio": true,
    "includeRateCard": false,
    "autoSubmit": false
  }
}
```

### 4. 首次运行

```bash
# 测试配置
openclaw bounty-hunter status

# 手动扫描
openclaw bounty-hunter scan

# 查看结果
openclaw bounty-hunter list
```

---

## 📖 详细功能

### 1. GitHub Issues 监控

#### 工作原理
- 通过 GitHub API 搜索带 bounty 标签的 Issues
- 分析项目活跃度（commit 频率、维护者响应）
- 评估预算合理性（对比类似项目）
- 计算竞争强度（评论数、关注者）

#### 搜索策略
```javascript
// 内置搜索查询
const queries = [
  'label:bounty state:open',
  'label:paid state:open',
  'label:sponsor state:open',
  'label:grant state:open',
  'bounty in:title state:open',
  'paid in:title state:open'
];
```

#### 输出示例
```json
{
  "id": "gh-142",
  "platform": "github",
  "repository": "ethereum/solidity",
  "issueNumber": 142,
  "title": "Compiler Optimization Bounty",
  "description": "...",
  "budget": {
    "min": 3000,
    "max": 5000,
    "currency": "USD"
  },
  "tags": ["bounty", "compiler", "optimization"],
  "createdAt": "2024-03-08T10:00:00Z",
  "comments": 3,
  "participants": 5,
  "roiScore": 92,
  "skillMatch": 85,
  "competitionLevel": "low"
}
```

### 2. Upwork 监控

#### 工作原理
- 通过 Upwork API（需开发者账号）或 RSS 订阅
- 关键词匹配 + 语义分析
- 客户资质验证（历史支出、评分、支付验证）
- 自动过滤低质量项目

#### 筛选逻辑
```javascript
function filterJob(job) {
  // 预算检查
  if (job.budget < config.minBudget) return false;
  
  // 关键词排除
  if (job.title.match(/entry level|urgent|asap/i)) return false;
  
  // 客户资质
  if (job.client.spent < 1000) return false;
  if (job.client.rating < 4.5) return false;
  if (!job.client.paymentVerified) return false;
  
  // 技能匹配
  const matchScore = calculateSkillMatch(job.skills, profile.skills);
  if (matchScore < 70) return false;
  
  return true;
}
```

#### 输出示例
```json
{
  "id": "up-88291",
  "platform": "upwork",
  "title": "React + Web3 Wallet Integration",
  "description": "...",
  "budget": {
    "amount": 2500,
    "type": "fixed",
    "currency": "USD"
  },
  "skills": ["React", "Web3.js", "Ethereum", "MetaMask"],
  "client": {
    "country": "United States",
    "spent": 50000,
    "rating": 4.9,
    "jobsPosted": 23,
    "hireRate": 85,
    "paymentVerified": true
  },
  "postedAt": "2024-03-09T06:00:00Z",
  "proposals": 12,
  "roiScore": 88,
  "skillMatch": 95
}
```

### 3. Bug Bounty 监控

#### 支持平台
- **HackerOne** - 最大漏洞众测平台
- **Bugcrowd** - 企业级漏洞奖励
- **Immunefi** - Web3/DeFi 专项
- **YesWeHack** - 欧洲平台

#### 评估维度
- 奖金范围（min/max）
- 目标类型（web/api/mobile/smart-contract）
- 历史响应时间
- 漏洞接受率
- 竞争程度（已提交报告数）

#### 输出示例
```json
{
  "id": "bb-h1-2024-001",
  "platform": "hackerone",
  "program": "Shopify",
  "title": "Shopify Bug Bounty Program",
  "bounty": {
    "min": 500,
    "max": 50000,
    "currency": "USD"
  },
  "categories": ["web", "api", "mobile"],
  "targets": [
    "*.shopify.com",
    "*.myshopify.com"
  ],
  "stats": {
    "avgResponseTime": "2 days",
    "acceptanceRate": "65%",
    "totalReports": 1250,
    "validReports": 812
  },
  "roiScore": 78,
  "skillMatch": 70
}
```

### 4. ROI 计算引擎

#### 评分公式
```
ROI Score = (Budget Score × 0.3) + 
            (Skill Match × 0.3) + 
            (Competition Score × 0.2) + 
            (Client Quality × 0.2)
```

#### 各维度计算

**Budget Score (0-100)**
- $500-1000: 60 分
- $1000-3000: 75 分
- $3000-10000: 90 分
- $10000+: 100 分

**Skill Match (0-100)**
- 基于技能关键词重叠度
- 考虑技能熟练度权重
- 历史类似项目成功率加成

**Competition Score (0-100)**
- 申请人数越少分数越高
- 发布时间越近分数越高
- 冷门技能需求分数更高

**Client Quality (0-100)**
- 历史支出金额
- 平均评分
- 雇佣率
- 支付验证状态

### 5. 自动提案生成

#### 提案结构
```markdown
# 提案模板

## 开场白
Hi [Client Name],

I noticed you're looking for [skill] help with [project]. 
I've worked on [similar project] and delivered [result].

## 技术方案
Based on your requirements, here's my approach:

1. [Phase 1] - [Description] - [Timeline]
2. [Phase 2] - [Description] - [Timeline]
3. [Phase 3] - [Description] - [Timeline]

## 相关经验
- [Project 1] - [Tech Stack] - [Result]
- [Project 2] - [Tech Stack] - [Result]

## 时间线
Total estimated time: [X weeks]
- Week 1: [Milestone 1]
- Week 2: [Milestone 2]
- ...

## 报价
Based on the scope, my estimate is: $[Amount]
This includes: [deliverables]

## 下一步
I'm available to start [date]. Let's discuss the details!

Best regards,
[Your Name]
```

#### 生成命令
```bash
# 为特定机会生成提案
openclaw bounty-hunter propose gh-142

# 自定义提案风格
openclaw bounty-hunter propose up-88291 --style formal

# 批量生成
openclaw bounty-hunter propose --all --limit 5
```

---

## 🔧 命令行参考

### 基础命令

| 命令 | 描述 |
|------|------|
| `scan` | 扫描所有启用的平台 |
| `list` | 列出发现的机会 |
| `propose <id>` | 为指定机会生成提案 |
| `status` | 显示配置和许可状态 |
| `stats` | 显示历史统计数据 |

### 选项

```bash
# 平台筛选
--platform github|upwork|bugbounty

# 时间筛选
--today          # 仅今日
--week           # 本周
--since <date>   # 指定日期后

# 分数筛选
--min-score 80   # 最低 ROI 分数
--max-score 100  # 最高 ROI 分数

# 输出格式
--format json|table|markdown
--output <file>  # 导出到文件

# 其他
--quiet          # 安静模式
--verbose        # 详细输出
--dry-run        # 测试运行（不保存）
```

### 示例

```bash
# 扫描 GitHub，最低分数 85
openclaw bounty-hunter scan --platform github --min-score 85

# 列出本周机会，导出为 JSON
openclaw bounty-hunter list --week --format json --output opportunities.json

# 为前 3 个高优先级机会生成提案
openclaw bounty-hunter list --min-score 90 --limit 3 | \
  xargs -I {} openclaw bounty-hunter propose {}
```

---

## 📊 统计与报告

### 查看统计
```bash
openclaw bounty-hunter stats
```

### 输出示例
```
🦞 Bounty Hunter Pro - 统计报告

扫描周期：2024-02-09 ~ 2024-03-09

【机会发现】
- 总计扫描：1,247 次
- 发现机会：342 个
  - GitHub: 128 个
  - Upwork: 156 个
  - Bug Bounty: 58 个

【提案统计】
- 生成提案：89 个
- 已提交：67 个
- 中标：12 个
- 中标率：17.9%

【收入追踪】
- 总收入：$28,500
- 平均项目：$2,375
- ROI 最高项目：$8,000 (GitHub solidity bounty)

【时间投入】
- 扫描耗时：2.3 小时
- 提案撰写：8.5 小时
- 实际工作：142 小时
- 有效时薪：$177/hr
```

---

## 💰 定价详情

### 次卡 ¥20/次
适合：
- 偶尔找项目
- 预算有限
- 想先试用

包含：
- ✅ 单次全平台扫描
- ✅ 最多 3 个提案生成
- ✅ 基础 ROI 评分
- ❌ 无自动通知
- ❌ 无历史记录

### 月卡 ¥199/月
适合：
- 活跃自由职业者
- 每周投标 5+ 次
- 需要自动化

包含：
- ✅ 无限次扫描
- ✅ 无限提案生成
- ✅ 实时通知推送
- ✅ 历史记录保存
- ✅ 提案模板库
- ✅ 基础统计报告
- ❌ 无优先支持

### 年卡 ¥1999/年
适合：
- 全职自由职业者
- 工作室/小团队
- 需要定制功能

包含：
- ✅ 月卡全部功能
- ✅ 优先技术支持
- ✅ 定制关键词策略
- ✅ 高级统计分析
- ✅ API 访问权限
- ✅ 团队协作功能
- ✅ 季度策略 review

### 购买方式
1. 访问 SkillPay 技能市场
2. 搜索 "Bounty Hunter Pro"
3. 选择套餐完成支付
4. 复制激活码到配置文件

---

## ⚠️ 注意事项

### 平台合规
- **Upwork** - 自动化监控需遵守服务条款，不建议自动投标
- **GitHub** - API 调用遵守 rate limit（每小时 5000 次）
- **Bug Bounty** - 仅监控公开项目，遵守各平台规则

### 风险提示
- ⚠️ 本工具不保证中标或获得赏金
- ⚠️ Bug Bounty 需要专业技能，请勿盲目尝试
- ⚠️ 部分平台可能限制自动化访问
- ⚠️ 收入数据仅供参考，个体差异较大

### 最佳实践
- ✅ 定期更新技能档案
- ✅ 根据中标率调整筛选策略
- ✅ 人工审核提案后再提交
- ✅ 追踪实际收入优化 ROI 模型

---

## 🛠️ 故障排除

### 常见问题

**Q: 扫描结果为空？**
```bash
# 检查配置
openclaw bounty-hunter status

# 放宽筛选条件
# 编辑 config 降低 minBudget 和 minScore

# 检查网络连接
curl https://api.github.com
```

**Q: 提案生成失败？**
```bash
# 检查 SkillPay 许可
openclaw skillpay status

# 检查个人档案完整性
# 确保 skills 字段非空
```

**Q: 通知不推送？**
```bash
# 检查通知配置
# 确认 channel 有效（feishu/telegram）
# 测试通知
openclaw bounty-hunter notify --test
```

### 日志位置
```bash
# 查看运行日志
tail -f ~/.openclaw/logs/bounty-hunter.log

# 调试模式
openclaw bounty-hunter scan --verbose
```

---

## 📞 技术支持

- **文档**: 本文件
- **Skill 说明**: `SKILL.md`
- **问题反馈**: GitHub Issues
- **商务合作**: SkillPay 消息
- **社区讨论**: 加入 Telegram 群组

---

*Built with 🦞 by OpenClaw Community*

**让 AI 帮你找活干，你只管收钱**
