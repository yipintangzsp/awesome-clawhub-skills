#!/bin/bash
# UK Proxy Finder - macOS compatible
WORKSPACE="/Users/admin/.openclaw/workspace"
mkdir -p "$WORKSPACE/tmp"

TIMESTAMP=$(date +"%Y-%m-%d %H:%M")
echo "=== UK Proxy Finder ==="
echo "Started: $TIMESTAMP"

# Fetch proxy list
echo "Fetching proxy list..."
if ! curl -sL --max-time 30 "https://api.openproxylist.xyz/http.txt" > "$WORKSPACE/tmp/proxies_raw.txt" 2>/dev/null; then
    echo "Failed to fetch proxy list"
    exit 1
fi

TOTAL=$(wc -l < "$WORKSPACE/tmp/proxies_raw.txt" | tr -d ' ')
echo "Fetched $TOTAL proxies"

# Test first 30 proxies
SAMPLE_FILE="$WORKSPACE/tmp/proxies_sample.txt"
head -30 "$WORKSPACE/tmp/proxies_raw.txt" > "$SAMPLE_FILE"

echo "Testing proxies..."
> "$WORKSPACE/tmp/uk_proxies.txt"

COUNT=0
while IFS= read -r proxy; do
    [[ -z "$proxy" ]] && continue
    
    COUNT=$((COUNT + 1))
    echo "Testing $COUNT/30: $proxy"
    
    # Test connectivity and get apparent IP
    RESPONSE=$(curl -s --max-time 8 -x "$proxy" "https://httpbin.org/ip" 2>/dev/null)
    
    if [[ -n "$RESPONSE" ]] && echo "$RESPONSE" | grep -q "origin"; then
        APPARENT_IP=$(echo "$RESPONSE" | grep -oE "[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+" | head -1)
        
        if [[ -n "$APPARENT_IP" ]]; then
            # Check country via ipapi
            COUNTRY=$(curl -s --max-time 8 "https://ipapi.co/$APPARENT_IP/country/" 2>/dev/null | tr -d '\n')
            
            if [[ "$COUNTRY" == "GB" ]]; then
                echo "  ✓ UK Proxy: $proxy (IP: $APPARENT_IP)"
                echo "$proxy|$APPARENT_IP" >> "$WORKSPACE/tmp/uk_proxies.txt"
            else
                echo "  ✗ Non-UK ($COUNTRY): $proxy"
            fi
        fi
    else
        echo "  ✗ Failed: $proxy"
    fi
done < "$SAMPLE_FILE"

UK_COUNT=$(wc -l < "$WORKSPACE/tmp/uk_proxies.txt" | tr -d ' ')
echo ""
echo "Found $UK_COUNT working UK proxies"

# Generate report
REPORT="🇬🇧 英国免费代理节点更新 $TIMESTAMP

✅ 测试完成
📊 扫描数量: 30
🎯 可用英国节点: $UK_COUNT

"

if [[ $UK_COUNT -gt 0 ]]; then
    REPORT+="📋 可用节点列表:
"
    while IFS='|' read -r proxy ip; do
        REPORT+="• $proxy
"
    done < "$WORKSPACE/tmp/uk_proxies.txt"
else
    REPORT+="⚠️ 本次扫描未找到可用的英国代理节点

可能原因:
- 网络延迟较高
- 代理节点已失效
- 需要增加扫描数量

建议：稍后重试或增加扫描范围
"
fi

REPORT+="
🔄 下次更新：明日 08:00
---
自动代理节点更新服务"

echo ""
echo "$REPORT"

# Save report
echo "$REPORT" > "$WORKSPACE/tmp/uk_proxy_report.txt"

# Send to WeCom
if [[ -n "$WECOM_WEBHOOK_URL" ]]; then
    echo "Sending to WeCom..."
    
    # Use Python for proper JSON encoding
    python3 << PYEOF
import requests
import json

webhook = "$WECOM_WEBHOOK_URL"
report = '''$REPORT'''

payload = {
    "msgtype": "text",
    "text": {
        "content": report
    }
}

try:
    resp = requests.post(webhook, json=payload, timeout=10)
    if resp.status_code == 200:
        print("✓ Sent to WeCom successfully")
    else:
        print(f"✗ WeCom error: {resp.status_code} - {resp.text}")
except Exception as e:
    print(f"✗ Failed to send: {e}")
PYEOF
else
    echo ""
    echo "⚠️ WeCom webhook not configured (WECOM_WEBHOOK_URL not set)"
    echo "Report saved to: $WORKSPACE/tmp/uk_proxy_report.txt"
fi

echo ""
echo "Completed: $(date +"%Y-%m-%d %H:%M")"
