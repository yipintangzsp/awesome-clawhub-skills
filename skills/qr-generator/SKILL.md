---
name: qr-generator
description: 二维码生成器，支持 URL、文本、WiFi 等，快速生成高质量 QR 码。
metadata: {"openclaw":{"requires":{"bins":["node"]},"install":[{"id":"node","kind":"node","package":"node-fetch","label":"Install node-fetch"}]}}
---

# QR Generator - 二维码生成器

快速生成高质量二维码，支持 URL、文本、WiFi 配置等。

## 使用方式

```bash
# 生成 URL 二维码
qr-generator "https://example.com"

# 生成 WiFi 二维码
qr-generator "WIFI:T:WPA;S:MyNetwork;P:password123;;"

# 生成文本二维码
qr-generator "Hello World"
```

## 功能特点

- 📱 高质量 QR 码
- 🔗 支持 URL/文本/WiFi
- ⚡ 即时生成
- 💰 SkillPay 收费集成（¥0.5/次）

## 示例输出

```
类型：QR Code
内容：https://example.com
下载：https://api.qrserver.com/v1/create-qr-code/...
```

## 配置

在 `~/.openclaw/workspace/config/qr-generator.json` 配置 SkillPay API Key。
