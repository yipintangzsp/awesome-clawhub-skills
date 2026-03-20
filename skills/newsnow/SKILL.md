---
name: newsnow
description: 获取实时热门新闻。使用 web_search 搜索热点新闻，支持定时推送每日摘要。
user-invocable: true
metadata: { "openclaw": { "emoji": "📰" } }
---

# NewsNow Skill - 实时新闻聚合

## 核心能力
1. 获取实时热门新闻（通过 web_search）
2. 按分类筛选（科技/财经/国际等）
3. 每日新闻摘要推送（定时任务）

## 使用方法

### 获取热门新闻
```
获取热门新闻
今天有什么热点新闻
看看科技新闻
```

### 定时推送
```
每天早上 8 点推送新闻摘要
```

## 实现流程

1. 使用 `web_search` 工具搜索 "今日热点"、"新闻头条"
2. 用 `web_fetch` 提取新闻详情
3. AI 总结 Top 10 新闻
4. 格式化输出

## 输出格式
```markdown
## 📰 热门新闻 {{日期}}

1. **标题** - 来源
   简介...

2. **标题** - 来源
   简介...
...
```

## 定时任务配置
```bash
openclaw cron add newsnow-daily "newsnow 推送每日新闻" --schedule "0 8 * * *"
```
