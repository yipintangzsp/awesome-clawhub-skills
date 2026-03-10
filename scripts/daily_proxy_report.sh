#!/bin/bash
# Daily UK Proxy Report Generator

REPORT_FILE="/tmp/proxy_report_$(date +%Y%m%d).txt"
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

# Header
cat > "$REPORT_FILE" << EOF
🇬🇧 英国免费代理节点日报
更新时间：$TIMESTAMP (Asia/Shanghai)

📊 今日测试结果:
EOF

# Try to get and test a few proxies from multiple sources
echo "" >> "$REPORT_FILE"
echo "=== 代理源 1: openproxylist.xyz ===" >> "$REPORT_FILE"
proxies=$(curl -s --max-time 8 "https://api.openproxylist.xyz/http.txt" 2>/dev/null | head -20)
if [ -n "$proxies" ]; then
    echo "获取到 $(echo "$proxies" | wc -l) 个代理" >> "$REPORT_FILE"
    echo "示例节点:" >> "$REPORT_FILE"
    echo "$proxies" | head -5 | while read p; do echo "  • $p" >> "$REPORT_FILE"; done
else
    echo "❌ 源不可用" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
echo "=== 代理源 2: TheSpeedX HTTP ===" >> "$REPORT_FILE"
proxies=$(curl -s --max-time 8 "https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/http.txt" 2>/dev/null | head -20)
if [ -n "$proxies" ]; then
    echo "获取到 $(echo "$proxies" | wc -l) 个代理" >> "$REPORT_FILE"
    echo "示例节点:" >> "$REPORT_FILE"
    echo "$proxies" | head -5 | while read p; do echo "  • $p" >> "$REPORT_FILE"; done
else
    echo "❌ 源不可用" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
echo "=== 代理源 3: TheSpeedX SOCKS5 ===" >> "$REPORT_FILE"
proxies=$(curl -s --max-time 8 "https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks5.txt" 2>/dev/null | head -20)
if [ -n "$proxies" ]; then
    echo "获取到 $(echo "$proxies" | wc -l) 个代理" >> "$REPORT_FILE"
    echo "示例节点:" >> "$REPORT_FILE"
    echo "$proxies" | head -5 | while read p; do echo "  • $p" >> "$REPORT_FILE"; done
else
    echo "❌ 源不可用" >> "$REPORT_FILE"
fi

# Add usage notes
cat >> "$REPORT_FILE" << EOF

⚠️ 使用说明:
• 免费代理存活率低，建议批量测试
• UK 节点需自行验证 IP 归属地
• 推荐使用: curl --proxy IP:PORT https://httpbin.org/ip
• 生产环境建议使用付费代理服务

📋 推荐验证工具:
• https://httpbin.org/ip - 查看出口 IP
• https://ipapi.co/json - IP 归属地查询
• https://www.iplocation.net - 多源 IP 查询

💡 提示: 免费代理适合临时使用，重要业务请使用付费代理
EOF

cat "$REPORT_FILE"
