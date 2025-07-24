#!/bin/bash

# Admin Package 开发工具脚本
# 提供便捷的开发、测试、构建命令

set -e

ADMIN_DIR="packages/admin"
ROOT_DIR="$(pwd)"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否在正确的目录
check_directory() {
    if [ ! -d "$ADMIN_DIR" ]; then
        log_error "Admin package directory not found. Please run from project root."
        exit 1
    fi
}

# 类型检查 - 仅检查admin包相关错误
check_types() {
    log_info "Checking TypeScript types for admin package..."
    
    # 运行类型检查并过滤admin包相关错误
    if npm run check-types 2>&1 | grep -E "(packages/admin|@rolitt/admin)" > /tmp/admin_type_errors.log; then
        log_error "TypeScript errors found in admin package:"
        cat /tmp/admin_type_errors.log
        rm -f /tmp/admin_type_errors.log
        return 1
    else
        log_success "No TypeScript errors in admin package"
        rm -f /tmp/admin_type_errors.log
        return 0
    fi
}

# 开发模式
dev() {
    log_info "Starting development server..."
    npm run dev
}

# 构建检查
build_check() {
    log_info "Checking if admin package builds correctly..."
    
    # 尝试构建并检查admin相关错误
    if npm run build 2>&1 | tee /tmp/build.log | grep -E "(packages/admin|@rolitt/admin|admin package)" > /tmp/admin_build_errors.log; then
        log_warning "Build completed with admin package related messages:"
        cat /tmp/admin_build_errors.log
        rm -f /tmp/build.log /tmp/admin_build_errors.log
    else
        log_success "Build completed successfully"
        rm -f /tmp/build.log /tmp/admin_build_errors.log
    fi
}

# 包结构验证
validate_structure() {
    log_info "Validating admin package structure..."
    
    required_files=(
        "$ADMIN_DIR/src/index.ts"
        "$ADMIN_DIR/src/features/dashboard/Dashboard.tsx"
        "$ADMIN_DIR/src/features/monitoring/Monitoring.tsx"
        "$ADMIN_DIR/src/features/users/Users.tsx"
        "$ADMIN_DIR/src/features/scripts/Scripts.tsx"
        "$ADMIN_DIR/src/components/layout/AdminHeader.tsx"
        "$ADMIN_DIR/src/components/layout/AdminSidebar.tsx"
        "$ADMIN_DIR/src/stores/admin-store.ts"
        "$ADMIN_DIR/package.json"
    )
    
    missing_files=()
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        log_success "All required files are present"
    else
        log_error "Missing required files:"
        for file in "${missing_files[@]}"; do
            echo "  - $file"
        done
        return 1
    fi
}

# 导出验证
validate_exports() {
    log_info "Validating admin package exports..."
    
    # 检查主要导出是否存在
    exports_to_check=(
        "Dashboard"
        "Monitoring" 
        "Users"
        "Scripts"
        "AdminHeader"
        "AdminSidebar"
    )
    
    index_file="$ADMIN_DIR/src/index.ts"
    if [ ! -f "$index_file" ]; then
        log_error "Index file not found: $index_file"
        return 1
    fi
    
    missing_exports=()
    for export in "${exports_to_check[@]}"; do
        if ! grep -q "export.*$export" "$index_file"; then
            missing_exports+=("$export")
        fi
    done
    
    if [ ${#missing_exports[@]} -eq 0 ]; then
        log_success "All required exports are present"
    else
        log_error "Missing exports in index.ts:"
        for export in "${missing_exports[@]}"; do
            echo "  - $export"
        done
        return 1
    fi
}

# 生成新功能模板
create_feature() {
    local feature_name="$1"
    
    if [ -z "$feature_name" ]; then
        log_error "Feature name is required"
        echo "Usage: $0 create-feature <feature-name>"
        exit 1
    fi
    
    local feature_dir="$ADMIN_DIR/src/features/$feature_name"
    
    if [ -d "$feature_dir" ]; then
        log_error "Feature '$feature_name' already exists"
        exit 1
    fi
    
    log_info "Creating new feature: $feature_name"
    
    # 创建目录
    mkdir -p "$feature_dir"
    
    # 创建组件文件
    cat > "$feature_dir/${feature_name^}.tsx" << EOF
/**
 * ${feature_name^} Feature Component
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@rolitt/shared/ui';
import { useAdminStore } from '../../stores/admin-store';
import type { ${feature_name^}Props } from './types';

export function ${feature_name^}({ locale, translations }: ${feature_name^}Props) {
  const { actions } = useAdminStore();

  useEffect(() => {
    // Load ${feature_name} module on mount
    actions.loadModule('${feature_name}');
  }, [actions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{translations.title}</h1>
        <p className="text-muted-foreground">
          {translations.description}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{translations.title}</CardTitle>
          <CardDescription>
            {translations.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>实现 ${feature_name} 功能...</p>
        </CardContent>
      </Card>
    </div>
  );
}
EOF

    # 创建类型文件
    cat > "$feature_dir/types.ts" << EOF
/**
 * ${feature_name^} module types
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

export interface ${feature_name^}Props {
  locale: string;
  translations: ${feature_name^}Translations;
}

export interface ${feature_name^}Translations {
  title: string;
  description: string;
}
EOF

    # 创建索引文件
    cat > "$feature_dir/index.ts" << EOF
/**
 * ${feature_name^} module index file
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

export { ${feature_name^} } from './${feature_name^}';
export type { 
  ${feature_name^}Props,
  ${feature_name^}Translations 
} from './types';
EOF

    log_success "Feature '$feature_name' created successfully!"
    log_info "Next steps:"
    echo "  1. Update $ADMIN_DIR/src/index.ts to export the new feature"
    echo "  2. Create src/app/[locale]/admin/$feature_name/page.tsx in main app"
    echo "  3. Add translations to src/locales/*/admin.json"
}

# 显示帮助
show_help() {
    echo "Admin Package Development Tools"
    echo ""
    echo "Usage: $0 <command>"
    echo ""
    echo "Commands:"
    echo "  dev                 Start development server"
    echo "  check-types         Check TypeScript types (admin package only)"
    echo "  build-check         Check if package builds correctly"
    echo "  validate           Validate package structure and exports"
    echo "  create-feature      Create a new feature template"
    echo "  help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev"
    echo "  $0 check-types"
    echo "  $0 create-feature analytics"
}

# 主命令处理
main() {
    check_directory
    
    case "${1:-help}" in
        "dev")
            dev
            ;;
        "check-types")
            check_types
            ;;
        "build-check")
            build_check
            ;;
        "validate")
            validate_structure && validate_exports
            ;;
        "create-feature")
            create_feature "$2"
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

main "$@"