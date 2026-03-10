#!/bin/bash

# 爆款标题系列 (41-45)
for i in {1..5}; do
  price=$((99 + (i-1)*50))
  mkdir -p "content-title/viral-title-v${i}"
  cat > "content-title/viral-title-v${i}/SKILL.md" << EOF
# 爆款标题生成 V${i}

**价格**: ¥${price}/月

**描述**: AI 生成高点击率标题，适配多平台。

**功能**:
- 多风格标题生成
- 点击率预测
- 关键词优化
- A/B 测试建议

**使用**:
\`\`\`bash
/title-gen --topic "AI 工具" --platform xiaohongshu
/title-ab-test --title1 "..." --title2 "..."
\`\`\`
EOF

  cat > "content-title/viral-title-v${i}/README.md" << EOF
# 爆款标题生成 V${i}

## 定价
- **月费**: ¥${price}/月

## 支持平台
- 小红书
- 抖音
- 公众号
- 知乎
- B 站

## SkillPay 集成
订阅后无限生成标题。
EOF

  cat > "content-title/viral-title-v${i}/index.js" << EOF
/**
 * 爆款标题生成 V${i}
 * 价格：¥${price}/月
 */
const SKILL_CONFIG = {
  name: 'viral-title-v${i}',
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

async function generateTitles(topic, platform, count = 10) {
  const templates = getTitleTemplates(platform);
  const titles = [];
  for (let i = 0; i < count; i++) {
    titles.push({
      title: applyTemplate(templates[i % templates.length], topic),
      ctr: predictCTR(topic, platform)
    });
  }
  return titles.sort((a, b) => b.ctr - a.ctr);
}

async function handleCommand(command, args) {
  const sub = await checkSubscription(global.userId);
  if (!sub.active) return { error: '请订阅 (¥' + SKILL_CONFIG.price.monthly + '/月)' };
  
  switch (command) {
    case 'title-gen': return generateTitles(args.topic, args.platform);
    case 'title-ab-test': return abTestTitles(args.title1, args.title2);
    default: return { error: '未知命令' };
  }
}

module.exports = { SKILL_CONFIG, checkSubscription, handleCommand, generateTitles };
EOF
done

echo "Title skills created: 41-45"
