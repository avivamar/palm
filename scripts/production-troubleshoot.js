#!/usr/bin/env node

/**
 * 生产环境故障排除脚本
 * 用于诊断和修复生产环境中的常见问题
 */

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

console.log('🔍 开始生产环境故障排除...\n');

// 检查环境变量
function checkEnvironmentVariables() {
  console.log('📋 检查环境变量...');

  const requiredVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missingVars = [];
  const presentVars = [];

  requiredVars.forEach((varName) => {
    if (process.env[varName]) {
      presentVars.push(varName);
    } else {
      missingVars.push(varName);
    }
  });

  console.log('✅ 已配置的环境变量:', presentVars);

  if (missingVars.length > 0) {
    console.log('❌ 缺失的环境变量:', missingVars);
    return false;
  }

  console.log('✅ 所有必需的环境变量都已配置\n');
  return true;
}

// 检查数据库连接
async function checkDatabaseConnection() {
  console.log('🗄️  检查数据库连接...');

  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL 未配置');
    return false;
  }

  try {
    // 尝试连接数据库
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    await pool.end();

    console.log('✅ 数据库连接成功');
    console.log('⏰ 数据库时间:', result.rows[0].now);
    return true;
  } catch (error) {
    console.log('❌ 数据库连接失败:', error.message);
    return false;
  }
}

// 检查数据库表
async function checkDatabaseTables() {
  console.log('\n📊 检查数据库表...');

  if (!process.env.DATABASE_URL) {
    console.log('⏭️  跳过表检查（DATABASE_URL 未配置）');
    return false;
  }

  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    const client = await pool.connect();

    // 检查表是否存在
    const tableCheckQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    const result = await client.query(tableCheckQuery);
    const tables = result.rows.map(row => row.table_name);

    const expectedTables = [
      'users',
      'preorders',
      'webhook_logs',
      'counter',
      'user_images',
    ];

    console.log('📋 现有表:', tables);

    const missingTables = expectedTables.filter(table => !tables.includes(table));

    if (missingTables.length > 0) {
      console.log('❌ 缺失的表:', missingTables);

      // 提供修复建议
      console.log('\n🔧 修复建议:');
      console.log('1. 在 Supabase Dashboard 中运行初始化脚本:');
      console.log('   scripts/init-production-database.sql');
      console.log('2. 或运行数据库迁移:');
      console.log('   npm run db:migrate');

      client.release();
      await pool.end();
      return false;
    }

    // 检查用户表数据
    const userCountResult = await client.query('SELECT COUNT(*) as count FROM users');
    const userCount = userCountResult.rows[0].count;

    console.log('✅ 所有必需的表都存在');
    console.log(`👥 用户数量: ${userCount}`);

    client.release();
    await pool.end();
    return true;
  } catch (error) {
    console.log('❌ 检查数据库表失败:', error.message);
    return false;
  }
}

// 检查 API 健康状态
async function checkAPIHealth() {
  console.log('\n🌐 检查 API 健康状态...');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${baseUrl}/api/webhook/health`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API 健康检查通过');
      console.log('📊 响应数据:', data);
      return true;
    } else {
      console.log('❌ API 健康检查失败:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ API 健康检查错误:', error.message);
    return false;
  }
}

// 生成诊断报告
function generateDiagnosticReport(results) {
  console.log('\n📋 诊断报告');
  console.log('='.repeat(50));

  const issues = [];
  const recommendations = [];

  if (!results.env) {
    issues.push('环境变量配置不完整');
    recommendations.push('配置所有必需的环境变量');
  }

  if (!results.dbConnection) {
    issues.push('数据库连接失败');
    recommendations.push('检查 DATABASE_URL 配置和网络连接');
  }

  if (!results.dbTables) {
    issues.push('数据库表缺失');
    recommendations.push('运行数据库初始化脚本');
  }

  if (!results.apiHealth) {
    issues.push('API 健康检查失败');
    recommendations.push('检查应用程序部署状态');
  }

  if (issues.length === 0) {
    console.log('🎉 所有检查都通过！系统状态良好。');
  } else {
    console.log('\n❌ 发现的问题:');
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });

    console.log('\n🔧 修复建议:');
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });

    console.log('\n📖 详细修复指南:');
    console.log('查看: docs/EMERGENCY-DATABASE-FIX.md');
  }
}

// 主函数
async function main() {
  const results = {
    env: false,
    dbConnection: false,
    dbTables: false,
    apiHealth: false,
  };

  try {
    results.env = checkEnvironmentVariables();

    if (results.env) {
      results.dbConnection = await checkDatabaseConnection();

      if (results.dbConnection) {
        results.dbTables = await checkDatabaseTables();
      }
    }

    // 总是检查 API 健康状态
    results.apiHealth = await checkAPIHealth();
  } catch (error) {
    console.error('❌ 故障排除过程中发生错误:', error);
  }

  generateDiagnosticReport(results);
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, checkEnvironmentVariables, checkDatabaseConnection, checkDatabaseTables };
