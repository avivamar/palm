'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

const formSchema = z
  .object({
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords don\'t match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof formSchema>;

export function ResetPasswordForm({ oobCode }: { oobCode?: string }) {
  const { confirmPasswordReset, error } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const t = useTranslations('ResetPassword');

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  async function onSubmit(data: ResetPasswordFormValues) {
    if (!oobCode) {
      console.error('Invalid or missing password reset code.');
      return;
    }
    setIsLoading(true);
    try {
      await confirmPasswordReset(oobCode, data.password);
    } finally {
      setIsLoading(false);
    }
  }

  if (!oobCode) {
    return (
      <div className="grid gap-6">
        <p className="text-sm font-medium text-destructive text-center">{t('invalid_link')}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">{t('new_password_label')}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="********"
                    disabled={isLoading}
                    className="h-10 px-3 py-2 text-base"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">{t('confirm_password_label')}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="********"
                    disabled={isLoading}
                    className="h-10 px-3 py-2 text-base"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
          )}
          <Button
            type="submit"
            className="w-full h-10 bg-brand-accent hover:bg-brand-surface text-white font-medium"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('submit_button')}
          </Button>
        </form>
      </Form>
    </div>
  );
}
