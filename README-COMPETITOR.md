# ClawHub 竞争情报监控系统

自动监控 ClawHub 热门 Skill，分析市场机会，生成差异化建议。

## 🎯 功能

1. **自动监控** - 定时抓取 ClawHub 热门技能数据
2. **竞品分析** - 分析定价策略、下载量分布、类别竞争
3. **机会发现** - 识别市场空白和高潜力领域
4. **差异化建议** - 生成针对性的产品策略
5. **Skill 脚手架** - 自动创建对标 Skill 开发模板

## 📁 文件结构

```
workspace/
├── competitor-monitor.sh      # 主监控脚本
├── market-analyzer.py         # 市场分析工具
├── opportunity-finder.py      # 机会发现工具
├── competitor-crontab.txt     # Crontab 配置
├── setup-competitor-monitor.sh # 安装脚本
├── README-COMPETITOR.md       # 本文档
└── competitor-data/           # 数据目录（自动生成）
    ├── skills_downloads_*.json
    ├── market_analysis_*.md
    ├── differentiation_strategy_*.md
    └── skill-scaffold-*/
```

## 🚀 快速开始

### 1. 安装

```bash
cd /Users/admin/.openclaw/workspace
chmod +x setup-competitor-monitor.sh
./setup-competitor-monitor.sh
```

### 2. 手动运行

```bash
# 执行一次完整监控
./competitor-monitor.sh

# 单独运行市场分析
python3 market-analyzer.py ./competitor-data $(date +%Y-%m-%d_%H-%M-%S)

# 单独运行机会发现
python3 opportunity-finder.py ./competitor-data $(date +%Y-%m-%d_%H-%M-%S)
```

### 3. 查看报告

```bash
# 最新市场分析报告
cat competitor-data/market_analysis_*.md | head -100

# 最新差异化策略
cat competitor-data/differentiation_strategy_*.md

# 查看生成的 Skill 脚手架
ls -la competitor-data/skill-scaffold-*/
```

## 📊 输出说明

### competitor-monitor.sh
- 抓取 ClawHub 热门技能（按下载量、安装量、评分、趋势排序）
- 搜索特定类别技能
- 保存原始 JSON 数据

### market-analyzer.py
- **类别分布** - 各类型技能数量和占比
- **定价分析** - 免费/付费/订阅制分布
- **下载量分布** - 热门程度分层
- **Top 热门技能** - 表现最好的竞品

### opportunity-finder.py
- **市场空白** - 竞争少、潜力高的领域
- **Skill 模板** - 可直接开发的技能方案
- **差异化策略** - 针对每个模板的竞争策略
- **脚手架代码** - SKILL.md 和 README.md 模板

## ⏰ 定时任务

系统默认配置以下定时任务（安装时可选）：

| 时间 | 任务 | 说明 |
|------|------|------|
| 每天 9:00 | 完整监控 | 抓取最新数据 |
| 每周一 10:00 | 市场分析 | 生成周报 |
| 每周三 15:00 | 机会发现 | 发现新机会 |
| 每天 2:00 | 数据清理 | 删除 30 天前数据 |

查看定时任务：
```bash
crontab -l
```

修改定时任务：
```bash
crontab -e
```

## 🔧 配置选项

### 修改监控频率
编辑 `competitor-crontab.txt`，调整 cron 表达式。

### 修改数据目录
在脚本开头修改 `DATA_DIR` 变量。

### 添加新类别
在 `market-analyzer.py` 和 `opportunity-finder.py` 中修改 `category_keywords`。

### 自定义 Skill 模板
在 `opportunity-finder.py` 的 `generate_skill_templates()` 方法中修改。

## ⚠️ 注意事项

1. **API 速率限制**
   - ClawHub API 有速率限制
   - 脚本会自动重试（最多 3 次）
   - 建议不要频繁手动运行

2. **数据质量**
   - 首次运行可能数据较少
   - 建议运行 1-2 周后分析趋势
   - 定期查看数据完整性

3. **存储空间**
   - 每天约产生 1-5MB 数据
   - 自动清理 30 天前数据
   - 定期检查 `competitor-data/` 大小

4. **隐私和安全**
   - 所有数据本地存储
   - 不上传任何信息
   - 可放心使用

## 📈 使用案例

### 案例 1: 发现新机会
```bash
# 运行机会发现
python3 opportunity-finder.py ./competitor-data $(date +%Y-%m-%d_%H-%M-%S)

# 查看报告
cat competitor-data/differentiation_strategy_*.md

# 选择高分数领域，使用生成的脚手架开始开发
```

### 案例 2: 竞品定价分析
```bash
# 运行市场分析
python3 market-analyzer.py ./competitor-data $(date +%Y-%m-%d_%H-%M-%S)

# 查看定价分布
cat competitor-data/market_analysis_*.md | grep -A 20 "定价分布"

# 根据分析调整自己的定价策略
```

### 案例 3: 监控趋势变化
```bash
# 对比不同时期的数据
ls -la competitor-data/skills_*.json

# 查看下载量变化趋势
# （需要手动对比或添加趋势分析脚本）
```

## 🛠️ 故障排除

### 问题：速率限制错误
```
✖ Rate limit exceeded
```
**解决**: 等待 60 秒后自动重试，或减少并发请求。

### 问题：Python 脚本报错
```
ModuleNotFoundError: No module named 'xxx'
```
**解决**: 脚本只使用标准库，检查 Python 版本是否为 3.6+。

### 问题：crontab 不执行
**解决**:
```bash
# 检查 cron 服务
sudo systemctl status cron  # Linux
log show --predicate 'process == "cron"' --last 1h  # macOS

# 检查脚本权限
chmod +x competitor-monitor.sh

# 检查 PATH 变量
crontab -e  # 确保 PATH 包含 clawhub 路径
```

### 问题：数据目录为空
**解决**: 手动运行一次监控脚本，检查是否有错误输出。

## 📝 版本历史

- **v1.0** (2026-03-09) - 初始版本
  - 基础监控功能
  - 市场分析报告
  - 机会发现引擎
  - Skill 脚手架生成

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 改进本系统。

## 📄 许可证

MIT License

---

*由 ClawHub 竞争情报监控系统生成*
*最后更新：2026-03-09*
