#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('node:fs').promises;
const path = require('node:path');

// 配置
const IMAGE_CONFIGS = {
  hero: {
    input: './public/assets/images/hero.png',
    output: './public/assets/images/hero.webp',
    quality: 75,
    resize: { width: 1920, height: 1080, fit: 'cover' },
  },
  avatars: {
    inputDir: './public/assets/images/avatars',
    quality: 80,
    resize: { width: 96, height: 96, fit: 'cover' },
  },
};

// 转换单个图片
async function convertImage(inputPath, outputPath, options = {}) {
  try {
    const { quality = 80, resize } = options;

    let pipeline = sharp(inputPath);

    if (resize) {
      pipeline = pipeline.resize(resize);
    }

    await pipeline
      .webp({ quality })
      .toFile(outputPath);

    const stats = await fs.stat(inputPath);
    const newStats = await fs.stat(outputPath);
    const reduction = ((1 - newStats.size / stats.size) * 100).toFixed(1);

    console.log(`✅ ${path.basename(inputPath)} → ${path.basename(outputPath)}`);
    console.log(`   原始大小: ${(stats.size / 1024).toFixed(1)}KB`);
    console.log(`   新大小: ${(newStats.size / 1024).toFixed(1)}KB`);
    console.log(`   减少: ${reduction}%\n`);

    return { original: stats.size, optimized: newStats.size };
  } catch (error) {
    console.error(`❌ 转换失败 ${inputPath}:`, error.message);
    return null;
  }
}

// 生成模糊占位符
async function generateBlurPlaceholder(inputPath) {
  try {
    const buffer = await sharp(inputPath)
      .resize(10, 10, { fit: 'cover' })
      .blur(2)
      .jpeg({ quality: 50 })
      .toBuffer();

    const base64 = `data:image/jpeg;base64,${buffer.toString('base64')}`;
    console.log(`📸 模糊占位符 (${path.basename(inputPath)}):`);
    console.log(`   ${base64.substring(0, 100)}...\n`);

    return base64;
  } catch (error) {
    console.error(`❌ 生成占位符失败:`, error.message);
    return null;
  }
}

// 主函数
async function main() {
  console.log('🖼️  开始转换图片为 WebP 格式...\n');

  let totalOriginal = 0;
  let totalOptimized = 0;

  // 转换 Hero 图片
  console.log('📸 转换 Hero 图片...');
  const heroResult = await convertImage(
    IMAGE_CONFIGS.hero.input,
    IMAGE_CONFIGS.hero.output,
    {
      quality: IMAGE_CONFIGS.hero.quality,
      resize: IMAGE_CONFIGS.hero.resize,
    },
  );

  if (heroResult) {
    totalOriginal += heroResult.original;
    totalOptimized += heroResult.optimized;

    // 生成 Hero 图片的模糊占位符
    await generateBlurPlaceholder(IMAGE_CONFIGS.hero.output);
  }

  // 转换头像图片
  console.log('👥 转换头像图片...');
  const avatarDir = IMAGE_CONFIGS.avatars.inputDir;
  const files = await fs.readdir(avatarDir);
  const jpgFiles = files.filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg'));

  for (const file of jpgFiles) {
    const inputPath = path.join(avatarDir, file);
    const outputPath = path.join(avatarDir, file.replace(/\.(jpg|jpeg)$/i, '.webp'));

    const result = await convertImage(inputPath, outputPath, {
      quality: IMAGE_CONFIGS.avatars.quality,
      resize: IMAGE_CONFIGS.avatars.resize,
    });

    if (result) {
      totalOriginal += result.original;
      totalOptimized += result.optimized;
    }
  }

  // 总结
  console.log('\n📊 转换完成！');
  console.log(`   原始总大小: ${(totalOriginal / 1024 / 1024).toFixed(2)}MB`);
  console.log(`   优化后总大小: ${(totalOptimized / 1024 / 1024).toFixed(2)}MB`);
  console.log(`   总体减少: ${((1 - totalOptimized / totalOriginal) * 100).toFixed(1)}%`);

  // 更新建议
  console.log('\n💡 下一步:');
  console.log('1. 更新组件中的图片引用:');
  console.log('   - hero.png → hero.webp');
  console.log('   - avatar*.jpg → avatar*.webp');
  console.log('2. 添加 <link rel="preload" href="/assets/images/hero.webp" as="image" />');
  console.log('3. 测试图片加载性能');
}

// 检查 sharp 是否安装
async function checkDependencies() {
  try {
    require.resolve('sharp');
    return true;
  } catch {
    console.log('📦 正在安装 sharp...');
    const { execSync } = require('node:child_process');
    execSync('npm install --save-dev sharp', { stdio: 'inherit' });
    return true;
  }
}

// 运行
(async () => {
  try {
    await checkDependencies();
    await main();
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
})();
