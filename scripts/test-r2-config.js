#!/usr/bin/env node

/**
 * Test script for Cloudflare R2 configuration
 * 用于验证 Cloudflare R2 配置是否正确
 */

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// 读取环境变量
const config = {
  bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
  region: process.env.CLOUDFLARE_R2_REGION || 'auto',
  accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
};

console.log('=== Cloudflare R2 Configuration Test ===\n');

// 验证环境变量
console.log('1. Environment Variables Check:');
const requiredVars = [
  'CLOUDFLARE_R2_BUCKET_NAME',
  'CLOUDFLARE_R2_ACCESS_KEY_ID', 
  'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
  'CLOUDFLARE_R2_ENDPOINT'
];

let missingVars = [];
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    missingVars.push(varName);
    console.log(`   ❌ ${varName}: MISSING`);
  } else {
    console.log(`   ✅ ${varName}: SET (${value.substring(0, 20)}...)`);
  }
});

if (missingVars.length > 0) {
  console.log(`\n❌ Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

console.log('\n2. Configuration Analysis:');
console.log(`   Bucket Name: ${config.bucket}`);
console.log(`   Region: ${config.region}`);
console.log(`   Original Endpoint: ${config.endpoint}`);

// 清理 endpoint，移除 bucket 名称
const cleanEndpoint = config.endpoint.replace(`/${config.bucket}`, '');
console.log(`   Clean Endpoint: ${cleanEndpoint}`);

// 建议的正确配置
console.log('\n3. Configuration Recommendations:');
if (config.endpoint.includes(config.bucket)) {
  console.log('   ⚠️  Your endpoint includes the bucket name, which should be removed');
  console.log(`   Recommended endpoint: ${cleanEndpoint}`);
} else {
  console.log('   ✅ Endpoint configuration looks correct');
}

// 构建公共访问URL
const testKey = 'test-file.jpg';
const publicUrl = `https://${config.bucket}.r2.dev/${testKey}`;
console.log(`   Public URL format: ${publicUrl}`);

// 测试 S3 客户端创建
console.log('\n4. S3 Client Test:');
try {
  const client = new S3Client({
    region: config.region,
    endpoint: cleanEndpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
  console.log('   ✅ S3 Client created successfully');
  
  // 测试预签名URL生成
  console.log('\n5. Presigned URL Test:');
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: testKey,
    ContentType: 'image/jpeg',
  });
  
  getSignedUrl(client, command, { expiresIn: 3600 })
    .then(url => {
      console.log('   ✅ Presigned URL generated successfully');
      console.log(`   URL: ${url.substring(0, 100)}...`);
      console.log('\n✅ All tests passed! R2 configuration appears to be working.');
    })
    .catch(error => {
      console.log('   ❌ Failed to generate presigned URL');
      console.log(`   Error: ${error.message}`);
      console.log('\n❌ R2 configuration test failed.');
    });
    
} catch (error) {
  console.log('   ❌ Failed to create S3 client');
  console.log(`   Error: ${error.message}`);
  console.log('\n❌ R2 configuration test failed.');
}