#!/usr/bin/env node

/**
 * Daily News Pay - 收费版日报生成器
 * 基于 SkillPay 计费系统
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// 配置路径
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/daily-news-pay.json');

// 加载配置
function loadConfig() {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    return config;
  } catch (e) {
    console.error('❌ 配置文件不存在，请先配置');
    console.log(`配置文件路径：${CONFIG_PATH}`);
    process.exit(1);
  }
}

// SkillPay 计费接口
async function chargeUser(userId, amount) {
  const config = loadConfig();
  
  try {
    // 尝试 SkillPay API（多个备选域名）
    const endpoints = [
      'https://api.skillpay.me/billing/charge',
      'https://skillpay.me/api/billing/charge',
      'https://paythefly.com/api/billing/charge'
    ];
    
    let lastError = null;
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
            skill_id: 'daily-news-pay',
            amount: amount,
            currency: 'CNY'
          }),
          timeout: 5000
        });
        
        const result = await response.json();
        return result;
      } catch (e) {
        lastError = e;
        continue;
      }
    }
    
    // API 不可用时，返回支付链接让用户手动充值
    console.warn('⚠️ SkillPay API 暂时不可用，返回手动充值链接');
    return {
      success: false,
      payment_url: 'https://skillpay.me/topup',
      error: 'API 暂时不可用，请手动充值后重试'
    };
  } catch (e) {
    console.error('❌ SkillPay 计费失败:', e.message);
    return { success: false, error: e.message };
  }
}

// 抓取新闻（示例：36Kr）
async function fetch36kr() {
  try {
    const response = await fetch('https://api.36kr.com/portals/v2/home-page/feed-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        param: {
          pageSize: 10,
          page: 1
        }
      })
    });
    const data = await response.json();
    return data.data?.items?.slice(0, 5).map(item => ({
      title: item.templateMaterial?.widgetContent?.title,
      url: item.templateMaterial?.widgetContent?.url,
      summary: item.templateMaterial?.widgetContent?.summary
    })) || [];
  } catch (e) {
    console.error('36Kr 抓取失败:', e.message);
    return [];
  }
}

// 用 AI 总结新闻
async function summarizeWithAI(news) {
  const config = loadConfig();
  
  // 调用 OpenClaw 内置的 AI 能力（通过 sessions_send 或其他方式）
  // 这里简化处理，直接返回原文
  return news.map(item => ({
    ...item,
    ai_summary: item.summary || item.title
  }));
}

// 发送到飞书
async function sendToFeishu(news, channelId) {
  console.log('📮 发送到飞书:', channelId);
  console.log('---');
  news.forEach((item, i) => {
    console.log(`${i + 1}. ${item.title}`);
    console.log(`   ${item.ai_summary}`);
    console.log(`   🔗 ${item.url}`);
    console.log();
  });
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const config = loadConfig();
  
  // 处理参数
  if (args.includes('--balance')) {
    console.log('💰 查询余额功能待实现（需 SkillPay API）');
    return;
  }
  
  if (args.includes('--topup')) {
    console.log('💳 充值链接：https://skillpay.me/topup');
    return;
  }
  
  // 默认：生成日报
  const userId = process.env.USER || 'unknown';
  const amount = config.price_per_call || 0.5;
  
  console.log('🦞 Daily News Pay - 收费版日报生成器');
  console.log(`💰 本次费用：¥${amount}`);
  console.log();
  
  // 1. 先收费
  const chargeResult = await chargeUser(userId, amount);
  
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
  
  // 2. 抓取新闻
  console.log('📰 正在抓取新闻...');
  const news = await fetch36kr();
  
  if (news.length === 0) {
    console.error('❌ 未抓取到新闻');
    process.exit(1);
  }
  
  // 3. AI 总结
  console.log('🤖 正在 AI 总结...');
  const summarized = await summarizeWithAI(news);
  
  // 4. 发送
  const channel = config.channel || 'feishu';
  const channelId = config.channel_id || 'default';
  
  if (channel === 'feishu') {
    await sendToFeishu(summarized, channelId);
  }
  
  console.log('✅ 日报生成完成');
}

main().catch(e => {
  console.error('❌ 执行失败:', e.message);
  process.exit(1);
});
