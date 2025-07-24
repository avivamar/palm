#!/usr/bin/env node

/**
 * Environment Variables Checker
 * 检查所有必要的环境变量是否正确配置
 */

// 智能环境变量加载
function loadEnvironmentVariables() {
  // 检测运行环境
  const isProduction = process.env.NODE_ENV === 'production';
  const isVercel = process.env.VERCEL === '1';
  const isCI = process.env.CI === 'true';

  if (isProduction || isVercel || isCI) {
    console.log('🌐 生产/CI 环境模式，使用系统环境变量\n');
    return;
  }

  // 本地开发环境：尝试加载 .env.local
  try {
    const fs = require('node:fs');
    const path = require('node:path');
    const envLocalPath = path.join(process.cwd(), '.env.local');

    if (fs.existsSync(envLocalPath)) {
      try {
        require('dotenv').config({ path: envLocalPath });
        console.log('📁 已加载本地环境变量文件: .env.local\n');
      } catch (dotenvError) {
        console.log('⚠️  dotenv 包不可用，请确保已安装: npm install dotenv\n');
        console.log('💡 或者使用: npm run check-env:local\n');
      }
    } else {
      console.log('⚠️  未找到 .env.local 文件，使用系统环境变量\n');
      console.log('💡 提示：复制 .env.example 到 .env.local 并配置环境变量\n');
    }
  } catch (error) {
    console.log('⚠️  无法访问文件系统，使用系统环境变量\n');
  }
}

// 加载环境变量
loadEnvironmentVariables();

const requiredEnvVars = {
  // Stripe 配置
  STRIPE_SECRET_KEY: {
    required: true,
    pattern: /^sk_/,
    description: 'Stripe 私钥，用于服务端支付处理',
  },
  STRIPE_WEBHOOK_SECRET: {
    required: true,
    pattern: /^whsec_/,
    description: 'Stripe Webhook 签名密钥',
  },
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
    required: true,
    pattern: /^pk_/,
    description: 'Stripe 公钥，用于客户端支付处理',
  },
  COLOR_PRICE_MAP_JSON: {
    required: true,
    pattern: /.+/,
    description: '产品颜色价格映射的JSON字符串',
  },

  // 应用配置
  NEXT_PUBLIC_APP_URL: {
    required: true,
    pattern: /^https?:\/\//,
    description: '应用的公开URL',
  },
  APP_URL: {
    required: false,
    pattern: /^https?:\/\//,
    description: '应用URL（后备）',
  },

  // Firebase 配置
  NEXT_PUBLIC_FIREBASE_API_KEY: {
    required: true,
    pattern: /.+/,
    description: 'Firebase API密钥',
  },
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: {
    required: true,
    pattern: /.+/,
    description: 'Firebase 认证域名',
  },
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: {
    required: true,
    pattern: /.+/,
    description: 'Firebase 项目ID',
  },
  NEXT_PUBLIC_FIREBASE_APP_ID: {
    required: true,
    pattern: /.+/,
    description: 'Firebase 应用ID',
  },

  // 数据库配置
  DATABASE_URL: {
    required: false,
    pattern: /^postgres(ql)?:\/\//,
    description: 'PostgreSQL 数据库连接字符串',
  },

  // Klaviyo 配置
  KLAVIYO_API_KEY: {
    required: false,
    pattern: /^pk_/,
    description: 'Klaviyo API 密钥',
  },
};

function checkEnvironmentVariables() {
  console.log('🔍 检查环境变量配置...\n');

  let hasErrors = false;
  let hasWarnings = false;

  for (const [varName, config] of Object.entries(requiredEnvVars)) {
    const value = process.env[varName];

    if (!value) {
      if (config.required) {
        console.log(`❌ ${varName}: 缺失 (必需)`);
        console.log(`   描述: ${config.description}\n`);
        hasErrors = true;
      } else {
        console.log(`⚠️  ${varName}: 缺失 (可选)`);
        console.log(`   描述: ${config.description}\n`);
        hasWarnings = true;
      }
      continue;
    }

    if (config.pattern && !config.pattern.test(value)) {
      console.log(`❌ ${varName}: 格式错误`);
      console.log(`   期望格式: ${config.pattern}`);
      console.log(`   当前值: ${value.substring(0, 20)}...`);
      console.log(`   描述: ${config.description}\n`);
      hasErrors = true;
      continue;
    }

    console.log(`✅ ${varName}: 已配置`);
  }

  // 特殊检查：COLOR_PRICE_MAP_JSON 是否为有效 JSON
  if (process.env.COLOR_PRICE_MAP_JSON) {
    try {
      JSON.parse(process.env.COLOR_PRICE_MAP_JSON);
      console.log(`✅ COLOR_PRICE_MAP_JSON: JSON 格式有效`);
    } catch (error) {
      console.log(`❌ COLOR_PRICE_MAP_JSON: JSON 格式无效`);
      console.log(`   错误: ${error.message}\n`);
      hasErrors = true;
    }
  }

  console.log('\n📊 检查结果:');

  if (hasErrors) {
    console.log('❌ 发现关键配置错误，需要修复后才能正常运行');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('⚠️  某些可选配置缺失，可能影响部分功能');
    process.exit(0);
  } else {
    console.log('✅ 所有环境变量配置正确！');
    process.exit(0);
  }
}

function showHelp() {
  console.log(`
环境变量检查工具

用法:
  npm run check-env        # 检查环境变量
  node scripts/check-env.js --help    # 显示帮助

必需的环境变量:
`);

  for (const [varName, config] of Object.entries(requiredEnvVars)) {
    if (config.required) {
      console.log(`  ${varName}: ${config.description}`);
    }
  }

  console.log(`
可选的环境变量:
`);

  for (const [varName, config] of Object.entries(requiredEnvVars)) {
    if (!config.required) {
      console.log(`  ${varName}: ${config.description}`);
    }
  }
}

// 解析命令行参数
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
} else {
  checkEnvironmentVariables();
}
