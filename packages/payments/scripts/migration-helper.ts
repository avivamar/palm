#!/usr/bin/env ts-node
/**
 * 支付系统迁移助手
 * 自动化迁移过程中的各种任务
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { printConfigReport } from '../src/utils/env-validation';
import { PaymentProviderTester } from './test-providers';

interface MigrationStep {
  id: string;
  name: string;
  description: string;
  required: boolean;
  status: 'pending' | 'completed' | 'failed' | 'skipped';
  action: () => Promise<void>;
}

class MigrationHelper {
  private steps: MigrationStep[] = [];
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    this.initializeSteps();
  }

  private initializeSteps() {
    this.steps = [
      {
        id: 'backup',
        name: '备份现有配置',
        description: '备份当前的支付相关配置和代码',
        required: true,
        status: 'pending',
        action: this.backupExistingConfig.bind(this),
      },
      {
        id: 'dependencies',
        name: '安装依赖',
        description: '安装多供应商支付系统所需的依赖',
        required: true,
        status: 'pending',
        action: this.installDependencies.bind(this),
      },
      {
        id: 'env-setup',
        name: '环境变量设置',
        description: '设置多供应商环境变量配置',
        required: true,
        status: 'pending',
        action: this.setupEnvironmentVariables.bind(this),
      },
      {
        id: 'validate-config',
        name: '验证配置',
        description: '验证环境变量和供应商配置是否正确',
        required: true,
        status: 'pending',
        action: this.validateConfiguration.bind(this),
      },
      {
        id: 'test-providers',
        name: '测试供应商',
        description: '测试所有配置的支付供应商连接',
        required: true,
        status: 'pending',
        action: this.testProviders.bind(this),
      },
      {
        id: 'migrate-api',
        name: '迁移 API 路由',
        description: '将现有的支付 API 路由迁移到多供应商系统',
        required: false,
        status: 'pending',
        action: this.migrateApiRoutes.bind(this),
      },
      {
        id: 'migrate-webhooks',
        name: '迁移 Webhook',
        description: '更新 Webhook 处理逻辑以支持多供应商',
        required: false,
        status: 'pending',
        action: this.migrateWebhooks.bind(this),
      },
      {
        id: 'setup-monitoring',
        name: '设置监控',
        description: '配置支付系统监控和分析',
        required: false,
        status: 'pending',
        action: this.setupMonitoring.bind(this),
      },
      {
        id: 'create-examples',
        name: '创建示例代码',
        description: '生成适合项目的集成示例代码',
        required: false,
        status: 'pending',
        action: this.createProjectExamples.bind(this),
      },
    ];
  }

  /**
   * 运行完整迁移流程
   */
  async runMigration(options: {
    interactive?: boolean;
    skipOptional?: boolean;
    dryRun?: boolean;
  } = {}): Promise<void> {
    const { interactive = true, skipOptional = false, dryRun = false } = options;

    console.log('🚀 开始支付系统迁移...');
    console.log('='.repeat(50));
    
    if (dryRun) {
      console.log('🧪 DRY RUN 模式 - 不会执行实际操作\n');
    }

    // 显示迁移计划
    this.showMigrationPlan();

    if (interactive) {
      const confirm = await this.promptUser('\n继续执行迁移吗? (y/N): ');
      if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
        console.log('迁移已取消');
        return;
      }
    }

    // 执行迁移步骤
    let completedSteps = 0;
    let failedSteps = 0;

    for (const step of this.steps) {
      if (skipOptional && !step.required) {
        step.status = 'skipped';
        console.log(`⏭️  跳过可选步骤: ${step.name}`);
        continue;
      }

      console.log(`\n🔄 执行: ${step.name}`);
      console.log(`   ${step.description}`);

      if (dryRun) {
        step.status = 'completed';
        console.log('   ✅ [DRY RUN] 模拟完成');
        completedSteps++;
        continue;
      }

      try {
        await step.action();
        step.status = 'completed';
        console.log(`   ✅ 完成: ${step.name}`);
        completedSteps++;
      } catch (error) {
        step.status = 'failed';
        console.error(`   ❌ 失败: ${step.name}`);
        console.error(`   错误: ${error}`);
        failedSteps++;

        if (step.required) {
          if (interactive) {
            const retry = await this.promptUser('   这是必需步骤，是否重试? (y/N): ');
            if (retry.toLowerCase() === 'y' || retry.toLowerCase() === 'yes') {
              try {
                await step.action();
                step.status = 'completed';
                console.log(`   ✅ 重试成功: ${step.name}`);
                completedSteps++;
                failedSteps--;
              } catch (retryError) {
                console.error(`   ❌ 重试仍然失败: ${retryError}`);
                break;
              }
            } else {
              break;
            }
          } else {
            break;
          }
        }
      }
    }

    // 显示迁移结果
    this.showMigrationResults(completedSteps, failedSteps);
  }

  /**
   * 显示迁移计划
   */
  private showMigrationPlan(): void {
    console.log('📋 迁移计划:');
    console.log('-'.repeat(30));
    
    this.steps.forEach((step, index) => {
      const icon = step.required ? '🔸' : '🔹';
      const type = step.required ? '必需' : '可选';
      console.log(`${index + 1}. ${icon} ${step.name} (${type})`);
      console.log(`   ${step.description}`);
    });
  }

  /**
   * 显示迁移结果
   */
  private showMigrationResults(completed: number, failed: number): void {
    console.log('\n' + '='.repeat(50));
    console.log('📊 迁移结果汇总');
    console.log('='.repeat(50));
    
    console.log(`✅ 完成步骤: ${completed}`);
    console.log(`❌ 失败步骤: ${failed}`);
    console.log(`⏭️  跳过步骤: ${this.steps.filter(s => s.status === 'skipped').length}`);
    
    const totalRequired = this.steps.filter(s => s.required).length;
    const completedRequired = this.steps.filter(s => s.required && s.status === 'completed').length;
    
    console.log(`\n必需步骤完成率: ${completedRequired}/${totalRequired}`);
    
    if (completedRequired === totalRequired) {
      console.log('\n🎉 迁移成功完成！');
      console.log('\n📚 接下来的步骤:');
      console.log('1. 运行 npm run payments:test 测试所有供应商');
      console.log('2. 在测试环境验证支付流程');
      console.log('3. 查看 packages/payments/examples/ 中的集成示例');
      console.log('4. 配置监控和告警系统');
    } else {
      console.log('\n⚠️  迁移未完全成功，请检查失败的必需步骤');
    }
  }

  // ===== 迁移步骤实现 =====

  private async backupExistingConfig(): Promise<void> {
    const backupDir = join(this.projectRoot, 'migration-backup');
    await fs.mkdir(backupDir, { recursive: true });
    
    const filesToBackup = [
      '.env.local',
      '.env',
      'app/api/create-payment-intent',
      'app/api/webhooks/stripe',
      'src/app/api/create-payment-intent',
      'src/app/api/webhooks/stripe',
    ];
    
    let backedUpFiles = 0;
    
    for (const file of filesToBackup) {
      const fullPath = join(this.projectRoot, file);
      try {
        await fs.access(fullPath);
        const backupPath = join(backupDir, file.replace(/[/\\]/g, '_'));
        await fs.cp(fullPath, backupPath, { recursive: true });
        backedUpFiles++;
      } catch (error) {
        // 文件不存在，跳过
      }
    }
    
    console.log(`   📁 已备份 ${backedUpFiles} 个文件到 ${backupDir}`);
  }

  private async installDependencies(): Promise<void> {
    console.log('   📦 检查依赖...');
    
    const packageJsonPath = join(this.projectRoot, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    
    const requiredDeps = {
      'zod': '^3.22.0',
    };
    
    const missingDeps: string[] = [];
    
    // 检查必需依赖
    for (const [dep, version] of Object.entries(requiredDeps)) {
      if (!packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]) {
        missingDeps.push(`${dep}@${version}`);
      }
    }
    
    if (missingDeps.length > 0) {
      console.log(`   📦 安装缺失依赖: ${missingDeps.join(', ')}`);
      execSync(`npm install ${missingDeps.join(' ')}`, { 
        stdio: 'inherit',
        cwd: this.projectRoot,
      });
    } else {
      console.log('   ✅ 所有必需依赖已安装');
    }
  }

  private async setupEnvironmentVariables(): Promise<void> {
    const envExamplePath = join(__dirname, '../.env.example');
    const envLocalPath = join(this.projectRoot, '.env.local');
    
    try {
      await fs.access(envLocalPath);
      console.log('   ⚠️  .env.local 已存在，请手动合并环境变量');
      console.log('   📄 参考模板: packages/payments/.env.example');
    } catch (error) {
      // .env.local 不存在，复制模板
      await fs.copyFile(envExamplePath, envLocalPath);
      console.log('   📄 已创建 .env.local 模板');
      console.log('   ⚠️  请编辑 .env.local 并填入实际的 API 密钥');
    }
  }

  private async validateConfiguration(): Promise<void> {
    try {
      console.log('   🔍 验证环境变量配置...');
      printConfigReport();
    } catch (error) {
      throw new Error(`配置验证失败: ${error}`);
    }
  }

  private async testProviders(): Promise<void> {
    console.log('   🧪 测试所有支付供应商...');
    
    const tester = new PaymentProviderTester();
    try {
      await tester.runAllTests();
    } catch (error) {
      throw new Error(`供应商测试失败: ${error}`);
    }
  }

  private async migrateApiRoutes(): Promise<void> {
    const apiPaths = [
      'app/api/create-payment-intent',
      'src/app/api/create-payment-intent',
    ];
    
    let migratedRoutes = 0;
    
    for (const apiPath of apiPaths) {
      const fullPath = join(this.projectRoot, apiPath, 'route.ts');
      try {
        await fs.access(fullPath);
        await this.migrateApiRoute(fullPath);
        migratedRoutes++;
      } catch (error) {
        // 路由不存在，跳过
      }
    }
    
    if (migratedRoutes === 0) {
      console.log('   ⚠️  未找到需要迁移的 API 路由');
      console.log('   💡 请参考 packages/payments/examples/ 中的示例');
    } else {
      console.log(`   ✅ 已迁移 ${migratedRoutes} 个 API 路由`);
    }
  }

  private async migrateApiRoute(routePath: string): Promise<void> {
    const content = await fs.readFile(routePath, 'utf-8');
    
    // 检查是否已经迁移
    if (content.includes('@rolitt/payments')) {
      console.log(`   ⏭️  ${routePath} 已经迁移`);
      return;
    }
    
    // 创建迁移后的代码
    const migratedContent = this.generateMigratedApiRoute(content);
    
    // 备份原文件
    await fs.writeFile(`${routePath}.backup`, content);
    
    // 写入迁移后的代码
    await fs.writeFile(routePath, migratedContent);
    
    console.log(`   ✅ 已迁移 ${routePath}`);
    console.log(`   📄 原文件备份为 ${routePath}.backup`);
  }

  private generateMigratedApiRoute(_originalContent: string): string {
    return `// 自动迁移到多供应商支付系统
// 原代码备份在 .backup 文件中

import { NextRequest } from 'next/server';
import { getPaymentService } from '@rolitt/payments';
import { paymentAnalytics } from '@rolitt/payments';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, userId } = await request.json();
    
    // 验证输入
    if (!amount || !currency) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const paymentService = getPaymentService();
    
    // 向后兼容：默认使用 Stripe
    const paymentIntent = await paymentService.createPaymentIntent({
      amount,
      currency,
      customerId: userId || 'anonymous',
      description: 'Payment for order',
    }, 'stripe'); // 明确指定使用 Stripe 保持兼容性

    // 记录支付创建事件
    paymentAnalytics.recordEvent({
      provider: 'stripe',
      type: 'payment_created',
      amount,
      currency,
      customerId: userId,
    });

    return Response.json({
      success: true,
      clientSecret: paymentIntent.clientSecret,
      provider: 'stripe',
    });

  } catch (error) {
    console.error('Create payment intent failed:', error);
    
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// TODO: 迁移完成后，可以启用智能路由：
// 1. 在 .env.local 中设置 ENABLE_SMART_ROUTING=true
// 2. 将上面的 createPaymentIntent 调用改为 smartPaymentRouting
// 3. 参考 packages/payments/examples/ 中的完整示例
`;
  }

  private async migrateWebhooks(): Promise<void> {
    const webhookPaths = [
      'app/api/webhooks/stripe',
      'src/app/api/webhooks/stripe',
    ];
    
    let migratedWebhooks = 0;
    
    for (const webhookPath of webhookPaths) {
      const fullPath = join(this.projectRoot, webhookPath, 'route.ts');
      try {
        await fs.access(fullPath);
        await this.migrateWebhook(fullPath);
        migratedWebhooks++;
      } catch (error) {
        // Webhook 不存在，跳过
      }
    }
    
    if (migratedWebhooks === 0) {
      console.log('   ⚠️  未找到需要迁移的 Webhook');
      console.log('   💡 请参考 packages/payments/examples/ 中的示例');
    } else {
      console.log(`   ✅ 已迁移 ${migratedWebhooks} 个 Webhook`);
    }
  }

  private async migrateWebhook(webhookPath: string): Promise<void> {
    const content = await fs.readFile(webhookPath, 'utf-8');
    
    // 检查是否已经迁移
    if (content.includes('@rolitt/payments')) {
      console.log(`   ⏭️  ${webhookPath} 已经迁移`);
      return;
    }
    
    // 创建迁移后的代码
    const migratedContent = this.generateMigratedWebhook();
    
    // 备份原文件
    await fs.writeFile(`${webhookPath}.backup`, content);
    
    // 写入迁移后的代码
    await fs.writeFile(webhookPath, migratedContent);
    
    console.log(`   ✅ 已迁移 ${webhookPath}`);
    console.log(`   📄 原文件备份为 ${webhookPath}.backup`);
  }

  private generateMigratedWebhook(): string {
    return `// 自动迁移到多供应商支付系统
// 原代码备份在 .backup 文件中

import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { getPaymentService } from '@rolitt/payments';
import { paymentAnalytics } from '@rolitt/payments';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = headers();
  
  // 获取 webhook 签名（支持多个供应商）
  const signature = headersList.get('stripe-signature') ||
                   headersList.get('paddle-signature') ||
                   headersList.get('creem-signature');

  if (!signature) {
    console.error('No webhook signature found');
    return Response.json({ error: 'No signature' }, { status: 400 });
  }

  try {
    const paymentService = getPaymentService();
    const startTime = Date.now();
    
    // 验证并解析 webhook（自动检测供应商）
    const event = await paymentService.handleWebhook(body, signature);
    const processingTime = Date.now() - startTime;

    // 记录事件到分析系统
    paymentAnalytics.recordEvent({
      provider: event.provider,
      type: event.type as any,
      amount: event.data.amount,
      currency: event.data.currency,
      customerId: event.data.customerId,
      processingTime,
    });

    // 处理事件
    switch (event.type) {
      case 'payment_succeeded':
        await handlePaymentSuccess(event.data);
        break;
      
      case 'payment_failed':
        await handlePaymentFailure(event.data);
        break;
      
      default:
        console.log('Unhandled event type:', event.type);
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('Webhook processing failed:', error);
    
    return Response.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}

// TODO: 实现你的业务逻辑处理函数
async function handlePaymentSuccess(data: any) {
  console.log('Payment succeeded:', data);
  // 添加你的订单履约逻辑
}

async function handlePaymentFailure(data: any) {
  console.log('Payment failed:', data);
  // 添加你的失败处理逻辑
}
`;
  }

  private async setupMonitoring(): Promise<void> {
    const monitoringDir = join(this.projectRoot, 'src/components/monitoring');
    await fs.mkdir(monitoringDir, { recursive: true });
    
    // 创建监控组件
    const dashboardComponent = `'use client';

import { useEffect, useState } from 'react';
import { paymentAnalytics } from '@rolitt/payments';

export function PaymentMonitoringDashboard() {
  const [metrics, setMetrics] = useState([]);
  const [realTimeStats, setRealTimeStats] = useState(null);

  useEffect(() => {
    const updateStats = () => {
      setMetrics(paymentAnalytics.getAllMetrics());
      setRealTimeStats(paymentAnalytics.getRealTimeStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 30000); // 每30秒更新

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">支付系统监控</h2>
      
      {realTimeStats && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">实时统计</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold">{realTimeStats.recentEvents}</div>
              <div className="text-sm text-gray-600">过去1小时事件</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{realTimeStats.recentSuccessRate}%</div>
              <div className="text-sm text-gray-600">成功率</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{realTimeStats.avgProcessingTime}ms</div>
              <div className="text-sm text-gray-600">平均处理时间</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{realTimeStats.activeProviders.length}</div>
              <div className="text-sm text-gray-600">活跃供应商</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid gap-4">
        {metrics.map((metric: any) => (
          <div key={metric.provider} className="p-4 border rounded-lg">
            <h4 className="font-semibold text-lg">{metric.provider.toUpperCase()}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              <div>
                <div className="font-medium">{metric.totalTransactions}</div>
                <div className="text-sm text-gray-600">总交易</div>
              </div>
              <div>
                <div className="font-medium">{(metric.successRate * 100).toFixed(2)}%</div>
                <div className="text-sm text-gray-600">成功率</div>
              </div>
              <div>
                <div className="font-medium">$\{(metric.averageAmount / 100).toFixed(2)}</div>
                <div className="text-sm text-gray-600">平均金额</div>
              </div>
              <div>
                <div className="font-medium">{metric.averageProcessingTime.toFixed(0)}ms</div>
                <div className="text-sm text-gray-600">处理时间</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
    
    await fs.writeFile(
      join(monitoringDir, 'PaymentMonitoringDashboard.tsx'),
      dashboardComponent
    );
    
    console.log('   📊 已创建监控组件: src/components/monitoring/PaymentMonitoringDashboard.tsx');
  }

  private async createProjectExamples(): Promise<void> {
    const examplesDir = join(this.projectRoot, 'payment-examples');
    await fs.mkdir(examplesDir, { recursive: true });
    
    // 复制示例文件
    const sourceExamplesDir = join(__dirname, '../examples');
    await fs.cp(sourceExamplesDir, examplesDir, { recursive: true });
    
    console.log(`   📚 已创建项目示例: ${examplesDir}`);
  }

  // ===== 工具方法 =====
  
  private async promptUser(question: string): Promise<string> {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    
    return new Promise((resolve) => {
      rl.question(question, (answer: string) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }

  /**
   * 运行特定步骤
   */
  async runStep(stepId: string): Promise<void> {
    const step = this.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`未找到步骤: ${stepId}`);
    }
    
    console.log(`🔄 执行步骤: ${step.name}`);
    
    try {
      await step.action();
      step.status = 'completed';
      console.log(`✅ 完成: ${step.name}`);
    } catch (error) {
      step.status = 'failed';
      console.error(`❌ 失败: ${step.name}`);
      throw error;
    }
  }

  /**
   * 列出所有步骤
   */
  listSteps(): void {
    console.log('可用的迁移步骤:');
    this.steps.forEach(step => {
      const status = step.status === 'pending' ? '⏳' : 
                    step.status === 'completed' ? '✅' : 
                    step.status === 'failed' ? '❌' : '⏭️ ';
      const type = step.required ? '[必需]' : '[可选]';
      console.log(`  ${status} ${step.id} - ${step.name} ${type}`);
      console.log(`     ${step.description}`);
    });
  }
}

// ===== CLI 接口 =====

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const migrationHelper = new MigrationHelper();
  
  try {
    switch (command) {
      case 'list':
        migrationHelper.listSteps();
        break;
        
      case 'step':
        const stepId = args[1];
        if (!stepId) {
          console.error('请指定步骤 ID');
          process.exit(1);
        }
        await migrationHelper.runStep(stepId);
        break;
        
      case 'migrate':
        const options = {
          interactive: !args.includes('--no-interactive'),
          skipOptional: args.includes('--skip-optional'),
          dryRun: args.includes('--dry-run'),
        };
        await migrationHelper.runMigration(options);
        break;
        
      default:
        console.log('支付系统迁移助手');
        console.log('');
        console.log('用法:');
        console.log('  npm run migrate:payments list                    # 列出所有步骤');
        console.log('  npm run migrate:payments step <step-id>         # 运行特定步骤');
        console.log('  npm run migrate:payments migrate                # 运行完整迁移');
        console.log('  npm run migrate:payments migrate --dry-run      # 模拟迁移');
        console.log('  npm run migrate:payments migrate --skip-optional # 跳过可选步骤');
        console.log('');
        console.log('示例:');
        console.log('  npm run migrate:payments step backup');
        console.log('  npm run migrate:payments migrate --dry-run');
        break;
    }
  } catch (error) {
    console.error('迁移失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(console.error);
}

export { MigrationHelper };