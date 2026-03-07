---
name: hashtag-generator
description: 社交媒体标签生成器，为 Instagram、Twitter、TikTok 生成热门标签。
metadata: {"openclaw":{"requires":{"bins":["node"]},"install":[{"id":"node","kind":"node","package":"node-fetch","label":"Install node-fetch"}]}}
---

# Hashtag Generator - 标签生成器

为 Instagram、Twitter、TikTok 生成热门话题标签，提升内容曝光率。

## 使用方式

```bash
# Instagram 标签
hashtag-generator "旅行" instagram

# Twitter 标签
hashtag-generator "AI 技术" twitter

# TikTok 标签
hashtag-generator "美食" tiktok
```

## 功能特点

- 📱 多平台支持
- 🔥 热门标签推荐
- 🎯 平台定制化
- 💰 SkillPay 收费集成（¥1/次）

## 支持平台

| 平台 | 标签数量 | 特点 |
|------|----------|------|
| Instagram | 10-30 个 | 高曝光 |
| Twitter | 3-5 个 | 精准 |
| TikTok | 5-8 个 |  trending |

## 配置

在 `~/.openclaw/workspace/config/hashtag-generator.json` 配置 SkillPay API Key。
