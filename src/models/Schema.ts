import {
  boolean,
  date,
  decimal,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// The migration is automatically applied during the next database interaction,
// so there's no need to run it manually or restart the Next.js server.

// ENUM Types for better data integrity
export const userRoleEnum = pgEnum('user_role', ['customer', 'admin', 'moderator']);
export const preorderStatusEnum = pgEnum('preorder_status', ['initiated', 'processing', 'completed', 'failed', 'refunded', 'cancelled']);
export const webhookStatusEnum = pgEnum('webhook_status', ['success', 'failed', 'pending', 'retry', 'expired']);
export const productColorEnum = pgEnum('product_color', ['Honey Khaki', 'Sakura Pink', 'Healing Green', 'Moonlight Grey', 'Red']);
export const discountTypeEnum = pgEnum('discount_type', ['percentage', 'fixed_amount']);
export const campaignTypeEnum = pgEnum('campaign_type', ['email', 'sms', 'push']);
export const campaignStatusEnum = pgEnum('campaign_status', ['draft', 'scheduled', 'active', 'paused', 'completed']);
export const referralStatusEnum = pgEnum('referral_status', ['visited', 'purchased', 'pending', 'completed']);
export const sharePlatformEnum = pgEnum('share_platform', ['twitter', 'linkedin', 'whatsapp', 'telegram', 'facebook', 'instagram']);
export const rewardStatusEnum = pgEnum('reward_status', ['pending', 'issued', 'redeemed', 'cancelled']);
export const imageMimeTypeEnum = pgEnum('image_mime_type', ['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid']);
export const subscriptionPlanEnum = pgEnum('subscription_plan', ['free', 'basic', 'pro', 'premium']);
export const usageResourceEnum = pgEnum('usage_resource', ['chat_messages', 'ai_calls', 'api_requests', 'storage_mb']);

// Table Schemas

export const counterSchema = pgTable('counter', {
  id: serial('id').primaryKey(),
  count: integer('count').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

export const usersSchema = pgTable('users', {
  id: text('id').primaryKey(), // 独立生成的nanoid，不依赖任何平台
  email: text('email').notNull().unique(), // 核心统一标识符，跨平台唯一
  displayName: text('display_name'),
  photoURL: text('photo_url'),
  role: userRoleEnum('role').default('customer').notNull(),
  phone: text('phone'),
  country: text('country'),
  marketingConsent: boolean('marketing_consent').default(false),
  emailVerified: boolean('email_verified').default(false),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true, mode: 'date' }),

  // 认证平台关联字段 (可选，用于数据同步)
  firebaseUid: text('firebase_uid').unique(), // Firebase 用户 UID
  supabaseId: text('supabase_id').unique(), // Supabase 用户 ID (仅用于关联)
  authSource: text('auth_source').default('supabase'), // 'supabase' | 'firebase' | 'unified'

  // 支付平台集成字段
  stripeCustomerId: text('stripe_customer_id').unique(), // Stripe 客户 ID
  paypalCustomerId: text('paypal_customer_id').unique(), // PayPal 客户 ID (预留)

  // 订阅状态字段 - 用于快速权限检查
  subscriptionStatus: subscriptionStatusEnum('subscription_status').default('active'),
  subscriptionPlan: subscriptionPlanEnum('subscription_plan').default('free'),
  subscriptionPeriodEnd: timestamp('subscription_period_end', { withTimezone: true, mode: 'date' }),

  // 电商平台集成字段
  shopifyCustomerId: text('shopify_customer_id').unique(), // Shopify 客户 ID

  // 营销平台集成字段
  klaviyoProfileId: text('klaviyo_profile_id').unique(), // Klaviyo 用户档案 ID

  // 用户行为数据
  referralCode: text('referral_code').unique(),
  referralCount: integer('referral_count').default(0),

  // 时间戳
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow(),
}, table => ({
  // 索引定义 - 优化查询性能
  emailIdx: uniqueIndex('idx_users_email').on(table.email),
  supabaseIdIdx: uniqueIndex('idx_users_supabase_id').on(table.supabaseId),
  roleCreatedIdx: index('idx_users_role_created').on(table.role, table.createdAt),
  authSourceIdx: index('idx_users_auth_source').on(table.authSource),
}));

export const preordersSchema = pgTable('preorders', {
  id: text('id').primaryKey(), // Nanoid generated
  userId: text('user_id').references(() => usersSchema.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  email: text('email').notNull(),
  color: productColorEnum('color').notNull(),
  priceId: text('price_id').notNull(),
  status: preorderStatusEnum('status').default('initiated').notNull(),
  sessionId: text('session_id'),
  paymentIntentId: text('payment_intent_id'),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('USD').notNull(),
  preorderNumber: text('preorder_number').unique(),
  locale: text('locale').default('en'),
  customerNotes: text('customer_notes'),
  estimatedDelivery: date('estimated_delivery', { mode: 'date' }),
  shippingAddress: jsonb('shipping_address'),
  billingAddress: jsonb('billing_address'),
  // Flattened billing address fields for better readability and querying
  billingName: text('billing_name'),
  billingEmail: text('billing_email'),
  billingPhone: text('billing_phone'),
  billingAddressLine1: text('billing_address_line1'),
  billingAddressLine2: text('billing_address_line2'),
  billingCity: text('billing_city'),
  billingState: text('billing_state'),
  billingCountry: text('billing_country'),
  billingPostalCode: text('billing_postal_code'),
  discountCode: text('discount_code'),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0'),
  taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).default('0'),
  shippingCost: decimal('shipping_cost', { precision: 10, scale: 2 }).default('0'),
  trackingNumber: text('tracking_number'),
  shippedAt: timestamp('shipped_at', { withTimezone: true, mode: 'date' }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true, mode: 'date' }),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true, mode: 'date' }),
  cancellationReason: text('cancellation_reason'),
  refundedAt: timestamp('refunded_at', { withTimezone: true, mode: 'date' }),
  refundAmount: decimal('refund_amount', { precision: 10, scale: 2 }),
  referrerCode: text('referrer_code'),
  shareNickname: text('share_nickname'),
  klaviyoEventSentAt: timestamp('klaviyo_event_sent_at', { withTimezone: true, mode: 'date' }),

  // Shopify集成字段
  shopifyOrderId: text('shopify_order_id'),
  shopifyOrderNumber: text('shopify_order_number'),
  shopifySyncedAt: timestamp('shopify_synced_at', { withTimezone: true, mode: 'date' }),
  shopifyFulfillmentStatus: text('shopify_fulfillment_status'),
  shopifyError: text('shopify_error'),
  shopifyLastAttemptAt: timestamp('shopify_last_attempt_at', { withTimezone: true, mode: 'date' }),

  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(),
}, table => ({
  // 索引定义 - 优化查询性能
  emailIdx: index('idx_preorders_email').on(table.email),
  statusIdx: index('idx_preorders_status').on(table.status),
  createdAtIdx: index('idx_preorders_created_at').on(table.createdAt),
  statusCreatedIdx: index('idx_preorders_status_created').on(table.status, table.createdAt),
  userIdIdx: index('idx_preorders_user_id').on(table.userId),
  sessionIdIdx: index('idx_preorders_session_id').on(table.sessionId),
  shopifyOrderIdIdx: index('idx_preorders_shopify_order_id').on(table.shopifyOrderId),
}));

export const webhookLogsSchema = pgTable('webhook_logs', {
  id: serial('id').primaryKey(),
  event: text('event').notNull(),
  provider: text('provider').default('stripe').notNull(),
  status: webhookStatusEnum('status').notNull(),
  email: text('email'),
  error: text('error'),
  retryCount: integer('retry_count').default(0),
  maxRetries: integer('max_retries').default(3),
  nextRetryAt: timestamp('next_retry_at', { withTimezone: true, mode: 'date' }),
  processedAt: timestamp('processed_at', { withTimezone: true, mode: 'date' }),
  receivedAt: timestamp('received_at', { withTimezone: true, mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(),
  preorderId: text('preorder_id').references(() => preordersSchema.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  sessionId: text('session_id'),
  paymentIntentId: text('payment_intent_id'),
  amount: decimal('amount', { precision: 10, scale: 2 }),
  currency: text('currency'),
  color: productColorEnum('color'),
  locale: text('locale'),
  stripeEventId: text('stripe_event_id').unique(),
  klaviyoEventSent: boolean('klaviyo_event_sent').default(false),
  klaviyoEventType: text('klaviyo_event_type'),
  klaviyoEventSentAt: timestamp('klaviyo_event_sent_at'),
  rawData: jsonb('raw_data'),
}, table => ({
  // 索引定义 - 优化查询性能
  eventIdx: index('idx_webhook_logs_event').on(table.event),
  statusIdx: index('idx_webhook_logs_status').on(table.status),
  createdAtIdx: index('idx_webhook_logs_created_at').on(table.createdAt),
  stripeEventIdIdx: uniqueIndex('idx_webhook_logs_stripe_event_id').on(table.stripeEventId),
  preorderIdIdx: index('idx_webhook_logs_preorder_id').on(table.preorderId),
  providerEventIdx: index('idx_webhook_logs_provider_event').on(table.provider, table.event),
}));

export const productInventorySchema = pgTable('product_inventory', {
  id: serial('id').primaryKey(),
  color: productColorEnum('color').unique().notNull(),
  totalQuantity: integer('total_quantity').default(0).notNull(),
  reservedQuantity: integer('reserved_quantity').default(0).notNull(),
  lowStockThreshold: integer('low_stock_threshold').default(10),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(),
});

export const discountCodesSchema = pgTable('discount_codes', {
  id: serial('id').primaryKey(),
  code: text('code').unique().notNull(),
  type: discountTypeEnum('type').notNull(),
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  minOrderAmount: decimal('min_order_amount', { precision: 10, scale: 2 }).default('0'),
  maxUses: integer('max_uses'),
  usedCount: integer('used_count').default(0),
  validFrom: timestamp('valid_from', { withTimezone: true, mode: 'date' }).defaultNow(),
  validUntil: timestamp('valid_until', { withTimezone: true, mode: 'date' }),
  isActive: boolean('is_active').default(true),
  description: text('description'),
  createdBy: text('created_by').references(() => usersSchema.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(),
});

export const marketingCampaignsSchema = pgTable('marketing_campaigns', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: campaignTypeEnum('type').notNull(),
  status: campaignStatusEnum('status').default('draft'),
  targetAudience: jsonb('target_audience'),
  content: jsonb('content'),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true, mode: 'date' }),
  startedAt: timestamp('started_at', { withTimezone: true, mode: 'date' }),
  completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
  totalRecipients: integer('total_recipients').default(0),
  successfulSends: integer('successful_sends').default(0),
  failedSends: integer('failed_sends').default(0),
  openRate: decimal('open_rate', { precision: 5, scale: 4 }),
  clickRate: decimal('click_rate', { precision: 5, scale: 4 }),
  conversionRate: decimal('conversion_rate', { precision: 5, scale: 4 }),
  createdBy: text('created_by').references(() => usersSchema.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(),
});

export const referralsSchema = pgTable('referrals', {
  id: text('id').primaryKey(),
  referrerCode: text('referrer_code').notNull(),
  refereeEmail: text('referee_email').notNull(),
  preorderId: text('preorder_id').references(() => preordersSchema.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  status: referralStatusEnum('status').default('visited'),
  rewardSent: boolean('reward_sent').default(false),
  // New fields for MVP
  referrerUserId: text('referrer_user_id').references(() => usersSchema.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  referredUserId: text('referred_user_id').references(() => usersSchema.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  referralCode: text('referral_code').unique(), // Base64 encoded referrer user ID
  clickCount: integer('click_count').default(0).notNull(),
  conversionCount: integer('conversion_count').default(0).notNull(),
  rewardAmount: integer('reward_amount').default(0).notNull(), // In cents
  discountAmount: integer('discount_amount').default(0).notNull(), // In cents
  socialPlatform: sharePlatformEnum('social_platform'),
  metadata: jsonb('metadata'), // Additional tracking data
  expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow(),
});

// Referral system configuration table
export const referralConfigSchema = pgTable('referral_config', {
  id: serial('id').primaryKey(),
  enabled: boolean('enabled').default(false).notNull(),
  rewardType: discountTypeEnum('reward_type').default('percentage').notNull(),
  rewardValue: integer('reward_value').default(20).notNull(), // 20% or 2000 cents
  cookieDays: integer('cookie_days').default(30).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow(),
  updatedBy: text('updated_by').references(() => usersSchema.id, { onDelete: 'set null', onUpdate: 'cascade' }),
});

export const shareActivitiesSchema = pgTable('share_activities', {
  id: text('id').primaryKey(),
  referralCode: text('referral_code').notNull(),
  platform: sharePlatformEnum('platform').notNull(),
  shareType: text('share_type').default('link'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(),
});

// User images table for Cloudflare R2 storage with ChatGPT integration
export const userImagesSchema = pgTable('user_images', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersSchema.id, { onDelete: 'cascade' }), // 修改为text类型
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: imageMimeTypeEnum('mime_type').notNull(),
  url: text('url').notNull(),
  r2Key: varchar('r2_key', { length: 500 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow(),

  // ChatGPT integration fields
  description: text('description'),
  tags: text('tags').array(),
  aiAnalyzed: boolean('ai_analyzed').default(false).notNull(),
  aiDescription: text('ai_description'),
}, table => ({
  userIdIdx: index('idx_user_images_user_id').on(table.userId),
  createdAtIdx: index('idx_user_images_created_at').on(table.createdAt),
  aiAnalyzedIdx: index('idx_user_images_ai_analyzed').on(table.aiAnalyzed),
  r2KeyIdx: uniqueIndex('idx_user_images_r2_key').on(table.r2Key),
}));

// Subscription management tables
export const subscriptionsSchema = pgTable('subscriptions', {
  id: text('id').primaryKey(), // Nanoid generated
  userId: text('user_id').notNull().references(() => usersSchema.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  stripeSubscriptionId: text('stripe_subscription_id').unique().notNull(),
  stripeCustomerId: text('stripe_customer_id').notNull(),
  stripePriceId: text('stripe_price_id').notNull(),
  planId: subscriptionPlanEnum('plan_id').notNull(),
  status: subscriptionStatusEnum('status').notNull(),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true, mode: 'date' }).notNull(),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true, mode: 'date' }).notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  canceledAt: timestamp('canceled_at', { withTimezone: true, mode: 'date' }),
  trialStart: timestamp('trial_start', { withTimezone: true, mode: 'date' }),
  trialEnd: timestamp('trial_end', { withTimezone: true, mode: 'date' }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow(),
}, table => ({
  userIdIdx: index('idx_subscriptions_user_id').on(table.userId),
  stripeSubscriptionIdIdx: uniqueIndex('idx_subscriptions_stripe_id').on(table.stripeSubscriptionId),
  statusIdx: index('idx_subscriptions_status').on(table.status),
  planStatusIdx: index('idx_subscriptions_plan_status').on(table.planId, table.status),
}));

// Usage tracking for subscription limits
export const subscriptionUsageSchema = pgTable('subscription_usage', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersSchema.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  subscriptionId: text('subscription_id').references(() => subscriptionsSchema.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  resourceType: usageResourceEnum('resource_type').notNull(),
  usageCount: integer('usage_count').default(0).notNull(),
  limitCount: integer('limit_count').notNull(),
  periodStart: timestamp('period_start', { withTimezone: true, mode: 'date' }).notNull(),
  periodEnd: timestamp('period_end', { withTimezone: true, mode: 'date' }).notNull(),
  resetAt: timestamp('reset_at', { withTimezone: true, mode: 'date' }), // Next reset time for monthly/daily limits
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow(),
}, table => ({
  userIdResourceIdx: index('idx_usage_user_resource').on(table.userId, table.resourceType),
  periodIdx: index('idx_usage_period').on(table.periodStart, table.periodEnd),
  resetAtIdx: index('idx_usage_reset_at').on(table.resetAt),
  subscriptionIdIdx: index('idx_usage_subscription_id').on(table.subscriptionId),
}));

// Palm AI Analysis Tables
export const palmAnalysisStatusEnum = pgEnum('palm_analysis_status', ['pending', 'processing', 'completed', 'failed', 'expired']);
export const palmReportTypeEnum = pgEnum('palm_report_type', ['quick', 'full', 'premium']);
export const palmHandTypeEnum = pgEnum('palm_hand_type', ['left', 'right', 'both']);

// Palm analysis sessions - 支持双手图片分析
export const palmAnalysisSessionsSchema = pgTable('palm_analysis_sessions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => usersSchema.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  
  // 双手图片支持
  leftHandImageUrl: text('left_hand_image_url'), // 左手图片URL
  rightHandImageUrl: text('right_hand_image_url'), // 右手图片URL
  imageMetadata: jsonb('image_metadata'), // 图片元数据 (尺寸、格式等)
  
  status: palmAnalysisStatusEnum('status').default('pending').notNull(),
  analysisType: palmReportTypeEnum('analysis_type').default('quick').notNull(), // quick 或 complete
  
  // 用户出生信息用于占星分析
  birthDate: date('birth_date', { mode: 'date' }),
  birthTime: text('birth_time'), // HH:MM format
  birthLocation: text('birth_location'),
  
  // 分析结果
  palmFeatures: jsonb('palm_features'), // 提取的手掌特征 (线条、手掌形状等)
  analysisResult: jsonb('analysis_result'), // 完整分析结果
  processingTime: integer('processing_time'), // 处理时间(毫秒)
  
  // 处理元数据
  processingStartedAt: timestamp('processing_started_at', { withTimezone: true, mode: 'date' }),
  completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').default(0),
  
  // 业务指标
  conversionStep: text('conversion_step').default('uploaded'), // uploaded, quick_viewed, payment_initiated, payment_completed
  paymentIntentId: text('payment_intent_id'),
  upgradedAt: timestamp('upgraded_at', { withTimezone: true, mode: 'date' }), // 升级到完整分析的时间
  
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow(),
}, table => ({
  userIdIdx: index('idx_palm_sessions_user_id').on(table.userId),
  statusIdx: index('idx_palm_sessions_status').on(table.status),
  createdAtIdx: index('idx_palm_sessions_created_at').on(table.createdAt),
  analysisTypeIdx: index('idx_palm_sessions_analysis_type').on(table.analysisType),
  conversionStepIdx: index('idx_palm_sessions_conversion').on(table.conversionStep),
}));

// Palm reading reports
export const palmReportsSchema = pgTable('palm_reports', {
  id: text('id').primaryKey(), // Nanoid generated
  sessionId: text('session_id').notNull().references(() => palmAnalysisSessionsSchema.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  userId: text('user_id').references(() => usersSchema.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  reportType: palmReportTypeEnum('report_type').notNull(),
  
  // Report content
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  personalityAnalysis: jsonb('personality_analysis'),
  healthAnalysis: jsonb('health_analysis'),
  careerAnalysis: jsonb('career_analysis'),
  relationshipAnalysis: jsonb('relationship_analysis'),
  fortuneAnalysis: jsonb('fortune_analysis'),
  
  // Full report exclusive content
  detailedAnalysis: jsonb('detailed_analysis'), // Palmistry, astrology, numerology, tarot
  recommendations: jsonb('recommendations'),
  futureInsights: jsonb('future_insights'),
  compatibilityAnalysis: jsonb('compatibility_analysis'),
  dailyGuidance: jsonb('daily_guidance'),
  monthlyForecast: jsonb('monthly_forecast'),
  yearlyOutlook: jsonb('yearly_outlook'),
  
  // Report metadata
  confidence: decimal('confidence', { precision: 3, scale: 2 }), // 0.00 to 1.00
  language: text('language').default('en'),
  version: text('version').default('1.0'),
  
  // Access control
  isPaid: boolean('is_paid').default(false),
  accessExpiresAt: timestamp('access_expires_at', { withTimezone: true, mode: 'date' }),
  viewCount: integer('view_count').default(0),
  lastViewedAt: timestamp('last_viewed_at', { withTimezone: true, mode: 'date' }),
  
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow(),
}, table => ({
  sessionIdIdx: index('idx_palm_reports_session_id').on(table.sessionId),
  userIdIdx: index('idx_palm_reports_user_id').on(table.userId),
  reportTypeIdx: index('idx_palm_reports_type').on(table.reportType),
  isPaidIdx: index('idx_palm_reports_is_paid').on(table.isPaid),
  createdAtIdx: index('idx_palm_reports_created_at').on(table.createdAt),
  accessExpiresIdx: index('idx_palm_reports_access_expires').on(table.accessExpiresAt),
}));

// Palm analysis feedback and ratings
export const palmFeedbackSchema = pgTable('palm_feedback', {
  id: serial('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => palmAnalysisSessionsSchema.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  userId: text('user_id').references(() => usersSchema.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  reportId: text('report_id').references(() => palmReportsSchema.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  
  // Feedback data
  rating: integer('rating').notNull(), // 1-5 stars
  accuracy: integer('accuracy'), // 1-5 scale
  usefulness: integer('usefulness'), // 1-5 scale
  satisfaction: integer('satisfaction'), // 1-5 scale
  
  // Text feedback
  comment: text('comment'),
  improvements: text('improvements'),
  
  // Feedback metadata
  feedbackType: text('feedback_type').default('general'), // general, accuracy, technical
  isPublic: boolean('is_public').default(false),
  
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, table => ({
  sessionIdIdx: index('idx_palm_feedback_session_id').on(table.sessionId),
  userIdIdx: index('idx_palm_feedback_user_id').on(table.userId),
  ratingIdx: index('idx_palm_feedback_rating').on(table.rating),
  createdAtIdx: index('idx_palm_feedback_created_at').on(table.createdAt),
}));
