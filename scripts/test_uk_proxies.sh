#!/bin/bash

# UK Proxy Tester Script
# Tests proxies and filters for UK location

WEBHOOK_URL="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=d310077b-8cad-4e29-abe0-537c2a153c05"

# Proxy sources
PROXY_SOURCES=(
    "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt"
    "https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/http.txt"
    "https://raw.githubusercontent.com/clarketm/proxy-list/master/proxy-list-raw.txt"
)

# Collect all proxies
declare -a ALL_PROXIES
for source in "${PROXY_SOURCES[@]}"; do
    while IFS= read -r proxy; do
        if [[ "$proxy" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+:[0-9]+$ ]]; then
            ALL_PROXIES+=("$proxy")
        fi
    done < <(curl -s --max-time 5 "$source" 2>/dev/null)
done

echo "Collected ${#ALL_PROXIES[@]} proxies from all sources"

# Test and filter UK proxies
declare -a UK_PROXIES
declare -a TESTED_PROXIES

count=0
for proxy in "${ALL_PROXIES[@]}"; do
    # Skip if already tested
    if [[ " ${TESTED_PROXIES[@]} " =~ " ${proxy} " ]]; then
        continue
    fi
    TESTED_PROXIES+=("$proxy")
    
    # Limit testing to first 100 unique proxies
    if [ $count -ge 100 ]; then
        break
    fi
    ((count++))
    
    # Test proxy connectivity and check location
    ip=$(echo "$proxy" | cut -d: -f1)
    
    # Quick connectivity test
    response=$(curl -s --max-time 3 --connect-timeout 2 -x "http://$proxy" "https://api.ipapi.is/?q=$ip" 2>/dev/null)
    
    if [ -n "$response" ]; then
        # Check if it's a UK proxy
        country=$(echo "$response" | grep -o '"country_code":"[^"]*"' | cut -d'"' -f4)
        city=$(echo "$response" | grep -o '"city":"[^"]*"' | cut -d'"' -f4)
        
        if [ "$country" = "GB" ] || [ "$country" = "UK" ]; then
            UK_PROXIES+=("$proxy|$city")
            echo "Found UK proxy: $proxy ($city)"
        fi
    fi
done

echo "Found ${#UK_PROXIES[@]} UK proxies"

# Send to WeCom
if [ ${#UK_PROXIES[@]} -gt 0 ]; then
    message="🇬🇧 UK Free Proxy Nodes - $(date '+%Y-%m-%d %H:%M')\n\n"
    message+="Tested and working UK proxies:\n\n"
    
    i=1
    for proxy_info in "${UK_PROXIES[@]}"; do
        proxy=$(echo "$proxy_info" | cut -d'|' -f1)
        city=$(echo "$proxy_info" | cut -d'|' -f2)
        message+="$i. $proxy ($city)\n"
        ((i++))
    done
    
    message+="\nTotal: ${#UK_PROXIES[@]} working UK proxies"
    
    # Send to WeCom
    curl -s -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"msgtype\":\"text\",\"text\":{\"content\":\"$message\"}}"
    
    echo "Sent to WeCom successfully"
else
    # Send failure message
    curl -s -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"msgtype\":\"text\",\"text\":{\"content\":\"❌ No working UK proxies found at $(date '+%Y-%m-%d %H:%M')\"}}"
    
    echo "No UK proxies found"
fi
