#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
withdrawal-tracker.py - ClawHub 提现记录追踪器

功能：
- 记录所有提现申请
- 跟踪提现状态（pending/completed/failed）
- 定期查询提现到账状态
- 生成提现报告

用法：
    python3 withdrawal-tracker.py --init              # 初始化配置
    python3 withdrawal-tracker.py --record [参数]      # 记录提现
    python3 withdrawal-tracker.py --check-status       # 检查提现状态
    python3 withdrawal-tracker.py --report             # 生成报告
    python3 withdrawal-tracker.py --list               # 列出所有记录
"""

import json
import os
import sys
import argparse
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, Dict, List, Any

# 脚本目录
SCRIPT_DIR = Path(__file__).parent.resolve()
DATA_FILE = SCRIPT_DIR / "withdrawal-history.json"
CONFIG_FILE = SCRIPT_DIR / "withdraw-config.json"
LOG_FILE = SCRIPT_DIR / "withdraw.log"


class WithdrawalTracker:
    def __init__(self):
        self.config = self._load_config()
        self.history = self._load_history()
    
    def _load_config(self) -> Dict:
        """加载配置文件"""
        if CONFIG_FILE.exists():
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}
    
    def _load_history(self) -> Dict:
        """加载提现历史"""
        if DATA_FILE.exists():
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {
            "withdrawals": [],
            "total_withdrawn": 0,
            "last_sync": None
        }
    
    def _save_history(self):
        """保存提现历史"""
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.history, f, ensure_ascii=False, indent=2)
    
    def _log(self, message: str):
        """记录日志"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        log_line = f"{timestamp} {message}"
        print(log_line)
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(log_line + "\n")
    
    def init_config(self):
        """初始化配置"""
        self._log("初始化提现追踪器配置...")
        
        if not CONFIG_FILE.exists():
            self._log("❌ 配置文件不存在，请先创建 withdraw-config.json")
            return False
        
        # 验证必要配置
        required_fields = ['withdraw_threshold', 'wallet_address', 'wallet_type']
        missing = [f for f in required_fields if not self.config.get(f)]
        
        if missing:
            self._log(f"⚠️  以下配置项未填写：{', '.join(missing)}")
            self._log("⚠️  请先在 withdraw-config.json 中完成配置")
            return False
        
        if not self.config.get('wallet_address'):
            self._log("❌ 错误：请先在 ClawHub 绑定收款钱包")
            self._log("📍 访问：https://clawhub.ai/settings/payout")
            return False
        
        self._log("✅ 配置验证通过")
        return True
    
    def record_withdrawal(self, withdraw_id: str, amount: float, 
                         wallet: str, status: str = "pending",
                         time: Optional[str] = None):
        """记录提现申请"""
        timestamp = time or datetime.now().isoformat()
        
        record = {
            "id": withdraw_id,
            "amount": amount,
            "wallet_address": wallet,
            "wallet_type": self.config.get('wallet_type', 'crypto'),
            "status": status,
            "created_at": timestamp,
            "updated_at": timestamp,
            "completed_at": None,
            "tx_hash": None,
            "notes": ""
        }
        
        self.history["withdrawals"].append(record)
        self.history["total_withdrawn"] += amount
        self.history["last_sync"] = datetime.now().isoformat()
        
        self._save_history()
        self._log(f"✅ 记录提现：{withdraw_id} - ¥{amount} - {status}")
        
        return record
    
    def update_status(self, withdraw_id: str, status: str, 
                     tx_hash: Optional[str] = None):
        """更新提现状态"""
        for record in self.history["withdrawals"]:
            if record["id"] == withdraw_id:
                record["status"] = status
                record["updated_at"] = datetime.now().isoformat()
                
                if status == "completed":
                    record["completed_at"] = datetime.now().isoformat()
                    if tx_hash:
                        record["tx_hash"] = tx_hash
                    self._log(f"✅ 提现已完成：{withdraw_id}")
                elif status == "failed":
                    self._log(f"❌ 提现失败：{withdraw_id}")
                
                self._save_history()
                return True
        
        self._log(f"⚠️  未找到提现记录：{withdraw_id}")
        return False
    
    def check_status(self):
        """检查所有 pending 状态的提现"""
        self._log("检查提现状态...")
        
        pending = [r for r in self.history["withdrawals"] 
                  if r["status"] == "pending"]
        
        if not pending:
            self._log("✅ 无待处理提现")
            return
        
        self._log(f"发现 {len(pending)} 笔待处理提现")
        
        # 这里应该调用 ClawHub API 查询实际状态
        # 由于 API 未知，仅做模拟检查
        for record in pending:
            created = datetime.fromisoformat(record["created_at"])
            age = datetime.now() - created
            
            if age > timedelta(days=3):
                self._log(f"⚠️  提现 {record['id']} 已超过 3 天未到账")
                # 可以添加自动提醒逻辑
            elif age > timedelta(hours=24):
                self._log(f"⏳ 提现 {record['id']} 处理中（{age.days}天）")
            else:
                self._log(f"⏳ 提现 {record['id']} 处理中")
    
    def list_records(self, limit: int = 10):
        """列出最近的提现记录"""
        withdrawals = sorted(
            self.history["withdrawals"],
            key=lambda x: x["created_at"],
            reverse=True
        )[:limit]
        
        if not withdrawals:
            print("暂无提现记录")
            return
        
        print(f"\n{'ID':<20} {'金额':<10} {'状态':<12} {'时间':<20}")
        print("-" * 65)
        
        for r in withdrawals:
            time_str = r["created_at"][:19].replace('T', ' ')
            print(f"{r['id']:<20} ¥{r['amount']:<9.2f} {r['status']:<12} {time_str:<20}")
        
        print("-" * 65)
        print(f"累计提现：¥{self.history['total_withdrawn']:.2f}")
        print(f"总笔数：{len(self.history['withdrawals'])}\n")
    
    def generate_report(self, days: int = 30) -> Dict[str, Any]:
        """生成提现报告"""
        cutoff = datetime.now() - timedelta(days=days)
        
        recent = [r for r in self.history["withdrawals"]
                 if datetime.fromisoformat(r["created_at"]) > cutoff]
        
        report = {
            "period_days": days,
            "generated_at": datetime.now().isoformat(),
            "total_count": len(recent),
            "total_amount": sum(r["amount"] for r in recent),
            "completed_count": len([r for r in recent if r["status"] == "completed"]),
            "pending_count": len([r for r in recent if r["status"] == "pending"]),
            "failed_count": len([r for r in recent if r["status"] == "failed"]),
            "average_amount": 0,
            "withdrawals": recent
        }
        
        if recent:
            report["average_amount"] = report["total_amount"] / len(recent)
        
        # 打印报告
        print(f"\n{'='*50}")
        print(f"ClawHub 提现报告（过去 {days} 天）")
        print(f"{'='*50}")
        print(f"生成时间：{report['generated_at'][:19].replace('T', ' ')}")
        print(f"提现笔数：{report['total_count']}")
        print(f"提现总额：¥{report['total_amount']:.2f}")
        print(f"平均金额：¥{report['average_amount']:.2f}")
        print(f"已完成：{report['completed_count']}")
        print(f"处理中：{report['pending_count']}")
        print(f"失败：{report['failed_count']}")
        print(f"{'='*50}\n")
        
        return report


def main():
    parser = argparse.ArgumentParser(description='ClawHub 提现记录追踪器')
    parser.add_argument('--init', action='store_true', help='初始化配置')
    parser.add_argument('--record', action='store_true', help='记录提现')
    parser.add_argument('--id', type=str, help='提现 ID')
    parser.add_argument('--amount', type=float, help='提现金额')
    parser.add_argument('--wallet', type=str, help='钱包地址')
    parser.add_argument('--status', type=str, default='pending', 
                       choices=['pending', 'completed', 'failed'],
                       help='提现状态')
    parser.add_argument('--time', type=str, help='提现时间 (ISO 格式)')
    parser.add_argument('--check-status', action='store_true', help='检查提现状态')
    parser.add_argument('--list', action='store_true', help='列出记录')
    parser.add_argument('--limit', type=int, default=10, help='列出数量限制')
    parser.add_argument('--report', action='store_true', help='生成报告')
    parser.add_argument('--days', type=int, default=30, help='报告天数')
    parser.add_argument('--update-status', action='store_true', help='更新状态')
    
    args = parser.parse_args()
    
    tracker = WithdrawalTracker()
    
    if args.init:
        tracker.init_config()
    
    elif args.record:
        if not all([args.id, args.amount, args.wallet]):
            print("错误：--record 需要 --id, --amount, --wallet 参数")
            sys.exit(1)
        tracker.record_withdrawal(
            withdraw_id=args.id,
            amount=args.amount,
            wallet=args.wallet,
            status=args.status,
            time=args.time
        )
    
    elif args.update_status:
        if not all([args.id, args.status]):
            print("错误：--update-status 需要 --id, --status 参数")
            sys.exit(1)
        tracker.update_status(args.id, args.status)
    
    elif args.check_status:
        tracker.check_status()
    
    elif args.list:
        tracker.list_records(args.limit)
    
    elif args.report:
        tracker.generate_report(args.days)
    
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
