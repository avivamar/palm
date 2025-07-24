import type { Metadata } from 'next';
import { CheckCircle2 } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import MagicCard from '@/components/ui/magic-card';

type IPartnerProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: IPartnerProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Partner' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
    openGraph: {
      title: t('meta_title'),
      description: t('meta_description'),
      images: [
        {
          url: '/images/og-image.jpg',
          alt: t('meta_og_image_alt'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta_title'),
      description: t('meta_description'),
      images: ['/images/og-image.jpg'],
    },
  };
}

export default async function Partner(props: IPartnerProps) {
  const { locale } = await props.params;

  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'Partner' });

  const partnershipTypes = [
    {
      title: t('partnership_type1_title'),
      description: t('partnership_type1_description'),
      icon: '/images/investment.svg',
    },
    {
      title: t('partnership_type2_title'),
      description: t('partnership_type2_description'),
      icon: '/images/custom.svg',
    },
    {
      title: t('partnership_type3_title'),
      description: t('partnership_type3_description'),
      icon: '/images/distribution.svg',
    },
    {
      title: t('partnership_type4_title'),
      description: t('partnership_type4_description'),
      icon: '/images/technology.svg',
    },
  ];

  const benefits = [
    t('benefit1'),
    t('benefit2'),
    t('benefit3'),
    t('benefit4'),
    t('benefit5'),
    t('benefit6'),
  ];

  return (
    <div className="container mx-auto px-6 py-16 max-w-7xl">
      {/* Hero Section */}
      <div className="mx-auto max-w-4xl text-center mb-32">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
          {t('title')}
        </h1>
        <p className="mt-8 text-xl leading-8 text-muted-foreground max-w-3xl mx-auto">
          {t('subtitle')}
        </p>
        <div className="mt-12 flex items-center justify-center gap-x-6">
          <Button asChild size="lg" className="rounded-full px-10 py-7 text-lg">
            <Link href="/contact">{t('cta_button')}</Link>
          </Button>
        </div>
      </div>

      {/* Vision Section */}
      <div className="mx-auto mb-36 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-8">{t('vision_title')}</h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {t('vision_description')}
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('vision_description2')}
            </p>
          </div>
          <div className="relative h-96 w-full rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="/partnership.png"
              alt={t('vision_image_alt')}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Partnership Types Section */}
      <div className="mx-auto mb-36">
        <h2 className="text-4xl font-bold text-center mb-6">{t('partnership_types_title')}</h2>
        <p className="text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto leading-relaxed">
          {t('partnership_types_description')}
        </p>
        <div className="grid gap-10 md:grid-cols-2">
          {partnershipTypes.map((type, index) => (
            <MagicCard
              key={index}
              gradientFrom="#ebff7f"
              gradientTo="#d9ff50"
              gradientColor="#ebff7f"
              gradientOpacity={0.15}
              className="group h-full"
            >
              <div className="flex flex-row items-start space-x-5 pb-3">
                <div className="h-14 w-14 relative">
                  <Image
                    src={type.icon}
                    alt={type.title}
                    width={56}
                    height={56}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{type.title}</h3>
                </div>
              </div>
              <div className="mt-5">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {type.description}
                </p>
              </div>
            </MagicCard>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="mx-auto mb-36 max-w-5xl">
        <h2 className="text-4xl font-bold text-center mb-16">{t('benefits_title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-primary/5 transition-colors">
              <CheckCircle2 className="h-7 w-7 text-primary flex-shrink-0 mt-1" />
              <p className="text-lg leading-relaxed">{benefit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="mx-auto mb-36 max-w-5xl">
        <h2 className="text-4xl font-bold text-center mb-16">{t('testimonials_title')}</h2>
        <div className="bg-primary/5 rounded-3xl p-10 border border-primary/10 shadow-sm">
          <p className="text-2xl italic mb-8 leading-relaxed">
            "
            {t('testimonial_quote')}
            "
          </p>
          <div className="flex items-center">
            <div className="h-16 w-16 relative rounded-full overflow-hidden mr-5 border-2 border-primary/20">
              <Image
                src="/images/testimonial-avatar.jpg"
                alt={t('testimonial_name')}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-lg">{t('testimonial_name')}</p>
              <p className="text-base text-muted-foreground">{t('testimonial_position')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mb-16 rounded-3xl bg-gradient-to-r from-primary/20 to-primary/10 p-16 text-center">
        <h2 className="text-4xl font-bold mb-6">{t('become_partner_title')}</h2>
        <p className="mx-auto max-w-2xl text-xl mb-10 leading-relaxed">
          {t('become_partner_description')}
        </p>
        <Button asChild size="lg" className="rounded-full px-10 py-7 text-lg">
          <Link href="/contact">{t('contact_us')}</Link>
        </Button>
      </div>
    </div>
  );
}
