/**
 * Shopify集成功能模块
 */

import { ShopifyAdmin } from '@rolitt/shopify';
import React from 'react';

export function ShopifyIntegration() {
  return (
    <div className="space-y-6">
      <ShopifyAdmin />
    </div>
  );
}
