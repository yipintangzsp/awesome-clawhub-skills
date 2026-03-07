---
name: travel-planner
description: 智能旅行规划，生成行程安排、预算估算和旅行贴士。
metadata: {"openclaw":{"requires":{"bins":["node"]},"install":[{"id":"node","kind":"node","package":"node-fetch","label":"Install node-fetch"}]}}
---

# Travel Planner - 智能旅行规划

生成目的地行程安排、预算估算和实用旅行贴士。

## 使用方式

```bash
# 3 天行程
travel-planner 东京 3

# 7 天行程
travel-planner "Paris" 7

# 参数：目的地 天数
```

## 功能特点

- ✈️ 行程规划
- 💰 预算估算
- 💡 旅行贴士
- 💰 SkillPay 收费集成（¥3/次）

## 输出内容

| 项目 | 说明 |
|------|------|
| 行程 | 每日安排 |
| 预算 | 住宿/餐饮/交通 |
| 景点 | 推荐打卡地 |
| 贴士 | 实用建议 |

## 配置

在 `~/.openclaw/workspace/config/travel-planner.json` 配置 SkillPay API Key。
