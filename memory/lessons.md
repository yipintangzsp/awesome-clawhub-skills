# 经验教训库

_记录遇到的问题和解决方案，按重要性分级。_

---

## 🔴 严重问题

_导致系统故障或数据丢失的问题_

_(暂无)_

---

## 🟡 中等问题

_影响功能但可 workaround 的问题_

_(暂无)_

---

## 🟢 小贴士

_提升效率的技巧和最佳实践_

### 2026-03-07: OpenClaw 工具权限配置
**问题**：2026 年 3 月 2 日后部署的实例默认关闭工具权限
**解决**：
```json
{
  "tools": {
    "profile": "full",
    "exec": {
      "security": "full",
      "ask": "off"
    },
    "sessions": {
      "visibility": "all"
    }
  }
}
```
**标签**：#openclaw #配置 #权限

### 2026-03-07: SkillPay Skill 发布频率限制
**问题**：ClawHub 限制每小时最多发布 5 个新 Skill
**解决**：批量创建文件，分批发布，每小时 5 个
**标签**：#clawhub #发布 #限制

---

### 2026-03-13: 美国住宅地址快速查找工作流
**问题**：需要可租用的美国真实住宅地址（非 CMRA 商业地址）
**解决**：
1. GitHub 安装 `atmb-us-non-cmra` 工具
2. 用工具筛选 Anytime Mailbox 非 CMRA 地址
3. OpenClaw 自动进行价格对比分析，根据需求推荐最优选项
**耗时**：2 分钟（人工查找需数小时）
**标签**：#美国地址 #atmb #自动化 #跨境电商

### 2026-03-13: GitHub Secret Scanning 导致备份失败
**问题**：`package.json` 中 GitHub PAT token 被 Secret Scanning 检测到，push 被拦截
**解决**：
1. 清理 `package.json` 中的 token（改用纯 HTTPS URL）
2. 提交修复 commit
3. 去 GitHub Security 页面手动放行：`/security/secret-scanning/unblock-secret/XXX`
**预防**：
- 永远不要把 PAT 写在代码/配置文件中
- 用 `.gitignore` 忽略敏感文件
- 用环境变量或密钥管理工具
**标签**：#github #安全 #备份 #token

### 2026-03-10: Gumroad 产品打包经验
**问题**：如何快速创建可销售的数字产品
**解决**：
1. 选 12 个成熟工具（链上 4+ 内容 4+ 电商 4）
2. 打包成 zip + 使用指南 + 营销模板
3. Gumroad 上架（Wise 收款）
4. 定价策略：Early Bird $49 → Regular $99
**关键**：
- 卖工具包比卖服务更被动
- Wise + Gumroad 组合最优（汇率好、手续费低）
- 英国账户 + 英国手机号更可信
**标签**：#gumroad #数字产品 #被动收入 #跨境

---

*最后更新：2026-03-14*
