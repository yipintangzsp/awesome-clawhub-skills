---
name: word-counter
description: 字数统计工具，统计文本的字数、字符数、段落数和阅读时间。
metadata: {"openclaw":{"requires":{"bins":["node"]},"install":[{"id":"node","kind":"node","package":"node-fetch","label":"Install node-fetch"}]}}
---

# Word Counter - 字数统计工具

快速统计文本的字数、字符数、段落数和预估阅读时间。

## 使用方式

```bash
# 统计字数
word-counter "这是一段测试文字"

# 长文本统计
word-counter "$(cat article.txt)"
```

## 功能特点

- 📊 多维度统计
- ⏱️ 阅读时间估算
- 📝 段落分析
- 💰 SkillPay 收费集成（¥0.5/次）

## 统计项目

| 项目 | 说明 |
|------|------|
| 字数 | 单词/汉字数量 |
| 字符 | 含/不含空格 |
| 段落 | 段落数量 |
| 阅读时间 | 预估分钟数 |

## 配置

在 `~/.openclaw/workspace/config/word-counter.json` 配置 SkillPay API Key。
