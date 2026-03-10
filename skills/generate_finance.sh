#!/bin/bash

# 财务管理系列 (86-90)
for i in {1..5}; do
  price=$((199 + (i-1)*50))
  mkdir -p "life-finance/finance-manager-v${i}"
  cat > "life-finance/finance-manager-v${i}/SKILL.md" << EOF
# 财务管理助手 V${i}

**价格**: ¥${price}/月

**描述**: AI 个人财务管理，智能预算。

**功能**:
- 支出自动分类
- 预算智能建议
- 储蓄目标追踪
- 投资分析

**使用**:
\`\`\`bash
/finance-log --expense 200 --category food
/finance-budget --month 2024-03 --limit 5000
\`\`\`
EOF

  cat > "life-finance/finance-manager-v${i}/README.md" << EOF
# 财务管理助手 V${i}

## 定价
- **月费**: ¥${price}/月

## 功能
- 支出追踪
- 预算管理
- 储蓄计划
- 投资建议

## SkillPay 集成
订阅后获得智能财务分析。
EOF

  cat > "life-finance/finance-manager-v${i}/index.js" << EOF
/**
 * 财务管理助手 V${i}
 * 价格：¥${price}/月
 */
const SKILL_CONFIG = {
  name: 'finance-manager-v${i}',
  version: '${i}.0.0',
  price: { monthly: ${price}, yearly: $((price * 10)) },
  currency: 'CNY'
};

async function checkSubscription(userId) {
  const res = await fetch('https://api.skillpay.com/subscription/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skill_id: SKILL_CONFIG.name, user_id: userId })
  });
  return res.json();
}

async function manageFinance(type, data) {
  switch (type) {
    case 'expense': return logExpense(data);
    case 'income': return logIncome(data);
    case 'budget': return setBudget(data);
    case 'analysis': return analyzeFinances(data);
    default: return { error: '未知类型' };
  }
}

async function handleCommand(command, args) {
  const sub = await checkSubscription(global.userId);
  if (!sub.active) return { error: '请订阅 (¥' + SKILL_CONFIG.price.monthly + '/月)' };
  
  switch (command) {
    case 'finance-log': return manageFinance(args.type, args.data);
    case 'finance-budget': return manageFinance('budget', args);
    default: return { error: '未知命令' };
  }
}

module.exports = { SKILL_CONFIG, checkSubscription, handleCommand, manageFinance };
EOF
done

echo "Finance skills created: 86-90"
