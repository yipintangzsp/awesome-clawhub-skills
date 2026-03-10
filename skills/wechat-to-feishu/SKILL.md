---
name: wechat-to-feishu
description: 自动抓取公众号文章并保存到飞书文档
user-invocable: true
metadata:
  openclaw:
    requires:
      env:
        - FEISHU_APP_ID
        - FEISHU_APP_SECRET
      bins:
        - curl
---

# 公众号文章搬运到飞书

## 描述
自动抓取指定公众号文章，提取标题、内容、图片，并创建飞书文档保存。

## 触发条件
当用户说"搬运公众号文章"、"保存到飞书"、"抓取微信文章"时使用此技能。
当用户没有提供公众号文章链接时，不使用此技能。

## 指令
按以下步骤执行：
1. 读取用户提供的公众号文章链接
2. 使用 playwright-scraper 爬取文章内容（标题、正文、图片）
3. 调用 feishu-doc API 创建新文档
4. 将内容写入飞书文档
5. 返回文档链接

## 输出格式
必须严格按照以下格式输出：

```markdown
# 文章已保存到飞书

- 标题：[文章标题]
- 飞书链接：[文档 URL]
- 保存时间：YYYY-MM-DD HH:mm
```

## 约束条件
- 不要修改原始文章内容
- 不要保存付费墙后的内容
- 如果无法访问，返回错误信息
