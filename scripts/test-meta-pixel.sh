#!/bin/bash

# Meta Pixel 测试和验证脚本

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 Meta Pixel 测试和验证${NC}"
echo "========================================"

# 检查环境变量
check_env() {
    echo -e "${BLUE}1. 检查环境配置${NC}"
    echo "----------------------------------------"
    
    if [ -f ".env.local" ]; then
        if grep -q "NEXT_PUBLIC_META_PIXEL_ID" ".env.local"; then
            PIXEL_ID=$(grep "NEXT_PUBLIC_META_PIXEL_ID" ".env.local" | cut -d'=' -f2 | tr -d '"')
            echo -e "${GREEN}✅ Pixel ID: $PIXEL_ID${NC}"
        else
            echo -e "${RED}❌ 未找到Meta Pixel ID${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ .env.local文件不存在${NC}"
        exit 1
    fi
    echo ""
}

# 检查项目文件
check_files() {
    echo -e "${BLUE}2. 检查项目文件${NC}"
    echo "----------------------------------------"
    
    # 检查组件文件
    if [ -f "src/components/MetaPixel.tsx" ]; then
        echo -e "${GREEN}✅ MetaPixel组件存在${NC}"
    else
        echo -e "${RED}❌ MetaPixel组件不存在${NC}"
        return 1
    fi
    
    # 检查Layout文件
    if [ -f "src/app/[locale]/layout.tsx" ]; then
        if grep -q "MetaPixel" "src/app/[locale]/layout.tsx"; then
            echo -e "${GREEN}✅ Layout已集成MetaPixel${NC}"
        else
            echo -e "${RED}❌ Layout未集成MetaPixel${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ Layout文件不存在${NC}"
        return 1
    fi
    
    echo ""
}

# 检查构建是否成功
check_build() {
    echo -e "${BLUE}3. 检查项目构建${NC}"
    echo "----------------------------------------"
    
    echo "运行 npm run build 检查..."
    if npm run build > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 项目构建成功${NC}"
    else
        echo -e "${RED}❌ 项目构建失败${NC}"
        echo "请运行 npm run build 查看详细错误信息"
        return 1
    fi
    
    echo ""
}

# 启动开发服务器进行测试
start_dev_server() {
    echo -e "${BLUE}4. 启动开发服务器测试${NC}"
    echo "----------------------------------------"
    
    echo -e "${YELLOW}正在启动开发服务器...${NC}"
    echo "请在浏览器中访问 http://localhost:3000"
    echo ""
    echo -e "${YELLOW}测试步骤:${NC}"
    echo "1. 打开浏览器开发者工具 (F12)"
    echo "2. 切换到 Network (网络) 标签"
    echo "3. 访问页面并刷新"
    echo "4. 查找包含 'facebook.net' 或 'fbevents.js' 的请求"
    echo "5. 检查控制台是否有 fbq 相关的日志"
    echo ""
    echo -e "${BLUE}期望看到的请求:${NC}"
    echo "- https://connect.facebook.net/en_US/fbevents.js"
    echo "- Facebook Pixel 相关的网络请求"
    echo ""
    echo -e "${YELLOW}按 Ctrl+C 停止服务器${NC}"
    echo ""
    
    npm run dev
}

# 创建Chrome扩展测试指南
create_chrome_test_guide() {
    echo -e "${BLUE}5. Chrome扩展验证指南${NC}"
    echo "----------------------------------------"
    
    cat > "meta-pixel-test-guide.md" << 'EOF'
# Meta Pixel Chrome扩展验证指南

## 安装Facebook Pixel Helper

1. 访问 Chrome Web Store
2. 搜索 "Facebook Pixel Helper"
3. 点击"添加到Chrome"安装扩展

## 验证步骤

### 开发环境测试
1. 启动开发服务器: `npm run dev`
2. 访问 http://localhost:3000
3. 点击浏览器工具栏中的Pixel Helper图标
4. 确认显示绿色图标并检测到Pixel

### 生产环境测试
1. 访问 https://www.rolitt.com
2. 点击Pixel Helper图标
3. 查看检测结果

## 预期结果

✅ **成功状态:**
- Pixel Helper显示绿色图标
- 显示Pixel ID: 444178048487559
- 显示"PageView"事件已触发
- 没有错误或警告信息

❌ **失败状态:**
- 红色或黄色图标
- 显示错误信息
- 未检测到Pixel或事件

## Facebook Events Manager验证

1. 登录 https://business.facebook.com
2. 进入 Events Manager
3. 选择您的Pixel (ID: 444178048487559)
4. 查看"Test Events"或"实时事件"
5. 访问网站页面时应该看到PageView事件

## 故障排除

### 常见问题
- **Pixel未加载**: 检查网络连接和广告拦截器
- **事件未触发**: 检查JavaScript控制台错误
- **数据延迟**: Facebook事件可能有1-2分钟延迟

### 调试工具
- 浏览器开发者工具的Network标签
- Console标签查看JavaScript错误
- Facebook Pixel Helper扩展
- Facebook Events Manager实时事件
EOF

    echo -e "${GREEN}✅ 创建Chrome扩展测试指南: meta-pixel-test-guide.md${NC}"
    echo ""
}

# 创建HTML测试页面
create_test_page() {
    echo -e "${BLUE}6. 创建测试页面${NC}"
    echo "----------------------------------------"
    
    mkdir -p "public/test"
    
    cat > "public/test/meta-pixel-test.html" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meta Pixel Test Page</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .button { 
            background: #1877f2; color: white; border: none; padding: 12px 24px; 
            border-radius: 6px; cursor: pointer; margin: 10px; font-size: 16px;
        }
        .button:hover { background: #166fe5; }
        .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        .info { background: #d1ecf1; color: #0c5460; }
    </style>
</head>
<body>
    <h1>Meta Pixel 测试页面</h1>
    <p>此页面用于测试Meta Pixel的集成和事件追踪功能。</p>
    
    <div id="status" class="status info">
        正在检查Meta Pixel状态...
    </div>
    
    <h2>测试事件</h2>
    <button class="button" onclick="testPageView()">测试 PageView</button>
    <button class="button" onclick="testContact()">测试 Contact</button>
    <button class="button" onclick="testLead()">测试 Lead</button>
    <button class="button" onclick="testCustomEvent()">测试自定义事件</button>
    
    <h2>检查结果</h2>
    <div id="results"></div>
    
    <h2>验证工具</h2>
    <ul>
        <li>打开浏览器开发者工具 (F12)</li>
        <li>查看Network标签中的Facebook请求</li>
        <li>在Console中检查 <code>window.fbq</code> 是否存在</li>
        <li>使用Facebook Pixel Helper Chrome扩展</li>
    </ul>

    <!-- Meta Pixel 代码 -->
    <script>
        // Meta Pixel 初始化
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window,document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        
        fbq('init', '$PIXEL_ID');
        fbq('track', 'PageView');
        
        // 检查Pixel状态
        window.addEventListener('load', function() {
            const statusDiv = document.getElementById('status');
            const resultsDiv = document.getElementById('results');
            
            if (typeof window.fbq !== 'undefined') {
                statusDiv.className = 'status success';
                statusDiv.textContent = '✅ Meta Pixel加载成功！';
                resultsDiv.innerHTML += '<p class="success">✅ window.fbq 已定义</p>';
            } else {
                statusDiv.className = 'status error';
                statusDiv.textContent = '❌ Meta Pixel加载失败！';
                resultsDiv.innerHTML += '<p class="error">❌ window.fbq 未定义</p>';
            }
            
            // 检查网络请求
            setTimeout(() => {
                resultsDiv.innerHTML += '<p class="info">💡 检查Network标签是否有 connect.facebook.net 请求</p>';
            }, 2000);
        });
        
        // 测试函数
        function testPageView() {
            if (window.fbq) {
                fbq('track', 'PageView');
                addResult('✅ PageView 事件已发送');
            } else {
                addResult('❌ fbq 未定义，无法发送事件');
            }
        }
        
        function testContact() {
            if (window.fbq) {
                fbq('track', 'Contact');
                addResult('✅ Contact 事件已发送');
            } else {
                addResult('❌ fbq 未定义，无法发送事件');
            }
        }
        
        function testLead() {
            if (window.fbq) {
                fbq('track', 'Lead');
                addResult('✅ Lead 事件已发送');
            } else {
                addResult('❌ fbq 未定义，无法发送事件');
            }
        }
        
        function testCustomEvent() {
            if (window.fbq) {
                fbq('trackCustom', 'TestEvent', {
                    source: 'test_page',
                    timestamp: Date.now()
                });
                addResult('✅ 自定义事件已发送');
            } else {
                addResult('❌ fbq 未定义，无法发送事件');
            }
        }
        
        function addResult(message) {
            const resultsDiv = document.getElementById('results');
            const p = document.createElement('p');
            p.textContent = message;
            p.className = message.includes('✅') ? 'success' : 'error';
            resultsDiv.appendChild(p);
        }
    </script>
    
    <!-- noscript 像素 -->
    <noscript>
        <img height="1" width="1" style="display:none"
             src="https://www.facebook.com/tr?id=$PIXEL_ID&ev=PageView&noscript=1" />
    </noscript>
</body>
</html>
EOF

    echo -e "${GREEN}✅ 创建测试页面: public/test/meta-pixel-test.html${NC}"
    echo "   访问: http://localhost:3000/test/meta-pixel-test.html"
    echo ""
}

# 显示总结
show_summary() {
    echo -e "${BLUE}📊 测试总结${NC}"
    echo "========================================"
    echo ""
    echo -e "${GREEN}🎉 Meta Pixel配置验证完成！${NC}"
    echo ""
    echo -e "${YELLOW}接下来的测试步骤:${NC}"
    echo "1. 运行 npm run dev 启动开发服务器"
    echo "2. 访问 http://localhost:3000"
    echo "3. 使用浏览器开发者工具验证Pixel加载"
    echo "4. 访问测试页面: http://localhost:3000/test/meta-pixel-test.html"
    echo "5. 安装Facebook Pixel Helper Chrome扩展"
    echo "6. 检查Facebook Events Manager中的实时事件"
    echo ""
    echo -e "${BLUE}文档和指南:${NC}"
    echo "- meta-pixel-test-guide.md - Chrome扩展验证指南"
    echo "- src/examples/meta-pixel-usage.tsx - 使用示例"
    echo "- public/test/meta-pixel-test.html - 测试页面"
    echo ""
    echo -e "${YELLOW}生产环境部署后:${NC}"
    echo "- 访问 https://www.rolitt.com 验证"
    echo "- 使用Pixel Helper验证生产环境"
    echo "- 监控Facebook Events Manager中的数据"
}

# 主函数
main() {
    check_env
    check_files
    create_chrome_test_guide
    create_test_page
    show_summary
    
    echo ""
    read -p "是否现在启动开发服务器进行测试? (y/N): " start_server
    
    if [[ $start_server =~ ^[Yy]$ ]]; then
        start_dev_server
    else
        echo -e "${BLUE}测试准备完成！运行 npm run dev 开始测试。${NC}"
    fi
}

# 执行主程序
main 