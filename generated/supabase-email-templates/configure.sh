#!/bin/bash
# Supabase Email Templates Configuration Script
# 此脚本帮助快速配置 Supabase Dashboard 邮件模板

echo "🚀 Supabase Email Templates Configuration"
echo "==========================================="
echo ""
echo "📋 Available Templates:"

echo "   - invite: User Invitation Email / 用户邀请邮件"
echo "   - confirmation: Registration Confirmation Email / 注册确认邮件"
echo "   - recovery: Password Reset Email / 密码重置邮件"
echo "   - magic_link: Magic Link Login Email / 魔法链接登录邮件"
echo "   - email_change: Email Change Confirmation / 邮箱变更确认邮件"
echo "   - reauthentication: Reauthentication Email (with OTP) / 重新认证邮件（含OTP）"

echo ""
echo "🌐 Available Languages:"
echo "   - en: English"
echo "   - zh-HK: 繁體中文"
echo "   - ja: 日本語"

echo ""
echo "📁 Template files are located in: ./generated/supabase-email-templates/"
echo ""
echo "📖 Configuration Instructions:"
echo "   1. Open Supabase Dashboard"
echo "   2. Go to Authentication > Email Templates"
echo "   3. Select email type"
echo "   4. Set Content Type to 'text/html'"
echo "   5. Copy template content from corresponding .html file"
echo "   6. Save configuration"
echo ""
echo "✅ Setup complete! Check the generated files for template content."
