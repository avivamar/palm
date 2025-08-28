-- Quick RLS Enable Script for Supabase Dashboard
-- Run this directly in Supabase SQL Editor
-- This enables RLS without complex policies (you can add policies later)

-- ========================================
-- STEP 1: Enable RLS on all tables
-- ========================================
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Enable RLS for all public tables
    FOR r IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE 'pg_%'
        AND tablename NOT LIKE 'sql_%'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
        RAISE NOTICE 'Enabled RLS on table: %', r.tablename;
    END LOOP;
END $$;

-- ========================================
-- STEP 2: Create minimal service role policies
-- This allows your backend to still function
-- ========================================

-- Create service role policies for all tables
DO $$ 
DECLARE 
    r RECORD;
    policy_name TEXT;
BEGIN
    FOR r IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE 'pg_%'
        AND tablename NOT LIKE 'sql_%'
    LOOP
        policy_name := r.tablename || '_service_role_all';
        
        -- Drop existing policy if it exists
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_name, r.tablename);
        
        -- Create new service role policy
        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR ALL USING (auth.jwt() ->> %L = %L)',
            policy_name,
            r.tablename,
            'role',
            'service_role'
        );
        
        RAISE NOTICE 'Created service role policy for table: %', r.tablename;
    END LOOP;
END $$;

-- ========================================
-- STEP 3: Create basic user policies for important tables
-- ========================================

-- Users table: Users can see and update their own data
DROP POLICY IF EXISTS "users_own_read" ON public.users;
CREATE POLICY "users_own_read" ON public.users
    FOR SELECT 
    USING (
        auth.uid()::text = supabase_id 
        OR auth.jwt() ->> 'role' = 'service_role'
    );

DROP POLICY IF EXISTS "users_own_update" ON public.users;
CREATE POLICY "users_own_update" ON public.users
    FOR UPDATE 
    USING (
        auth.uid()::text = supabase_id 
        OR auth.jwt() ->> 'role' = 'service_role'
    );

-- Palm analysis sessions: Users can see their own sessions
DROP POLICY IF EXISTS "palm_sessions_own_read" ON public.palm_analysis_sessions;
CREATE POLICY "palm_sessions_own_read" ON public.palm_analysis_sessions
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id::text = palm_analysis_sessions.user_id 
            AND users.supabase_id = auth.uid()::text
        )
        OR auth.jwt() ->> 'role' = 'service_role'
    );

-- Product inventory: Everyone can read
DROP POLICY IF EXISTS "product_inventory_public_read" ON public.product_inventory;
CREATE POLICY "product_inventory_public_read" ON public.product_inventory
    FOR SELECT 
    USING (true);

-- Counter: Everyone can read, authenticated can update
DROP POLICY IF EXISTS "counter_public_read" ON public.counter;
CREATE POLICY "counter_public_read" ON public.counter
    FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "counter_auth_update" ON public.counter;
CREATE POLICY "counter_auth_update" ON public.counter
    FOR UPDATE 
    USING (
        auth.role() = 'authenticated'
        OR auth.jwt() ->> 'role' = 'service_role'
    );

-- ========================================
-- STEP 4: Verify RLS is enabled
-- ========================================
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ========================================
-- STEP 5: Show created policies
-- ========================================
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd as action
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname
LIMIT 20;