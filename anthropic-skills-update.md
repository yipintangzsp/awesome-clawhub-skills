# 🚀 Anthropic Skills Creator 更新指南

**张 sir，这是官方 Skill 创建/评估工具**

---

## 📦 新增功能（本次更新）

### 1️⃣ run_eval.py - 自动评估 Skill
- 自动测试 Skill 性能
- 生成评估报告
- 对比不同版本

### 2️⃣ run_loop.py - 循环优化
- 自动迭代改进
- 基于反馈优化
- 持续学习

### 3️⃣ aggregate_benchmark.py - 基准汇总
- 汇总多个基准测试结果
- 生成对比报告
- 可视化数据

---

## 🔧 安装方法

### 方法 1：Git Clone
```bash
cd ~/.openclaw/workspace
git clone https://github.com/anthropics/skills-creator.git
cd skills-creator
pip install -r requirements.txt
```

### 方法 2：直接下载
```bash
cd ~/.openclaw/workspace
curl -LO https://github.com/anthropics/skills-creator/archive/main.zip
unzip main.zip
mv skills-creator-main skills-creator
```

---

## 📝 使用方法

### 评估 Skill
```bash
cd skills-creator
python run_eval.py --skill <skill_name> --benchmark <benchmark_name>
```

### 循环优化
```bash
python run_loop.py --skill <skill_name> --iterations 5
```

### 查看报告
```bash
python aggregate_benchmark.py --output report.html
```

---

## 💡 对我们 SkillPay 项目的价值

### 1. 自动测试 Skill 质量
- 测试 9 个已发布 Skill
- 找出表现最好的
- 优化表现差的

### 2. 持续迭代
- 根据用户反馈自动改进
- A/B 测试不同版本
- 选择最优版本发布

### 3. 数据驱动决策
- 哪个 Skill 最赚钱
- 哪个需要优化
- 哪个应该下架

---

## ⚠️ 注意事项

1. **需要 Python 环境** - 确保安装了 Python 3.8+
2. **需要 API Key** - 部分功能需要 Anthropic API
3. **耗时** - 完整评估可能需要几分钟
4. **网络** - 需要访问 GitHub 和 Anthropic API

---

## 🎯 下一步

1. **下载安装** - 获取最新代码
2. **配置环境** - 安装依赖
3. **测试评估** - 评估现有 Skill
4. **优化迭代** - 根据结果改进

---

*让 Skill 自动进化，越用越强！*
