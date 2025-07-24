import { Mail } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type AccountInfoCardProps = {
  user: any;
  t: (key: string, params?: any) => string;
};

export default function AccountInfoCard({ user, t }: AccountInfoCardProps) {
  return (
    <Card className="border-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg text-white">
            <Mail className="h-5 w-5" />
          </div>
          {t('account_info.title')}
        </CardTitle>
        <CardDescription>{t('account_info.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <InfoRow
            label={t('account_info.email_address')}
            value={user.email || ''}
            verified={user.emailVerified}
          />
          <InfoRow
            label={t('account_info.display_name')}
            value={user.displayName || t('account_info.not_set')}
          />
          <InfoRow
            label={t('account_info.registration_time')}
            value={user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('zh-CN') : t('account_info.unknown')}
          />
          <InfoRow
            label={t('account_info.last_login')}
            value={user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString('zh-CN') : t('account_info.first_login')}
          />
        </div>
      </CardContent>
    </Card>
  );
}

type InfoRowProps = {
  label: string;
  value: string;
  verified?: boolean;
};

function InfoRow({ label, value, verified }: InfoRowProps) {
  return (
    <div className="flex justify-between items-center py-3 px-4 rounded-lg bg-white/40 dark:bg-gray-800/20 border border-emerald-100/30 dark:border-emerald-900/20">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{value}</span>
        {verified !== undefined && (
          <Badge
            variant={verified ? 'default' : 'secondary'}
            className={`text-xs ${
              verified
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
            }`}
          >
            {verified ? 'Verified' : 'Unverified'}
          </Badge>
        )}
      </div>
    </div>
  );
}
