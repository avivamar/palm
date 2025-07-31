#!/bin/bash

# Rolitt Palm AI 数据库恢复脚本
# 从备份恢复PostgreSQL数据库

# 配置
BACKUP_DIR="${BACKUP_DIR:-/var/backups/rolitt-palm}"

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# 列出可用备份
list_backups() {
    log_info "可用的备份文件:"
    echo ""
    
    local count=0
    for backup in $(ls -1t "$BACKUP_DIR"/*.dump.gz 2>/dev/null); do
        count=$((count + 1))
        local filename=$(basename "$backup")
        local size=$(du -h "$backup" | cut -f1)
        local date=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$backup" 2>/dev/null || stat -c "%y" "$backup" 2>/dev/null | cut -d' ' -f1-2)
        
        echo -e "${BLUE}[$count]${NC} $filename (大小: $size, 日期: $date)"
    done
    
    if [ $count -eq 0 ]; then
        log_error "没有找到备份文件"
        exit 1
    fi
    
    echo ""
}

# 选择备份文件
select_backup() {
    list_backups
    
    read -p "请选择要恢复的备份编号: " selection
    
    local count=0
    for backup in $(ls -1t "$BACKUP_DIR"/*.dump.gz 2>/dev/null); do
        count=$((count + 1))
        if [ $count -eq $selection ]; then
            SELECTED_BACKUP="$backup"
            break
        fi
    done
    
    if [ -z "$SELECTED_BACKUP" ]; then
        log_error "无效的选择"
        exit 1
    fi
    
    log_info "已选择备份: $(basename $SELECTED_BACKUP)"
}

# 确认恢复
confirm_restore() {
    log_warning "警告: 恢复数据库将覆盖当前所有数据!"
    echo ""
    read -p "是否确定要继续? (输入 'yes' 确认): " confirm
    
    if [ "$confirm" != "yes" ]; then
        log_info "恢复操作已取消"
        exit 0
    fi
}

# 创建当前数据库备份
backup_current_database() {
    log_info "首先备份当前数据库..."
    
    local emergency_backup="emergency_backup_$(date +%Y%m%d_%H%M%S).dump"
    
    if pg_dump "$DATABASE_URL" -Fc -f "$BACKUP_DIR/$emergency_backup"; then
        gzip "$BACKUP_DIR/$emergency_backup"
        log_info "当前数据库已备份到: ${emergency_backup}.gz"
    else
        log_error "无法备份当前数据库"
        exit 1
    fi
}

# 执行数据库恢复
perform_restore() {
    local backup_file="$SELECTED_BACKUP"
    local temp_file="${backup_file%.gz}"
    
    log_info "开始恢复数据库..."
    
    # 解压备份文件
    log_info "解压备份文件..."
    gunzip -c "$backup_file" > "$temp_file"
    
    # 停止应用连接（可选）
    log_warning "建议在恢复前停止应用服务"
    
    # 恢复数据库
    log_info "恢复数据库中..."
    
    # 使用 --clean 选项删除现有对象
    if pg_restore --clean --if-exists -d "$DATABASE_URL" "$temp_file"; then
        log_info "数据库恢复成功!"
        
        # 清理临时文件
        rm -f "$temp_file"
        
        # 运行VACUUM和ANALYZE
        log_info "优化数据库..."
        psql "$DATABASE_URL" -c "VACUUM ANALYZE;"
        
        return 0
    else
        log_error "数据库恢复失败"
        rm -f "$temp_file"
        return 1
    fi
}

# 验证恢复
verify_restore() {
    log_info "验证数据库恢复..."
    
    # 检查主要表
    local tables=("users" "preorders" "palm_analysis_sessions")
    
    for table in "${tables[@]}"; do
        local count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null)
        if [ $? -eq 0 ]; then
            log_info "表 $table: $count 条记录"
        else
            log_error "无法访问表 $table"
            return 1
        fi
    done
    
    return 0
}

# 恢复后操作
post_restore_actions() {
    log_info "执行恢复后操作..."
    
    # 重建索引
    log_info "重建索引..."
    psql "$DATABASE_URL" -c "REINDEX DATABASE;"
    
    # 更新序列
    log_info "更新序列..."
    psql "$DATABASE_URL" << EOF
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('preorders_id_seq', (SELECT MAX(id) FROM preorders));
SELECT setval('palm_analysis_sessions_id_seq', (SELECT MAX(id) FROM palm_analysis_sessions));
EOF
    
    log_info "恢复后操作完成"
}

# 主函数
main() {
    log_info "=== Rolitt Palm AI 数据库恢复工具 ==="
    
    # 检查环境变量
    if [ -z "$DATABASE_URL" ]; then
        log_error "DATABASE_URL 环境变量未设置"
        exit 1
    fi
    
    # 选择备份文件
    select_backup
    
    # 确认恢复
    confirm_restore
    
    # 备份当前数据库
    backup_current_database
    
    # 执行恢复
    if perform_restore; then
        # 验证恢复
        if verify_restore; then
            # 恢复后操作
            post_restore_actions
            
            log_info "=== 数据库恢复完成 ==="
            log_info "建议立即测试应用功能"
            exit 0
        else
            log_error "数据库恢复验证失败"
            exit 1
        fi
    else
        log_error "数据库恢复失败"
        log_warning "可以尝试从 emergency_backup 恢复"
        exit 1
    fi
}

# 如果直接运行脚本，执行主函数
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main
fi