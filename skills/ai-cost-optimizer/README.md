# AI Cost Optimizer - AI 成本优化

## 概述

分析并优化 AI 运营成本，包括计算资源、API 调用、存储等全方位成本优化。

## 服务内容包括

- 成本结构分析
- 供应商比价与选择
- 资源使用效率优化
- 自动扩缩容策略
- 预算与告警设置

## 定价

- 月费：¥399/月
- 支持按节省金额分成

## 使用方法

```bash
ai-cost-optimizer --usage <使用数据文件> --providers <云服务商列表>
```

## 配置

在 `~/.openclaw/workspace/config/ai-cost-optimizer.json` 中配置：

```json
{
  "skillpay_api_key": "your_api_key",
  "price_per_month": 399
}
```
