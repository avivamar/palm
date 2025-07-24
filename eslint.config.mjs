import antfu from '@antfu/eslint-config';
import nextPlugin from '@next/eslint-plugin-next';
import jestDom from 'eslint-plugin-jest-dom';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import playwright from 'eslint-plugin-playwright';
import testingLibrary from 'eslint-plugin-testing-library';

export default antfu({
  react: true,
  typescript: true,

  lessOpinionated: true,
  isInEditor: false,

  stylistic: {
    semi: true,
  },

  formatters: {
    css: true,
  },

  ignores: [
    'migrations/**/*',
    'next-env.d.ts',
    '**/*.md',
    '**/*.json',
    'docs/**/*',
    'content/**/*',
    'tasks/**/*',
    'scripts/**/*.js',
    'test-*.ts',
    '.next/**/*',
    'dist/**/*',
    'node_modules/**/*',
    '.env*',
    'public/**/*',
    // Config and backup files
    'next.config.backup.ts',
    'next.config.optimized.js',
    'next.config.railway.ts',
    'tailwind.config copy.ts',
    // Testing and integration files
    'src/libs/shopify/tests/**/*',
  ],
}, jsxA11y.flatConfigs.recommended, {
  plugins: {
    '@next/next': nextPlugin,
  },
  rules: {
    ...nextPlugin.configs.recommended.rules,
    ...nextPlugin.configs['core-web-vitals'].rules,
  },
}, {
  files: [
    '**/*.test.ts?(x)',
  ],
  ...testingLibrary.configs['flat/react'],
  ...jestDom.configs['flat/recommended'],
}, {
  files: [
    '**/*.spec.ts',
    '**/*.e2e.ts',
  ],
  ...playwright.configs['flat/recommended'],
}, {
  files: ['scripts/**/*.js', 'tailwind.config.ts', '*.config.ts', '*.config.js'],
  rules: {
    'ts/no-require-imports': 'off', // Allow require in scripts and config files
    'ts/no-var-requires': 'off', // Allow var requires in scripts and config files
    'no-console': 'off', // Allow console in scripts and config files
  },
}, {
  rules: {
    'antfu/no-top-level-await': 'off', // Allow top-level await
    'style/brace-style': ['error', '1tbs'], // Use the default brace style
    'ts/consistent-type-definitions': ['error', 'type'], // Use `type` instead of `interface`
    'react/prefer-destructuring-assignment': 'off', // Vscode doesn't support automatically destructuring, it's a pain to add a new variable
    'node/prefer-global/process': 'off', // Allow using `process.env`
    'test/padding-around-all': 'error', // Add padding in test files
    'test/prefer-lowercase-title': 'off', // Allow using uppercase titles in test titles
    'ts/no-require-imports': 'error', // Disallow require imports
    'ts/no-var-requires': 'error', // Disallow var requires
    // Allow console in development and debug files
    'no-console': ['error', {
      allow: ['warn', 'error', 'info', 'debug', 'log'],
    }],
  },
});
