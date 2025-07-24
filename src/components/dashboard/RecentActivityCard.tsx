import { Calendar, Star } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Activity = {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  metadata: any;
};

type RecentActivityCardProps = {
  activities: Activity[];
  t: (key: string, params?: any) => string;
};

export default function RecentActivityCard({ activities, t }: RecentActivityCardProps) {
  return (
    <Card className="border-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg text-white">
            <Calendar className="h-5 w-5" />
          </div>
          {t('recent_activity.title')}
        </CardTitle>
        <CardDescription>{t('recent_activity.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities && activities.length > 0
            ? (
                activities.slice(0, 3).map(activity => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl bg-white/60 dark:bg-gray-800/40 border border-blue-100/50 dark:border-blue-900/30">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 mt-2 shadow-lg shadow-green-500/25"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{activity.description}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {new Date(activity.timestamp).toLocaleDateString('zh-CN')}
                      </Badge>
                    </div>
                  </div>
                ))
              )
            : (
                <div className="text-center py-8 space-y-2">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-2xl flex items-center justify-center">
                    <Star className="h-8 w-8 text-blue-500" />
                  </div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">{t('recent_activity.no_other_activity')}</p>
                  <p className="text-sm text-muted-foreground">{t('recent_activity.start_exploring')}</p>
                </div>
              )}
        </div>
      </CardContent>
    </Card>
  );
}
