#!/usr/bin/env ts-node

/**
 * OpenAI Multi-Endpoint Test Script
 * 测试多endpoint配置和故障转移功能
 */

import { 
  OpenAIEnhancedService, 
  createOpenAIConfigFromEnv,
  createOpenAIMultiConfig,
  validateOpenAIConfig,
  type OpenAIEnhancedConfig 
} from '@rolitt/ai-core';

// 测试配置示例
const createTestConfig = (): OpenAIEnhancedConfig => {
  return createOpenAIMultiConfig('test-multi-openai', [
    {
      apiKey: process.env.OPENAI_API_KEY || 'sk-test-key-1',
      baseUrl: 'https://api.openai.com/v1',
      priority: 1,
      maxRPS: 100,
    },
    {
      apiKey: 'sk-test-proxy-key',
      baseUrl: 'https://proxy-api.example.com/v1',
      priority: 2,
      maxRPS: 50,
    },
  ], {
    model: 'gpt-4-turbo-preview',
    maxRetries: 3,
    backoffMs: 1000,
  });
};

async function testEnvironmentConfig() {
  console.log('🔍 测试环境变量配置...');
  
  const envConfig = createOpenAIConfigFromEnv();
  if (envConfig) {
    console.log(`✅ 从环境变量创建配置成功:`);
    console.log(`   - 名称: ${envConfig.name}`);
    console.log(`   - Endpoints: ${envConfig.endpoints.length}个`);
    
    const validation = validateOpenAIConfig(envConfig);
    if (validation.valid) {
      console.log(`✅ 配置验证通过`);
      if (validation.warnings.length > 0) {
        console.log(`⚠️  警告:`, validation.warnings);
      }
    } else {
      console.log(`❌ 配置验证失败:`, validation.errors);
    }
    
    return envConfig;
  } else {
    console.log('ℹ️  未找到环境变量配置，使用测试配置');
    return null;
  }
}

async function testConfigValidation() {
  console.log('\n🔍 测试配置验证...');
  
  const testConfig = createTestConfig();
  const validation = validateOpenAIConfig(testConfig);
  
  console.log(`配置验证结果: ${validation.valid ? '✅ 通过' : '❌ 失败'}`);
  if (validation.errors.length > 0) {
    console.log('错误:', validation.errors);
  }
  if (validation.warnings.length > 0) {
    console.log('警告:', validation.warnings);
  }
}

async function testServiceInitialization() {
  console.log('\n🔍 测试服务初始化...');
  
  const envConfig = await testEnvironmentConfig();
  const config = envConfig || createTestConfig();
  
  try {
    const service = new OpenAIEnhancedService();
    await service.initialize(config);
    
    console.log('✅ OpenAI Enhanced Service 初始化成功');
    
    const modelInfo = service.getModelInfo();
    console.log(`   - 模式: ${modelInfo.mode}`);
    console.log(`   - 模型: ${modelInfo.name}`);
    console.log(`   - 功能: ${modelInfo.capabilities.join(', ')}`);
    
    if (modelInfo.statistics) {
      console.log(`   - 统计信息:`, modelInfo.statistics);
    }
    
    return service;
  } catch (error) {
    console.error('❌ 服务初始化失败:', error);
    return null;
  }
}

async function testHealthCheck(service: OpenAIEnhancedService) {
  console.log('\n🔍 测试健康检查...');
  
  try {
    const isHealthy = await service.isHealthy();
    console.log(`整体健康状态: ${isHealthy ? '✅ 健康' : '❌ 不健康'}`);
    
    const detailedHealth = await service.getDetailedHealth();
    console.log(`健康endpoints: ${detailedHealth.healthy}/${detailedHealth.total}`);
    
    detailedHealth.endpoints.forEach((ep, index) => {
      const status = ep.healthy ? '✅' : '❌';
      const responseTime = ep.responseTime ? `${ep.responseTime}ms` : 'N/A';
      console.log(`   ${index + 1}. ${ep.url} ${status} (${responseTime})`);
      if (ep.error) {
        console.log(`      错误: ${ep.error}`);
      }
    });
  } catch (error) {
    console.error('❌ 健康检查失败:', error);
  }
}

async function testTextGeneration(service: OpenAIEnhancedService) {
  console.log('\n🔍 测试文本生成...');
  
  // 只有在有真实API密钥时才测试
  if (!process.env.OPENAI_API_KEY) {
    console.log('ℹ️  跳过文本生成测试 (需要OPENAI_API_KEY)');
    return;
  }
  
  try {
    console.log('发送测试请求...');
    const response = await service.generateResponse('Hello! This is a test message for multi-endpoint OpenAI integration.', {
      temperature: 0.7,
      maxTokens: 100,
    });
    
    console.log('✅ 文本生成成功:');
    console.log(`   - Provider: ${response.provider}`);
    console.log(`   - Model: ${response.model}`);
    console.log(`   - Content: ${response.content.substring(0, 100)}...`);
    console.log(`   - Usage: ${response.usage?.totalTokens} tokens`);
    console.log(`   - Cached: ${response.cached ? 'Yes' : 'No'}`);
    
    if (response.metadata?.endpointUsed) {
      console.log(`   - Endpoint Mode: ${response.metadata.endpointUsed}`);
    }
    
  } catch (error) {
    console.error('❌ 文本生成失败:', error);
  }
}

async function testFailover(_service: OpenAIEnhancedService) {
  console.log('\n🔍 测试故障转移机制...');
  
  // 这里只能进行模拟测试，因为我们不想真的让endpoint失败
  console.log('ℹ️  故障转移测试需要在实际使用中观察');
  console.log('   - 当主endpoint失败时，系统会自动切换到备用endpoint');
  console.log('   - 熔断器会在连续失败5次后临时禁用endpoint');
  console.log('   - 系统会定期尝试恢复不健康的endpoint');
}

async function main() {
  console.log('🚀 OpenAI Multi-Endpoint 功能测试');
  console.log('=====================================\n');
  
  // 1. 测试配置验证
  await testConfigValidation();
  
  // 2. 测试服务初始化
  const service = await testServiceInitialization();
  
  if (!service) {
    console.log('\n❌ 服务初始化失败，停止测试');
    process.exit(1);
  }
  
  // 3. 测试健康检查
  await testHealthCheck(service);
  
  // 4. 测试文本生成
  await testTextGeneration(service);
  
  // 5. 测试故障转移
  await testFailover(service);
  
  console.log('\n🎉 测试完成!');
  console.log('\n📖 使用说明:');
  console.log('1. 复制 .env.multi-endpoint.example 为 .env.local');
  console.log('2. 填写真实的API密钥');
  console.log('3. 运行 npm run ai:test-multi 进行完整测试');
  console.log('\n📚 更多信息请查看: packages/ai-core/README-multi-endpoint.md');
}

// 运行测试
if (require.main === module) {
  main().catch(console.error);
}

export { main as testMultiEndpoint };