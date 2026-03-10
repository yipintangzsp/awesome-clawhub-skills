# Twitter 书签管理助手 Skill

## 功能
每天定时获取 Twitter/X 书签更新，使用 6551 API + SQLite 存储，输出每日书签报告（Markdown 格式）。

## 使用方式

### 手动同步
```bash
cd skills/custom-skills/twitter-bookmarks
./sync_bookmarks.sh
```

### 查看历史书签
```bash
./view_bookmarks.sh [--date 2024-01-15] [--limit 20]
```

### 定时任务
添加到 crontab，每天早上 8 点执行：
```bash
0 8 * * * cd /Users/admin/.openclaw/workspace/skills/custom-skills/twitter-bookmarks && ./sync_bookmarks.sh
```

## 配置
编辑 `config.json`：
```json
{
  "api_key": "你的 6551 API Key",
  "api_secret": "你的 6551 API Secret",
  "twitter_username": "你的 Twitter 用户名",
  "db_path": "./bookmarks.db",
  "output_dir": "./reports",
  "daily_report": true
}
```

## 依赖
- Node.js
- SQLite3
- 6551 API 访问权限
- 网络连接

## 输出
- `bookmarks.db` - SQLite 数据库（存储所有书签）
- `reports/daily_YYYY-MM-DD.md` - 每日书签报告
- stdout 输出最新书签列表

## 数据库结构
```sql
CREATE TABLE bookmarks (
    id TEXT PRIMARY KEY,
    tweet_text TEXT,
    author_name TEXT,
    author_username TEXT,
    created_at INTEGER,
    bookmarked_at INTEGER,
    tweet_url TEXT,
    media_count INTEGER DEFAULT 0
);
```

## 注意事项
1. 6551 API 需要有效的 API Key 和 Secret
2. 首次运行会创建 SQLite 数据库
3. 重复书签会自动跳过（基于 tweet ID 去重）
