#!/bin/bash
# competitor-monitor.sh - ClawHub 热门 Skill 监控脚本
# 功能：自动监控 ClawHub 热门 Skill，收集竞品数据

set -e

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="${SCRIPT_DIR}/competitor-data"
LOG_FILE="${DATA_DIR}/monitor.log"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# 创建数据目录
mkdir -p "${DATA_DIR}"

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

log "=== 开始 ClawHub 竞品监控 ==="

# 获取热门技能数据（按不同维度）
fetch_skills() {
    local sort_by=$1
    local output_file="${DATA_DIR}/skills_${sort_by}_${TIMESTAMP}.json"
    
    log "获取热门技能 (排序：${sort_by})..."
    
    # 尝试获取数据，处理速率限制
    local max_retries=3
    local retry_count=0
    
    while [ $retry_count -lt $max_retries ]; do
        if clawhub explore --limit 100 --sort "${sort_by}" --json 2>&1 > "${output_file}"; then
            log "✓ 成功获取 ${sort_by} 排序的技能数据"
            return 0
        else
            retry_count=$((retry_count + 1))
            if [ $retry_count -lt $max_retries ]; then
                log "⚠ 速率限制，等待 60 秒后重试 (${retry_count}/${max_retries})..."
                sleep 60
            else
                log "✗ 获取失败：速率限制超过重试次数"
                return 1
            fi
        fi
    done
}

# 获取多个维度的数据
fetch_all_dimensions() {
    log "开始多维度数据采集..."
    
    # 按下载量排序
    fetch_skills "downloads" || true
    
    # 按安装量排序
    fetch_skills "installs" || true
    
    # 按评分排序
    fetch_skills "rating" || true
    
    # 按趋势排序
    fetch_skills "trending" || true
    
    # 按最新排序
    fetch_skills "newest" || true
}

# 搜索特定类别的技能
search_categories() {
    local categories=("AI" "automation" "crypto" "ecommerce" "marketing" "productivity" "data" "blockchain")
    
    for category in "${categories[@]}"; do
        local output_file="${DATA_DIR}/search_${category}_${TIMESTAMP}.json"
        log "搜索类别：${category}..."
        clawhub search "${category}" --limit 50 2>&1 | tee "${output_file}" || true
        sleep 5  # 避免速率限制
    done
}

# 生成监控报告摘要
generate_summary() {
    local summary_file="${DATA_DIR}/summary_${TIMESTAMP}.md"
    
    log "生成监控摘要..."
    
    cat > "${summary_file}" << EOF
# ClawHub 竞品监控摘要

**时间**: $(date '+%Y-%m-%d %H:%M:%S')

## 数据文件
$(ls -la "${DATA_DIR}"/*_${TIMESTAMP}.* 2>/dev/null | awk '{print "- " $NF}')

## 下一步
1. 运行 market-analyzer.py 进行市场分析
2. 运行 opportunity-finder.py 发现市场机会
3. 查看生成的差异化建议

EOF
    
    log "✓ 摘要已生成：${summary_file}"
}

# 主执行流程
main() {
    log "工作目录：${SCRIPT_DIR}"
    log "数据目录：${DATA_DIR}"
    
    # 获取数据
    fetch_all_dimensions
    
    # 搜索类别
    search_categories
    
    # 生成摘要
    generate_summary
    
    # 运行市场分析
    if [ -f "${SCRIPT_DIR}/market-analyzer.py" ]; then
        log "运行市场分析..."
        python3 "${SCRIPT_DIR}/market-analyzer.py" "${DATA_DIR}" "${TIMESTAMP}"
    fi
    
    # 运行机会发现
    if [ -f "${SCRIPT_DIR}/opportunity-finder.py" ]; then
        log "运行机会发现..."
        python3 "${SCRIPT_DIR}/opportunity-finder.py" "${DATA_DIR}" "${TIMESTAMP}"
    fi
    
    log "=== 监控完成 ==="
}

# 执行
main "$@"
