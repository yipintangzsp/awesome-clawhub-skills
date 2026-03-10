# upwork-auto-bidder - Upwork 自动投标

## 描述
自动监控 Upwork 新发布的项目，根据预设条件自动投标。支持关键词筛选、预算范围、客户评分过滤。

## 定价
- **包月订阅**: ¥39/月
- 每日最多自动投标 20 个项目
- 包含投标文案 AI 生成

## 用法
```bash
# 启动自动投标
/upwork-auto-bidder --start

# 配置筛选条件
/upwork-auto-bidder --config --keywords "react,nodejs" --min-budget 500 --client-score 4.5

# 查看投标记录
/upwork-auto-bidder --history

# 暂停自动投标
/upwork-auto-bidder --pause
```

## 技能目录
`~/.openclaw/workspace/skills/upwork-auto-bidder/`

## 作者
张 sir

## 版本
1.0.0
