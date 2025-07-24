/**
 * Data Display Components
 * 数据展示组件 - 数据表格、筛选面板和搜索栏
 */

'use client';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Search,
  SortAsc,
  SortDesc,
  Trash2,
  X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

// Temporary simplified components
const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }: any) => (
  <button className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${className}`} {...props}>
    {children}
  </button>
);

const Input = ({ className = '', ...props }: any) => (
  <input className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${className}`} {...props} />
);

const Select = ({ children, className = '', ...props }: any) => (
  <select className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${className}`} {...props}>
    {children}
  </select>
);

const Checkbox = ({ className = '', ...props }: any) => (
  <input type="checkbox" className={`h-4 w-4 rounded border border-input ${className}`} {...props} />
);

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

// Types
export type Column<T = any> = {
  key: string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
};

export type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

export type FilterConfig = {
  [key: string]: any;
};

export type DataTableProps<T = any> = {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    onChange: (page: number, pageSize: number) => void;
  };
  selection?: {
    selectedRowKeys: string[];
    onChange: (selectedRowKeys: string[], selectedRows: T[]) => void;
    getCheckboxProps?: (record: T) => any;
  };
  scroll?: {
    x?: string | number;
    y?: string | number;
  };
  className?: string;
  onRow?: (record: T, index: number) => any;
  rowKey?: string | ((record: T) => string);
  emptyText?: string;
  size?: 'small' | 'middle' | 'large';
};

export function DataTable<T = any>({
  data,
  columns,
  loading = false,
  pagination,
  selection,
  scroll,
  className,
  onRow,
  rowKey = 'id',
  emptyText = 'No data available',
  size = 'middle',
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return (record as any)[rowKey] || index.toString();
  };

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === 'asc'
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = (a as any)[sortConfig.key];
      const bValue = (b as any)[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const sizeClasses = {
    small: 'py-2 px-3 text-sm',
    middle: 'py-3 px-4',
    large: 'py-4 px-6 text-base',
  };

  if (loading) {
    return <TableSkeleton columns={columns} rows={5} />;
  }

  return (
    <div className={cn('bg-card border border-border rounded-lg overflow-hidden', className)}>
      {/* Table container */}
      <div className="overflow-auto" style={scroll as React.CSSProperties}>
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {selection && (
                <th className={cn('text-left font-medium text-muted-foreground', sizeClasses[size])}>
                  <Checkbox
                    checked={selection.selectedRowKeys.length === data.length && data.length > 0}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      if (e.target.checked) {
                        const allKeys = data.map((record, index) => getRowKey(record, index));
                        selection.onChange(allKeys, data);
                      } else {
                        selection.onChange([], []);
                      }
                    }}
                  />
                </th>
              )}

              {columns.map(column => (
                <th
                  key={column.key}
                  className={cn(
                    'font-medium text-muted-foreground',
                    sizeClasses[size],
                    column.align === 'center' ? 'text-center' : '',
                    column.align === 'right' ? 'text-right' : '',
                    column.sortable ? 'cursor-pointer hover:text-foreground' : '',
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        {sortConfig?.key === column.key
                          ? (
                              sortConfig.direction === 'asc'
                                ? (
                                    <SortAsc className="h-4 w-4" />
                                  )
                                : (
                                    <SortDesc className="h-4 w-4" />
                                  )
                            )
                          : (
                              <div className="h-4 w-4 opacity-50">
                                <SortAsc className="h-4 w-4" />
                              </div>
                            )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sortedData.length === 0
              ? (
                  <tr>
                    <td
                      colSpan={columns.length + (selection ? 1 : 0)}
                      className={cn('text-center text-muted-foreground', sizeClasses[size])}
                    >
                      {emptyText}
                    </td>
                  </tr>
                )
              : (
                  sortedData.map((record, index) => {
                    const key = getRowKey(record, index);
                    const isSelected = selection?.selectedRowKeys.includes(key);
                    const rowProps = onRow?.(record, index) || {};

                    return (
                      <tr
                        key={key}
                        className={cn(
                          'border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors',
                          isSelected ? 'bg-accent/50' : '',
                          rowProps.className,
                        )}
                        {...rowProps}
                      >
                        {selection && (
                          <td className={sizeClasses[size]}>
                            <Checkbox
                              checked={isSelected}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const newSelectedKeys = e.target.checked
                                  ? [...selection.selectedRowKeys, key]
                                  : selection.selectedRowKeys.filter(k => k !== key);

                                const newSelectedRows = newSelectedKeys
                                  .map(k => data.find((r, i) => getRowKey(r, i) === k))
                                  .filter(Boolean) as T[];

                                selection.onChange(newSelectedKeys, newSelectedRows);
                              }}
                              {...selection.getCheckboxProps?.(record)}
                            />
                          </td>
                        )}

                        {columns.map((column) => {
                          const value = (record as any)[column.key];
                          return (
                            <td
                              key={column.key}
                              className={cn(
                                sizeClasses[size],
                                column.align === 'center' ? 'text-center' : '',
                                column.align === 'right' ? 'text-right' : '',
                              )}
                            >
                              {column.render ? column.render(value, record, index) : value}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <TablePagination pagination={pagination} />
      )}
    </div>
  );
}

export type SearchBarProps = {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  className?: string;
  size?: 'small' | 'middle' | 'large';
  loading?: boolean;
};

export function SearchBar({
  placeholder = 'Search...',
  value,
  onChange,
  onSearch,
  className,
  size = 'middle',
  loading = false,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(value || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.(internalValue);
    }
  };

  const handleClear = () => {
    setInternalValue('');
    onChange?.('');
    onSearch?.('');
  };

  const sizeClasses = {
    small: 'h-8 text-sm',
    middle: 'h-10',
    large: 'h-12 text-base',
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          value={internalValue}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          className={cn('pl-10 pr-10', sizeClasses[size])}
          disabled={loading}
        />

        {internalValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}

export type FilterPanelProps = {
  filters: Array<{
    key: string;
    label: string;
    type: 'select' | 'dateRange' | 'text' | 'number';
    options?: Array<{ label: string; value: any }>;
    placeholder?: string;
  }>;
  values: FilterConfig;
  onChange: (values: FilterConfig) => void;
  onReset?: () => void;
  className?: string;
};

export function FilterPanel({
  filters,
  values,
  onChange,
  onReset,
  className,
}: FilterPanelProps) {
  const handleFilterChange = (key: string, value: any) => {
    onChange({ ...values, [key]: value });
  };

  const hasActiveFilters = Object.values(values).some(v => v !== undefined && v !== '' && v !== null);

  return (
    <div className={cn('bg-card border border-border rounded-lg p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium">Filters</h3>
        </div>

        {hasActiveFilters && onReset && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            Reset
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filters.map(filter => (
          <div key={filter.key} className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {filter.label}
            </label>

            {filter.type === 'select' && (
              <Select
                value={values[filter.key] || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  handleFilterChange(filter.key, e.target.value)}
              >
                <option value="">All</option>
                {filter.options?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            )}

            {filter.type === 'text' && (
              <Input
                placeholder={filter.placeholder}
                value={values[filter.key] || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleFilterChange(filter.key, e.target.value)}
              />
            )}

            {filter.type === 'number' && (
              <Input
                type="number"
                placeholder={filter.placeholder}
                value={values[filter.key] || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleFilterChange(filter.key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export type TableActionsProps = {
  selectedCount?: number;
  onRefresh?: () => void;
  onExport?: () => void;
  children?: React.ReactNode;
  className?: string;
};

export function TableActions({
  selectedCount = 0,
  onRefresh,
  onExport,
  children,
  className,
}: TableActionsProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <div className="flex items-center gap-2">
        {selectedCount > 0 && (
          <span className="text-sm text-muted-foreground">
            {selectedCount}
            {' '}
            selected
          </span>
        )}
        {children}
      </div>

      <div className="flex items-center gap-2">
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        )}

        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </div>
    </div>
  );
}

// Row action components
export const RowActions = {
  View: ({ onClick }: { onClick: () => void }) => (
    <Button variant="ghost" size="sm" onClick={onClick}>
      <Eye className="h-4 w-4" />
    </Button>
  ),

  Edit: ({ onClick }: { onClick: () => void }) => (
    <Button variant="ghost" size="sm" onClick={onClick}>
      <Edit className="h-4 w-4" />
    </Button>
  ),

  Delete: ({ onClick }: { onClick: () => void }) => (
    <Button variant="ghost" size="sm" onClick={onClick}>
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  ),

  More: ({ children }: { children: React.ReactNode }) => (
    <div className="relative group">
      <Button variant="ghost" size="sm">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
      <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {children}
      </div>
    </div>
  ),
};

// Helper components
function TablePagination({ pagination }: { pagination: NonNullable<DataTableProps['pagination']> }) {
  const { current, pageSize, total, onChange } = pagination;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex items-center justify-between p-4 border-t border-border">
      <div className="text-sm text-muted-foreground">
        Showing
        {' '}
        {((current - 1) * pageSize) + 1}
        {' '}
        to
        {' '}
        {Math.min(current * pageSize, total)}
        {' '}
        of
        {' '}
        {total}
        {' '}
        entries
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(1, pageSize)}
          disabled={current === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(current - 1, pageSize)}
          disabled={current === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm px-2">
          Page
          {' '}
          {current}
          {' '}
          of
          {' '}
          {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(current + 1, pageSize)}
          disabled={current === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(totalPages, pageSize)}
          disabled={current === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function TableSkeleton({ columns, rows }: { columns: Column[]; rows: number }) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {columns.map(column => (
                <th key={column.key} className="py-3 px-4 text-left">
                  <div className="h-4 bg-muted animate-pulse rounded w-24" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, index) => (
              <tr key={index} className="border-b border-border">
                {columns.map(column => (
                  <td key={column.key} className="py-3 px-4">
                    <div className="h-4 bg-muted animate-pulse rounded" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
