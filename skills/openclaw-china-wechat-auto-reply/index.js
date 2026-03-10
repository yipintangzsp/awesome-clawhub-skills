/**
 * wechat-auto-reply - 微信自动回复 Skill
 * 
 * @version 1.2.0
 * @author OpenClaw China Team
 * @license MIT
 */

const { WechatFerryClient } = require('wcferry');
const { QwenClient } = require('@openclaw/ai-clients');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class WechatAutoReply extends EventEmitter {
  constructor(configPath) {
    super();
    this.configPath = configPath || path.join(process.env.HOME, '.openclaw', 'wechat-config.yaml');
    this.config = null;
    this.client = null;
    this.aiClient = null;
    this.stats = {
      totalReceived: 0,
      totalSent: 0,
      keywordReplies: 0,
      aiReplies: 0,
      startTime: Date.now()
    };
    this.messageQueue = [];
    this.rateLimit = {
      count: 0,
      resetTime: Date.now() + 3600000 // 1 小时
    };
  }

  /**
   * 加载配置文件
   */
  loadConfig() {
    try {
      const content = fs.readFileSync(this.configPath, 'utf-8');
      this.config = yaml.load(content);
      console.log('[Config] 配置文件加载成功');
      return true;
    } catch (error) {
      console.error('[Config] 加载失败:', error.message);
      return false;
    }
  }

  /**
   * 初始化 AI 客户端
   */
  initAIClient() {
    const model = this.config.wechat?.ai_model || 'qwen-plus';
    this.aiClient = new QwenClient({
      model,
      systemPrompt: this.config.ai_reply?.system_prompt || '你是一名专业的客服助手。'
    });
    console.log(`[AI] 初始化完成，模型：${model}`);
  }

  /**
   * 连接微信
   */
  async connect() {
    try {
      this.client = new WechatFerryClient();
      await this.client.connect();
      
      const userInfo = await this.client.getUserInfo();
      console.log('[WeChat] 登录成功:', userInfo.nickname);
      
      this.setupListeners();
      this.emit('connected', userInfo);
      return true;
    } catch (error) {
      console.error('[WeChat] 连接失败:', error.message);
      this.emit('error', { type: 'connection', error });
      return false;
    }
  }

  /**
   * 设置消息监听
   */
  setupListeners() {
    this.client.on('message', async (msg) => {
      this.stats.totalReceived++;
      await this.handleMessage(msg);
    });

    this.client.on('disconnect', () => {
      console.error('[WeChat] 连接断开');
      this.emit('disconnected');
    });
  }

  /**
   * 处理消息
   */
  async handleMessage(msg) {
    const { from, content, isGroup, groupId } = msg;

    // 跳过自己发的消息
    if (msg.fromSelf) return;

    // 检查速率限制
    if (!this.checkRateLimit()) {
      console.log('[RateLimit] 达到限制，跳过回复');
      return;
    }

    // 群聊处理
    if (isGroup) {
      await this.handleGroupMessage(msg);
      return;
    }

    // 私聊处理
    await this.handlePrivateMessage(msg);
  }

  /**
   * 处理私聊消息
   */
  async handlePrivateMessage(msg) {
    const { content } = msg;

    // 1. 尝试关键词匹配
    const keywordReply = this.matchKeyword(content);
    if (keywordReply) {
      await this.sendMessage(msg.from, keywordReply);
      this.stats.keywordReplies++;
      this.emit('keyword_reply', { msg, reply: keywordReply });
      return;
    }

    // 2. 使用 AI 回复
    if (this.config.ai_reply?.enabled) {
      try {
        const aiReply = await this.generateAIReply(content);
        await this.sendMessage(msg.from, aiReply);
        this.stats.aiReplies++;
        this.emit('ai_reply', { msg, reply: aiReply });
      } catch (error) {
        console.error('[AI] 回复失败:', error.message);
      }
    }
  }

  /**
   * 处理群聊消息
   */
  async handleGroupMessage(msg) {
    const { from, content, groupId } = msg;

    // 新人入群欢迎
    if (msg.type === 'group_join') {
      const welcomeMsg = this.config.groups?.welcome_message || '欢迎加入群聊！';
      const message = welcomeMsg.replace('@{user}', `@${from}`);
      await this.sendMessage(groupId, message);
      this.emit('group_welcome', { user: from, group: groupId });
      return;
    }

    // 群聊@机器人
    if (content.includes('@小助手') || content.includes('@机器人')) {
      const reply = await this.generateAIReply(content);
      await this.sendMessage(groupId, reply);
      this.stats.aiReplies++;
    }
  }

  /**
   * 关键词匹配
   */
  matchKeyword(content) {
    const keywords = this.config.keywords || [];

    for (const kw of keywords) {
      const triggers = Array.isArray(kw.trigger) ? kw.trigger : [kw.trigger];
      
      for (const trigger of triggers) {
        const matched = kw.exact !== false 
          ? content === trigger 
          : content.includes(trigger);
        
        if (matched) {
          return kw.response;
        }
      }
    }

    return null;
  }

  /**
   * 生成 AI 回复
   */
  async generateAIReply(content) {
    if (!this.aiClient) {
      throw new Error('AI 客户端未初始化');
    }

    // 加载知识库上下文
    const context = this.loadKnowledgeContext(content);
    
    const response = await this.aiClient.chat({
      messages: [
        { role: 'system', content: this.config.ai_reply?.system_prompt },
        { role: 'user', content: context ? `${context}\n\n用户问题：${content}` : content }
      ]
    });

    return response.content;
  }

  /**
   * 加载知识库上下文（RAG）
   */
  loadKnowledgeContext(query) {
    const kbPaths = this.config.ai_reply?.knowledge_base || [];
    if (kbPaths.length === 0) return null;

    // 简单实现：读取所有知识库文件
    // 生产环境应使用向量数据库进行相似度检索
    let context = '';
    for (const kb of kbPaths) {
      try {
        const content = fs.readFileSync(kb.path, 'utf-8');
        context += `${content}\n`;
      } catch (error) {
        console.warn('[KB] 读取失败:', kb.path);
      }
    }

    return context.substring(0, 2000); // 限制上下文长度
  }

  /**
   * 发送消息
   */
  async sendMessage(to, content) {
    // 速率限制检查
    if (!this.checkRateLimit()) {
      throw new Error('达到发送速率限制');
    }

    // 随机延迟（拟人化）
    const delay = this.getRandomDelay();
    await this.sleep(delay);

    try {
      await this.client.sendMessage(to, content);
      this.stats.totalSent++;
      this.rateLimit.count++;
      console.log(`[Send] 消息已发送：${to}`);
    } catch (error) {
      console.error('[Send] 发送失败:', error.message);
      this.emit('error', { type: 'send', error, to, content });
      throw error;
    }
  }

  /**
   * 检查速率限制
   */
  checkRateLimit() {
    const now = Date.now();
    const limit = this.config.wechat?.rate_limit || 60;

    if (now > this.rateLimit.resetTime) {
      this.rateLimit.count = 0;
      this.rateLimit.resetTime = now + 3600000;
    }

    return this.rateLimit.count < limit;
  }

  /**
   * 获取随机延迟
   */
  getRandomDelay() {
    const min = (this.config.wechat?.reply_delay?.min || 1) * 1000;
    const max = (this.config.wechat?.reply_delay?.max || 3) * 1000;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * 睡眠函数
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取统计数据
   */
  getStats() {
    const uptime = Date.now() - this.stats.startTime;
    return {
      ...this.stats,
      uptime: Math.floor(uptime / 1000),
      uptimeFormatted: this.formatUptime(uptime)
    };
  }

  /**
   * 格式化运行时间
   */
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    return `${days}天 ${hours % 24}小时 ${minutes % 60}分钟`;
  }

  /**
   * 导出统计报表
   */
  exportStats(format = 'json') {
    const stats = this.getStats();

    if (format === 'json') {
      return JSON.stringify(stats, null, 2);
    } else if (format === 'csv') {
      const headers = Object.keys(stats).join(',');
      const values = Object.values(stats).join(',');
      return `${headers}\n${values}`;
    }

    return stats;
  }

  /**
   * 断开连接
   */
  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
      console.log('[WeChat] 已断开连接');
    }
  }
}

// CLI 入口
if (require.main === module) {
  const args = process.argv.slice(2);
  const bot = new WechatAutoReply();

  if (args[0] === 'start') {
    (async () => {
      if (!bot.loadConfig()) {
        process.exit(1);
      }
      bot.initAIClient();
      await bot.connect();
      
      // 定时保存统计
      setInterval(() => {
        console.log('[Stats]', bot.getStats());
      }, 300000); // 每 5 分钟
    })();
  } else if (args[0] === 'stats') {
    bot.loadConfig();
    console.log(bot.exportStats('json'));
  } else {
    console.log('用法：node index.js start|stats');
  }
}

module.exports = WechatAutoReply;
