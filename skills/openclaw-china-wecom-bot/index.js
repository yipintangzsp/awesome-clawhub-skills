/**
 * wecom-bot - 企业微信机器人 Skill
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

class WeComBot extends EventEmitter {
  constructor(configPath) {
    super();
    this.configPath = configPath || path.join(process.env.HOME, '.openclaw', 'wecom-config.yaml');
    this.config = null;
    this.accessToken = null;
    this.tokenExpiresAt = 0;
    this.stats = {
      messagesSent: 0,
      messagesReceived: 0,
      approvalsProcessed: 0,
      startTime: Date.now()
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
   * 获取访问令牌
   */
  async getAccessToken() {
    const now = Date.now();
    
    // 检查缓存
    if (this.accessToken && now < this.tokenExpiresAt) {
      return this.accessToken;
    }

    try {
      const response = await axios.get(
        'https://qyapi.weixin.qq.com/cgi-bin/gettoken',
        {
          params: {
            corpid: this.config.wecom.corp_id,
            corpsecret: this.config.wecom.corp_secret
          }
        }
      );

      const { access_token, expires_in } = response.data;
      
      if (!access_token) {
        throw new Error('获取 access_token 失败');
      }

      this.accessToken = access_token;
      this.tokenExpiresAt = now + (expires_in - 300) * 1000; // 提前 5 分钟刷新
      
      console.log('[Auth] 获取 access_token 成功');
      return access_token;
    } catch (error) {
      console.error('[Auth] 获取 token 失败:', error.message);
      throw error;
    }
  }

  /**
   * 发送应用消息
   */
  async sendAppMessage(to, content, options = {}) {
    const token = await this.getAccessToken();
    
    const payload = {
      touser: to,
      toparty: options.departmentIds?.join('|'),
      totag: options.tagIds?.join('|'),
      msgtype: options.type || 'text',
      agentid: this.config.wecom.agent_id,
      safe: 0
    };

    // 根据类型设置内容
    if (options.type === 'text') {
      payload.text = { content };
    } else if (options.type === 'markdown') {
      payload.markdown = { content };
    } else if (options.type === 'textcard') {
      payload.textcard = content;
    } else if (options.type === 'news') {
      payload.news = { articles: content };
    }

    try {
      const response = await axios.post(
        `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${token}`,
        payload
      );

      if (response.data.errcode === 0) {
        this.stats.messagesSent++;
        console.log('[Message] 消息发送成功');
        return { success: true, messageId: response.data.message_id };
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
   * 发送群聊机器人消息
   */
  async sendChatbotMessage(webhook, content, options = {}) {
    const payload = {
      msgtype: options.type || 'text'
    };

    if (options.type === 'text') {
      payload.text = { content, mentioned_list: options.mention };
    } else if (options.type === 'markdown') {
      payload.markdown = { content };
    } else if (options.type === 'news') {
      payload.news = { articles: content };
    }

    try {
      const response = await axios.post(webhook, payload);
      
      if (response.data.errcode === 0) {
        this.stats.messagesSent++;
        console.log('[Chatbot] 消息发送成功');
        return { success: true };
      } else {
        throw new Error(response.data.errmsg);
      }
    } catch (error) {
      console.error('[Chatbot] 发送失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取成员列表
   */
  async getUsers(departmentId = 1) {
    const token = await this.getAccessToken();

    try {
      const response = await axios.get(
        `https://qyapi.weixin.qq.com/cgi-bin/user/list?access_token=${token}`,
        {
          params: {
            department_id: departmentId,
            fetch_child: 1
          }
        }
      );

      if (response.data.errcode === 0) {
        return response.data.userlist;
      } else {
        throw new Error(response.data.errmsg);
      }
    } catch (error) {
      console.error('[User] 获取成员列表失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取部门列表
   */
  async getDepartments() {
    const token = await this.getAccessToken();

    try {
      const response = await axios.get(
        `https://qyapi.weixin.qq.com/cgi-bin/department/list?access_token=${token}`
      );

      if (response.data.errcode === 0) {
        return response.data.department;
      } else {
        throw new Error(response.data.errmsg);
      }
    } catch (error) {
      console.error('[Department] 获取部门列表失败:', error.message);
      throw error;
    }
  }

  /**
   * 处理审批事件
   */
  async handleApproval(event) {
    const { templateName, action, applicant, approver } = event;

    console.log(`[Approval] 审批事件：${templateName} - ${action}`);

    // 自动审批规则匹配
    const rules = this.config.approval?.auto_approve || [];
    
    for (const rule of rules) {
      if (rule.template_name === templateName) {
        const shouldApprove = this.checkApprovalConditions(event, rule.conditions);
        
        if (shouldApprove) {
          await this.autoApprove(event);
          this.stats.approvalsProcessed++;
          return;
        }
      }
    }

    // 发送通知
    await this.sendApprovalNotification(event);
  }

  /**
   * 检查审批条件
   */
  checkApprovalConditions(event, conditions) {
    for (const condition of conditions) {
      const value = event[condition.field];
      
      switch (condition.operator) {
        case '<=':
          if (!(value <= condition.value)) return false;
          break;
        case '==':
          if (!(value === condition.value)) return false;
          break;
        case '>=':
          if (!(value >= condition.value)) return false;
          break;
      }
    }
    return true;
  }

  /**
   * 自动审批
   */
  async autoApprove(event) {
    const token = await this.getAccessToken();

    try {
      await axios.post(
        `https://qyapi.weixin.qq.com/cgi-bin/oa/approve?access_token=${token}`,
        {
          sp_no: event.spNo,
          action: 'agree',
          approver_userid: this.config.wecom.corp_id
        }
      );

      console.log('[Approval] 自动审批通过');
      
      // 发送通知给申请人
      await this.sendAppMessage(
        event.applicant,
        `✅ 您的${event.templateName}已自动获批`,
        { type: 'text' }
      );
    } catch (error) {
      console.error('[Approval] 自动审批失败:', error.message);
    }
  }

  /**
   * 发送审批通知
   */
  async sendApprovalNotification(event) {
    const config = this.config.approval?.notifications || {};
    const notifyConfig = config[`on_${event.action}`];

    if (!notifyConfig) return;

    const recipients = notifyConfig.notify;
    const message = notifyConfig.message;

    for (const recipient of recipients) {
      await this.sendAppMessage(recipient, message, { type: 'text' });
    }
  }

  /**
   * 处理客户事件
   */
  async handleCustomerEvent(event) {
    const { eventType, externalUserId, userId } = event;

    console.log(`[Customer] 客户事件：${eventType}`);

    if (eventType === 'add_external_contact') {
      // 发送欢迎语
      const welcomeMsg = this.config.customer?.welcome_message;
      if (welcomeMsg) {
        await this.sendAppMessage(userId, welcomeMsg, { type: 'text' });
      }

      // 自动打标（根据来源）
      await this.autoTagCustomer(externalUserId, event.source);
    }
  }

  /**
   * 自动给客户打标
   */
  async autoTagCustomer(externalUserId, source) {
    const rules = this.config.customer?.auto_tag || [];
    const tags = [];

    for (const rule of rules) {
      if (source && source.includes(rule.keyword)) {
        tags.push(rule.tag);
      }
    }

    if (tags.length > 0) {
      await this.addCustomerTags(externalUserId, tags);
    }
  }

  /**
   * 添加客户标签
   */
  async addCustomerTags(externalUserId, tags) {
    const token = await this.getAccessToken();

    try {
      await axios.post(
        `https://qyapi.weixin.qq.com/cgi-bin/externalcontact/mark_tag?access_token=${token}`,
        {
          external_userid: externalUserId,
          tag_id: tags
        }
      );

      console.log('[Customer] 添加标签成功:', tags);
    } catch (error) {
      console.error('[Customer] 添加标签失败:', error.message);
    }
  }

  /**
   * 执行定时任务
   */
  async runScheduledTasks() {
    const tasks = [
      ...(this.config.app_messages || []),
      ...(this.config.customer?.broadcast || [])
    ];

    for (const task of tasks) {
      if (this.isTimeToRun(task.schedule)) {
        console.log(`[Schedule] 执行任务：${task.name}`);
        
        try {
          await this.executeTask(task);
        } catch (error) {
          console.error(`[Schedule] 任务失败：${task.name}`, error.message);
        }
      }
    }
  }

  /**
   * 检查是否到执行时间
   */
  isTimeToRun(cronExpression) {
    // 简化的 cron 检查（生产环境应使用 node-cron）
    const now = new Date();
    const parts = cronExpression.split(' ');
    
    const minute = parseInt(parts[0]);
    const hour = parseInt(parts[1]);
    const dayOfWeek = parts[4];

    if (now.getMinutes() !== minute || now.getHours() !== hour) {
      return false;
    }

    // 检查星期
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
   * 执行任务
   */
  async executeTask(task) {
    const recipients = this.resolveRecipients(task.recipients);
    
    for (const recipient of recipients) {
      await this.sendAppMessage(
        recipient,
        task.content.text || task.content.content,
        { type: task.type }
      );
    }
  }

  /**
   * 解析接收者
   */
  resolveRecipients(recipientsConfig) {
    if (recipientsConfig.type === 'all') {
      return '@all';
    }
    
    if (recipientsConfig.user_ids) {
      return recipientsConfig.user_ids.join('|');
    }

    return recipientsConfig.user_ids?.join('|') || '@all';
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
   * 启动服务
   */
  async start() {
    if (!this.loadConfig()) {
      throw new Error('配置加载失败');
    }

    // 测试连接
    await this.getAccessToken();
    console.log('[Service] 企业微信机器人启动成功');

    // 定时任务检查
    setInterval(() => {
      this.runScheduledTasks();
    }, 60000); // 每分钟检查

    this.emit('started');
  }

  /**
   * 停止服务
   */
  async stop() {
    console.log('[Service] 企业微信机器人停止');
    this.emit('stopped');
  }
}

// CLI 入口
if (require.main === module) {
  const args = process.argv.slice(2);
  const bot = new WeComBot();

  if (args[0] === 'start') {
    bot.start().catch(console.error);
  } else if (args[0] === 'test') {
    (async () => {
      await bot.loadConfig();
      const token = await bot.getAccessToken();
      console.log('[Test] 连接成功，token:', token.substring(0, 20) + '...');
    })();
  } else if (args[0] === 'stats') {
    bot.loadConfig();
    console.log(JSON.stringify(bot.getStats(), null, 2));
  } else {
    console.log('用法：node index.js start|test|stats');
  }
}

module.exports = WeComBot;
