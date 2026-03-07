#!/bin/bash

# UK Proxy testing script - Final version with multiple sources
# Tests proxy availability by attempting to connect through them

# Combined UK proxies from multiple sources
# Note: Free proxies have short lifespans (minutes to hours)
UK_PROXIES=(
    # From ProxyScrape GB
    "109.224.242.13:8085"
    "144.124.253.249:47561"
    "139.162.200.213:80"
    "172.200.72.48:80"
    "185.198.27.38:3128"
    "185.82.99.211:8724"
    "31.97.55.197:8080"
    "51.250.37.15:6666"
    "79.72.30.60:1111"
    # From clarketm proxy list (GB tagged)
    "23.144.56.65:80"
    "46.101.19.131:80"
    "46.101.49.62:80"
    "165.3.2.136:3128"
    "94.177.249.42:3128"
    # Additional potential UK IPs
    "51.79.207.21:8080"
    "185.191.236.162:3128"
)

WORKING_PROXIES=()
FAILED_PROXIES=()
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S %Z')

echo "============================================"
echo "🇬🇧 UK Free Proxy Node Test"
echo "============================================"
echo "Timestamp: $TIMESTAMP"
echo "Total proxies to test: ${#UK_PROXIES[@]}"
echo ""

for proxy in "${UK_PROXIES[@]}"; do
    echo -n "Testing $proxy... "
    
    # Test proxy with timeout of 5 seconds
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        --proxy "http://$proxy" \
        --connect-timeout 5 \
        --max-time 8 \
        "https://httpbin.org/ip" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        echo "✓ WORKING"
        WORKING_PROXIES+=("$proxy")
    else
        echo "✗ FAILED"
        FAILED_PROXIES+=("$proxy")
    fi
done

echo ""
echo "============================================"
echo "RESULTS SUMMARY"
echo "============================================"
echo "✓ Working: ${#WORKING_PROXIES[@]}"
echo "✗ Failed: ${#FAILED_PROXIES[@]}"
echo ""

if [ ${#WORKING_PROXIES[@]} -gt 0 ]; then
    echo "✅ AVAILABLE UK PROXIES:"
    for proxy in "${WORKING_PROXIES[@]}"; do
        echo "   • $proxy"
    done
else
    echo "⚠️ No working UK proxies found at this time"
    echo "   Free proxies have short lifespans (minutes to hours)"
    echo "   Recommendation: Try again later or use paid proxy services"
fi

echo ""
echo "============================================"
echo "WeCom Message (企业微信消息)"
echo "============================================"
