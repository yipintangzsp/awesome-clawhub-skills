#!/usr/bin/env node

/**
 * Summarize Pay - 收费版内容总结工具
 * 支持 URL、PDF、YouTube 视频总结
 * 基于 SkillPay 计费系统
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置路径
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/summarize-pay.json');

// 加载配置
function loadConfig() {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    return config;
  } catch (e) {
    console.error('❌ 配置文件不存在');
    console.log(`请创建：${CONFIG_PATH}`);
    process.exit(1);
  }
}

// SkillPay 计费接口
async function chargeUser(userId, amount) {
  const config = loadConfig();
  const fetch = require('node-fetch');
  
  try {
    const endpoints = [
      'https://api.skillpay.me/billing/charge',
      'https://skillpay.me/api/billing/charge',
      'https://paythefly.com/api/billing/charge'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.skillpay_api_key}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: userId,
            skill_id: 'summarize-pay',
            amount: amount,
            currency: 'CNY'
          }),
          timeout: 5000
        });
        
        const result = await response.json();
        return result;
      } catch (e) {
        continue;
      }
    }
    
    return {
      success: false,
      payment_url: 'https://skillpay.me/topup',
      error: 'API 暂时不可用'
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// 执行 summarize 命令
function runSummarize(target, options = {}) {
  try {
    const args = [target];
    if (options.length) args.push('--length', options.length);
    if (options.model) args.push('--model', options.model);
    if (options.json) args.push('--json');
    
    const cmd = `summarize ${args.join(' ')}`;
    const result = execSync(cmd, { encoding: 'utf8', timeout: 60000 });
    return { success: true, content: result };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const config = loadConfig();
  
  // 帮助信息
  if (args.includes('--help') || args.length === 0) {
    console.log(`
📝 Summarize Pay - 收费版内容总结

用法:
  summarize-pay <URL|文件> [选项]

选项:
  --length short|medium|long    总结长度
  --model <模型名>              AI 模型
  --type url|pdf|youtube        内容类型（自动检测）
  --price <价格>                覆盖默认价格

示例:
  summarize-pay https://example.com
  summarize-pay /path/to/file.pdf --length short
  summarize-pay https://youtu.be/xxx --type youtube

当前配置:
  默认价格：¥${config.price_per_call || 1}
  默认模型：${config.default_model || 'google/gemini-3-flash-preview'}
`);
    return;
  }
  
  // 解析参数
  let target = args.find(a => !a.startsWith('--'));
  const length = args.includes('--length') ? args[args.indexOf('--length') + 1] : 'medium';
  const model = args.includes('--model') ? args[args.indexOf('--model') + 1] : config.default_model;
  const type = args.includes('--type') ? args[args.indexOf('--type') + 1] : 'auto';
  const customPrice = args.includes('--price') ? parseFloat(args[args.indexOf('--price') + 1]) : null;
  
  if (!target) {
    console.error('❌ 请提供 URL 或文件路径');
    return;
  }
  
  // 确定价格
  let price = customPrice || config.price_per_call || 1;
  if (type === 'pdf' || target.endsWith('.pdf')) price = config.price_pdf || 2;
  if (type === 'youtube' || target.includes('youtu')) price = config.price_youtube || 1.5;
  
  const userId = process.env.USER || process.env.SESSION_ID || 'unknown';
  
  console.log('📝 Summarize Pay - 收费版内容总结');
  console.log(`📎 内容：${target}`);
  console.log(`💰 费用：¥${price}`);
  console.log();
  
  // 1. 先收费
  const chargeResult = await chargeUser(userId, price);
  
  if (!chargeResult.success) {
    console.error('❌ 收费失败');
    if (chargeResult.payment_url) {
      console.log(`💳 请充值：${chargeResult.payment_url}`);
    } else {
      console.error(`错误：${chargeResult.error}`);
    }
    process.exit(1);
  }
  
  console.log('✅ 收费成功');
  console.log();
  
  // 2. 执行总结
  console.log('🤖 正在 AI 总结...');
  const result = runSummarize(target, { length, model });
  
  if (!result.success) {
    console.error('❌ 总结失败:', result.error);
    process.exit(1);
  }
  
  // 3. 输出结果
  console.log();
  console.log('━━━ 总结结果 ━━━');
  console.log(result.content);
  console.log('━━━ 结束 ━━━');
  console.log();
  console.log('✅ 总结完成');
}

main().catch(e => {
  console.error('❌ 执行失败:', e.message);
  process.exit(1);
});
