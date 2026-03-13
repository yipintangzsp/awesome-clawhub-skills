# AI Twitter 日报生成器

## 功能
每天自动抓取 46 个 AI 圈核心账号的推文，生成结构化日报并发送到邮箱。

## 账号清单
### 机构账号 (17 个)
- @OpenAI
- @GoogleDeepMind
- @nvidia
- @AnthropicAI
- @MetaAI
- @deepseek_ai
- @Alibaba_Qwen
- @midjourney
- @Kimi_Moonshot
- @MiniMax_AI
- @BytedanceTalk
- @GroqInc
- @Hailo_AI
- @MIT_CSAIL
- @IBMData
- @DeepMind
- @GoogleAI

### 个人账号 (29 个)
- @elonmusk
- @sama
- @zuck
- @demishassabis
- @DarioAmodei
- @karpathy
- @ylecun
- @geoffreyhinton
- @ilyasut
- @AndrewYNg
- @jeffdean
- @drfeifei
- @Thom_Wolf
- @danielaamodei
- @gdb
- @GaryMarcus
- @JustinLin610
- @steipete
- @ESYudkowsky
- @erikbryn
- @alliekmiller
- @tunguz
- @Ronald_vanLoon
- @DeepLearn007
- @nigewillson
- @petitegeek
- @YuHelenYu
- @TamaraMcCleary

## 使用方法

### 1. 授权 Google (一次性)
```bash
gog auth add heil16070@gmail.com
```

### 2. 测试发送
```bash
# 手动生成并发送测试日报
```

### 3. 配置定时任务
每天早 8 点自动发送：
```bash
# CRON: 0 8 * * *
```

## 输出格式
```markdown
# AI 圈日报 - YYYY-MM-DD

## 🔥 热门话题
- 话题 1
- 话题 2

## 📢 重要发布
- OpenAI: xxx
- DeepMind: xxx

## 💡 大神观点
- @karpathy: xxx
- @sama: xxx

## 🔗 链接汇总
[链接列表]
```

## 配置
- 收件邮箱：heil16070@gmail.com
- 发送时间：每天早上 8:00
- 时区：Asia/Shanghai
