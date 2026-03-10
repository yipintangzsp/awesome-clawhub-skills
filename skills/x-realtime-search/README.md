# X Realtime Search - 实时 X 平台搜索工具

## 📖 概述

X Realtime Search 是一个强大的技能，允许你实时搜索 X (Twitter) 平台上的内容。通过调用本地 Grok 桥接服务，你可以获取最新推文、分析话题趋势、进行情感分析，并支持多维度筛选。

### 核心功能

- 🔍 **实时搜索**: 获取 X 平台最新推文，延迟<5 分钟
- 📊 **情感分析**: AI 驱动的情感判断（正面/负面/中性）
- 🎯 **精准筛选**: 按时间、用户类型、语言、互动量筛选
- 📈 **趋势分析**: 识别热门话题和关键词
- 💾 **多格式导出**: JSON、CSV、Markdown 格式导出

---

## 🚀 快速开始

### 1. 安装技能

```bash
openclaw skills install x-realtime-search
```

### 2. 配置

复制配置模板并填写你的 Grok 桥接服务信息：

```bash
cp config.example.json config.json
```

编辑 `config.json`：

```json
{
  "grokBridge": {
    "url": "http://localhost:3000",
    "apiKey": "your-api-key-here"
  },
  "search": {
    "defaultLimit": 20,
    "maxLimit": 100,
    "defaultTimeRange": "24h"
  },
  "sentiment": {
    "enabled": true,
    "model": "qwen3.5-plus"
  }
}
```

### 3. 使用示例

#### 基础搜索
```bash
/x-search "AI agent"
```

#### 高级搜索
```bash
# 搜索过去 6 小时的加密货币内容，仅认证用户
/x-search "crypto" --time 6h --user-type verified --lang en

# 搜索中文 AI 相关内容，带情感分析
/x-search "人工智能" --sentiment --lang zh --limit 50

# 导出为 JSON 格式
/x-search "tech news" --export json --time 24h
```

---

## 📋 参数详解

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `query` | string | 必填 | 搜索关键词 |
| `--time` | string | 24h | 时间范围：1h, 6h, 24h, 7d, 30d |
| `--user-type` | string | all | 用户类型：all, verified, influencers |
| `--lang` | string | auto | 语言代码：zh, en, ja, ko 等 |
| `--sentiment` | boolean | false | 是否启用情感分析 |
| `--limit` | number | 20 | 返回结果数量（1-100） |
| `--export` | string | none | 导出格式：json, csv, markdown |
| `--min-likes` | number | 0 | 最小点赞数筛选 |
| `--min-retweets` | number | 0 | 最小转发数筛选 |

---

## 💰 定价策略

### 按次付费
- **价格**: ¥10/次
- **适用**: 偶尔使用，测试功能
- **结算**: 每次搜索成功扣费

### 月订阅
- **价格**: ¥99/月
- **适用**: 频繁使用者
- **优势**: 无限次搜索，性价比最高

### 年订阅
- **价格**: ¥999/年
- **适用**: 长期重度用户
- **优势**: 约¥83/月，节省 16%

### 免费额度
新用户注册赠送 3 次免费搜索体验。

---

## 🔧 技术架构

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   用户命令   │ ──► │  Skill 逻辑   │ ──► │ Grok 桥接   │
│  /x-search  │     │  index.js    │     │  服务：3000  │
└─────────────┘     └──────────────┘     └─────────────┘
                           │                      │
                           ▼                      ▼
                    ┌──────────────┐     ┌─────────────┐
                    │  SkillPay    │     │   X API     │
                    │  支付集成     │     │  实时数据    │
                    └──────────────┘     └─────────────┘
```

### 核心模块

1. **search.js**: 搜索逻辑和参数处理
2. **sentiment.js**: 情感分析引擎
3. **export.js**: 数据导出格式化
4. **payment.js**: SkillPay 支付集成

---

## 📊 输出格式

### 标准输出
```
🔍 搜索结果："AI agent" (过去 24 小时)

📈 共找到 47 条推文

【情感分布】
✅ 正面：62%
⚠️ 中性：28%
❌ 负面：10%

【热门推文】
1. @elonmusk (12.5K👍)
   "AI agents will replace most software..."
   
2. @sama (8.3K👍)
   "The future of AI is autonomous agents..."

【趋势关键词】
#AIAgents #Automation #LLM #AGI
```

### JSON 导出
```json
{
  "query": "AI agent",
  "timeRange": "24h",
  "totalResults": 47,
  "sentiment": {
    "positive": 62,
    "neutral": 28,
    "negative": 10
  },
  "tweets": [...],
  "trends": [...]
}
```

---

## ⚠️ 注意事项

1. **速率限制**: X API 有调用频率限制，建议避免短时间内大量搜索
2. **配置要求**: 需确保本地 Grok 桥接服务正常运行
3. **情感分析延迟**: 启用情感分析会增加 2-3 秒处理时间
4. **数据缓存**: 相同查询 5 分钟内会返回缓存结果（不重复扣费）

---

## 🆘 常见问题

### Q: 搜索返回空结果？
A: 检查关键词是否过于冷门，或尝试扩大时间范围。

### Q: 情感分析不准确？
A: 当前模型对中文支持较好，其他语言可能有偏差。

### Q: 如何取消订阅？
A: 通过 SkillPay 后台管理你的订阅。

### Q: 支持历史数据搜索吗？
A: 当前仅支持最近 30 天的数据，更深历史需定制服务。

---

## 📞 技术支持

- 文档：https://github.com/clawdbot/x-realtime-search
- 问题反馈：开 GitHub Issue
- 社区：Discord #skills-support

---

**版本**: 1.0.0  
**作者**: Clawdbot Team  
**许可**: MIT
