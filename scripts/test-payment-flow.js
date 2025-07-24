#!/usr/bin/env node

// Test the payment flow database connection
require('dotenv').config({ path: '.env.local' });

// Mock Next.js environment
global.window = undefined;
process.env.NODE_ENV = 'development';

async function testPaymentFlow() {
  console.log('🧪 Testing payment flow database connection...');

  try {
    // Import the actual database module
    const { getDB } = require('../src/libs/DB.ts');

    console.log('📡 Getting database instance...');
    const db = await getDB();

    console.log('✅ Database instance obtained');

    // Test creating a preorder (simulate the initiatePreorder function)
    console.log('🔄 Testing preorder creation...');

    const testData = {
      email: 'test@example.com',
      color: 'Red',
      priceId: 'price_test123',
      locale: 'en',
    };

    // Import the preorder actions
    const { initiatePreorder } = require('../src/app/actions/preorderActions.ts');

    console.log('📝 Creating test preorder...');

    // Create FormData for testing
    const formData = new FormData();
    formData.append('email', testData.email);
    formData.append('color', testData.color);
    formData.append('priceId', testData.priceId);
    formData.append('locale', testData.locale);

    const result = await initiatePreorder(formData);

    if (result.success) {
      console.log('✅ Preorder creation test successful:', result);
    } else {
      console.log('❌ Preorder creation test failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Payment flow test failed:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
}

if (require.main === module) {
  testPaymentFlow().then(() => {
    console.log('🎉 Test completed');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Test crashed:', error);
    process.exit(1);
  });
}

module.exports = { testPaymentFlow };
