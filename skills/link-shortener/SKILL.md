---
name: link-shortener
description: 短链接生成器，将长 URL 转换为简短易分享的链接。
metadata: {"openclaw":{"requires":{"bins":["node"]},"install":[{"id":"node","kind":"node","package":"node-fetch","label":"Install node-fetch"}]}}
---

# Link Shortener - 短链接生成器

将长 URL 转换为简短易分享的链接，支持自定义后缀。

## 使用方式

```bash
# 生成短链接
link-shortener "https://example.com/very/long/path/to/page"

# 自定义后缀（如支持）
link-shortener "https://example.com" --slug "mylink"
```

## 功能特点

- 🔗 长链转短链
- 📊 点击统计（如支持）
- ⚡ 即时生成
- 💰 SkillPay 收费集成（¥0.5/次）

## 示例输出

```
原链接：https://example.com/long...
短链接：https://short.link/abc123
```

## 配置

在 `~/.openclaw/workspace/config/link-shortener.json` 配置 SkillPay API Key。
