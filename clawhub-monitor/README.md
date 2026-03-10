# ClawHub 服务器状态监控系统

## 📋 功能概述

- ✅ **每小时自动检查** ClawHub 服务器状态
- ✅ **服务器恢复后自动通知**（飞书）
- ✅ **自动获取积压收入数据**
- ✅ **生成收入补报**（Markdown 格式）

## 📁 文件清单

| 文件 | 说明 |
|------|------|
| `clawhub-status-monitor.sh` | 主监控脚本（可执行） |
| `status-config.json` | 配置文件 |
| `feishu-notification-setup.md` | 飞书通知配置指南 |
| `README.md` | 本文件 |

## 🚀 快速开始

### 1. 配置飞书通知

```bash
cd /Users/admin/.openclaw/workspace/clawhub-monitor

# 编辑配置文件，替换 Webhook URL
nano status-config.json
```

在 `status-config.json` 中找到并替换：
```json
"webhookUrl": "https://open.feishu.cn/open-apis/bot/v2/hook/YOUR_ACTUAL_TOKEN"
```

详细配置步骤见 `feishu-notification-setup.md`

### 2. 测试监控脚本

```bash
# 查看帮助
./clawhub-status-monitor.sh --help

# 执行一次状态检查
./clawhub-status-monitor.sh --check

# 查看当前状态
./clawhub-status-monitor.sh --status
```

### 3. 设置定时任务（每小时执行）

```bash
# 编辑 crontab
crontab -e

# 添加以下行（每小时第 0 分钟执行）
0 * * * * /Users/admin/.openclaw/workspace/clawhub-monitor/clawhub-status-monitor.sh --check
```

## 📊 输出说明

### 飞书通知类型

1. **🟢 服务器恢复通知**
   - 恢复时间
   - 停机时长
   - 积压数据条数

2. **🔴 服务器故障通知**
   - 检测时间
   - 错误信息
   - 重试次数

3. **💰 收入补报通知**
   - 统计周期
   - 补报收入
   - 数据条数
   - 报表文件路径

### 生成的文件

- `monitor-state.json` - 运行状态（自动生成）
- `monitor.log` - 日志文件（自动生成）
- `revenue-reports/revenue-report-*.md` - 收入报告（服务器恢复时生成）

## 🔧 配置选项

编辑 `status-config.json` 可自定义：

```json
{
  "monitor": {
    "checkIntervalMinutes": 60,  // 检查间隔（分钟）
    "enabled": true               // 是否启用
  },
  "server": {
    "checkUrl": "https://clawhub.com/api/health",  // 健康检查 URL
    "timeoutSeconds": 30,      // 超时时间
    "retryCount": 3,           // 重试次数
    "retryDelaySeconds": 5     // 重试间隔
  },
  "notifications": {
    "feishu": {
      "enabled": true,
      "webhookUrl": "YOUR_WEBHOOK",
      "notifyOnRecovery": true,
      "notifyOnFailure": true
    }
  }
}
```

## 📝 日志查看

```bash
# 实时查看日志
tail -f monitor.log

# 查看最近 50 行
tail -n 50 monitor.log
```

## ⚠️ 注意事项

1. **首次使用前**必须配置飞书 Webhook
2. **测试通知**确保配置正确
3. **定期检查**日志文件确保正常运行
4. **服务器恢复后**会自动获取积压数据并生成报告

## 🛠️ 故障排查

见 `feishu-notification-setup.md` 第 7 节

---

**版本**: 1.0.0  
**创建时间**: 2026-03-09  
**维护**: ClawHub 监控系统
