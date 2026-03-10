# SkillPay 自动营销系统 - 快速开始指南

## 🚀 5 分钟快速部署

### 步骤 1: 配置系统 (2 分钟)

```bash
# 进入工作目录
cd /Users/admin/.openclaw/workspace

# 复制配置模板
cp config.example.json config.json

# 编辑配置，填入你的 API 密钥
vim config.json
```

**必填配置:**
- `skillpay.api_key` - SkillPay API 密钥
- `platforms.twitter.api_key` - Twitter API 密钥 (可选)
- `platforms.xiaohongshu.api_key` - 小红书 API 密钥 (可选)
- `platforms.zhihu.api_key` - 知乎 API 密钥 (可选)

### 步骤 2: 生成营销文案 (1 分钟)

```bash
# 为 Skill-001 生成文案
python marketing-copy-generator.py --skill skill-001 --platforms all --variants 3

# 查看生成的文案
ls -la generated_copies/
```

**输出:** `generated_copies/copies_YYYYMMDD_HHMMSS.json`

### 步骤 3: 安装发布调度 (1 分钟)

```bash
# 安装定时任务
./auto-post-scheduler.sh --install

# 查看状态
./auto-post-scheduler.sh --status
```

**发布时间:** 每天 09:00, 14:00, 20:00 (各平台)

### 步骤 4: 启动转化追踪 (1 分钟)

```bash
# 生成今日报告
python conversion-tracker.py --report daily

# 实时监控 (可选)
python conversion-tracker.py --live
```

---

## 📋 日常使用

### 生成新文案
```bash
# 为新 Skill 生成文案
python marketing-copy-generator.py --skill skill-002 --platforms twitter xiaohongshu --variants 5
```

### 手动发布
```bash
# 测试发布
./auto-post-scheduler.sh --test --platform twitter

# 立即执行发布
./auto-post-scheduler.sh --run
```

### 查看数据
```bash
# 今日报告
python conversion-tracker.py --report daily

# 周报
python conversion-tracker.py --report weekly

# 导出数据
python conversion-tracker.py --export csv
```

---

## 🔧 常见问题

### Q1: 文案生成失败？
**A:** 检查 Skill ID 是否正确，确保 `config.json` 存在

### Q2: 发布失败？
**A:** 
- 检查平台 API 密钥是否正确
- 查看日志：`logs/post_scheduler_YYYYMMDD.log`
- 确认网络连接正常

### Q3: 转化数据为 0？
**A:** 
- 确保已生成文案并发布
- 检查追踪代码是否正确集成
- 等待数据积累 (至少 24 小时)

### Q4: 如何调整发布时间？
**A:** 编辑 `config.json` 中的 `post_times` 数组，然后重新安装:
```bash
./auto-post-scheduler.sh --uninstall
./auto-post-scheduler.sh --install
```

---

## 📊 关键指标目标

| 指标 | 及格线 | 良好 | 优秀 |
|------|--------|------|------|
| 点击率 (CTR) | > 1% | > 3% | > 5% |
| 转化率 (CVR) | > 0.5% | > 1% | > 3% |
| 投资回报率 (ROI) | > 100% | > 200% | > 300% |

---

## 🎯 优化建议

### 第 1 周：数据积累
- ✅ 每日生成新文案
- ✅ 按时发布
- ✅ 记录转化数据

### 第 2 周：分析优化
- 📈 分析高转化文案特点
- 🎨 复制成功模式
- ❌ 淘汰低效文案

### 第 3 周：规模化
- 🚀 增加发布频率
- 📱 拓展新平台
- 💰 优化投放策略

---

## 📁 文件结构

```
/Users/admin/.openclaw/workspace/
├── auto-marketing-system.md      # 系统文档
├── marketing-copy-generator.py   # 文案生成器
├── auto-post-scheduler.sh        # 发布调度器
├── conversion-tracker.py         # 转化追踪器
├── config.json                   # 配置文件
├── config.example.json           # 配置模板
├── generated_copies/             # 生成的文案
│   └── copies_YYYYMMDD_HHMMSS.json
├── logs/                         # 日志目录
│   └── post_scheduler_YYYYMMDD.log
├── conversion_data/              # 转化数据
│   └── events.jsonl
└── reports/                      # 报告目录
    └── report_daily_YYYYMMDD_HHMMSS.json
```

---

## 🔐 安全提示

1. **API 密钥**: 不要提交到 Git
2. **数据备份**: 定期备份 `conversion_data/` 和 `reports/`
3. **日志清理**: 定期清理 90 天前的日志

---

## 📞 技术支持

遇到问题？查看完整文档：`auto-marketing-system.md`

---

*快速开始指南 v1.0 | 最后更新：2026-03-09*
