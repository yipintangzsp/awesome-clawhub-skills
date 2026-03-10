# Bounty Hunter Pro - 赏金猎人专业版

## 技能描述

**Bounty Hunter Pro** 是一个自动化赏金机会发现与提案系统，帮助开发者和技术人员被动获取高价值项目机会。

通过监控 GitHub Issues、Upwork 自由职业平台、Bug Bounty 安全众测平台，自动筛选高 ROI 机会并生成专业提案，让你睡觉时也有钱进账。

## 核心功能

### 1. 多平台监控
- **GitHub Issues** - 监控带 `bounty`、`paid`、`sponsor` 标签的开源项目
- **Upwork** - 基于关键词筛选高价值技术项目（自动过滤低预算）
- **Bug Bounty** - 监控 HackerOne、Bugcrowd、Immunefi 等平台新目标

### 2. 智能 ROI 计算
自动评估每个机会的投入产出比：
- 预算金额 vs 预估工时
- 竞争强度分析
- 历史中标率参考
- 技能匹配度评分

### 3. 自动提案生成
基于机会描述和你的技能档案，生成：
- 个性化开场白
- 技术方案大纲
- 时间线估算
- 报价建议

### 4. 实时通知
- Telegram/飞书推送高优先级机会
- 每日摘要报告
- 中标追踪

## 使用方法

### 基础命令
```bash
# 手动扫描所有平台
openclaw bounty-hunter scan

# 仅扫描 GitHub
openclaw bounty-hunter scan --platform github

# 查看今日机会
openclaw bounty-hunter list --today

# 生成提案
openclaw bounty-hunter propose <opportunity-id>
```

### 配置选项
在 `~/.openclaw/workspace/config/bounty-hunter.json` 中配置：

```json
{
  "platforms": {
    "github": {
      "enabled": true,
      "keywords": ["bounty", "paid", "sponsor"],
      "minBudget": 500
    },
    "upwork": {
      "enabled": true,
      "keywords": ["react", "node.js", "python", "blockchain"],
      "minBudget": 1000,
      "excludeKeywords": ["entry level", "urgent"]
    },
    "bugbounty": {
      "enabled": true,
      "platforms": ["hackerone", "bugcrowd", "immunefi"],
      "minBounty": 1000
    }
  },
  "notification": {
    "channel": "feishu",
    "minScore": 75
  },
  "profile": {
    "skills": ["JavaScript", "Python", "Solidity", "Security"],
    "hourlyRate": 150,
    "availability": "20h/week"
  }
}
```

### 定时任务
```bash
# 添加到 crontab，每 4 小时扫描一次
0 */4 * * * openclaw bounty-hunter scan --quiet
```

## 定价

| 套餐 | 价格 | 功能 |
|------|------|------|
| **次卡** | ¥20/次 | 单次扫描 + 3 个提案生成 |
| **月卡** | ¥199/月 | 无限扫描 + 自动通知 + 提案模板 |
| **年卡** | ¥1999/年 | 月卡功能 + 优先支持 + 定制关键词 |

## 付费方式

通过 SkillPay 购买激活码：
1. 访问 SkillPay 技能市场
2. 搜索 "Bounty Hunter Pro"
3. 选择套餐并支付
4. 获得激活码填入配置文件

```json
{
  "license": "YOUR-SKILLPAY-LICENSE-KEY"
}
```

## 输出示例

```
🦞 Bounty Hunter Pro - 今日机会报告

【高优先级】GitHub Issue #142
项目：ethereum/solidity
预算：$3,000 - $5,000
标签：bounty, compiler, optimization
ROI 评分：92/100
竞争：低（3 人申请）
→ 运行 `openclaw bounty-hunter propose 142` 生成提案

【中优先级】Upwork #UP-88291
标题：React + Web3 钱包集成
预算：$2,500 (固定)
技能匹配：95%
→ 运行 `openclaw bounty-hunter propose UP-88291`
```

## 注意事项

- ⚠️ 本工具仅提供信息聚合和提案辅助，不保证中标
- ⚠️ Upwork 自动化需遵守平台服务条款
- ⚠️ Bug Bounty 需要相关安全技能，请勿盲目尝试
- 💡 建议配合个人技能档案使用，提高匹配精度

## 技术支持

- 文档：`skills/bounty-hunter-pro/README.md`
- 问题反馈：GitHub Issues
- 商务合作：通过 SkillPay 消息

---

*让 AI 帮你找活干，你只管收钱 💰*
