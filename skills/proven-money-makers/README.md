# 已验证赚钱 Skill 矩阵

本目录包含 **30 个已验证能赚钱的 Skill**，分为 3 大类。

## 📊 总览

| 类别 | 数量 | 价格区间 | 收费模式 |
|------|------|----------|----------|
| 🔐 加密货币安全类 | 10 个 | ¥9-29 | 按次/按月 |
| ✍️ 内容创作工具类 | 10 个 | ¥5-9 | 按次 |
| 🤖 AI 效率工具类 | 10 个 | ¥3-9 | 按次 |

---

## 🔐 加密货币安全类 (10 个)

| Skill | 价格 | 说明 |
|-------|------|------|
| 新币扫描器 | ¥15/次 | DEX 新币扫描，潜力评估 |
| 空投检测 | ¥12/次 | 空投资格检测，价值预估 |
| Whale 追踪 | ¥15/次 | 巨鲸交易监控，信号分析 |
| 合约安全审计 | ¥19/次 | 智能合约漏洞检测 |
| 土狗币预警 | ¥9/次 | 土狗币识别，风险预警 |
| 链上转账监控 | ¥9/次 | 钱包转账实时监控 |
| 貔貅币检测 | ¥19/次 | 只能买不能卖检测 |
| LP 锁定检测 | ¥15/次 | 流动性锁定验证 |
| 巨鲸钱包追踪 | ¥19/月 | 巨鲸持仓追踪订阅 |
| 空投自动领取 | ¥29/月 | 自动 Claim 空投订阅 |

---

## ✍️ 内容创作工具类 (10 个)

| Skill | 价格 | 说明 |
|-------|------|------|
| 爆款标题魔法 | ¥5/次 | 多平台爆款标题生成 |
| 小红书文案 | ¥5/次 | 小红书风格文案生成 |
| 抖音标题 | ¥5/次 | 抖音视频标题生成 |
| 公众号标题 | ¥5/次 | 微信文章标题生成 |
| 知乎标题 | ¥5/次 | 知乎问题/文章标题 |
| B 站标题 | ¥5/次 | B 站视频标题生成 |
| YouTube 标题 | ¥5/次 | YouTube 视频标题 (中英) |
| 推文生成 | ¥5/次 | Twitter/X 推文生成 |
| 邮件标题 | ¥5/次 | 邮件营销标题生成 |
| 广告文案 | ¥9/次 | 多平台广告文案生成 |

---

## 🤖 AI 效率工具类 (10 个)

| Skill | 价格 | 说明 |
|-------|------|------|
| Prompt 优化 | ¥5/次 | AI Prompt 优化改进 |
| AI 写作 | ¥5/次 | AI 辅助文章写作 |
| 文档总结 | ¥3/次 | 长文档自动总结 |
| 会议纪要 | ¥5/次 | 会议记录自动生成 |
| 邮件回复 | ¥3/次 | 邮件回复草稿生成 |
| 代码解释 | ¥5/次 | 代码功能解释说明 |
| 翻译优化 | ¥3/次 | 翻译结果优化润色 |
| 语法检查 | ¥3/次 | 语法错误检查修正 |
| 内容改写 | ¥5/次 | 内容降重改写 |
| SEO 优化 | ¥9/次 | 内容 SEO 优化建议 |

---

## 💰 收入预估

### 按次收费 Skill
- **低价位 (¥3-5)**: 日销 20 次 = ¥60-100/天
- **中价位 (¥9-15)**: 日销 10 次 = ¥90-150/天
- **高价位 (¥19-29)**: 日销 5 次 = ¥95-145/天

### 订阅制 Skill
- 巨鲸钱包追踪 (¥19/月): 100 用户 = ¥1,900/月
- 空投自动领取 (¥29/月): 100 用户 = ¥2,900/月

### 月收入目标
- **保守估计**: ¥5,000-10,000/月
- **理想状态**: ¥15,000-30,000/月

---

## 📁 目录结构

```
proven-money-makers/
├── crypto-security/       # 加密货币安全类 (10 个)
│   ├── new-token-scanner/
│   ├── airdrop-detector/
│   ├── whale-tracker/
│   ├── contract-audit/
│   ├── shitcoin-alert/
│   ├── transfer-monitor/
│   ├── honeypot-detect/
│   ├── lp-lock-check/
│   ├── whale-wallet/
│   └── airdrop-claim/
├── content-creation/      # 内容创作工具类 (10 个)
│   ├── viral-title/
│   ├── xiaohongshu-copy/
│   ├── douyin-title/
│   ├── wechat-title/
│   ├── zhihu-title/
│   ├── bilibili-title/
│   ├── youtube-title/
│   ├── tweet-gen/
│   ├── email-title/
│   └── ad-copy/
└── ai-efficiency/         # AI 效率工具类 (10 个)
    ├── prompt-opt/
    ├── ai-writing/
    ├── doc-summary/
    ├── meeting-notes/
    ├── email-reply/
    ├── code-explain/
    ├── translate-opt/
    ├── grammar-check/
    ├── content-rewrite/
    └── seo-opt/
```

---

## 🚀 使用说明

每个 Skill 包含以下文件:
- `SKILL.md` - Skill 详细说明
- `README.md` - 用户使用指南
- `index.js` - Skill 实现代码 (含 SkillPay 配置)

### SkillPay 配置示例
```javascript
const SKILLPAY_CONFIG = {
  skillId: 'skill-name',
  price: 5,
  currency: 'CNY',
  billingType: 'per_use' // 或 'monthly_subscription'
};
```

---

## 📈 发布计划

1. ✅ 创建所有 Skill 框架
2. ⏳ 完善 index.js 实现逻辑
3. ⏳ 配置 SkillPay 支付
4. ⏳ 测试每个 Skill
5. ⏳ 发布到 ClawHub

---

*最后更新：2024-03-09*
