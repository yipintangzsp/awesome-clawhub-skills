# GitHub Bounty Hunter 🎯

自动扫描 GitHub Bounty 项目，智能匹配技能栈，生成高转化率投标方案。

## 功能特性

- 🔍 **自动扫描**: 监控 GitHub 官方 Bounty 项目和第三方平台
- 🎯 **智能匹配**: 根据你的技能栈推荐最适合的项目
- 📝 **投标模板**: 生成个性化投标文案，提高中标率
- 💰 **收益追踪**: 记录投标历史和收益统计

## 安装

```bash
# 技能已预装到 ~/.openclaw/workspace/skills/github-bounty-hunter/
```

## 使用示例

### 基础扫描
```
/github-bounty-hunter
```

### 高级筛选
```
/github-bounty-hunter --stack javascript,python,rust --min-bounty 1000 --difficulty medium
```

### 生成投标方案
```
/github-bounty-hunter --issue-url https://github.com/xxx/yyy/issues/123 --bid-template
```

## 输出格式

```markdown
## Bounty 推荐 #1
- **项目**: xxx/yyy
- **奖金**: $500-1000
- **难度**: 中等
- **匹配度**: 92%
- **截止时间**: 2026-03-15

### 投标建议
1. 强调你在 xxx 方面的经验
2. 提供类似项目的案例链接
3. 预估完成时间：3-5 天
```

## 定价说明

- ¥29/次：单次扫描 + 投标模板生成
- 包月优惠：¥199/月（无限次扫描）

## 注意事项

⚠️ 需要配置 GitHub Token 才能访问私有 Bounty 项目
⚠️ 投标成功率取决于个人资质和历史记录

## 支持

遇到问题？联系 @张 sir
