#!/usr/bin/env python3
"""
安装 Crontab 配置脚本
"""

import subprocess
import sys

CRONTAB_FILE = "/Users/admin/.openclaw/workspace/crontab"

def main():
    print("正在安装 crontab 配置...")
    
    try:
        # 使用 crontab 命令安装配置
        with open(CRONTAB_FILE, 'r') as f:
            crontab_content = f.read()
        
        # 通过 stdin 传递 crontab 内容
        result = subprocess.run(
            ['crontab', '-'],
            input=crontab_content,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            print("✅ Crontab 安装成功！")
            print("\n已安装的定时任务（SkillPay 相关）：")
            
            # 显示已安装的任务
            list_result = subprocess.run(
                ['crontab', '-l'],
                capture_output=True,
                text=True
            )
            
            for line in list_result.stdout.split('\n'):
                if 'SkillPay' in line or 'auto-publish' in line or 'skillpay' in line.lower():
                    print(f"  {line}")
            
            print("\n完整配置请运行：crontab -l")
            return 0
        else:
            print(f"❌ Crontab 安装失败：{result.stderr}")
            return 1
            
    except Exception as e:
        print(f"❌ 错误：{e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
