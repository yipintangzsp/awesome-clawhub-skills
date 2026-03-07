// SkillPay Billing Example - OpenClaw 收费 Skill 模板
// 复制这个文件，修改 runSkill() 里的逻辑即可

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ==================== 配置区 ====================
// 从 .env 文件读取配置（安全，不要公开分享）
const envPath = path.join(__dirname, '.env');
const envConfig = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envConfig[key.trim()] = value.trim();
    }
  });
}

const SKILLPAY_CONFIG = {
  apiKey: envConfig.SKILLPAY_API_KEY || 'YOUR_API_KEY_HERE',
  baseUrl: envConfig.SKILLPAY_BASE_URL || 'https://api.skillpay.me',
  pricePerCall: parseInt(envConfig.PRICE_PER_CALL) || 10,
  skillId: envConfig.SKILL_ID || 'your-skill-id'
};

// ==================== 收费中间件 ====================
async function chargeUser(userId) {
  try {
    const response = await axios.post(
      `${SKILLPAY_CONFIG.baseUrl}/billing/charge`,
      {
        user_id: userId,
        amount: SKILLPAY_CONFIG.pricePerCall,
        skill_id: SKILLPAY_CONFIG.skillId
      },
      {
        headers: {
          'Authorization': `Bearer ${SKILLPAY_CONFIG.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }
    );

    if (response.data.success) {
      console.log(`✅ User ${userId} charged $${SKILLPAY_CONFIG.pricePerCall / 100}`);
      return { success: true };
    } else {
      console.log(`💳 User ${userId} needs payment`);
      return { 
        success: false, 
        payment_url: response.data.payment_url 
      };
    }
  } catch (error) {
    console.error('❌ SkillPay charge error:', error.message);
    return { 
      success: false, 
      error: 'Payment system unavailable',
      fallback_message: '支付系统暂时不可用，请稍后重试'
    };
  }
}

// ==================== 你的 Skill 主逻辑 ====================
async function runSkill(input) {
  // TODO: 在这里实现你的功能
  // 示例：查询某个数据、处理某个任务等
  
  // 示例 1: 天气查询
  // const weather = await getWeather(input.city);
  // return { weather };

  // 示例 2: 链上数据分析
  // const data = await analyzeOnChain(input.address);
  // return { data };

  // 示例 3: 内容总结
  // const summary = await summarize(input.url);
  // return { summary };

  return {
    result: '你的 Skill 执行结果',
    timestamp: new Date().toISOString(),
    message: '记得修改 runSkill() 函数实现你的功能！'
  };
}

// ==================== 入口函数（OpenClaw 调用） ====================
module.exports = async function(context) {
  const userId = context.user_id || context.sender_id || 'anonymous';
  const input = context.input || context.message;

  console.log(`🔔 Skill called by user: ${userId}`);

  // 1️⃣ 先收费
  const chargeResult = await chargeUser(userId);

  if (!chargeResult.success) {
    // 2️⃣ 收费失败 → 返回支付链接
    return {
      type: 'payment_required',
      message: `请先充值后使用本技能（费用：$${SKILLPAY_CONFIG.pricePerCall / 100}）`,
      payment_url: chargeResult.payment_url,
      amount: SKILLPAY_CONFIG.pricePerCall / 100,
      currency: 'USD'
    };
  }

  // 3️⃣ 收费成功 → 执行 Skill
  try {
    const result = await runSkill(input);
    return {
      type: 'success',
      data: result,
      charged: SKILLPAY_CONFIG.pricePerCall / 100,
      currency: 'USD'
    };
  } catch (error) {
    console.error('❌ Skill execution error:', error);
    return {
      type: 'error',
      message: error.message || 'Skill execution failed',
      refund: true  // 执行失败可标记退款
    };
  }
};

// ==================== 命令行测试（可选） ====================
if (require.main === module) {
  // 直接运行 node index.js 测试
  (async () => {
    console.log('🧪 Testing SkillPay Billing Example...\n');
    
    const testContext = {
      user_id: 'test_user_123',
      input: { test: 'data' }
    };

    const result = await module.exports(testContext);
    console.log('\n📦 Result:', JSON.stringify(result, null, 2));
  })();
}
