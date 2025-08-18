#!/usr/bin/env tsx
/**
 * 相机解决方案测试脚本
 * 用于验证三种不同的相机实现方案
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs/promises'
import * as path from 'path'

const execAsync = promisify(exec)

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
}

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

async function checkFile(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function testCameraSolutions() {
  log('\n📸 相机解决方案测试工具', colors.bright + colors.cyan)
  log('=' .repeat(50))
  
  // 1. 检查文件存在性
  log('\n1️⃣ 检查相机组件文件...', colors.yellow)
  
  const components = [
    {
      name: 'Step13CaptureSimple (简化版)',
      path: 'src/components/palm/steps/Step13CaptureSimple.tsx',
      description: '基于stable版本策略，仅测试权限'
    },
    {
      name: 'Step13CaptureOptimized (优化版)',
      path: 'src/components/palm/steps/Step13CaptureOptimized.tsx',
      description: '完整优化流程，渐变按钮'
    },
    {
      name: 'CameraOverlayOptimized (优化蒙版)',
      path: 'src/components/palm/CameraOverlayOptimized.tsx',
      description: '简洁白色轮廓，倒计时功能'
    },
    {
      name: 'palmValidationSimple (验证工具)',
      path: 'src/utils/palmValidationSimple.ts',
      description: '图片质量验证'
    }
  ]
  
  for (const comp of components) {
    const exists = await checkFile(comp.path)
    if (exists) {
      log(`  ✅ ${comp.name}`, colors.green)
      log(`     ${comp.description}`, colors.reset)
    } else {
      log(`  ❌ ${comp.name} - 文件不存在`, colors.red)
    }
  }
  
  // 2. TypeScript 类型检查
  log('\n2️⃣ 运行 TypeScript 类型检查...', colors.yellow)
  
  try {
    const { stdout, stderr } = await execAsync('npx tsc --noEmit')
    if (stderr) {
      log('  ⚠️ TypeScript 警告:', colors.yellow)
      console.log(stderr)
    } else {
      log('  ✅ TypeScript 类型检查通过', colors.green)
    }
  } catch (error: any) {
    log('  ❌ TypeScript 类型错误:', colors.red)
    console.log(error.stdout || error.message)
  }
  
  // 3. 构建测试
  log('\n3️⃣ 测试构建...', colors.yellow)
  
  try {
    log('  正在构建项目...', colors.cyan)
    const { stdout } = await execAsync('npm run build', { 
      env: { ...process.env, CI: 'true' }
    })
    
    // 检查构建输出
    if (stdout.includes('Compiled successfully')) {
      log('  ✅ 构建成功', colors.green)
    } else if (stdout.includes('warn')) {
      log('  ⚠️ 构建成功但有警告', colors.yellow)
    }
  } catch (error: any) {
    log('  ❌ 构建失败:', colors.red)
    console.log(error.stdout || error.message)
  }
  
  // 4. 相机功能对比
  log('\n4️⃣ 相机实现方案对比', colors.yellow)
  log('=' .repeat(50))
  
  const comparison = `
┌─────────────────────┬───────────────────────────────────────┐
│ 方案                │ 特点                                  │
├─────────────────────┼───────────────────────────────────────┤
│ Simple 简化版       │ • 权限测试后立即释放流                │
│                     │ • 无视频预览                          │
│                     │ • 最稳定，兼容性最好                  │
│                     │ • 适合权限问题场景                    │
├─────────────────────┼───────────────────────────────────────┤
│ Optimized 优化版    │ • 完整相机流程                        │
│                     │ • 白色手掌轮廓引导                    │
│                     │ • 3-2-1倒计时                         │
│                     │ • 最佳用户体验                        │
├─────────────────────┼───────────────────────────────────────┤
│ Original 原版       │ • MediaPipe集成                       │
│                     │ • 实时手部检测                        │
│                     │ • 功能最完整                          │
│                     │ • 可能有加载问题                      │
└─────────────────────┴───────────────────────────────────────┘
`
  console.log(comparison)
  
  // 5. 推荐策略
  log('5️⃣ 推荐部署策略', colors.bright + colors.green)
  log('=' .repeat(50))
  
  log('\n建议采用渐进式部署:', colors.cyan)
  log('  1. 先部署 Simple 版本验证基础功能', colors.reset)
  log('  2. 功能正常后升级到 Optimized 版本', colors.reset)
  log('  3. 根据用户反馈决定是否使用 Original 版本', colors.reset)
  
  log('\n环境变量检查:', colors.cyan)
  log(`  NODE_ENV: ${process.env.NODE_ENV || 'development'}`, colors.reset)
  log(`  NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL || '未设置'}`, colors.reset)
  
  // 6. 快速切换指南
  log('\n6️⃣ 快速切换指南', colors.yellow)
  log('=' .repeat(50))
  
  log('\n在 Step13Capture.tsx 中切换实现:', colors.cyan)
  log(`  // 方案1: 简化版 (最稳定)
  import Step13CaptureSimple from './Step13CaptureSimple'
  
  // 方案2: 优化版 (推荐)
  import Step13CaptureOptimized from './Step13CaptureOptimized'
  
  // 方案3: 原版 (功能最全)
  // 保持现有代码`, colors.reset)
  
  log('\n✨ 测试完成!', colors.bright + colors.green)
}

// 运行测试
testCameraSolutions().catch(error => {
  log(`\n❌ 测试失败: ${error.message}`, colors.red)
  process.exit(1)
})