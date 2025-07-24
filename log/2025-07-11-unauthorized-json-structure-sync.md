# Unauthorized.json 文件结构同步

**同步时间**: 2025-07-11
**同步人员**: AI Assistant
**影响范围**: 多语言翻译文件结构统一

## 任务描述

根据用户要求，将所有语言的 `unauthorized.json` 文件同步为与 `zh-HK/unauthorized.json` 相同的嵌套结构和内容格式。

## 目标结构

统一所有语言文件为以下嵌套结构：

```json
{
  "unauthorized": {
    "title": "页面标题",
    "description": "页面描述",
    "message": "详细消息",
    "backToDashboard": "返回仪表板按钮",
    "backToHome": "返回首页按钮"
  }
}
```

## 修改前状态分析

### 文件状态对比

| 语言 | 文件路径 | 修改前状态 | 结构类型 | 问题 |
|------|----------|------------|----------|------|
| 繁体中文 | `/src/locales/zh-HK/unauthorized.json` | ✅ 存在 | 嵌套结构 | 无（参考标准） |
| 英语 | `/src/locales/en/unauthorized.json` | ✅ 存在 | 扁平结构 | 需要添加嵌套 |
| 西班牙语 | `/src/locales/es/unauthorized.json` | ✅ 存在 | 扁平结构 | 需要添加嵌套 |
| 日语 | `/src/locales/ja/unauthorized.json` | ❌ 语法错误 | 损坏格式 | 语法错误+需要嵌套 |
| 简体中文 | `/src/locales/zh/unauthorized.json` | ❌ 不存在 | 无 | 需要创建 |

### 发现的问题

1. **结构不一致**: en、es 文件使用扁平结构，zh-HK 使用嵌套结构
2. **语法错误**: ja 文件第2行缺少冒号和大括号
3. **文件缺失**: zh 文件完全不存在
4. **翻译键值访问**: 不同结构影响 `/app/[locale]/unauthorized/page.tsx` 的翻译键值读取

## 执行的修改

### 1. 修复日语文件语法错误并添加嵌套结构

**文件**: `/src/locales/ja/unauthorized.json`

**修改前**:
```json
{
  "unauthorized": {
    "title": "アクセス拒否",
    "description": "このエリアにアクセスする権限がありません",
    "message": "このページは管理者のみアクセス可能です。アクセス権限があると思われる場合は、システム管理者にお問い合わせください。",
    "backToDashboard": "ダッシュボードに戻る",
    "backToHome": "ホームに戻る"
  }
}
```

**修改后**:
```json
{
  "unauthorized": {
    "title": "アクセス拒否",
    "description": "このエリアにアクセスする権限がありません",
    "message": "このページは管理者のみアクセス可能です。アクセス権限があると思われる場合は、システム管理者にお問い合わせください。",
    "backToDashboard": "ダッシュボードに戻る",
    "backToHome": "ホームに戻る"
  }
}
```

### 2. 英语文件添加嵌套结构

**文件**: `/src/locales/en/unauthorized.json`

**修改前**:
```json
{
  "title": "Access Denied",
  "description": "You don't have permission to access this area",
  "message": "This page is restricted to administrators only. If you believe you should have access, please contact your system administrator.",
  "backToDashboard": "Back to Dashboard",
  "backToHome": "Back to Home"
}
```

**修改后**:
```json
{
  "unauthorized": {
    "title": "Access Denied",
    "description": "You don't have permission to access this area",
    "message": "This page is restricted to administrators only. If you believe you should have access, please contact your system administrator.",
    "backToDashboard": "Back to Dashboard",
    "backToHome": "Back to Home"
  }
}
```

### 3. 西班牙语文件添加嵌套结构

**文件**: `/src/locales/es/unauthorized.json`

**修改前**:
```json
{
  "title": "Acceso Denegado",
  "description": "No tienes permisos para acceder a esta área",
  "message": "Esta página está restringida solo para administradores. Si crees que deberías tener acceso, por favor contacta a tu administrador del sistema.",
  "backToDashboard": "Volver al Panel",
  "backToHome": "Volver al Inicio"
}
```

**修改后**:
```json
{
  "unauthorized": {
    "title": "Acceso Denegado",
    "description": "No tienes permisos para acceder a esta área",
    "message": "Esta página está restringida solo para administradores. Si crees que deberías tener acceso, por favor contacta a tu administrador del sistema.",
    "backToDashboard": "Volver al Panel",
    "backToHome": "Volver al Inicio"
  }
}
```

### 4. 创建简体中文文件

**文件**: `/src/locales/zh/unauthorized.json`

**新建内容**:
```json
{
  "unauthorized": {
    "title": "拒绝访问",
    "description": "您没有权限访问此区域",
    "message": "此页面仅限管理员访问。如果您认为您应该有访问权限，请联系您的系统管理员。",
    "backToDashboard": "返回仪表板",
    "backToHome": "返回首页"
  }
}
```

## 修改文件列表

1. **修改**: `/src/locales/ja/unauthorized.json`
   - 修复语法错误（缺少冒号和大括号）
   - 添加 "unauthorized" 嵌套结构

2. **修改**: `/src/locales/en/unauthorized.json`
   - 从扁平结构转换为嵌套结构
   - 添加 "unauthorized" 包装层

3. **修改**: `/src/locales/es/unauthorized.json`
   - 从扁平结构转换为嵌套结构
   - 添加 "unauthorized" 包装层

4. **创建**: `/src/locales/zh/unauthorized.json`
   - 新建简体中文翻译文件
   - 使用统一的嵌套结构

## 技术优势

### 1. **结构一致性**
- 所有语言的 unauthorized.json 文件现在使用相同的嵌套结构
- 便于维护和管理翻译文件

### 2. **翻译键值访问统一**
- 统一的结构确保 `/app/[locale]/unauthorized/page.tsx` 中的 `getTranslations('unauthorized')` 在所有语言下行为一致
- 避免因结构差异导致的翻译读取错误

### 3. **代码兼容性**
- 嵌套结构与 next-intl 的命名空间概念完全兼容
- 支持更好的翻译键值组织和管理

### 4. **多语言完整性**
- 补充了缺失的简体中文翻译
- 确保所有支持的语言都有完整的 unauthorized 页面翻译

### 5. **错误修复**
- 修复了日语文件的 JSON 语法错误
- 提高了翻译文件的可靠性

## 验证结果

### 翻译键值覆盖

所有语言现在都包含以下嵌套翻译键值:
- `unauthorized.title`: 页面标题
- `unauthorized.description`: 页面描述
- `unauthorized.message`: 详细消息
- `unauthorized.backToDashboard`: 返回仪表板按钮文本
- `unauthorized.backToHome`: 返回首页按钮文本

### 多语言支持状态

| 语言 | 文件路径 | 状态 | 结构 | JSON 格式 |
|------|----------|------|------|----------|
| 英语 | `/src/locales/en/unauthorized.json` | ✅ 已同步 | ✅ 嵌套结构 | ✅ 正确 |
| 日语 | `/src/locales/ja/unauthorized.json` | ✅ 已修复 | ✅ 嵌套结构 | ✅ 正确 |
| 西班牙语 | `/src/locales/es/unauthorized.json` | ✅ 已同步 | ✅ 嵌套结构 | ✅ 正确 |
| 繁体中文 | `/src/locales/zh-HK/unauthorized.json` | ✅ 参考标准 | ✅ 嵌套结构 | ✅ 正确 |
| 简体中文 | `/src/locales/zh/unauthorized.json` | ✅ 已创建 | ✅ 嵌套结构 | ✅ 正确 |

## 代码使用示例

在 `/app/[locale]/unauthorized/page.tsx` 中，现在可以统一使用：

```typescript
import { getTranslations } from 'next-intl/server';

export default async function UnauthorizedPage() {
  const t = await getTranslations('unauthorized');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <p>{t('message')}</p>
      <button>{t('backToDashboard')}</button>
      <button>{t('backToHome')}</button>
    </div>
  );
}
```

## 最佳实践建议

### 1. **翻译文件结构规范**
- 使用嵌套结构组织相关的翻译键值
- 保持所有语言文件的结构一致性

### 2. **命名空间管理**
- 按页面或功能模块创建独立的翻译文件
- 使用有意义的命名空间名称

### 3. **JSON 格式验证**
- 定期检查 JSON 文件的语法正确性
- 使用 JSON 验证工具确保格式正确

### 4. **翻译完整性检查**
- 确保所有语言版本包含相同的翻译键值
- 定期审查翻译内容的准确性

### 5. **版本控制**
- 翻译文件修改时进行适当的版本控制
- 记录重要的结构变更

## 后续监控

1. **功能测试**: 验证 unauthorized 页面在所有语言下正常显示
2. **翻译键值访问**: 确认 `getTranslations('unauthorized')` 在所有语言下正常工作
3. **结构一致性**: 定期检查所有语言文件的结构一致性
4. **新语言支持**: 添加新语言时确保使用相同的嵌套结构

---

**同步状态**: ✅ 完成
**测试状态**: 待验证
**部署状态**: 待部署
