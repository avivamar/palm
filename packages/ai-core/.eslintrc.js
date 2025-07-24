module.exports = {
  extends: ['../../.eslintrc.js'],
  env: {
    node: true,
  },
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    // AI-core specific rules
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    'prefer-const': 'error',
  },
};
