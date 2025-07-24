#!/usr/bin/env node

/**
 * 🔧 Firebase Service Account Key 自动修复工具
 * 自动修复环境变量中的 JSON 格式问题
 */

const fs = require('node:fs');
const readline = require('node:readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('🔧 Firebase Service Account Key 自动修复工具');
console.log('=============================================\n');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  try {
    // 检查环境文件
    const envFile = '.env.local';
    if (!fs.existsSync(envFile)) {
      console.log('❌ .env.local 文件不存在');
      process.exit(1);
    }

    console.log('📋 当前问题: FIREBASE_SERVICE_ACCOUNT_KEY JSON 格式错误\n');

    const choice = await askQuestion(
      '选择修复方法:\n'
      + '1. 我有新的 Service Account JSON 文件\n'
      + '2. 我有 JSON 内容，需要自动格式化\n'
      + '3. 查看当前配置问题\n'
      + '请输入选择 (1-3): ',
    );

    switch (choice.trim()) {
      case '1':
        await handleNewServiceAccount();
        break;
      case '2':
        await handleFormatJSON();
        break;
      case '3':
        await showCurrentIssues();
        break;
      default:
        console.log('❌ 无效选择');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    rl.close();
  }
}

async function handleNewServiceAccount() {
  console.log('\n📁 Service Account JSON 文件处理');
  console.log('================================');

  const filePath = await askQuestion('请输入 Service Account JSON 文件路径: ');

  if (!fs.existsSync(filePath)) {
    console.log('❌ 文件不存在');
    return;
  }

  try {
    const jsonContent = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(jsonContent);

    console.log('✅ JSON 文件有效');
    console.log(`   Project ID: ${parsed.project_id}`);
    console.log(`   Client Email: ${parsed.client_email}`);

    await updateEnvFile(jsonContent);
  } catch (error) {
    console.log('❌ JSON 文件无效:', error.message);
  }
}

async function handleFormatJSON() {
  console.log('\n📝 JSON 内容格式化');
  console.log('==================');

  console.log('请粘贴你的 Service Account JSON 内容 (完成后输入 --END--):');

  let jsonContent = '';

  while (true) {
    const line = await askQuestion('');
    if (line.trim() === '--END--') {
      break;
    }
    jsonContent += `${line}\n`;
  }

  try {
    const parsed = JSON.parse(jsonContent.trim());
    console.log('✅ JSON 内容有效');
    console.log(`   Project ID: ${parsed.project_id}`);
    console.log(`   Client Email: ${parsed.client_email}`);

    await updateEnvFile(jsonContent.trim());
  } catch (error) {
    console.log('❌ JSON 内容无效:', error.message);
  }
}

async function showCurrentIssues() {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const lines = envContent.split('\n');

  console.log('\n🔍 当前 FIREBASE_SERVICE_ACCOUNT_KEY 问题分析');
  console.log('===========================================');

  const keyLine = lines.find(line => line.includes('FIREBASE_SERVICE_ACCOUNT_KEY'));

  if (keyLine) {
    const value = keyLine.split('=')[1];
    console.log(`原始值: ${value}`);

    // 分析问题
    const issues = [];

    if (!value.startsWith('"') || !value.endsWith('"')) {
      issues.push('❌ 未正确用双引号包围');
    }

    if (value.includes('\n')) {
      issues.push('❌ 包含未转义的换行符');
    }

    if (value.includes('"') && !value.includes('\\"')) {
      issues.push('❌ 包含未转义的双引号');
    }

    console.log('\n问题列表:');
    issues.forEach(issue => console.log(`  ${issue}`));

    console.log('\n💡 建议使用选项 1 或 2 来自动修复');
  } else {
    console.log('❌ 未找到 FIREBASE_SERVICE_ACCOUNT_KEY');
  }
}

async function updateEnvFile(jsonContent) {
  try {
    // 转义 JSON 内容以便在环境变量中使用
    const escapedJson = JSON.stringify(jsonContent);

    // 读取现有环境文件
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const lines = envContent.split('\n');

    // 查找并替换 FIREBASE_SERVICE_ACCOUNT_KEY 行
    let found = false;
    const newLines = lines.map((line) => {
      if (line.includes('FIREBASE_SERVICE_ACCOUNT_KEY')) {
        found = true;
        return `FIREBASE_SERVICE_ACCOUNT_KEY=${escapedJson}`;
      }
      return line;
    });

    // 如果没找到，添加新行
    if (!found) {
      newLines.push(`FIREBASE_SERVICE_ACCOUNT_KEY=${escapedJson}`);
    }

    // 备份原文件
    fs.writeFileSync('.env.local.backup', envContent);
    console.log('✅ 原文件已备份为 .env.local.backup');

    // 写入新文件
    fs.writeFileSync('.env.local', newLines.join('\n'));
    console.log('✅ .env.local 已更新');

    console.log('\n🎉 修复完成！');
    console.log('下一步:');
    console.log('1. 重启开发服务器: npm run dev');
    console.log('2. 测试修复: curl http://localhost:3000/api/debug/firebase-status');
  } catch (error) {
    console.log('❌ 更新环境文件失败:', error.message);
  }
}

main();
