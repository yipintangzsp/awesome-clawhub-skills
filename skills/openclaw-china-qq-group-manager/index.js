/**
 * qq-group-manager - QQ 群管理 Skill
 * 
 * @version 1.2.0
 * @author OpenClaw China Team
 * @license MIT
 */

const WebSocket = require('ws');
const axios = require('axios');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class QQGroupManager extends EventEmitter {
  constructor(configPath) {
    super();
    this.configPath = configPath || path.join(process.env.HOME, '.openclaw', 'qq-config.yaml');
    this.config = null;
    this.ws = null;
    this.httpUrl = null;
    this.sequence = 0;
    this.stats = {
      messagesReceived: 0,
      messagesSent: 0,
      signIns: 0,
      violationsHandled: 0,
      newMembers: 0,
      startTime: Date.now()
    };
    this.signIns = new Map(); // 签到记录
    this.messageCache = new Map(); // 消息缓存（刷屏检测）
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
   * 连接 OneBot
   */
  async connect() {
    return new Promise((resolve, reject) => {
      const wsUrl = this.config.qq.ws_url;
      this.ws = new WebSocket(wsUrl);

      this.ws.on('open', () => {
        console.log('[WebSocket] 连接成功');
        resolve();
      });

      this.ws.on('message', (data) => {
        try {
          const event = JSON.parse(data);
          this.handleEvent(event);
        } catch (error) {
          console.error('[WebSocket] 解析消息失败:', error.message);
        }
      });

      this.ws.on('error', (error) => {
        console.error('[WebSocket] 连接错误:', error.message);
        reject(error);
      });

      this.ws.on('close', () => {
        console.log('[WebSocket] 连接关闭');
        this.emit('disconnected');
      });
    });
  }

  /**
   * 处理事件
   */
  async handleEvent(event) {
    const { post_type, message_type, event_type } = event;

    if (post_type === 'message') {
      this.stats.messagesReceived++;
      
      if (message_type === 'group') {
        await this.handleGroupMessage(event);
      } else if (message_type === 'private') {
        await this.handlePrivateMessage(event);
      }
    } else if (post_type === 'notice') {
      if (event_type === 'group_increase') {
        await this.handleGroupIncrease(event);
      } else if (event_type === 'group_decrease') {
        await this.handleGroupDecrease(event);
      }
    } else if (post_type === 'request') {
      if (event_type === 'group') {
        await this.handleGroupRequest(event);
      }
    }
  }

  /**
   * 处理群消息
   */
  async handleGroupMessage(event) {
    const { group_id, user_id, message, raw_message } = event;
    const groupConfig = this.getGroupConfig(group_id);

    if (!groupConfig) return;

    // 刷屏检测
    if (await this.checkSpam(group_id, user_id)) {
      return;
    }

    // 违规检测
    if (await this.checkViolation(event)) {
      return;
    }

    // 签到命令
    if (raw_message === '签到' || raw_message === '打卡') {
      await this.handleSignIn(event);
      return;
    }

    // 关键词回复
    const reply = this.matchKeyword(raw_message, groupConfig);
    if (reply) {
      await this.sendGroupMessage(group_id, this.formatReply(reply, event));
      return;
    }

    // AI 对话（被@时）
    if (this.isMentioned(event) && this.config.ai_chat?.enabled) {
      await this.handleAIChat(event);
    }
  }

  /**
   * 处理私聊消息
   */
  async handlePrivateMessage(event) {
    const { user_id, message, raw_message } = event;

    // 管理员命令
    if (this.isAdmin(user_id)) {
      await this.handleAdminCommand(event);
      return;
    }

    // AI 对话
    if (this.config.ai_chat?.enabled) {
      await this.handleAIChat(event);
    }
  }

  /**
   * 处理新人入群
   */
  async handleGroupIncrease(event) {
    const { group_id, user_id, nickname } = event;
    const groupConfig = this.getGroupConfig(group_id);

    if (!groupConfig?.welcome?.enabled) return;

    this.stats.newMembers++;

    const message = groupConfig.welcome.message
      .replace('@{nickname}', nickname)
      .replace('@{user}', `[CQ:at,qq=${user_id}]`);

    await this.sendGroupMessage(group_id, message);
    this.emit('member_join', { group_id, user_id, nickname });
  }

  /**
   * 处理成员离开
   */
  async handleGroupDecrease(event) {
    const { group_id, user_id } = event;
    this.emit('member_leave', { group_id, user_id });
  }

  /**
   * 处理加群请求
   */
  async handleGroupRequest(event) {
    const { group_id, user_id, comment } = event;
    
    // 自动审批（可配置）
    if (this.config.groups?.auto_approve) {
      await this.setRequestApproval(event.flag, true);
    }
  }

  /**
   * 处理签到
   */
  async handleSignIn(event) {
    const { group_id, user_id, nickname } = event;
    const today = new Date().toDateString();
    const key = `${group_id}_${user_id}_${today}`;

    // 检查是否已签到
    if (this.signIns.has(key)) {
      await this.sendGroupMessage(group_id, `${nickname} 今天已经签到过了哦~`);
      return;
    }

    // 计算奖励
    const reward = this.calculateSignInReward(user_id, group_id);
    this.signIns.set(key, reward);
    this.stats.signIns++;

    // 连续签到
    const streak = this.getSignInStreak(user_id, group_id);
    
    let message = `🎉 ${nickname} 签到成功！获得 ${reward} 积分`;
    if (streak > 1) {
      message += `\n🔥 连续签到 ${streak} 天，额外奖励 ${streak * 2} 积分！`;
    }

    await this.sendGroupMessage(group_id, message);
    this.emit('signin', { user_id, nickname, reward, streak });
  }

  /**
   * 计算签到奖励
   */
  calculateSignInReward(userId, groupId) {
    const config = this.config.groups?.find(g => g.group_id === groupId)?.signin;
    const min = config?.reward?.min || 1;
    const max = config?.reward?.max || 10;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * 获取连续签到天数
   */
  getSignInStreak(userId, groupId) {
    // 简化实现，实际应从数据库读取
    return 1;
  }

  /**
   * 关键词匹配
   */
  matchKeyword(content, groupConfig) {
    const keywords = this.config.keywords || [];

    for (const kw of keywords) {
      const triggers = Array.isArray(kw.trigger) ? kw.trigger : [kw.trigger];
      
      for (const trigger of triggers) {
        let matched = false;

        if (kw.match_type === 'regex') {
          matched = new RegExp(trigger).test(content);
        } else if (kw.match_type === 'contains') {
          matched = content.includes(trigger);
        } else {
          matched = content === trigger;
        }

        if (matched) {
          return kw;
        }
      }
    }

    // 群内关键词
    const groupKeywords = groupConfig?.keywords || [];
    for (const kw of groupKeywords) {
      if (content.includes(kw.trigger)) {
        return kw;
      }
    }

    return null;
  }

  /**
   * 格式化回复
   */
  formatReply(reply, event) {
    let response = reply.response;
    
    // 替换变量
    response = response.replace('{random(', (match, args) => {
      const [min, max] = args.split(',').map(Number);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    });

    response = response.replace('@{nickname}', event.nickname);
    
    return response;
  }

  /**
   * 检查是否被@
   */
  isMentioned(event) {
    return event.message.some(m => m.type === 'at' && m.data.qq === event.self_id);
  }

  /**
   * 处理 AI 对话
   */
  async handleAIChat(event) {
    const { group_id, user_id, raw_message } = event;
    
    // 提取@后的内容
    const content = raw_message.replace(/@\[CQ:at,qq=\d+\]/, '').trim();
    
    if (!content) return;

    // 调用 AI API（简化实现）
    const reply = `收到你的消息：${content}。我是 AI 助手，有什么可以帮你？`;
    
    if (event.message_type === 'group') {
      await this.sendGroupMessage(group_id, `[CQ:at,qq=${user_id}] ${reply}`);
    } else {
      await this.sendPrivateMessage(user_id, reply);
    }
  }

  /**
   * 刷屏检测
   */
  async checkSpam(groupId, userId) {
    const groupConfig = this.getGroupConfig(groupId);
    if (!groupConfig?.spam_detection?.enabled) return false;

    const key = `${groupId}_${userId}`;
    const now = Date.now();
    const window = groupConfig.spam_detection.window || 60000;
    const threshold = groupConfig.spam_detection.threshold || 10;

    // 获取用户消息记录
    let records = this.messageCache.get(key) || [];
    
    // 清理过期记录
    records = records.filter(t => now - t < window);
    records.push(now);
    this.messageCache.set(key, records);

    // 检查是否刷屏
    if (records.length > threshold) {
      console.log(`[Spam] 检测到刷屏：${userId}`);
      
      const action = groupConfig.spam_detection.action;
      const duration = groupConfig.spam_detection.duration || 60;

      if (action === 'mute') {
        await this.muteMember(groupId, userId, duration * 60);
        await this.sendGroupMessage(groupId, `⚠️ ${userId} 因刷屏被禁言 ${duration} 分钟`);
      }

      return true;
    }

    return false;
  }

  /**
   * 违规检测
   */
  async checkViolation(event) {
    const { group_id, raw_message } = event;
    const groupConfig = this.getGroupConfig(group_id);
    if (!groupConfig) return false;

    const rules = groupConfig.rules || [];

    for (const rule of rules) {
      const keywords = rule.keywords || [];
      
      for (const keyword of keywords) {
        if (raw_message.includes(keyword)) {
          console.log(`[Violation] 触发规则：${rule.name}`);
          
          this.stats.violationsHandled++;
          
          // 发送警告
          if (rule.warning) {
            await this.sendGroupMessage(group_id, rule.warning);
          }

          // 执行处罚
          if (rule.action === 'kick') {
            await this.kickMember(group_id, event.user_id);
          } else if (rule.action === 'ban') {
            await this.banMember(group_id, event.user_id);
          } else if (rule.action === 'mute') {
            await this.muteMember(group_id, event.user_id, 600);
          }

          this.emit('violation', { event, rule });
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 处理管理员命令
   */
  async handleAdminCommand(event) {
    const { raw_message } = event;

    if (raw_message.startsWith('.禁言')) {
      // 解析命令
      const match = raw_message.match(/\.禁言\s+(\d+)\s+(\d+)/);
      if (match) {
        const [, userId, duration] = match;
        await this.muteMember(event.group_id, userId, parseInt(duration));
      }
    } else if (raw_message.startsWith('.踢人')) {
      const match = raw_message.match(/\.踢人\s+(\d+)/);
      if (match) {
        await this.kickMember(event.group_id, parseInt(match[1]));
      }
    } else if (raw_message === '.统计') {
      const stats = this.getStats();
      await this.sendPrivateMessage(event.user_id, JSON.stringify(stats, null, 2));
    }
  }

  /**
   * 发送群消息
   */
  async sendGroupMessage(groupId, message) {
    await this.callAPI('send_group_msg', {
      group_id: groupId,
      message
    });
    this.stats.messagesSent++;
  }

  /**
   * 发送私聊消息
   */
  async sendPrivateMessage(userId, message) {
    await this.callAPI('send_private_msg', {
      user_id: userId,
      message
    });
    this.stats.messagesSent++;
  }

  /**
   * 禁言成员
   */
  async muteMember(groupId, userId, duration) {
    await this.callAPI('set_group_ban', {
      group_id: groupId,
      user_id: userId,
      duration
    });
  }

  /**
   * 踢出成员
   */
  async kickMember(groupId, userId) {
    await this.callAPI('set_group_kick', {
      group_id: groupId,
      user_id: userId
    });
  }

  /**
   * 禁止成员
   */
  async banMember(groupId, userId) {
    await this.callAPI('set_group_ban', {
      group_id: groupId,
      user_id: userId,
      duration: 2592000 // 30 天
    });
  }

  /**
   * 处理加群请求
   */
  async setRequestApproval(flag, approve) {
    await this.callAPI('set_group_add_request', {
      flag,
      approve,
      reason: approve ? '' : '不符合入群条件'
    });
  }

  /**
   * 调用 OneBot API
   */
  async callAPI(action, params = {}) {
    const sequence = ++this.sequence;
    
    return new Promise((resolve, reject) => {
      const request = {
        action,
        params,
        echo: sequence
      };

      const timeout = setTimeout(() => {
        reject(new Error(`API 超时：${action}`));
      }, 5000);

      const handler = (data) => {
        try {
          const response = JSON.parse(data);
          if (response.echo === sequence) {
            clearTimeout(timeout);
            this.ws.removeListener('message', handler);
            
            if (response.status === 'ok') {
              resolve(response.data);
            } else {
              reject(new Error(response.msg || response.message || 'API 调用失败'));
            }
          }
        } catch (e) {
          // 忽略
        }
      };

      this.ws.on('message', handler);
      this.ws.send(JSON.stringify(request));
    });
  }

  /**
   * 获取群配置
   */
  getGroupConfig(groupId) {
    return this.config.groups?.find(g => g.group_id === groupId);
  }

  /**
   * 检查是否管理员
   */
  isAdmin(userId) {
    return this.config.qq?.admins?.includes(userId);
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
      cacheSize: this.messageCache.size
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

    await this.connect();
    console.log('[Service] QQ 群管理启动成功');

    // 定时清理缓存
    setInterval(() => {
      const now = Date.now();
      for (const [key, records] of this.messageCache) {
        const filtered = records.filter(t => now - t < 60000);
        if (filtered.length === 0) {
          this.messageCache.delete(key);
        } else {
          this.messageCache.set(key, filtered);
        }
      }
    }, 60000);

    this.emit('started');
  }

  /**
   * 停止服务
   */
  async stop() {
    if (this.ws) {
      this.ws.close();
    }
    console.log('[Service] QQ 群管理停止');
    this.emit('stopped');
  }
}

// CLI 入口
if (require.main === module) {
  const args = process.argv.slice(2);
  const manager = new QQGroupManager();

  if (args[0] === 'start') {
    manager.start().catch(console.error);
  } else if (args[0] === 'test') {
    (async () => {
      await manager.loadConfig();
      await manager.connect();
      console.log('[Test] 连接成功');
      process.exit(0);
    })();
  } else if (args[0] === 'stats') {
    manager.loadConfig();
    console.log(JSON.stringify(manager.getStats(), null, 2));
  } else {
    console.log('用法：node index.js start|test|stats');
  }
}

module.exports = QQGroupManager;
