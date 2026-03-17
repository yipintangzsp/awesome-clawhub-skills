#!/usr/bin/env node

/**
 * 八爪鱼 RPA Webhook 调用技能
 * 调用八爪鱼 RPA 的 Webhook API 执行自动化任务
 */

const crypto = require('crypto');

async function callBazhuayuWebhook(config, params = {}) {
  const { webhookUrl, signatureKey } = config;
  
  if (!webhookUrl || !signatureKey) {
    throw new Error('请先配置 webhookUrl 和 signatureKey');
  }

  // 构造签名（时间戳 + 密钥的 HMAC-SHA256）
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', signatureKey)
    .update(timestamp)
    .digest('hex');

  // 构造请求体
  const payload = {
    timestamp,
    signature,
    params: params || {}
  };

  // 调用 Webhook
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Webhook 调用失败：${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// 技能入口
export async function main(input) {
  const config = await readConfig('bazhuayu-webhook');
  
  // 解析用户意图
  const userInput = input.message.toLowerCase();
  
  // 根据关键词匹配不同的 RPA 应用
  let rpaParams = {};
  
  if (userInput.includes('小红书') || userInput.includes('博主')) {
    rpaParams = {
      app: 'xiaohongshu-blogger-data',
      ...config.defaultParams
    };
  } else if (userInput.includes('抖音')) {
    rpaParams = {
      app: 'douyin-data',
      ...config.defaultParams
    };
  } else if (userInput.includes('电商') || userInput.includes('价格')) {
    rpaParams = {
      app: 'ecommerce-price-monitor',
      ...config.defaultParams
    };
  }

  try {
    const result = await callBazhuayuWebhook(config, rpaParams);
    return {
      success: true,
      message: '八爪鱼 RPA 已启动执行',
      data: result
    };
  } catch (error) {
    return {
      success: false,
      message: `执行失败：${error.message}`
    };
  }
}
