# 🚀 SkillPay 收费 Skill - 快速开始

**10 分钟上线，3 行代码收费，睡后收入从这开始**

---

## ⚡ 5 分钟快速上手

### 步骤 1: 注册 SkillPay（2 分钟）
```
1. 打开 https://skillpay.me/register
2. 填邮箱、密码
3. 绑定钱包地址（BNB Chain，收钱用）
4. 进 Dashboard 复制 API Key
```

### 步骤 2: 配置代码（1 分钟）
```bash
cd ~/.openclaw/workspace/skills/skillpay-billing-example
```

编辑 `index.js`，修改这行：
```javascript
const SKILLPAY_CONFIG = {
  apiKey: 'YOUR_API_KEY_HERE',  // ← 替换成你的 API Key
  pricePerCall: 10,              // ← 修改价格（单位：分）
  skillId: 'your-skill-id'       // ← 替换成你的 Skill ID
};
```

### 步骤 3: 实现功能（2 分钟）
编辑 `runSkill()` 函数，实现你的功能：
```javascript
async function runSkill(input) {
  // 你的逻辑在这里
  // 示例：查询、处理、生成等
  return { result: '你的结果' };
}
```

### 步骤 4: 测试上线
```bash
# 本地测试
node index.js

# 发布到 ClawHub（可选）
clawhub publish .
```

---

## 💡 功能创意库

**不知道做什么 Skill？参考这些：**

| 类型 | 想法 | 难度 |
|------|------|------|
| 🔍 查询类 | 链上大额转账监控、GitHub Trending 推送 | ⭐ |
| 📊 分析类 | YouTube 视频总结、Twitter 舆情分析 | ⭐⭐ |
| 🤖 自动化 | 跨平台内容同步、定时报告生成 | ⭐⭐⭐ |
| 🎨 生成类 | AI 头像生成、营销文案批量生产 | ⭐⭐ |
| 📈 监控类 | 价格提醒、库存监控、竞品追踪 | ⭐⭐ |

**让 AI 帮你写：**
```
"写一个 Skill，功能是 [描述你的想法]，输入是 XX，输出是 XX"
```

---

## 📊 定价建议

| Skill 类型 | 价格范围 | 策略 |
|------------|----------|------|
| 简单工具 | $0.01-0.10 | 走量，引流 |
| 实用功能 | $0.10-0.50 | 主力收入 |
| 专业服务 | $0.50-5.00 | 高价值用户 |
| 定制方案 | $5.00+ | VIP 服务 |

**AlanSun 的矩阵打法：**
- 5 个免费 Skill 引流
- 20 个低价 Skill 走量
- 5 个高价 Skill 盈利
- 2 个网站接广告 + 会员

---

## 🎯 分发渠道

1. **Twitter/X** - 带 #OpenClaw #SkillPay 标签
2. **社群** - Discord、Telegram、微信群
3. **论坛** - Reddit、V2EX、Product Hunt
4. **ClawHub** - 官方技能市场
5. **私域** - 公众号、博客、邮件列表

---

## ⚠️ 避坑指南

| 坑 | 解法 |
|----|------|
| 测试充值当真实收入 | 看 SkillPay Dashboard 的"真实用户"标签 |
| 定价太高没人用 | 先低价测试，再逐步调价 |
| 功能太复杂维护累 | 从简单工具开始，MVP 验证 |
| 只做一个 Skill | 做矩阵，分散风险 |
| 忽视用户体验 | 收费后用户期望更高，保持可用性 |

---

## 📚 进阶资源

- **SkillPay Dashboard**: https://skillpay.me/dashboard
- **BNB Chain 钱包**: https://metamask.io 或 https://trustwallet.com
- **ClawHub 发布**: https://clawhub.ai
- **OpenClaw 文档**: https://docs.openclaw.ai

---

## 🆘 需要帮助？

1. 查看 `SKILL.md` 详细文档
2. 检查 `index.js` 注释
3. 问小爪（本助手）🐾

---

*模板版本：1.0.0 | 最后更新：2026-03-06*
*基于 AlanSun 实战经验整理*
