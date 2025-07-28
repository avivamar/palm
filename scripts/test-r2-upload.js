#!/usr/bin/env node
/**
 * R2 上传测试脚本
 * 用于验证 Cloudflare R2 配置是否正确
 */

require('dotenv').config({ path: '.env.local' });

async function testR2Upload() {
  console.log('🔧 R2 上传配置测试\n');
  
  // 1. 检查环境变量
  console.log('1️⃣ 检查环境变量:');
  const requiredVars = [
    'CLOUDFLARE_R2_BUCKET_NAME',
    'CLOUDFLARE_R2_REGION',
    'CLOUDFLARE_R2_ACCESS_KEY_ID',
    'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
    'CLOUDFLARE_R2_ENDPOINT'
  ];
  
  let allVarsSet = true;
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${varName.includes('SECRET') ? '***' + value.slice(-4) : value}`);
    } else {
      console.log(`❌ ${varName}: 未设置`);
      allVarsSet = false;
    }
  }
  
  if (!allVarsSet) {
    console.log('\n❌ 缺少必需的环境变量！');
    console.log('\n请在 .env.local 文件中设置以下环境变量:');
    console.log(`
CLOUDFLARE_R2_BUCKET_NAME=your-bucket-name
CLOUDFLARE_R2_REGION=auto
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key-id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-access-key
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
`);
    console.log('获取这些值的步骤:');
    console.log('1. 登录 Cloudflare Dashboard');
    console.log('2. 进入 R2 > 概览');
    console.log('3. 创建或选择一个存储桶');
    console.log('4. 在 "管理 R2 API 令牌" 中创建 API 令牌');
    console.log('5. 复制访问密钥 ID 和机密访问密钥');
    console.log('6. 端点格式: https://<account-id>.r2.cloudflarestorage.com');
    return;
  }
  
  // 2. 测试创建 R2 客户端
  console.log('\n2️⃣ 测试创建 R2 客户端:');
  try {
    const { createR2Client } = require('@rolitt/image-upload');
    const client = createR2Client();
    console.log('✅ R2 客户端创建成功');
    
    // 3. 测试生成预签名 URL
    console.log('\n3️⃣ 测试生成预签名 URL:');
    const testKey = `test/upload-test-${Date.now()}.txt`;
    const presignedData = await client.generatePresignedUrl(testKey, 'text/plain', 3600);
    console.log('✅ 预签名 URL 生成成功');
    console.log(`   Key: ${presignedData.key}`);
    console.log(`   URL: ${presignedData.url.substring(0, 80)}...`);
    
    // 4. 测试上传
    console.log('\n4️⃣ 测试文件上传:');
    const testContent = `测试上传 - ${new Date().toISOString()}`;
    const uploadResponse = await fetch(presignedData.url, {
      method: 'PUT',
      body: testContent,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
    
    if (uploadResponse.ok) {
      console.log('✅ 文件上传成功');
      
      // 5. 测试公共访问
      console.log('\n5️⃣ 测试公共访问:');
      const publicUrl = client.getPublicUrl(testKey);
      console.log(`   公共 URL: ${publicUrl}`);
      
      try {
        const accessResponse = await fetch(publicUrl);
        if (accessResponse.ok) {
          console.log('✅ 公共访问成功');
          const content = await accessResponse.text();
          console.log(`   内容: ${content}`);
        } else {
          console.log('⚠️  公共访问失败 - 可能需要配置存储桶的公共访问权限');
          console.log(`   状态: ${accessResponse.status} ${accessResponse.statusText}`);
        }
      } catch (error) {
        console.log('⚠️  公共访问测试失败:', error.message);
        console.log('   提示: 检查存储桶是否启用了公共访问');
      }
    } else {
      console.log('❌ 文件上传失败');
      console.log(`   状态: ${uploadResponse.status} ${uploadResponse.statusText}`);
      const errorText = await uploadResponse.text();
      console.log(`   错误: ${errorText}`);
    }
    
  } catch (error) {
    console.log('❌ 测试失败:', error.message);
    if (error.stack) {
      console.log('\n错误堆栈:');
      console.log(error.stack);
    }
  }
  
  console.log('\n📋 配置建议:');
  console.log('1. 确保 R2 存储桶已创建并正确配置');
  console.log('2. API 令牌需要有读写权限');
  console.log('3. 如需公共访问，需在存储桶设置中启用');
  console.log('4. 端点 URL 不要包含存储桶名称');
}

// 运行测试
testR2Upload().catch(console.error);