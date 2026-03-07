#!/usr/bin/env node
/**
 * Medical Report Interpreter - 医疗报告解读
 * 高客单价 Skill（¥5-10/次）
 * 
 * ⚠️ 重要：本服务仅供参考，不能替代医嘱
 */

const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/medical-report.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

// ==================== 免责声明模块 ====================
const DISCLAIMER = {
  preService: `
⚠️ **重要提示**

本服务提供的信息仅供参考，不能替代专业医疗建议、诊断或治疗。

✅ 我们能做的：
• 解读检验指标含义
• 提供参考范围对比
• 分析异常指标风险
• 建议就诊科室方向

❌ 我们不能做的：
• 不能下诊断结论
• 不能开药方/治疗方案
• 不能替代医生面诊
• 不能处理急症/重症

💡 如有以下情况，请立即就医：
• 胸痛/呼吸困难
• 严重外伤/出血
• 意识模糊/昏迷
• 其他紧急症状

继续使用即表示您已理解并同意以上声明。
  `,

  header: `
━━━━━━━━━━━━━━━━━━━━━━
🏥 医疗报告解读服务
⚠️ 仅供参考，不能替代医嘱
━━━━━━━━━━━━━━━━━━━━━━
  `,

  footer: `
━━━━━━━━━━━━━━━━━━━━━━
⚠️ **免责声明**

1. 本解读基于您提供的数据，可能存在信息不完整
2. 检验结果需结合临床症状、病史等综合判断
3. 本服务不能替代执业医师的诊断和治疗
4. 如因依赖本解读延误治疗，本服务不承担责任
5. 最终诊断请以医院执业医师意见为准

📞 如有不适，请及时就医
🏥 紧急情况请拨打 120

*本服务由 AI 提供，内容仅供参考*
━━━━━━━━━━━━━━━━━━━━━━
  `
};

// ==================== 医学知识库 ====================
const MEDICAL_KNOWLEDGE = {
  // 血常规
  'WBC': { name: '白细胞', unit: '×10⁹/L', range: [3.5, 9.5], dept: '血液科/内科' },
  'RBC': { name: '红细胞', unit: '×10¹²/L', range: [4.3, 5.8], dept: '血液科' },
  'HGB': { name: '血红蛋白', unit: 'g/L', range: [130, 175], dept: '血液科' },
  'PLT': { name: '血小板', unit: '×10⁹/L', range: [125, 350], dept: '血液科' },
  
  // 肝功能
  'ALT': { name: '谷丙转氨酶', unit: 'U/L', range: [0, 50], dept: '消化内科/肝病科' },
  'AST': { name: '谷草转氨酶', unit: 'U/L', range: [0, 40], dept: '消化内科/肝病科' },
  'TBIL': { name: '总胆红素', unit: 'μmol/L', range: [3.4, 20.5], dept: '消化内科' },
  
  // 肾功能
  'CREA': { name: '肌酐', unit: 'μmol/L', range: [57, 111], dept: '肾内科' },
  'UA': { name: '尿酸', unit: 'μmol/L', range: [208, 428], dept: '肾内科/内分泌科' },
  
  // 血糖血脂
  'GLU': { name: '空腹血糖', unit: 'mmol/L', range: [3.9, 6.1], dept: '内分泌科' },
  'TC': { name: '总胆固醇', unit: 'mmol/L', range: [0, 5.2], dept: '心血管内科' },
  'TG': { name: '甘油三酯', unit: 'mmol/L', range: [0, 1.7], dept: '心血管内科' },
  'LDL': { name: '低密度脂蛋白', unit: 'mmol/L', range: [0, 3.4], dept: '心血管内科' },
  
  // 甲状腺
  'TSH': { name: '促甲状腺激素', unit: 'mIU/L', range: [0.27, 4.2], dept: '内分泌科' },
  'FT3': { name: '游离三碘甲状腺原氨酸', unit: 'pmol/L', range: [3.1, 6.8], dept: '内分泌科' },
  'FT4': { name: '游离甲状腺素', unit: 'pmol/L', range: [12, 22], dept: '内分泌科' },
  
  // 肿瘤标志物
  'AFP': { name: '甲胎蛋白', unit: 'ng/mL', range: [0, 7], dept: '肿瘤科/肝病科' },
  'CEA': { name: '癌胚抗原', unit: 'ng/mL', range: [0, 5], dept: '肿瘤科' }
};

// ==================== 风险等级判断 ====================
function assessRisk(value, range) {
  const deviation = Math.abs(value - (range[0] + range[1]) / 2) / ((range[1] - range[0]) / 2);
  
  if (deviation > 3) return { level: 'CRITICAL', color: '🔴', advice: '请立即就医' };
  if (deviation > 2) return { level: 'HIGH', color: '🟠', advice: '建议 1 周内就诊' };
  if (deviation > 1) return { level: 'MEDIUM', color: '🟡', advice: '建议 1-2 周内就诊' };
  return { level: 'NORMAL', color: '🟢', advice: '定期复查即可' };
}

// ==================== 收费逻辑 ====================
async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, skill_id: 'medical-report', amount, currency: 'CNY' }),
        timeout: 5000
      });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

// ==================== 报告解读主逻辑 ====================
function interpretReport(rawData) {
  const lines = rawData.split('\n').filter(l => l.trim());
  const results = [];
  
  for (const line of lines) {
    // 解析格式：指标名 数值 单位 (参考范围)
    const match = line.match(/([A-Z]+)\s+([\d.]+)\s*(?:×?[10⁹¹²³/]*[A-Z]*)?\s*(?:\([^)]*\))?/i);
    if (match) {
      const code = match[1].toUpperCase();
      const value = parseFloat(match[2]);
      const info = MEDICAL_KNOWLEDGE[code];
      
      if (info) {
        const risk = assessRisk(value, info.range);
        results.push({
          code,
          name: info.name,
          value,
          unit: info.unit,
          range: info.range,
          risk,
          dept: info.dept
        });
      }
    }
  }
  
  return results;
}

// ==================== 生成报告 ====================
function generateReport(results) {
  let report = DISCLAIMER.header + '\n';
  
  // 概览
  const abnormal = results.filter(r => r.risk.level !== 'NORMAL');
  report += `
【报告概览】
• 检测项目：${results.length} 项
• 异常指标：${abnormal.length} 项
• 整体评估：${abnormal.length === 0 ? '🟢 各项指标正常' : '🟡 存在异常指标，请重点关注'}
  `;
  
  // 详细解读
  if (abnormal.length > 0) {
    report += '\n【异常指标解读】\n';
    for (const r of abnormal) {
      report += `
${r.code} ${r.name}: ${r.value} ${r.unit} (参考：${r.range[0]}-${r.range[1]})
${r.risk.color} 风险等级：${r.risk.level}
📋 临床意义：${r.name}是评估相关功能的重要指标
⚠️ 可能原因：需结合其他检查和临床症状综合判断
💡 建议：${r.risk.advice}
🏥 推荐科室：${r.dept}
---
      `;
    }
  } else {
    report += '\n🎉 所有指标均在正常范围内！\n';
  }
  
  // 就医建议
  const depts = [...new Set(abnormal.map(r => r.dept))];
  if (depts.length > 0) {
    report += `\n【就诊建议】\n推荐科室：${depts.join(' / ')}\n`;
  }
  
  report += '\n' + DISCLAIMER.footer;
  return report;
}

// ==================== 主函数 ====================
async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const price = config.price_per_call || 5;
  const userId = process.env.USER || 'user_' + Date.now();
  
  console.log('🏥 医疗报告解读服务');
  console.log('💰 费用：¥' + price);
  console.log(DISCLAIMER.preService);
  
  // 收费
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) {
    console.error('❌ 收费失败');
    console.log('💳 充值：' + (chargeResult.payment_url || 'https://skillpay.me/topup'));
    process.exit(1);
  }
  
  console.log('\n✅ 收费成功');
  console.log('📋 请输入检验报告数据（格式：指标名 数值）\n或直接粘贴报告内容：');
  
  // 读取输入
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('> ', (input) => {
    const results = interpretReport(input);
    if (results.length === 0) {
      console.log('❌ 未识别到有效指标，请检查格式');
      process.exit(1);
    }
    
    const report = generateReport(results);
    console.log(report);
    
    readline.close();
  });
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
