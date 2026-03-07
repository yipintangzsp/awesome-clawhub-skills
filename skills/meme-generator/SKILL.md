---
name: meme-generator
description: 表情包生成器，快速创建热门梗图，支持多种模板。
metadata: {"openclaw":{"requires":{"bins":["node"]},"install":[{"id":"node","kind":"node","package":"node-fetch","label":"Install node-fetch"}]}}
---

# Meme Generator - 表情包生成器

快速创建热门梗图，支持多种经典模板。

## 使用方式

```bash
# Drake 模板
meme-generator drake "加班" "摸鱼"

# Distracted Boyfriend
meme-generator distracted "新项目" "老项目" "我"

# Change My Mind
meme-generator change "摸鱼效率高"
```

## 功能特点

- 😂 热门模板
- 📝 自定义文字
- 🖼️ 即时生成
- 💰 SkillPay 收费集成（¥0.5/次）

## 支持模板

| 模板 | 说明 |
|------|------|
| drake | Drake 拒绝/接受 |
| distracted | 分心男友 |
| change | Change My Mind |
| success | 成功小孩 |

## 配置

在 `~/.openclaw/workspace/config/meme-generator.json` 配置 SkillPay API Key。
