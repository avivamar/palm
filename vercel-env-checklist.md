# Vercel环境变量配置检查清单

## 关键环境变量 (必须配置)
- [ ] DATABASE_URL ✅
- [ ] STRIPE_SECRET_KEY ✅
- [ ] STRIPE_WEBHOOK_SECRET ✅
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ✅
- [ ] APP_URL ✅
- [ ] NEXT_PUBLIC_APP_URL ✅

## 重要环境变量 (建议配置)  
- [ ] FIREBASE_SERVICE_ACCOUNT_KEY ✅
- [ ] NEXT_PUBLIC_FIREBASE_API_KEY ✅
- [ ] NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ✅
- [ ] NEXT_PUBLIC_FIREBASE_PROJECT_ID ✅
- [ ] NEXT_PUBLIC_FIREBASE_APP_ID ✅
- [ ] KLAVIYO_API_KEY ✅

## Admin 访问控制变量 (Admin 功能必需)
- [ ] ADMIN_ACCESS_ENABLED ✅
- [ ] ADMIN_MAINTENANCE_MODE ⚠️
- [ ] ADMIN_EMERGENCY_BYPASS ⚠️
- [ ] ADMIN_ALLOWED_IPS ⚠️

## 验证步骤
- [ ] 在Vercel Dashboard检查环境变量
- [ ] 重新部署应用
- [ ] 访问健康检查API: /api/debug/health
- [ ] 测试支付流程
- [ ] 测试 Admin 后台访问: /admin

## 常见问题
1. APP_URL必须指向Vercel域名，不能是localhost
2. JSON格式的环境变量需要用引号包裹
3. Stripe密钥必须匹配环境(test vs live)
4. 数据库URL必须包含SSL配置
5. ADMIN_ACCESS_ENABLED=true 才能访问 Admin 后台

生成时间: 2025-07-23T00:30:31.983Z
