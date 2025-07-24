/**
 * 📦 库存同步服务
 * 管理Shopify库存状态，确保数据一致性
 */

import { isFeatureEnabled } from '../config';
import { ShopifyAdminClient } from '../core/client';

export type InventorySyncResult = {
  success: boolean;
  updatedItems: number;
  errors: string[];
};

export type InventoryItem = {
  sku: string;
  quantity: number;
  locationId?: string;
  inventoryItemId?: string;
};

/**
 * 📦 库存同步服务类
 */
export class InventorySyncService {
  private client: ShopifyAdminClient;

  constructor() {
    this.client = ShopifyAdminClient.getInstance();
  }

  /**
   * 🔄 同步库存水平
   */
  public async syncInventoryLevels(items: InventoryItem[]): Promise<InventorySyncResult> {
    if (!isFeatureEnabled('INVENTORY_SYNC')) {
      return {
        success: false,
        updatedItems: 0,
        errors: ['库存同步功能已禁用'],
      };
    }

    console.log(`[InventorySync] 🔄 开始同步 ${items.length} 个库存项目`);

    const result: InventorySyncResult = {
      success: true,
      updatedItems: 0,
      errors: [],
    };

    for (const item of items) {
      try {
        const syncResult = await this.syncSingleItem(item);
        if (syncResult.success) {
          result.updatedItems++;
        } else if (syncResult.error) {
          result.errors.push(`${item.sku}: ${syncResult.error}`);
        }

        // 避免API限流
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        result.errors.push(`${item.sku}: ${error instanceof Error ? error.message : '同步失败'}`);
      }
    }

    result.success = result.errors.length === 0;

    console.log(`[InventorySync] 📊 库存同步完成: ${result.updatedItems}/${items.length} 成功`);
    return result;
  }

  /**
   * 📦 同步单个库存项目
   */
  private async syncSingleItem(item: InventoryItem): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // 如果没有提供库存项目ID，需要先查找
      if (!item.inventoryItemId) {
        // 这里可以通过产品查找获取inventory_item_id
        // 简化实现：假设已有库存项目ID
        return {
          success: false,
          error: '缺少inventory_item_id，需要先同步产品',
        };
      }

      // 🔄 调整库存水平
      const response = await this.client.inventory.adjust(
        item.inventoryItemId,
        item.locationId || 'default',
        item.quantity,
      );

      if (response.success) {
        console.log(`[InventorySync] ✅ 库存同步成功: ${item.sku} -> ${item.quantity}`);
        return { success: true };
      } else {
        return {
          success: false,
          error: response.error || '库存调整失败',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '库存同步错误',
      };
    }
  }

  /**
   * 📊 获取库存状态
   */
  public async getInventoryStatus(): Promise<{
    success: boolean;
    items: Array<{
      sku: string;
      available: number;
      locationId: string;
    }>;
    error?: string;
  }> {
    try {
      const response = await this.client.inventory.levels();

      if (response.success && response.data?.inventory_levels) {
        const items = response.data.inventory_levels.map((level: any) => ({
          sku: level.inventory_item?.sku || 'unknown',
          available: level.available || 0,
          locationId: level.location_id,
        }));

        return {
          success: true,
          items,
        };
      }

      return {
        success: false,
        items: [],
        error: response.error || '获取库存状态失败',
      };
    } catch (error) {
      return {
        success: false,
        items: [],
        error: error instanceof Error ? error.message : '库存查询失败',
      };
    }
  }
}
