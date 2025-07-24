/**
 * ModuleCard Component
 * Following .cursorrules rule #301: "合理选择布局组件统一页面结构"
 */

import type { ModuleCardProps } from '../types';
import { CompatLink as Link } from './ui/CompatLink';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { cn } from '@/lib/utils';

export function ModuleCard({
  title,
  description,
  icon: Icon,
  href,
  disabled = false,
  locale,
  buttonText,
  comingSoonText,
}: ModuleCardProps) {
  return (
    <Card className={cn(disabled && 'opacity-60')}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" aria-hidden="true" />
          <span className="flex-1">{title}</span>
          {disabled && comingSoonText && (
            <Badge variant="secondary" className="text-xs">
              {comingSoonText}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {disabled
          ? (
              <Button disabled className="w-full" aria-label={`${title} - ${comingSoonText}`}>
                {buttonText}
              </Button>
            )
          : (
              <Link href={`/${locale}${href}`} className="block">
                <Button className="w-full">
                  {buttonText}
                </Button>
              </Link>
            )}
      </CardContent>
    </Card>
  );
}
