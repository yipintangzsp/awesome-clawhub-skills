#!/usr/bin/env node

/**
 * YouTube Summarize Pay - 收费版 YouTube 视频总结
 * 基于 SkillPay 计费系统
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/youtube-summarize-pay.json');

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (e) {
    console.error('❌ 配置文件不存在');
    process.exit(1);
  }
}

async function chargeUser(userId, amount) {
  const config = loadConfig();
  const fetch = require('node-fetch');
  
  try {
    const endpoints = [
      'https://api.skillpay.me/billing/charge',
      'https://skillpay.me/api/billing/charge'
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
            skill_id: 'youtube-summarize-pay',
            amount: amount,
            currency: 'CNY'
          }),
          timeout: 5000
        });
        return await response.json();
      } catch (e) { continue; }
    }
    
    return { success: false, payment_url: 'https://skillpay.me/topup' };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

function summarizeYouTube(videoUrl, length = 'medium') {
  try {
    const cmd = `summarize "${videoUrl}" --youtube auto --length ${length}`;
    const result = execSync(cmd, { encoding: 'utf8', timeout: 120000 });
    return { success: true, content: result };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const config = loadConfig();
  
  if (args.includes('--help') || args.length === 0) {
    console.log(`
📹 YouTube Summarize Pay - 视频总结收费版

用法:
  youtube-summarize-pay <YouTube 链接> [选项]

选项:
  --length short|medium|long    总结长度
  --price <价格>                覆盖默认价格 (默认 ¥${config.price_per_call || 1.5})

示例:
  youtube-summarize-pay https://youtu.be/dQw4w9WgXcQ
  youtube-summarize-pay https://youtube.com/watch?v=xxx --length short
`);
    return;
  }
  
  let videoUrl = args.find(a => !a.startsWith('--'));
  const length = args.includes('--length') ? args[args.indexOf('--length') + 1] : 'medium';
  const customPrice = args.includes('--price') ? parseFloat(args[args.indexOf('--price') + 1]) : null;
  
  if (!videoUrl || !videoUrl.includes('youtube') && !videoUrl.includes('youtu.be')) {
    console.error('❌ 请提供有效的 YouTube 链接');
    return;
  }
  
  const price = customPrice || config.price_per_call || 1.5;
  const userId = process.env.USER || process.env.SESSION_ID || 'unknown';
  
  console.log('📹 YouTube Summarize Pay');
  console.log(`🎬 视频：${videoUrl}`);
  console.log(`💰 费用：¥${price}`);
  console.log();
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) {
    console.error('❌ 收费失败');
    console.log(`💳 充值：${chargeResult.payment_url || 'https://skillpay.me/topup'}`);
    process.exit(1);
  }
  
  console.log('✅ 收费成功');
  console.log('🤖 正在总结视频...');
  
  const result = summarizeYouTube(videoUrl, length);
  if (!result.success) {
    console.error('❌ 总结失败:', result.error);
    process.exit(1);
  }
  
  console.log();
  console.log('━━━ 视频总结 ━━━');
  console.log(result.content);
  console.log('━━━ 结束 ━━━');
}

main().catch(e => {
  console.error('❌ 执行失败:', e.message);
  process.exit(1);
});
