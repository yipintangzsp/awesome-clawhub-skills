# HEARTBEAT.md

## 记忆维护任务（每周执行）

检查 `memory/heartbeat-state.json` 中的 `lastMemoryMaintenance` 字段。

如果距今超过 7 天，执行以下维护流程：

1. 读取最近 7 天的日志文件 `memory/YYYY-MM-DD.md`
2. 提炼有长期价值的信息，归档到对应文件：
   - 项目决策和状态 → `memory/projects.md`
   - 问题解决方案 → `memory/lessons.md`
3. 压缩已完成的一次性任务为一行总结
4. 删除完全过期的临时信息
5. 更新 `heartbeat-state.json` 中的 `lastMemoryMaintenance` 为当前日期

---

## 定期检查（轮换执行）

- **邮件** - 检查紧急未读消息
- **日历** - 未来 24-48 小时活动
- **天气** - 如用户可能出门
- **X 提及** - 检查 @用户的推文（配置 x-tweet-fetcher 后）

---

*提示：保持这个文件简洁，减少 token 消耗*
