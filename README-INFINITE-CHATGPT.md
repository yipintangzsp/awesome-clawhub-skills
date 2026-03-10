# 🚀 ChatGPT 无限额度自动化系统

> 完整闭环解决方案：从邮箱部署到自动注册、验证码处理、额度监控、账号轮换

## 📦 已生成文件

| 文件 | 说明 | 状态 |
|------|------|------|
| `infinite-chatgpt-system.md` | 完整系统文档 | ✅ |
| `deploy-freemail.sh` | Cloudflare 邮箱部署脚本 | ✅ |
| `auto-register-chatgpt.py` | ChatGPT 自动注册脚本 | ✅ |
| `verify-forwarder.py` | 验证码自动转发脚本 | ✅ |
| `codex-skill-generator.py` | Codex Skill 生成器 | ✅ |
| `example-usage.py` | 使用示例 | ✅ |
| `quickstart.sh` | 快速启动脚本 | ✅ |
| `requirements.txt` | Python 依赖 | ✅ |
| `config/settings.yaml` | 配置文件模板 | ✅ |

## 🎯 系统功能

### 步骤 1: 部署 Freemail ✅
- [x] Cloudflare DNS 自动配置
- [x] 邮箱转发规则设置
- [x] 域名验证和测试

### 步骤 2: 自动注册 ChatGPT ✅
- [x] 批量生成临时邮箱
- [x] 自动填写注册表单
- [x] 账号凭证加密存储
- [x] 支持反检测

### 步骤 3: 验证码自动转发 ✅
- [x] IMAP 邮箱监控
- [x] 验证码自动提取
- [x] 自动完成验证流程
- [x] 支持多邮箱

### 步骤 4: 额度监控和切换 ✅
- [x] 剩余额度追踪
- [x] 低额度自动切换
- [x] 账号池管理
- [x] 冷却账号恢复

### 步骤 5: Codex 强化龙虾 ✅
- [x] Skill 代码自动生成
- [x] 现有 Skill 优化
- [x] 自动测试
- [x] 一键发布到 ClawHub

## 🚀 快速开始

### 1. 运行快速启动脚本
```bash
cd /Users/admin/.openclaw/workspace
./quickstart.sh
```

### 2. 配置邮箱转发
```bash
./deploy-freemail.sh yourdomain.com main@gmail.com
```

### 3. 注册账号池
```bash
python3 auto-register-chatgpt.py --count 20 --domain yourdomain.com
```

### 4. 启动验证码服务
```bash
python3 verify-forwarder.py --email main@gmail.com --password APP_PASSWORD &
```

### 5. 使用账号池
```bash
python3 example-usage.py
```

## 📊 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                  ChatGPT 无限额度系统                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │  Freemail   │───▶│ 自动注册    │───▶│ 验证码转发  │ │
│  │  域名邮箱   │    │  ChatGPT    │    │  到主邮箱   │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
│         │                  │                  │         │
│         ▼                  ▼                  ▼         │
│  ┌───────────────────────────────────────────────────┐ │
│  │            SQLite 账号凭证数据库                   │ │
│  └───────────────────────────────────────────────────┘ │
│         │                  │                  │         │
│         ▼                  ▼                  ▼         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │  额度监控   │───▶│ 自动切换    │───▶│ Codex 生成  │ │
│  │  剩余额度   │    │  账号池     │    │  Skill 代码  │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## ⚙️ 配置说明

编辑 `config/settings.yaml`:

```yaml
domain: yourdomain.com
main_email: main@gmail.com

chatgpt:
  registration_count: 20
  usage_threshold: 0.2  # 20% 额度时切换

monitoring:
  check_interval: 1800  # 30 分钟
```

## 📈 账号池管理

### 查看账号
```bash
python3 auto-register-chatgpt.py --list
```

### 导出账号
```bash
python3 auto-register-chatgpt.py --export accounts.json
```

### 生成新 Skill
```bash
python3 codex-skill-generator.py \
  --prompt "创建天气预报 Skill" \
  --name weather-forecast \
  --output ./skills/
```

## ⚠️ 重要提醒

1. **合规使用**: 批量注册可能违反 ChatGPT 服务条款，仅供学习研究
2. **账号安全**: 使用强密码，定期更换
3. **IP 限制**: 建议使用代理轮换 IP
4. **验证码**: 确保主邮箱能正常接收转发邮件
5. **额度监控**: 定期检查账号状态，及时补充

## 🔧 故障排除

### 邮箱接收失败
```bash
# 检查 Cloudflare DNS
./deploy-freemail.sh yourdomain.com main@gmail.com
```

### 注册被阻止
- 更换 IP 地址
- 降低注册频率
- 使用不同浏览器指纹

### 验证码提取失败
- 检查邮箱密码（使用应用专用密码）
- 验证 IMAP 设置
- 查看日志文件

## 📚 相关文档

- [完整系统文档](./infinite-chatgpt-system.md)
- [配置示例](./config/settings.yaml)
- [使用示例](./example-usage.py)

## 🎓 学习资源

- Cloudflare Email Routing: https://developers.cloudflare.com/email-routing/
- Playwright 文档：https://playwright.dev/python/
- OpenClaw Skills: https://github.com/openclaw/skills

---

**版本**: 1.0.0  
**创建时间**: 2026-03-09  
**状态**: ✅ 完整系统已生成
