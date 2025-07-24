#!/bin/bash
set -e

echo "🚂 Railway Standalone 启动脚本"

# 全局变量
SERVER_PID=""

# 信号处理函数
cleanup() {
    echo "📡 收到停止信号，正在优雅关闭..."
    if [ ! -z "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
        echo "🔄 停止服务器进程 $SERVER_PID"
        kill -TERM "$SERVER_PID" 2>/dev/null || true
        
        # 等待最多 10 秒让进程优雅退出
        local count=0
        while kill -0 "$SERVER_PID" 2>/dev/null && [ $count -lt 10 ]; do
            sleep 1
            count=$((count + 1))
        done
        
        # 如果进程仍在运行，强制终止
        if kill -0 "$SERVER_PID" 2>/dev/null; then
            echo "⚠️  强制终止服务器进程"
            kill -KILL "$SERVER_PID" 2>/dev/null || true
        fi
    fi
    echo "✅ 服务器已停止"
    exit 0
}

# 注册信号处理
trap cleanup SIGTERM SIGINT EXIT

# 检查 standalone 构建是否存在
if [ ! -f ".next/standalone/server.js" ]; then
    echo "❌ Standalone 构建不存在，请先运行构建"
    exit 1
fi

# 复制静态文件到 standalone 目录
echo "📁 复制静态文件到 standalone 目录..."

# 复制 public 目录
if [ -d "public" ]; then
    cp -r public .next/standalone/
    echo "✅ 复制 public 目录完成"
fi

# 复制 .next/static 目录
if [ -d ".next/static" ]; then
    mkdir -p .next/standalone/.next/
    cp -r .next/static .next/standalone/.next/
    echo "✅ 复制 .next/static 目录完成"
fi

# 设置环境变量
export PORT=${PORT:-3000}
export HOSTNAME=${HOSTNAME:-0.0.0.0}

# Railway 特定配置
if [ -n "$RAILWAY_ENVIRONMENT" ]; then
    # 确保在 Railway 环境中使用正确的端口和主机
    export PORT=${PORT:-8080}
    export HOSTNAME="0.0.0.0"
    echo "🚂 Railway 环境配置:"
    echo "   端口: $PORT"
    echo "   主机: $HOSTNAME"
    echo "   环境: $RAILWAY_ENVIRONMENT"
fi

# 检测运行环境并设置友好的显示地址
if [ -n "$RAILWAY_ENVIRONMENT" ]; then
    DISPLAY_URL="https://${RAILWAY_PUBLIC_DOMAIN:-rolitt.com}"
    DISPLAY_HOST="Railway 容器 ($HOSTNAME:$PORT)"
else
    DISPLAY_URL="http://localhost:$PORT"
    DISPLAY_HOST="$HOSTNAME:$PORT"
fi

echo "🚀 启动 Next.js standalone 服务器"
echo "📍 监听地址: $HOSTNAME:$PORT"
echo "🌐 访问地址: $DISPLAY_URL"

# 启动服务器并获取进程ID
cd .next/standalone

echo "🔄 启动 Node.js 服务器..."
echo "   命令: node server.js"
echo "   工作目录: $(pwd)"
echo "   环境变量:"
echo "     PORT=$PORT"
echo "     HOSTNAME=$HOSTNAME"
echo "     NODE_ENV=${NODE_ENV:-production}"

# 启动服务器
node server.js &
SERVER_PID=$!

echo "✅ 服务器进程已启动，PID: $SERVER_PID"

# 等待服务器启动并进行连接测试
echo "⏳ 等待服务器启动并测试连接..."
sleep 5

# 检查进程是否还在运行
if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "❌ 服务器进程已退出"
    exit 1
fi

# 测试端口连接
echo "🔍 测试端口连接..."
if command -v curl >/dev/null 2>&1; then
    # 尝试连接健康检查端点
    for i in {1..10}; do
        if curl -f -s "http://$HOSTNAME:$PORT/api/webhook/health" >/dev/null 2>&1; then
            echo "✅ 健康检查端点响应正常"
            break
        elif curl -f -s "http://$HOSTNAME:$PORT/" >/dev/null 2>&1; then
            echo "✅ 根路径响应正常"
            break
        else
            echo "⏳ 等待服务器响应... (尝试 $i/10)"
            sleep 2
        fi
        
        # 检查进程是否还在运行
        if ! kill -0 "$SERVER_PID" 2>/dev/null; then
            echo "❌ 服务器进程在启动过程中退出"
            exit 1
        fi
    done
else
    echo "⚠️  curl 不可用，跳过连接测试"
fi

echo "✅ 服务器启动成功，正在运行中..."

# 在 Railway 环境中，保持脚本运行
if [ -n "$RAILWAY_ENVIRONMENT" ]; then
    echo "🚂 Railway 环境检测到，保持容器运行..."
    # 无限循环保持容器运行，直到收到信号
    while kill -0 "$SERVER_PID" 2>/dev/null; do
        sleep 30
    done
    echo "❌ 服务器进程意外退出"
    exit 1
else
    echo "💻 本地环境检测到，等待进程结束..."
    # 本地环境直接等待进程结束
    wait "$SERVER_PID"
fi