#!/usr/bin/env ts-node
/**
 * 简化版支付系统迁移助手
 * 用于立即开始迁移流程
 */

import { promises as fs } from 'fs';
import { join } from 'path';

interface MigrationStep {
  id: string;
  name: string;
  description: string;
  required: boolean;
  status: 'pending' | 'completed' | 'failed' | 'skipped';
}

class SimpleMigrationHelper {
  private steps: MigrationStep[] = [];
  private projectRoot: string;

  constructor() {
    // 找到项目根目录（包含package.json的目录）
    this.projectRoot = this.findProjectRoot();
    this.initializeSteps();
  }

  private findProjectRoot(): string {
    let currentDir = __dirname;
    while (currentDir !== '/') {
      try {
        const packageJsonPath = join(currentDir, 'package.json');
        if (require('fs').existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(require('fs').readFileSync(packageJsonPath, 'utf-8'));
          // 确保这是项目根目录（有workspaces）
          if (packageJson.workspaces || packageJson.name === 'deepknows-official') {
            return currentDir;
          }
        }
      } catch (error) {
        // 继续查找
      }
      currentDir = join(currentDir, '..');
    }
    return process.cwd(); // 默认使用当前目录
  }

  private initializeSteps() {
    this.steps = [
      {
        id: 'backup',
        name: '备份现有配置',
        description: '备份当前的支付相关配置和代码',
        required: true,
        status: 'pending',
      },
      {
        id: 'dependencies',
        name: '安装依赖',
        description: '安装多供应商支付系统所需的依赖',
        required: true,
        status: 'pending',
      },
      {
        id: 'env-setup',
        name: '环境变量设置',
        description: '设置多供应商环境变量配置',
        required: true,
        status: 'pending',
      },
      {
        id: 'validate-config',
        name: '验证配置',
        description: '验证环境变量和供应商配置是否正确',
        required: true,
        status: 'pending',
      },
      {
        id: 'test-providers',
        name: '测试供应商',
        description: '测试所有配置的支付供应商连接',
        required: true,
        status: 'pending',
      },
      {
        id: 'migrate-api',
        name: '迁移 API 路由',
        description: '将现有的支付 API 路由迁移到多供应商系统',
        required: false,
        status: 'pending',
      },
      {
        id: 'migrate-webhooks',
        name: '迁移 Webhook',
        description: '更新 Webhook 处理逻辑以支持多供应商',
        required: false,
        status: 'pending',
      },
      {
        id: 'setup-monitoring',
        name: '设置监控',
        description: '配置支付系统监控和分析',
        required: false,
        status: 'pending',
      },
      {
        id: 'create-examples',
        name: '创建示例代码',
        description: '生成适合项目的集成示例代码',
        required: false,
        status: 'pending',
      },
    ];
  }

  /**
   * 列出所有步骤
   */
  listSteps(): void {
    console.log('🎯 多供应商支付系统迁移步骤：');
    console.log('='.repeat(50));
    console.log(`📁 项目根目录: ${this.projectRoot}`);
    console.log('');
    
    this.steps.forEach((step, index) => {
      const status = step.status === 'pending' ? '⏳' : 
                    step.status === 'completed' ? '✅' : 
                    step.status === 'failed' ? '❌' : '⏭️ ';
      const type = step.required ? '[必需]' : '[可选]';
      console.log(`${index + 1}. ${status} ${step.id} - ${step.name} ${type}`);
      console.log(`   ${step.description}`);
      console.log('');
    });

    console.log('🚀 下一步操作：');
    console.log('1. 运行 `npm run migrate:dry-run` 查看迁移计划');
    console.log('2. 运行 `npm run migrate:full` 执行完整迁移');
    console.log('3. 查看 packages/payments/examples/ 中的集成示例');
    console.log('4. 阅读 packages/payments/examples/migration-guide.md');
  }

  /**
   * 干运行模式
   */
  async dryRun(): Promise<void> {
    console.log('🧪 DRY RUN 模式 - 预览迁移计划');
    console.log('='.repeat(50));
    console.log(`📁 项目根目录: ${this.projectRoot}`);
    console.log('');

    console.log('📋 将要执行的操作：');
    
    // 模拟备份检查
    console.log('\n1. 📁 备份现有配置');
    await this.checkBackupTargets();

    // 模拟环境变量检查
    console.log('\n2. ⚙️  环境变量设置');
    await this.checkEnvironmentSetup();

    // 模拟API迁移检查
    console.log('\n3. 🔄 API 和 Webhook 迁移');
    await this.checkMigrationTargets();

    console.log('\n✅ 干运行完成！');
    console.log('');
    console.log('🚀 准备好执行实际迁移？运行：');
    console.log('   npm run migrate:full');
  }

  private async checkBackupTargets(): Promise<void> {
    const filesToCheck = [
      '.env.local',
      '.env',
      'app/api/create-payment-intent',
      'app/api/webhooks/stripe',
      'src/app/api/create-payment-intent',
      'src/app/api/webhooks/stripe',
    ];

    let existingFiles = 0;
    for (const file of filesToCheck) {
      const fullPath = join(this.projectRoot, file);
      try {
        await fs.access(fullPath);
        console.log(`   ✅ 找到: ${file}`);
        existingFiles++;
      } catch (error) {
        console.log(`   ⚪ 不存在: ${file}`);
      }
    }
    
    console.log(`   📊 总计: ${existingFiles} 个文件将被备份`);
  }

  private async checkEnvironmentSetup(): Promise<void> {
    const envLocalPath = join(this.projectRoot, '.env.local');
    try {
      await fs.access(envLocalPath);
      console.log('   ⚠️  .env.local 已存在 - 将提示手动合并');
    } catch (error) {
      console.log('   ✅ 将创建 .env.local 模板');
    }

    const examplePath = join(__dirname, '../.env.example');
    try {
      await fs.access(examplePath);
      console.log('   ✅ .env.example 模板可用');
    } catch (error) {
      console.log('   ⚠️  .env.example 模板未找到');
    }
  }

  private async checkMigrationTargets(): Promise<void> {
    const apiPaths = [
      'app/api/create-payment-intent/route.ts',
      'src/app/api/create-payment-intent/route.ts',
    ];

    const webhookPaths = [
      'app/api/webhooks/stripe/route.ts',
      'src/app/api/webhooks/stripe/route.ts',
    ];

    let apiCount = 0;
    let webhookCount = 0;

    for (const apiPath of apiPaths) {
      const fullPath = join(this.projectRoot, apiPath);
      try {
        await fs.access(fullPath);
        console.log(`   📄 API 路由: ${apiPath}`);
        apiCount++;
      } catch (error) {
        // 文件不存在
      }
    }

    for (const webhookPath of webhookPaths) {
      const fullPath = join(this.projectRoot, webhookPath);
      try {
        await fs.access(fullPath);
        console.log(`   🔗 Webhook: ${webhookPath}`);
        webhookCount++;
      } catch (error) {
        // 文件不存在
      }
    }

    console.log(`   📊 将迁移: ${apiCount} 个 API 路由, ${webhookCount} 个 Webhook`);
    
    if (apiCount === 0 && webhookCount === 0) {
      console.log('   💡 未找到现有支付代码 - 将创建新的集成示例');
    }
  }

  /**
   * 显示帮助信息
   */
  showHelp(): void {
    console.log('🚀 支付系统迁移助手');
    console.log('');
    console.log('用法:');
    console.log('  npm run migrate:list                    # 列出所有步骤');
    console.log('  npm run migrate:dry-run                 # 预览迁移计划');
    console.log('  npm run migrate:full                    # 执行完整迁移');
    console.log('');
    console.log('文档:');
    console.log('  packages/payments/examples/README.md           # 集成指南');
    console.log('  packages/payments/examples/migration-guide.md  # 详细迁移文档');
    console.log('  packages/payments/.env.example                 # 环境变量模板');
    console.log('');
    console.log('测试:');
    console.log('  npm run payments:validate               # 验证配置');
    console.log('  npm run payments:test                   # 测试供应商');
    console.log('');
    console.log('示例:');
    console.log('  # 查看迁移计划');
    console.log('  npm run migrate:dry-run');
    console.log('');
    console.log('  # 执行迁移');
    console.log('  npm run migrate:full');
  }
}

// ===== CLI 接口 =====

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const migrationHelper = new SimpleMigrationHelper();
  
  try {
    switch (command) {
      case 'list':
        migrationHelper.listSteps();
        break;
        
      case 'dry-run':
        await migrationHelper.dryRun();
        break;
        
      default:
        migrationHelper.showHelp();
        break;
    }
  } catch (error) {
    console.error('命令执行失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(console.error);
}

export { SimpleMigrationHelper };