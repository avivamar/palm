'use client';

import type { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ContactValidation } from '@/validations/ContactValidation';

type FormData = z.infer<typeof ContactValidation>;

export function ContactForm() {
  const t = useTranslations('Contact');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const lastSubmitTime = useRef<number>(0);
  const cooldownTimer = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(ContactValidation),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (cooldownTimer.current) {
        clearInterval(cooldownTimer.current);
      }
    };
  }, []);

  const startCooldown = () => {
    const COOLDOWN_DURATION = 60; // 60 seconds cooldown
    setCooldownTime(COOLDOWN_DURATION);

    cooldownTimer.current = setInterval(() => {
      setCooldownTime((prev) => {
        if (prev <= 1) {
          if (cooldownTimer.current) {
            clearInterval(cooldownTimer.current);
            cooldownTimer.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const onSubmit = async (data: FormData) => {
    const now = Date.now();
    const timeSinceLastSubmit = now - lastSubmitTime.current;
    const MIN_SUBMIT_INTERVAL = 30000; // 30 seconds minimum interval

    // Check if user is trying to submit too quickly
    if (timeSinceLastSubmit < MIN_SUBMIT_INTERVAL && lastSubmitTime.current > 0) {
      const remainingTime = Math.ceil((MIN_SUBMIT_INTERVAL - timeSinceLastSubmit) / 1000);
      toast.error(`Please wait ${remainingTime} seconds before submitting again.`);
      return;
    }

    // Check if already submitted successfully (prevent duplicate submissions)
    if (isSubmitted && cooldownTime > 0) {
      toast.error(`You've already submitted a message. Please wait ${cooldownTime} seconds before submitting another.`);
      return;
    }

    try {
      setIsLoading(true);
      lastSubmitTime.current = now;

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message);
      }

      toast.success('✅ Message Sent Successfully!', {
        description: 'Thank you! Your message has been delivered to our team. We\'ll get back to you within 24 hours.',
        duration: 6000,
      });
      form.reset();
      setIsSubmitted(true);
      startCooldown();
    } catch (error) {
      // Contact form error logged
      console.error('Contact form submission error:', error);
      if (error instanceof Error) {
        toast.error('❌ Message Failed to Send', {
          description: `Error: ${error.message}. Please check your connection and try again.`,
          duration: 8000,
        });
      } else {
        toast.error('❌ Message Failed to Send', {
          description: 'Sorry, we couldn\'t send your message right now. Please check your internet connection and try again.',
          duration: 8000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('form_title')}</CardTitle>
        <CardDescription>{t('form_description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('first_name')}</Label>
              <Controller
                name="firstName"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="firstName"
                    placeholder={t('first_name_placeholder')}
                    disabled={isLoading}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                )}
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t('last_name')}</Label>
              <Input
                id="lastName"
                placeholder={t('last_name_placeholder')}
                onChange={(e) => form.setValue('lastName', e.target.value)}
                name="lastName"
                defaultValue={form.getValues('lastName')}
                disabled={isLoading}
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('email_placeholder')}
              onChange={(e) => form.setValue('email', e.target.value)}
              name="email"
              defaultValue={form.getValues('email')}
              disabled={isLoading}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">{t('subject')}</Label>
            <Input
              id="subject"
              placeholder={t('subject_placeholder')}
              onChange={(e) => form.setValue('subject', e.target.value)}
              name="subject"
              defaultValue={form.getValues('subject')}
              disabled={isLoading}
              maxLength={100}
            />
            <div className="flex justify-between">
              <div>
                {form.formState.errors.subject && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.subject.message}
                  </p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {form.watch('subject')?.length || 0}
                /100
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">{t('message')}</Label>
            <Textarea
              id="message"
              placeholder={t('message_placeholder')}
              className="min-h-32"
              onChange={(e) => form.setValue('message', e.target.value)}
              name="message"
              defaultValue={form.getValues('message')}
              disabled={isLoading}
              maxLength={1000}
            />
            <div className="flex justify-between">
              <div>
                {form.formState.errors.message && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.message.message}
                  </p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {form.watch('message')?.length || 0}
                /1000
              </p>
            </div>
          </div>
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isLoading}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || (isSubmitted && cooldownTime > 0)}
            >
              {isLoading
                ? t('submit_sending')
                : (isSubmitted && cooldownTime > 0)
                    ? t('submit_wait', { cooldownTime })
                    : t('submit_button')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
