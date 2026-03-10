# 📊 Revenue Monitor Pro - SkillPay 收入监控系统

_专业版自动化收入监控和告警系统_

---

## 🚀 快速开始

### 一键安装

```bash
cd ~/.openclaw/workspace
./scripts/install-revenue-monitor.sh
```

### 手动安装

1. **配置告警设置**
   ```bash
   # 编辑配置文件
   vim scripts/revenue-alert-config.json
   ```

2. **安装定时任务**
   ```bash
   crontab scripts/revenue-monitor.crontab
   ```

3. **验证安装**
   ```bash
   crontab -l | grep revenue-monitor
   ```

---

## 📋 功能清单

### ✅ 核心功能

| 功能 | 说明 | 执行频率 |
|------|------|----------|
| **收入检查** | 自动检查 ClawHub 收入数据 | 每小时 |
| **异常告警** | 收入波动 >30% 触发告警 | 实时检测 |
| **日报生成** | 自动生成每日收入报告 | 每天 20:00 |
| **周报生成** | 周度趋势分析和建议 | 每周日 21:00 |
| **月报生成** | 月度汇总和目标追踪 | 每月 1 号 9:00 |
| **Skill 排名** | 各 Skill 收入排名和趋势 | 每次检查 |
| **优化建议** | 涨价/下架/推广建议 | 自动生成 |
| **通知推送** | 飞书/邮件自动推送报告 | 报告生成后 |

---

## 📁 文件结构

```
/Users/admin/.openclaw/workspace/
├── scripts/
│   ├── revenue-monitor-pro.sh      # 主监控脚本
│   ├── revenue-alert-config.json   # 告警配置
│   ├── revenue-monitor.crontab     # 定时任务配置
│   └── install-revenue-monitor.sh  # 安装脚本
├── data/revenue/
│   ├── revenue_history.json        # 历史收入数据
│   ├── revenue_today.json          # 今日收入数据
│   └── skill_stats.json            # Skill 统计数据
├── reports/
│   ├── revenue-report-template.md  # 报告模板
│   ├── daily-revenue-YYYY-MM-DD.md # 每日报告
│   ├── weekly-revenue-YYYY-MM-DD.md# 每周报告
│   └── monthly-revenue-YYYY-MM.md  # 每月报告
└── logs/
    └── skillpay-revenue-monitor.log # 运行日志
```

---

## ⚙️ 配置说明

### revenue-alert-config.json

```json
{
  "alert_threshold": 30,           // 告警阈值（收入波动百分比）
  "alert_email": "your@email.com", // 告警邮箱
  "feishu_webhook": "https://...", // 飞书 webhook URL
  "check_interval_minutes": 60,    // 检查间隔（分钟）
  
  "thresholds": {
    "income_drop_warning": -30,    // 收入下降警告阈值
    "income_drop_critical": -50,   // 收入下降严重阈值
    "income_spike_warning": 50,    // 收入激增警告阈值
    "income_spike_critical": 100   // 收入激增严重阈值
  },
  
  "targets": {
    "daily_income": 200,           // 日收入目标
    "monthly_income": 5000,        // 月收入目标
    "daily_downloads": 50,         // 日下载目标
    "monthly_downloads": 1000      // 月下载目标
  }
}
```

### 获取飞书 Webhook

1. 在飞书群聊中添加「自定义机器人」
2. 复制 webhook URL
3. 粘贴到 `revenue-alert-config.json` 的 `feishu_webhook` 字段

---

## 📊 报告示例

### 每日收入报告

```markdown
# 📊 SkillPay 每日收入报告

**日期：** 2026-03-09
**生成时间：** 2026-03-09 20:00:00

## 💰 今日收入概览

| 指标 | 数值 | 环比 |
|------|------|------|
| **总收入** | ¥262 | +15.3% |
| **总下载** | 55 次 | +8.2% |
| **平均单价** | ¥4.76 | - |

## 🏆 Skill 收入 TOP 榜

| 排名 | Skill | 下载 | 收入 | 状态 |
|------|-------|------|------|------|
| 1 | 🎯 爆款标题魔法师 | 12 | ¥36 | 🔥 热门 |
| 2 | 🔍 新币保命扫描器 | 10 | ¥50 | 💰 高价值 |
| 3 | 🪂 空投资格检测 | 8 | ¥40 | 📈 稳定 |

## 💡 优化建议

**建议涨价：**
- 空投资格检测：当前¥8，建议¥12（+50%）
- 新币保命扫描器：当前¥9，建议¥15（+67%）

**建议优化：**
- NFT 地板价监控：下载少，考虑下架
```

---

## 🚨 告警示例

### 飞书消息

```
⚠️ 收入异常波动告警

当前收入：¥380
上次收入：¥262
变化幅度：+45.0%
阈值：30%

📊 详细报告：reports/daily-revenue-2026-03-09.md
```

### 邮件主题

```
[SkillPay 告警] 收入异常波动 +45.0% - 2026-03-09
```

---

## 🔧 命令行使用

### 手动检查收入

```bash
./scripts/revenue-monitor-pro.sh check
```

### 生成日报

```bash
./scripts/revenue-monitor-pro.sh daily
```

### 生成周报

```bash
./scripts/revenue-monitor-pro.sh weekly
```

### 仅检查告警

```bash
./scripts/revenue-monitor-pro.sh alert
```

### 查看日志

```bash
tail -f ~/Library/Logs/skillpay-revenue-monitor.log
```

---

## 📈 数据管理

### 查看历史数据

```bash
# 最近 7 天收入
cat data/revenue/revenue_history.json | jq '.records[-7:]'

# 今日数据
cat data/revenue/revenue_today.json
```

### 导出数据

```bash
# 导出为 CSV
python3 -c "
import json
with open('data/revenue/revenue_history.json') as f:
    data = json.load(f)
print('date,income,downloads')
for r in data['records']:
    print(f\"{r['date']},{r['income']},{r['downloads']}\")
" > revenue_export.csv
```

### 清理旧数据

```bash
# 清理 90 天前的数据
./scripts/revenue-monitor-pro.sh cleanup
```

---

## 🎯 优化建议规则

### 自动涨价条件

当 Skill 满足以下条件时，系统会建议涨价：
- 日下载量 > 10 次
- 日收入 > ¥50
- 建议涨幅：30-50%

### 自动下架条件

当 Skill 满足以下条件时，系统会建议下架：
- 周下载量 < 5 次
- 周收入 < ¥20
- 连续 7 天无增长

### 热门推荐条件

当 Skill 满足以下条件时，标记为「热门」：
- 日下载量 > 20 次
- 日收入 > ¥100
- 持续增长趋势

---

## 🐛 故障排查

### clawhub CLI 无法使用

```bash
# 检查 clawhub 是否安装
which clawhub

# 测试 clawhub 命令
clawhub earnings --today

# 重新登录
clawhub login
```

### 定时任务未执行

```bash
# 检查 crontab
crontab -l | grep revenue-monitor

# 检查 cron 服务
sudo launchctl list | grep cron

# 查看日志
tail -f ~/Library/Logs/skillpay-revenue-monitor.log
```

### 飞书通知未发送

```bash
# 测试 webhook
curl -X POST "YOUR_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"msg_type":"text","content":{"text":"测试"}}'
```

---

## 📝 更新日志

### v1.0.0 (2026-03-09)
- ✅ 初始版本发布
- ✅ 每小时收入检查
- ✅ 异常波动告警（>30%）
- ✅ 日报/周报/月报自动生成
- ✅ Skill 收入排名和趋势分析
- ✅ 自动优化建议
- ✅ 飞书/邮件通知推送

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License

---

*让数据驱动决策，坐等收钱！💰 🐾*
