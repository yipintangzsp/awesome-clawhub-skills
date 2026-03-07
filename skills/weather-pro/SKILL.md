---
name: weather-pro
description: 专业天气预报，提供多日天气、温度、降水概率等详细信息。
metadata: {"openclaw":{"requires":{"bins":["node"]},"install":[{"id":"node","kind":"node","package":"node-fetch","label":"Install node-fetch"}]}}
---

# Weather Pro - 专业天气预报

提供多日天气预报，包括温度、降水、风速等详细信息。

## 使用方式

```bash
# 3 天预报
weather-pro 北京

# 7 天预报
weather-pro 上海 --days 7

# 指定城市
weather-pro "New York" --days 5
```

## 功能特点

- 🌤️ 多日预报
- 🌡️ 温度/降水/风速
- 📍 全球城市支持
- 💰 SkillPay 收费集成（¥0.5/次）

## 预报内容

| 项目 | 说明 |
|------|------|
| 温度 | 最高/最低 |
| 天气 | 晴/雨/多云 |
| 降水 | 概率/降水量 |
| 风速 | 风向/风力 |

## 配置

在 `~/.openclaw/workspace/config/weather-pro.json` 配置 SkillPay API Key。
