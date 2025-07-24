# Task 011: 更新构建脚本

> **目标**：优化和标准化构建脚本，提供高效的开发和生产构建流程

---

## 📋 任务概述

**前置条件**：Task 001-010 已完成
**当前状态**：基础构建流程已验证，需要优化脚本
**目标状态**：完善的构建脚本体系，支持开发、测试、生产环境
**预计时间**：25 分钟
**风险等级**：低

---

## 🎯 执行步骤

### Step 1: 创建包构建脚本

**文件路径**：`scripts/build-packages.js`

```javascript
const { execSync, spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

class PackageBuilder {
  constructor(options = {}) {
    this.options = {
      parallel: true,
      watch: false,
      verbose: false,
      production: false,
      ...options
    };

    this.packagesDir = './packages';
    this.buildOrder = this.calculateBuildOrder();
  }

  calculateBuildOrder() {
    console.log('📊 计算构建顺序...');

    const packages = fs.readdirSync(this.packagesDir);
    const dependencyGraph = {};
    const packageInfo = {};

    // 构建依赖图
    packages.forEach((pkg) => {
      const packagePath = path.join(this.packagesDir, pkg);
      const packageJsonPath = path.join(packagePath, 'package.json');

      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const deps = packageJson.dependencies || {};

        packageInfo[pkg] = {
          name: packageJson.name,
          path: packagePath,
          dependencies: Object.keys(deps).filter(dep => dep.startsWith('@rolitt/'))
        };

        dependencyGraph[pkg] = packageInfo[pkg].dependencies
          .map(dep => dep.replace('@rolitt/', ''));
      }
    });

    // 拓扑排序
    const visited = new Set();
    const visiting = new Set();
    const result = [];

    function visit(pkg) {
      if (visiting.has(pkg)) {
        throw new Error(`循环依赖检测到: ${pkg}`);
      }

      if (visited.has(pkg)) {
        return;
      }

      visiting.add(pkg);

      const deps = dependencyGraph[pkg] || [];
      deps.forEach((dep) => {
        if (packageInfo[dep]) {
          visit(dep);
        }
      });

      visiting.delete(pkg);
      visited.add(pkg);
      result.push(pkg);
    }

    Object.keys(packageInfo).forEach((pkg) => {
      if (!visited.has(pkg)) {
        visit(pkg);
      }
    });

    console.log('🔗 构建顺序:', result.join(' → '));
    return result.map(pkg => packageInfo[pkg]);
  }

  async buildPackage(packageInfo) {
    const { name, path: packagePath } = packageInfo;

    console.log(`🔨 构建 ${name}...`);

    const startTime = Date.now();

    try {
      const command = this.options.watch ? 'npm run dev' : 'npm run build';
      const options = {
        cwd: packagePath,
        stdio: this.options.verbose ? 'inherit' : 'pipe'
      };

      if (this.options.watch) {
        // 监听模式使用 spawn
        const child = spawn('npm', ['run', 'dev'], {
          ...options,
          stdio: 'inherit'
        });

        return new Promise((resolve, reject) => {
          child.on('error', reject);
          // 监听模式不会自动结束
          setTimeout(() => resolve(), 2000);
        });
      } else {
        // 普通构建使用 execSync
        execSync(command, options);
      }

      const duration = Date.now() - startTime;
      console.log(`✅ ${name} 构建完成 (${duration}ms)`);

      return { success: true, duration, package: name };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ ${name} 构建失败 (${duration}ms)`);
      console.log(`错误: ${error.message}`);

      return { success: false, duration, package: name, error: error.message };
    }
  }

  async buildSequential() {
    console.log('🔄 顺序构建模式...');

    const results = [];

    for (const packageInfo of this.buildOrder) {
      const result = await this.buildPackage(packageInfo);
      results.push(result);

      if (!result.success && !this.options.continueOnError) {
        console.log('💥 构建失败，停止后续构建');
        break;
      }
    }

    return results;
  }

  async buildParallel() {
    console.log('⚡ 并行构建模式...');

    // 按层级分组并行构建
    const levels = [];
    const processed = new Set();

    while (processed.size < this.buildOrder.length) {
      const currentLevel = [];

      for (const packageInfo of this.buildOrder) {
        if (processed.has(packageInfo.name)) {
          continue;
        }

        // 检查依赖是否都已处理
        const canBuild = packageInfo.dependencies.every(dep =>
          processed.has(dep) || !this.buildOrder.find(p => p.name === dep)
        );

        if (canBuild) {
          currentLevel.push(packageInfo);
          processed.add(packageInfo.name);
        }
      }

      if (currentLevel.length === 0) {
        throw new Error('无法解析依赖关系，可能存在循环依赖');
      }

      levels.push(currentLevel);
    }

    console.log(`📊 构建层级: ${levels.length} 层`);
    levels.forEach((level, index) => {
      console.log(`  层级 ${index + 1}: ${level.map(p => p.name).join(', ')}`);
    });

    const allResults = [];

    for (const level of levels) {
      console.log(`\n🚀 构建层级: ${level.map(p => p.name).join(', ')}`);

      const promises = level.map(packageInfo => this.buildPackage(packageInfo));
      const results = await Promise.all(promises);

      allResults.push(...results);

      const failed = results.filter(r => !r.success);
      if (failed.length > 0 && !this.options.continueOnError) {
        console.log(`💥 层级构建失败: ${failed.map(f => f.package).join(', ')}`);
        break;
      }
    }

    return allResults;
  }

  async build() {
    console.log('🏗️  开始构建包...');
    console.log(`模式: ${this.options.parallel ? '并行' : '顺序'}`);
    console.log(`环境: ${this.options.production ? '生产' : '开发'}`);
    console.log(`监听: ${this.options.watch ? '是' : '否'}`);

    const startTime = Date.now();

    try {
      const results = this.options.parallel
        ? await this.buildParallel()
        : await this.buildSequential();

      const totalTime = Date.now() - startTime;

      // 输出构建结果
      console.log('\n📊 构建结果:');

      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      console.log(`  ✅ 成功: ${successful.length}`);
      console.log(`  ❌ 失败: ${failed.length}`);
      console.log(`  ⏱️  总时间: ${totalTime}ms`);

      if (successful.length > 0) {
        console.log('\n✅ 成功构建:');
        successful.forEach((r) => {
          console.log(`  📦 ${r.package} (${r.duration}ms)`);
        });
      }

      if (failed.length > 0) {
        console.log('\n❌ 失败构建:');
        failed.forEach((r) => {
          console.log(`  📦 ${r.package} (${r.duration}ms)`);
          console.log(`     错误: ${r.error}`);
        });
      }

      // 保存构建报告
      const report = {
        timestamp: new Date().toISOString(),
        options: this.options,
        totalTime,
        results,
        summary: {
          total: results.length,
          successful: successful.length,
          failed: failed.length,
          successRate: (successful.length / results.length) * 100
        }
      };

      fs.writeFileSync('./build-results.json', JSON.stringify(report, null, 2));
      console.log('\n📄 构建报告已保存到: build-results.json');

      return failed.length === 0;
    } catch (error) {
      console.log(`💥 构建过程出错: ${error.message}`);
      return false;
    }
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  args.forEach((arg) => {
    switch (arg) {
      case '--sequential':
        options.parallel = false;
        break;
      case '--watch':
        options.watch = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--production':
        options.production = true;
        break;
      case '--continue-on-error':
        options.continueOnError = true;
        break;
    }
  });

  return options;
}

if (require.main === module) {
  const options = parseArgs();
  const builder = new PackageBuilder(options);

  builder.build().then((success) => {
    process.exit(success ? 0 : 1);
  }).catch((error) => {
    console.error('构建失败:', error);
    process.exit(1);
  });
}

module.exports = { PackageBuilder };
```

### Step 2: 创建清理脚本

**文件路径**：`scripts/clean-packages.js`

```javascript
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

function cleanPackages(options = {}) {
  console.log('🧹 清理包构建产物...');

  const {
    deep = false,
    verbose = false,
    dryRun = false
  } = options;

  const packagesDir = './packages';
  const packages = fs.readdirSync(packagesDir);

  const cleanTargets = [
    'dist',
    '*.tsbuildinfo',
    'tsconfig.tsbuildinfo',
    '.turbo'
  ];

  if (deep) {
    cleanTargets.push(
      'node_modules',
      'package-lock.json',
      '.next',
      '.cache'
    );
  }

  let totalCleaned = 0;
  let totalSize = 0;

  packages.forEach((pkg) => {
    const packagePath = path.join(packagesDir, pkg);
    const packageJsonPath = path.join(packagePath, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      console.log(`\n📦 清理 ${pkg}...`);

      cleanTargets.forEach((target) => {
        const targetPath = path.join(packagePath, target);

        if (target.includes('*')) {
          // 处理通配符
          const dir = path.dirname(targetPath);
          const pattern = path.basename(target);

          if (fs.existsSync(dir)) {
            const files = fs.readdirSync(dir);
            const matchingFiles = files.filter((file) => {
              const regex = new RegExp(pattern.replace('*', '.*'));
              return regex.test(file);
            });

            matchingFiles.forEach((file) => {
              const filePath = path.join(dir, file);
              const size = getFileSize(filePath);

              if (verbose) {
                console.log(`  🗑️  ${file} (${formatSize(size)})`);
              }

              if (!dryRun) {
                fs.unlinkSync(filePath);
              }

              totalCleaned++;
              totalSize += size;
            });
          }
        } else {
          // 处理普通文件/目录
          if (fs.existsSync(targetPath)) {
            const size = getDirectorySize(targetPath);

            if (verbose) {
              console.log(`  🗑️  ${target} (${formatSize(size)})`);
            }

            if (!dryRun) {
              if (fs.statSync(targetPath).isDirectory()) {
                fs.rmSync(targetPath, { recursive: true, force: true });
              } else {
                fs.unlinkSync(targetPath);
              }
            }

            totalCleaned++;
            totalSize += size;
          }
        }
      });
    }
  });

  // 清理根目录
  console.log('\n🏠 清理根目录...');
  const rootCleanTargets = [
    'build-results.json',
    'build-report.json',
    'performance-report.json',
    'build-health.json',
    'diagnostic-report.json',
    '.turbo'
  ];

  if (deep) {
    rootCleanTargets.push(
      'node_modules',
      'package-lock.json',
      '.next'
    );
  }

  rootCleanTargets.forEach((target) => {
    if (fs.existsSync(target)) {
      const size = fs.statSync(target).isDirectory()
        ? getDirectorySize(target)
        : getFileSize(target);

      if (verbose) {
        console.log(`  🗑️  ${target} (${formatSize(size)})`);
      }

      if (!dryRun) {
        if (fs.statSync(target).isDirectory()) {
          fs.rmSync(target, { recursive: true, force: true });
        } else {
          fs.unlinkSync(target);
        }
      }

      totalCleaned++;
      totalSize += size;
    }
  });

  console.log('\n📊 清理总结:');
  console.log(`  🗑️  清理项目: ${totalCleaned}`);
  console.log(`  💾 释放空间: ${formatSize(totalSize)}`);

  if (dryRun) {
    console.log('\n🔍 这是预览模式，没有实际删除文件');
  }
}

function getFileSize(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
}

function getDirectorySize(dirPath) {
  try {
    let size = 0;
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        size += getDirectorySize(filePath);
      } else {
        size += stat.size;
      }
    });

    return size;
  } catch {
    return 0;
  }
}

function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  args.forEach((arg) => {
    switch (arg) {
      case '--deep':
        options.deep = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
    }
  });

  return options;
}

if (require.main === module) {
  const options = parseArgs();
  cleanPackages(options);
}

module.exports = { cleanPackages };
```

### Step 3: 创建开发服务器脚本

**文件路径**：`scripts/dev-server.js`

```javascript
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

class DevServer {
  constructor(options = {}) {
    this.options = {
      port: 3000,
      watchPackages: true,
      hotReload: true,
      verbose: false,
      ...options
    };

    this.processes = new Map();
    this.packagesDir = './packages';
  }

  async startPackageWatchers() {
    if (!this.options.watchPackages) {
      return;
    }

    console.log('👀 启动包监听器...');

    const packages = fs.readdirSync(this.packagesDir);

    packages.forEach((pkg) => {
      const packagePath = path.join(this.packagesDir, pkg);
      const packageJsonPath = path.join(packagePath, 'package.json');

      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        if (packageJson.scripts && packageJson.scripts.dev) {
          console.log(`  📦 启动 ${pkg} 监听器...`);

          const child = spawn('npm', ['run', 'dev'], {
            cwd: packagePath,
            stdio: this.options.verbose ? 'inherit' : 'pipe'
          });

          child.on('error', (error) => {
            console.log(`❌ ${pkg} 监听器错误: ${error.message}`);
          });

          child.on('exit', (code) => {
            if (code !== 0) {
              console.log(`⚠️  ${pkg} 监听器退出，代码: ${code}`);
            }
          });

          this.processes.set(`package-${pkg}`, child);
        }
      }
    });
  }

  async startNextServer() {
    console.log(`🚀 启动 Next.js 开发服务器 (端口 ${this.options.port})...`);

    const env = {
      ...process.env,
      PORT: this.options.port.toString()
    };

    if (this.options.hotReload) {
      env.FAST_REFRESH = 'true';
    }

    const child = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      env
    });

    child.on('error', (error) => {
      console.log(`❌ Next.js 服务器错误: ${error.message}`);
    });

    child.on('exit', (code) => {
      console.log(`🛑 Next.js 服务器退出，代码: ${code}`);
      this.stop();
    });

    this.processes.set('next-server', child);

    return new Promise((resolve) => {
      // 等待服务器启动
      setTimeout(() => {
        console.log(`\n🌐 开发服务器已启动:`);
        console.log(`   本地: http://localhost:${this.options.port}`);
        console.log(`   网络: http://0.0.0.0:${this.options.port}`);
        resolve();
      }, 3000);
    });
  }

  async start() {
    console.log('🏁 启动开发环境...');

    // 清理之前的构建产物
    console.log('🧹 清理构建产物...');
    const { cleanPackages } = require('./clean-packages');
    cleanPackages({ verbose: false });

    // 启动包监听器
    await this.startPackageWatchers();

    // 等待一下让包监听器启动
    if (this.options.watchPackages) {
      console.log('⏳ 等待包监听器启动...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // 启动 Next.js 服务器
    await this.startNextServer();

    // 设置优雅退出
    this.setupGracefulShutdown();
  }

  setupGracefulShutdown() {
    const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];

    signals.forEach((signal) => {
      process.on(signal, () => {
        console.log(`\n🛑 收到 ${signal} 信号，正在关闭...`);
        this.stop();
      });
    });
  }

  stop() {
    console.log('🛑 停止开发服务器...');

    this.processes.forEach((child, name) => {
      console.log(`  🔌 停止 ${name}...`);

      try {
        child.kill('SIGTERM');

        // 如果进程没有在 5 秒内退出，强制杀死
        setTimeout(() => {
          if (!child.killed) {
            child.kill('SIGKILL');
          }
        }, 5000);
      } catch (error) {
        console.log(`⚠️  停止 ${name} 时出错: ${error.message}`);
      }
    });

    this.processes.clear();

    setTimeout(() => {
      console.log('👋 开发服务器已停止');
      process.exit(0);
    }, 1000);
  }

  status() {
    console.log('📊 开发服务器状态:');

    if (this.processes.size === 0) {
      console.log('  🔴 未运行');
      return;
    }

    this.processes.forEach((child, name) => {
      const status = child.killed ? '🔴 已停止' : '🟢 运行中';
      console.log(`  ${status} ${name} (PID: ${child.pid})`);
    });
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  args.forEach((arg, index) => {
    switch (arg) {
      case '--port':
        options.port = Number.parseInt(args[index + 1]) || 3000;
        break;
      case '--no-watch':
        options.watchPackages = false;
        break;
      case '--no-hot-reload':
        options.hotReload = false;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--status':
        options.showStatus = true;
        break;
    }
  });

  return options;
}

if (require.main === module) {
  const options = parseArgs();
  const server = new DevServer(options);

  if (options.showStatus) {
    server.status();
  } else {
    server.start().catch((error) => {
      console.error('启动开发服务器失败:', error);
      process.exit(1);
    });
  }
}

module.exports = { DevServer };
```

### Step 4: 创建生产构建脚本

**文件路径**：`scripts/build-production.js`

```javascript
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

class ProductionBuilder {
  constructor(options = {}) {
    this.options = {
      skipTests: false,
      skipLint: false,
      skipAudit: false,
      optimize: true,
      verbose: false,
      ...options
    };
  }

  async build() {
    console.log('🏭 开始生产构建...');

    const steps = [
      { name: '环境检查', fn: () => this.checkEnvironment() },
      { name: '清理环境', fn: () => this.cleanEnvironment() },
      { name: '安装依赖', fn: () => this.installDependencies() },
      { name: '验证配置', fn: () => this.validateConfiguration() },
      { name: 'Lint 检查', fn: () => this.runLint(), skip: this.options.skipLint },
      { name: '类型检查', fn: () => this.typeCheck() },
      { name: '运行测试', fn: () => this.runTests(), skip: this.options.skipTests },
      { name: '安全审计', fn: () => this.securityAudit(), skip: this.options.skipAudit },
      { name: '构建包', fn: () => this.buildPackages() },
      { name: '构建应用', fn: () => this.buildApplication() },
      { name: '优化产物', fn: () => this.optimizeOutput(), skip: !this.options.optimize },
      { name: '生成报告', fn: () => this.generateReport() }
    ];

    const results = [];

    for (const step of steps) {
      if (step.skip) {
        console.log(`⏭️  跳过: ${step.name}`);
        continue;
      }

      console.log(`\n📋 ${step.name}...`);
      const startTime = Date.now();

      try {
        await step.fn();
        const duration = Date.now() - startTime;
        console.log(`✅ ${step.name} 完成 (${duration}ms)`);

        results.push({
          name: step.name,
          success: true,
          duration
        });
      } catch (error) {
        const duration = Date.now() - startTime;
        console.log(`❌ ${step.name} 失败 (${duration}ms)`);
        console.log(`错误: ${error.message}`);

        results.push({
          name: step.name,
          success: false,
          duration,
          error: error.message
        });

        throw error; // 停止构建
      }
    }

    return results;
  }

  checkEnvironment() {
    console.log('🔍 检查构建环境...');

    // 检查 Node.js 版本
    const nodeVersion = process.version;
    const majorVersion = Number.parseInt(nodeVersion.slice(1).split('.')[0]);

    if (majorVersion < 18) {
      throw new Error(`Node.js 版本过低: ${nodeVersion}，需要 >= 18`);
    }

    // 检查内存
    const totalMemory = require('node:os').totalmem();
    const freeMemory = require('node:os').freemem();
    const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;

    if (memoryUsage > 90) {
      console.log(`⚠️  内存使用率较高: ${memoryUsage.toFixed(1)}%`);
    }

    // 检查磁盘空间
    try {
      const stats = fs.statSync('.');
      console.log('✅ 环境检查通过');
    } catch (error) {
      throw new Error(`磁盘访问错误: ${error.message}`);
    }
  }

  cleanEnvironment() {
    console.log('🧹 清理构建环境...');

    const { cleanPackages } = require('./clean-packages');
    cleanPackages({ deep: true, verbose: this.options.verbose });
  }

  installDependencies() {
    console.log('📦 安装生产依赖...');

    const command = 'npm ci --only=production';
    execSync(command, { stdio: this.options.verbose ? 'inherit' : 'pipe' });
  }

  validateConfiguration() {
    console.log('⚙️  验证配置...');

    execSync('npm run validate:all', { stdio: 'pipe' });
  }

  runLint() {
    console.log('🔍 运行 Lint 检查...');

    try {
      execSync('npm run lint', { stdio: 'pipe' });
    } catch (error) {
      // Lint 错误不应该阻止构建，但应该记录
      console.log('⚠️  Lint 检查发现问题，但继续构建');
    }
  }

  typeCheck() {
    console.log('🔍 运行类型检查...');

    execSync('npm run type-check:strict', { stdio: 'pipe' });
  }

  runTests() {
    console.log('🧪 运行测试...');

    try {
      execSync('npm test', { stdio: this.options.verbose ? 'inherit' : 'pipe' });
    } catch (error) {
      throw new Error(`测试失败: ${error.message}`);
    }
  }

  securityAudit() {
    console.log('🔒 运行安全审计...');

    try {
      execSync('npm audit --audit-level=high', { stdio: 'pipe' });
    } catch (error) {
      console.log('⚠️  发现安全漏洞，请检查 npm audit 输出');
      // 不阻止构建，但记录警告
    }
  }

  buildPackages() {
    console.log('🔨 构建包...');

    const { PackageBuilder } = require('./build-packages');
    const builder = new PackageBuilder({
      parallel: true,
      production: true,
      verbose: this.options.verbose
    });

    return builder.build();
  }

  buildApplication() {
    console.log('🏗️  构建应用...');

    execSync('npm run build:next', { stdio: this.options.verbose ? 'inherit' : 'pipe' });
  }

  optimizeOutput() {
    console.log('⚡ 优化构建产物...');

    // 压缩静态资源
    if (fs.existsSync('.next')) {
      console.log('  📦 压缩静态资源...');
      // 这里可以添加额外的优化步骤
    }

    // 生成 bundle 分析
    if (fs.existsSync('.next/static')) {
      console.log('  📊 生成 bundle 分析...');
      // 可以集成 webpack-bundle-analyzer
    }
  }

  generateReport() {
    console.log('📄 生成构建报告...');

    const report = {
      timestamp: new Date().toISOString(),
      environment: {
        node: process.version,
        npm: execSync('npm --version', { encoding: 'utf8' }).trim(),
        platform: process.platform,
        arch: process.arch
      },
      options: this.options,
      buildInfo: {
        packages: this.getPackageInfo(),
        outputSize: this.getOutputSize()
      }
    };

    fs.writeFileSync('./production-build-report.json', JSON.stringify(report, null, 2));
    console.log('📄 构建报告已保存到: production-build-report.json');
  }

  getPackageInfo() {
    const packagesDir = './packages';
    const packages = fs.readdirSync(packagesDir);

    return packages.map((pkg) => {
      const packagePath = path.join(packagesDir, pkg);
      const packageJsonPath = path.join(packagePath, 'package.json');

      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        return {
          name: packageJson.name,
          version: packageJson.version,
          hasOutput: fs.existsSync(path.join(packagePath, 'dist'))
        };
      }

      return null;
    }).filter(Boolean);
  }

  getOutputSize() {
    const sizes = {};

    if (fs.existsSync('.next')) {
      sizes.next = this.getDirectorySize('.next');
    }

    const packagesDir = './packages';
    const packages = fs.readdirSync(packagesDir);

    packages.forEach((pkg) => {
      const distPath = path.join(packagesDir, pkg, 'dist');
      if (fs.existsSync(distPath)) {
        sizes[`package-${pkg}`] = this.getDirectorySize(distPath);
      }
    });

    return sizes;
  }

  getDirectorySize(dirPath) {
    let size = 0;

    try {
      const files = fs.readdirSync(dirPath);

      files.forEach((file) => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          size += this.getDirectorySize(filePath);
        } else {
          size += stat.size;
        }
      });
    } catch (error) {
      // 忽略访问错误
    }

    return size;
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  args.forEach((arg) => {
    switch (arg) {
      case '--skip-tests':
        options.skipTests = true;
        break;
      case '--skip-lint':
        options.skipLint = true;
        break;
      case '--skip-audit':
        options.skipAudit = true;
        break;
      case '--no-optimize':
        options.optimize = false;
        break;
      case '--verbose':
        options.verbose = true;
        break;
    }
  });

  return options;
}

if (require.main === module) {
  const options = parseArgs();
  const builder = new ProductionBuilder(options);

  builder.build()
    .then((results) => {
      console.log('\n🎉 生产构建完成！');

      const totalTime = results.reduce((sum, r) => sum + r.duration, 0);
      console.log(`⏱️  总构建时间: ${totalTime}ms`);

      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 生产构建失败:', error.message);
      process.exit(1);
    });
}

module.exports = { ProductionBuilder };
```

### Step 5: 更新 package.json 脚本

**更新根 package.json 的 scripts 部分**：

```json
{
  "scripts": {
    "build": "node scripts/build-packages.js",
    "build:packages": "node scripts/build-packages.js",
    "build:packages:watch": "node scripts/build-packages.js --watch",
    "build:packages:sequential": "node scripts/build-packages.js --sequential",
    "build:production": "node scripts/build-production.js",
    "build:tsc": "tsc --build",
    "build:next": "next build",
    "clean": "node scripts/clean-packages.js",
    "clean:deep": "node scripts/clean-packages.js --deep",
    "clean:packages": "node scripts/clean-packages.js",
    "dev": "node scripts/dev-server.js",
    "dev:next": "next dev",
    "dev:packages": "node scripts/build-packages.js --watch",
    "dev:verbose": "node scripts/dev-server.js --verbose",
    "start": "next start",
    "type-check": "tsc --noEmit --project tsconfig.dev.json",
    "type-check:packages": "tsc --build --dry",
    "type-check:strict": "tsc --noEmit --strict",
    "watch:packages": "tsc --build --watch",
    "validate:paths": "node scripts/validate-paths.js",
    "validate:references": "node scripts/validate-references.js",
    "validate:deps": "node scripts/validate-dependencies.js",
    "validate:build": "node scripts/validate-build.js",
    "validate:all": "npm run validate:paths && npm run validate:references && npm run validate:deps && npm run validate:build",
    "test:performance": "node scripts/performance-test.js",
    "ci:validate": "node scripts/ci-validation.js",
    "monitor:health": "node scripts/build-monitor.js",
    "diagnose": "node scripts/diagnose-issues.js",
    "health:check": "npm run diagnose && npm run monitor:health",
    "ci:full": "npm run diagnose && npm run ci:validate && npm run test:performance",
    "install:packages": "npm install",
    "update:deps": "npm update",
    "audit:packages": "npm audit",
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Step 6: 创建 Turbo 配置

**文件路径**：`turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [
    "**/.env.*local"
  ],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

---

## ✅ 验收标准

- [ ] 所有构建脚本创建完成
- [ ] package.json 脚本更新完成
- [ ] Turbo 配置创建完成
- [ ] 执行 `npm run build:packages` 成功
- [ ] 执行 `npm run dev` 启动开发服务器
- [ ] 执行 `npm run build:production` 成功
- [ ] 执行 `npm run clean` 清理成功
- [ ] 并行构建和顺序构建都工作正常
- [ ] 监听模式正常工作
- [ ] 生产构建包含所有验证步骤

---

## 🧪 测试验证

```bash
# 测试清理脚本
npm run clean
npm run clean:deep

# 测试包构建
npm run build:packages
npm run build:packages:sequential

# 测试开发服务器
npm run dev

# 测试生产构建
npm run build:production

# 测试监听模式
npm run build:packages:watch

# 测试所有验证
npm run validate:all
```

---

## 🔄 回滚方案

```bash
# 删除构建脚本
rm scripts/build-packages.js
rm scripts/clean-packages.js
rm scripts/dev-server.js
rm scripts/build-production.js

# 恢复 package.json 和 turbo.json
git checkout package.json turbo.json

# 清理构建产物
npm run clean
```

---

## 📝 注意事项

1. **构建顺序**：确保依赖包先于使用它们的包构建
2. **并行构建**：利用多核 CPU 提高构建速度
3. **监听模式**：开发时自动重新构建变更的包
4. **错误处理**：提供清晰的错误信息和恢复建议
5. **性能监控**：记录构建时间和资源使用情况

---

## 🚨 常见问题

**Q: 并行构建失败？**
A: 检查依赖关系，使用顺序构建模式调试

**Q: 开发服务器启动慢？**
A: 使用 `--no-watch` 跳过包监听器

**Q: 生产构建失败？**
A: 检查测试和类型检查，使用 `--skip-tests` 跳过测试

**Q: 清理脚本删除了重要文件？**
A: 使用 `--dry-run` 预览要删除的文件

---

**🎯 完成此任务后，继续执行 Task 012: 文档和总结**
