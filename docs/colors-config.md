# 产品颜色配置文档

> 此文档由脚本自动生成，请勿手动编辑

## 当前可用颜色

| 颜色ID | 显示名称 | 英文名称 | 十六进制值 | Stripe价格ID | 图片路径 | 状态 |
|--------|----------|----------|------------|--------------|----------|------|
| Honey Khaki | Honey Khaki | Honey Khaki | #D2B48C | price_1RcljHBCMz50a5Rza9NvZH5z | /pre-order/khaki.png | 启用 |
| Sakura Pink | Sakura Pink | Sakura Pink | #FFB6C1 | price_1Rce39BCMz50a5RzuTd1P7E7 | /pre-order/pink.png | 启用 |
| Healing Green | Healing Green | Healing Green | #90EE90 | price_1RcljHBCMz50a5RzxJORItSF | /pre-order/green.png | 启用 |
| Moonlight Grey | Moonlight Grey | Moonlight Grey | #D3D3D3 | price_1RcljHBCMz50a5RzozuqMuJN | /pre-order/grey.png | 启用 |
| Red | Classic Red | Classic Red | #FF0000 | price_1RdAu1BCMz50a5RzChT7XYGm | /pre-order/red.png | 启用 |

## 使用说明

### 添加新颜色

1. 在 `src/config/colors.ts` 中添加新的颜色配置
2. 运行 `npm run sync-colors` 同步配置
3. 在 Stripe 后台创建对应的价格对象
4. 添加对应的产品图片到 `public/pre-order/` 目录

### 禁用颜色

1. 在 `src/config/colors.ts` 中将对应颜色的 `enabled` 设置为 `false`
2. 运行 `npm run sync-colors` 同步配置

