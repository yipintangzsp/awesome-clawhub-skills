# OpenClaw 社区使用案例日报
**日期:** 2026 年 3 月 11 日 星期三
**发送目标:** heil16070@gmail.com + 企业微信

---

## 📌 今日精选

### 🆕 Discord 最新分享亮点

1. **PR 审查 → Telegram 反馈** (@bangnokia)
   - OpenCode 完成更改后自动打开 PR，OpenClaw 审查代码差异并在 Telegram 回复审查意见
   - 包含明确的合并建议和关键修复提示

2. **几分钟内创建酒窖 Skill** (@prades_maxime)
   - 用户请求本地酒窖管理 skill，OpenClaw 快速构建并测试
   - 示例管理 962 瓶葡萄酒，支持 CSV 导入导出

3. **Tesco 购物自动驾驶** (@marchattonhere)
   - 每周餐饮计划自动化：常购商品→预订配送时段→确认订单
   - 纯浏览器控制，无需 API

4. **SNAG 截图转 Markdown** (@am-will)
   - 快捷键选择屏幕区域 → Gemini vision → 即时 Markdown 到剪贴板
   - GitHub: https://github.com/am-will/snag

5. **Kev 的梦之队 (14+ 智能体)** (@adam91holt)
   - 单一 Gateway 下运行 14+ 智能体
   - Opus 4.5 作为编排器，委派任务给 Codex 工作者
   - 完整技术文档：智能体阵容、模型选择、沙箱隔离、webhook、心跳机制

---

## 🤖 自动化与工作流

| 项目 | 作者 | 描述 |
|------|------|------|
| Winix 空气净化器控制 | @antonplex | 自动管理房间空气质量 |
| 美丽天空相机拍摄 | @signalgaining | 屋顶摄像头检测到美丽天空时自动拍照 |
| 可视化晨间简报 | @buddyhadry | 每日生成包含天气/任务/日期的场景图片 |
| 板式网球场地预订 | @joshp123 | Playtomic 场地可用性检查 + 自动预订 |
| 会计收件自动化 | 社区 | 从邮件收集 PDF，为税务顾问准备文档 |
| 沙发土豆开发模式 | @davekiss | 通过 Telegram 重建整个网站（Notion→Astro） |
| 求职代理 | @attol8 | 搜索职位列表，匹配 CV 关键词，返回相关机会 |
| Jira Skill 构建器 | @jdrhyne | OpenClaw 连接 Jira 后即时生成新 skill |
| Todoist Skill | @iamsubhrajyoti | 通过 Telegram 自动化 Todoist 任务并生成 skill |
| TradingView 分析 | @bheem1798 | 浏览器自动化登录 + 截图 + 技术分析 |
| Slack 自动支持 | @henrymascot | 监视 Slack 频道，自主修复生产 bug |

---

## 🧠 知识与记忆

- **xuezh 中文学习** (@joshp123): 发音反馈 + 学习流程，GitHub 开源
- **WhatsApp 记忆库**: 转录 1k+ 语音备忘录，与 git 日志交叉检查
- **Karakeep 语义搜索** (@jamesbrooksco): Qdrant + 向量搜索书签
- **Inside-Out-2 记忆**: 会话→记忆→信念→自我模型演化

---

## 🎙️ 语音与电话

- **Clawdia 电话桥接** (@alejandroOPI): Vapi 语音助手 ↔ OpenClaw HTTP 桥接
- **Telegram 语音备忘录**: papla.media TTS 集成
- **OpenRouter 转录** (@obviyus): 多语言音频转录技能

---

## 🏗️ 基础设施与部署

- **Home Assistant 插件** (@ngutman): HA OS 上运行 OpenClaw Gateway
- **Home Assistant Skill**: 自然语言控制 HA 设备
- **Nix 打包** (@openclaw): 可复现部署配置
- **CalDAV 日历**: 自托管日历集成 (khal/vdirsyncer)

---

## 🏠 家居与硬件

- **GoHome 自动化** (@joshp123): Nix 原生家庭自动化 + Grafana 仪表板
- **Roborock 扫地机器人**: 自然语言控制吸尘器
- **Bambu 3D 打印机** (@tobiasbischoff): 状态/任务/摄像头/AMS 控制
- **维也纳交通** (@hjanuschka): 实时公交/地铁信息

---

## 🛠️ 开发者工具

| 项目 | 作者 | 描述 |
|------|------|------|
| CodexMonitor | @odrobnik | Homebrew 安装，监视本地 Codex 会话 |
| Agents UI | @kitze | 桌面应用管理多平台 skills/commands |
| Linear CLI | @NessZerra | Linear 集成，首个外部 PR 合并 |
| Beeper CLI | @jules | 统一管理所有聊天 (iMessage/WhatsApp 等) |
| R2 上传 | @julianengel | Cloudflare R2/S3 上传 + 预签名链接 |
| ParentPay 学校餐食 | @George5562 | 英国学校餐食自动预订 |
| iOS App via Telegram | @coard | 通过 Telegram 构建完整 iOS 应用并部署 TestFlight |

---

## 🌟 社区资源

- **ClawHub**: https://clawhub.ai (技能市场)
- **Discord**: https://discord.gg/clawd (#showcase 频道)
- **文档**: https://docs.openclaw.ai
- **GitHub**: https://github.com/openclaw/openclaw

---

## 📬 提交你的项目

想要展示项目？
1. 在 Discord #showcase 频道发布
2. 或在 X/Twitter 上 @openclaw
3. 包含：功能描述 + 仓库链接 + 截图（如有）

---

**报告生成时间:** 2026-03-11 07:30 (Asia/Shanghai)
**数据来源:** OpenClaw 官方文档 showcase 页面
