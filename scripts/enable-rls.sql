-- Enable Row Level Security (RLS) for all tables
-- This script enables RLS and sets up basic policies for security

-- ========================================
-- 1. Enable RLS on all tables
-- ========================================

-- User related tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;

-- Palm analysis related tables
ALTER TABLE public.palm_analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.palm_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.palm_feedback ENABLE ROW LEVEL SECURITY;

-- E-commerce related tables
ALTER TABLE public.preorders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- Marketing and referral tables
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_activities ENABLE ROW LEVEL SECURITY;

-- System tables
ALTER TABLE public.counter ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 2. Create basic RLS policies
-- ========================================

-- Users table: Users can only see and update their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = supabase_id::uuid);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = supabase_id::uuid);

CREATE POLICY "Service role full access to users" ON public.users
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- User images: Users can manage their own images
CREATE POLICY "Users can view own images" ON public.user_images
    FOR SELECT USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can insert own images" ON public.user_images
    FOR INSERT WITH CHECK (auth.uid() = user_id::uuid);

CREATE POLICY "Users can update own images" ON public.user_images
    FOR UPDATE USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can delete own images" ON public.user_images
    FOR DELETE USING (auth.uid() = user_id::uuid);

-- Palm analysis sessions: Users can only see their own sessions
CREATE POLICY "Users can view own palm sessions" ON public.palm_analysis_sessions
    FOR SELECT USING (
        auth.uid()::text = user_id 
        OR auth.uid()::text IN (SELECT supabase_id FROM public.users WHERE id::text = palm_analysis_sessions.user_id)
    );

CREATE POLICY "Users can create own palm sessions" ON public.palm_analysis_sessions
    FOR INSERT WITH CHECK (
        auth.uid()::text = user_id 
        OR auth.uid()::text IN (SELECT supabase_id FROM public.users WHERE id::text = palm_analysis_sessions.user_id)
    );

CREATE POLICY "Service role full access to palm sessions" ON public.palm_analysis_sessions
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Palm reports: Users can only see their own reports
CREATE POLICY "Users can view own palm reports" ON public.palm_reports
    FOR SELECT USING (
        auth.uid()::text IN (
            SELECT u.supabase_id 
            FROM public.users u 
            JOIN public.palm_analysis_sessions s ON s.user_id = u.id::text 
            WHERE s.session_id = palm_reports.session_id
        )
    );

CREATE POLICY "Service role full access to palm reports" ON public.palm_reports
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Palm feedback: Users can submit and view their own feedback
CREATE POLICY "Users can view own feedback" ON public.palm_feedback
    FOR SELECT USING (
        auth.uid()::text IN (
            SELECT u.supabase_id 
            FROM public.users u 
            JOIN public.palm_analysis_sessions s ON s.user_id = u.id::text 
            WHERE s.session_id = palm_feedback.session_id
        )
    );

CREATE POLICY "Users can insert feedback for own sessions" ON public.palm_feedback
    FOR INSERT WITH CHECK (
        auth.uid()::text IN (
            SELECT u.supabase_id 
            FROM public.users u 
            JOIN public.palm_analysis_sessions s ON s.user_id = u.id::text 
            WHERE s.session_id = palm_feedback.session_id
        )
    );

-- Preorders: Users can view and manage their own preorders
CREATE POLICY "Users can view own preorders" ON public.preorders
    FOR SELECT USING (
        auth.uid()::text IN (SELECT supabase_id FROM public.users WHERE email = preorders.email)
    );

CREATE POLICY "Service role full access to preorders" ON public.preorders
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Product inventory: Public read access (for product listing)
CREATE POLICY "Public can view product inventory" ON public.product_inventory
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage inventory" ON public.product_inventory
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Discount codes: Authenticated users can use codes
CREATE POLICY "Authenticated users can view active discount codes" ON public.discount_codes
    FOR SELECT USING (
        auth.role() = 'authenticated' 
        AND (expires_at IS NULL OR expires_at > NOW())
        AND is_active = true
    );

CREATE POLICY "Service role full access to discount codes" ON public.discount_codes
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Referrals: Users can view their own referrals
CREATE POLICY "Users can view own referrals" ON public.referrals
    FOR SELECT USING (
        auth.uid()::text = referrer_id::text 
        OR auth.uid()::text = referred_id::text
    );

CREATE POLICY "Users can create referrals" ON public.referrals
    FOR INSERT WITH CHECK (auth.uid()::text = referrer_id::text);

CREATE POLICY "Service role full access to referrals" ON public.referrals
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Referral config: Public read access
CREATE POLICY "Public can view referral config" ON public.referral_config
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage referral config" ON public.referral_config
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Marketing campaigns: Public read for active campaigns
CREATE POLICY "Public can view active campaigns" ON public.marketing_campaigns
    FOR SELECT USING (
        is_active = true 
        AND (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())
    );

CREATE POLICY "Service role full access to campaigns" ON public.marketing_campaigns
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Share activities: Users can manage their own shares
CREATE POLICY "Users can view own share activities" ON public.share_activities
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create share activities" ON public.share_activities
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Service role full access to share activities" ON public.share_activities
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Subscriptions: Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Service role full access to subscriptions" ON public.subscriptions
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Subscription usage: Users can view their own usage
CREATE POLICY "Users can view own subscription usage" ON public.subscription_usage
    FOR SELECT USING (
        auth.uid()::text IN (
            SELECT user_id FROM public.subscriptions WHERE id = subscription_usage.subscription_id
        )
    );

CREATE POLICY "Service role full access to subscription usage" ON public.subscription_usage
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Counter: Public read, authenticated write
CREATE POLICY "Public can read counter" ON public.counter
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can increment counter" ON public.counter
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Service role full access to counter" ON public.counter
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Webhook logs: Only service role access
CREATE POLICY "Service role only access to webhook logs" ON public.webhook_logs
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ========================================
-- 3. Grant necessary permissions
-- ========================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant appropriate permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_images TO authenticated;
GRANT SELECT, INSERT ON public.palm_analysis_sessions TO authenticated;
GRANT SELECT ON public.palm_reports TO authenticated;
GRANT SELECT, INSERT ON public.palm_feedback TO authenticated;
GRANT SELECT ON public.preorders TO authenticated;
GRANT SELECT ON public.product_inventory TO authenticated;
GRANT SELECT ON public.discount_codes TO authenticated;
GRANT SELECT, INSERT ON public.referrals TO authenticated;
GRANT SELECT ON public.referral_config TO authenticated;
GRANT SELECT ON public.marketing_campaigns TO authenticated;
GRANT SELECT, INSERT ON public.share_activities TO authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT SELECT ON public.subscription_usage TO authenticated;
GRANT SELECT, UPDATE ON public.counter TO authenticated;

-- Grant limited permissions to anonymous users
GRANT SELECT ON public.product_inventory TO anon;
GRANT SELECT ON public.referral_config TO anon;
GRANT SELECT ON public.marketing_campaigns TO anon;
GRANT SELECT ON public.counter TO anon;

-- ========================================
-- 4. Add helpful comments
-- ========================================

COMMENT ON POLICY "Users can view own profile" ON public.users IS 'Allow users to view their own profile data';
COMMENT ON POLICY "Users can update own profile" ON public.users IS 'Allow users to update their own profile data';
COMMENT ON POLICY "Service role full access to users" ON public.users IS 'Allow service role (backend) full access to user data';

-- ========================================
-- 5. Verification query
-- ========================================

-- Run this query to verify RLS is enabled on all tables:
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename;