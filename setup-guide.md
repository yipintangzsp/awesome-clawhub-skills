# 🦞 OpenClaw 配置指南

**给张 sir 的快速配置手册**  
**时间**: 2026-02-24  
**预计耗时**: 10-15 分钟

---

## 📋 配置清单

### ✅ 必配（免费，5 分钟）

| 项目 | 命令 | 用途 |
|------|------|------|
| Gmail 邮件 | `openclaw configure --section email` | 发送每日报告 |
| 搜索 API | `openclaw configure --section web` | 搜索社区内容 |

### ⭐ 推荐（$1/月，10 分钟）

| 项目 | 命令 | 用途 |
|------|------|------|
| 语音通话 | `openclaw plugins install @openclaw/voice-call` | 打电话给 AI |

---

## 🔧 详细配置步骤

### 1️⃣ 配置 Gmail（发邮件）

```bash
openclaw configure --section email
```

**跟着提示操作**：
1. 选择 Gmail
2. 浏览器会打开 Google 登录页面
3. 登录你的谷歌账号 (zsp779245070@gmail.com)
4. 授权 OpenClaw 发送邮件
5. 完成！

---

### 2️⃣ 配置搜索 API（查资料）

```bash
openclaw configure --section web
```

**跟着提示操作**：
1. 选择 Brave Search
2. 需要 API 密钥（免费申请）
3. 申请链接：https://brave.com/search/api/
4. 拿到密钥后填进去
5. 完成！

---

### 3️⃣ 安装语音插件（可选但推荐）

```bash
openclaw plugins install @openclaw/voice-call
```

**安装后配置 Twilio**：

1. **注册 Twilio**（5 分钟）
   - 打开：https://www.twilio.com/
   - 用邮箱注册账号
   - 验证邮箱和手机

2. **买电话号码**（约$1/月）
   - 登录后进入 Console
   - 点击 "Get a Trial Number" 或 "Buy a Number"
   - 选一个美国号码（最便宜）
   - 确认购买

3. **获取 API 密钥**
   - Account SID：在 Console 首页就能看到
   - Auth Token：点击 "Show" 显示
   - 复制这两个值

4. **配置文件位置**
   ```
   ~/.openclaw/config.json
   ```
   
   添加配置：
   ```json5
   {
     plugins: {
       entries: {
         "voice-call": {
           enabled: true,
           config: {
             provider: "twilio",
             fromNumber: "+1xxxxxxxxxx",  // 你买的 Twilio 号码
             toNumber: "+86xxxxxxxxxxx",  // 你的手机号
             twilio: {
               accountSid: "ACxxxxxxxxxxxxxxxxx",
               authToken: "你的 auth token",
             },
             outbound: {
               defaultMode: "notify",
             },
           },
         }
       }
     }
   }
   ```

5. **重启 Gateway**
   ```bash
   openclaw gateway restart
   ```

---

## ✅ 配置完成后告诉我

配好后在飞书跟我说一声，我马上帮你：

- [ ] 设置每天早上 9 点的社区日报 Cron
- [ ] 配置心跳检查（每 2 小时查邮件/日历）
- [ ] 测试语音通话功能
- [ ] 设置天气提醒

---

## 🔗 有用的链接

| 资源 | 链接 |
|------|------|
| OpenClaw 文档 | https://docs.openclaw.ai |
| Brave API 申请 | https://brave.com/search/api/ |
| Twilio 注册 | https://www.twilio.com/ |
| 社区 Discord | https://discord.gg/clawd |
| 技能市场 | https://clawhub.com |

---

## ❓ 遇到问题？

配置过程中遇到任何问题，直接在飞书问我！

---

*最后更新：2026-02-24 10:55*
