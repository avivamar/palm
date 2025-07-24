/**
 * 库存同步服务
 */

import type { ShopifyConfig } from '../config';
import type { ShopifyClient } from '../core/client';

export class InventoryService {
  private client: ShopifyClient;
  private config: ShopifyConfig;

  constructor(client: ShopifyClient, config: ShopifyConfig) {
    this.client = client;
    this.config = config;
  }

  /**
   * 更新库存数量
   */
  async updateInventory(inventoryItemId: string, locationId: string, quantity: number): Promise<any> {
    if (!this.config.features.inventorySync) {
      return {
        success: false,
        error: '库存同步功能已禁用',
      };
    }

    try {
      const response = await this.client.request('POST', '/admin/api/2025-01/inventory_levels/set.json', {
        location_id: locationId,
        inventory_item_id: inventoryItemId,
        available: quantity,
      });

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '库存更新失败',
      };
    }
  }

  /**
   * 获取库存级别
   */
  async getInventoryLevels(locationId?: string): Promise<any> {
    try {
      const params = locationId ? `?location_ids=${locationId}` : '';
      const response = await this.client.request('GET', `/admin/api/2025-01/inventory_levels.json${params}`);

      return {
        success: true,
        data: response.inventory_levels || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取库存失败',
      };
    }
  }

  /**
   * 批量更新库存
   */
  async batchUpdateInventory(updates: Array<{
    inventoryItemId: string;
    locationId: string;
    quantity: number;
  }>): Promise<any> {
    const results = [];
    let successCount = 0;
    let failedCount = 0;

    for (const update of updates) {
      const result = await this.updateInventory(
        update.inventoryItemId,
        update.locationId,
        update.quantity,
      );

      results.push(result);

      if (result.success) {
        successCount++;
      } else {
        failedCount++;
      }

      // 避免速率限制
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return {
      success: failedCount === 0,
      successCount,
      failedCount,
      results,
    };
  }
}
