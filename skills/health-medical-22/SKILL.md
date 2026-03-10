# 慢病管理与用药提醒系统

## 技能描述
慢病患者管理工具，支持糖尿病、高血压、心脏病等慢病，自动记录健康指标、用药提醒、复诊提醒、饮食运动建议、异常预警。

## 定价
- **标准版**: ¥399/月/病种
- **多病种版**: ¥699/月
- **家庭版**: ¥999/月（3 人）

## 核心功能
1. 健康指标自动记录
2. 智能用药提醒
3. 复诊和检查提醒
4. 饮食和运动建议
5. 异常指标预警
6. 医生沟通辅助

## 使用方式
```bash
/chronic-care activate
/chronic-care setup --condition diabetes
/chronic-care remind --medication metformin --time 08:00,20:00
/chronic-care log --glucose 6.5 --time now
```

## 适用场景
- 糖尿病患者
- 高血压患者
- 心脏病患者
- 慢病家属监护
