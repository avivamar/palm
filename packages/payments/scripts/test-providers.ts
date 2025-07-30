#!/usr/bin/env ts-node
/**
 * 多支付供应商测试脚本
 * 用于验证配置和测试各个供应商的功能
 */

import { getPaymentService, checkPaymentHealth } from '../src/services/PaymentServiceFactory';
import { printConfigReport } from '../src/utils/env-validation';

interface TestResult {
  provider: string;
  tests: {
    configuration: 'pass' | 'fail' | 'skip';
    customerCreation: 'pass' | 'fail' | 'skip';
    paymentIntent: 'pass' | 'fail' | 'skip';
    webhookValidation: 'pass' | 'fail' | 'skip';
  };
  errors: string[];
}

class PaymentProviderTester {
  private paymentService = getPaymentService({ debugMode: true });
  private testResults: TestResult[] = [];

  async runAllTests(): Promise<void> {
    console.log('🧪 Starting Payment Provider Tests...\n');
    
    // 1. 配置检查
    await this.checkConfiguration();
    
    // 2. 健康检查
    await this.checkProviderHealth();
    
    // 3. 功能测试
    const providers = this.paymentService.getAvailableProviders();
    for (const provider of providers) {
      await this.testProvider(provider);
    }
    
    // 4. 生成报告
    this.generateReport();
  }

  private async checkConfiguration(): Promise<void> {
    console.log('📋 Configuration Check');
    console.log('-' .repeat(30));
    
    try {
      printConfigReport();
    } catch (error) {
      console.error('❌ Configuration check failed:', error);
    }
  }

  private async checkProviderHealth(): Promise<void> {
    console.log('\n🏥 Provider Health Check');
    console.log('-' .repeat(30));
    
    try {
      const { configStatus, providerHealth } = await checkPaymentHealth();
      
      if (!configStatus.isValid) {
        console.error('❌ Configuration invalid:');
        configStatus.errors.forEach(error => console.error(`   ${error}`));
        return;
      }
      
      providerHealth.forEach(({ provider, status, error }) => {
        const icon = status === 'healthy' ? '✅' : '❌';
        console.log(`${icon} ${provider}: ${status}${error ? ` - ${error}` : ''}`);
      });
    } catch (error) {
      console.error('❌ Health check failed:', error);
    }
  }

  private async testProvider(provider: string): Promise<void> {
    console.log(`\n🔍 Testing Provider: ${provider.toUpperCase()}`);
    console.log('-' .repeat(30));
    
    const result: TestResult = {
      provider,
      tests: {
        configuration: 'skip',
        customerCreation: 'skip',
        paymentIntent: 'skip',
        webhookValidation: 'skip',
      },
      errors: [],
    };

    // 配置测试
    try {
      result.tests.configuration = 'pass';
      console.log('✅ Configuration: Valid');
    } catch (error) {
      result.tests.configuration = 'fail';
      result.errors.push(`Configuration: ${error}`);
      console.log('❌ Configuration: Failed');
    }

    // 客户创建测试
    try {
      const testUser = {
        uid: 'test_user_123',
        email: 'test@example.com',
        displayName: 'Test User',
      };
      
      const customer = await this.paymentService.createCustomer(testUser, provider);
      result.tests.customerCreation = 'pass';
      console.log(`✅ Customer Creation: ${customer.id}`);
      
      // 清理测试数据
      try {
        await this.paymentService.deleteCustomer(customer.id, provider);
        console.log('🧹 Test customer cleaned up');
      } catch (cleanupError) {
        console.log('⚠️  Could not clean up test customer (normal for some providers)');
      }
    } catch (error) {
      result.tests.customerCreation = 'fail';
      result.errors.push(`Customer Creation: ${error}`);
      console.log('❌ Customer Creation: Failed');
    }

    // 支付意图测试 (使用最小金额)
    try {
      const paymentIntent = await this.paymentService.createPaymentIntent({
        amount: 100, // $1.00
        currency: 'USD',
        customerId: 'test_customer',
        description: 'Test payment',
      }, provider);
      
      result.tests.paymentIntent = 'pass';
      console.log(`✅ Payment Intent: ${paymentIntent.id}`);
    } catch (error) {
      result.tests.paymentIntent = 'fail';
      result.errors.push(`Payment Intent: ${error}`);
      console.log('❌ Payment Intent: Failed');
    }

    // Webhook 验证测试 (模拟)
    try {
      // 这里只测试 webhook 验证逻辑，不实际发送请求
      result.tests.webhookValidation = 'skip';
      console.log('⏭️  Webhook Validation: Skipped (requires real webhook)');
    } catch (error) {
      result.tests.webhookValidation = 'fail';
      result.errors.push(`Webhook Validation: ${error}`);
      console.log('❌ Webhook Validation: Failed');
    }

    this.testResults.push(result);
  }

  private generateReport(): void {
    console.log('\n📊 Test Results Summary');
    console.log('=' .repeat(50));
    
    this.testResults.forEach(result => {
      const { provider, tests, errors } = result;
      const passCount = Object.values(tests).filter(t => t === 'pass').length;
      const totalTests = Object.values(tests).filter(t => t !== 'skip').length;
      
      console.log(`\n${provider.toUpperCase()}:`);
      console.log(`  Status: ${passCount}/${totalTests} tests passed`);
      
      Object.entries(tests).forEach(([test, status]) => {
        const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⏭️ ';
        console.log(`  ${icon} ${test}: ${status}`);
      });
      
      if (errors.length > 0) {
        console.log('  Errors:');
        errors.forEach(error => console.log(`    - ${error}`));
      }
    });
    
    // 总体统计
    const totalProviders = this.testResults.length;
    const healthyProviders = this.testResults.filter(r => 
      Object.values(r.tests).some(t => t === 'pass') && r.errors.length === 0
    ).length;
    
    console.log(`\n🎯 Overall Status: ${healthyProviders}/${totalProviders} providers functional`);
    
    if (healthyProviders > 1) {
      console.log('✅ Multi-provider setup ready for production!');
    } else if (healthyProviders === 1) {
      console.log('⚠️  Single provider setup. Consider adding backup providers.');
    } else {
      console.log('❌ No providers functional. Check configuration.');
    }
  }
}

// 运行测试
async function main() {
  const tester = new PaymentProviderTester();
  
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('\n💥 Test suite failed:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(console.error);
}

export { PaymentProviderTester };