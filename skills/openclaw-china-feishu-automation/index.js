/**
 * feishu-automation - 飞书自动化 Skill
 * 
 * @version 1.2.0
 * @author OpenClaw China Team
 * @license MIT
 */

const axios = require('axios');
const crypto = require('crypto');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class FeishuAutomation extends EventEmitter {
  constructor(configPath) {
    super();
    this.configPath = configPath || path.join(process.env.HOME, '.openclaw', 'feishu-config.yaml');
    this.config = null;
    this.tenantAccessToken = null;
    this.tokenExpiresAt = 0;
    this.stats = {
      messagesSent: 0,
      bitableOperations: 0,
      approvalsProcessed: 0,
      calendarEvents: 0,
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
   * 获取租户访问令牌
   */
  async getTenantAccessToken() {
    const now = Date.now();
    
    if (this.tenantAccessToken && now < this.tokenExpiresAt) {
      return this.tenantAccessToken;
    }

    try {
      const response = await axios.post(
        'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
        {
          app_id: this.config.feishu.app_id,
          app_secret: this.config.feishu.app_secret
        }
      );

      const { tenant_access_token, expire } = response.data;
      
      if (!tenant_access_token) {
        throw new Error('获取 tenant_access_token 失败');
      }

      this.tenantAccessToken = tenant_access_token;
      this.tokenExpiresAt = now + (expire - 300) * 1000;
      
      console.log('[Auth] 获取 tenant_access_token 成功');
      return tenant_access_token;
    } catch (error) {
      console.error('[Auth] 获取 token 失败:', error.message);
      throw error;
    }
  }

  /**
   * 发送机器人消息
   */
  async sendBotMessage(chatId, content, options = {}) {
    const token = await this.getTenantAccessToken();
    
    const payload = {
      receive_id: chatId,
      msg_type: options.type || 'text'
    };

    if (options.type === 'text') {
      payload.content = JSON.stringify({ text: content });
    } else if (options.type === 'post') {
      payload.content = JSON.stringify(content);
    } else if (options.type === 'interactive') {
      payload.content = typeof content === 'string' ? content : JSON.stringify(content);
    }

    try {
      const response = await axios.post(
        `https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=${options.receiveType || 'chat_id'}`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.code === 0) {
        this.stats.messagesSent++;
        console.log('[Message] 消息发送成功');
        return { success: true, messageId: response.data.data.message_id };
      } else {
        throw new Error(response.data.msg);
      }
    } catch (error) {
      console.error('[Message] 发送失败:', error.message);
      this.emit('error', { type: 'send', error });
      throw error;
    }
  }

  /**
   * 发送 Webhook 消息（群机器人）
   */
  async sendWebhookMessage(webhook, content, options = {}) {
    const payload = {
      msg_type: options.type || 'text'
    };

    if (options.type === 'text') {
      payload.content = { text: content };
    } else if (options.type === 'post') {
      payload.content = content;
    } else if (options.type === 'interactive') {
      payload.card = typeof content === 'string' ? JSON.parse(content) : content;
    }

    try {
      const response = await axios.post(webhook, payload);
      
      if (response.data.StatusCode === 0 || response.data.code === 0) {
        this.stats.messagesSent++;
        console.log('[Webhook] 消息发送成功');
        return { success: true };
      } else {
        throw new Error(response.data.msg || response.data.StatusMessage);
      }
    } catch (error) {
      console.error('[Webhook] 发送失败:', error.message);
      throw error;
    }
  }

  /**
   * 创建多维表格记录
   */
  async createBitableRecord(appToken, tableId, fields) {
    const token = await this.getTenantAccessToken();

    try {
      const response = await axios.post(
        `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`,
        { fields },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.code === 0) {
        this.stats.bitableOperations++;
        console.log('[Bitable] 记录创建成功');
        return { success: true, recordId: response.data.data.record_id };
      } else {
        throw new Error(response.data.msg);
      }
    } catch (error) {
      console.error('[Bitable] 创建记录失败:', error.message);
      throw error;
    }
  }

  /**
   * 更新多维表格记录
   */
  async updateBitableRecord(appToken, tableId, recordId, fields) {
    const token = await this.getTenantAccessToken();

    try {
      const response = await axios.put(
        `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`,
        { fields },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.code === 0) {
        this.stats.bitableOperations++;
        console.log('[Bitable] 记录更新成功');
        return { success: true };
      } else {
        throw new Error(response.data.msg);
      }
    } catch (error) {
      console.error('[Bitable] 更新记录失败:', error.message);
      throw error;
    }
  }

  /**
   * 查询多维表格记录
   */
  async queryBitableRecords(appToken, tableId, options = {}) {
    const token = await this.getTenantAccessToken();

    try {
      const response = await axios.get(
        `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          params: {
            page_size: options.pageSize || 100,
            page_token: options.pageToken,
            filter: options.filter ? JSON.stringify(options.filter) : undefined
          }
        }
      );

      if (response.data.code === 0) {
        this.stats.bitableOperations++;
        return {
          success: true,
          records: response.data.data.items,
          pageToken: response.data.data.page_token
        };
      } else {
        throw new Error(response.data.msg);
      }
    } catch (error) {
      console.error('[Bitable] 查询记录失败:', error.message);
      throw error;
    }
  }

  /**
   * 创建日历事件
   */
  async createCalendarEvent(calendarId, event) {
    const token = await this.getTenantAccessToken();

    try {
      const response = await axios.post(
        `https://open.feishu.cn/open-apis/calendar/v4/calendars/${calendarId}/events`,
        {
          summary: event.summary,
          description: event.description,
          start_time: {
            timestamp: event.startTime,
            timezone: 'Asia/Shanghai'
          },
          end_time: {
            timestamp: event.endTime,
            timezone: 'Asia/Shanghai'
          },
          attendees: event.attendees?.map(email => ({ email, type: 'user' }))
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.code === 0) {
        this.stats.calendarEvents++;
        console.log('[Calendar] 事件创建成功');
        return { success: true, eventId: response.data.data.event_id };
      } else {
        throw new Error(response.data.msg);
      }
    } catch (error) {
      console.error('[Calendar] 创建事件失败:', error.message);
      throw error;
    }
  }

  /**
   * 处理审批事件
   */
  async handleApprovalEvent(event) {
    const { instanceCode, action } = event;

    console.log(`[Approval] 审批事件：${instanceCode} - ${action}`);

    // 自动审批规则匹配
    const rules = this.config.approval_automation?.rules || [];
    
    for (const rule of rules) {
      if (this.matchApprovalRule(event, rule.condition)) {
        if (rule.action === 'approve') {
          await this.autoApprove(instanceCode);
          this.stats.approvalsProcessed++;
          return;
        }
      }
    }

    // 发送通知
    await this.sendApprovalNotification(event);
  }

  /**
   * 匹配审批规则
   */
  matchApprovalRule(event, condition) {
    if (condition.type && event.type !== condition.type) {
      return false;
    }

    if (condition.amount) {
      const [operator, value] = condition.amount.split(/(<=|>=|<|>|==)/).filter(Boolean);
      const eventAmount = parseFloat(event.amount);
      const ruleAmount = parseFloat(value);

      switch (operator) {
        case '<=': if (!(eventAmount <= ruleAmount)) return false; break;
        case '>=': if (!(eventAmount >= ruleAmount)) return false; break;
        case '<': if (!(eventAmount < ruleAmount)) return false; break;
        case '>': if (!(eventAmount > ruleAmount)) return false; break;
        case '==': if (!(eventAmount === ruleAmount)) return false; break;
      }
    }

    return true;
  }

  /**
   * 自动审批
   */
  async autoApprove(instanceCode) {
    const token = await this.getTenantAccessToken();

    try {
      await axios.post(
        `https://open.feishu.cn/open-apis/approval/v4/tasks/${instanceCode}/approve`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      console.log('[Approval] 自动审批通过');
    } catch (error) {
      console.error('[Approval] 自动审批失败:', error.message);
    }
  }

  /**
   * 发送审批通知
   */
  async sendApprovalNotification(event) {
    const config = this.config.approval_automation?.notifications || {};
    const notifyConfig = config[`on_${event.action}`];

    if (!notifyConfig) return;

    const message = notifyConfig.message || `审批${event.action === 'approve' ? '通过' : '被拒绝'}`;
    
    // 发送给申请人
    if (event.applicant) {
      await this.sendBotMessage(event.applicant, message, { type: 'text' });
    }
  }

  /**
   * 执行定时任务
   */
  async runScheduledTasks() {
    const tasks = this.config.bot_messages?.scheduled || [];

    for (const task of tasks) {
      if (this.isTimeToRun(task.cron)) {
        console.log(`[Schedule] 执行任务：${task.name}`);
        
        try {
          await this.sendBotMessage(
            task.chat_id,
            task.content,
            { type: task.message_type }
          );
        } catch (error) {
          console.error(`[Schedule] 任务失败：${task.name}`, error.message);
        }
      }
    }
  }

  /**
   * 检查是否到执行时间（简化版）
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

    await this.getTenantAccessToken();
    console.log('[Service] 飞书自动化启动成功');

    // 定时任务检查
    setInterval(() => {
      this.runScheduledTasks();
    }, 60000);

    this.emit('started');
  }

  /**
   * 停止服务
   */
  async stop() {
    console.log('[Service] 飞书自动化停止');
    this.emit('stopped');
  }
}

// CLI 入口
if (require.main === module) {
  const args = process.argv.slice(2);
  const automation = new FeishuAutomation();

  if (args[0] === 'start') {
    automation.start().catch(console.error);
  } else if (args[0] === 'test') {
    (async () => {
      await automation.loadConfig();
      const token = await automation.getTenantAccessToken();
      console.log('[Test] 连接成功，token:', token.substring(0, 20) + '...');
    })();
  } else if (args[0] === 'stats') {
    automation.loadConfig();
    console.log(JSON.stringify(automation.getStats(), null, 2));
  } else {
    console.log('用法：node index.js start|test|stats');
  }
}

module.exports = FeishuAutomation;
