# SkillPay 收入优化自动化脚本

## 📖 功能说明

每小时自动检查 SkillPay 收入数据，发现爆款 Skill 后自动生成推广内容并分发到各大平台。

### 核心功能
1. ✅ 自动读取 `revenue-today.md` 收入数据
2. ✅ 分析下载量 TOP3 的 Skill
3. ✅ 为每个爆款 Skill 生成：
   - 🐦 Twitter 推文（短小精悍，带话题标签）
   - 📖 知乎想法（深度思考，建立专业形象）
   - 📕 小红书笔记（种草风格，吸引女性用户）
4. ✅ 智能发布：
   - 配置了 API → 自动发布
   - 未配置 API → 保存到 `pending-posts/` 文件夹
5. ✅ 完整日志记录

---

## 🚀 快速开始

### 1. 安装依赖

```bash
# 确保 openclaw 已安装
openclaw --version

# 可选：安装 Twitter CLI（用于自动发推）
npm install -g twurl
twurl authorize --consumer-key YOUR_KEY --consumer-secret YOUR_SECRET
```

### 2. 配置 API（可选）

```bash
# 复制配置模板
cp ~/.openclaw/workspace/config/skillpay-promo-config.example.json \
   ~/.openclaw/workspace/config/skillpay-promo-config.json

# 编辑配置文件，填入真实 API 密钥
vim ~/.openclaw/workspace/config/skillpay-promo-config.json
```

**配置说明：**
- `twitter_api_key` - Twitter API Key
- `twitter_api_secret` - Twitter API Secret
- `zhihu_token` - 知乎访问令牌
- 如不配置 API，推广内容会保存到 `pending-posts/` 文件夹手动发布

### 3. 手动测试

```bash
# 运行一次脚本
~/.openclaw/workspace/scripts/skillpay-auto-optimize.sh

# 查看日志
tail -f ~/Library/Logs/skillpay-auto-optimize.log

# 查看生成的推广内容
ls -la ~/.openclaw/workspace/pending-posts/
```

### 4. 设置定时任务（每小时执行）

```bash
# 编辑 crontab
crontab -e

# 添加以下行（每小时整点执行）
0 * * * * ~/.openclaw/workspace/scripts/skillpay-auto-optimize.sh >> ~/Library/Logs/skillpay-auto-optimize-cron.log 2>&1
```

**其他时间选项：**
```bash
# 每 30 分钟执行
*/30 * * * * ~/.openclaw/workspace/scripts/skillpay-auto-optimize.sh

# 每天 9:00-22:00 每小时执行
0 9-22 * * * ~/.openclaw/workspace/scripts/skillpay-auto-optimize.sh

# 工作日每小时执行
0 * * * 1-5 ~/.openclaw/workspace/scripts/skillpay-auto-optimize.sh
```

---

## 📁 文件结构

```
~/.openclaw/workspace/
├── scripts/
│   ├── skillpay-auto-optimize.sh      # 主脚本
│   └── README-skillpay-auto-optimize.md # 使用说明
├── config/
│   └── skillpay-promo-config.json     # API 配置文件
├── pending-posts/                      # 待发布内容（自动生成）
│   ├── twitter_新币保命扫描器_20260309_120000.md
│   ├── zhihu_新币保命扫描器_20260309_120000.md
│   └── xiaohongshu_新币保命扫描器_20260309_120000.md
├── revenue-today.md                    # 今日收入数据（脚本读取此文件）
└── logs/
    └── skillpay-auto-optimize.log      # 运行日志
```

---

## 📊 输出示例

### Twitter 推文
```
🔥 爆款预警！新币保命扫描器 今日下载 10 次，收入 ¥50！

AI 工具让被动收入变得简单，你也行！

#SkillPay #AI 工具 #被动收入 #副业
```

### 知乎想法
```
做 AI 工具 3 个月，说点真实的感受：

今天 新币保命扫描器 数据不错，10 次下载，¥50 收入。

不算多，但验证了一个道理：
**解决真实问题的工具，用户愿意付费。**
...
```

### 小红书笔记
```
🔥AI 工具变现｜新币保命扫描器 单日下载 10 次！

姐妹们！我的 AI 工具终于开始赚钱了！💰

📊 今日数据：
- 下载：10 次
- 收入：¥50
...
```

---

## ⚙️ 自定义推广文案

编辑脚本中的以下函数：

```bash
# Twitter 推文模板（约 80-120 字）
generate_twitter_post() { ... }

# 知乎想法（约 200-400 字）
generate_zhihu_post() { ... }

# 小红书笔记（约 300-500 字，带 emoji）
generate_xiaohongshu_post() { ... }
```

---

## 🐛 故障排查

### 问题：脚本无法执行
```bash
# 检查执行权限
chmod +x ~/.openclaw/workspace/scripts/skillpay-auto-optimize.sh

# 检查 bash 路径
which bash
```

### 问题：无法解析收入数据
```bash
# 检查 revenue-today.md 格式
cat ~/.openclaw/workspace/revenue-today.md

# 确保表格格式正确：
# | Skill 名称 | 下载 | 收入 |
# |---|---|---|
# | 技能名 | 10 | ¥50 |
```

### 问题：API 发布失败
```bash
# 检查配置文件
cat ~/.openclaw/workspace/config/skillpay-promo-config.json

# 检查 API 密钥是否有效
# 查看日志详情
tail -100 ~/Library/Logs/skillpay-auto-optimize.log
```

---

## 📈 最佳实践

1. **定期检查待发布内容**
   ```bash
   # 每天查看 pending-posts 文件夹
   ls -lh ~/.openclaw/workspace/pending-posts/
   ```

2. **监控收入变化**
   ```bash
   # 查看今日收入
   cat ~/.openclaw/workspace/revenue-today.md
   
   # 对比历史数据
   ls -la ~/.openclaw/workspace/reports/
   ```

3. **优化推广策略**
   - 根据互动率调整文案风格
   - A/B 测试不同发布时间
   - 追踪各平台转化率

4. **保持更新**
   ```bash
   # 每周检查脚本更新
   git pull origin main  # 如果有版本控制
   ```

---

## 🎯 预期效果

| 指标 | 目标 | 当前 |
|------|------|------|
| 每小时检查 | ✅ 自动 | - |
| 爆款识别 | TOP3 下载 | - |
| 推广内容生成 | 3 平台 × TOP3 = 9 条/小时 | - |
| 自动发布率 | 配置 API 后 100% | 待配置 |
| 收入提升 | +30-50% | - |

---

## 📞 支持

遇到问题？
1. 查看日志：`tail -100 ~/Library/Logs/skillpay-auto-optimize.log`
2. 检查配置：`cat ~/.openclaw/workspace/config/skillpay-promo-config.json`
3. 联系：@小爪 (Xiao Zhua) 🐾

---

*让自动化为你赚钱，你只管创造价值！💰*
