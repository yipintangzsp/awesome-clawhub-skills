# 公众号文章搬运到飞书 Skill

## 功能
自动抓取指定公众号文章并保存到飞书文档，支持批量处理和定时同步。

## 使用方式

### 单次抓取
```bash
cd skills/custom-skills/wechat-to-feishu
./sync_to_feishu.sh --url "https://mp.weixin.qq.com/s/xxx"
```

### 批量抓取（配置文件中的文章列表）
```bash
./sync_to_feishu.sh --batch
```

### 定时任务
添加到 crontab，每天凌晨 2 点执行：
```bash
0 2 * * * cd /Users/admin/.openclaw/workspace/skills/custom-skills/wechat-to-feishu && ./sync_to_feishu.sh --batch
```

## 配置
编辑 `config.json`：
```json
{
  "feishu_doc_token": "你的飞书文档 token",
  "parent_folder_token": "可选：父文件夹 token",
  "articles": [
    {
      "url": "公众号文章 URL",
      "title": "自定义标题（可选）"
    }
  ]
}
```

## 依赖
- Node.js (playwright-scraper)
- Feishu API 权限
- 网络连接

## 输出
- 飞书文档（以文章标题命名）
- 本地缓存 `cache/` 目录

## 注意事项
1. 首次使用需要在飞书开放平台创建应用并获取 API 权限
2. 公众号文章可能有反爬限制，建议设置合理的抓取频率
3. 图片和样式会尽量保留，但部分动态内容可能无法抓取
