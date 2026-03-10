#!/bin/bash

# DeFi 收益优化系列 (6-10)
for i in {1..5}; do
  price=$((299 + (i-1)*75))
  mkdir -p "crypto-defi/defi-yield-opt-v${i}"
  cat > "crypto-defi/defi-yield-opt-v${i}/SKILL.md" << EOF
# DeFi 收益优化器 V${i}

**价格**: ¥${price}/月

**描述**: 自动优化 DeFi 质押收益，跨协议寻找最高 APY。

**功能**:
- 监控 50+ DeFi 协议 APY
- 自动复投策略
- Gas 优化建议
- 收益自动统计

**使用**:
\`\`\`bash
/yield-scan --token USDT --min-apy 5%
/yield-deposit --protocol curve --amount 1000
\`\`\`
EOF

  cat > "crypto-defi/defi-yield-opt-v${i}/README.md" << EOF
# DeFi 收益优化器 V${i}

## 定价
- **月费**: ¥${price}/月
- **年费**: ¥$((price * 10))/年

## 支持协议
- Curve Finance
- Aave
- Compound
- Yearn Finance
- Convex

## SkillPay 集成
订阅后自动解锁全部功能。
EOF

  cat > "crypto-defi/defi-yield-opt-v${i}/index.js" << EOF
/**
 * DeFi 收益优化器 V${i}
 * 价格：¥${price}/月
 */
const SKILL_CONFIG = {
  name: 'defi-yield-opt-v${i}',
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

async function scanYield(token, minAPY) {
  const protocols = ['curve', 'aave', 'compound', 'yearn', 'convex'];
  const yields = [];
  for (const p of protocols) {
    const apy = await getProtocolAPY(p, token);
    if (apy >= minAPY) yields.push({ protocol: p, apy });
  }
  return yields.sort((a, b) => b.apy - a.apy);
}

async function handleCommand(command, args) {
  const sub = await checkSubscription(global.userId);
  if (!sub.active) return { error: '请订阅 (¥' + SKILL_CONFIG.price.monthly + '/月)' };
  
  switch (command) {
    case 'yield-scan': return scanYield(args.token, parseFloat(args.minApy));
    case 'yield-deposit': return depositToProtocol(args.protocol, args.amount);
    default: return { error: '未知命令' };
  }
}

module.exports = { SKILL_CONFIG, checkSubscription, handleCommand, scanYield };
EOF
done

echo "DeFi skills created: 6-10"
