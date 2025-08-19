import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  Twitter,
  Youtube,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { LocaleToggle } from './LocaleToggle';
import { NewsletterForm } from './NewsletterForm';
import { ThemeToggle } from './ThemeToggle';

export function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="bg-background border-t">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8 2xl:max-w-[1400px]">
        <div className="grid grid-cols-1 gap-y-12 gap-x-8 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center mb-6">
              <Link href="/" className="group">
                <div className="relative w-48 h-12 transition-transform duration-300 group-hover:scale-105">
                  <div className="text-2xl font-bold text-primary">
                    Thepalmistrylife
                  </div>
                </div>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              {t('company_description')}
            </p>
            <div className="flex space-x-3 mb-6">
              <a href="https://www.facebook.com/thepalmistrylife" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors duration-200">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/thepalmistrylife/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors duration-200">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://x.com/thepalmistrylife" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors duration-200">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/company/thepalmistrylife" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors duration-200">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://www.youtube.com/@thepalmistrylife" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors duration-200">
                <span className="sr-only">YouTube</span>
                <Youtube className="h-5 w-5" />
              </a>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <a href="mailto:info@thepalmistrylife.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  info@thepalmistrylife.com
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <a href="tel:+18885551234" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  +1 (888) 555-1234
                </a>
              </div>
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">
                  {t('services')}
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {t('palm_reading')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {t('testimonials')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {t('faq')}
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">
                  {t('company')}
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {t('about_us')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {t('contact_us')}
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">
                  {t('policies')}
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {t('privacy_policy')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {t('terms_of_service')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/cookie-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {t('cookies')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/payment-terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {t('payment_terms')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/refund-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {t('refund_policy')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/shipping" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {t('shipping_policy')}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-border pt-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
            <div className="md:pr-8">
              <h3 className="text-base font-semibold text-foreground mb-2">{t('newsletter_title')}</h3>
              <p className="text-sm text-muted-foreground">{t('newsletter_description')}</p>
            </div>
            <div className="md:pl-4">
              <NewsletterForm />
            </div>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-center space-x-4 flex-wrap gap-y-4">
          <div className="h-8 w-auto flex items-center">
            <Image src="/assets/images/payment/visa-svgrepo-com.svg" alt="Visa" width={64} height={32} className="h-8 object-contain" />
          </div>
          <div className="h-8 w-auto flex items-center">
            <Image src="/assets/images/payment/mastercard-svgrepo-com.svg" alt="Mastercard" width={64} height={32} className="h-8 object-contain" />
          </div>
          <div className="h-8 w-auto flex items-center">
            <Image src="/assets/images/payment/paypal-svgrepo-com.svg" alt="PayPal" width={64} height={32} className="h-8 object-contain" />
          </div>
          <div className="h-8 w-auto flex items-center">
            <Image src="/assets/images/payment/stripe-svgrepo-com.svg" alt="Stripe" width={64} height={32} className="h-8 object-contain" />
          </div>
          <div className="h-8 w-auto flex items-center">
            <Image src="/assets/images/payment/Apple_Pay-Logo.wine.svg" alt="Apple Pay" width={64} height={32} className="h-8 object-contain" />
          </div>
          <div className="h-8 w-auto flex items-center">
            <Image src="/assets/images/payment/google-pay-icon-svgrepo-com.svg" alt="Google Pay" width={64} height={32} className="h-8 object-contain" />
          </div>
        </div>

        <div className="mt-16 border-t border-border pt-8 flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground order-last sm:order-first">
            {t('copyright')}
          </p>
          <div className="flex items-center gap-x-4">
            <LocaleToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
