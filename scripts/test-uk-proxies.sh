#!/bin/bash
# UK Proxy Finder and Tester
# Fetches proxies, tests connectivity, checks UK location, sends to WeCom

set -e

WORKSPACE="/Users/admin/.openclaw/workspace"
PROXY_FILE="$WORKSPACE/tmp/proxies_raw.txt"
TESTED_FILE="$WORKSPACE/tmp/proxies_tested.txt"
UK_PROXIES_FILE="$WORKSPACE/tmp/uk_proxies.txt"
WECOM_WEBHOOK="${WECOM_WEBHOOK_URL:-}"

mkdir -p "$WORKSPACE/tmp"

echo "=== UK Proxy Finder ==="
echo "Started: $(date)"

# Fetch proxy list
echo "Fetching proxy list..."
curl -sL --max-time 30 "https://api.openproxylist.xyz/http.txt" > "$PROXY_FILE" 2>/dev/null || {
    echo "Failed to fetch proxy list"
    exit 1
}

TOTAL=$(wc -l < "$PROXY_FILE")
echo "Fetched $TOTAL proxies"

# Take a sample for testing (first 100)
SAMPLE_FILE="$WORKSPACE/tmp/proxies_sample.txt"
head -100 "$PROXY_FILE" > "$SAMPLE_FILE"

# Test proxies and check UK location
echo "Testing proxies for UK location..."
> "$UK_PROXIES_FILE"

while IFS= read -r proxy; do
    [[ -z "$proxy" ]] && continue
    
    IP=$(echo "$proxy" | cut -d: -f1)
    PORT=$(echo "$proxy" | cut -d: -f2)
    
    # Quick connectivity test
    if curl -s --max-time 5 -x "$proxy" "https://httpbin.org/ip" 2>/dev/null | grep -q "origin"; then
        # Get apparent IP through proxy
        APPARENT_IP=$(curl -s --max-time 5 -x "$proxy" "https://httpbin.org/ip" 2>/dev/null | grep -oE "[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+" | head -1)
        
        if [[ -n "$APPARENT_IP" ]]; then
            # Check if UK (using ipapi.co)
            COUNTRY=$(curl -s --max-time 5 "https://ipapi.co/$APPARENT_IP/country/" 2>/dev/null || echo "")
            
            if [[ "$COUNTRY" == "GB" ]]; then
                echo "✓ UK Proxy found: $proxy (IP: $APPARENT_IP)"
                echo "$proxy|$APPARENT_IP|$(date +%s)" >> "$UK_PROXIES_FILE"
            fi
        fi
    fi
done < "$SAMPLE_FILE"

UK_COUNT=$(wc -l < "$UK_PROXIES_FILE")
echo "Found $UK_COUNT working UK proxies"

# Generate report
REPORT="🇬🇧 英国免费代理节点更新 $(date +%Y-%m-%d)

✅ 测试完成
📊 扫描数量: 100
🎯 可用英国节点: $UK_COUNT

"

if [[ $UK_COUNT -gt 0 ]]; then
    REPORT+="📋 可用节点列表:
"
    while IFS='|' read -r proxy ip timestamp; do
        REPORT+="• $proxy
"
    done < "$UK_PROXIES_FILE"
else
    REPORT+="⚠️ 本次扫描未找到可用的英国代理节点
建议稍后重试或增加扫描数量
"
fi

REPORT+="
🔄 下次更新: 明日 08:00
---
自动代理节点更新服务"

echo "$REPORT"

# Send to WeCom if webhook configured
if [[ -n "$WECOM_WEBHOOK" ]]; then
    echo "Sending to WeCom..."
    curl -s -X POST "$WECOM_WEBHOOK" \
        -H "Content-Type: application/json" \
        -d "{\"msgtype\":\"text\",\"text\":{\"content\":\"$REPORT\"}}" \
        --max-time 10 || echo "Failed to send to WeCom"
else
    echo "WeCom webhook not configured (WECOM_WEBHOOK_URL not set)"
fi

echo "Completed: $(date)"
