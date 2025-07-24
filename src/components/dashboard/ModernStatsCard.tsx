import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

type ModernStatsCardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  status?: 'success' | 'warning' | 'info';
  gradient: string;
};

export default function ModernStatsCard({
  title,
  value,
  icon,
  description,
  status = 'info',
  gradient,
}: ModernStatsCardProps) {
  const statusClasses = {
    success: 'ring-emerald-200/50 dark:ring-emerald-800/50',
    warning: 'ring-amber-200/50 dark:ring-amber-800/50',
    info: 'ring-blue-200/50 dark:ring-blue-800/50',
  };

  return (
    <Card className={`border-0 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm ring-1 ${statusClasses[status]} shadow-xl hover:shadow-2xl transition-all duration-300 group hover:scale-[1.02]`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {value}
            </p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
