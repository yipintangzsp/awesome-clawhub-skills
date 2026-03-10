# 自定义 Skills 创建报告

**创建时间：** 2026-03-10 00:35  
**来源：** 基于 @Researcher_王十三 和 @李岳 的教程

---

## ✅ 已创建 Skills（3 个）

| Skill | 功能 | 状态 |
|------|------|------|
| weibo-hot-search | 微博热搜爬虫 | ✅ 已完成 |
| wechat-to-feishu | 公众号文章搬运到飞书 | ✅ 已完成 |
| twitter-bookmark-assistant | Twitter 书签管理助手 | ✅ 已完成 |

---

## 📁 文件结构

```
skills/
├── weibo-hot-search/
│   ├── SKILL.md
│   └── index.sh
├── wechat-to-feishu/
│   └── SKILL.md
└── twitter-bookmark-assistant/
    └── SKILL.md
```

---

## 🔧 使用说明

### 1. 微博热搜爬虫
```bash
# 手动执行
./skills/weibo-hot-search/index.sh

# OpenClaw 自动调用
"帮我爬微博热搜"
```

### 2. 公众号文章搬运到飞书
**需要配置：**
- FEISHU_APP_ID
- FEISHU_APP_SECRET

```bash
# OpenClaw 自动调用
"把这篇公众号文章保存到飞书：[链接]"
```

### 3. Twitter 书签管理助手
**需要配置：**
- TWITTER_COOKIES
- API_KEY_6551

```bash
# OpenClaw 自动调用
"同步我的 Twitter 书签"
"生成书签报告"
```

---

## 📋 下一步

1. **配置环境变量**（飞书/Twitter/6551 API）
2. **测试 Skills**（确保正常运行）
3. **设置定时任务**（每天自动执行）
4. **创建更多 Skills**（根据业务需求）

---

**继续执行中！** 💰🚀
