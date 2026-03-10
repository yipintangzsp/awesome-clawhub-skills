#!/usr/bin/env python3
# ============================================================================
# Revenue Monitor Pro - 数据分析模块
# 功能：收入数据分析、趋势预测、优化建议生成
# ============================================================================

import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# 配置
WORKSPACE = Path.home() / '.openclaw' / 'workspace'
DATA_DIR = WORKSPACE / 'data' / 'revenue'
REPORTS_DIR = WORKSPACE / 'reports'
CONFIG_FILE = WORKSPACE / 'scripts' / 'revenue-alert-config.json'

class RevenueAnalyzer:
    """收入数据分析器"""
    
    def __init__(self):
        self.config = self.load_config()
        self.history = self.load_history()
        self.skill_stats = self.load_skill_stats()
        
    def load_config(self) -> Dict:
        """加载配置文件"""
        try:
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"⚠️  无法加载配置文件：{e}")
            return {
                'alert_threshold': 30,
                'targets': {
                    'daily_income': 200,
                    'monthly_income': 5000
                }
            }
    
    def load_history(self) -> Dict:
        """加载历史数据"""
        history_file = DATA_DIR / 'revenue_history.json'
        try:
            with open(history_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return {'records': []}
    
    def load_skill_stats(self) -> Dict:
        """加载 Skill 统计数据"""
        stats_file = DATA_DIR / 'skill_stats.json'
        try:
            with open(stats_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return {'skills': [], 'last_updated': 0}
    
    def analyze_trend(self, days: int = 7) -> Dict:
        """分析收入趋势"""
        records = self.history.get('records', [])
        if not records:
            return {'error': '无数据'}
        
        # 获取最近 N 天的数据
        cutoff = datetime.now() - timedelta(days=days)
        recent = [r for r in records 
                  if datetime.fromtimestamp(r.get('timestamp', 0)) > cutoff]
        
        if not recent:
            return {'error': '最近无数据'}
        
        # 计算统计指标
        incomes = [r.get('income', 0) for r in recent]
        downloads = [r.get('downloads', 0) for r in recent]
        
        total_income = sum(incomes)
        avg_income = total_income / len(incomes) if incomes else 0
        max_income = max(incomes) if incomes else 0
        min_income = min(incomes) if incomes else 0
        
        # 计算波动率
        if avg_income > 0:
            volatility = (max_income - min_income) / avg_income * 100
        else:
            volatility = 0
        
        # 计算趋势（简单线性回归）
        if len(incomes) >= 2:
            trend = (incomes[-1] - incomes[0]) / len(incomes) * 100
        else:
            trend = 0
        
        return {
            'period_days': days,
            'total_income': total_income,
            'avg_income': avg_income,
            'max_income': max_income,
            'min_income': min_income,
            'volatility': volatility,
            'trend': trend,
            'data_points': len(recent)
        }
    
    def detect_anomalies(self) -> List[Dict]:
        """检测收入异常"""
        records = self.history.get('records', [])
        if len(records) < 2:
            return []
        
        anomalies = []
        threshold = self.config.get('alert_threshold', 30)
        
        for i in range(1, len(records)):
            current = records[i]
            previous = records[i-1]
            
            current_income = current.get('income', 0)
            previous_income = previous.get('income', 0)
            
            if previous_income > 0:
                change_pct = ((current_income - previous_income) / previous_income) * 100
            else:
                change_pct = 0 if current_income == 0 else 100
            
            if abs(change_pct) > threshold:
                anomalies.append({
                    'timestamp': current.get('timestamp'),
                    'date': current.get('date'),
                    'previous_income': previous_income,
                    'current_income': current_income,
                    'change_pct': change_pct,
                    'severity': 'critical' if abs(change_pct) > 50 else 'warning'
                })
        
        return anomalies
    
    def generate_optimization_suggestions(self) -> Dict:
        """生成优化建议"""
        skills = self.skill_stats.get('skills', [])
        if not skills:
            return {'error': '无 Skill 数据'}
        
        suggestions = {
            'price_increase': [],
            'optimize': [],
            'remove': [],
            'featured': []
        }
        
        rules = self.config.get('optimization_rules', {})
        
        for skill in skills:
            name = skill.get('name', 'Unknown')
            downloads = skill.get('downloads', 0)
            income = skill.get('income', 0)
            price = skill.get('price', 0)
            
            # 建议涨价
            increase_rule = rules.get('price_increase_threshold', {})
            if (downloads >= increase_rule.get('downloads_per_day', 10) and
                income >= increase_rule.get('income_per_day', 50)):
                suggested_increase = increase_rule.get('suggested_increase_pct', 30)
                suggestions['price_increase'].append({
                    'name': name,
                    'current_price': price,
                    'suggested_price': round(price * (1 + suggested_increase/100)),
                    'increase_pct': suggested_increase,
                    'reason': f'下载{downloads}次/天，收入¥{income}/天，需求旺盛'
                })
            
            # 建议优化
            if downloads < 5 and income < 20:
                suggestions['optimize'].append({
                    'name': name,
                    'problem': f'下载仅{downloads}次，收入¥{income}',
                    'advice': '优化标题、描述或降低价格'
                })
            
            # 建议下架
            remove_rule = rules.get('skill_removal_threshold', {})
            if (downloads < remove_rule.get('downloads_per_week', 5) and
                income < remove_rule.get('income_per_week', 20)):
                suggestions['remove'].append({
                    'name': name,
                    'reason': '长期低效，占用资源'
                })
            
            # 热门推荐
            featured_rule = rules.get('featured_skill_threshold', {})
            if (downloads >= featured_rule.get('downloads_per_day', 20) and
                income >= featured_rule.get('income_per_day', 100)):
                suggestions['featured'].append({
                    'name': name,
                    'performance': f'下载{downloads}次/天，收入¥{income}/天'
                })
        
        return suggestions
    
    def forecast_income(self, days: int = 30) -> Dict:
        """收入预测"""
        trend_data = self.analyze_trend(days=7)
        
        if 'error' in trend_data:
            return {'error': '无法预测，数据不足'}
        
        avg_daily = trend_data.get('avg_income', 0)
        trend_pct = trend_data.get('trend', 0)
        
        # 简单预测
        conservative = avg_daily * days * 0.8
        normal = avg_daily * days
        optimistic = avg_daily * days * 1.3
        
        # 考虑趋势
        if trend_pct > 0:
            normal *= (1 + trend_pct/100)
            optimistic *= (1 + trend_pct/100)
        
        return {
            'period_days': days,
            'conservative': round(conservative),
            'normal': round(normal),
            'optimistic': round(optimistic),
            'based_on_avg': avg_daily,
            'trend_pct': trend_pct
        }
    
    def generate_report(self, report_type: str = 'daily') -> str:
        """生成报告"""
        template_file = REPORTS_DIR / 'revenue-report-template.md'
        
        # 加载模板
        try:
            with open(template_file, 'r', encoding='utf-8') as f:
                template = f.read()
        except:
            template = "# Revenue Report\n\n{CONTENT}"
        
        # 收集数据
        trend = self.analyze_trend()
        anomalies = self.detect_anomalies()
        suggestions = self.generate_optimization_suggestions()
        forecast = self.forecast_income()
        
        # 填充模板（简化版）
        today = datetime.now()
        content = f"""
## 📊 收入概览

- **分析时间：** {today.strftime('%Y-%m-%d %H:%M:%S')}
- **平均日收入：** ¥{trend.get('avg_income', 0):.2f}
- **收入趋势：** {trend.get('trend', 0):+.1f}%
- **波动率：** {trend.get('volatility', 0):.1f}%

## 🚨 异常检测

发现 {len(anomalies)} 次异常波动

"""
        
        if anomalies:
            for a in anomalies[-3:]:
                content += f"- {a.get('date')}: ¥{a.get('previous_income')} → ¥{a.get('current_income')} ({a.get('change_pct'):+.1f}%)\n"
        
        content += "\n## 💡 优化建议\n\n"
        
        if suggestions.get('price_increase'):
            content += "**建议涨价：**\n"
            for s in suggestions['price_increase'][:3]:
                content += f"- {s['name']}: ¥{s['current_price']} → ¥{s['suggested_price']} (+{s['increase_pct']}%)\n"
            content += "\n"
        
        if suggestions.get('remove'):
            content += "**建议下架：**\n"
            for s in suggestions['remove'][:3]:
                content += f"- {s['name']}: {s['reason']}\n"
        
        content += f"""
## 📈 收入预测（未来 30 天）

- **保守估计：** ¥{forecast.get('conservative', 0)}
- **正常估计：** ¥{forecast.get('normal', 0)}
- **乐观估计：** ¥{forecast.get('optimistic', 0)}
"""
        
        return template.replace('{CONTENT}', content)

def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("用法：python revenue_analyzer.py <command>")
        print("命令：")
        print("  trend     - 分析收入趋势")
        print("  anomalies - 检测异常波动")
        print("  suggest   - 生成优化建议")
        print("  forecast  - 收入预测")
        print("  report    - 生成完整报告")
        sys.exit(1)
    
    analyzer = RevenueAnalyzer()
    command = sys.argv[1]
    
    if command == 'trend':
        result = analyzer.analyze_trend()
        print(json.dumps(result, indent=2, ensure_ascii=False))
    
    elif command == 'anomalies':
        result = analyzer.detect_anomalies()
        print(json.dumps(result, indent=2, ensure_ascii=False))
    
    elif command == 'suggest':
        result = analyzer.generate_optimization_suggestions()
        print(json.dumps(result, indent=2, ensure_ascii=False))
    
    elif command == 'forecast':
        result = analyzer.forecast_income()
        print(json.dumps(result, indent=2, ensure_ascii=False))
    
    elif command == 'report':
        report_type = sys.argv[2] if len(sys.argv) > 2 else 'daily'
        report = analyzer.generate_report(report_type)
        print(report)
    
    else:
        print(f"未知命令：{command}")
        sys.exit(1)

if __name__ == '__main__':
    main()
