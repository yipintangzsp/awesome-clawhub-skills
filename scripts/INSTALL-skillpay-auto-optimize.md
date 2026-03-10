# 🚀 SkillPay 收入优化自动化 - 安装指南

## ✅ 已创建文件

| 文件 | 说明 |
|------|------|
| `skillpay-auto-optimize.sh` | 主脚本（可执行） |
| `README-skillpay-auto-optimize.md` | 详细使用说明 |
| `skillpay-auto-optimize.crontab` | Crontab 配置模板 |
| `../config/skillpay-promo-config.example.json` | API 配置模板 |

---

## ⚡ 5 分钟快速安装

### 步骤 1：测试脚本（必做）

```bash
# 运行一次测试
~/.openclaw/workspace/scripts/skillpay-auto-optimize.sh

# 查看生成的推广内容
ls -lh ~/.openclaw/workspace/pending-posts/

# 查看日志
tail -20 ~/Library/Logs/skillpay-auto-optimize.log
```

### 步骤 2：配置 API（可选）

如需自动发布到 Twitter/知乎，配置 API 密钥：

```bash
# 复制配置模板
cp ~/.openclaw/workspace/config/skillpay-promo-config.example.json \
   ~/.openclaw/workspace/config/skillpay-promo-config.json

# 编辑配置文件
vim ~/.openclaw/workspace/config/skillpay-promo-config.json
```

**不配置 API 也可以**：推广内容会保存到 `pending-posts/` 文件夹，手动复制粘贴发布。

### 步骤 3：设置定时任务

```bash
# 安装 crontab（每小时执行）
crontab ~/.openclaw/workspace/scripts/skillpay-auto-optimize.crontab

# 验证已安装
crontab -l

# 查看 cron 日志（可选）
tail -f ~/Library/Logs/skillpay-auto-optimize-cron.log
```

---

## 📊 脚本功能

### 自动执行流程

```
每小时整点
    ↓
读取 revenue-today.md
    ↓
分析 TOP3 下载 Skill
    ↓
为每个 Skill 生成：
  - Twitter 推文
  - 知乎想法
  - 小红书笔记
    ↓
检查 API 配置
    ↓
有 API → 自动发布
无 API → 保存到 pending-posts/
    ↓
记录日志
```

### 生成的推广内容示例

**Twitter**（短小精悍）：
```
🔥 爆款预警！爆款标题魔法师 今日下载 12 次，收入 ¥36！

AI 工具让被动收入变得简单，你也行！

#SkillPay #AI 工具 #被动收入 #副业
```

**知乎**（深度思考）：
```
做 AI 工具 3 个月，说点真实的感受：

今天 爆款标题魔法师 数据不错，12 次下载，¥36 收入。

不算多，但验证了一个道理：
**解决真实问题的工具，用户愿意付费。**
...
```

**小红书**（种草风格）：
```
🔥AI 工具变现｜爆款标题魔法师 单日下载 12 次！

姐妹们！我的 AI 工具终于开始赚钱了！💰
...
```

---

## 🔧 自定义配置

### 修改推广文案

编辑 `skillpay-auto-optimize.sh` 中的函数：

```bash
# Twitter 推文（约 80-120 字）
generate_twitter_post() { ... }

# 知乎想法（约 200-400 字）
generate_zhihu_post() { ... }

# 小红书笔记（约 300-500 字）
generate_xiaohongshu_post() { ... }
```

### 调整检查频率

编辑 crontab 文件：

```bash
# 每小时（默认）
0 * * * * ...

# 每 30 分钟
*/30 * * * * ...

# 每 2 小时
0 */2 * * * ...
```

---

## 📁 文件结构

```
~/.openclaw/workspace/
├── scripts/
│   ├── skillpay-auto-optimize.sh      # 主脚本 ⭐
│   ├── README-skillpay-auto-optimize.md # 详细说明
│   ├── INSTALL-skillpay-auto-optimize.md # 安装指南
│   └── skillpay-auto-optimize.crontab # Crontab 配置
├── config/
│   └── skillpay-promo-config.json     # API 配置（需手动创建）
├── pending-posts/                      # 待发布内容（自动生成）
│   ├── twitter_xxx_YYYYMMDD_HHMMSS.md
│   ├── zhihu_xxx_YYYYMMDD_HHMMSS.md
│   └── xiaohongshu_xxx_YYYYMMDD_HHMMSS.md
└── revenue-today.md                    # 今日收入数据（脚本读取）
```

---

## 🐛 常见问题

### Q: 脚本无法执行？
```bash
# 检查执行权限
chmod +x ~/.openclaw/workspace/scripts/skillpay-auto-optimize.sh

# 检查 bash
which bash
```

### Q: 无法解析收入数据？
确保 `revenue-today.md` 格式正确：
```markdown
## 💰 今日收入

| Skill | 下载 | 收入 |
|-------|------|------|
| 技能名 | 10 | ¥50 |
```

### Q: 如何查看历史日志？
```bash
# 最近 100 行
tail -100 ~/Library/Logs/skillpay-auto-optimize.log

# 搜索特定内容
grep "爆款" ~/Library/Logs/skillpay-auto-optimize.log
```

### Q: 如何停止自动执行？
```bash
# 删除 crontab
crontab -r

# 或者注释掉相关行
crontab -e
```

---

## 📈 预期效果

| 指标 | 目标 |
|------|------|
| 检查频率 | 每小时 1 次 |
| 推广内容生成 | 9 条/小时（3 平台 × TOP3） |
| 自动发布率 | 配置 API 后 100% |
| 收入提升 | +30-50%（预估） |

---

## 🎯 下一步

1. ✅ 测试脚本运行正常
2. ⬜ 配置 API 密钥（可选）
3. ⬜ 安装 crontab 定时任务
4. ⬜ 监控第一周效果
5. ⬜ 根据数据优化文案

---

*让自动化为你赚钱，你只管创造价值！💰*

**有问题？查看 `README-skillpay-auto-optimize.md` 获取详细说明。**
