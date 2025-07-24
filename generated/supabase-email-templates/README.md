# Supabase Email Templates Summary

Generated on: 2025-07-13T07:55:35.760Z

## Available Templates

### invite
**Description**: User Invitation Email / 用户邀请邮件

**Available Languages**:
- [English (en)](invite-en.html)
- [繁體中文 (zh-HK)](invite-zh-HK.html)
- [日本語 (ja)](invite-ja.html)

### confirmation
**Description**: Registration Confirmation Email / 注册确认邮件

**Available Languages**:
- [English (en)](confirmation-en.html)
- [繁體中文 (zh-HK)](confirmation-zh-HK.html)
- [日本語 (ja)](confirmation-ja.html)

### recovery
**Description**: Password Reset Email / 密码重置邮件

**Available Languages**:
- [English (en)](recovery-en.html)
- [繁體中文 (zh-HK)](recovery-zh-HK.html)
- [日本語 (ja)](recovery-ja.html)

### magic_link
**Description**: Magic Link Login Email / 魔法链接登录邮件

**Available Languages**:
- [English (en)](magic_link-en.html)
- [繁體中文 (zh-HK)](magic_link-zh-HK.html)
- [日本語 (ja)](magic_link-ja.html)

### email_change
**Description**: Email Change Confirmation / 邮箱变更确认邮件

**Available Languages**:
- [English (en)](email_change-en.html)
- [繁體中文 (zh-HK)](email_change-zh-HK.html)
- [日本語 (ja)](email_change-ja.html)

### reauthentication
**Description**: Reauthentication Email (with OTP) / 重新认证邮件（含OTP）

**Available Languages**:
- [English (en)](reauthentication-en.html)
- [繁體中文 (zh-HK)](reauthentication-zh-HK.html)
- [日本語 (ja)](reauthentication-ja.html)

# Supabase Email Templates Configuration Guide

## 配置步骤

1. 登录 Supabase Dashboard
2. 进入 **Authentication** > **Email Templates**
3. 选择要配置的邮件类型
4. 设置以下配置：
   - **Content Type**: `text/html`
   - **Subject**: 使用对应语言的主题
   - **Body**: 复制对应的 HTML 模板内容

## 模板变量说明

| 变量 | 描述 | 使用场景 |
|------|------|----------|
| `{{ .ConfirmationURL }}` | 确认链接URL | 大部分邮件类型 |
| `{{ .Token }}` | 6位OTP代码 | reauthentication |
| `{{ .TokenHash }}` | 哈希化的Token | 可选 |
| `{{ .SiteURL }}` | 应用站点URL | 所有邮件类型 |
| `{{ .Email }}` | 用户邮箱 | 所有邮件类型 |
| `{{ .NewEmail }}` | 新邮箱地址 | email_change |

## 注意事项

- 确保所有必需的变量都包含在模板中
- 测试模板在不同设备上的显示效果
- 定期检查邮件送达率和用户反馈
- 保持品牌一致性

## 多语言支持

本系统支持以下语言：
- English (en)
- 繁體中文 (zh-HK)
- 日本語 (ja)

根据用户的语言偏好选择对应的模板。
