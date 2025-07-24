#!/bin/bash

# Docker 调试工具
# 用于深入调试 Docker 构建和运行问题

set -e

CONTAINER_NAME="rolitt-container"
IMAGE_NAME="rolitt-local-test"

echo "🔍 Docker Debug Tools"
echo "===================="

# 函数：显示镜像信息
show_image_info() {
    echo "🖼️  Image Information:"
    docker images | grep $IMAGE_NAME || echo "No image found"
    echo ""
}

# 函数：显示容器信息
show_container_info() {
    echo "📦 Container Information:"
    docker ps -a | grep $CONTAINER_NAME || echo "No container found"
    echo ""
}

# 函数：显示容器日志
show_logs() {
    echo "📝 Container Logs:"
    if docker ps -a | grep -q $CONTAINER_NAME; then
        docker logs $CONTAINER_NAME
    else
        echo "No container found"
    fi
    echo ""
}

# 函数：显示容器统计
show_stats() {
    echo "📊 Container Stats:"
    if docker ps | grep -q $CONTAINER_NAME; then
        docker stats --no-stream $CONTAINER_NAME
    else
        echo "Container not running"
    fi
    echo ""
}

# 函数：进入容器
enter_container() {
    echo "🚪 Entering container..."
    if docker ps | grep -q $CONTAINER_NAME; then
        docker exec -it $CONTAINER_NAME /bin/sh
    else
        echo "Container not running"
    fi
}

# 函数：检查构建过程
check_build_process() {
    echo "🔍 Checking build process..."
    echo "Available Dockerfiles:"
    ls -la Dockerfile*
    echo ""
    echo "Build context files:"
    ls -la package*.json
    echo ""
    echo "Source files:"
    ls -la src/
    echo ""
}

# 函数：测试不同的 Dockerfile
test_dockerfile() {
    local dockerfile=$1
    echo "🧪 Testing $dockerfile..."
    
    # 构建测试
    docker build -f $dockerfile -t ${IMAGE_NAME}-test . && {
        echo "✅ $dockerfile build successful"
        docker images | grep ${IMAGE_NAME}-test
    } || {
        echo "❌ $dockerfile build failed"
    }
    echo ""
}

# 函数：清理所有资源
cleanup_all() {
    echo "🧹 Cleaning up all Docker resources..."
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
    docker rmi $IMAGE_NAME 2>/dev/null || true
    docker rmi ${IMAGE_NAME}-test 2>/dev/null || true
    docker system prune -f
    echo "✅ Cleanup completed"
}

# 主菜单
case "${1:-menu}" in
    "info")
        show_image_info
        show_container_info
        ;;
    "logs")
        show_logs
        ;;
    "stats")
        show_stats
        ;;
    "enter")
        enter_container
        ;;
    "build-check")
        check_build_process
        ;;
    "test-all")
        for dockerfile in Dockerfile Dockerfile.minimal Dockerfile.simple Dockerfile.railway; do
            if [ -f "$dockerfile" ]; then
                test_dockerfile $dockerfile
            fi
        done
        ;;
    "cleanup")
        cleanup_all
        ;;
    "menu"|*)
        echo "Available commands:"
        echo "  ./scripts/docker-debug.sh info       - Show image and container info"
        echo "  ./scripts/docker-debug.sh logs       - Show container logs"
        echo "  ./scripts/docker-debug.sh stats      - Show container stats"
        echo "  ./scripts/docker-debug.sh enter      - Enter running container"
        echo "  ./scripts/docker-debug.sh build-check - Check build context"
        echo "  ./scripts/docker-debug.sh test-all   - Test all Dockerfiles"
        echo "  ./scripts/docker-debug.sh cleanup    - Clean up all resources"
        ;;
esac