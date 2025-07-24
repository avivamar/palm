import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type ITimelineProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: ITimelineProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Timeline' });

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

export default async function Timeline(props: ITimelineProps) {
  const { locale } = await props.params;

  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'Timeline' });

  const events = [
    {
      date: t('event5.date'),
      title: t('event5.title'),
      description: t('event5.description'),
    },
    {
      date: t('event4.date'),
      title: t('event4.title'),
      description: t('event4.description'),
    },
    {
      date: t('event3.date'),
      title: t('event3.title'),
      description: t('event3.description'),
    },
    {
      date: t('event2.date'),
      title: t('event2.title'),
      description: t('event2.description'),
    },
    {
      date: t('event1.date'),
      title: t('event1.title'),
      description: t('event1.description'),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {t('title')}
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-7xl">
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          <div className="relative">
            <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-muted"></div>
            <div className="space-y-12">
              {events.map((event, index) => (
                <div key={index} className="relative">
                  <div className="absolute left-1/2 top-6 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-primary bg-background"></div>
                  <div
                    className={`flex flex-col ${
                      index % 2 === 0
                        ? 'items-end pr-8 md:flex-row-reverse md:pl-8 md:pr-0'
                        : 'items-end pl-8 md:flex-row md:pl-0 md:pr-8'
                    }`}
                  >
                    <div
                      className={`mb-6 w-full md:mb-0 md:w-1/2 ${
                        index % 2 === 0 ? 'md:text-right' : 'md:text-left'
                      }`}
                    >
                      <div className="text-sm font-semibold text-primary">
                        {event.date}
                      </div>
                      <h2 className="mt-2 text-xl font-bold">{event.title}</h2>
                      <p className="mt-2 text-muted-foreground">
                        {event.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
