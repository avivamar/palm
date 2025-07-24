#!/bin/bash

# 🚀 CI/CD 快速设置脚本
# 用于快速配置 GitHub Actions 和 Railway 部署

set -e

echo "🚀 开始设置 CI/CD 配置..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查必需的工具
check_requirements() {
    echo -e "${BLUE}📋 检查必需工具...${NC}"
    
    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ Git 未安装${NC}"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js 未安装${NC}"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm 未安装${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 所有必需工具已安装${NC}"
}

# 检查 GitHub 仓库
check_github_repo() {
    echo -e "${BLUE}🔍 检查 GitHub 仓库...${NC}"
    
    if ! git remote get-url origin &> /dev/null; then
        echo -e "${RED}❌ 未找到 GitHub 远程仓库${NC}"
        echo -e "${YELLOW}请先设置 GitHub 远程仓库:${NC}"
        echo "git remote add origin https://github.com/username/repo.git"
        exit 1
    fi
    
    REPO_URL=$(git remote get-url origin)
    echo -e "${GREEN}✅ GitHub 仓库: ${REPO_URL}${NC}"
}

# 验证 CI/CD 文件
validate_ci_files() {
    echo -e "${BLUE}📁 验证 CI/CD 文件...${NC}"
    
    local files=(
        ".github/workflows/ci.yml"
        ".github/workflows/railway-deploy.yml"
        ".github/dependabot.yml"
        ".lighthouserc.json"
        "railway.json"
    )
    
    for file in "${files[@]}"; do
        if [[ -f "$file" ]]; then
            echo -e "${GREEN}✅ $file${NC}"
        else
            echo -e "${RED}❌ $file 缺失${NC}"
            exit 1
        fi
    done
}

# 检查环境变量
check_env_vars() {
    echo -e "${BLUE}🔐 检查环境变量...${NC}"
    
    if [[ -f ".env.local" ]]; then
        echo -e "${GREEN}✅ .env.local 存在${NC}"
    else
        echo -e "${YELLOW}⚠️  .env.local 不存在，请创建并配置环境变量${NC}"
    fi
    
    # 运行环境变量检查脚本
    if npm run check-env &> /dev/null; then
        echo -e "${GREEN}✅ 环境变量配置正确${NC}"
    else
        echo -e "${YELLOW}⚠️  环境变量配置可能有问题${NC}"
    fi
}

# 测试构建
test_build() {
    echo -e "${BLUE}🏗️  测试构建...${NC}"
    
    if npm run build &> /dev/null; then
        echo -e "${GREEN}✅ 构建成功${NC}"
    else
        echo -e "${RED}❌ 构建失败${NC}"
        echo -e "${YELLOW}请检查代码并修复构建错误${NC}"
        exit 1
    fi
}

# 设置 GitHub Secrets 提示
setup_github_secrets() {
    echo -e "${BLUE}🔑 GitHub Secrets 设置指南${NC}"
    echo -e "${YELLOW}请在 GitHub 仓库设置中添加以下 Secrets:${NC}"
    echo ""
    echo "必需的 Secrets:"
    echo "- RAILWAY_TOKEN: Railway API Token"
    echo "- RAILWAY_SERVICE_ID: Railway 服务 ID"
    echo "- CODECOV_TOKEN: Codecov Token (可选)"
    echo "- SLACK_WEBHOOK: Slack Webhook URL (可选)"
    echo ""
    echo "可选的 Secrets:"
    echo "- VERCEL_TOKEN: Vercel Token"
    echo "- VERCEL_ORG_ID: Vercel 组织 ID"
    echo "- VERCEL_PROJECT_ID: Vercel 项目 ID"
    echo "- CLOUDFLARE_API_TOKEN: Cloudflare API Token"
    echo "- CLOUDFLARE_ACCOUNT_ID: Cloudflare 账户 ID"
    echo "- SNYK_TOKEN: Snyk Token"
    echo ""
    echo -e "${BLUE}设置路径: GitHub 仓库 > Settings > Secrets and variables > Actions${NC}"
}

# Railway 设置提示
setup_railway() {
    echo -e "${BLUE}🚂 Railway 设置指南${NC}"
    echo -e "${YELLOW}请确保 Railway 项目已正确配置:${NC}"
    echo ""
    echo "1. 安装 Railway CLI:"
    echo "   npm install -g @railway/cli"
    echo ""
    echo "2. 登录 Railway:"
    echo "   railway login"
    echo ""
    echo "3. 连接项目:"
    echo "   railway link"
    echo ""
    echo "4. 设置环境变量:"
    echo "   railway variables set NODE_ENV=production"
    echo "   railway variables set DATABASE_URL=your_db_url"
    echo "   # ... 其他环境变量"
    echo ""
    echo "5. 部署测试:"
    echo "   railway up"
}

# 显示下一步操作
show_next_steps() {
    echo -e "${GREEN}🎉 CI/CD 配置验证完成!${NC}"
    echo ""
    echo -e "${BLUE}📋 下一步操作:${NC}"
    echo ""
    echo "1. 设置 GitHub Secrets (见上方指南)"
    echo "2. 配置 Railway 项目 (见上方指南)"
    echo "3. 推送代码到 GitHub:"
    echo "   git add ."
    echo "   git commit -m 'feat: setup CI/CD pipeline'"
    echo "   git push origin main"
    echo ""
    echo "4. 监控部署:"
    echo "   - GitHub Actions: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:\/]//g' | sed 's/.git$//')/actions"
    echo "   - Railway Dashboard: https://railway.app/dashboard"
    echo ""
    echo -e "${BLUE}📚 详细文档: docs/ci-cd-setup.md${NC}"
}

# 主函数
main() {
    echo -e "${GREEN}🚀 Rolitt CI/CD 设置脚本${NC}"
    echo "=============================="
    echo ""
    
    check_requirements
    check_github_repo
    validate_ci_files
    check_env_vars
    test_build
    
    echo ""
    echo "=============================="
    
    setup_github_secrets
    echo ""
    setup_railway
    echo ""
    show_next_steps
}

# 运行主函数
main "$@"