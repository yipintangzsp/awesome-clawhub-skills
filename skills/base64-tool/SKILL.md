---
name: base64-tool
description: Base64 编码/解码工具，支持文本和图片的 Base64 转换。
metadata: {"openclaw":{"requires":{"bins":["node"]},"install":[{"id":"node","kind":"node","package":"node-fetch","label":"Install node-fetch"}]}}
---

# Base64 Tool - Base64 编码/解码工具

快速进行 Base64 编码和解码，支持文本和图片数据。

## 使用方式

```bash
# 编码
base64-tool "Hello World"

# 解码
base64-tool "SGVsbG8gV29ybGQ=" --decode
```

## 功能特点

- 🔣 编码/解码
- 📝 文本支持
- 🖼️ 图片 Base64（如支持）
- 💰 SkillPay 收费集成（¥0.5/次）

## 示例输出

```
操作：encode
输入：Hello World
输出：SGVsbG8gV29ybGQ=
```

## 配置

在 `~/.openclaw/workspace/config/base64-tool.json` 配置 SkillPay API Key。
