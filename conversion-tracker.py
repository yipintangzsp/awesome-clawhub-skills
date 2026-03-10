#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SkillPay 转化效果追踪器
实时监控营销转化数据，生成分析报告

功能:
- 收集各平台转化数据
- 计算关键指标 (CTR, 转化率，ROI)
- 生成日报/周报/月报
- 实时监控看板
- 数据导出

使用:
python conversion-tracker.py --live          # 实时监控
python conversion-tracker.py --report daily  # 生成日报
python conversion-tracker.py --report weekly # 生成周报
python conversion-tracker.py --export        # 导出数据
"""

import json
import os
import argparse
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
import hashlib

# 配置路径
CONFIG_PATH = os.path.join(os.path.dirname(__file__), 'config.json')
DATA_DIR = os.path.join(os.path.dirname(__file__), 'conversion_data')
REPORT_DIR = os.path.join(os.path.dirname(__file__), 'reports')

# 确保目录存在
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(REPORT_DIR, exist_ok=True)


@dataclass
class ConversionEvent:
    """转化事件"""
    event_id: str
    timestamp: str
    platform: str
    copy_id: str
    event_type: str  # impression, click, conversion
    skill_id: str
    revenue: float = 0.0
    metadata: Dict = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}


@dataclass
class PlatformMetrics:
    """平台指标"""
    platform: str
    impressions: int = 0
    clicks: int = 0
    conversions: int = 0
    revenue: float = 0.0
    cost: float = 0.0
    
    @property
    def ctr(self) -> float:
        """点击率"""
        return (self.clicks / self.impressions * 100) if self.impressions > 0 else 0.0
    
    @property
    def conversion_rate(self) -> float:
        """转化率"""
        return (self.conversions / self.clicks * 100) if self.clicks > 0 else 0.0
    
    @property
    def roi(self) -> float:
        """投资回报率"""
        return ((self.revenue - self.cost) / self.cost * 100) if self.cost > 0 else 0.0
    
    @property
    def cpc(self) -> float:
        """单次点击成本"""
        return (self.cost / self.clicks) if self.clicks > 0 else 0.0
    
    @property
    def cpv(self) -> float:
        """单次转化成本"""
        return (self.cost / self.conversions) if self.conversions > 0 else 0.0


class ConversionTracker:
    """转化追踪器"""
    
    def __init__(self, config_path: str = CONFIG_PATH):
        self.config = self._load_config(config_path)
        self.data_file = os.path.join(DATA_DIR, 'events.jsonl')
        self.metrics_cache = {}
    
    def _load_config(self, path: str) -> Dict:
        """加载配置文件"""
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {'platforms': {}, 'tracking': {}}
    
    def _generate_event_id(self) -> str:
        """生成事件 ID"""
        timestamp = datetime.now().isoformat()
        return hashlib.md5(timestamp.encode()).hexdigest()[:12]
    
    def _save_event(self, event: ConversionEvent):
        """保存事件到文件"""
        with open(self.data_file, 'a', encoding='utf-8') as f:
            f.write(json.dumps(asdict(event), ensure_ascii=False) + '\n')
    
    def _load_events(self, start_date: datetime = None, 
                    end_date: datetime = None) -> List[ConversionEvent]:
        """加载事件"""
        events = []
        
        if not os.path.exists(self.data_file):
            return events
        
        with open(self.data_file, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    data = json.loads(line.strip())
                    event_time = datetime.fromisoformat(data['timestamp'])
                    
                    # 日期过滤
                    if start_date and event_time < start_date:
                        continue
                    if end_date and event_time > end_date:
                        continue
                    
                    events.append(ConversionEvent(**data))
                except (json.JSONDecodeError, KeyError):
                    continue
        
        return events
    
    def track_impression(self, platform: str, copy_id: str, skill_id: str):
        """追踪展示"""
        event = ConversionEvent(
            event_id=self._generate_event_id(),
            timestamp=datetime.now().isoformat(),
            platform=platform,
            copy_id=copy_id,
            event_type='impression',
            skill_id=skill_id
        )
        self._save_event(event)
    
    def track_click(self, platform: str, copy_id: str, skill_id: str, 
                   metadata: Dict = None):
        """追踪点击"""
        event = ConversionEvent(
            event_id=self._generate_event_id(),
            timestamp=datetime.now().isoformat(),
            platform=platform,
            copy_id=copy_id,
            event_type='click',
            skill_id=skill_id,
            metadata=metadata or {}
        )
        self._save_event(event)
    
    def track_conversion(self, platform: str, copy_id: str, skill_id: str,
                        revenue: float, metadata: Dict = None):
        """追踪转化"""
        event = ConversionEvent(
            event_id=self._generate_event_id(),
            timestamp=datetime.now().isoformat(),
            platform=platform,
            copy_id=copy_id,
            event_type='conversion',
            skill_id=skill_id,
            revenue=revenue,
            metadata=metadata or {}
        )
        self._save_event(event)
        print(f"✓ 转化记录：{platform} | 收入：¥{revenue:.2f}")
    
    def calculate_metrics(self, start_date: datetime = None,
                         end_date: datetime = None) -> Dict[str, PlatformMetrics]:
        """计算指标"""
        events = self._load_events(start_date, end_date)
        
        metrics = {}
        
        for event in events:
            if event.platform not in metrics:
                metrics[event.platform] = PlatformMetrics(platform=event.platform)
            
            m = metrics[event.platform]
            
            if event.event_type == 'impression':
                m.impressions += 1
            elif event.event_type == 'click':
                m.clicks += 1
            elif event.event_type == 'conversion':
                m.conversions += 1
                m.revenue += event.revenue
        
        # 计算成本 (简化版，实际应从广告平台获取)
        for platform, m in metrics.items():
            # 假设每次点击成本 ¥0.5
            m.cost = m.clicks * 0.5
        
        return metrics
    
    def generate_report(self, period: str = 'daily') -> Dict:
        """生成报告"""
        now = datetime.now()
        
        if period == 'daily':
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = now
        elif period == 'weekly':
            start_date = now - timedelta(days=7)
            end_date = now
        elif period == 'monthly':
            start_date = now - timedelta(days=30)
            end_date = now
        else:
            start_date = now - timedelta(days=1)
            end_date = now
        
        metrics = self.calculate_metrics(start_date, end_date)
        
        # 计算总体指标
        total_impressions = sum(m.impressions for m in metrics.values())
        total_clicks = sum(m.clicks for m in metrics.values())
        total_conversions = sum(m.conversions for m in metrics.values())
        total_revenue = sum(m.revenue for m in metrics.values())
        total_cost = sum(m.cost for m in metrics.values())
        
        report = {
            'period': period,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'generated_at': datetime.now().isoformat(),
            'summary': {
                'total_impressions': total_impressions,
                'total_clicks': total_clicks,
                'total_conversions': total_conversions,
                'total_revenue': total_revenue,
                'total_cost': total_cost,
                'overall_ctr': (total_clicks / total_impressions * 100) if total_impressions > 0 else 0,
                'overall_conversion_rate': (total_conversions / total_clicks * 100) if total_clicks > 0 else 0,
                'overall_roi': ((total_revenue - total_cost) / total_cost * 100) if total_cost > 0 else 0,
            },
            'platforms': {}
        }
        
        # 各平台详情
        for platform, m in metrics.items():
            report['platforms'][platform] = {
                'impressions': m.impressions,
                'clicks': m.clicks,
                'conversions': m.conversions,
                'revenue': m.revenue,
                'cost': m.cost,
                'ctr': m.ctr,
                'conversion_rate': m.conversion_rate,
                'roi': m.roi,
                'cpc': m.cpc,
                'cpv': m.cpv,
            }
        
        return report
    
    def save_report(self, report: Dict, filename: str = None) -> str:
        """保存报告"""
        if filename is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"report_{report['period']}_{timestamp}.json"
        
        filepath = os.path.join(REPORT_DIR, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        print(f"✓ 报告已保存：{filepath}")
        return filepath
    
    def display_report(self, report: Dict):
        """显示报告"""
        print("\n" + "="*70)
        print(f"SkillPay 转化效果报告 ({report['period']})")
        print("="*70)
        print(f"统计时间：{report['start_date'][:10]} 至 {report['end_date'][:10]}")
        print(f"生成时间：{report['generated_at'][:19]}")
        print("="*70 + "\n")
        
        # 总体指标
        summary = report['summary']
        print("📊 总体表现")
        print("-" * 70)
        print(f"  展示量：     {summary['total_impressions']:,}")
        print(f"  点击量：     {summary['total_clicks']:,}")
        print(f"  转化数：     {summary['total_conversions']:,}")
        print(f"  总收入：     ¥{summary['total_revenue']:,.2f}")
        print(f"  总成本：     ¥{summary['total_cost']:,.2f}")
        print(f"  净利润：     ¥{summary['total_revenue'] - summary['total_cost']:,.2f}")
        print()
        print(f"  点击率 (CTR):        {summary['overall_ctr']:.2f}%")
        print(f"  转化率 (CVR):        {summary['overall_conversion_rate']:.2f}%")
        print(f"  投资回报率 (ROI):    {summary['overall_roi']:.2f}%")
        print()
        
        # 各平台表现
        print("📱 各平台表现")
        print("-" * 70)
        print(f"{'平台':<15} {'展示':>8} {'点击':>8} {'转化':>8} {'收入':>12} {'CTR':>8} {'CVR':>8} {'ROI':>10}")
        print("-" * 70)
        
        for platform, data in report['platforms'].items():
            print(f"{platform:<15} "
                  f"{data['impressions']:>8,} "
                  f"{data['clicks']:>8,} "
                  f"{data['conversions']:>8,} "
                  f"¥{data['revenue']:>10,.2f} "
                  f"{data['ctr']:>7.2f}% "
                  f"{data['conversion_rate']:>7.2f}% "
                  f"{data['roi']:>9.2f}%")
        
        print("-" * 70)
        
        # 优化建议
        print("\n💡 优化建议")
        print("-" * 70)
        
        recommendations = []
        
        # CTR 优化
        if summary['overall_ctr'] < 2:
            recommendations.append("• 点击率偏低，建议优化文案吸引力")
        elif summary['overall_ctr'] > 5:
            recommendations.append("• 点击率优秀，保持当前文案风格")
        
        # 转化率优化
        if summary['overall_conversion_rate'] < 1:
            recommendations.append("• 转化率偏低，检查落地页体验")
        elif summary['overall_conversion_rate'] > 3:
            recommendations.append("• 转化率良好，可考虑增加投放")
        
        # ROI 优化
        if summary['overall_roi'] < 100:
            recommendations.append("• ROI 偏低，优化投放策略或降低成本")
        elif summary['overall_roi'] > 300:
            recommendations.append("• ROI 优秀，可扩大投放规模")
        
        # 平台对比
        best_platform = max(report['platforms'].items(), 
                          key=lambda x: x[1]['roi'])
        worst_platform = min(report['platforms'].items(), 
                           key=lambda x: x[1]['roi'] if x[1]['impressions'] > 0 else float('inf'))
        
        if best_platform[1]['impressions'] > 0:
            recommendations.append(f"• {best_platform[0]} 表现最佳，可增加投放")
        if worst_platform[1]['impressions'] > 0 and worst_platform[1]['roi'] < 0:
            recommendations.append(f"• {worst_platform[0]} 表现不佳，考虑优化或暂停")
        
        if not recommendations:
            recommendations.append("• 整体表现良好，持续优化")
        
        for rec in recommendations:
            print(rec)
        
        print("\n" + "="*70)
    
    def live_monitor(self, interval: int = 5):
        """实时监控"""
        print("🔍 实时监控转化数据 (Ctrl+C 退出)")
        print(f"刷新间隔：{interval}秒\n")
        
        try:
            last_count = 0
            while True:
                # 获取最近 1 小时数据
                end_date = datetime.now()
                start_date = end_date - timedelta(hours=1)
                
                events = self._load_events(start_date, end_date)
                
                if len(events) > last_count:
                    metrics = self.calculate_metrics(start_date, end_date)
                    
                    print(f"\r📊 最近 1 小时 - ", end="")
                    print(f"展示：{sum(m.impressions for m in metrics.values())} | ", end="")
                    print(f"点击：{sum(m.clicks for m in metrics.values())} | ", end="")
                    print(f"转化：{sum(m.conversions for m in metrics.values())} | ", end="")
                    print(f"收入：¥{sum(m.revenue for m in metrics.values()):.2f}", end="")
                    
                    last_count = len(events)
                
                import time
                time.sleep(interval)
                
        except KeyboardInterrupt:
            print("\n\n✓ 监控已停止")
    
    def export_data(self, format: str = 'csv') -> str:
        """导出数据"""
        events = self._load_events()
        
        if format == 'csv':
            filename = os.path.join(DATA_DIR, f"export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv")
            
            with open(filename, 'w', encoding='utf-8') as f:
                # 表头
                f.write("event_id,timestamp,platform,copy_id,event_type,skill_id,revenue\n")
                
                # 数据
                for event in events:
                    f.write(f"{event.event_id},{event.timestamp},{event.platform},"
                           f"{event.copy_id},{event.event_type},{event.skill_id},"
                           f"{event.revenue}\n")
            
            print(f"✓ 数据已导出：{filename}")
            return filename
        
        elif format == 'json':
            filename = os.path.join(DATA_DIR, f"export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump([asdict(e) for e in events], f, ensure_ascii=False, indent=2)
            
            print(f"✓ 数据已导出：{filename}")
            return filename
        
        else:
            print(f"✗ 不支持的格式：{format}")
            return ""


def main():
    parser = argparse.ArgumentParser(description='SkillPay 转化追踪器')
    parser.add_argument('--live', action='store_true', help='实时监控')
    parser.add_argument('--report', type=str, choices=['daily', 'weekly', 'monthly'],
                       help='生成报告')
    parser.add_argument('--export', type=str, choices=['csv', 'json'],
                       help='导出数据')
    parser.add_argument('--track', type=str, choices=['impression', 'click', 'conversion'],
                       help='追踪事件')
    parser.add_argument('--platform', type=str, default='twitter',
                       help='平台名称')
    parser.add_argument('--copy-id', type=str, default='',
                       help='文案 ID')
    parser.add_argument('--skill-id', type=str, default='skill-001',
                       help='Skill ID')
    parser.add_argument('--revenue', type=float, default=0.0,
                       help='转化收入')
    parser.add_argument('--interval', type=int, default=5,
                       help='监控刷新间隔 (秒)')
    
    args = parser.parse_args()
    
    tracker = ConversionTracker()
    
    # 追踪事件
    if args.track:
        if args.track == 'impression':
            tracker.track_impression(args.platform, args.copy_id, args.skill_id)
            print(f"✓ 已记录展示：{args.platform}")
        elif args.track == 'click':
            tracker.track_click(args.platform, args.copy_id, args.skill_id)
            print(f"✓ 已记录点击：{args.platform}")
        elif args.track == 'conversion':
            tracker.track_conversion(args.platform, args.copy_id, args.skill_id, args.revenue)
    
    # 实时监控
    elif args.live:
        tracker.live_monitor(args.interval)
    
    # 生成报告
    elif args.report:
        report = tracker.generate_report(args.report)
        tracker.save_report(report)
        tracker.display_report(report)
    
    # 导出数据
    elif args.export:
        tracker.export_data(args.export)
    
    else:
        # 默认显示今日报告
        report = tracker.generate_report('daily')
        tracker.display_report(report)


if __name__ == '__main__':
    main()
