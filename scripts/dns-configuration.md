# DNS配置优化指南 - rolitt.com

## 当前配置分析 (2025-01-28)

### 检测到的问题
- DKIM对齐失败：使用严格模式但域名不匹配
- 需要优化DMARC策略以提高邮件投递率

### 当前DNS记录状态

#### DMARC记录
```
_dmarc.rolitt.com    TXT    "v=DMARC1; p=none; rua=mailto:support@rolitt.com; ruf=mailto:support@rolitt.com; sp=none; adkim=s; aspf=r"
```

#### SPF记录
```
rolitt.com    TXT    "v=spf1 include:zohomail.com include:_spf.mx.cloudflare.net ~all"
```

#### DKIM记录
```
mtd1._domainkey.send.rolitt.com    CNAME    mtd1._domainkey.135235.klaviyodns.com
```

## 推荐的DNS配置更新

### 1. 立即修复 - DMARC记录优化

**当前记录**：严格DKIM对齐导致失败
**新记录**：改为宽松模式

```dns
# 记录类型: TXT
# 主机名: _dmarc.rolitt.com
# 值:
v=DMARC1; p=none; rua=mailto:support@rolitt.com; ruf=mailto:support@rolitt.com; sp=none; adkim=r; aspf=r; pct=100
```

### 2. SPF记录优化

**当前记录**：基本配置
**新记录**：添加Klaviyo支持

```dns
# 记录类型: TXT
# 主机名: rolitt.com
# 值:
v=spf1 include:zohomail.com include:_spf.mx.cloudflare.net include:sendgrid.net include:mktomail.com ~all
```

### 3. 邮件发送域名优化

为了更好的邮件投递，建议配置专用发送域名：

```dns
# 记录类型: CNAME
# 主机名: mail.rolitt.com
# 值: send.rolitt.com

# 记录类型: TXT
# 主机名: mail.rolitt.com
# 值:
v=spf1 include:_spf.klaviyo.com include:zohomail.com ~all
```

## 分阶段实施计划

### 阶段1: 立即修复 (0-24小时)
1. 更新DMARC记录：`adkim=s` → `adkim=r`
2. 验证DNS传播

### 阶段2: 监控期 (1-7天)
1. 监控DMARC报告
2. 确认DKIM对齐成功率提升
3. 检查邮件投递率

### 阶段3: 强化安全 (1-2周后)
```dns
# 升级到隔离模式
_dmarc.rolitt.com    TXT    "v=DMARC1; p=quarantine; rua=mailto:support@rolitt.com; ruf=mailto:support@rolitt.com; sp=quarantine; adkim=r; aspf=r; pct=100"
```

### 阶段4: 最终安全策略 (1个月后)
```dns
# 升级到拒绝模式
_dmarc.rolitt.com    TXT    "v=DMARC1; p=reject; rua=mailto:support@rolitt.com; ruf=mailto:support@rolitt.com; sp=reject; adkim=r; aspf=r; pct=100"
```

## DNS提供商配置示例

### Cloudflare配置
```
类型: TXT
名称: _dmarc
内容: v=DMARC1; p=none; rua=mailto:support@rolitt.com; ruf=mailto:support@rolitt.com; sp=none; adkim=r; aspf=r; pct=100
TTL: 自动
```

### 阿里云DNS配置
```
记录类型: TXT
主机记录: _dmarc
记录值: v=DMARC1; p=none; rua=mailto:support@rolitt.com; ruf=mailto:support@rolitt.com; sp=none; adkim=r; aspf=r; pct=100
TTL: 600
```

### 腾讯云DNS配置
```
记录类型: TXT
主机记录: _dmarc
记录值: v=DMARC1; p=none; rua=mailto:support@rolitt.com; ruf=mailto:support@rolitt.com; sp=none; adkim=r; aspf=r; pct=100
TTL: 600
```

## 验证脚本

配置完成后，使用以下命令验证：

```bash
# 验证DMARC记录
dig TXT _dmarc.rolitt.com

# 验证SPF记录
dig TXT rolitt.com

# 验证DKIM记录
dig TXT mtd1._domainkey.send.rolitt.com

# 等待24小时后检查邮件测试
echo "请发送测试邮件到Gmail账户验证配置"
```

## 监控建议

1. **DMARC报告监控**：每日查看support@rolitt.com的DMARC报告
2. **邮件投递率**：监控营销邮件的送达率和垃圾邮件率
3. **安全告警**：设置未授权发送的监控告警

## 故障排除

### 常见问题
1. **DNS传播延迟**：等待24-48小时
2. **DKIM签名失败**：联系Klaviyo确认配置
3. **SPF记录过长**：优化include语句数量

### 紧急联系
- DNS配置问题：联系域名提供商
- 邮件服务问题：联系Klaviyo支持团队
- DMARC报告异常：检查support@rolitt.com邮箱

---
最后更新：2025-01-28
维护者：技术团队
