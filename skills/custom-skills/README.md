# Custom Skills - 自定义技能集合

本目录包含 3 个实用 Skills，用于自动化内容抓取和管理。

## 📦 技能列表

### 1. 微博热搜爬虫 (`weibo-hot-search/`)
- **功能**: 每天自动爬取微博实时热搜榜
- **输出**: Markdown 格式热搜榜单
- **依赖**: Puppeteer (Playwright)
- **使用**:
  ```bash
  cd weibo-hot-search
  npm install
  ./fetch_hot_search.sh
  ```

### 2. 公众号文章搬运到飞书 (`wechat-to-feishu/`)
- **功能**: 自动抓取公众号文章并保存到飞书文档
- **输出**: 飞书文档 + 本地 Markdown 缓存
- **依赖**: Puppeteer + Feishu API
- **使用**:
  ```bash
  cd wechat-to-feishu
  npm install
  # 编辑 config.json 配置文章列表和飞书 token
  ./sync_to_feishu.sh --batch
  ```

### 3. Twitter 书签管理助手 (`twitter-bookmarks/`)
- **功能**: 每天定时获取 Twitter 书签更新
- **输出**: SQLite 数据库 + 每日 Markdown 报告
- **依赖**: 6551 API + SQLite3
- **使用**:
  ```bash
  cd twitter-bookmarks
  npm install
  # 编辑 config.json 配置 API 密钥
  ./sync_bookmarks.sh
  ```

## 🔧 安装依赖

批量安装所有技能依赖：
```bash
cd skills/custom-skills
for dir in */; do
  echo "Installing $dir..."
  cd "$dir" && npm install && cd ..
done
```

## ⏰ 设置定时任务

编辑 crontab：
```bash
crontab -e
```

添加以下内容：
```bash
# 微博热搜 - 每天早上 9 点
0 9 * * * cd /Users/admin/.openclaw/workspace/skills/custom-skills/weibo-hot-search && ./fetch_hot_search.sh

# 公众号搬运 - 每天凌晨 2 点
0 2 * * * cd /Users/admin/.openclaw/workspace/skills/custom-skills/wechat-to-feishu && ./sync_to_feishu.sh --batch

# Twitter 书签 - 每天早上 8 点
0 8 * * * cd /Users/admin/.openclaw/workspace/skills/custom-skills/twitter-bookmarks && ./sync_bookmarks.sh
```

## 📝 配置文件说明

每个技能都有 `config.json` 配置文件：

| 技能 | 配置项 | 说明 |
|------|--------|------|
| weibo-hot-search | top_n | 抓取前 N 条热搜 |
| weibo-hot-search | output_dir | 输出目录 |
| wechat-to-feishu | feishu_doc_token | 飞书文档 token |
| wechat-to-feishu | articles | 文章列表 |
| twitter-bookmarks | api_key | 6551 API Key |
| twitter-bookmarks | twitter_username | Twitter 用户名 |

## 🚨 注意事项

1. **首次使用前**请编辑各自的 `config.json` 填写必要的 API 密钥和配置
2. **安装依赖**需要 Node.js 环境
3. **定时任务**需要确保脚本有执行权限 (`chmod +x *.sh`)
4. **网络环境**需要能访问对应的网站（微博、微信、Twitter）

## 📊 输出示例

### 微博热搜输出
```markdown
# 微博热搜榜 - 2024-01-15

| 排名 | 关键词 | 热度 | 标签 | 链接 |
|------|--------|------|------|------|
| 1 | 某某话题 | 500 万 | 爆 | 🔗 |
```

### Twitter 书签报告
```markdown
# Twitter 书签日报 - 2024-01-15

### 1. 用户名称 (@username)

推文内容...

[查看推文](https://twitter.com/...)
```

---

*Created for 张 sir - 被动收入自动化项目*
