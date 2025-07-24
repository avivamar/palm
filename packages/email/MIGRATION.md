# Migration Guide: From `src/templates/email` to `@rolitt/email`

> 📦 This guide helps you migrate from the old email template system to the new decoupled `@rolitt/email` package.

## Overview

The email template system has been decoupled into a standalone package `@rolitt/email` for better maintainability, reusability, and testing. This migration provides:

- ✅ **Better separation of concerns**
- ✅ **Improved testing capabilities**
- ✅ **Easier maintenance and updates**
- ✅ **Reusable across projects**
- ✅ **Independent versioning**

## What Changed

### File Structure

**Before:**
```
src/templates/email/
├── types.ts
├── utils.ts
├── config.ts
├── supabase-integration.ts
├── templates/
│   ├── confirmation.ts
│   ├── invite.ts
│   └── ...
└── __tests__/
```

**After:**
```
packages/email/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts
    ├── types.ts
    ├── utils.ts
    ├── config.ts
    ├── supabase-integration.ts
    └── templates/
```

### Import Changes

**Before:**
```typescript
import type { EmailType, SupportedLocale } from '@/templates/email/types';
import { generateEmailTemplate } from '@/templates/email';
import { SupabaseEmailTemplateGenerator } from '@/templates/email/supabase-integration';
```

**After:**
```typescript
import type { EmailType, SupportedLocale } from '@rolitt/email';
import { generateEmailTemplate, SupabaseEmailTemplateGenerator } from '@rolitt/email';
```

## Step-by-Step Migration

### 1. Install the Package

The package is already added to your `package.json` as a workspace dependency:

```json
{
  "dependencies": {
    "@rolitt/email": "workspace:*"
  }
}
```

### 2. Update Imports

Find and replace all imports in your codebase:

```bash
# Search for old imports
grep -r "from '@/templates/email" src/
grep -r "import.*@/templates/email" src/
```

**Replace patterns:**

| Old Import | New Import |
|------------|------------|
| `from '@/templates/email'` | `from '@rolitt/email'` |
| `from '@/templates/email/types'` | `from '@rolitt/email'` |
| `from '@/templates/email/supabase-integration'` | `from '@rolitt/email'` |
| `from '@/templates/email/templates'` | `from '@rolitt/email/templates'` |
| `from '@/templates/email/utils'` | `from '@rolitt/email'` |

### 3. Update API Routes

If you have API routes using the email templates:

**Before:**
```typescript
// app/api/email/route.ts
import { generateEmailTemplate } from '@/templates/email';

export async function POST(request: Request) {
  const template = generateEmailTemplate('confirmation', 'en', {
    ConfirmationURL: 'https://example.com/confirm',
    SiteName: 'My App'
  });
  // ...
}
```

**After:**
```typescript
// app/api/email/route.ts
import { generateEmailTemplate } from '@rolitt/email';

export async function POST(request: Request) {
  const template = generateEmailTemplate('confirmation', 'en', {
    ConfirmationURL: 'https://example.com/confirm',
    SiteName: 'My App'
  });
  // ...
}
```

### 4. Update Scripts

Update your npm scripts to use the new package:

**Before:**
```json
{
  "scripts": {
    "email:test": "npx tsx scripts/test-email-templates.ts"
  }
}
```

**After:**
```json
{
  "scripts": {
    "email:test": "cd packages/email && npm test",
    "email:build": "cd packages/email && npm run build",
    "email:dev": "cd packages/email && npm run dev"
  }
}
```

### 5. Update Tests

If you have tests importing the email templates:

**Before:**
```typescript
// __tests__/email.test.ts
import { generateEmailTemplate } from '@/templates/email';
```

**After:**
```typescript
// __tests__/email.test.ts
import { generateEmailTemplate } from '@rolitt/email';
```

### 6. Clean Up Old Files

After migration is complete and tested:

```bash
# Remove old email template directory
rm -rf src/templates/email/

# Update any remaining references
grep -r "templates/email" src/ # Should return no results
```

## Verification

### 1. Build Check

```bash
# Build the email package
cd packages/email
npm run build

# Build the main project
cd ../..
npm run build
```

### 2. Test Check

```bash
# Test the email package
cd packages/email
npm test

# Test the main project
cd ../..
npm test
```

### 3. Type Check

```bash
# Type check the email package
cd packages/email
npm run type-check

# Type check the main project
cd ../..
npm run check-types
```

## Benefits After Migration

### 1. Independent Development

```bash
# Work on email templates independently
cd packages/email
npm run dev
```

### 2. Separate Testing

```bash
# Test only email functionality
cd packages/email
npm test
npm run test:coverage
```

### 3. Independent Versioning

```json
// packages/email/package.json
{
  "name": "@rolitt/email",
  "version": "1.0.0"
}
```

### 4. Reusability

```typescript
// Can be used in other projects
import { generateEmailTemplate } from '@rolitt/email';
```

## Troubleshooting

### Import Errors

**Problem:** `Cannot resolve module '@rolitt/email'`

**Solution:**
```bash
# Reinstall dependencies
npm install

# Build the email package
cd packages/email && npm run build
```

### Type Errors

**Problem:** TypeScript cannot find types

**Solution:**
```bash
# Ensure TypeScript references are correct
cd packages/email
npm run type-check

# Build declarations
npm run build
```

### Missing Dependencies

**Problem:** Runtime errors about missing dependencies

**Solution:**
```bash
# Check peer dependencies
cd packages/email
npm ls

# Install missing peer dependencies in main project
cd ../..
npm install
```

## Rollback Plan

If you need to rollback:

1. **Restore old files:**
   ```bash
   git checkout HEAD~1 -- src/templates/email/
   ```

2. **Revert package.json:**
   ```bash
   # Remove @rolitt/email from dependencies
   ```

3. **Revert imports:**
   ```bash
   # Change back to @/templates/email imports
   ```

## Next Steps

After successful migration:

1. ✅ **Update documentation** to reference the new package
2. ✅ **Update CI/CD** to build and test the email package
3. ✅ **Consider publishing** the package to npm for external use
4. ✅ **Set up automated testing** for the email package

## Support

If you encounter issues during migration:

- 📖 Check the [package README](./README.md)
- 🐛 Create an issue in the repository
- 💬 Ask in team discussions

---

**Migration completed successfully! 🎉**

The email template system is now properly decoupled and ready for independent development and testing.
