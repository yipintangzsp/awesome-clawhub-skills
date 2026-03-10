---
name: twitter-bookmark-assistant
description: 每日 Twitter 书签同步和报告工作流程
user-invocable: true
metadata:
  openclaw:
    requires:
      env:
        - TWITTER_COOKIES
        - API_KEY_6551
      bins:
        - curl
        - sqlite3
---

# Twitter 书签管理助手

## 描述
每天定时获取 Twitter 书签更新，首次获取时下载全部书签到本地文件夹，后续只获取新书签，每日生成书签报告。

## 触发条件
当用户说"同步 Twitter 书签"、"查看书签"、"书签报告"时使用此技能。
当用户没有配置 TWITTER_COOKIES 或 API_KEY_6551 时，不使用此技能。

## 指令
按以下步骤执行：
1. 检查 state.json 判断是否首次运行
2. 首次运行：获取全部书签并保存到 SQLite 数据库
3. 后续运行：增量获取新书签（遇到 10 个连续已存在书签时停止）
4. 使用 6551 API 下载书签媒体内容
5. 生成每日书签报告（仅显示未读）

## 输出格式
必须严格按照以下格式输出：

```markdown
# 书签日报 - YYYY-MM-DD

- 同步时间：YYYY-MM-DD HH:MM:SS
- 今日新增：X 条
- 未读总数：X 条

## 未读清单
- [ ] [标题或摘要](URL)
  - 作者：@xxx
  - 收藏时间：YYYY-MM-DD
  - ID: `tweet_id`
```

## 约束条件
- 不要删除已保存的书签
- 不要生成超过 100 条的报告
- 如果 API 失败，返回错误信息
