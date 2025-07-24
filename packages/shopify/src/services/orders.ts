/**
 * 订单同步服务
 */

import type { ShopifyClient } from '../core/client';
import type { OrderSyncResult, ShopifyAddress, ShopifyLineItem, ShopifyOrder } from '../types';
import { ShopifyErrorHandler } from '../core/error-handler';

export class OrderService {
  private client: ShopifyClient;

  constructor(client: ShopifyClient) {
    this.client = client;
  }

  // 同步单个订单
  async syncOrder(orderData: any): Promise<OrderSyncResult> {
    return ShopifyErrorHandler.createRetryableApiCall(
      async () => {
        const sanitizedOrder = this.sanitizeOrderData(orderData);
        const response = await this.client.request('POST', '/admin/api/2025-01/orders.json', { order: sanitizedOrder });

        return {
          success: true,
          shopifyOrderId: response.order.id,
          shopifyOrderNumber: response.order.order_number,
          orderId: orderData.id,
        };
      },
      'OrderSync',
      { orderId: orderData.id, email: orderData.email },
    ).catch((error) => {
      return ShopifyErrorHandler.handleSyncError(error, 'OrderSync', orderData.id);
    });
  }

  // 数据清洗 - 将 Rolitt 订单数据转换为 Shopify 格式
  private sanitizeOrderData(orderData: any): ShopifyOrder {
    // 验证必要字段
    if (!orderData.email) {
      throw new Error('Order email is required');
    }

    // 处理商品行项目
    const lineItems: ShopifyLineItem[] = [];
    if (orderData.items && Array.isArray(orderData.items)) {
      orderData.items.forEach((item: any) => {
        lineItems.push({
          title: item.name || item.title || 'Unknown Product',
          quantity: Number.parseInt(item.quantity) || 1,
          price: this.formatPrice(item.price || item.amount || '0'),
          sku: item.sku || undefined,
          variant_title: item.variant || item.color || undefined,
          requires_shipping: item.requiresShipping !== false,
          taxable: item.taxable !== false,
          grams: item.weight ? Number.parseInt(item.weight) : undefined,
        });
      });
    }

    // 如果没有商品，创建默认商品行
    if (lineItems.length === 0) {
      lineItems.push({
        title: 'AI Companion Product',
        quantity: 1,
        price: this.formatPrice(orderData.total || orderData.amount || '0'),
        requires_shipping: true,
        taxable: true,
      });
    }

    // 处理地址信息
    const shippingAddress = this.sanitizeAddress(orderData.shipping_address || orderData.address);
    const billingAddress = this.sanitizeAddress(orderData.billing_address || orderData.address || shippingAddress);

    // 构建 Shopify 订单对象
    const shopifyOrder: ShopifyOrder = {
      email: orderData.email,
      currency: orderData.currency || 'USD',
      financial_status: 'paid', // Rolitt 订单都是已支付的
      total_price: this.formatPrice(orderData.total || orderData.amount || this.calculateTotal(lineItems)),
      line_items: lineItems,
      note: orderData.note || `Synced from Rolitt - Order ID: ${orderData.id}`,
      tags: this.generateOrderTags(orderData),
    };

    // 添加地址信息（如果存在）
    if (shippingAddress) {
      shopifyOrder.shipping_address = shippingAddress;
    }
    if (billingAddress) {
      shopifyOrder.billing_address = billingAddress;
    }

    // 添加客户信息
    if (orderData.customer || (orderData.firstName && orderData.lastName)) {
      shopifyOrder.customer = {
        email: orderData.email,
        first_name: orderData.firstName || orderData.customer?.firstName,
        last_name: orderData.lastName || orderData.customer?.lastName,
        phone: orderData.phone || orderData.customer?.phone,
      };
    }

    return shopifyOrder;
  }

  // 格式化价格为字符串（Shopify 要求）
  private formatPrice(price: any): string {
    const numPrice = typeof price === 'string' ? Number.parseFloat(price) : price;
    return (numPrice || 0).toFixed(2);
  }

  // 清洗地址数据
  private sanitizeAddress(addressData: any): ShopifyAddress | undefined {
    if (!addressData) {
      return undefined;
    }

    return {
      first_name: addressData.firstName || addressData.first_name,
      last_name: addressData.lastName || addressData.last_name,
      company: addressData.company,
      address1: addressData.address1 || addressData.street,
      address2: addressData.address2,
      city: addressData.city,
      province: addressData.province || addressData.state,
      country: addressData.country,
      zip: addressData.zip || addressData.postal_code,
      phone: addressData.phone,
    };
  }

  // 计算订单总价
  private calculateTotal(lineItems: ShopifyLineItem[]): string {
    const total = lineItems.reduce((sum, item) => {
      return sum + (Number.parseFloat(item.price) * item.quantity);
    }, 0);
    return total.toFixed(2);
  }

  // 生成订单标签
  private generateOrderTags(orderData: any): string {
    const tags = ['rolitt-sync'];

    if (orderData.source) {
      tags.push(`source-${orderData.source}`);
    }
    if (orderData.paymentMethod) {
      tags.push(`payment-${orderData.paymentMethod}`);
    }
    if (orderData.status) {
      tags.push(`status-${orderData.status}`);
    }

    return tags.join(', ');
  }
}
