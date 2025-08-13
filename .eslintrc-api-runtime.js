/**
 * ESLint配置专门用于API路由runtime声明检查
 * 确保所有需要Node.js功能的API路由都有正确的runtime声明
 */

module.exports = {
  overrides: [
    {
      files: ['src/app/api/**/route.ts', 'src/app/api/**/route.js'],
      rules: {
        'api-runtime-declaration': 'error'
      }
    }
  ],
  rules: {
    'api-runtime-declaration': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Require Node.js runtime declaration for API routes that use server-side features',
          category: 'Possible Errors',
        },
        fixable: 'code',
        schema: []
      },
      create(context) {
        const sourceCode = context.getSourceCode();
        const text = sourceCode.getText();
        
        // 检查是否需要Node.js runtime的模式
        const needsNodeRuntime = [
          /@\/libs\/supabase/,
          /@\/libs\/DB/,
          /@\/models\/Schema/,
          /drizzle-orm/,
          /stripe/,
          /@notionhq\/client/,
          /@rolitt\/shopify/,
          /node:crypto/,
          /sharp/,
          /createServerClient/,
          /getDB|getSafeDB/,
        ].some(pattern => pattern.test(text));
        
        if (!needsNodeRuntime) return {};
        
        // 检查是否已有runtime声明
        const hasRuntimeDeclaration = /export\s+const\s+runtime\s*=\s*['"]nodejs['"]/.test(text);
        
        if (hasRuntimeDeclaration) return {};
        
        return {
          Program(node) {
            context.report({
              node,
              message: 'API route requires "export const runtime = \'nodejs\';" declaration for Vercel deployment compatibility',
              fix(fixer) {
                const imports = node.body.filter(n => n.type === 'ImportDeclaration');
                const lastImport = imports[imports.length - 1];
                
                if (lastImport) {
                  return fixer.insertTextAfter(
                    lastImport,
                    '\n\n// Add runtime declaration for Node.js compatibility\nexport const runtime = \'nodejs\';'
                  );
                }
                
                return fixer.insertTextBefore(
                  node.body[0],
                  '// Add runtime declaration for Node.js compatibility\nexport const runtime = \'nodejs\';\n\n'
                );
              }
            });
          }
        };
      }
    }
  }
};