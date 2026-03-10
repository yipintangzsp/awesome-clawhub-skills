# 飞书通知配置指南

## 1. 创建飞书机器人

### 步骤 1: 在飞书群中添加机器人
1. 打开飞书，进入要接收通知的群聊
2. 点击右上角设置图标 ⚙️
3. 选择「添加机器人」
4. 点击「自定义机器人」
5. 输入机器人名称：`ClawHub 监控助手`
6. 点击「添加」

### 步骤 2: 获取 Webhook URL
1. 添加成功后，复制 Webhook 地址
2. 格式：`https://open.feishu.cn/open-apis/bot/v2/hook/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`

### 步骤 3: 配置安全设置（推荐）
在机器人设置中，选择以下一种安全验证方式：
- **签名验证**（推荐）：需要配置加签密钥
- **IP 白名单**：添加服务器 IP 地址
- **关键词**：添加关键词如 "ClawHub"、"服务器"、"收入"

## 2. 更新配置文件

编辑 `status-config.json`，将 Webhook URL 替换为你的实际地址：

```json
{
  "notifications": {
    "feishu": {
      "enabled": true,
      "webhookUrl": "https://open.feishu.cn/open-apis/bot/v2/hook/YOUR_ACTUAL_TOKEN_HERE"
    }
  }
}
```

## 3. 测试通知

运行以下命令测试通知是否正常：

```bash
cd /Users/admin/.openclaw/workspace/clawhub-monitor

# 测试脚本
./clawhub-status-monitor.sh --check
```

## 4. 设置定时任务（可选）

### 方式 1: 使用 crontab
```bash
# 编辑 crontab
crontab -e

# 添加每小时执行的任务
0 * * * * /Users/admin/.openclaw/workspace/clawhub-monitor/clawhub-status-monitor.sh --check >> /Users/admin/.openclaw/workspace/clawhub-monitor/cron.log 2>&1
```

### 方式 2: 使用 launchd (macOS)
创建文件 `~/Library/LaunchAgents/com.clawhub.monitor.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.clawhub.monitor</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/admin/.openclaw/workspace/clawhub-monitor/clawhub-status-monitor.sh</string>
        <string>--check</string>
    </array>
    <key>StartInterval</key>
    <integer>3600</integer>
    <key>StandardOutPath</key>
    <string>/Users/admin/.openclaw/workspace/clawhub-monitor/launchd.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/admin/.openclaw/workspace/clawhub-monitor/launchd.log</string>
</dict>
</plist>
```

加载任务：
```bash
launchctl load ~/Library/LaunchAgents/com.clawhub.monitor.plist
```

## 5. 通知类型

监控脚本会发送以下类型的通知：

### 🟢 服务器恢复通知
- 触发条件：服务器从离线状态恢复
- 内容：恢复时间、停机时长、积压数据条数

### 🔴 服务器故障通知
- 触发条件：服务器检查失败
- 内容：检测时间、错误信息、重试次数

### 💰 收入补报通知
- 触发条件：服务器恢复后自动触发
- 内容：统计周期、补报收入、数据条数、报表文件路径

## 6. 故障排查

### 通知未发送
1. 检查 `status-config.json` 中 `enabled` 是否为 `true`
2. 检查 Webhook URL 是否正确
3. 查看日志文件 `monitor.log`

### 通知发送失败
1. 检查网络连接
2. 检查飞书机器人安全设置（签名/IP/关键词）
3. 查看日志中的 HTTP 状态码

### 查看日志
```bash
# 实时查看日志
tail -f /Users/admin/.openclaw/workspace/clawhub-monitor/monitor.log

# 查看最近 50 行
tail -n 50 /Users/admin/.openclaw/workspace/clawhub-monitor/monitor.log
```

## 7. 文件结构

```
clawhub-monitor/
├── clawhub-status-monitor.sh    # 主监控脚本
├── status-config.json           # 配置文件
├── monitor-state.json           # 运行状态（自动生成）
├── monitor.log                  # 日志文件（自动生成）
├── revenue-reports/             # 收入报告目录（自动生成）
│   └── revenue-report-*.md
└── feishu-notification-setup.md # 本文件
```

---

**提示**：首次使用前，请务必完成飞书机器人配置并测试通知功能！
