# 🗄️ Database Setup Guide for Palm Project

## 📊 Current Status

Based on the diagnostics, your database connection is experiencing authentication issues with the error: **"Tenant or user not found"**

This typically means the DATABASE_URL password or format is incorrect.

## ✅ Setup Instructions

### Step 1: Get Correct Database URL from Supabase

1. **Login to Supabase Dashboard**
   - Go to: https://app.supabase.com
   - Select your project: `kyuzzfvhukbkcvivsebm`

2. **Navigate to Database Settings**
   - Click `Settings` (gear icon) in the left sidebar
   - Click `Database` tab

3. **Copy the Correct Connection String**
   
   You have two options:

   #### Option A: Connection Pooler (Recommended for Production)
   - Find section: **Connection string** → **Connection Pooler**
   - Set **Mode**: `Transaction`
   - Copy the connection string
   - It should look like:
   ```
   postgres://postgres.kyuzzfvhukbkcvivsebm:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```

   #### Option B: Direct Connection (For Development)
   - Find section: **Connection string** → **Direct connection**
   - Copy the connection string
   - It should look like:
   ```
   postgres://postgres.kyuzzfvhukbkcvivsebm:[YOUR-PASSWORD]@db.kyuzzfvhukbkcvivsebm.supabase.co:5432/postgres
   ```

4. **Replace [YOUR-PASSWORD]**
   - Replace `[YOUR-PASSWORD]` with your actual database password
   - This is the password you set when creating the Supabase project
   - If you forgot it, you can reset it in Settings → Database → Reset database password

### Step 2: Update .env.local

Update your `.env.local` file with the correct values:

```env
# For Production (Pooler Connection)
DATABASE_URL="postgres://postgres.kyuzzfvhukbkcvivsebm:YOUR_ACTUAL_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"

# Supabase Client Config (these look correct)
NEXT_PUBLIC_SUPABASE_URL="https://kyuzzfvhukbkcvivsebm.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..." # Your anon key
```

### Step 3: Test Connection

Run the test script:

```bash
npx tsx scripts/test-supabase-connection.ts
```

### Step 4: Run Migrations (if needed)

If tables don't exist, run:

```bash
npm run db:migrate
```

## 🔍 Common Issues & Solutions

### Issue 1: "Tenant or user not found"
**Cause**: Incorrect password in DATABASE_URL
**Solution**: 
1. Reset database password in Supabase Dashboard
2. Update DATABASE_URL with new password
3. Make sure there are no special characters that need URL encoding

### Issue 2: "fetch failed" errors
**Cause**: Network or authentication issues
**Solution**:
1. Check if Supabase project is active (not paused)
2. Verify no IP restrictions in Supabase dashboard
3. Ensure SSL mode is set correctly

### Issue 3: Connection timeout
**Cause**: Using wrong port or connection type
**Solution**:
- Pooler connection: Port `6543`
- Direct connection: Port `5432`

## 🚀 Deployment Considerations

### For Vercel Deployment
Use pooler connection with these settings:
```env
DATABASE_URL="postgres://postgres.kyuzzfvhukbkcvivsebm:PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
```

### For Local Development
Either connection type works, but pooler is recommended for consistency.

## 📝 Verification Checklist

- [ ] DATABASE_URL contains correct password (no brackets)
- [ ] Password doesn't contain special characters that need encoding
- [ ] Using correct port (6543 for pooler, 5432 for direct)
- [ ] SSL mode is set to `require`
- [ ] Supabase project is active (not paused)
- [ ] No IP restrictions blocking your connection

## 🆘 Need Help?

1. **Check Supabase Status**: https://status.supabase.com
2. **Reset Database Password**: Settings → Database → Reset database password
3. **View Connection Logs**: Supabase Dashboard → Logs → Postgres

## 🔐 Security Notes

- Never commit `.env.local` to git
- Use environment variables in production (Vercel/Railway)
- Rotate database passwords regularly
- Use Row Level Security (RLS) for data protection