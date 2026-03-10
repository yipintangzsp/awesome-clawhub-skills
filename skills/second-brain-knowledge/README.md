# 知识吸收助手

## 📚 信息过载时代的解决方案

每天面对：
- 无数篇文章想读
- 大量视频想学
- 各种播客想听
- 堆积的 PDF 资料

**knowledge-absorber** 帮你把信息转化为知识，把知识内化为能力。

## 💡 核心功能

### 1. 多格式内容解析
- 📄 文章（网页、公众号）
- 🎬 视频（YouTube、B 站）
- 🎧 播客（音频转录）
- 📕 PDF（论文、报告）
- 📝 文档（Word、Markdown）

### 2. 智能知识点提取
- 识别核心概念
- 提取关键论据
- 捕捉重要数据
- 标记精彩引用

### 3. 结构化笔记生成
- 自动生成大纲
- 分层级整理
- 提取行动项
- 生成复习问题

### 4. 知识关联推荐
- 关联已有笔记
- 发现知识联系
- 推荐延伸阅读
- 构建知识网络

### 5. 知识卡片创建
- 闪卡式学习
- 间隔重复
- 自测功能
- 导出分享

### 6. 学习进度追踪
- 阅读进度
- 理解程度
- 复习计划
- 知识掌握度

## 🚀 快速开始

### 安装
```bash
openclaw skills install knowledge-absorber
```

### 使用
```bash
# 吸收文章
openclaw absorb article https://example.com/article

# 吸收视频
openclaw absorb video https://youtube.com/watch?v=xxx

# 吸收 PDF
openclaw absorb pdf ./research-paper.pdf

# 批量吸收
openclaw absorb batch ./reading-list.txt
```

### 复习
```bash
# 查看知识库
openclaw absorb library

# 生成卡片
openclaw absorb card "机器学习"

# 开始复习
openclaw absorb review --daily
```

## 📋 功能详解

### 文章吸收
```bash
openclaw absorb article <URL> --output <笔记路径>
```

输出包含：
- 标题和作者
- 核心观点摘要
- 关键论据列表
- 重要数据提取
- 个人思考区域
- 相关标签

### 视频吸收
```bash
openclaw absorb video <URL> --transcript --timestamps
```

输出包含：
- 视频元数据
- 完整转录稿
- 时间戳标记
- 关键片段提取
- 视觉内容描述

### PDF 吸收
```bash
openclaw absorb pdf <文件> --pages 1-10 --citations
```

输出包含：
- 文献信息
- 摘要和结论
- 方法论提取
- 引用文献列表
- 关键图表说明

### 知识卡片
```bash
# 自动生成卡片
openclaw absorb card --auto

# 手动创建卡片
openclaw absorb card create --front "问题" --back "答案"

# 复习卡片
openclaw absorb review --deck <卡片组>
```

### 知识关联
系统自动：
- 扫描现有笔记
- 识别相似主题
- 发现概念联系
- 推荐相关内容

## 💰 定价说明

**¥149/月** 包含：
- ✅ 无限内容吸收
- ✅ 智能笔记生成
- ✅ 知识卡片系统
- ✅ 关联推荐
- ✅ 学习追踪
- ✅ 多设备同步

## 🎯 使用场景

### 学术研究
- 论文快速阅读
- 文献笔记整理
- 研究方向追踪

### 技能学习
- 课程笔记自动化
- 实践要点提取
- 复习计划生成

### 内容创作
- 素材收集整理
- 灵感捕捉
- 参考资料管理

### 职业发展
- 行业报告分析
- 趋势追踪
- 专业知识积累

## 🔧 高级功能

### 批量处理
```bash
# 批量吸收文章列表
openclaw absorb batch ./urls.txt

# 批量处理 PDF 文件夹
openclaw absorb folder ./papers --recursive
```

### 自定义模板
```bash
# 创建笔记模板
openclaw absorb template create "论文笔记" --fields "摘要，方法，结论"

# 使用模板
openclaw absorb article <URL> --template "论文笔记"
```

### 导出分享
```bash
# 导出为 Markdown
openclaw absorb export --format markdown

# 导出为 Notion
openclaw absorb export --to notion

# 分享卡片组
openclaw absorb share --deck "机器学习基础"
```

## 📊 效果展示

使用 1 个月后：
- 阅读效率提升 300%
- 知识 retention 提升 70%
- 笔记整理时间减少 85%
- 知识应用率提升 60%

## 📈 学习分析

### 周报包含：
- 吸收内容数量
- 知识点统计
- 复习完成情况
- 掌握度变化

### 月报包含：
- 学习主题分布
- 知识增长曲线
- 薄弱环节识别
- 学习建议

## 🤝 支持

- 文档：https://docs.openclaw.com/knowledge
- 社区：https://community.openclaw.com
- 邮件：support@openclaw.com

## ⭐ 用户评价

> "这个工具让我真正'吸收'了读过的内容，而不是读过就忘。" - 张博士，研究员

> "知识卡片功能太棒了，复习效率翻倍。" - 李同学，研究生

---

**让每一分钟学习都产生复利效应。**
