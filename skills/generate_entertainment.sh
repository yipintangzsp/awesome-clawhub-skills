#!/bin/bash

# 娱乐休闲系列 (96-100)
for i in {1..5}; do
  price=$((99 + (i-1)*25))
  mkdir -p "life-entertainment/entertainment-v${i}"
  cat > "life-entertainment/entertainment-v${i}/SKILL.md" << EOF
# 娱乐休闲助手 V${i}

**价格**: ¥${price}/月

**描述**: AI 推荐娱乐内容，规划休闲时光。

**功能**:
- 电影/剧集推荐
- 音乐歌单生成
- 旅行路线规划
- 活动建议

**使用**:
\`\`\`bash
/entertain-movie --genre sci-fi --rating 8
/entertain-travel --destination tokyo --days 5
\`\`\`
EOF

  cat > "life-entertainment/entertainment-v${i}/README.md" << EOF
# 娱乐休闲助手 V${i}

## 定价
- **月费**: ¥${price}/月

## 功能
- 影视推荐
- 音乐歌单
- 旅行规划
- 活动建议

## SkillPay 集成
订阅后获得个性化娱乐推荐。
EOF

  cat > "life-entertainment/entertainment-v${i}/index.js" << EOF
/**
 * 娱乐休闲助手 V${i}
 * 价格：¥${price}/月
 */
const SKILL_CONFIG = {
  name: 'entertainment-v${i}',
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

async function recommendEntertainment(type, preferences) {
  switch (type) {
    case 'movie': return recommendMovies(preferences);
    case 'music': return generatePlaylist(preferences);
    case 'travel': return planTrip(preferences);
    case 'activity': return suggestActivities(preferences);
    default: return { error: '未知类型' };
  }
}

async function handleCommand(command, args) {
  const sub = await checkSubscription(global.userId);
  if (!sub.active) return { error: '请订阅 (¥' + SKILL_CONFIG.price.monthly + '/月)' };
  
  switch (command) {
    case 'entertain-movie': return recommendEntertainment('movie', args);
    case 'entertain-travel': return recommendEntertainment('travel', args);
    default: return { error: '未知命令' };
  }
}

module.exports = { SKILL_CONFIG, checkSubscription, handleCommand, recommendEntertainment };
EOF
done

echo "Entertainment skills created: 96-100"
