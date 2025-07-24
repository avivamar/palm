#!/usr/bin/env node

/**
 * Quick validation script to check if AI Core integration is working
 */

console.log('🔍 AI Core Build Validation\n');

async function validateAICore() {
  try {
    // Test 1: Check if AI Actions can be imported
    console.log('📋 Testing Server Actions import...');
    const { handleAIChat, checkAIHealth } = require('../src/app/actions/aiActions');
    
    if (typeof handleAIChat === 'function') {
      console.log('✅ handleAIChat function imported successfully');
    } else {
      console.log('❌ handleAIChat import failed');
    }

    if (typeof checkAIHealth === 'function') {
      console.log('✅ checkAIHealth function imported successfully');
    } else {
      console.log('❌ checkAIHealth import failed');
    }

    // Test 2: Check environment configuration
    console.log('\n🔐 Testing environment configuration...');
    const { isFeatureAvailable } = require('../src/libs/Env');
    
    const aiFeatures = ['ai-core', 'ai-openai', 'ai-claude', 'ai-gemini'];
    let featuresConfigured = 0;
    
    for (const feature of aiFeatures) {
      if (isFeatureAvailable(feature)) {
        console.log(`✅ ${feature} is configured`);
        featuresConfigured++;
      } else {
        console.log(`⚠️  ${feature} is not configured (missing API key)`);
      }
    }

    console.log(`\n📊 Summary: ${featuresConfigured}/${aiFeatures.length} AI features configured`);
    
    if (featuresConfigured > 0) {
      console.log('✅ AI Core integration is working!');
      return true;
    } else {
      console.log('⚠️  AI Core needs API key configuration');
      return false;
    }
    
  } catch (error) {
    console.error('❌ AI Core validation failed:', error.message);
    return false;
  }
}

validateAICore()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Validation error:', error);
    process.exit(1);
  });