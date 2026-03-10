# AI Custom Training - AI 定制训练

## 概述

为企业提供定制化的 AI 模型训练服务，根据特定业务场景和数据集进行模型优化。

## 服务内容包括

- 数据清洗与预处理
- 模型选择与架构设计
- 定制化训练流程
- 超参数自动调优
- 模型评估与迭代

## 定价

- 月费：¥799/月
- 支持按训练时长定制价格

## 使用方法

```bash
ai-training-custom --dataset <数据路径> --model <nlp|cv|tabular>
```

## 配置

在 `~/.openclaw/workspace/config/ai-training-custom.json` 中配置：

```json
{
  "skillpay_api_key": "your_api_key",
  "price_per_month": 799
}
```
