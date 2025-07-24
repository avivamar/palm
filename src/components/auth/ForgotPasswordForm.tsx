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

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

type ForgotPasswordFormValues = z.infer<typeof formSchema>;

export function ForgotPasswordForm() {
  const { sendPasswordResetEmail, error } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const t = useTranslations('ForgotPassword');

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(data: ForgotPasswordFormValues) {
    setIsLoading(true);
    setIsSuccess(false);
    try {
      const result = await sendPasswordResetEmail(data.email);

      if (result?.error) {
        console.error('密码重置失败:', result.error);
        // 显示具体的错误信息
        if (result.error.includes('not configured')) {
          form.setError('email', {
            message: t('error_not_configured'),
          });
        } else if (result.error.includes('Invalid email')) {
          form.setError('email', {
            message: t('error_invalid_email'),
          });
        } else if (result.error.includes('User not found')) {
          form.setError('email', {
            message: t('error_user_not_found'),
          });
        } else if (result.error.includes('rate limit') || result.error.includes('Rate limit') || result.error.includes('too many requests')) {
          // 处理邮件发送频率限制错误
          form.setError('email', {
            message: t('error_rate_limit'),
          });
        } else if (result.error.includes('Email rate limit exceeded')) {
          // 专门处理 Supabase 的邮件频率限制错误
          form.setError('email', {
            message: t('error_email_rate_limit'),
          });
        } else {
          form.setError('email', {
            message: result.error,
          });
        }
      } else {
        // 显示成功状态
        setIsSuccess(true);
        form.clearErrors('email');
        form.reset();
      }
    } catch (err) {
      console.error('密码重置异常:', err);
      form.setError('email', {
        message: t('error_unexpected'),
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">{t('email_label')}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t('email_placeholder')}
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
        {isSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm font-medium text-green-800">
              {t('success_message')}
            </p>
          </div>
        )}
        <Button
          type="submit"
          className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('submit_button')}
        </Button>
      </form>
    </Form>
  );
}
