'use client';

import type { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { signInSchema } from '@/validations/auth';

type SignInFormValues = z.infer<typeof signInSchema>;

export function SignInForm() {
  const { signIn, signInWithGoogle, error } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('SignIn');

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: SignInFormValues) {
    setIsLoading(true);
    try {
      await signIn(data.email, data.password);
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      {/* Google 登录按钮 */}
      <Button
        variant="outline"
        type="button"
        disabled={isLoading || isGoogleLoading}
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-2 h-10 px-4 py-2"
      >
        {isGoogleLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!isGoogleLoading && (
          <Image
            src="/assets/images/email/google-login.svg"
            alt="Google logo"
            width={20}
            height={20}
          />
        )}
        <span>{t('google_button')}</span>
      </Button>

      {/* 分隔线 */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t('email_divider')}
          </span>
        </div>
      </div>

      {/* 邮件登录表单 */}
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
                    disabled={isLoading || isGoogleLoading}
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">{t('password_label')}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t('password_placeholder')}
                    disabled={isLoading || isGoogleLoading}
                    className="h-10 px-3 py-2 text-base"
                    value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                  />
                </FormControl>
                <div className="flex items-center justify-end">
                  <Link
                    href={`/${locale}/forgot-password`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {t('forgot_password_link')}
                  </Link>
                </div>
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
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('submit_button')}
          </Button>
        </form>
      </Form>

      {/* 注册链接 */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">
          {t('signup_prompt')}
        </span>
        {' '}
        <Link
          href={`/${locale}/sign-up`}
          className="font-medium text-primary hover:underline"
        >
          {t('signup_link')}
        </Link>
      </div>
    </div>
  );
}
