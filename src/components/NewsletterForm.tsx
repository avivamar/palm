'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { subscribeToNewsletter } from '@/app/actions/newsletterActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// 定义表单的 Zod Schema，用于验证
const newsletterSchema = z.object({
  email: z.string().email({ message: 'Please provide a valid email address.' }),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

export function NewsletterForm() {
  const t = useTranslations('Newsletter');
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = (data: NewsletterFormValues) => {
    startTransition(async () => {
      const result = await subscribeToNewsletter(data.email);
      if (result.success) {
        setIsSuccess(true);
        toast.success(t('success_title'), { description: result.message });
        form.reset();
      } else {
        toast.error(t('error_title'), { description: result.message });
      }
    });
  };

  // 订阅成功后，显示感谢信息
  if (isSuccess) {
    return (
      <div className="flex h-14 items-center justify-center rounded-lg bg-muted/50 p-4 text-center">
        <p className="text-sm font-medium text-foreground">{t('success_message')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
      <div className="w-full">
        <Input
          onChange={(e) => form.setValue('email', e.target.value)}
           name="email"
           defaultValue={form.getValues('email')}
          type="email"
          placeholder={t('email_placeholder')}
          className={`w-full ${form.formState.errors.email ? 'border-destructive' : ''}`}
          disabled={isPending}
          aria-label={t('email_placeholder')}
        />
        {form.formState.errors.email && (
          <p className="mt-1 text-xs text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>
      <Button type="submit" className="whitespace-nowrap sm:w-auto w-full" disabled={isPending}>
        {isPending ? t('subscribing') : t('subscribe')}
      </Button>
    </form>
  );
}
