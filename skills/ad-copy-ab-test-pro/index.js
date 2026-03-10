#!/usr/bin/env node

/**
 * Ad Copy A/B Test Pro
 * 专业版广告文案 A/B 测试工具
 * @version 1.0.0
 * @price ¥39/月
 */

// 统计计算工具
const Stats = {
  // 计算转化率
  conversionRate: (conversions, visitors) => {
    return (conversions / visitors) * 100;
  },
  
  // 计算 Z 分数（两比例比较）
  zScore: (p1, p2, n1, n2) => {
    const p = (p1 * n1 + p2 * n2) / (n1 + n2);
    const se = Math.sqrt(p * (1 - p) * (1/n1 + 1/n2));
    return (p1 - p2) / se;
  },
  
  // 计算 P 值（近似）
  pValue: (z) => {
    // 简化版正态分布累积函数
    return 2 * (1 - normalCdf(Math.abs(z)));
  },
  
  // 判断显著性
  isSignificant: (pValue, alpha = 0.05) => {
    return pValue < alpha;
  },
};

// 标准正态分布累积分布函数（近似）
function normalCdf(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - prob : prob;
}

/**
 * 计算所需样本量
 */
function calculateSampleSize(baseline, mde, alpha = 0.05, power = 0.8) {
  const zAlpha = 1.96; // 95% 置信
  const zBeta = 0.84;  // 80% 功效
  const p2 = baseline * (1 + mde / 100);
  
  const pooled = (baseline + p2) / 2;
  const numerator = Math.pow(zAlpha * Math.sqrt(2 * pooled * (1 - pooled)) + zBeta * Math.sqrt(baseline * (1 - baseline) + p2 * (1 - p2)), 2);
  const denominator = Math.pow(baseline - p2, 2);
  
  return Math.ceil(numerator / denominator);
}

/**
 * 分析 A/B 测试结果
 */
function analyzeABTest(variantA, variantB) {
  const cvrA = Stats.conversionRate(variantA.conversions, variantA.visitors);
  const cvrB = Stats.conversionRate(variantB.conversions, variantB.visitors);
  
  const z = Stats.zScore(cvrA/100, cvrB/100, variantA.visitors, variantB.visitors);
  const p = Stats.pValue(z);
  const significant = Stats.isSignificant(p);
  
  const lift = ((cvrB - cvrA) / cvrA) * 100;
  
  return {
    cvrA: cvrA.toFixed(2),
    cvrB: cvrB.toFixed(2),
    lift: lift.toFixed(1),
    zScore: z.toFixed(3),
    pValue: p.toFixed(4),
    significant,
    winner: significant && lift > 0 ? 'B' : (significant && lift < 0 ? 'A' : '无显著差异'),
  };
}

/**
 * 生成文案变体
 */
function generateVariants(product, count = 5) {
  const templates = [
    `限时{discount}，立即{action}`,
    `最后{urgency}件！{benefit}`,
    `{number}+ 用户选择的{product}`,
    `告别{pain}，{solution}`,
    `不是{old}，而是{new}`,
  ];
  
  return templates.slice(0, count);
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  
  console.log('🧪 Ad Copy A/B Test Pro');
  console.log('=' .repeat(50));
  
  // 示例测试数据
  const variantA = {
    name: '版本 A（对照）',
    copy: '限时 5 折，立即抢购',
    visitors: 5000,
    conversions: 150,
  };
  
  const variantB = {
    name: '版本 B（实验）',
    copy: '最后 23 件！5 折抢购中',
    visitors: 5000,
    conversions: 210,
  };
  
  console.log('\n📊 A/B 测试分析:\n');
  console.log(`🅰️ ${variantA.name}`);
  console.log(`   文案：「${variantA.copy}」`);
  console.log(`   曝光：${variantA.visitors.toLocaleString()} | 转化：${variantA.conversions}`);
  console.log(`   CTR: ${Stats.conversionRate(variantA.conversions, variantA.visitors).toFixed(2)}%\n`);
  
  console.log(`🅱️ ${variantB.name}`);
  console.log(`   文案：「${variantB.copy}」`);
  console.log(`   曝光：${variantB.visitors.toLocaleString()} | 转化：${variantB.conversions}`);
  console.log(`   CTR: ${Stats.conversionRate(variantB.conversions, variantB.visitors).toFixed(2)}%\n`);
  
  const result = analyzeABTest(variantA, variantB);
  console.log('📈 结果分析:');
  console.log(`   提升：${result.lift}%`);
  console.log(`   置信度：${result.significant ? '95% ✅' : '不显著 ⚠️'}`);
  console.log(`   P-value: ${result.pValue} ${result.significant ? '< 0.05' : '> 0.05'}`);
  console.log(`\n🏆 建议：版本${result.winner}胜出，${result.winner !== '无显著差异' ? '全量上线' : '继续测试'}`);
  
  // 样本量计算示例
  const sampleSize = calculateSampleSize(3.0, 20);
  console.log(`\n📊 样本量计算:`);
  console.log(`   基线转化率：3.0% | 最小检测效应：20%`);
  console.log(`   所需样本量：每组 ${sampleSize.toLocaleString()} 次曝光`);
  
  console.log('\n📝 使用 --generate 生成更多文案变体');
  console.log('🤖 专业版支持自动化决策');
}

main().catch(console.error);
