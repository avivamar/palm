# Task 010: 验证构建流程

> **目标**：验证所有包的构建流程，确保 TypeScript 编译、类型检查和依赖解析正常工作

---

## 📋 任务概述

**前置条件**：Task 001-009 已完成
**当前状态**：包架构重构完成，需要验证构建流程
**目标状态**：所有包可以正确构建和类型检查
**预计时间**：20 分钟
**风险等级**：中

---

## 🎯 执行步骤

### Step 1: 创建构建验证脚本

**文件路径**：`scripts/validate-build.js`

```javascript
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

function runCommand(command, options = {}) {
  try {
    console.log(`🔧 执行: ${command}`);
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      ...options
    });
    console.log('✅ 成功');
    return { success: true, output: result };
  } catch (error) {
    console.log(`❌ 失败: ${error.message}`);
    return { success: false, error: error.message, output: error.stdout };
  }
}

function validateBuildProcess() {
  console.log('🏗️  验证构建流程...');

  const steps = [
    {
      name: '清理构建产物',
      command: 'npm run clean:packages',
      required: true
    },
    {
      name: '安装依赖',
      command: 'npm install',
      required: true
    },
    {
      name: '验证路径映射',
      command: 'npm run validate:paths',
      required: true
    },
    {
      name: '验证项目引用',
      command: 'npm run validate:references',
      required: true
    },
    {
      name: '验证依赖关系',
      command: 'npm run validate:deps',
      required: true
    },
    {
      name: '类型检查（严格模式）',
      command: 'npm run type-check:strict',
      required: false
    },
    {
      name: '类型检查（开发模式）',
      command: 'npm run type-check',
      required: true
    },
    {
      name: '构建所有包',
      command: 'npm run build:packages',
      required: true
    },
    {
      name: 'TypeScript 构建',
      command: 'npm run build:tsc',
      required: true
    }
  ];

  const results = [];

  for (const step of steps) {
    console.log(`\n📋 ${step.name}...`);
    const result = runCommand(step.command);

    results.push({
      ...step,
      ...result
    });

    if (!result.success && step.required) {
      console.log(`\n💥 必需步骤失败，停止验证`);
      break;
    }
  }

  // 输出总结
  console.log('\n📊 构建验证总结:');
  results.forEach((result) => {
    const status = result.success ? '✅' : '❌';
    const required = result.required ? '(必需)' : '(可选)';
    console.log(`  ${status} ${result.name} ${required}`);
  });

  const requiredSteps = results.filter(r => r.required);
  const failedRequired = requiredSteps.filter(r => !r.success);

  if (failedRequired.length === 0) {
    console.log('\n🎉 所有必需步骤验证通过！');
    return true;
  } else {
    console.log(`\n💥 ${failedRequired.length} 个必需步骤失败`);
    return false;
  }
}

function validatePackageBuilds() {
  console.log('\n📦 验证各包构建...');

  const packagesDir = './packages';
  const packages = fs.readdirSync(packagesDir);

  packages.forEach((pkg) => {
    const packagePath = path.join(packagesDir, pkg);
    const packageJsonPath = path.join(packagePath, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      console.log(`\n📦 验证 ${pkg}...`);

      // 检查 tsconfig.json
      const tsconfigPath = path.join(packagePath, 'tsconfig.json');
      if (fs.existsSync(tsconfigPath)) {
        console.log('  ✅ tsconfig.json 存在');
      } else {
        console.log('  ❌ tsconfig.json 缺失');
      }

      // 检查入口文件
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const mainFile = packageJson.main;
      if (mainFile) {
        const mainPath = path.join(packagePath, mainFile);
        if (fs.existsSync(mainPath)) {
          console.log(`  ✅ 入口文件存在: ${mainFile}`);
        } else {
          console.log(`  ❌ 入口文件缺失: ${mainFile}`);
        }
      }

      // 检查构建产物
      const distPath = path.join(packagePath, 'dist');
      const tsbuildInfoPath = path.join(packagePath, 'tsconfig.tsbuildinfo');

      if (fs.existsSync(distPath) || fs.existsSync(tsbuildInfoPath)) {
        console.log('  ✅ 构建产物存在');
      } else {
        console.log('  ⚠️  构建产物不存在（可能是首次构建）');
      }

      // 尝试单独构建此包
      const buildResult = runCommand(`cd ${packagePath} && npm run build`);
      if (buildResult.success) {
        console.log('  ✅ 单独构建成功');
      } else {
        console.log('  ❌ 单独构建失败');
      }
    }
  });
}

function validateImports() {
  console.log('\n🔗 验证导入路径...');

  const packagesDir = './packages';
  const packages = fs.readdirSync(packagesDir);

  packages.forEach((pkg) => {
    const packagePath = path.join(packagesDir, pkg);
    const srcPath = path.join(packagePath, 'src');

    if (fs.existsSync(srcPath)) {
      console.log(`\n📦 检查 ${pkg} 的导入...`);

      // 递归查找所有 .ts 和 .tsx 文件
      function findFiles(dir, extensions = ['.ts', '.tsx']) {
        const files = [];
        const items = fs.readdirSync(dir);

        items.forEach((item) => {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            files.push(...findFiles(fullPath, extensions));
          } else if (extensions.some(ext => item.endsWith(ext))) {
            files.push(fullPath);
          }
        });

        return files;
      }

      const files = findFiles(srcPath);
      let importIssues = 0;

      files.forEach((file) => {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          // 检查相对路径导入
          const relativeImportMatch = line.match(/import.*from\s+['"](\.\.\/\.\.\/|\.\.\/\.\.\/\.\.\/)/g);
          if (relativeImportMatch) {
            console.log(`    ⚠️  ${path.relative(process.cwd(), file)}:${index + 1} - 可能的跨包相对导入`);
            importIssues++;
          }

          // 检查 @rolitt 导入
          const rolittImportMatch = line.match(/import.*from\s+['"]@rolitt\/(\w+)/g);
          if (rolittImportMatch) {
            console.log(`    ✅ ${path.relative(process.cwd(), file)}:${index + 1} - 使用包导入`);
          }
        });
      });

      if (importIssues === 0) {
        console.log('  ✅ 导入路径检查通过');
      } else {
        console.log(`  ⚠️  发现 ${importIssues} 个潜在导入问题`);
      }
    }
  });
}

function generateBuildReport() {
  console.log('\n📋 生成构建报告...');

  const report = {
    timestamp: new Date().toISOString(),
    packages: {},
    summary: {
      total: 0,
      built: 0,
      failed: 0
    }
  };

  const packagesDir = './packages';
  const packages = fs.readdirSync(packagesDir);

  packages.forEach((pkg) => {
    const packagePath = path.join(packagesDir, pkg);
    const packageJsonPath = path.join(packagePath, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      report.summary.total++;

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const tsconfigPath = path.join(packagePath, 'tsconfig.json');
      const distPath = path.join(packagePath, 'dist');
      const tsbuildInfoPath = path.join(packagePath, 'tsconfig.tsbuildinfo');

      const packageReport = {
        name: packageJson.name,
        version: packageJson.version,
        hasConfig: fs.existsSync(tsconfigPath),
        hasOutput: fs.existsSync(distPath) || fs.existsSync(tsbuildInfoPath),
        dependencies: Object.keys(packageJson.dependencies || {}),
        devDependencies: Object.keys(packageJson.devDependencies || {}),
        scripts: Object.keys(packageJson.scripts || {})
      };

      if (packageReport.hasOutput) {
        report.summary.built++;
      } else {
        report.summary.failed++;
      }

      report.packages[pkg] = packageReport;
    }
  });

  // 保存报告
  const reportPath = './build-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 构建报告已保存到: ${reportPath}`);

  // 输出摘要
  console.log('\n📊 构建摘要:');
  console.log(`  📦 总包数: ${report.summary.total}`);
  console.log(`  ✅ 已构建: ${report.summary.built}`);
  console.log(`  ❌ 失败: ${report.summary.failed}`);
  console.log(`  📈 成功率: ${((report.summary.built / report.summary.total) * 100).toFixed(1)}%`);
}

if (require.main === module) {
  const success = validateBuildProcess();

  if (success) {
    validatePackageBuilds();
    validateImports();
    generateBuildReport();
  }
}

module.exports = {
  validateBuildProcess,
  validatePackageBuilds,
  validateImports,
  generateBuildReport
};
```

### Step 2: 创建性能测试脚本

**文件路径**：`scripts/performance-test.js`

```javascript
const { execSync } = require('node:child_process');
const fs = require('node:fs');

function measureBuildTime() {
  console.log('⏱️  测量构建性能...');

  const tests = [
    {
      name: '冷启动构建（清理后）',
      commands: [
        'npm run clean:packages',
        'npm run build:packages'
      ]
    },
    {
      name: '增量构建（无变更）',
      commands: [
        'npm run build:packages'
      ]
    },
    {
      name: 'TypeScript 项目构建',
      commands: [
        'npm run clean:packages',
        'npm run build:tsc'
      ]
    },
    {
      name: '类型检查',
      commands: [
        'npm run type-check'
      ]
    }
  ];

  const results = [];

  tests.forEach((test) => {
    console.log(`\n🧪 测试: ${test.name}`);

    const startTime = Date.now();

    try {
      test.commands.forEach((command) => {
        console.log(`  🔧 ${command}`);
        execSync(command, { stdio: 'pipe' });
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`  ✅ 完成，耗时: ${duration}ms`);

      results.push({
        name: test.name,
        duration,
        success: true
      });
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`  ❌ 失败，耗时: ${duration}ms`);

      results.push({
        name: test.name,
        duration,
        success: false,
        error: error.message
      });
    }
  });

  // 输出性能报告
  console.log('\n📊 性能测试结果:');
  results.forEach((result) => {
    const status = result.success ? '✅' : '❌';
    const time = (result.duration / 1000).toFixed(2);
    console.log(`  ${status} ${result.name}: ${time}s`);
  });

  // 保存性能报告
  const report = {
    timestamp: new Date().toISOString(),
    results
  };

  fs.writeFileSync('./performance-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 性能报告已保存到: performance-report.json');
}

if (require.main === module) {
  measureBuildTime();
}

module.exports = { measureBuildTime };
```

### Step 3: 创建 CI/CD 验证脚本

**文件路径**：`scripts/ci-validation.js`

```javascript
const { execSync } = require('node:child_process');
const fs = require('node:fs');

function runCIValidation() {
  console.log('🚀 CI/CD 验证流程...');

  const steps = [
    {
      name: '环境检查',
      command: 'node --version && npm --version',
      critical: true
    },
    {
      name: '清理环境',
      command: 'npm run clean:packages && rm -rf node_modules package-lock.json',
      critical: true
    },
    {
      name: '安装依赖',
      command: 'npm ci',
      critical: true
    },
    {
      name: '验证配置',
      command: 'npm run validate:all',
      critical: true
    },
    {
      name: 'Lint 检查',
      command: 'npm run lint',
      critical: false
    },
    {
      name: '类型检查',
      command: 'npm run type-check',
      critical: true
    },
    {
      name: '构建',
      command: 'npm run build:packages',
      critical: true
    },
    {
      name: '测试',
      command: 'npm test',
      critical: false
    },
    {
      name: '安全审计',
      command: 'npm audit --audit-level=high',
      critical: false
    }
  ];

  let passed = 0;
  let failed = 0;
  let skipped = 0;

  for (const step of steps) {
    console.log(`\n📋 ${step.name}...`);

    try {
      execSync(step.command, { stdio: 'pipe' });
      console.log('✅ 通过');
      passed++;
    } catch (error) {
      if (step.critical) {
        console.log('❌ 失败（关键步骤）');
        console.log(`错误: ${error.message}`);
        failed++;
        break;
      } else {
        console.log('⚠️  失败（非关键步骤）');
        skipped++;
      }
    }
  }

  console.log('\n📊 CI/CD 验证结果:');
  console.log(`  ✅ 通过: ${passed}`);
  console.log(`  ❌ 失败: ${failed}`);
  console.log(`  ⚠️  跳过: ${skipped}`);

  if (failed === 0) {
    console.log('\n🎉 CI/CD 验证通过！');
    return true;
  } else {
    console.log('\n💥 CI/CD 验证失败！');
    return false;
  }
}

if (require.main === module) {
  const success = runCIValidation();
  process.exit(success ? 0 : 1);
}

module.exports = { runCIValidation };
```

### Step 4: 更新 package.json 脚本

**添加验证脚本到根 package.json**：

```json
{
  "scripts": {
    "validate:build": "node scripts/validate-build.js",
    "test:performance": "node scripts/performance-test.js",
    "ci:validate": "node scripts/ci-validation.js",
    "validate:all": "npm run validate:paths && npm run validate:references && npm run validate:deps && npm run validate:build"
  }
}
```

### Step 5: 创建构建监控脚本

**文件路径**：`scripts/build-monitor.js`

```javascript
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

function monitorBuildHealth() {
  console.log('🔍 监控构建健康状态...');

  const checks = [
    {
      name: '检查构建产物',
      check: () => {
        const packagesDir = './packages';
        const packages = fs.readdirSync(packagesDir);

        let hasOutput = 0;
        let total = 0;

        packages.forEach((pkg) => {
          const packagePath = path.join(packagesDir, pkg);
          const packageJsonPath = path.join(packagePath, 'package.json');

          if (fs.existsSync(packageJsonPath)) {
            total++;

            const distPath = path.join(packagePath, 'dist');
            const tsbuildInfoPath = path.join(packagePath, 'tsconfig.tsbuildinfo');

            if (fs.existsSync(distPath) || fs.existsSync(tsbuildInfoPath)) {
              hasOutput++;
            }
          }
        });

        return {
          success: hasOutput === total,
          message: `${hasOutput}/${total} 包有构建产物`
        };
      }
    },
    {
      name: '检查类型定义',
      check: () => {
        try {
          execSync('npm run type-check', { stdio: 'pipe' });
          return { success: true, message: '类型检查通过' };
        } catch (error) {
          return { success: false, message: '类型检查失败' };
        }
      }
    },
    {
      name: '检查依赖完整性',
      check: () => {
        try {
          execSync('npm ls --depth=0', { stdio: 'pipe' });
          return { success: true, message: '依赖完整' };
        } catch (error) {
          return { success: false, message: '依赖不完整' };
        }
      }
    },
    {
      name: '检查路径映射',
      check: () => {
        try {
          execSync('npm run validate:paths', { stdio: 'pipe' });
          return { success: true, message: '路径映射正确' };
        } catch (error) {
          return { success: false, message: '路径映射错误' };
        }
      }
    }
  ];

  const results = checks.map((check) => {
    console.log(`\n🔍 ${check.name}...`);
    const result = check.check();

    if (result.success) {
      console.log(`  ✅ ${result.message}`);
    } else {
      console.log(`  ❌ ${result.message}`);
    }

    return {
      name: check.name,
      ...result
    };
  });

  const passed = results.filter(r => r.success).length;
  const total = results.length;

  console.log('\n📊 构建健康状态:');
  console.log(`  ✅ 通过: ${passed}/${total}`);
  console.log(`  📈 健康度: ${((passed / total) * 100).toFixed(1)}%`);

  // 保存健康报告
  const report = {
    timestamp: new Date().toISOString(),
    health: (passed / total) * 100,
    checks: results
  };

  fs.writeFileSync('./build-health.json', JSON.stringify(report, null, 2));
  console.log('\n📄 健康报告已保存到: build-health.json');

  return passed === total;
}

if (require.main === module) {
  monitorBuildHealth();
}

module.exports = { monitorBuildHealth };
```

### Step 6: 创建问题诊断脚本

**文件路径**：`scripts/diagnose-issues.js`

```javascript
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

function diagnoseCommonIssues() {
  console.log('🔧 诊断常见构建问题...');

  const diagnostics = [
    {
      name: '检查 Node.js 版本',
      check: () => {
        const version = process.version;
        const major = Number.parseInt(version.slice(1).split('.')[0]);

        if (major >= 18) {
          return { success: true, message: `Node.js ${version} (支持)` };
        } else {
          return { success: false, message: `Node.js ${version} (需要 >= 18)` };
        }
      },
      fix: 'nvm install 18 && nvm use 18'
    },
    {
      name: '检查 npm 版本',
      check: () => {
        try {
          const version = execSync('npm --version', { encoding: 'utf8' }).trim();
          const major = Number.parseInt(version.split('.')[0]);

          if (major >= 8) {
            return { success: true, message: `npm ${version} (支持)` };
          } else {
            return { success: false, message: `npm ${version} (需要 >= 8)` };
          }
        } catch (error) {
          return { success: false, message: 'npm 未安装' };
        }
      },
      fix: 'npm install -g npm@latest'
    },
    {
      name: '检查工作区配置',
      check: () => {
        try {
          const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

          if (packageJson.workspaces) {
            return { success: true, message: '工作区已配置' };
          } else {
            return { success: false, message: '工作区未配置' };
          }
        } catch (error) {
          return { success: false, message: 'package.json 读取失败' };
        }
      },
      fix: '在 package.json 中添加 "workspaces": ["packages/*"]'
    },
    {
      name: '检查 TypeScript 配置',
      check: () => {
        const files = ['tsconfig.json', 'tsconfig.base.json'];
        const missing = files.filter(file => !fs.existsSync(file));

        if (missing.length === 0) {
          return { success: true, message: 'TypeScript 配置完整' };
        } else {
          return { success: false, message: `缺失文件: ${missing.join(', ')}` };
        }
      },
      fix: '运行 Task 004 和 Task 006 创建配置文件'
    },
    {
      name: '检查包结构',
      check: () => {
        const packagesDir = './packages';

        if (!fs.existsSync(packagesDir)) {
          return { success: false, message: 'packages 目录不存在' };
        }

        const packages = fs.readdirSync(packagesDir);
        const invalidPackages = [];

        packages.forEach((pkg) => {
          const packagePath = path.join(packagesDir, pkg);
          const packageJsonPath = path.join(packagePath, 'package.json');
          const tsconfigPath = path.join(packagePath, 'tsconfig.json');

          if (!fs.existsSync(packageJsonPath) || !fs.existsSync(tsconfigPath)) {
            invalidPackages.push(pkg);
          }
        });

        if (invalidPackages.length === 0) {
          return { success: true, message: `${packages.length} 个包结构正确` };
        } else {
          return { success: false, message: `无效包: ${invalidPackages.join(', ')}` };
        }
      },
      fix: '为每个包创建 package.json 和 tsconfig.json'
    },
    {
      name: '检查路径映射',
      check: () => {
        try {
          const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
          const paths = tsconfig.compilerOptions?.paths;

          if (paths && Object.keys(paths).some(key => key.startsWith('@rolitt/'))) {
            return { success: true, message: '路径映射已配置' };
          } else {
            return { success: false, message: '路径映射未配置' };
          }
        } catch (error) {
          return { success: false, message: 'tsconfig.json 解析失败' };
        }
      },
      fix: '运行 Task 006 配置路径映射'
    },
    {
      name: '检查依赖安装',
      check: () => {
        const nodeModulesPath = './node_modules';

        if (fs.existsSync(nodeModulesPath)) {
          try {
            execSync('npm ls --depth=0', { stdio: 'pipe' });
            return { success: true, message: '依赖已正确安装' };
          } catch (error) {
            return { success: false, message: '依赖安装不完整' };
          }
        } else {
          return { success: false, message: 'node_modules 不存在' };
        }
      },
      fix: 'npm install'
    }
  ];

  const issues = [];

  diagnostics.forEach((diagnostic) => {
    console.log(`\n🔍 ${diagnostic.name}...`);
    const result = diagnostic.check();

    if (result.success) {
      console.log(`  ✅ ${result.message}`);
    } else {
      console.log(`  ❌ ${result.message}`);
      console.log(`  🔧 修复建议: ${diagnostic.fix}`);

      issues.push({
        name: diagnostic.name,
        message: result.message,
        fix: diagnostic.fix
      });
    }
  });

  if (issues.length === 0) {
    console.log('\n🎉 未发现问题！');
  } else {
    console.log(`\n💥 发现 ${issues.length} 个问题:`);
    issues.forEach((issue, index) => {
      console.log(`\n${index + 1}. ${issue.name}`);
      console.log(`   问题: ${issue.message}`);
      console.log(`   修复: ${issue.fix}`);
    });

    // 保存诊断报告
    const report = {
      timestamp: new Date().toISOString(),
      issues
    };

    fs.writeFileSync('./diagnostic-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 诊断报告已保存到: diagnostic-report.json');
  }

  return issues.length === 0;
}

if (require.main === module) {
  diagnoseCommonIssues();
}

module.exports = { diagnoseCommonIssues };
```

### Step 7: 更新最终 package.json 脚本

**添加所有验证脚本到根 package.json**：

```json
{
  "scripts": {
    "validate:build": "node scripts/validate-build.js",
    "test:performance": "node scripts/performance-test.js",
    "ci:validate": "node scripts/ci-validation.js",
    "monitor:health": "node scripts/build-monitor.js",
    "diagnose": "node scripts/diagnose-issues.js",
    "validate:all": "npm run validate:paths && npm run validate:references && npm run validate:deps && npm run validate:build",
    "health:check": "npm run diagnose && npm run monitor:health",
    "ci:full": "npm run diagnose && npm run ci:validate && npm run test:performance"
  }
}
```

---

## ✅ 验收标准

- [ ] 所有验证脚本创建完成
- [ ] 执行 `npm run validate:build` 通过
- [ ] 执行 `npm run ci:validate` 通过
- [ ] 执行 `npm run health:check` 通过
- [ ] 所有包可以独立构建
- [ ] TypeScript 编译无错误
- [ ] 类型检查通过
- [ ] 依赖解析正确
- [ ] 路径映射工作正常
- [ ] 性能测试完成
- [ ] 生成构建报告

---

## 🧪 测试验证

```bash
# 完整验证流程
npm run ci:full

# 快速健康检查
npm run health:check

# 诊断问题
npm run diagnose

# 性能测试
npm run test:performance

# 验证构建
npm run validate:build
```

---

## 🔄 回滚方案

```bash
# 删除验证脚本
rm scripts/validate-build.js
rm scripts/performance-test.js
rm scripts/ci-validation.js
rm scripts/build-monitor.js
rm scripts/diagnose-issues.js

# 恢复 package.json
git checkout package.json

# 清理报告文件
rm -f build-report.json performance-report.json build-health.json diagnostic-report.json
```

---

## 📝 注意事项

1. **性能监控**：定期运行性能测试，监控构建时间变化
2. **错误处理**：验证脚本应该提供清晰的错误信息
3. **CI/CD 集成**：将验证脚本集成到 CI/CD 流程中
4. **报告保存**：构建报告可用于问题追踪和性能分析
5. **健康监控**：定期检查构建健康状态

---

## 🚨 常见问题

**Q: 构建验证失败？**
A: 运行 `npm run diagnose` 查看具体问题

**Q: 性能测试超时？**
A: 检查依赖安装和网络连接

**Q: 类型检查失败？**
A: 检查 TypeScript 配置和路径映射

**Q: CI 验证失败？**
A: 确保所有前置任务已完成

---

**🎯 完成此任务后，继续执行 Task 011: 更新构建脚本**
