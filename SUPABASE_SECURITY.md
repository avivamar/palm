# 🔒 Supabase Security Configuration Guide

## 🚨 Security Warnings Summary

Your Supabase project has several security warnings that need to be addressed:

1. **Row Level Security (RLS) is not enabled** on 16 tables
2. **OTP validity period** is set to more than 1 hour 
3. **Leaked password protection** is not enabled

## 📋 Step-by-Step Security Setup

### 1️⃣ Enable Row Level Security (RLS)

RLS ensures that users can only access data they're authorized to see.

#### Option A: Run SQL Script (Recommended)
```bash
# Run the RLS setup script
psql $DATABASE_URL < scripts/enable-rls.sql
```

#### Option B: Manual Setup in Supabase Dashboard
1. Go to **Database → Tables**
2. For each table, click the **RLS disabled** badge
3. Click **Enable RLS**
4. Add appropriate policies (see script for examples)

### 2️⃣ Configure OTP Settings

1. Go to **Authentication → Settings**
2. Find **Email OTP expiry**
3. Change from current value to **3600 seconds (1 hour)** or less
4. Click **Save**

**Why?** Shorter OTP validity reduces the window for potential attacks.

### 3️⃣ Enable Leaked Password Protection

1. Go to **Authentication → Settings**
2. Find **Security**
3. Enable **Leaked password protection**
4. Click **Save**

**Why?** This prevents users from using passwords that have been exposed in data breaches.

### 4️⃣ Additional Security Recommendations

#### Enable MFA (Multi-Factor Authentication)
1. Go to **Authentication → Settings**
2. Enable **Multi-factor Authentication (MFA)**
3. Choose factors: TOTP, SMS, or both

#### Set Password Requirements
1. Go to **Authentication → Settings**
2. Configure:
   - Minimum password length: **12+ characters**
   - Require uppercase letters
   - Require numbers
   - Require special characters

#### Configure Rate Limiting
1. Go to **Authentication → Settings**
2. Set rate limits:
   - Sign-up attempts: **3 per hour**
   - Sign-in attempts: **5 per 15 minutes**
   - Password reset: **3 per hour**

#### Enable CAPTCHA
1. Go to **Authentication → Settings**
2. Enable **CAPTCHA protection**
3. Choose provider (hCaptcha or Cloudflare Turnstile)
4. Add site key and secret key

## 🛡️ RLS Policies Explanation

The provided SQL script creates the following security policies:

### User Data Protection
- **users** table: Users can only view/edit their own profile
- **user_images**: Users can only manage their own images
- **subscriptions**: Users can only see their own subscriptions

### Palm Analysis Security
- **palm_analysis_sessions**: Users can only access their own sessions
- **palm_reports**: Users can only view their own reports
- **palm_feedback**: Users can only submit feedback for their sessions

### E-commerce Security
- **preorders**: Users can only view their own orders
- **product_inventory**: Public read (for browsing), admin write
- **discount_codes**: Authenticated users can view active codes

### System Security
- **webhook_logs**: Only accessible by service role (backend)
- **counter**: Public read, authenticated write
- **referral_config**: Public read, admin write

## 🔍 Verify Security Setup

### Check RLS Status
```sql
-- Run this in SQL Editor
SELECT 
  schemaname,
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Check Policies
```sql
-- View all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Test User Access
```javascript
// Test in your application
const { data, error } = await supabase
  .from('users')
  .select('*')
  
// Should only return current user's data
console.log('User can see:', data)
```

## ⚠️ Important Notes

### Development vs Production
- **Development**: You might temporarily disable RLS for easier testing
- **Production**: ALWAYS enable RLS and proper policies

### Service Role Key
- Never expose `SUPABASE_SERVICE_ROLE_KEY` on the client
- Only use it in secure server-side environments
- It bypasses RLS completely

### Regular Security Audits
1. Review RLS policies monthly
2. Check for unused tables/columns
3. Monitor failed authentication attempts
4. Review user permissions regularly

## 🚀 Quick Commands

### Enable RLS on All Tables
```bash
# Connect to database and run
psql $DATABASE_URL < scripts/enable-rls.sql
```

### Disable RLS (Development Only!)
```sql
-- DANGEROUS: Only for development
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
-- Repeat for other tables
```

### View Current Auth Settings
```javascript
// Check auth settings via API
const { data, error } = await supabase.auth.admin.getSettings()
console.log('Auth settings:', data)
```

## 📊 Security Checklist

- [ ] RLS enabled on all tables
- [ ] Appropriate policies for each table
- [ ] OTP validity ≤ 1 hour
- [ ] Leaked password protection enabled
- [ ] MFA available/enabled
- [ ] Strong password requirements
- [ ] Rate limiting configured
- [ ] CAPTCHA enabled for sign-ups
- [ ] Service keys secured
- [ ] Regular security audits scheduled

## 🆘 Troubleshooting

### "Permission denied" errors
- Check if RLS is enabled
- Verify user is authenticated
- Review table policies

### Users seeing wrong data
- Check policy conditions
- Verify auth.uid() usage
- Test with different user roles

### Performance issues with RLS
- Add indexes on columns used in policies
- Simplify complex policy conditions
- Consider materialized views for complex queries

## 📚 Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Auth Best Practices](https://supabase.com/docs/guides/auth/auth-best-practices)
- [Security Hardening Guide](https://supabase.com/docs/guides/platform/security-hardening)