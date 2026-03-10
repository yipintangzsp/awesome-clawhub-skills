# 🚀 引流文章发布提醒系统 - 使用指南

**版本**: v1.0  
**创建时间**: 2026-03-09 14:52  
**最后更新**: 2026-03-09 14:52

---

## 📋 系统概述

本系统用于自动化管理 24 篇引流文章的发布流程，包括：

1. ✅ **文章检查** - 自动扫描待发布内容
2. ✅ **发布提醒** - 飞书/邮件定时提醒
3. ✅ **最佳时间** - 智能推荐发布时间
4. ✅ **数据追踪** - 发布后效果追踪
5. ✅ **复盘提醒** - 24 小时/7 天自动复盘

---

## 📁 文件结构

```
pending-posts/
├── README-系统使用指南.md          # 本文件
├── 发布提醒配置.md                 # 发布计划和提醒配置
├── 发布追踪表 - 完整版.csv          # 数据追踪表
├── 复盘提醒设置.md                 # 复盘模板和提醒配置
└── scripts/
    ├── publish-reminder.sh         # Bash 版本提醒脚本
    ├── auto-reminder.py            # Python 版本提醒脚本
    └── publish-cron.conf           # Cron 配置文件 (生成)
```

---

## 🎯 快速开始

### 1. 检查文章
```bash
cd pending-posts
./scripts/publish-reminder.sh check
```

输出示例:
```
📊 文章统计:
  总计：24 篇
  知乎：6 篇
  小红书：7 篇
  Twitter: 7 篇
  Reddit: 4 篇
```

### 2. 生成发布提醒
```bash
# 生成明天的发布计划
./scripts/publish-reminder.sh reminder

# 生成指定日期的发布计划
./scripts/publish-reminder.sh reminder 2026-03-10
```

### 3. 发送飞书通知
```bash
# 需要设置环境变量
export FEISHU_WEBHOOK="https://open.feishu.cn/open-apis/bot/v2/hook/xxx"

# 发送提醒
./scripts/publish-reminder.sh send "明天有 4 篇文章需要发布" "发布提醒"
```

### 4. 更新追踪表
```bash
# Python 版本
python3 scripts/auto-reminder.py update 知乎 zhihu-1.md "2026-03-09 20:00" "https://zhuanlan.zhihu.com/p/xxx"
```

### 5. 设置复盘提醒
```bash
# 设置 24 小时和 7 天复盘提醒
python3 scripts/auto-reminder.py review zhihu-1.md "2026-03-09 20:00"
```

### 6. 配置定时任务
```bash
# 生成 cron 配置
python3 scripts/auto-reminder.py cron

# 安装 cron
crontab pending-posts/scripts/publish-cron.conf
```

---

## 📅 发布计划

### 3 月 9 日 (今天)
| 时间 | 平台 | 文件 | 标题 |
|------|------|------|------|
| 20:00 | 小红书 | xiaohongshu-note.md | AI 进群聊自动回复｜打工人摸鱼神器 |
| 20:30 | Twitter | twitter-thread.md | OpenClaw 接入国内办公生态 |
| 21:00 | 知乎 | zhihu-article.md | OpenClaw 接入微信/钉钉/飞书 |
| 22:00 | Reddit | reddit-ai.md | I Monetized AI by Building 24 Micro-Skills |

### 3 月 10 日 (明天)
| 时间 | 平台 | 文件 | 标题 |
|------|------|------|------|
| 12:30 | 小红书 | xiaohongshu-1.md | 今日被动收入¥262｜24 个 AI Skill 矩阵 |
| 20:00 | 知乎 | zhihu-1.md | 24 小时被动收入¥262！AI Skill 实战 |
| 21:00 | Reddit | reddit-passiveincome.md | I Built 24 AI Skills That Generate Passive Income |

---

## 🔔 提醒配置

### 飞书机器人
1. 在飞书群添加机器人
2. 获取 Webhook URL
3. 设置环境变量:
```bash
export FEISHU_WEBHOOK="https://open.feishu.cn/open-apis/bot/v2/hook/xxx"
```

### 提醒时间
| 类型 | 时间 | 内容 |
|------|------|------|
| 每日提醒 | 19:00 | 次日发布计划 |
| 紧急提醒 | 发布前 1 小时 | 即将发布的文章 |
| 周计划 | 周一 09:00 | 本周发布计划 |
| 24h 复盘 | 发布后 24 小时 | 数据更新提醒 |
| 7d 复盘 | 发布后 7 天 | 深度复盘提醒 |
| 周报复盘 | 周一 15:00 | 周报复盘会议 |

---

## 📊 数据追踪

### 追踪指标
| 指标 | 24 小时 | 7 天 | 说明 |
|------|--------|------|------|
| 曝光量 | ✅ | ✅ | 内容被看到的次数 |
| 点赞数 | ✅ | ✅ | 用户点赞 |
| 评论数 | ✅ | ✅ | 用户评论 |
| 收藏数 | ✅ | ✅ | 用户收藏 |
| 私信数 | ✅ | ✅ | 引流私信 |
| 转化数 | ✅ | ✅ | 实际转化 (购买/注册) |
| 收入增长 | ✅ | ✅ | 带来的收入 |

### 更新频率
- **24 小时数据**: 发布后第 2 天 10:00 更新
- **7 天数据**: 发布后第 8 天 10:00 更新
- **收入数据**: 每周一更新

---

## 📋 复盘模板

### 24 小时快速复盘
```markdown
## 📊 24 小时复盘 - {文章标题}

**发布平台**: {平台}  
**发布时间**: {时间}  

### 核心数据
- 曝光量：
- 点赞数：
- 评论数：
- 收藏数：
- 私信数：
- 转化数：

### 快速判断
- [ ] 曝光量是否达标？
- [ ] 互动率是否 >1%？
- [ ] 是否有引流效果？
- [ ] 是否需要二次推广？

### 改进建议
1. 
2. 
```

### 7 天深度复盘
```markdown
## 📈 7 天深度复盘 - {文章标题}

### 数据趋势
| 时间 | 曝光 | 点赞 | 评论 | 收藏 | 私信 | 转化 |
|------|------|------|------|------|------|------|
| Day 1 | | | | | | |
| Day 2 | | | | | | |
| ... | | | | | | |
| Day 7 | | | | | | |

### 效果评估
- 曝光表现：⭐⭐⭐⭐⭐
- 互动质量：⭐⭐⭐⭐⭐
- 引流效果：⭐⭐⭐⭐⭐
- 收入贡献：¥{金额}

### 深度分析
1. 内容表现如何？为什么？
2. 哪个渠道引流最多？
3. 有什么意外发现？

### ROI 计算
- 时间成本：¥{金额}
- 收入增长：¥{金额}
- ROI = {百分比}%
```

---

## 🛠️ 故障排除

### 问题 1: 脚本无法执行
```bash
# 检查权限
ls -la scripts/

# 添加执行权限
chmod +x scripts/*.sh scripts/*.py
```

### 问题 2: 飞书通知不发送
```bash
# 检查 Webhook
echo $FEISHU_WEBHOOK

# 测试 Webhook
curl -X POST "$FEISHU_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{"msg_type": "text", "content": {"text": "test"}}'
```

### 问题 3: Cron 不执行
```bash
# 检查 cron 服务
systemctl status cron

# 查看 cron 日志
grep CRON /var/log/syslog

# 检查 cron 配置
crontab -l
```

### 问题 4: Python 脚本报错
```bash
# 检查 Python 版本
python3 --version

# 安装依赖
pip3 install requests

# 测试脚本
python3 scripts/auto-reminder.py check
```

---

## 📞 最佳实践

### 发布前
1. ✅ 最终审核内容
2. ✅ 准备配图 (小红书必须)
3. ✅ 生成引流链接 (带 UTM 参数)
4. ✅ 准备话题标签
5. ✅ 确认发布时间

### 发布后
1. ✅ 立即更新追踪表
2. ✅ 设置复盘提醒
3. ✅ 转发到社交媒体 (可选)
4. ✅ 回复早期评论
5. ✅ 监控异常数据

### 复盘时
1. ✅ 按时更新数据
2. ✅ 诚实记录结果
3. ✅ 分析成功/失败原因
4. ✅ 提炼可复制经验
5. ✅ 调整后续策略

---

## 🎯 关键指标目标

| 平台 | 曝光量 | 互动率 | 引流率 | 转化率 |
|------|--------|--------|--------|--------|
| 知乎 | 2000+ | 2-5% | 0.5% | 10% |
| 小红书 | 1000+ | 3-8% | 1% | 20% |
| Twitter | 500+ | 1-3% | 0.2% | 5% |
| Reddit | 1000+ | 2-5% | 0.3% | 8% |

---

## 📚 相关文档

- [发布提醒配置.md](./发布提醒配置.md) - 详细配置
- [发布追踪表 - 完整版.csv](./发布追踪表 - 完整版.csv) - 数据追踪
- [复盘提醒设置.md](./复盘提醒设置.md) - 复盘模板
- [README-发布指南.md](./README-发布指南.md) - 原始发布指南

---

## 💡 提示

1. **自动化优先**: 尽量使用脚本自动发送提醒
2. **数据驱动**: 根据数据调整发布策略
3. **持续优化**: 每周复盘，不断改进
4. **保持一致**: 固定时间发布和更新数据
5. **灵活调整**: 根据实际效果调整计划

---

**系统状态**: ✅ 正常运行  
**下次检查**: 2026-03-09 19:00 (飞书提醒)  
**下次复盘**: 2026-03-10 10:00 (24 小时复盘)
