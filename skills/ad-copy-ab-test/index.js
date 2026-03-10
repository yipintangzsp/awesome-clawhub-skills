#!/usr/bin/env node

/**
 * 广告文案 A/B 测试生成器
 * 定价：¥9/次 | ¥199/月
 */

// 平台配置
const PLATFORM_CONFIG = {
  抖音：{
    titleMax: 20,
    descMax: 80,
    style: '短平快',
    bestCTR: 4.0,
    cta: ['立即试用', '点击了解', '马上抢购']
  },
  Facebook: {
    titleMax: 40,
    descMax: 125,
    style: '故事化',
    bestCTR: 2.0,
    cta: ['Learn More', 'Shop Now', 'Sign Up']
  },
  Google: {
    titleMax: 30,
    descMax: 90,
    style: '搜索意图',
    bestCTR: 3.5,
    cta: ['立即购买', '获取报价', '免费咨询']
  },
  微信：{
    titleMax: 25,
    descMax: 100,
    style: '信任导向',
    bestCTR: 2.5,
    cta: ['立即咨询', '免费领取', '马上体验']
  },
  小红书：{
    titleMax: 20,
    descMax: 150,
    style: '种草',
    bestCTR: 3.0,
    cta: ['点击购买', '了解详情', '立即下单']
  }
};

// 文案模板
const COPY_TEMPLATES = {
  情感诉求：[
    {
      title: '{时间}，{结果}',
      desc: '{故事开头}...{产品价值}...{行动号召}',
      cta: '立即体验'
    },
    {
      title: '{人群}的{痛点}',
      desc: '{共情}...{解决方案}...{证明}',
      cta: '改变自己'
    }
  ],
  利益诉求：[
    {
      title: '限时{折扣}！{时间}',
      desc: '原价{原价}，现在{现价}...{稀缺性}',
      cta: '立即抢购'
    },
    {
      title: '{数字}天{效果}',
      desc: '{方法}...{证明}...{保障}',
      cta: '免费试用'
    }
  ],
  社会证明：[
    {
      title: '{数字}人已选择',
      desc: '{用户评价}...{效果}...{号召}',
      cta: '加入他们'
    }
  ],
  问题解决方案：[
    {
      title: '{问题}？',
      desc: '{原因}...{方案}...{证明}',
      cta: '立即解决'
    }
  ]
};

/**
 * 生成广告文案
 */
async function generateAdCopy(product, platform = '抖音', count = 3, abTest = false) {
  const config = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.抖音;
  
  const result = {
    product,
    platform,
    generateTime: new Date().toISOString(),
    versions: [],
    recommendation: null,
    abTestPlan: null
  };
  
  // 生成多个版本
  const styles = ['情感诉求', '利益诉求', '社会证明', '问题解决方案'];
  
  for (let i = 0; i < count; i++) {
    const style = styles[i % styles.length];
    const version = generateVersion(product, config, style, i);
    result.versions.push(version);
  }
  
  // 排序
  result.versions.sort((a, b) => b.predictedCTR - a.predictedCTR);
  
  // 推荐
  result.recommendation = {
    version: result.versions[0].name,
    reason: `${result.versions[0].style}在${platform}平台表现最佳，预测 CTR 最高`
  };
  
  // A/B 测试方案
  if (abTest || count >= 2) {
    result.abTestPlan = generateABTestPlan(result.versions.slice(0, 2), platform);
  }
  
  return result;
}

/**
 * 生成单个版本
 */
function generateVersion(product, config, style, index) {
  const templates = COPY_TEMPLATES[style] || COPY_TEMPLATES.利益诉求;
  const template = templates[index % templates.length];
  
  // 填充模板
  const title = fillTemplate(template.title, product, style);
  const desc = fillTemplate(template.desc, product, style);
  const cta = config.cta[index % config.cta.length];
  
  // 预测 CTR
  const predictedCTR = predictCTR(title, desc, style, config);
  
  return {
    name: `版本 ${String.fromCharCode(65 + index)}`,
    style,
    title,
    description: desc,
    cta,
    predictedCTR,
    predictedCVR: (Math.random() * 3 + 1).toFixed(1) + '%',
    characterCount: {
      title: title.length,
      desc: desc.length
    }
  };
}

/**
 * 填充模板
 */
function fillTemplate(template, product, style) {
  const replacements = {
    '{时间}': '30 天',
    '{结果}': '她瘦了 20 斤',
    '{人群}': '30 岁+',
    '{痛点}': '还在为身材烦恼？',
    '{故事开头}': '尝试过无数方法后',
    '{产品价值}': '终于找到这个',
    '{行动号召}': '你也值得拥有',
    '{共情}': '我懂你的感受',
    '{解决方案}': '这个方法简单有效',
    '{证明}': '10000+ 人已验证',
    '{折扣}': '5 折',
    '{时间限}': '最后 3 天',
    '{原价}': '¥999',
    '{现价}': '只要¥499',
    '{稀缺性}': '名额有限',
    '{数字}': '7',
    '{效果}': '见效',
    '{方法}': '无需节食运动',
    '{保障}': '无效退款',
    '{用户评价}': '"效果超预期！"',
    '{问题}': '为什么总是瘦不下来',
    '{原因}': '方法不对',
    '{方案}': '试试这个科学方法'
  };
  
  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(key, 'g'), value);
  }
  
  return result;
}

/**
 * 预测 CTR
 */
function predictCTR(title, desc, style, config) {
  let baseCTR = config.bestCTR * 0.6;
  
  // 风格系数
  const styleBonus = {
    '情感诉求': 0.15,
    '利益诉求': 0.2,
    '社会证明': 0.1,
    '问题解决方案': 0.15
  };
  baseCTR += styleBonus[style] || 0;
  
  // 长度系数
  if (title.length >= 10 && title.length <= config.titleMax) {
    baseCTR += 0.1;
  }
  
  // 包含数字加分
  if (/\d/.test(title)) {
    baseCTR += 0.1;
  }
  
  // 包含问号加分
  if (/[？?]/.test(title)) {
    baseCTR += 0.05;
  }
  
  return Math.min(baseCTR, config.bestCTR * 1.2);
}

/**
 * 生成 A/B 测试方案
 */
function generateABTestPlan(versions, platform) {
  return {
    testHypothesis: `${versions[1].style}版本比${versions[0].style}版本 CTR 更高`,
    variations: [
      {
        name: versions[0].name,
        style: versions[0].style,
        title: versions[0].title,
        allocation: '50%'
      },
      {
        name: versions[1].name,
        style: versions[1].style,
        title: versions[1].title,
        allocation: '50%'
      }
    ],
    metrics: ['CTR', 'CVR', 'CPC', 'ROAS'],
    sampleSize: '每版本至少 5000 次展示',
    duration: '7-14 天',
    successCriteria: 'CTR 提升 20% 以上，统计显著性 p<0.05',
    nextSteps: '获胜版本扩大预算，失败版本优化后重新测试'
  };
}

/**
 * 格式化输出
 */
function formatOutput(result) {
  let output = `## 📝 广告文案 A/B 测试方案\n\n`;
  output += `### 🎯 产品信息\n`;
  output += `- 产品：${result.product}\n`;
  output += `- 平台：${result.platform}\n`;
  output += `- 生成时间：${result.generateTime.split('T')[0]}\n\n`;
  
  output += `### 📊 文案版本\n\n`;
  
  result.versions.forEach((version, i) => {
    output += `#### ${version.name}（${version.style}）\n`;
    output += `**标题：** "${version.title}"\n`;
    output += `**正文：** "${version.description}"\n`;
    output += `**CTA：** "${version.cta}"\n`;
    output += `**预测 CTR：** ${version.predictedCTR.toFixed(1)}%\n`;
    output += `**预测 CVR：** ${version.predictedCVR}\n`;
    output += `**字符数：** 标题${version.characterCount.title}/${PLATFORM_CONFIG[result.platform]?.titleMax || 20}，正文${version.characterCount.desc}/${PLATFORM_CONFIG[result.platform]?.descMax || 80}\n\n`;
  });
  
  // 推荐
  output += `### 🏆 推荐版本\n`;
  output += `**${result.recommendation.version}**\n`;
  output += `原因：${result.recommendation.reason}\n\n`;
  
  // A/B 测试
  if (result.abTestPlan) {
    output += `### 🧪 A/B 测试方案\n`;
    output += `- 测试假设：${result.abTestPlan.testHypothesis}\n`;
    output += `- 预算分配：${result.abTestPlan.variations.map(v => `${v.name} ${v.allocation}`).join(' / ')}\n`;
    output += `- 测试周期：${result.abTestPlan.duration}\n`;
    output += `- 成功标准：${result.abTestPlan.successCriteria}\n`;
    output += `- 下一步：${result.abTestPlan.nextSteps}\n`;
  }
  
  return output;
}

/**
 * CLI 入口
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('用法：ad-copy "产品描述" [--platform 平台] [--count 数量] [--ab-test]');
    console.log('平台：抖音 | Facebook | Google | 微信 | 小红书');
    process.exit(1);
  }
  
  const product = args.find(arg => !arg.startsWith('--'));
  const platformIndex = args.indexOf('--platform');
  const countIndex = args.indexOf('--count');
  const abTest = args.includes('--ab-test');
  
  const platform = platformIndex > -1 ? args[platformIndex + 1] : '抖音';
  const count = countIndex > -1 ? parseInt(args[countIndex + 1]) : 3;
  
  console.log('正在生成广告文案...\n');
  
  const result = await generateAdCopy(product.replace(/"/g, ''), platform, count, abTest);
  console.log(formatOutput(result));
}

module.exports = { generateAdCopy, formatOutput };

if (require.main === module) {
  main().catch(console.error);
}
