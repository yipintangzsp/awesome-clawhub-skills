/**
 * dingtalk-cs - 钉钉客服 Skill
 * 
 * @version 1.3.0
 * @author OpenClaw China Team
 * @license MIT
 */

const axios = require('axios');
const crypto = require('crypto');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class DingTalkCS extends EventEmitter {
  constructor(configPath) {
    super();
    this.configPath = configPath || path.join(process.env.HOME, '.openclaw', 'dingtalk-config.yaml');
    this.config = null;
    this.accessToken = null;
    this.tokenExpiresAt = 0;
    this.stats = {
      messagesSent: 0,
      messagesReceived: 0,
      ticketsCreated: 0,
      ticketsResolved: 0,
      sessionsHandled: 0,
      startTime: Date.now()
    };
    this.sessions = new Map(); // 会话管理
    this.tickets = new Map();  // 工单管理
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
   * 获取访问令牌
   */
  async getAccessToken() {
    const now = Date.now();
    
    if (this.accessToken && now < this.tokenExpiresAt) {
      return this.accessToken;
    }

    try {
      const response = await axios.get(
        'https://oapi.dingtalk.com/gettoken',
        {
          params: {
            appkey: this.config.dingtalk.app_key,
            appsecret: this.config.dingtalk.app_secret
          }
        }
      );

      const { access_token, expires_in } = response.data;
      
      if (!access_token || response.data.errcode !== 0) {
        throw new Error(response.data.errmsg || '获取 access_token 失败');
      }

      this.accessToken = access_token;
      this.tokenExpiresAt = now + (expires_in - 300) * 1000;
      
      console.log('[Auth] 获取 access_token 成功');
      return access_token;
    } catch (error) {
      console.error('[Auth] 获取 token 失败:', error.message);
      throw error;
    }
  }

  /**
   * 发送消息
   */
  async sendMessage(userId, content, options = {}) {
    const token = await this.getAccessToken();

    const payload = {
      agentid: this.config.dingtalk.agent_id,
      userid: userId,
      msgtype: options.type || 'text'
    };

    if (options.type === 'text') {
      payload.text = { content };
    } else if (options.type === 'markdown') {
      payload.markdown = { title: options.title || '消息', text: content };
    } else if (options.type === 'link') {
      payload.link = content;
    } else if (options.type === 'action_card') {
      payload.action_card = content;
    }

    try {
      const response = await axios.post(
        `https://oapi.dingtalk.com/topapi/message/corpconversation/asyncsend_v2?access_token=${token}`,
        payload
      );

      if (response.data.errcode === 0) {
        this.stats.messagesSent++;
        console.log('[Message] 消息发送成功');
        return { success: true, taskId: response.data.taskid };
      } else {
        throw new Error(response.data.errmsg);
      }
    } catch (error) {
      console.error('[Message] 发送失败:', error.message);
      this.emit('error', { type: 'send', error });
      throw error;
    }
  }

  /**
   * 发送群机器人消息
   */
  async sendRobotMessage(webhook, content, options = {}) {
    const payload = {
      msgtype: options.type || 'text'
    };

    if (options.type === 'text') {
      payload.text = { content, at: options.at };
    } else if (options.type === 'markdown') {
      payload.markdown = { title: options.title, text: content };
    } else if (options.type === 'link') {
      payload.link = content;
    }

    try {
      const response = await axios.post(webhook, payload);
      
      if (response.data.errcode === 0) {
        this.stats.messagesSent++;
        console.log('[Robot] 消息发送成功');
        return { success: true };
      } else {
        throw new Error(response.data.errmsg);
      }
    } catch (error) {
      console.error('[Robot] 发送失败:', error.message);
      throw error;
    }
  }

  /**
   * 处理消息
   */
  async handleMessage(msg) {
    const { userId, content, conversationId, isGroup } = msg;

    this.stats.messagesReceived++;
    this.stats.sessionsHandled++;

    // 获取或创建会话
    const session = this.getOrCreateSession(userId, conversationId);

    // 1. 检查是否需要转人工
    if (this.shouldTransferToHuman(content, session)) {
      await this.transferToHuman(userId, session);
      return;
    }

    // 2. 尝试关键词匹配
    const keywordReply = this.matchKeyword(content);
    if (keywordReply) {
      await this.sendMessage(userId, keywordReply.response, { type: 'text' });
      if (keywordReply.action === 'transfer_to_human') {
        await this.transferToHuman(userId, session);
      }
      return;
    }

    // 3. 尝试知识库匹配
    const kbReply = this.matchKnowledgeBase(content);
    if (kbReply) {
      await this.sendMessage(userId, kbReply.answer, { type: 'text' });
      session.lastMatch = kbReply;
      return;
    }

    // 4. 使用 AI 回复
    if (this.config.chatbot?.ai_reply?.enabled) {
      try {
        const aiReply = await this.generateAIReply(content, session.context);
        
        // 检查置信度
        if (aiReply.confidence < this.config.chatbot.ai_reply.confidence_threshold) {
          await this.sendMessage(userId, '抱歉，我不太理解您的问题。为您转接人工客服。', { type: 'text' });
          await this.transferToHuman(userId, session);
          return;
        }

        await this.sendMessage(userId, aiReply.content, { type: 'text' });
        session.context.push({ role: 'assistant', content: aiReply.content });
      } catch (error) {
        console.error('[AI] 回复失败:', error.message);
        await this.sendMessage(userId, '抱歉，系统繁忙，请稍后再试。', { type: 'text' });
      }
    }
  }

  /**
   * 获取或创建会话
   */
  getOrCreateSession(userId, conversationId) {
    const sessionId = `${userId}_${conversationId}`;
    
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        userId,
        conversationId,
        startTime: Date.now(),
        lastActivity: Date.now(),
        context: [],
        messages: [],
        transferred: false
      });
    }

    const session = this.sessions.get(sessionId);
    session.lastActivity = Date.now();
    return session;
  }

  /**
   * 关键词匹配
   */
  matchKeyword(content) {
    const keywords = this.config.chatbot?.keywords || [];

    for (const kw of keywords) {
      const triggers = Array.isArray(kw.trigger) ? kw.trigger : [kw.trigger];
      
      for (const trigger of triggers) {
        if (content.includes(trigger)) {
          return kw;
        }
      }
    }

    return null;
  }

  /**
   * 知识库匹配
   */
  matchKnowledgeBase(content) {
    const faqList = this.config.knowledge_base?.faq || [];
    
    let bestMatch = null;
    let bestScore = 0;

    for (const category of faqList) {
      for (const qa of category.questions) {
        const score = this.calculateSimilarity(content, qa.q);
        
        if (score > bestScore && score >= (this.config.knowledge_base?.matching?.threshold || 0.6)) {
          bestScore = score;
          bestMatch = {
            question: qa.q,
            answer: qa.a,
            score,
            category: category.category
          };
        }
      }
    }

    return bestMatch;
  }

  /**
   * 计算相似度（简化版）
   */
  calculateSimilarity(text1, text2) {
    // 简单实现：基于关键词重叠
    const words1 = text1.toLowerCase().split(/[\s,，.。?!？！]+/).filter(w => w.length > 1);
    const words2 = text2.toLowerCase().split(/[\s,，.。?!？！]+/).filter(w => w.length > 1);
    
    const intersection = words1.filter(w => words2.includes(w));
    const union = new Set([...words1, ...words2]).size;
    
    return union > 0 ? intersection.length / union : 0;
  }

  /**
   * 生成 AI 回复
   */
  async generateAIReply(content, context = []) {
    // 这里应该调用实际的 AI API
    // 简化实现
    return {
      content: `感谢您的咨询，关于"${content}"，建议您查看我们的帮助文档或联系人工客服获取详细解答。`,
      confidence: 0.5
    };
  }

  /**
   * 检查是否转人工
   */
  shouldTransferToHuman(content, session) {
    // 用户明确要求转人工
    if (content.includes('转人工') || content.includes('人工客服')) {
      return true;
    }

    // 会话中已多次无法解答
    if (session.unsolvedCount >= 3) {
      return true;
    }

    // 检测到负面情绪
    if (this.detectNegativeSentiment(content)) {
      return true;
    }

    return false;
  }

  /**
   * 检测负面情绪（简化版）
   */
  detectNegativeSentiment(content) {
    const negativeWords = ['投诉', '举报', '垃圾', '骗子', '差评', '生气', '失望'];
    return negativeWords.some(word => content.includes(word));
  }

  /**
   * 转人工客服
   */
  async transferToHuman(userId, session) {
    if (session.transferred) return;
    
    session.transferred = true;

    // 创建工单
    const ticket = await this.createTicket({
      userId,
      content: session.messages.map(m => m.content).join('\n'),
      priority: this.detectNegativeSentiment(session.messages[session.messages.length - 1]?.content) ? 'high' : 'normal'
    });

    // 通知用户
    await this.sendMessage(userId, `已为您创建工单 #${ticket.id}，客服将尽快联系您。`, { type: 'text' });

    // 通知客服
    await this.notifyAgents(ticket);

    this.emit('transfer', { userId, session, ticket });
  }

  /**
   * 创建工单
   */
  async createTicket(ticketData) {
    const ticket = {
      id: `T${Date.now()}`,
      ...ticketData,
      status: 'open',
      createdAt: Date.now(),
      assignee: null
    };

    this.tickets.set(ticket.id, ticket);
    this.stats.ticketsCreated++;

    // 自动分配
    if (this.config.ticket?.auto_assign) {
      this.assignTicket(ticket);
    }

    this.emit('ticket_created', ticket);
    return ticket;
  }

  /**
   * 分配工单
   */
  assignTicket(ticket) {
    const assignment = this.config.ticket?.assignment || {};
    const strategy = assignment.strategy || 'round_robin';

    // 根据技能组分配
    const skillGroup = this.findSkillGroup(ticket.content);
    if (skillGroup) {
      const agent = this.selectAgent(skillGroup.agents, strategy);
      ticket.assignee = agent;
      ticket.skillGroup = skillGroup.name;
    }

    this.emit('ticket_assigned', ticket);
  }

  /**
   * 查找技能组
   */
  findSkillGroup(content) {
    const groups = this.config.ticket?.assignment?.skill_groups || [];
    
    for (const group of groups) {
      if (group.keywords.some(kw => content.includes(kw))) {
        return group;
      }
    }

    return null;
  }

  /**
   * 选择客服（轮询）
   */
  selectAgent(agents, strategy) {
    if (!agents || agents.length === 0) return null;
    
    if (strategy === 'round_robin') {
      const index = (this.agentIndex || 0) % agents.length;
      this.agentIndex = index + 1;
      return agents[index];
    }

    return agents[0];
  }

  /**
   * 通知客服
   */
  async notifyAgents(ticket) {
    const managers = ['manager']; // 实际应从配置获取
    
    for (const manager of managers) {
      await this.sendMessage(manager, `📋 新工单 #${ticket.id}\n用户：${ticket.userId}\n优先级：${ticket.priority}`, { type: 'text' });
    }
  }

  /**
   * 执行定时任务
   */
  async runScheduledTasks() {
    const tasks = this.config.work_notifications?.scheduled || [];

    for (const task of tasks) {
      if (this.isTimeToRun(task.cron)) {
        console.log(`[Schedule] 执行任务：${task.name}`);
        
        try {
          await this.sendMessage('@all', task.content, { type: 'markdown' });
        } catch (error) {
          console.error(`[Schedule] 任务失败：${task.name}`, error.message);
        }
      }
    }

    // 检查 SLA
    this.checkSLA();
  }

  /**
   * 检查 SLA
   */
  checkSLA() {
    const now = Date.now();
    const slaConfig = this.config.ticket?.sla || {};

    for (const [ticketId, ticket] of this.tickets) {
      if (ticket.status !== 'open') continue;

      const responseTime = (now - ticket.createdAt) / (1000 * 60 * 60); // 小时
      const limit = slaConfig.response_time?.[ticket.priority] || 24;

      if (responseTime >= limit * 0.8 && !ticket.slaWarned) {
        // 即将超时警告
        this.notifySLABreach(ticket, 'warning');
        ticket.slaWarned = true;
      } else if (responseTime >= limit) {
        // 已超时
        this.notifySLABreach(ticket, 'breach');
      }
    }
  }

  /**
   * 通知 SLA 问题
   */
  async notifySLABreach(ticket, type) {
    const message = type === 'breach' 
      ? `❌ 工单 SLA 已超时：#${ticket.id}`
      : `⚠️ 工单即将超时：#${ticket.id}`;

    await this.sendMessage('manager', message, { type: 'text' });
  }

  /**
   * 检查是否到执行时间
   */
  isTimeToRun(cronExpression) {
    const now = new Date();
    const parts = cronExpression.split(' ');
    
    const minute = parseInt(parts[0]);
    const hour = parseInt(parts[1]);
    const dayOfWeek = parts[4];

    if (now.getMinutes() !== minute || now.getHours() !== hour) {
      return false;
    }

    if (dayOfWeek !== '*') {
      const days = dayOfWeek.split('-').map(d => parseInt(d));
      const currentDay = now.getDay();
      if (!days.includes(currentDay)) {
        return false;
      }
    }

    return true;
  }

  /**
   * 获取统计数据
   */
  getStats() {
    const uptime = Date.now() - this.stats.startTime;
    return {
      ...this.stats,
      uptime: Math.floor(uptime / 1000),
      uptimeFormatted: this.formatUptime(uptime),
      activeSessions: this.sessions.size,
      openTickets: Array.from(this.tickets.values()).filter(t => t.status === 'open').length
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
   * 启动服务
   */
  async start() {
    if (!this.loadConfig()) {
      throw new Error('配置加载失败');
    }

    await this.getAccessToken();
    console.log('[Service] 钉钉客服启动成功');

    // 定时任务
    setInterval(() => {
      this.runScheduledTasks();
    }, 60000);

    // 清理过期会话
    setInterval(() => {
      this.cleanupSessions();
    }, 300000);

    this.emit('started');
  }

  /**
   * 清理过期会话
   */
  cleanupSessions() {
    const timeout = this.config.chatbot?.context?.timeout || 1800000; // 30 分钟
    const now = Date.now();

    for (const [sessionId, session] of this.sessions) {
      if (now - session.lastActivity > timeout) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * 停止服务
   */
  async stop() {
    console.log('[Service] 钉钉客服停止');
    this.emit('stopped');
  }
}

// CLI 入口
if (require.main === module) {
  const args = process.argv.slice(2);
  const cs = new DingTalkCS();

  if (args[0] === 'start') {
    cs.start().catch(console.error);
  } else if (args[0] === 'test') {
    (async () => {
      await cs.loadConfig();
      const token = await cs.getAccessToken();
      console.log('[Test] 连接成功，token:', token.substring(0, 20) + '...');
    })();
  } else if (args[0] === 'stats') {
    cs.loadConfig();
    console.log(JSON.stringify(cs.getStats(), null, 2));
  } else {
    console.log('用法：node index.js start|test|stats');
  }
}

module.exports = DingTalkCS;
