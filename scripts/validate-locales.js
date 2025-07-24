#!/usr/bin/env node

/**
 * 多语言文件完整性验证脚本
 * 用于定期检查 src/locales/ 目录下的多语言文件是否完整
 */

const fs = require('node:fs');
const path = require('node:path');

class LocaleValidator {
  constructor(localesDir = 'src/locales') {
    this.localesDir = localesDir;
    this.results = {
      passed: true,
      errors: [],
      warnings: [],
      stats: {},
    };
  }

  /**
   * 主验证方法
   */
  async validate() {
    console.log('🔍 开始验证多语言文件完整性...\n');

    try {
      // 1. 检查目录结构
      this.validateDirectoryStructure();

      // 2. 检查每种语言的完整性
      await this.validateAllLanguages();

      // 3. 生成报告
      this.generateReport();
    } catch (error) {
      this.addError(`验证过程中发生错误: ${error.message}`);
    }

    return this.results;
  }

  /**
   * 验证目录结构
   */
  validateDirectoryStructure() {
    const localesPath = path.join(process.cwd(), this.localesDir);

    if (!fs.existsSync(localesPath)) {
      this.addError(`多语言目录不存在: ${localesPath}`);
      return;
    }

    const items = fs.readdirSync(localesPath);
    const languages = items.filter((item) => {
      const itemPath = path.join(localesPath, item);
      return fs.statSync(itemPath).isDirectory() || item.endsWith('.json');
    });

    console.log(`📁 发现语言文件/目录: ${languages.join(', ')}`);
    this.results.stats.languages = languages;
  }

  /**
   * 验证所有语言的完整性
   */
  async validateAllLanguages() {
    const localesPath = path.join(process.cwd(), this.localesDir);
    const items = fs.readdirSync(localesPath);

    // 找到基准语言（英语）
    const baseLanguage = 'en';
    let baseStructure = null;

    // 检查英语是否有拆分文件
    const enDir = path.join(localesPath, baseLanguage);
    const enFile = path.join(localesPath, `${baseLanguage}.json`);

    if (fs.existsSync(enDir)) {
      baseStructure = this.loadSplitLanguage(enDir);
      console.log(`📖 使用拆分的英语文件作为基准 (${Object.keys(baseStructure).length} 个键)`);
    } else if (fs.existsSync(enFile)) {
      baseStructure = JSON.parse(fs.readFileSync(enFile, 'utf8'));
      console.log(`📖 使用单一英语文件作为基准 (${Object.keys(baseStructure).length} 个键)`);
    } else {
      this.addError('找不到英语基准文件');
      return;
    }

    // 验证每种语言
    for (const item of items) {
      const itemPath = path.join(localesPath, item);

      if (item === baseLanguage) {
        continue;
      } // 跳过基准语言

      if (fs.statSync(itemPath).isDirectory()) {
        await this.validateSplitLanguage(item, itemPath, baseStructure);
      } else if (item.endsWith('.json')) {
        await this.validateSingleLanguage(item, itemPath, baseStructure);
      }
    }
  }

  /**
   * 加载拆分的语言文件
   */
  loadSplitLanguage(languageDir) {
    const files = fs.readdirSync(languageDir).filter(f => f.endsWith('.json'));
    let merged = {};

    for (const file of files) {
      const filePath = path.join(languageDir, file);
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        merged = { ...merged, ...content };
      } catch (error) {
        this.addError(`解析文件失败 ${filePath}: ${error.message}`);
      }
    }

    return merged;
  }

  /**
   * 验证拆分的语言文件
   */
  async validateSplitLanguage(language, languageDir, baseStructure) {
    console.log(`\n🔍 验证拆分语言: ${language}`);

    const languageStructure = this.loadSplitLanguage(languageDir);
    const issues = this.compareStructures(baseStructure, languageStructure, language);

    if (issues.missing.length > 0) {
      this.addWarning(`${language} 缺失键: ${issues.missing.join(', ')}`);
    }

    if (issues.extra.length > 0) {
      this.addWarning(`${language} 多余键: ${issues.extra.join(', ')}`);
    }

    console.log(`  ✅ 键数量: ${Object.keys(languageStructure).length}`);
    console.log(`  📊 缺失: ${issues.missing.length}, 多余: ${issues.extra.length}`);
  }

  /**
   * 验证单一语言文件
   */
  async validateSingleLanguage(filename, filePath, baseStructure) {
    const language = filename.replace('.json', '');
    console.log(`\n🔍 验证单一语言文件: ${language}`);

    try {
      const languageStructure = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const issues = this.compareStructures(baseStructure, languageStructure, language);

      if (issues.missing.length > 0) {
        this.addWarning(`${language} 缺失键: ${issues.missing.join(', ')}`);
      }

      if (issues.extra.length > 0) {
        this.addWarning(`${language} 多余键: ${issues.extra.join(', ')}`);
      }

      console.log(`  ✅ 键数量: ${Object.keys(languageStructure).length}`);
      console.log(`  📊 缺失: ${issues.missing.length}, 多余: ${issues.extra.length}`);
    } catch (error) {
      this.addError(`解析 ${filename} 失败: ${error.message}`);
    }
  }

  /**
   * 比较两个结构的差异
   */
  compareStructures(base, target, language) {
    const baseKeys = Object.keys(base);
    const targetKeys = Object.keys(target);

    const missing = baseKeys.filter(key => !targetKeys.includes(key));
    const extra = targetKeys.filter(key => !baseKeys.includes(key));

    return { missing, extra };
  }

  /**
   * 添加错误
   */
  addError(message) {
    this.results.errors.push(message);
    this.results.passed = false;
    console.log(`❌ 错误: ${message}`);
  }

  /**
   * 添加警告
   */
  addWarning(message) {
    this.results.warnings.push(message);
    console.log(`⚠️  警告: ${message}`);
  }

  /**
   * 生成最终报告
   */
  generateReport() {
    console.log(`\n${'='.repeat(60)}`);
    console.log('📋 多语言文件验证报告');
    console.log('='.repeat(60));

    if (this.results.passed && this.results.warnings.length === 0) {
      console.log('🎉 所有多语言文件验证通过！');
    } else {
      if (this.results.errors.length > 0) {
        console.log(`\n❌ 发现 ${this.results.errors.length} 个错误:`);
        this.results.errors.forEach(error => console.log(`  - ${error}`));
      }

      if (this.results.warnings.length > 0) {
        console.log(`\n⚠️  发现 ${this.results.warnings.length} 个警告:`);
        this.results.warnings.forEach(warning => console.log(`  - ${warning}`));
      }
    }

    console.log(`\n📊 统计信息:`);
    console.log(`  - 检查的语言: ${this.results.stats.languages?.length || 0}`);
    console.log(`  - 错误数量: ${this.results.errors.length}`);
    console.log(`  - 警告数量: ${this.results.warnings.length}`);

    console.log(`\n${'='.repeat(60)}`);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const validator = new LocaleValidator();
  validator.validate().then((results) => {
    process.exit(results.passed && results.warnings.length === 0 ? 0 : 1);
  });
}

module.exports = LocaleValidator;
