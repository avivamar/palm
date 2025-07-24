# 📧 邮件模板Logo配置指南

## 🎯 概述

本指南将帮助您在所有邮件服务中配置Rolitt品牌logo，确保邮件的品牌一致性。

## 📋 准备工作

### 1. Logo文件准备
```bash
# 确保logo文件已准备好
public/assets/logo/bimi-logo.svg     # BIMI用SVG格式
public/assets/images/email/logo.png  # 邮件模板用PNG格式
```

### 2. 创建邮件专用logo
```bash
# 创建目录
mkdir -p public/assets/images/email/

# 推荐尺寸和格式
# - PNG格式，透明背景
# - 尺寸：150x150px 或 200x60px (横版)
# - 文件大小：<50KB
# - 适合在邮件中显示的简洁设计
```

## 🔧 各平台配置指南

### 1. Zoho Mail 配置

#### 组织Logo设置
1. **登录Zoho Mail管理面板**
   - 访问：https://mailadmin.zoho.com/
   - 使用管理员账户登录

2. **设置组织Logo**
   ```
   路径：Organization → Branding → Logo

   设置项：
   - Organization Logo: 上传150x150px PNG格式logo
   - Email Header Logo: 上传200x60px横版logo
   - 确保选择"在所有邮件中显示logo"
   ```

3. **配置邮件签名**
   ```
   路径：Mail → Email Hosting → Signature

   HTML模板：
   <table cellpadding="0" cellspacing="0" border="0">
     <tr>
       <td>
         <img src="https://rolitt.com/assets/images/email/logo.png"
              alt="Rolitt"
              width="120"
              height="auto"
              style="display: block; max-width: 120px;">
       </td>
     </tr>
   </table>
   ```

#### 自定义邮件模板
```html
<!-- Zoho自定义邮件模板 -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <!-- Header with Logo -->
        <tr>
            <td align="center" style="padding: 20px; background-color: #f8f9fa;">
                <img src="https://rolitt.com/assets/images/email/logo.png"
                     alt="Rolitt"
                     width="150"
                     height="auto"
                     style="display: block; max-width: 150px;">
            </td>
        </tr>
        <!-- Content -->
        <tr>
            <td style="padding: 20px;">
                {{content}}
            </td>
        </tr>
        <!-- Footer -->
        <tr>
            <td align="center" style="padding: 20px; background-color: #f8f9fa; font-size: 12px; color: #666;">
                © 2024 Rolitt. All rights reserved.
            </td>
        </tr>
    </table>
</body>
</html>
```

### 2. Klaviyo 营销邮件配置

#### 模板设置
1. **登录Klaviyo Dashboard**
   - 访问：https://www.klaviyo.com/
   - 进入您的账户

2. **创建邮件模板**
   ```
   路径：Content → Templates → Create Template

   步骤：
   1. 选择"Custom HTML"或使用拖拽编辑器
   2. 添加logo图片块
   3. 设置图片URL: https://rolitt.com/assets/images/email/logo.png
   4. 设置alt文本: "Rolitt"
   5. 设置尺寸: 最大宽度150px
   ```

3. **HTML模板代码**
   ```html
   <!-- Klaviyo邮件模板 -->
   <div style="text-align: center; padding: 20px; background-color: #ffffff;">
       <img src="https://rolitt.com/assets/images/email/logo.png"
            alt="Rolitt"
            style="max-width: 150px; height: auto; display: block; margin: 0 auto;">
   </div>

   <!-- 内容区域 -->
   <div style="padding: 20px;">
       {% content %}
   </div>

   <!-- 页脚 -->
   <div style="text-align: center; padding: 20px; background-color: #f8f9fa; font-size: 12px; color: #666;">
       © 2024 Rolitt. All rights reserved.<br>
       <a href="{% unsubscribe_url %}" style="color: #666;">Unsubscribe</a>
   </div>
   ```

#### 品牌设置
```
路径：Account → Settings → Branding

设置项：
- Company Logo: 上传logo文件
- Brand Colors: 设置主色调 #EBFF7F
- 默认发件人名称: Rolitt
- 默认发件人邮箱: noreply@rolitt.com
```

### 3. Amazon SES 配置

#### 创建邮件模板
1. **AWS控制台设置**
   ```bash
   # 使用AWS CLI创建模板
   aws ses create-template --template '{
     "TemplateName": "RolittBrandedTemplate",
     "Subject": "{{subject}}",
     "HtmlPart": "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"></head><body style=\"margin: 0; padding: 0; font-family: Arial, sans-serif;\"><table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr><td align=\"center\" style=\"padding: 20px; background-color: #f8f9fa;\"><img src=\"https://rolitt.com/assets/images/email/logo.png\" alt=\"Rolitt\" width=\"150\" height=\"auto\" style=\"display: block; max-width: 150px;\"></td></tr><tr><td style=\"padding: 20px;\">{{content}}</td></tr><tr><td align=\"center\" style=\"padding: 20px; background-color: #f8f9fa; font-size: 12px; color: #666;\">© 2024 Rolitt. All rights reserved.</td></tr></table></body></html>",
     "TextPart": "{{content}}\n\n© 2024 Rolitt. All rights reserved."
   }'
   ```

2. **详细HTML模板**
   ```html
   <!DOCTYPE html>
   <html>
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>{{subject}}</title>
   </head>
   <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff;">
       <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto;">
           <!-- Header -->
           <tr>
               <td align="center" style="padding: 30px 20px; background-color: #f8f9fa;">
                   <img src="https://rolitt.com/assets/images/email/logo.png"
                        alt="Rolitt"
                        width="150"
                        height="auto"
                        style="display: block; max-width: 150px; height: auto;">
               </td>
           </tr>

           <!-- Content -->
           <tr>
               <td style="padding: 30px 20px; background-color: #ffffff;">
                   <div style="font-size: 16px; line-height: 1.6; color: #333333;">
                       {{content}}
                   </div>
               </td>
           </tr>

           <!-- Footer -->
           <tr>
               <td align="center" style="padding: 20px; background-color: #f8f9fa;">
                   <div style="font-size: 12px; color: #666666; line-height: 1.4;">
                       © 2024 Rolitt. All rights reserved.<br>
                       <a href="{{unsubscribe_url}}" style="color: #666666;">Unsubscribe</a>
                   </div>
               </td>
           </tr>
       </table>
   </body>
   </html>
   ```

3. **使用模板发送邮件**
   ```javascript
   // Node.js示例
   const AWS = require('aws-sdk');

   const ses = new AWS.SES({ region: 'us-east-1' });

   const params = {
     Source: 'noreply@rolitt.com',
     Destination: {
       ToAddresses: ['customer@example.com']
     },
     Template: 'RolittBrandedTemplate',
     TemplateData: JSON.stringify({
       subject: 'Welcome to Rolitt',
       content: 'Thank you for joining us!'
     })
   };

   ses.sendTemplatedEmail(params).promise();
   ```

## 🎨 Logo优化建议

### 邮件专用Logo设计
```css
/* 推荐CSS样式 */
.email-logo {
  max-width: 150px;
  height: auto;
  display: block;
  margin: 0 auto;
}

/* 响应式设计 */
@media only screen and (max-width: 600px) {
  .email-logo {
    max-width: 120px;
  }
}
```

### 文件优化
- **PNG格式**: 透明背景，适合各种邮件背景
- **尺寸**: 150x150px (正方形) 或 200x60px (横版)
- **大小**: <50KB，确保快速加载
- **分辨率**: 72-96 DPI，适合屏幕显示

## 🔍 测试和验证

### 测试清单
```bash
# 1. 发送测试邮件
./scripts/send-test-email.sh

# 2. 检查各邮件客户端显示效果
# - Gmail (Web, Mobile)
# - Outlook (Web, Desktop)
# - Apple Mail
# - Yahoo Mail

# 3. 验证logo加载速度
curl -w "@curl-format.txt" -o /dev/null -s "https://rolitt.com/assets/images/email/logo.png"

# 4. 检查HTTPS访问
curl -I "https://rolitt.com/assets/images/email/logo.png"
```

### 常见问题排查
1. **Logo不显示**
   - 检查图片URL是否可访问
   - 确认HTTPS配置正确
   - 验证图片格式和大小

2. **显示模糊**
   - 使用高分辨率图片
   - 确保图片尺寸适当
   - 检查CSS样式设置

3. **加载缓慢**
   - 优化图片大小
   - 使用CDN加速
   - 检查服务器响应时间

## 📊 效果监控

### 关键指标
- **邮件打开率**: 品牌logo可能提升识别度
- **点击率**: 专业外观可能提升信任度
- **投递率**: 良好的品牌形象有助于避免垃圾邮件

### 监控工具
```bash
# 检查邮件品牌配置状态
./scripts/check-email-branding.sh

# 验证BIMI配置
./scripts/verify-bimi.sh

# 监控邮件投递率
./scripts/monitor-email-delivery.sh
```

---

**🎉 完成配置后，您的所有邮件都将显示专业的Rolitt品牌logo！**
