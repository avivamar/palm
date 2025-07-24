# Cloudflare 快速DNS配置 - rolitt.com
🚀 5分钟解决DMARC DKIM对齐问题

## 🎯 立即行动 - 2步搞定

### 步骤1: 修复DMARC记录 (最重要)

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 选择域名 `rolitt.com`
3. 点击左侧菜单 **DNS** → **Records**
4. 找到现有的 `_dmarc` TXT记录
5. 点击 **Edit** 按钮
6. 将内容替换为：

```
v=DMARC1; p=none; rua=mailto:support@rolitt.com; ruf=mailto:support@rolitt.com; sp=none; adkim=r; aspf=r; pct=100
```

**关键变化**: 只需将 `adkim=s` 改为 `adkim=r`

### 步骤2: 更新SPF记录 (推荐)

1. 找到 `@` 的TXT记录中包含 `v=spf1` 的那条
2. 点击 **Edit** 按钮
3. 将内容替换为：

```
v=spf1 include:zohomail.com include:_spf.mx.cloudflare.net include:_spf.klaviyo.com ~all
```

**关键变化**: 添加 `include:_spf.klaviyo.com`

## 📱 Cloudflare界面操作截图指南

### DNS记录界面样式：
```
┌─────────────────────────────────────────────────────────────┐
│ Type │ Name    │ Content                               │ TTL │
├─────────────────────────────────────────────────────────────┤
│ TXT  │ _dmarc  │ v=DMARC1; p=none; rua=mailto:...     │Auto │ [Edit]
│ TXT  │ @       │ v=spf1 include:zohomail.com...       │Auto │ [Edit]
└─────────────────────────────────────────────────────────────┘
```

## ⚡ Cloudflare优势

- **快速传播**: 通常15-30分钟全球生效
- **自动TTL**: 无需手动设置TTL值
- **即时验证**: 保存后立即可验证
- **版本控制**: 可查看修改历史

## 🔍 配置完成后立即验证

保存记录后，在终端运行：

```bash
# 验证DMARC记录更新
dig TXT _dmarc.rolitt.com

# 验证SPF记录更新
dig TXT rolitt.com

# 或者运行我们的检查脚本
./scripts/dns-check.sh
```

## 🚨 Cloudflare特殊注意事项

### Proxy Status (代理状态)
- **邮件相关DNS记录必须设置为 "DNS only" (灰色云朵)**
- **不要启用Proxy (橙色云朵)**

### 正确设置：
```
TXT  _dmarc   v=DMARC1; p=none...   Auto  🌫️ (灰色)
TXT  @        v=spf1 include:...    Auto  🌫️ (灰色)
```

### ❌ 错误设置：
```
TXT  _dmarc   v=DMARC1; p=none...   Auto  ☁️ (橙色) ← 会导致问题
```

## 📋 完整操作清单

- [ ] 登录Cloudflare Dashboard
- [ ] 选择rolitt.com域名
- [ ] 进入DNS Records页面
- [ ] 修改_dmarc记录：`adkim=s` → `adkim=r`
- [ ] 更新SPF记录：添加`include:_spf.klaviyo.com`
- [ ] 确认所有邮件DNS记录为"DNS only"模式
- [ ] 保存更改
- [ ] 运行验证命令确认更新成功

## 🕐 时间预期

- **DNS保存**: 立即
- **Cloudflare传播**: 15-30分钟
- **全球传播**: 1-2小时
- **邮件服务识别**: 2-6小时
- **DMARC报告改善**: 24-48小时

## 🆘 如果遇到问题

### 常见问题解决：

**问题1**: 找不到_dmarc记录
```bash
# 先确认记录是否存在
dig TXT _dmarc.rolitt.com
```

**问题2**: 修改后dig命令还显示旧值
- 等待15-30分钟让Cloudflare传播
- 清除本地DNS缓存：`sudo dscacheutil -flushcache`

**问题3**: 记录保存失败
- 确认内容没有多余空格
- 检查邮箱地址格式正确
- 确保单条TXT记录不超过255字符

## 🎉 完成后的预期效果

24小时内您应该看到：
- ✅ DKIM对齐成功率提升到100%
- ✅ 邮件投递率改善
- ✅ 减少进入垃圾邮件文件夹
- ✅ 下次Google DMARC报告显示正常

## 📞 技术支持

如果配置过程中遇到任何问题：
1. 先运行 `./scripts/dns-check.sh` 检查当前状态
2. 查看Cloudflare的DNS Records页面确认保存成功
3. 等待30分钟后重新检查

---
**预估完成时间**: 5分钟配置 + 30分钟等待生效
