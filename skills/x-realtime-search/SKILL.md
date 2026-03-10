# X Realtime Search Skill

## 描述
实时搜索 X (Twitter) 平台内容，调用本地 Grok 桥接服务获取最新推文、话题趋势和情感分析。支持按时间、用户类型、语言等多维度筛选。

## 用法
```bash
# 基础搜索
/x-search "AI agent"

# 带筛选条件
/x-search "crypto" --time 24h --user-type verified --lang en

# 情感分析模式
/x-search "bitcoin" --sentiment

# 导出结果
/x-search "tech news" --export json
```

## 参数
- `query` - 搜索关键词（必填）
- `--time` - 时间范围：1h, 6h, 24h, 7d, 30d（默认 24h）
- `--user-type` - 用户类型：all, verified, influencers（默认 all）
- `--lang` - 语言：zh, en, ja, ko 等（默认自动检测）
- `--sentiment` - 启用情感分析
- `--limit` - 返回结果数量（默认 20，最大 100）
- `--export` - 导出格式：json, csv, markdown

## 定价
- **按次付费**: ¥10/次
- **月订阅**: ¥99/月（无限次）
- **年订阅**: ¥999/年（约¥83/月）

## 依赖
- 本地 Grok 桥接服务（端口 3000）
- SkillPay 支付集成

## 注意事项
- 首次使用需配置 `config.json`
- 搜索结果受 X API 速率限制
- 情感分析需要额外 2-3 秒处理时间
