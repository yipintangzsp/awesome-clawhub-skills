#!/usr/bin/env python3
import subprocess
import sys

crontab_file = "/Users/admin/.openclaw/workspace/crontab"

try:
    # 读取 crontab 文件
    with open(crontab_file, 'r') as f:
        crontab_content = f.read()
    
    # 使用 crontab 命令安装
    process = subprocess.Popen(
        ['crontab', '-'],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    stdout, stderr = process.communicate(input=crontab_content.encode())
    
    if process.returncode == 0:
        print("✅ Crontab 安装成功！")
        # 验证安装
        verify = subprocess.run(['crontab', '-l'], capture_output=True, text=True)
        print("\n已安装的 SkillPay 赚钱任务：")
        for line in verify.stdout.split('\n'):
            if 'SkillPay' in line or '发布 5 个' in line or '收入数据' in line or '引流文章' in line or '爆款数据' in line or '收入日报' in line:
                print(line)
    else:
        print(f"❌ 安装失败：{stderr.decode()}")
        sys.exit(1)
except Exception as e:
    print(f"❌ 错误：{e}")
    sys.exit(1)
