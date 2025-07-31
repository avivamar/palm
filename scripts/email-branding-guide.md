# 📧 邮件品牌化指南 - Rolitt Logo显示

## 🎯 邮件中显示Logo的方法

### 方法1: BIMI (Brand Indicators for Message Identification) ⭐ 推荐
BIMI是最新的邮件品牌标准，支持在邮件客户端直接显示品牌logo。

#### 📋 BIMI实施步骤

1. **准备SVG格式Logo**
   - 格式：SVG (Scalable Vector Graphics)
   - 尺寸：正方形，建议1:1比例
   - 大小：小于32KB
   - 背景：透明或纯色

2. **创建BIMI DNS记录**
```dns
# 记录类型: TXT
# 主机名: default._bimi.rolitt.com
# 记录值: v=BIMI1; l=https://rolitt.com/assets/logo/bimi-palmlogo.svg; a=https://rolitt.com/assets/certificates/vmc.pem
```

3. **获取VMC证书** (可选但推荐)
   - VMC (Verified Mark Certificate) 验证品牌所有权
   - 提供商：DigiCert, Entrust等
   - 费用：约$1500-3000/年

#### 🔧 BIMI配置脚本
```bash
# 添加BIMI DNS记录
./scripts/add-bimi-record.sh
```

### 方法2: 邮件模板中嵌入Logo 📧
在邮件HTML模板中直接嵌入logo图片。

#### Zoho邮件设置
1. 登录Zoho Mail管理面板
2. 进入 **Mail** → **Email Hosting** → **Organization**
3. 设置 **Organization Logo**
4. 配置邮件签名模板

#### Klaviyo营销邮件设置
1. 登录Klaviyo Dashboard
2. 进入 **Content** → **Templates**
3. 编辑邮件模板，添加logo图片
4. 使用CDN链接确保图片加载速度

#### Amazon SES邮件模板
```html
<!-- 邮件模板示例 -->
<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" style="padding: 20px;">
      <img src="https://rolitt.com/assets/images/logo.png"
           alt="Rolitt"
           width="150"
           height="auto"
           style="display: block; max-width: 150px;">
    </td>
  </tr>
</table>
```

### 方法3: 邮件客户端配置 📱
配置邮件客户端显示发件人头像/logo。

#### Gmail配置
1. 使用Google Workspace
2. 设置组织logo
3. 配置发件人显示名称

#### Outlook配置
1. 设置发件人头像
2. 配置组织品牌
3. 使用Exchange Online品牌功能

## 🛠️ 技术实施方案

### 1. 准备Logo资源
```bash
# 创建logo资源目录
mkdir -p public/assets/images/email/
mkdir -p public/assets/logo/

# Logo格式要求
# - PNG: 透明背景，适用于邮件模板
# - SVG: 矢量格式，适用于BIMI
# - 尺寸: 150x150px (邮件), 正方形 (BIMI)
```

### 2. 上传到CDN
```bash
# 使用Cloudflare或其他CDN
# 确保logo链接稳定可访问
https://rolitt.com/assets/images/email/logo.png
https://rolitt.com/assets/logo/bimi-palmlogo.svg
```

### 3. 配置各平台

#### Zoho邮件品牌化
```bash
# 登录Zoho管理面板
# 路径: Organization → Branding → Logo
# 上传: 150x150px PNG格式logo
```

#### Klaviyo模板配置
```html
<!-- Klaviyo邮件模板 -->
<div style="text-align: center; padding: 20px;">
  <img src="https://rolitt.com/assets/images/email/logo.png"
       alt="Rolitt"
       style="max-width: 150px; height: auto;">
</div>
```

#### Amazon SES模板
```json
{
  "TemplateName": "RolittBrandedTemplate",
  "Subject": "{{subject}}",
  "HtmlPart": "<!DOCTYPE html><html><head></head><body><div style='text-align:center;padding:20px;'><img src='https://rolitt.com/assets/images/email/logo.png' alt='Rolitt' style='max-width:150px;'></div><div>{{content}}</div></body></html>",
  "TextPart": "{{content}}"
}
```

## 📊 BIMI支持的邮件客户端

### ✅ 完全支持
- Gmail (Web, Mobile)
- Yahoo Mail
- Apple Mail (iOS 16+)
- Fastmail

### 🔄 部分支持
- Outlook.com (逐步推出)
- AOL Mail

### ❌ 暂不支持
- Outlook Desktop
- Thunderbird

## 🔧 自动化配置脚本

让我为您创建自动化配置脚本：

```bash
# 检查当前邮件品牌配置
./scripts/check-email-branding.sh

# 配置BIMI记录
./scripts/setup-bimi.sh

# 验证BIMI配置
./scripts/verify-bimi.sh
```

## 📋 实施优先级

### 🚀 立即实施 (高优先级)
1. **邮件模板logo**: 在Zoho、Klaviyo、SES模板中添加logo
2. **CDN配置**: 确保logo图片稳定可访问
3. **邮件签名**: 统一所有平台的邮件签名

### 📈 中期实施 (中优先级)
1. **BIMI DNS记录**: 添加基础BIMI配置
2. **SVG logo优化**: 创建符合BIMI标准的SVG logo
3. **测试验证**: 在各邮件客户端测试显示效果

### 🏆 长期实施 (低优先级)
1. **VMC证书**: 获取验证标记证书
2. **高级BIMI**: 完整BIMI实施
3. **品牌一致性**: 确保所有渠道品牌统一

## 💡 最佳实践建议

### Logo设计要求
- **尺寸**: 150x150px (邮件), 正方形 (BIMI)
- **格式**: PNG (透明背景), SVG (BIMI)
- **大小**: 小于50KB (邮件), 小于32KB (BIMI)
- **风格**: 简洁明了，在小尺寸下清晰可见

### 技术要求
- **CDN加速**: 使用Cloudflare等CDN确保加载速度
- **HTTPS**: 所有logo链接必须使用HTTPS
- **备用方案**: 提供alt文本和备用显示方案

### 测试验证
- **多客户端测试**: Gmail, Outlook, Apple Mail等
- **移动端适配**: 确保在手机上显示正常
- **加载速度**: 确保logo快速加载

---

**下一步**: 我可以帮您创建具体的配置脚本和logo优化建议。您希望从哪个方法开始实施？
