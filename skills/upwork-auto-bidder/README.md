# Upwork Auto Bidder 🚀

自动监控 Upwork 项目，智能筛选 + 自动投标，让你不错过任何好机会。

## 功能特性

- 🔔 **实时监控**: 7x24 小时监控 Upwork 新职位
- 🎯 **智能筛选**: 按关键词、预算、客户评分自动过滤
- ✍️ **AI 投标**: 自动生成个性化投标文案
- 📊 **数据统计**: 投标成功率、收益追踪
- ⏸️ **灵活控制**: 随时暂停/恢复/调整策略

## 安装

技能已预装到 `~/.openclaw/workspace/skills/upwork-auto-bidder/`

## 快速开始

### 1. 配置筛选条件
```
/upwork-auto-bidder --config
  --keywords "react,nodejs,typescript"
  --min-budget 500
  --max-budget 10000
  --client-score 4.5
  --client-spent 10000
```

### 2. 启动自动投标
```
/upwork-auto-bidder --start
```

### 3. 查看状态
```
/upwork-auto-bidder --status
```

## 配置选项

| 参数 | 说明 | 默认值 |
|------|------|--------|
| --keywords | 关键词 (逗号分隔) | 必填 |
| --min-budget | 最低预算 ($) | 0 |
| --max-budget | 最高预算 ($) | ∞ |
| --client-score | 最低客户评分 | 4.0 |
| --client-spent | 客户历史消费 ($) | 0 |
| --daily-limit | 每日投标上限 | 20 |

## 投标文案模板

系统会根据项目描述自动生成投标文案，包含：
- 相关项目经验
- 技术方案概述
- 时间预估
- 报价建议

## 定价说明

- ¥39/月：无限监控 + 每日 20 次自动投标
- ¥99/季：季度优惠
- ¥299/年：年度优惠

## 注意事项

⚠️ 需要配置 Upwork API Key
⚠️ 建议先手动审核前几次投标文案
⚠️ 过度投标可能导致账号限制

## 支持

联系 @张 sir
