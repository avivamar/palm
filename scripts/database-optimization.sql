-- Database Optimization Script
-- 数据库性能优化脚本

-- 1. 用户表索引优化
-- 优化用户查询和认证
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_firebase_uid ON users (firebase_uid) WHERE firebase_uid IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_supabase_id ON users (supabase_id) WHERE supabase_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users (created_at DESC);

-- 2. 预订表索引优化
-- 优化订单查询和统计
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_preorders_user_id ON preorders (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_preorders_status ON preorders (status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_preorders_stripe_session ON preorders (stripe_session_id) WHERE stripe_session_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_preorders_created_at ON preorders (created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_preorders_status_created ON preorders (status, created_at DESC);

-- 3. Palm分析会话表索引优化
-- 优化手相分析查询
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_palm_sessions_user_id ON palm_analysis_sessions (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_palm_sessions_session_id ON palm_analysis_sessions (session_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_palm_sessions_status ON palm_analysis_sessions (status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_palm_sessions_created_at ON palm_analysis_sessions (created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_palm_sessions_analysis_type ON palm_analysis_sessions (analysis_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_palm_sessions_conversion ON palm_analysis_sessions (conversion_step);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_palm_sessions_user_status ON palm_analysis_sessions (user_id, status);

-- 4. 用户图片表索引优化
-- 优化图片查询和管理
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_images_user_id ON user_images (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_images_created_at ON user_images (created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_images_user_created ON user_images (user_id, created_at DESC);

-- 5. 推荐链接表索引优化
-- 优化推荐系统查询
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_links_user_id ON referral_links (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_links_code ON referral_links (code);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_links_status ON referral_links (status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_links_expires_at ON referral_links (expires_at) WHERE expires_at IS NOT NULL;

-- 6. 推荐记录表索引优化
-- 优化推荐追踪查询
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_records_referrer_id ON referral_records (referrer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_records_referred_id ON referral_records (referred_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_records_link_id ON referral_records (link_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_records_status ON referral_records (status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_records_created_at ON referral_records (created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_records_referrer_status ON referral_records (referrer_id, status);

-- 7. Webhook日志表索引优化
-- 优化webhook查询和监控
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_webhook_logs_event_type ON webhook_logs (event_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_webhook_logs_status ON webhook_logs (status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs (created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_webhook_logs_event_id ON webhook_logs (event_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_webhook_logs_type_status ON webhook_logs (event_type, status);

-- 8. 添加表分区（可选，用于大表）
-- 如果某些表数据量很大，考虑按时间分区

-- 9. 更新统计信息
ANALYZE users;
ANALYZE preorders;
ANALYZE palm_analysis_sessions;
ANALYZE user_images;
ANALYZE referral_links;
ANALYZE referral_records;
ANALYZE webhook_logs;

-- 10. 查看索引使用情况的查询
-- 可以定期运行以检查索引效果
/*
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
*/

-- 11. 查看慢查询
/*
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time,
    rows
FROM pg_stat_statements
WHERE mean_time > 1000 -- 超过1秒的查询
ORDER BY mean_time DESC
LIMIT 20;
*/

-- 12. 配置建议
-- 在postgresql.conf中考虑调整以下参数：
-- shared_buffers = 256MB (或更高，取决于可用内存)
-- effective_cache_size = 1GB (或更高)
-- work_mem = 4MB
-- maintenance_work_mem = 64MB
-- checkpoint_completion_target = 0.9
-- wal_buffers = 16MB
-- default_statistics_target = 100
-- random_page_cost = 1.1 (如果使用SSD)

COMMENT ON SCHEMA public IS 'Rolitt Palm AI数据库 - 已优化索引';