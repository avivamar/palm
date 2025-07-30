#!/usr/bin/env ts-node

/**
 * UI Component Management Script
 * Provides tools to manage the shared UI component library
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const COMPONENTS_DIR = path.join(__dirname, '../src/ui/components');
const PACKAGE_JSON_PATH = path.join(__dirname, '../package.json');
const INDEX_FILE_PATH = path.join(COMPONENTS_DIR, 'index.ts');

interface ComponentInfo {
  name: string;
  file: string;
  exports: string[];
  dependencies: string[];
  hasRadixDependency: boolean;
  isClientComponent: boolean;
}

class ComponentManager {
  private components: ComponentInfo[] = [];

  /**
   * Scan all components and analyze their structure
   */
  async scanComponents(): Promise<void> {
    const files = fs.readdirSync(COMPONENTS_DIR)
      .filter(file => file.endsWith('.tsx') && file !== 'index.ts');

    this.components = [];

    for (const file of files) {
      const filePath = path.join(COMPONENTS_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      const componentInfo: ComponentInfo = {
        name: path.basename(file, '.tsx'),
        file,
        exports: this.extractExports(content),
        dependencies: this.extractDependencies(content),
        hasRadixDependency: content.includes('@radix-ui/'),
        isClientComponent: content.includes("'use client'")
      };

      this.components.push(componentInfo);
    }
  }

  /**
   * Extract exported components from file content
   */
  private extractExports(content: string): string[] {
    const exportRegex = /export\s*\{\s*([^}]+)\s*\}/g;
    const exports: string[] = [];
    
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      const exportList = match[1]
        .split(',')
        .map(exp => exp.trim().split(' as ')[0].trim())
        .filter(exp => exp && !exp.startsWith('type'));
      exports.push(...exportList);
    }

    // Also check for individual exports
    const individualExportRegex = /export\s+(?:const|function|class)\s+(\w+)/g;
    while ((match = individualExportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }

    return [...new Set(exports)];
  }

  /**
   * Extract dependencies from import statements
   */
  private extractDependencies(content: string): string[] {
    const importRegex = /import.*from\s+['"]([^'"]+)['"]/g;
    const dependencies: string[] = [];
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const dep = match[1];
      if (!dep.startsWith('.') && !dep.startsWith('@rolitt/')) {
        dependencies.push(dep);
      }
    }

    return [...new Set(dependencies)];
  }

  /**
   * Generate component status report
   */
  generateReport(): void {
    console.log('\n📦 UI Component Library Report\n');
    console.log('=' .repeat(50));
    
    console.log(`\n📊 Summary:`);
    console.log(`Total Components: ${this.components.length}`);
    console.log(`Client Components: ${this.components.filter(c => c.isClientComponent).length}`);
    console.log(`Radix Components: ${this.components.filter(c => c.hasRadixDependency).length}`);
    
    console.log(`\n🏗️  Components by Category:`);
    const categories = {
      'Form Controls': ['button', 'input', 'textarea', 'select', 'radio-group', 'switch', 'slider'],
      'Layout': ['card', 'separator', 'tabs', 'sheet', 'dialog'],
      'Navigation': ['breadcrumb', 'pagination', 'command'],
      'Feedback': ['alert', 'toast', 'progress', 'skeleton'],
      'Data Display': ['table', 'badge', 'avatar'],
      'Overlay': ['tooltip', 'popover', 'dropdown-menu'],
      'Other': []
    };

    Object.entries(categories).forEach(([category, componentNames]) => {
      const categoryComponents = this.components.filter(c => 
        componentNames.includes(c.name) || 
        (category === 'Other' && !Object.values(categories).flat().includes(c.name))
      );
      
      if (categoryComponents.length > 0) {
        console.log(`  ${category}: ${categoryComponents.map(c => c.name).join(', ')}`);
      }
    });

    console.log(`\n🔗 Dependencies Analysis:`);
    const allDeps = [...new Set(this.components.flatMap(c => c.dependencies))];
    allDeps.forEach(dep => {
      const count = this.components.filter(c => c.dependencies.includes(dep)).length;
      console.log(`  ${dep}: used by ${count} component(s)`);
    });

    console.log(`\n📤 Export Analysis:`);
    this.components.forEach(component => {
      console.log(`  ${component.name}: ${component.exports.length} exports`);
    });
  }

  /**
   * Validate package.json exports match actual components
   */
  validateExports(): boolean {
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
    const packageExports = Object.keys(packageJson.exports || {})
      .filter(key => key.startsWith('./ui/'))
      .map(key => key.replace('./ui/', ''));

    const componentFiles = this.components.map(c => c.name);
    
    console.log('\n🔍 Export Validation:\n');
    
    const missing = componentFiles.filter(comp => !packageExports.includes(comp));
    const extra = packageExports.filter(exp => !componentFiles.includes(exp) && exp !== 'index');

    if (missing.length > 0) {
      console.log('❌ Missing exports in package.json:');
      missing.forEach(comp => console.log(`  - ${comp}`));
    }

    if (extra.length > 0) {
      console.log('⚠️  Extra exports in package.json:');
      extra.forEach(exp => console.log(`  - ${exp}`));
    }

    if (missing.length === 0 && extra.length === 0) {
      console.log('✅ All exports are properly configured');
      return true;
    }

    return false;
  }

  /**
   * Update package.json exports automatically
   */
  updatePackageExports(): void {
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
    
    // Keep existing non-UI exports
    const nonUIExports = Object.entries(packageJson.exports || {})
      .filter(([key]) => !key.startsWith('./ui/') || key === './ui');

    // Add UI component exports
    const uiExports = this.components.reduce((acc, component) => {
      acc[`./ui/${component.name}`] = `./src/ui/components/${component.file}`;
      return acc;
    }, {} as Record<string, string>);

    packageJson.exports = {
      ...Object.fromEntries(nonUIExports),
      ...uiExports
    };

    fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2) + '\n');
    console.log('✅ Updated package.json exports');
  }

  /**
   * Update component index file
   */
  updateIndexFile(): void {
    let indexContent = '// UI Components Index\n// Centralized exports for all UI components\n\n';
    
    this.components
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(component => {
        if (component.exports.length > 0) {
          const exportList = component.exports.join(', ');
          indexContent += `export { ${exportList} } from './${component.name}';\n`;
        }
      });

    fs.writeFileSync(INDEX_FILE_PATH, indexContent);
    console.log('✅ Updated components index file');
  }

  /**
   * Check for missing dependencies in package.json
   */
  checkDependencies(): void {
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
    const installedDeps = {
      ...packageJson.dependencies,
      ...packageJson.peerDependencies
    };

    const allDeps = [...new Set(this.components.flatMap(c => c.dependencies))];
    const missingDeps = allDeps.filter(dep => !installedDeps[dep]);

    console.log('\n📦 Dependency Check:\n');
    
    if (missingDeps.length > 0) {
      console.log('❌ Missing dependencies:');
      missingDeps.forEach(dep => console.log(`  - ${dep}`));
      console.log('\nTo install missing dependencies:');
      console.log(`npm install ${missingDeps.join(' ')}`);
    } else {
      console.log('✅ All dependencies are installed');
    }
  }

  /**
   * Create a new component template
   */
  createComponent(name: string, options: { radix?: boolean; client?: boolean } = {}): void {
    const componentName = name.charAt(0).toUpperCase() + name.slice(1);
    const fileName = name.toLowerCase().replace(/([A-Z])/g, '-$1').replace(/^-/, '');
    const filePath = path.join(COMPONENTS_DIR, `${fileName}.tsx`);

    if (fs.existsSync(filePath)) {
      console.log(`❌ Component ${fileName} already exists`);
      return;
    }

    let template = '';
    
    if (options.client) {
      template += "'use client';\n\n";
    }

    template += `import * as React from 'react';\n`;
    template += `import { cn } from '@rolitt/shared/utils';\n`;

    if (options.radix) {
      template += `import * as ${componentName}Primitive from '@radix-ui/react-${fileName}';\n`;
    }

    template += `\n`;

    if (options.radix) {
      template += `const ${componentName} = React.forwardRef<\n`;
      template += `  React.ElementRef<typeof ${componentName}Primitive.Root>,\n`;
      template += `  React.ComponentPropsWithoutRef<typeof ${componentName}Primitive.Root>\n`;
      template += `>(({ className, ...props }, ref) => (\n`;
      template += `  <${componentName}Primitive.Root\n`;
      template += `    ref={ref}\n`;
      template += `    className={cn('', className)}\n`;
      template += `    {...props}\n`;
      template += `  />\n`;
      template += `));\n`;
      template += `${componentName}.displayName = ${componentName}Primitive.Root.displayName;\n`;
    } else {
      template += `interface ${componentName}Props extends React.HTMLAttributes<HTMLDivElement> {}\n\n`;
      template += `const ${componentName} = React.forwardRef<HTMLDivElement, ${componentName}Props>(\n`;
      template += `  ({ className, ...props }, ref) => {\n`;
      template += `    return (\n`;
      template += `      <div\n`;
      template += `        ref={ref}\n`;
      template += `        className={cn('', className)}\n`;
      template += `        {...props}\n`;
      template += `      />\n`;
      template += `    );\n`;
      template += `  }\n`;
      template += `);\n`;
      template += `${componentName}.displayName = '${componentName}';\n`;
    }

    template += `\nexport { ${componentName} };\n`;

    fs.writeFileSync(filePath, template);
    console.log(`✅ Created component: ${fileName}.tsx`);
  }
}

// CLI Interface
async function main() {
  const manager = new ComponentManager();
  await manager.scanComponents();

  const command = process.argv[2];
  
  switch (command) {
    case 'report':
      manager.generateReport();
      break;
      
    case 'validate':
      manager.validateExports();
      manager.checkDependencies();
      break;
      
    case 'sync':
      manager.updatePackageExports();
      manager.updateIndexFile();
      console.log('🔄 Synced component exports');
      break;
      
    case 'create':
      const componentName = process.argv[3];
      if (!componentName) {
        console.log('❌ Please provide a component name: npm run manage-components create <name>');
        process.exit(1);
      }
      const options = {
        radix: process.argv.includes('--radix'),
        client: process.argv.includes('--client')
      };
      manager.createComponent(componentName, options);
      break;
      
    case 'deps':
      manager.checkDependencies();
      break;
      
    default:
      console.log(`
📦 UI Component Management Tool

Usage:
  npm run manage-components <command> [options]

Commands:
  report     Generate component library report
  validate   Validate exports and dependencies
  sync       Update package.json exports and index file
  create     Create new component template
  deps       Check for missing dependencies

Examples:
  npm run manage-components report
  npm run manage-components validate
  npm run manage-components sync
  npm run manage-components create button --radix --client
  npm run manage-components deps
      `);
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { ComponentManager };