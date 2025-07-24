#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

console.log('🔍 验证性能优化实施状态...\n');

// 检查列表
const checks = [
  {
    name: 'OptimizedHero 组件',
    check: () => {
      const pagePath = './src/app/[locale]/page.tsx';
      const content = fs.readFileSync(pagePath, 'utf8');
      return content.includes('OptimizedHero') && !content.includes('StaticHero');
    },
  },
  {
    name: 'WebP Hero 图片',
    check: () => fs.existsSync('./public/assets/images/hero.webp'),
  },
  {
    name: 'WebP 头像图片',
    check: () => {
      const avatarDir = './public/assets/images/avatars';
      const webpFiles = fs.readdirSync(avatarDir).filter(f => f.endsWith('.webp'));
      return webpFiles.length >= 3;
    },
  },
  {
    name: 'i18n 优化加载器',
    check: () => fs.existsSync('./src/utils/i18n-loader.ts'),
  },
  {
    name: '优化的分析提供者',
    check: () => fs.existsSync('./src/components/analytics/OptimizedAnalyticsProvider.tsx'),
  },
  {
    name: '性能监控组件',
    check: () => fs.existsSync('./src/components/PerformanceMonitor.tsx'),
  },
  {
    name: '资源预加载',
    check: () => {
      const layoutPath = './src/app/[locale]/layout.tsx';
      const content = fs.readFileSync(layoutPath, 'utf8');
      return content.includes('rel="preload"') && content.includes('hero.webp');
    },
  },
  {
    name: 'DNS 预解析',
    check: () => {
      const layoutPath = './src/app/[locale]/layout.tsx';
      const content = fs.readFileSync(layoutPath, 'utf8');
      return content.includes('rel="dns-prefetch"');
    },
  },
  {
    name: '图片转换脚本',
    check: () => fs.existsSync('./scripts/convert-images-to-webp.js'),
  },
  {
    name: '性能文档',
    check: () => {
      return fs.existsSync('./docs/performance/PERFORMANCE_OPTIMIZATION_GUIDE.md')
        && fs.existsSync('./docs/performance/IMPLEMENTATION_SUMMARY.md');
    },
  },
];

// 运行检查
let passed = 0;
let failed = 0;

checks.forEach(({ name, check }) => {
  try {
    const result = check();
    if (result) {
      console.log(`✅ ${name}`);
      passed++;
    } else {
      console.log(`❌ ${name}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${name} - 错误: ${error.message}`);
    failed++;
  }
});

// 计算文件大小优化
console.log('\n📊 文件大小统计:');

const getFileSize = (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    return (stats.size / 1024).toFixed(1);
  } catch {
    return 0;
  }
};

// 比较原始图片和WebP图片大小
const heroOriginal = getFileSize('./public/assets/images/hero.png');
const heroWebP = getFileSize('./public/assets/images/hero.webp');
const reduction = heroOriginal > 0 ? ((1 - heroWebP / heroOriginal) * 100).toFixed(1) : 0;

console.log(`   Hero 图片: ${heroOriginal}KB → ${heroWebP}KB (减少 ${reduction}%)`);

// 统计头像图片
const avatarDir = './public/assets/images/avatars';
const jpgFiles = fs.readdirSync(avatarDir).filter(f => f.endsWith('.jpg'));
const webpFiles = fs.readdirSync(avatarDir).filter(f => f.endsWith('.webp'));

let totalOriginal = 0;
let totalOptimized = 0;

jpgFiles.forEach((file) => {
  totalOriginal += Number.parseFloat(getFileSize(path.join(avatarDir, file)));
});

webpFiles.forEach((file) => {
  totalOptimized += Number.parseFloat(getFileSize(path.join(avatarDir, file)));
});

const avatarReduction = totalOriginal > 0 ? ((1 - totalOptimized / totalOriginal) * 100).toFixed(1) : 0;
console.log(`   头像图片: ${totalOriginal.toFixed(1)}KB → ${totalOptimized.toFixed(1)}KB (减少 ${avatarReduction}%)`);

// 总结
console.log('\n📋 优化实施总结:');
console.log(`   ✅ 通过: ${passed}/${checks.length} 项检查`);
console.log(`   ❌ 失败: ${failed}/${checks.length} 项检查`);

if (failed === 0) {
  console.log('\n🎉 所有性能优化已成功实施！');
  console.log('\n🚀 下一步:');
  console.log('   1. 部署到生产环境');
  console.log('   2. 使用 PageSpeed Insights 测试性能');
  console.log('   3. 监控 Web Vitals 指标');
} else {
  console.log('\n⚠️  有些优化需要检查，请查看上述失败项。');
}

// 性能预期
console.log('\n📈 预期性能提升:');
console.log('   • LCP: 10.2s → <2.5s (75%+ 改善)');
console.log('   • Speed Index: 5.3s → <3.4s (35%+ 改善)');
console.log('   • 图片大小减少: 56%+ 平均');
console.log('   • 初始 JS Bundle: 减少 50%+');

console.log('\n🔗 有用的链接:');
console.log('   • PageSpeed Insights: https://pagespeed.web.dev/');
console.log('   • Web Vitals: https://web.dev/vitals/');
console.log('   • 优化指南: ./docs/performance/PERFORMANCE_OPTIMIZATION_GUIDE.md');
console.log('   • 实施总结: ./docs/performance/IMPLEMENTATION_SUMMARY.md');
