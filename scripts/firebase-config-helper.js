#!/usr/bin/env node

/**
 * 🔥 Firebase Admin 配置助手工具
 * 帮助诊断和修复 Firebase 环境变量配置问题
 */

const fs = require('node:fs');
const path = require('node:path');

console.log('🔥 Firebase Admin 配置助手工具');
console.log('=====================================\n');

// 检查环境变量文件
const envFiles = ['.env.local', '.env.development', '.env'];
let envFile = null;

for (const file of envFiles) {
  if (fs.existsSync(file)) {
    envFile = file;
    console.log(`✅ 找到环境变量文件: ${file}`);
    break;
  }
}

if (!envFile) {
  console.log('❌ 没有找到环境变量文件');
  console.log('请创建 .env.local 文件');
  process.exit(1);
}

// 读取环境变量
const envContent = fs.readFileSync(envFile, 'utf8');
const lines = envContent.split('\n');

console.log('\n🔍 检查 Firebase 配置...\n');

// 查找 Firebase 相关配置
const firebaseVars = {};
const otherVars = [];

lines.forEach((line, index) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    if (trimmed.includes('FIREBASE')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=');
      firebaseVars[key] = { value, line: index + 1 };
    } else if (trimmed.includes('=')) {
      otherVars.push(trimmed.split('=')[0]);
    }
  }
});

// 分析配置
console.log('📋 Firebase 配置状态:');
console.log('====================');

const requiredVars = [
  'FIREBASE_SERVICE_ACCOUNT_KEY',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
];

const clientVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

console.log('\n🔧 服务端配置 (Firebase Admin):');
requiredVars.forEach((varName) => {
  if (firebaseVars[varName]) {
    const value = firebaseVars[varName].value;
    if (varName === 'FIREBASE_SERVICE_ACCOUNT_KEY') {
      // 检查 JSON 格式
      try {
        JSON.parse(value);
        console.log(`  ✅ ${varName}: 有效的 JSON 格式`);
      } catch (e) {
        console.log(`  ❌ ${varName}: 无效的 JSON 格式`);
        console.log(`     错误: ${e.message}`);
        console.log(`     行号: ${firebaseVars[varName].line}`);

        // 尝试修复建议
        if (value.includes('\n') || value.includes('"')) {
          console.log('     💡 可能的问题: JSON 中包含未转义的换行符或引号');
        }
      }
    } else {
      console.log(`  ✅ ${varName}: 已设置`);
    }
  } else {
    console.log(`  ❌ ${varName}: 未设置`);
  }
});

console.log('\n🌐 客户端配置 (Firebase App):');
clientVars.forEach((varName) => {
  if (firebaseVars[varName]) {
    console.log(`  ✅ ${varName}: 已设置`);
  } else {
    console.log(`  ❌ ${varName}: 未设置`);
  }
});

// 生成建议
console.log('\n💡 修复建议:');
console.log('=============');

const hasServiceAccountKey = firebaseVars.FIREBASE_SERVICE_ACCOUNT_KEY;
const hasSeparateVars = firebaseVars.FIREBASE_PROJECT_ID
  && firebaseVars.FIREBASE_PRIVATE_KEY
  && firebaseVars.FIREBASE_CLIENT_EMAIL;

if (hasServiceAccountKey) {
  const value = hasServiceAccountKey.value;
  try {
    JSON.parse(value);
    console.log('✅ FIREBASE_SERVICE_ACCOUNT_KEY 格式正确');
  } catch (e) {
    console.log('❌ FIREBASE_SERVICE_ACCOUNT_KEY 需要修复:');
    console.log('   1. 确保整个 JSON 对象用双引号包围');
    console.log('   2. 转义所有内部双引号为 \\"');
    console.log('   3. 转义所有换行符为 \\n');
    console.log('\n   示例格式:');
    console.log('   FIREBASE_SERVICE_ACCOUNT_KEY="{\\"type\\":\\"service_account\\",\\"project_id\\":\\"your-project\\",...}"');
  }
} else if (hasSeparateVars) {
  console.log('⚠️  使用分离变量方法，建议改用 FIREBASE_SERVICE_ACCOUNT_KEY');

  // 检查私钥格式
  const privateKey = firebaseVars.FIREBASE_PRIVATE_KEY?.value;
  if (privateKey && !privateKey.includes('BEGIN PRIVATE KEY')) {
    console.log('❌ FIREBASE_PRIVATE_KEY 格式可能不正确');
    console.log('   应包含完整的 PEM 格式，包括 -----BEGIN PRIVATE KEY----- 和 -----END PRIVATE KEY-----');
  }
} else {
  console.log('❌ 没有找到有效的 Firebase 配置');
  console.log('   选择以下方法之一:');
  console.log('   \n   方法 1 (推荐): 使用 FIREBASE_SERVICE_ACCOUNT_KEY');
  console.log('   FIREBASE_SERVICE_ACCOUNT_KEY="完整的service account JSON"');
  console.log('   \n   方法 2: 使用分离变量');
  console.log('   FIREBASE_PROJECT_ID=your-project-id');
  console.log('   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----"');
  console.log('   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com');
}

console.log('\n🔗 下一步操作:');
console.log('==============');
console.log('1. 修复环境变量文件中的 Firebase 配置');
console.log('2. 重启开发服务器: npm run dev');
console.log('3. 测试配置: curl http://localhost:3000/api/debug/firebase-status');
console.log('4. 查看详细日志以确认修复效果');

console.log('\n📚 获取 Service Account Key:');
console.log('============================');
console.log('1. 访问 Firebase Console: https://console.firebase.google.com/');
console.log('2. 选择你的项目');
console.log('3. 进入 Project Settings > Service Accounts');
console.log('4. 点击 "Generate new private key"');
console.log('5. 下载 JSON 文件');
console.log('6. 将 JSON 内容作为字符串添加到 FIREBASE_SERVICE_ACCOUNT_KEY');
