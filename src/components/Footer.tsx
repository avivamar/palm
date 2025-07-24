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
                <div className="relative w-32 h-12 transition-transform duration-300 group-hover:scale-105">
                  <svg
                    viewBox="0 0 480 165"
                    className="w-full h-full hover:animate-pulse-slow"
                    aria-label="Rolitt"
                  >
                    <g stroke="none" strokeWidth="1" fillRule="evenodd">
                      <g transform="translate(-16.000000, -174.000000)" fillRule="nonzero">
                        <g transform="translate(16.000857, 174.000000)">
                          <path
                            className="fill-black dark:fill-primary transition-colors duration-300"
                            d="M393.994944,146.699902 C394.180895,164.257949 394.139216,164.290166 376.353626,163.323668 C355.294654,162.179978 342.104944,149.245014 341.284193,128.070654 C340.723134,113.60218 341.066182,99.0982668 341.010076,84.6088517 C340.998855,81.712579 341.062976,77.7789322 341.062976,74.2286634 C332.592109,74.2286634 332.038449,74.2286634 324.171875,74.2286634 L324.171875,51.8576946 C329.673434,51.8095089 324.118975,51.7882898 341.010076,51.8576946 L341.062976,19.5313216 C358.119841,19.4690353 366.650411,19.6973897 366.654685,20.2163845 C366.65896,20.7353793 366.65896,31.2824827 366.654685,51.8576946 L392.902207,51.8576946 C393.643881,51.8576946 394.317153,53.0011462 394.344404,53.2186083 C397.091993,74.6426464 397.936089,74.1529543 376.353626,74.2286634 C373.715041,74.2379188 370.884096,74.2286634 366.919809,74.2286634 C366.919809,84.2351386 366.892558,94.2496685 366.919809,103.774506 C366.940649,111.020019 366.841261,118.270365 367.116982,125.506213 C367.466442,134.691165 371.063635,138.458896 380.232953,139.467276 C384.429679,139.927974 388.67129,139.976298 393.643881,140.253361 C393.797771,142.991772 393.975708,144.845837 393.994944,146.699902 Z M478.239417,146.699902 C478.425368,164.257949 478.383689,164.290166 460.598099,163.323668 C439.539127,162.179978 426.349417,149.245014 425.528666,128.070654 C424.967607,113.60218 425.310655,99.0982668 425.254549,84.6088517 C425.243328,81.712579 425.307449,77.7789322 425.307449,74.2286634 C416.836582,74.2286634 416.282922,74.2286634 408.416348,74.2286634 L408.416348,51.8576946 C413.917907,51.8095089 408.363448,51.7882898 425.254549,51.8576946 L425.307449,19.5313216 C442.364314,19.4690353 450.894884,19.6973897 450.899158,20.2163845 C450.903433,20.7353793 450.903433,31.2824827 450.899158,51.8576946 L477.14668,51.8576946 C477.888354,51.8576946 478.561626,53.0011462 478.588877,53.2186083 C481.336466,74.6426464 482.180562,74.1529543 460.598099,74.2286634 C457.959514,74.2379188 455.128569,74.2286634 451.164283,74.2286634 C451.164283,84.2351386 451.137031,94.2496685 451.164283,103.774506 C451.185122,111.020019 451.085734,118.270365 451.361455,125.506213 C451.710915,134.691165 455.308108,138.458896 464.477426,139.467276 C468.674152,139.927974 472.915763,139.976298 477.888354,140.253361 C478.042244,142.991772 478.220181,144.845837 478.239417,146.699902 Z M290.474086,42.4291692 C299.035042,42.4291692 305.975069,35.4941851 305.975069,26.9394487 C305.975069,18.3847124 299.035042,11.4497283 290.474086,11.4497283 C281.91313,11.4497283 274.973103,18.3847124 274.973103,26.9394487 C274.973103,35.4941851 281.91313,42.4291692 290.474086,42.4291692 Z M277.279246,49.1638302 L303.279246,49.1638302 L303.279246,164.16383 L277.279246,164.16383 L277.279246,49.1638302 Z M257.317082,141.351819 L257.317082,162.329321 C234.549699,168.521465 215.456246,157.093412 214.906934,134.800079 C213.816388,90.5488227 214.567653,46.2524155 214.590272,1.973746 C214.590272,1.48998472 215.013565,1.00622345 215.483712,0 L239.721314,0 C239.950732,3.74753734 240.338483,7.15805436 240.338483,10.5701839 C240.354639,48.1487597 240.277089,85.7273355 240.299707,123.307524 C240.309401,138.56858 241.576051,139.887635 257.317082,141.351819 M134.499143,43 C167.91237,43 194.999143,70.0867726 194.999143,103.5 C194.999143,136.913227 167.91237,164 134.499143,164 C101.085916,164 73.9991429,136.913227 73.9991429,103.5 C73.9991429,70.0867726 101.085916,43 134.499143,43 Z M134.499143,65 C113.23618,65 95.9991429,82.2370371 95.9991429,103.5 C95.9991429,124.762963 113.23618,142 134.499143,142 C155.762106,142 172.999143,124.762963 172.999143,103.5 C172.999143,82.2370371 155.762106,65 134.499143,65 Z M59.7647031,74.7398167 C54.781643,74.398166 50.8528767,73.8905248 46.9257126,73.9050286 C33.9969949,73.9533754 26.3253255,81.0958087 26.0769736,94.1252692 C25.6940311,114.216585 25.705649,134.317115 25.942383,154.413722 C26.0769736,165.839272 27.39224,164 20.7355244,164 C15.5283635,164 6.16396044,164 0.139424773,164 C-0.0133249777,162.091913 -0.0405635702,139.36868 0.0577089959,95.8302995 C0.278822276,65.500744 21.7968049,45.2424738 51.7116935,49.4947323 C58.2722142,50.427279 59.8816689,51.6519844 59.8816689,58.389719 C59.8816689,63.8562776 59.8816689,69.3607308 59.8816689,75.0640411"
                          />
                        </g>
                      </g>
                    </g>
                  </svg>
                </div>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              {t('company_description')}
            </p>
            <div className="flex space-x-3 mb-6">
              <a href="https://www.facebook.com/profile.php?id=61560959570699" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors duration-200">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/rolittrobot/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors duration-200">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://x.com/Rolittai" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors duration-200">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/company/rolitt" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors duration-200">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://www.youtube.com/@RolittRobot" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors duration-200">
                <span className="sr-only">YouTube</span>
                <Youtube className="h-5 w-5" />
              </a>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <a href="mailto:support@rolitt.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  support@rolitt.com
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <a href="tel:+13024442859" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  +1 (302) 444-2859
                </a>
              </div>
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">
                  {t('products')}
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/solution" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {t('solutions')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {t('features')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/partner" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {t('partners')}
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
                    <Link href="/timeline" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {t('timeline')}
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
