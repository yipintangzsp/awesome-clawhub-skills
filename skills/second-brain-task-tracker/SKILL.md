# task-auto-tracker - 任务自动追踪系统

## 描述
自动从对话、邮件、文档中提取任务，智能分类、优先级排序、进度追踪。支持自动提醒、依赖管理、完成度分析。让任务管理完全自动化。

## 定价
**¥99/月** - 任务自动化订阅

## 功能特性
- 📝 自动任务提取
- 🎯 智能优先级排序
- ⏰ 自动提醒系统
- 🔗 任务依赖管理
- 📊 进度追踪分析
- 🔄 自动状态更新

## 用法
```bash
# 安装技能
openclaw skills install task-auto-tracker

# 启用自动追踪
openclaw task auto-track --enable

# 查看待办任务
openclaw task list --status pending

# 设置提醒
openclaw task remind <id> --when "tomorrow 9am"

# 生成周报
openclaw task report --period week
```

## 依赖
- OpenClaw 主程序
- 日历集成（可选）

## 适用人群
- 项目管理者
- 自由职业者
- 多任务处理者

## 技能 ID
`task-auto-tracker`

## 版本
1.0.0
