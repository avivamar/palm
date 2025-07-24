#!/bin/bash

# 本地 Docker 测试脚本
# 模拟 Railway 的构建和部署过程

set -e

echo "🐳 Local Docker Test for Railway Deployment"
echo "========================================="

# 配置变量
IMAGE_NAME="rolitt-local-test"
CONTAINER_NAME="rolitt-container"
PORT=3000
DOCKERFILE="Dockerfile.minimal"

# 清理函数
cleanup() {
    echo "🧹 Cleaning up..."
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
    echo "✅ Cleanup completed"
}

# 设置 trap 以在脚本退出时清理
trap cleanup EXIT

# 检查 Docker 是否运行
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# 选择 Dockerfile
if [ "$1" != "" ]; then
    DOCKERFILE="$1"
fi

echo "🏗️  Using Dockerfile: $DOCKERFILE"

# 检查 Dockerfile 是否存在
if [ ! -f "$DOCKERFILE" ]; then
    echo "❌ Dockerfile '$DOCKERFILE' not found"
    echo "Available Dockerfiles:"
    ls -la Dockerfile*
    exit 1
fi

# 停止和删除现有容器
echo "🛑 Stopping existing container..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# 构建镜像
echo "🏗️  Building Docker image..."
echo "Command: docker build -f $DOCKERFILE -t $IMAGE_NAME ."
docker build -f $DOCKERFILE -t $IMAGE_NAME . || {
    echo "❌ Docker build failed"
    exit 1
}

echo "✅ Docker build completed successfully"

# 显示镜像信息
echo "📊 Image information:"
docker images | grep $IMAGE_NAME

# 运行容器
echo "🚀 Starting container..."
docker run -d \
    --name $CONTAINER_NAME \
    -p $PORT:$PORT \
    -e NODE_ENV=production \
    -e PORT=$PORT \
    $IMAGE_NAME

echo "⏳ Waiting for container to start..."
sleep 5

# 检查容器状态
if docker ps | grep -q $CONTAINER_NAME; then
    echo "✅ Container is running"
else
    echo "❌ Container failed to start"
    echo "📝 Container logs:"
    docker logs $CONTAINER_NAME
    exit 1
fi

# 显示容器信息
echo "📊 Container information:"
docker ps | grep $CONTAINER_NAME

# 检查健康状态
echo "🏥 Checking application health..."
for i in {1..10}; do
    if curl -f http://localhost:$PORT/api/health >/dev/null 2>&1; then
        echo "✅ Application is healthy"
        break
    else
        echo "⏳ Health check attempt $i/10..."
        sleep 2
    fi
    
    if [ $i -eq 10 ]; then
        echo "❌ Application health check failed"
        echo "📝 Container logs:"
        docker logs $CONTAINER_NAME
        exit 1
    fi
done

# 显示访问信息
echo ""
echo "🎉 SUCCESS! Application is running locally"
echo "🌐 Access URL: http://localhost:$PORT"
echo "🏥 Health Check: http://localhost:$PORT/api/health"
echo "📊 Container Stats: docker stats $CONTAINER_NAME"
echo "📝 Container Logs: docker logs $CONTAINER_NAME"
echo ""
echo "⏹️  To stop: docker stop $CONTAINER_NAME"
echo "🗑️  To remove: docker rm $CONTAINER_NAME"

# 可选：实时日志
read -p "📝 Show real-time logs? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📝 Real-time logs (Press Ctrl+C to stop):"
    docker logs -f $CONTAINER_NAME
fi