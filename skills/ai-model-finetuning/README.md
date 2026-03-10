# AI Model Finetuning - AI 模型微调

## 概述

基于主流预训练模型进行领域适配微调，用最少数据获得最佳效果。

## 服务内容包括

- 基础模型选择建议
- 领域数据准备指导
- LoRA/P-Tuning 微调
- 模型效果评估
- 部署优化建议

## 定价

- 月费：¥699/月
- 支持按微调次数定制价格

## 使用方法

```bash
ai-model-finetuning --base-model <模型名称> --domain <领域>
```

## 配置

在 `~/.openclaw/workspace/config/ai-model-finetuning.json` 中配置：

```json
{
  "skillpay_api_key": "your_api_key",
  "price_per_month": 699
}
```
