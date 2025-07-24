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

export function ForgotPasswordFormDebug() {
  const { sendPasswordResetEmail, error } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const t = useTranslations('ForgotPassword');

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const addDebugInfo = (message: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  async function onSubmit(data: ForgotPasswordFormValues) {
    setIsLoading(true);
    setDebugInfo([]);

    try {
      addDebugInfo(`开始发送密码重置邮件到: ${data.email}`);

      // 安全获取当前语言设置和 origin
      const currentLocale = typeof window !== 'undefined'
        ? window.location.pathname.split('/')[1] || 'en'
        : 'en';
      const origin = typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

      addDebugInfo(`检测到语言: ${currentLocale}`);

      // 构建重定向URL
      const redirectUrl = `${origin}/${currentLocale}/reset-password`;
      addDebugInfo(`重定向URL: ${redirectUrl}`);

      const result = await sendPasswordResetEmail(data.email);

      if (result?.error) {
        addDebugInfo(`错误: ${result.error}`);
      } else {
        addDebugInfo('邮件发送成功！');
        form.reset();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      addDebugInfo(`异常: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
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

      {/* Debug信息显示 */}
      {debugInfo.length > 0 && (
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 className="font-bold mb-2">调试信息:</h3>
          <div className="space-y-1 text-sm font-mono">
            {debugInfo.map((info, index) => (
              <div key={index} className="text-gray-700 dark:text-gray-300">
                {info}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
