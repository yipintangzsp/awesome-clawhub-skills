---
name: bio-generator
description: 个人简介生成器，为社交媒体、求职网站生成专业/休闲风格的自我介绍。
metadata: {"openclaw":{"requires":{"bins":["node"]},"install":[{"id":"node","kind":"node","package":"node-fetch","label":"Install node-fetch"}]}}
---

# Bio Generator - 个人简介生成器

为社交媒体、求职网站生成专业或个人风格的自我介绍。

## 使用方式

```bash
# 专业风格
bio-generator "张三" "软件工程师" professional

# 休闲风格
bio-generator "李四" "摄影师" casual

# 创意风格
bio-generator "王五" "设计师" creative
```

## 功能特点

- ✍️ 多种风格选择
- 🎯 职业定制化
- ⚡ 即时生成
- 💰 SkillPay 收费集成（¥1/次）

## 支持风格

| 风格 | 适用场景 |
|------|----------|
| professional | 领英、求职 |
| casual | 微信、朋友圈 |
| creative | 小红书、Instagram |
| minimal | Twitter、微博 |

## 配置

在 `~/.openclaw/workspace/config/bio-generator.json` 配置 SkillPay API Key。
