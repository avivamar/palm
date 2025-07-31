#!/bin/bash

# Rolitt Palm AI 数据库备份脚本
# 自动化PostgreSQL数据库备份和管理

# 配置
BACKUP_DIR="${BACKUP_DIR:-/var/backups/rolitt-palm}"
RETENTION_DAYS=7  # 保留最近7天的备份
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="rolitt_palm_backup_${TIMESTAMP}"

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 检查环境变量
check_environment() {
    if [ -z "$DATABASE_URL" ]; then
        log_error "DATABASE_URL 环境变量未设置"
        exit 1
    fi
    
    # 创建备份目录
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        log_info "创建备份目录: $BACKUP_DIR"
    fi
}

# 执行数据库备份
perform_backup() {
    log_info "开始备份数据库..."
    
    # 使用pg_dump进行备份
    if pg_dump "$DATABASE_URL" -Fc -f "$BACKUP_DIR/${BACKUP_NAME}.dump"; then
        log_info "数据库备份成功: ${BACKUP_NAME}.dump"
        
        # 压缩备份文件
        gzip "$BACKUP_DIR/${BACKUP_NAME}.dump"
        log_info "备份文件已压缩: ${BACKUP_NAME}.dump.gz"
        
        # 记录备份元数据
        echo "{
            \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
            \"filename\": \"${BACKUP_NAME}.dump.gz\",
            \"size\": \"$(du -h $BACKUP_DIR/${BACKUP_NAME}.dump.gz | cut -f1)\",
            \"database_url\": \"${DATABASE_URL%%@*}@***\"
        }" > "$BACKUP_DIR/${BACKUP_NAME}.json"
        
        return 0
    else
        log_error "数据库备份失败"
        return 1
    fi
}

# 清理旧备份
cleanup_old_backups() {
    log_info "清理超过 ${RETENTION_DAYS} 天的旧备份..."
    
    find "$BACKUP_DIR" -name "*.dump.gz" -mtime +$RETENTION_DAYS -exec rm {} \;
    find "$BACKUP_DIR" -name "*.json" -mtime +$RETENTION_DAYS -exec rm {} \;
    
    log_info "旧备份清理完成"
}

# 验证备份
verify_backup() {
    local backup_file="$BACKUP_DIR/${BACKUP_NAME}.dump.gz"
    
    if [ -f "$backup_file" ]; then
        local file_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null)
        
        if [ "$file_size" -gt 0 ]; then
            log_info "备份验证成功，文件大小: $(du -h $backup_file | cut -f1)"
            return 0
        else
            log_error "备份文件为空"
            return 1
        fi
    else
        log_error "备份文件不存在"
        return 1
    fi
}

# 上传到云存储（可选）
upload_to_cloud() {
    # 如果配置了云存储，可以在这里添加上传逻辑
    # 例如: AWS S3, Google Cloud Storage, Cloudflare R2等
    
    if [ ! -z "$CLOUDFLARE_R2_BUCKET" ]; then
        log_info "上传备份到Cloudflare R2..."
        # 添加R2上传命令
    fi
    
    if [ ! -z "$AWS_S3_BUCKET" ]; then
        log_info "上传备份到AWS S3..."
        # aws s3 cp "$BACKUP_DIR/${BACKUP_NAME}.dump.gz" "s3://$AWS_S3_BUCKET/backups/"
    fi
}

# 发送通知
send_notification() {
    local status=$1
    local message=$2
    
    # 如果配置了通知服务，发送备份状态
    if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"数据库备份 ${status}: ${message}\"}" \
            "$SLACK_WEBHOOK_URL"
    fi
}

# 主函数
main() {
    log_info "=== Rolitt Palm AI 数据库备份开始 ==="
    
    # 检查环境
    check_environment
    
    # 执行备份
    if perform_backup; then
        # 验证备份
        if verify_backup; then
            # 清理旧备份
            cleanup_old_backups
            
            # 上传到云存储
            upload_to_cloud
            
            # 发送成功通知
            send_notification "成功" "备份文件: ${BACKUP_NAME}.dump.gz"
            
            log_info "=== 数据库备份完成 ==="
            exit 0
        else
            send_notification "失败" "备份验证失败"
            exit 1
        fi
    else
        send_notification "失败" "备份执行失败"
        exit 1
    fi
}

# 如果直接运行脚本，执行主函数
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main
fi