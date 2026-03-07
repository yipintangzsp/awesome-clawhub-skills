#!/usr/bin/env node

/**
 * Humanize Pay - 收费版 AI 文本人性化
 * 去除 AI 写作痕迹，让文字更自然
 * 基于 SkillPay 计费系统
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/humanize-pay.json');

function loadConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); }
  catch (e) { console.error('❌ 配置文件不存在'); process.exit(1); }
}

async function chargeUser(userId, amount) {
  const config = loadConfig();
  const fetch = require('node-fetch');
  
  try {
    const endpoints = ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge'];
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, skill_id: 'humanize-pay', amount, currency: 'CNY' }),
          timeout: 5000
        });
        return await response.json();
      } catch (e) { continue; }
    }
    return { success: false, payment_url: 'https://skillpay.me/topup' };
  } catch (e) { return { success: false, error: e.message }; }
}

function humanizeText(text) {
  try {
    const result = execSync(`echo "${text.replace(/"/g, '\\"')}" | humanize`, { encoding: 'utf8', timeout: 30000 });
    return { success: true, content: result };
  } catch (e) {
    // humanize 命令不可用时，返回简化版处理
    let humanized = text
      .replace(/非常/g, '挺')
      .replace(/因此/g, '所以')
      .replace(/然而/g, '不过')
      .replace(/此外/g, '还有')
      .replace(/总之/g, '总的来说')
      .replace(/首先/g, '先')
      .replace(/其次/g, '然后')
      .replace(/最后/g, '最后');
    return { success: true, content: humanized };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const config = loadConfig();
  
  if (args.includes('--help') || args.length === 0) {
    console.log(`
✍️ Humanize Pay - AI 文本人性化收费版

用法:
  humanize-pay "<文本>" [选项]
  humanize-pay --file <文件路径>

选项:
  --file <路径>             从文件读取
  --price <价格>            覆盖默认价格

示例:
  humanize-pay "这是一段 AI 生成的文字"
  humanize-pay --file article.txt
`);
    return;
  }
  
  let text = '';
  if (args.includes('--file')) {
    const filePath = args[args.indexOf('--file') + 1];
    text = fs.readFileSync(filePath, 'utf8');
  } else {
    text = args.find(a => !a.startsWith('--')) || '';
  }
  
  if (!text) { console.error('❌ 请提供文本内容'); return; }
  
  const price = args.includes('--price') ? parseFloat(args[args.indexOf('--price') + 1]) : config.price_per_call || 1;
  const userId = process.env.USER || 'unknown';
  
  console.log('✍️ Humanize Pay - AI 文本人性化');
  console.log(`📝 字数：${text.length}`);
  console.log(`💰 费用：¥${price}`);
  console.log();
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) {
    console.error('❌ 收费失败');
    console.log(`💳 充值：${chargeResult.payment_url || 'https://skillpay.me/topup'}`);
    process.exit(1);
  }
  
  console.log('✅ 收费成功');
  console.log('🤖 正在人性化处理...');
  
  const result = humanizeText(text);
  console.log();
  console.log('━━━ 人性化结果 ━━━');
  console.log(result.content);
  console.log('━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌ 执行失败:', e.message); process.exit(1); });
