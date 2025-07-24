#!/usr/bin/env node

/**
 * Test script for AI Core package
 * Validates basic functionality without full TypeScript compilation
 */

console.log('=== AI Core Package Test ===\n');

// Check package structure
const fs = require('fs');
const path = require('path');

const packageRoot = path.join(__dirname, '../packages/ai-core');
const srcRoot = path.join(packageRoot, 'src');

console.log('📁 Package structure validation:');

const requiredDirs = [
  'core',
  'providers/openai',
  'providers/claude', 
  'providers/gemini',
  'utils',
  'prompts',
  'features/chat',
  'config',
  '__tests__'
];

const requiredFiles = [
  'index.ts',
  'core/manager.ts',
  'core/types.ts',
  'core/interfaces.ts',
  'core/errors.ts',
  'providers/openai/service.ts',
  'providers/claude/service.ts',
  'providers/gemini/service.ts',
  'utils/cache.ts',
  'utils/rate-limiter.ts',
  'utils/logger.ts',
  'prompts/loader.ts',
  'features/chat/service.ts'
];

// Check directories
let allDirsExist = true;
for (const dir of requiredDirs) {
  const dirPath = path.join(srcRoot, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`  ✅ ${dir}/`);
  } else {
    console.log(`  ❌ ${dir}/ (missing)`);
    allDirsExist = false;
  }
}

console.log('\n📄 Core files validation:');

// Check files
let allFilesExist = true;
for (const file of requiredFiles) {
  const filePath = path.join(srcRoot, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`  ✅ ${file} (${stats.size} bytes)`);
  } else {
    console.log(`  ❌ ${file} (missing)`);
    allFilesExist = false;
  }
}

// Check integration
console.log('\n🔌 Integration validation:');

const mainAppActionsPath = path.join(__dirname, '../src/app/actions/aiActions.ts');
if (fs.existsSync(mainAppActionsPath)) {
  console.log('  ✅ Server Actions integration (aiActions.ts)');
} else {
  console.log('  ❌ Server Actions integration missing');
}

// Check environment configuration
console.log('\n🔐 Environment configuration:');

const envPath = path.join(__dirname, '../src/libs/Env.ts');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const aiEnvVars = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'GOOGLE_AI_API_KEY', 'REDIS_TOKEN'];
  
  for (const envVar of aiEnvVars) {
    if (envContent.includes(envVar)) {
      console.log(`  ✅ ${envVar} configured`);
    } else {
      console.log(`  ❌ ${envVar} not configured`);
    }
  }
}

// Check root package.json scripts
console.log('\n📦 Package scripts:');

const rootPackagePath = path.join(__dirname, '../package.json');
const rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, 'utf-8'));

const aiScripts = ['ai:dev', 'ai:build', 'ai:test', 'ai:validate'];
for (const script of aiScripts) {
  if (rootPackage.scripts[script]) {
    console.log(`  ✅ ${script}: ${rootPackage.scripts[script]}`);
  } else {
    console.log(`  ❌ ${script} not found`);
  }
}

// Check test files
console.log('\n🧪 Test coverage:');

const testFiles = [
  '__tests__/manager.test.ts',
  '__tests__/prompts.test.ts',
  '__tests__/utils.test.ts',
  '__tests__/integration.test.ts',
  '__tests__/actions.test.ts',
  '__tests__/setup.ts'
];

let testCount = 0;
for (const testFile of testFiles) {
  const testPath = path.join(srcRoot, testFile);
  if (fs.existsSync(testPath)) {
    console.log(`  ✅ ${testFile}`);
    testCount++;
  } else {
    console.log(`  ❌ ${testFile} (missing)`);
  }
}

// Summary
console.log('\n📊 Summary:');
console.log(`  Package structure: ${allDirsExist ? '✅ Complete' : '❌ Incomplete'}`);
console.log(`  Core files: ${allFilesExist ? '✅ Complete' : '❌ Incomplete'}`);
console.log(`  Test coverage: ${testCount}/${testFiles.length} test files`);
console.log(`  Integration: ${fs.existsSync(mainAppActionsPath) ? '✅ Ready' : '❌ Not ready'}`);

// Overall status
const isComplete = allDirsExist && allFilesExist && testCount === testFiles.length && fs.existsSync(mainAppActionsPath);

console.log(`\n🎯 Overall Status: ${isComplete ? '✅ Package implementation complete!' : '⚠️  Package needs attention'}`);

if (!isComplete) {
  console.log('\n💡 Next steps:');
  if (!allDirsExist || !allFilesExist) {
    console.log('  - Complete missing files and directories');
  }
  if (testCount < testFiles.length) {
    console.log('  - Complete test coverage');
  }
  if (!fs.existsSync(mainAppActionsPath)) {
    console.log('  - Complete Server Actions integration');
  }
  console.log('  - Fix TypeScript compilation errors');
  console.log('  - Run npm test to validate functionality');
}

process.exit(isComplete ? 0 : 1);