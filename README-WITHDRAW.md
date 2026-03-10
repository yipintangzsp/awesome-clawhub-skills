# ClawHub 自动提现系统

> 监控 ClawHub 可提现金额，满¥1,000 自动申请提现

## 📦 文件说明

| 文件 | 说明 |
|------|------|
| `auto-withdraw.sh` | 主提现脚本（检查余额 + 发起提现） |
| `withdraw-config.json` | 配置文件（需填写钱包地址等） |
| `withdrawal-tracker.py` | 提现记录追踪器 |
| `withdraw-cron.example` | Cron 定时任务配置示例 |
| `withdrawal-history.json` | 提现历史记录（自动生成） |

## ⚙️ 快速开始

### 1️⃣ 绑定收款账户（必须先完成！）

访问 ClawHub 设置页面绑定收款钱包：
```
https://clawhub.ai/settings/payout
```

**支持的收款方式：**
- 🏆 加密货币钱包（推荐）：USDT-TRC20 / USDT-ERC20 / BTC / ETH
- 支付宝
- 微信支付
- 银行转账

### 2️⃣ 配置提现参数

编辑 `withdraw-config.json`：

```json
{
  "withdraw_threshold": 1000,      // 提现阈值（默认¥1,000）
  "wallet_address": "你的钱包地址",  // 必填
  "wallet_type": "crypto",         // crypto/alipay/wechat/bank
  "crypto_network": "USDT-TRC20",  // 加密货币网络
  "clawhub_token": "",             // API Token（如有）
  "notify_channel": ""             // 通知渠道（飞书/Telegram ID）
}
```

### 3️⃣ 初始化追踪器

```bash
cd /Users/admin/.openclaw/workspace
python3 withdrawal-tracker.py --init
```

### 4️⃣ 测试提现脚本

```bash
# 仅检查余额（不实际提现）
./auto-withdraw.sh --check-only

# 强制提现（无论余额多少）
./auto-withdraw.sh --force
```

### 5️⃣ 设置定时任务（可选）

```bash
# 编辑 cron 配置
vi withdraw-cron.example

# 安装 cron
crontab withdraw-cron.example

# 验证
crontab -l
```

## 📊 常用命令

### 查看提现记录
```bash
python3 withdrawal-tracker.py --list
python3 withdrawal-tracker.py --list --limit 20
```

### 检查提现状态
```bash
python3 withdrawal-tracker.py --check-status
```

### 生成报告
```bash
# 过去 30 天报告
python3 withdrawal-tracker.py --report

# 过去 7 天报告
python3 withdrawal-tracker.py --report --days 7
```

### 手动记录提现
```bash
python3 withdrawal-tracker.py --record \
  --id WD20260309170000 \
  --amount 1500 \
  --wallet "TxxxxxxxxxxxxxxxxxxxxxxxxxxxxB" \
  --status pending
```

### 更新提现状态
```bash
python3 withdrawal-tracker.py --update-status \
  --id WD20260309170000 \
  --status completed
```

## 🔔 通知配置

### 飞书通知
在 `withdraw-config.json` 中设置：
```json
{
  "notify_channel": "你的飞书群聊 ID 或用户 ID"
}
```

### 系统通知
脚本会自动发送 macOS 系统通知（如果可用）。

## 📝 日志查看

```bash
# 实时查看日志
tail -f withdraw.log

# 查看最近 50 行
tail -50 withdraw.log
```

## ⚠️ 注意事项

1. **必须先绑定收款账户**：在 ClawHub 网站完成钱包绑定后才能提现
2. **提现阈值**：默认¥1,000，可根据需要调整
3. **API 限制**：如 ClawHub 提供 API Token，请填写以启用自动提现
4. **安全**：配置文件包含敏感信息，请勿上传到公开仓库

## 🛠️ 故障排查

### 问题：余额显示为 0
- 检查是否已登录 ClawHub：`clawhub whoami`
- 检查网络连接
- 查看日志：`tail withdraw.log`

### 问题：提现失败
- 确认钱包地址正确
- 确认已在 ClawHub 绑定该钱包
- 检查 ClawHub 是否有最低提现限制

### 问题：通知不发送
- 检查 `notify_channel` 是否填写正确
- 确认飞书/Telegram 权限

## 📞 支持

遇到问题？检查以下内容：
1. 日志文件：`withdraw.log`
2. 配置文件：`withdraw-config.json`
3. 提现历史：`withdrawal-history.json`

---

**版本**: 1.0.0  
**最后更新**: 2026-03-09
