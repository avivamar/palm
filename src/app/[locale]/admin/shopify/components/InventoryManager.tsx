/**
 * Inventory Manager Component
 * 库存管理组件 - 产品库存实时显示、批量更新和低库存警告
 */

'use client';

import {
  AlertTriangle,
  Download,
  Edit,
  Filter,
  Minus,
  MoreHorizontal,
  Package,
  Plus,
  RefreshCw,
  Save,
  Search,
  TrendingDown,
  TrendingUp,
  Upload,
  X,
} from 'lucide-react';
import React, { useState } from 'react';

// Temporary simplified components
const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }: any) => (
  <button className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${className}`} {...props}>
    {children}
  </button>
);

const Input = ({ className = '', ...props }: any) => (
  <input className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${className}`} {...props} />
);

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

// Types
type InventoryItem = {
  id: string;
  sku: string;
  productName: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  lowStockThreshold: number;
  lastUpdated: string;
  shopifyProductId?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  trend: { value: number; type: 'increase' | 'decrease' | 'stable' };
  price: number;
  currency: string;
};

type InventoryManagerProps = {
  className?: string;
};

export function InventoryManager({ className }: InventoryManagerProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: '1',
      sku: 'AI-COMP-001',
      productName: 'AI Companion Basic',
      currentStock: 150,
      reservedStock: 25,
      availableStock: 125,
      lowStockThreshold: 50,
      lastUpdated: '5 minutes ago',
      shopifyProductId: 'SP-001',
      status: 'in_stock',
      trend: { value: 8, type: 'increase' },
      price: 299.99,
      currency: 'USD',
    },
    {
      id: '2',
      sku: 'AI-COMP-002',
      productName: 'AI Companion Pro',
      currentStock: 25,
      reservedStock: 15,
      availableStock: 10,
      lowStockThreshold: 30,
      lastUpdated: '8 minutes ago',
      shopifyProductId: 'SP-002',
      status: 'low_stock',
      trend: { value: 12, type: 'decrease' },
      price: 499.99,
      currency: 'USD',
    },
    {
      id: '3',
      sku: 'AI-COMP-003',
      productName: 'AI Companion Enterprise',
      currentStock: 0,
      reservedStock: 5,
      availableStock: 0,
      lowStockThreshold: 10,
      lastUpdated: '1 hour ago',
      status: 'out_of_stock',
      trend: { value: 0, type: 'stable' },
      price: 999.99,
      currency: 'USD',
    },
    {
      id: '4',
      sku: 'AI-ACC-001',
      productName: 'AI Companion Accessories',
      currentStock: 500,
      reservedStock: 50,
      availableStock: 450,
      lowStockThreshold: 100,
      lastUpdated: '15 minutes ago',
      shopifyProductId: 'SP-004',
      status: 'in_stock',
      trend: { value: 5, type: 'increase' },
      price: 49.99,
      currency: 'USD',
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const getStatusIcon = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock':
        return <Package className="h-4 w-4 text-green-600" />;
      case 'low_stock':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'out_of_stock':
        return <X className="h-4 w-4 text-red-600" />;
      case 'discontinued':
        return <Minus className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock':
        return 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'low_stock':
        return 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'out_of_stock':
        return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'discontinued':
        return 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
      default:
        return 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getTrendIcon = (trend: InventoryItem['trend']) => {
    switch (trend.type) {
      case 'increase':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'decrease':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <Minus className="h-3 w-3 text-gray-600" />;
    }
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesFilter = filter === 'all' || item.status === filter;
    const matchesSearch = searchTerm === ''
      || item.sku.toLowerCase().includes(searchTerm.toLowerCase())
      || item.productName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleStockUpdate = (itemId: string, newStock: number) => {
    setInventory(prev => prev.map(item =>
      item.id === itemId
        ? {
            ...item,
            currentStock: newStock,
            availableStock: newStock - item.reservedStock,
            status: newStock === 0
              ? 'out_of_stock'
              : newStock <= item.lowStockThreshold ? 'low_stock' : 'in_stock',
            lastUpdated: 'Just now',
          }
        : item,
    ));
    setEditingItem(null);
  };

  const handleBulkSync = () => {
    // Simulate bulk sync
    setInventory(prev => prev.map(item => ({
      ...item,
      lastUpdated: 'Just now',
    })));
  };

  const statusCounts = {
    total: inventory.length,
    in_stock: inventory.filter(i => i.status === 'in_stock').length,
    low_stock: inventory.filter(i => i.status === 'low_stock').length,
    out_of_stock: inventory.filter(i => i.status === 'out_of_stock').length,
  };

  const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.price), 0);

  return (
    <div className={cn('bg-card border border-border rounded-lg', className)}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventory Management
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor and manage product inventory levels
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleBulkSync}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Sync All
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {statusCounts.total}
            </div>
            <div className="text-xs text-muted-foreground">Total Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {statusCounts.in_stock}
            </div>
            <div className="text-xs text-muted-foreground">In Stock</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {statusCounts.low_stock}
            </div>
            <div className="text-xs text-muted-foreground">Low Stock</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {statusCounts.out_of_stock}
            </div>
            <div className="text-xs text-muted-foreground">Out of Stock</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              $
              {totalValue.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total Value</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as any)}
              className="text-sm border border-input rounded-md px-2 py-1 bg-background"
            >
              <option value="all">All Items</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by SKU or product name..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {statusCounts.low_stock > 0 && (
            <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-md">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {statusCounts.low_stock}
                {' '}
                items need restocking
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">Product</th>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">Current Stock</th>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">Available</th>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">Reserved</th>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">Status</th>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">Trend</th>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">Value</th>
              <th className="text-right p-4 font-medium text-sm text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map(item => (
              <tr key={item.id} className="border-b border-border hover:bg-muted/30">
                <td className="p-4">
                  <div>
                    <div className="font-medium text-sm">
                      {item.productName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      SKU:
                      {' '}
                      {item.sku}
                    </div>
                    {item.shopifyProductId && (
                      <div className="text-xs text-muted-foreground">
                        Shopify:
                        {' '}
                        {item.shopifyProductId}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  {editingItem === item.id
                    ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={editValue}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(Number.parseInt(e.target.value) || 0)}
                            className="w-20 h-8"
                            min="0"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleStockUpdate(item.id, editValue)}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setEditingItem(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    : (
                        <div
                          className="font-medium text-sm cursor-pointer hover:text-primary"
                          onClick={() => {
                            setEditingItem(item.id);
                            setEditValue(item.currentStock);
                          }}
                        >
                          {item.currentStock.toLocaleString()}
                        </div>
                      )}
                  <div className="text-xs text-muted-foreground">
                    Updated
                    {' '}
                    {item.lastUpdated}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm font-medium">
                    {item.availableStock.toLocaleString()}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm">
                    {item.reservedStock.toLocaleString()}
                  </div>
                </td>
                <td className="p-4">
                  <div className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                    getStatusColor(item.status),
                  )}
                  >
                    {getStatusIcon(item.status)}
                    {item.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  {item.status === 'low_stock' && (
                    <div className="text-xs text-yellow-600 mt-1">
                      Threshold:
                      {' '}
                      {item.lowStockThreshold}
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    {getTrendIcon(item.trend)}
                    <span className={cn(
                      'text-xs font-medium',
                      item.trend.type === 'increase'
                        ? 'text-green-600'
                        : item.trend.type === 'decrease' ? 'text-red-600' : 'text-gray-600',
                    )}
                    >
                      {item.trend.type !== 'stable' && `${item.trend.value}%`}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm font-medium">
                    $
                    {(item.currentStock * item.price).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    @ $
                    {item.price}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        setEditingItem(item.id);
                        setEditValue(item.currentStock);
                      }}
                      title="Edit Stock"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="Quick Adjust"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="More Actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredInventory.length === 0 && (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || filter !== 'all' ? 'No items match your criteria' : 'No inventory items found'}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredInventory.length > 0 && (
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing
              {' '}
              {filteredInventory.length}
              {' '}
              of
              {' '}
              {inventory.length}
              {' '}
              items
            </span>
            <span>
              Total inventory value: $
              {totalValue.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
