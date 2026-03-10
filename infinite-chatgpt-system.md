# ChatGPT 无限额度自动化系统

## 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    ChatGPT 无限额度系统                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Freemail   │  │  自动注册    │  │  验证码转发  │          │
│  │   域名邮箱   │──│   ChatGPT    │──│   到主邮箱   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│           │                │                │                   │
│           ▼                ▼                ▼                   │
│  ┌──────────────────────────────────────────────────┐          │
│  │              账号凭证数据库 (SQLite)              │          │
│  └──────────────────────────────────────────────────┘          │
│           │                │                │                   │
│           ▼                ▼                ▼                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   额度监控   │  │  自动切换    │  │  Codex 生成  │          │
│  │   剩余额度   │──│   账号池     │──│   Skill 代码 │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## 步骤 1: 部署 Freemail

### 前置条件
- Cloudflare 账号
- 自有域名（建议使用便宜域名如 .xyz）
- 主邮箱（用于接收验证码）

### 配置流程

1. **Cloudflare DNS 配置**
   - 添加 MX 记录指向 Cloudflare Email Routing
   - 添加 TXT 记录验证域名所有权

2. **邮箱转发规则**
   - 设置通配符转发：`*@yourdomain.com → main@email.com`
   - 或动态创建临时邮箱地址

3. **测试接收**
   - 发送测试邮件到 `test@yourdomain.com`
   - 验证主邮箱是否收到

### 运行部署脚本
```bash
chmod +x deploy-freemail.sh
./deploy-freemail.sh yourdomain.com main@email.com
```

## 步骤 2: 自动注册 ChatGPT

### 功能特性
- 批量生成随机临时邮箱地址
- 自动填写注册表单
- 处理邮箱验证
- 保存账号凭证到加密数据库

### 使用方法
```bash
python3 auto-register-chatgpt.py --count 10 --domain yourdomain.com
```

### 参数说明
- `--count`: 注册账号数量
- `--domain`: 使用的域名
- `--output`: 凭证输出文件（默认：credentials.db）

## 步骤 3: 验证码自动转发

### 工作流程
1. 监控主邮箱收件箱
2. 识别 ChatGPT 验证邮件
3. 提取验证码
4. 自动完成验证流程

### 集成方式
- IMAP 监听主邮箱
- 正则提取验证码
- 自动提交到注册页面

### 运行转发服务
```bash
python3 verify-forwarder.py --email main@email.com --password APP_PASSWORD
```

## 步骤 4: 额度监控和切换

### 监控策略
- 每 30 分钟检查各账号剩余额度
- 额度低于阈值（如 20%）自动标记
- 自动切换到下一个可用账号

### 账号池管理
- 活跃账号：额度充足，正在使用
- 冷却账号：额度低，等待恢复
- 新注册账号：补充账号池

### API 使用模式
```python
from chatgpt_pool import ChatGPTPool

pool = ChatGPTPool(db_path="credentials.db")
response = pool.chat("你的问题")  # 自动选择最佳账号
```

## 步骤 5: Codex 强化龙虾

### Skill 代码生成
- 使用 Codex API 生成 Skill 代码
- 自动优化现有 Skill
- 批量测试和发布

### 自动化流程
```bash
python3 codex-skill-generator.py --prompt "创建 ChatGPT 调用 Skill" --output skill/
```

## 文件结构

```
infinite-chatgpt-system/
├── infinite-chatgpt-system.md    # 本文档
├── deploy-freemail.sh            # Freemail 部署脚本
├── auto-register-chatgpt.py      # 自动注册脚本
├── verify-forwarder.py           # 验证码转发脚本
├── codex-skill-generator.py      # Codex Skill 生成器
├── requirements.txt              # Python 依赖
└── config/
    └── settings.yaml             # 配置文件
```

## 安全注意事项

⚠️ **重要提醒**：
1. 批量注册可能违反 ChatGPT 服务条款
2. 建议仅用于学习/研究目的
3. 不要用于商业滥用
4. 注意账号安全风险

## 依赖安装

```bash
pip install -r requirements.txt
```

### requirements.txt
```
selenium>=4.15.0
playwright>=1.40.0
imaplib2>=3.0.6
sqlite3
cryptography>=41.0.0
pyyaml>=6.0.1
requests>=2.31.0
```

## 配置示例

### config/settings.yaml
```yaml
domain: yourdomain.com
main_email: main@email.com
email_password: APP_PASSWORD  # 使用应用专用密码

chatgpt:
  registration_count: 10
  usage_threshold: 0.2  # 20% 额度时切换
  
monitoring:
  check_interval: 1800  # 30 分钟
  auto_rotate: true
  
codex:
  api_key: YOUR_OPENAI_API_KEY
  model: codex-latest
```

## 使用流程

1. **初始化系统**
   ```bash
   ./deploy-freemail.sh yourdomain.com main@email.com
   ```

2. **注册账号池**
   ```bash
   python3 auto-register-chatgpt.py --count 20
   ```

3. **启动验证码服务**
   ```bash
   python3 verify-forwarder.py &
   ```

4. **使用账号池**
   ```python
   from chatgpt_pool import ChatGPTPool
   pool = ChatGPTPool()
   response = pool.chat("你好")
   ```

5. **生成 Skill**
   ```bash
   python3 codex-skill-generator.py --prompt "ChatGPT 调用接口"
   ```

## 故障排除

### 常见问题

1. **邮箱接收失败**
   - 检查 Cloudflare DNS 配置
   - 验证域名所有权
   - 检查垃圾邮件文件夹

2. **注册被阻止**
   - 更换 IP 地址（使用代理）
   - 降低注册频率
   - 使用不同浏览器指纹

3. **验证码提取失败**
   - 检查邮箱密码是否正确
   - 验证 IMAP 设置
   - 查看日志文件

## 扩展功能

### 计划中
- [ ] 支持多域名轮换
- [ ] 自动打码服务集成
- [ ] 分布式账号管理
- [ ] API 速率限制优化
- [ ] 账号健康度评分

## 许可证

MIT License - 仅供学习研究使用

---

*最后更新：2026-03-09*
*版本：1.0.0*
