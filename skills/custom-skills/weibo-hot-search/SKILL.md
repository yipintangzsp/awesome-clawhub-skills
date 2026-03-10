# 微博热搜爬虫 Skill

## 功能
每天自动爬取微博实时热搜榜，输出 Markdown 格式的热搜榜单。

## 使用方式

### 手动执行
```bash
cd skills/custom-skills/weibo-hot-search
./fetch_hot_search.sh
```

### 定时任务（推荐）
添加到 crontab，每天上午 9 点执行：
```bash
0 9 * * * cd /Users/admin/.openclaw/workspace/skills/custom-skills/weibo-hot-search && ./fetch_hot_search.sh
```

## 输出
- `output/hot_search_YYYY-MM-DD.md` - 当日热搜榜单（Markdown 格式）
- 同时输出到 stdout，便于管道处理或消息推送

## 依赖
- Node.js (playwright-scraper)
- 网络连接

## 配置
编辑 `config.json` 可自定义：
- `output_dir`: 输出目录
- `top_n`: 抓取前 N 条热搜（默认 50）
- `include_score`: 是否包含热度值

## 字段说明
| 字段 | 说明 |
|------|------|
| 排名 | 热搜榜排名 |
| 关键词 | 热搜话题关键词 |
| 热度值 | 实时热度（如有） |
| 标签 | 热/新/爆 等标签 |
| 链接 | 话题直达链接 |
