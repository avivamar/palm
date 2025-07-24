/**
 * 客户同步服务
 */

import type { ShopifyConfig } from '../config';
import type { ShopifyClient } from '../core/client';
import type { ShopifyCustomer } from '../types';

export class CustomerService {
  private client: ShopifyClient;
  private config: ShopifyConfig;

  constructor(client: ShopifyClient, config: ShopifyConfig) {
    this.client = client;
    this.config = config;
  }

  /**
   * 创建或更新客户
   */
  async upsertCustomer(customerData: Partial<ShopifyCustomer>): Promise<any> {
    if (!this.config.features.customerSync) {
      return {
        success: false,
        error: '客户同步功能已禁用',
      };
    }

    try {
      // 首先尝试查找客户
      const existingCustomer = await this.findCustomerByEmail(customerData.email!);

      if (existingCustomer) {
        // 更新现有客户
        return await this.updateCustomer(existingCustomer.id!, customerData);
      } else {
        // 创建新客户
        return await this.createCustomer(customerData);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '客户同步失败',
      };
    }
  }

  /**
   * 通过邮箱查找客户
   */
  private async findCustomerByEmail(email: string): Promise<ShopifyCustomer | null> {
    try {
      const response = await this.client.request(
        'GET',
        `/admin/api/2025-01/customers/search.json?query=email:${email}`,
      );

      if (response.customers && response.customers.length > 0) {
        return response.customers[0];
      }

      return null;
    } catch (error) {
      console.error('查找客户失败:', error);
      return null;
    }
  }

  /**
   * 创建客户
   */
  private async createCustomer(customerData: Partial<ShopifyCustomer>): Promise<any> {
    try {
      const response = await this.client.request('POST', '/admin/api/2025-01/customers.json', {
        customer: customerData,
      });

      return {
        success: true,
        data: response.customer,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建客户失败',
      };
    }
  }

  /**
   * 更新客户
   */
  private async updateCustomer(customerId: string, customerData: Partial<ShopifyCustomer>): Promise<any> {
    try {
      const response = await this.client.request(
        'PUT',
        `/admin/api/2025-01/customers/${customerId}.json`,
        {
          customer: customerData,
        },
      );

      return {
        success: true,
        data: response.customer,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新客户失败',
      };
    }
  }

  /**
   * 获取客户列表
   */
  async listCustomers(params?: {
    limit?: number;
    page?: number;
    created_at_min?: string;
    created_at_max?: string;
  }): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const queryString = queryParams.toString();
      const url = `/admin/api/2025-01/customers.json${queryString ? `?${queryString}` : ''}`;

      const response = await this.client.request('GET', url);

      return {
        success: true,
        data: response.customers || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取客户列表失败',
      };
    }
  }
}
