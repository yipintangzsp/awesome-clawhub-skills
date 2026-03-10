#!/bin/bash

# 文案写作系列 (46-50)
for i in {1..5}; do
  price=$((199 + (i-1)*50))
  mkdir -p "content-copy/auto-copy-v${i}"
  cat > "content-copy/auto-copy-v${i}/SKILL.md" << EOF
# 自动文案写作 V${i}

**价格**: ¥${price}/月

**描述**: AI 自动生成营销文案，适配多场景。

**功能**:
- 产品描述生成
- 广告文案创作
- 社交媒体文案
- 邮件营销文案

**使用**:
\`\`\`bash
/copy-gen --product "智能手表" --style professional
/copy-ad --platform facebook --goal conversion
\`\`\`
EOF

  cat > "content-copy/auto-copy-v${i}/README.md" << EOF
# 自动文案写作 V${i}

## 定价
- **月费**: ¥${price}/月

## 文案类型
- 产品描述
- 广告文案
- 社交媒体
- 邮件营销
- 落地页

## SkillPay 集成
订阅后无限生成文案。
EOF

  cat > "content-copy/auto-copy-v${i}/index.js" << EOF
/**
 * 自动文案写作 V${i}
 * 价格：¥${price}/月
 */
const SKILL_CONFIG = {
  name: 'auto-copy-v${i}',
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

async function generateCopy(product, style, platform) {
  const prompt = buildPrompt(product, style, platform);
  const copy = await generateWithAI(prompt);
  return {
    copy,
    variants: generateVariants(copy),
    score: evaluateCopy(copy)
  };
}

async function handleCommand(command, args) {
  const sub = await checkSubscription(global.userId);
  if (!sub.active) return { error: '请订阅 (¥' + SKILL_CONFIG.price.monthly + '/月)' };
  
  switch (command) {
    case 'copy-gen': return generateCopy(args.product, args.style, args.platform);
    case 'copy-ad': return generateAdCopy(args.platform, args.goal);
    default: return { error: '未知命令' };
  }
}

module.exports = { SKILL_CONFIG, checkSubscription, handleCommand, generateCopy };
EOF
done

echo "Copy skills created: 46-50"
