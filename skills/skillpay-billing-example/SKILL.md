# SkillPay Billing Example - OpenClaw 收费 Skill 模板

复制 AlanSun 的睡后收入模式，3 行代码接入 SkillPay 收费。

---

## 📦 安装

```bash
# 克隆示例 Skill
cd ~/.openclaw/workspace/skills
git clone https://github.com/skillpay/skillpay-example.git skillpay-billing-example
```

或手动创建（见下方代码）。

---

## 🔑 前置准备

### 1. 注册 SkillPay
1. 去 https://skillpay.me/register
2. 填邮箱、密码
3. **绑定钱包地址**（BNB Chain，收钱用）
4. 进 Dashboard 拿 **API Key**

### 2. 准备钱包
- 币安/OKX 钱包地址（BNB Chain BEP20）
- 或 MetaMask / Trust Wallet

---

## 💻 代码实现

### 文件结构
```
skillpay-billing-example/
├── SKILL.md          # Skill 描述
├── index.js          # 主逻辑
├── config.json       # 配置（含 API Key）
└── README.md         # 使用说明
```

### index.js（核心代码）
```javascript
const axios = require('axios');

// SkillPay 配置
const SKILLPAY_API_KEY = 'YOUR_API_KEY_HERE';
const SKILLPAY_BASE_URL = 'https://api.skillpay.me';
const PRICE_PER_CALL = 10; // 每次调用价格（单位：分，即 $0.10）

// 收费中间件
async function chargeUser(userId) {
  try {
    const response = await axios.post(
      `${SKILLPAY_BASE_URL}/billing/charge`,
      {
        user_id: userId,
        amount: PRICE_PER_CALL,
        skill_id: 'your-skill-id'
      },
      {
        headers: {
          'Authorization': `Bearer ${SKILLPAY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      return { success: true };
    } else {
      return { 
        success: false, 
        payment_url: response.data.payment_url 
      };
    }
  } catch (error) {
    console.error('SkillPay charge error:', error);
    return { 
      success: false, 
      error: 'Payment system unavailable' 
    };
  }
}

// 你的 Skill 主逻辑
async function runSkill(input) {
  // TODO: 在这里实现你的功能
  // 示例：查询某个数据、处理某个任务等
  return {
    result: '你的 Skill 执行结果',
    timestamp: new Date().toISOString()
  };
}

// 入口函数
module.exports = async function(context) {
  const userId = context.user_id || 'anonymous';
  const input = context.input;

  // 1️⃣ 先收费
  const chargeResult = await chargeUser(userId);

  if (!chargeResult.success) {
    // 2️⃣ 收费失败 → 返回支付链接
    return {
      type: 'payment_required',
      message: '请先充值后使用本技能',
      payment_url: chargeResult.payment_url,
      amount: PRICE_PER_CALL / 100 // 转换为美元
    };
  }

  // 3️⃣ 收费成功 → 执行 Skill
  try {
    const result = await runSkill(input);
    return {
      type: 'success',
      data: result
    };
  } catch (error) {
    return {
      type: 'error',
      message: error.message
    };
  }
};
```

### config.json
```json
{
  "skillpay": {
    "api_key": "YOUR_API_KEY_HERE",
    "base_url": "https://api.skillpay.me",
    "price_per_call": 10
  },
  "skill": {
    "name": "your-skill-name",
    "description": "你的 Skill 描述",
    "version": "1.0.0"
  }
}
```

---

## 🚀 部署步骤

### 1. 本地测试
```bash
cd ~/.openclaw/workspace/skills/skillpay-billing-example
node index.js
```

### 2. 发布到 ClawHub（可选）
```bash
clawhub publish ./skillpay-billing-example
```

### 3. 自建服务（推荐）
```bash
# 用 Express 包装成 HTTP 服务
npm install express
```

```javascript
// server.js
const express = require('express');
const skillHandler = require('./index');

const app = express();
app.use(express.json());

app.post('/api/skill', async (req, res) => {
  const result = await skillHandler({
    user_id: req.headers['x-user-id'],
    input: req.body
  });
  res.json(result);
});

app.listen(3000, () => {
  console.log('Skill server running on port 3000');
});
```

---

## 📊 定价策略参考

| Skill 类型 | 建议价格 | 说明 |
|------------|----------|------|
| 简单查询 | $0.01-0.05 | 天气、汇率、基础信息 |
| 数据处理 | $0.10-0.50 | 总结、翻译、格式转换 |
| 专业工具 | $0.50-2.00 | 链上分析、SEO 检查、竞品监控 |
| 高级自动化 | $2.00-10.00 | 跨平台工作流、定制报告 |

**AlanSun 的 30+ Skills 矩阵：**
- 低价走量 + 高价专业服务
- 有些免费引流，有些收费盈利
- 平均每个 Skill 月入 $20-30

---

## 🎯 快速验证想法

**步骤：**
1. 找痛点（群里有人问啥？ reddit 上啥问题多？）
2. 让 AI 写代码（"写个 Skill 实现 XX 功能"）
3. 接 SkillPay（复制上面模板）
4. 丢出去测试（Twitter、社群、论坛）
5. 看数据迭代（SkillPay Dashboard 看收入）

---

## ⚠️ 注意事项

1. **测试充值 ≠ 真实收入** — 区分好奇测试和真实用户
2. **保持可用性** — 收费后用户期望更高
3. **合规第一** — 别碰灰产，正经工具最稳
4. **多渠道分发** — 别只依赖一个平台

---

## 📚 相关资源

- SkillPay 官网：https://skillpay.me
- BNB Chain 文档：https://docs.bnbchain.org
- ClawHub 技能市场：https://clawhub.ai
- OpenClaw 文档：https://docs.openclaw.ai

---

*模板作者：小爪 🐾 | 基于 AlanSun 实战经验*
