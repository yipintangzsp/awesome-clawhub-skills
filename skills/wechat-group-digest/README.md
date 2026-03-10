# 微信群消息自动整理技能 - 完整文档

## 🎯 产品定位

微信群消息自动整理技能是一款面向社群运营者、知识付费从业者、项目管理者的 AI 工具。它能自动解密、分析、整理微信群聊天记录，生成结构化的日报/周报/月报，帮助用户从海量群消息中提取关键信息。

### 目标用户
- 📱 微信群主/管理员（50+ 人群）
- 💰 知识付费运营者（付费社群）
- 🏢 企业项目经理（项目沟通群）
- 📚 教育培训从业者（学员群）
- 🛒 电商团购团长（客户群）

### 核心价值
1. **节省时间**: 无需手动爬楼，AI 自动总结
2. **不错过重点**: 重要决策、待办自动提取
3. **数据沉淀**: 群聊记录变成可搜索的知识库
4. **提升效率**: 自动生成报告，直接分享给成员

---

## 🚀 快速开始

### 前置要求
1. 已安装 OpenClaw 主程序
2. 已安装 `wechat-decrypt` 技能（用于解密聊天记录）
3. 微信聊天记录导出文件（支持 .txt/.json 格式）

### 安装步骤
```bash
# 1. 安装依赖技能
openclaw skills install wechat-decrypt

# 2. 安装本技能
openclaw skills install wechat-group-digest

# 3. 验证安装
openclaw skills list | grep wechat
```

### 首次使用
```bash
# 导出微信群聊天记录（使用 wechat-decrypt）
openclaw run wechat-decrypt --export "产品讨论群" --output ~/wechat-exports/

# 运行整理技能
openclaw run wechat-group-digest \
  --input ~/wechat-exports/产品讨论群_2026-03-09.json \
  --mode daily \
  --output ~/reports/
```

---

## 📖 功能详解

### 1. 聊天记录解密
调用 `wechat-decrypt` 技能，将微信加密的聊天记录导出为可读格式。

**支持格式**:
- 文本消息
- 图片（提取描述）
- 语音（转文字）
- 文件（提取文件名和类型）
- 链接（提取标题和摘要）

### 2. AI 自动分类
使用大语言模型对消息进行智能分类：

| 分类 | 说明 | 示例 |
|------|------|------|
| 📋 决策 | 群内达成的共识或决定 | "那就这么定了，下周一上线" |
| ✅ 待办 | 分配给具体人员的任务 | "@张三 你负责联系设计师" |
| 💡 想法 | 创意、建议、讨论 | "我觉得可以试试这个方案" |
| 📢 通知 | 公告、提醒、活动 | "明天下午 3 点开会" |
| 💬 闲聊 | 日常交流、表情、寒暄 | "早上好"、"哈哈哈" |
| ❓ 问题 | 提问、求助 | "有人知道这个怎么做吗？" |

### 3. 报告生成

#### 日报 (Daily Report)
- 今日消息总数
- 活跃成员统计
- 热门话题 TOP5
- 今日决策汇总
- 待办事项清单
- 重要提醒

#### 周报 (Weekly Report)
- 周度数据趋势图
- 话题热度变化
- 成员活跃度排名
- 关键决策回顾
- 下周待办预告

#### 月报 (Monthly Report)
- 月度综合分析
- 社群健康度评分
- 高价值内容归档
- 成员贡献榜
- 下月规划建议

### 4. 重要提醒推送
自动识别以下内容并推送提醒：
- ⏰ 时间敏感的会议/活动
- 📅 截止日期/DDL
- 👤 @特定人员 的任务
- ⚠️ 紧急/重要关键词

**推送渠道**: 飞书、Telegram、邮件、微信

---

## ⚙️ 配置说明

### 配置文件
在 `~/.openclaw/workspace/config/wechat-digest.json` 创建配置：

```json
{
  "default_group": "产品讨论群",
  "default_mode": "daily",
  "notify_channels": ["feishu", "telegram"],
  "ai_model": "qwen3.5-plus",
  "summary_length": "medium",
  "include_images": true,
  "include_voice": true,
  "business_hours": {
    "start": "09:00",
    "end": "18:00"
  },
  "keywords": {
    "urgent": ["紧急", "立刻", "马上", "急"],
    "important": ["重要", "关键", "必须", "务必"]
  }
}
```

### 环境变量
```bash
export WECHAT_DIGEST_API_KEY="your-api-key"
export WECHAT_DIGEST_NOTIFY_WEBHOOK="https://your-webhook-url"
```

---

## 💰 定价策略

### 按次付费
- **价格**: ¥20/次
- **适用**: 偶尔使用、临时需求
- **包含**: 单次报告生成、基础分类、标准模板

### 月度订阅
- **价格**: ¥299/月
- **适用**: 日常运营、多个社群
- **包含**: 
  - 无限次报告生成
  - 实时监控模式
  - 多渠道推送
  - 自定义模板
  - 优先支持

### 年度订阅
- **价格**: ¥2999/年
- **适用**: 长期使用、企业用户
- **包含**: 
  - 月度订阅所有功能
  - 企业部署支持
  - API 访问权限
  - 定制开发（限 5 小时）
  - 专属客服
- **节省**: ¥589（相当于免 2 个月）

---

## 🔧 高级用法

### 实时监控模式
```bash
openclaw run wechat-group-digest \
  --mode monitor \
  --group "产品讨论群" \
  --interval 1800 \
  --notify-on-decision \
  --notify-on-mention
```

### 自定义报告模板
```bash
openclaw run wechat-group-digest \
  --template custom \
  --template-file ~/templates/my-report.md \
  --group "产品讨论群"
```

### 批量处理多个群
```bash
openclaw run wechat-group-digest \
  --batch \
  --groups "群 1,群 2,群 3" \
  --mode daily \
  --output ~/reports/batch/
```

### 导出为不同格式
```bash
# Markdown
openclaw run wechat-group-digest --output-format markdown

# HTML
openclaw run wechat-group-digest --output-format html

# JSON (用于二次开发)
openclaw run wechat-group-digest --output-format json

# PDF
openclaw run wechat-group-digest --output-format pdf
```

---

## 📊 输出示例

### 日报示例
```markdown
## 📱 群聊日报 - 产品讨论群
📅 2026 年 3 月 9 日 星期一

### 📊 今日概览
| 指标 | 数值 | 环比 |
|------|------|------|
| 消息总数 | 342 条 | +12% |
| 活跃成员 | 28 人 | +3 人 |
| 高峰时段 | 14:00-16:00 | - |
| 决策数量 | 5 个 | +2 |
| 待办事项 | 8 个 | +1 |

### 🔥 热门话题 TOP5
1. **新功能上线时间** (45 条消息)
   - 关键结论：定于 3 月 15 日上线
   - 参与讨论：@张三 @李四 @王五

2. **UI 设计评审** (32 条消息)
   - 关键结论：采用方案 B，需修改配色
   - 负责人：@设计师小刘

3. **预算审批** (28 条消息)
   - 关键结论：预算通过，总额 50 万
   - 截止：本周五

4. **用户反馈整理** (25 条消息)
   - 主要问题：登录流程复杂
   - 优先级：高

5. **技术选型讨论** (20 条消息)
   - 倾向方案：React + TypeScript
   - 待定：状态管理库

### ✅ 今日决策
- [决策 001] 新功能定于 3 月 15 日上线
- [决策 002] UI 采用方案 B，修改配色后执行
- [决策 003] 预算审批通过，总额 50 万
- [决策 004] 登录流程优化优先级调为高
- [决策 005] 技术栈确定为 React + TypeScript

### 📋 待办事项
| 事项 | 负责人 | 截止日期 | 状态 |
|------|--------|----------|------|
| 联系设计师修改 UI | @张三 | 3 月 11 日 | 待开始 |
| 准备上线物料 | @李四 | 3 月 14 日 | 进行中 |
| 提交预算报销单 | @王五 | 3 月 13 日 | 待开始 |
| 整理用户反馈文档 | @赵六 | 3 月 12 日 | 待开始 |

### ⚠️ 重要提醒
- 📅 明天下午 3 点项目评审会议（全体参加）
- 📅 预算审批截止本周五
- 📅 3 月 15 日新功能上线倒计时 6 天

### 📈 社群健康度
- 活跃度：⭐⭐⭐⭐ (4/5)
- 信息密度：⭐⭐⭐⭐ (4/5)
- 决策效率：⭐⭐⭐⭐⭐ (5/5)
- 整体评分：85/100
```

---

## ❓ 常见问题

### Q: 如何导出微信聊天记录？
A: 使用 `wechat-decrypt` 技能，按照提示操作即可。需要微信 PC 版登录状态。

### Q: 支持语音消息吗？
A: 支持。语音会自动转文字后进行分析，准确率约 95%（普通话）。

### Q: 可以自定义分类规则吗？
A: 可以。在配置文件中添加自定义分类关键词和规则。

### Q: 报告可以自动发送吗？
A: 可以。配置通知渠道后，报告生成完成会自动推送。

### Q: 数据安全吗？
A: 所有数据处理在本地完成，不会上传到云端。配置文件中的 API key 仅用于 AI 模型调用。

### Q: 支持企业微信/钉钉吗？
A: 当前版本仅支持微信。企业微信/钉钉版本正在开发中。

---

## 🆘 技术支持

- **文档**: https://github.com/zhangsir/wechat-group-digest
- **问题反馈**: 提交 GitHub Issue
- **付费支持**: 购买年度订阅包含专属客服
- **定制开发**: 联系 zhangsir@example.com

---

## 📝 更新日志

### v1.0.0 (2026-03-09)
- ✨ 初始版本发布
- ✨ 支持日报/周报/月报生成
- ✨ AI 自动分类整理
- ✨ 多渠道通知推送
- ✨ 实时监控模式

---

## 📄 许可证

MIT License © 2026 张 sir
