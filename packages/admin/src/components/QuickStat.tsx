/**
 * QuickStat Component
 * Following .cursorrules rule #53: "按功能组织开发，而不是按类型组织"
 */

import type { QuickStatProps } from '../types';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { cn } from '@/lib/utils';

export function QuickStat({ title, value, change, icon: Icon, trend }: QuickStatProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={cn(
          'text-xs flex items-center gap-1',
          trend === 'up' && 'text-green-600',
          trend === 'down' && 'text-red-600',
          trend === 'neutral' && 'text-muted-foreground',
        )}
        >
          {trend === 'up' && <TrendingUp className="h-3 w-3" aria-hidden="true" />}
          {change}
        </p>
      </CardContent>
    </Card>
  );
}
