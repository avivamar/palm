import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Thepalmistrylife',
  description: 'Find answers to common questions about palmistry readings, hand analysis, and personalized palm reading insights.',
  keywords: 'FAQ, questions, palmistry, palm reading, hand analysis, fortune telling, life lines',
  alternates: {
    canonical: 'https://thepalmistry.life/faq',
  },
  openGraph: {
    title: 'Frequently Asked Questions | Thepalmistrylife',
    description: 'Find answers to common questions about palmistry readings, hand analysis, and personalized palm reading insights.',
    url: 'https://thepalmistry.life/faq',
    siteName: 'Thepalmistrylife',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frequently Asked Questions | Thepalmistrylife',
    description: 'Find answers to common questions about palmistry readings, hand analysis, and personalized palm reading insights.',
  },
};

export default function FAQPage() {
  // Palmistry FAQ 数据
  const palmistryFaqData = [
    {
      question: 'What are the benefits of a palm reading consultation?',
      answer: 'A palm reading consultation can provide valuable insights into your personality, life path, and potential future. It can help you understand your natural talents, relationship patterns, and life challenges through the analysis of your hand lines, mounts, and finger shapes.',
    },
    {
      question: 'How can palmistry improve my life?',
      answer: 'Palmistry offers personalized insights based on the unique features of your hands. This ancient practice can help you better understand your strengths, weaknesses, and life patterns, leading to improved self-awareness and better decision-making.',
    },
    {
      question: 'How should I prepare for a palm reading?',
      answer: 'To get the most accurate reading, ensure your hands are clean and well-lit for clear photos or video calls. Come with an open mind and specific questions you would like answered. The more focused your questions, the more helpful the reading will be.',
    },
    {
      question: 'How can I get an accurate palm reading?',
      answer: 'Accuracy depends on the quality of your hand images and your openness during the consultation. Provide clear, high-resolution photos of both palms under good lighting. Our experienced palm readers use traditional palmistry methods combined with modern interpretation techniques.',
    },
    {
      question: 'How do I choose a palm reader?',
      answer: 'Browse our palm reader profiles to find someone who specializes in your area of interest. Read their reviews and ratings from other clients. You can also try our matching system that suggests readers based on your needs and preferences.',
    },
    {
      question: 'How are reviews displayed?',
      answer: 'Reviews are displayed on each palm reader\'s profile page, showing ratings and written feedback from verified clients. Reviews are sorted by most recent first, and we maintain authenticity by only allowing reviews from actual consultation clients.',
    },
    {
      question: 'How do I use this platform?',
      answer: 'Simply create an account, browse our palm reader profiles, and select the one that resonates with you. You can then book a consultation at a time that works for both you and your chosen reader. Payment is processed securely through our platform.',
    },
    {
      question: 'How does the payment system work?',
      answer: 'We accept major credit cards and secure online payment methods. Payment is processed when you book a consultation. You can view your payment history and receipts in your account dashboard. All transactions are encrypted and secure.',
    },
    {
      question: 'Do I need to pay for additional services?',
      answer: 'Basic palm reading consultations include the agreed-upon services. Some readers may offer additional services like detailed written reports or follow-up sessions for an extra fee. All pricing is clearly displayed before booking.',
    },
    {
      question: 'What information do I need to provide for an accurate palm reading?',
      answer: 'For the most accurate palm reading, please provide clear, high-resolution photos of both your palms under good lighting. Include photos of your palm lines, mounts, and finger shapes. The clearer the images, the more detailed and accurate your reading will be.',
    },
    {
      question: 'What makes a good palm reader?',
      answer: 'All palm readers on our platform undergo thorough background checks and training in traditional palmistry techniques. We ensure they have extensive knowledge of hand analysis, line interpretation, and mount reading. Our readers combine ancient wisdom with modern insights to provide you with the most comprehensive reading experience.',
    },
    {
      question: 'How do I leave feedback after my reading?',
      answer: 'After your palm reading session, you can leave feedback immediately. Your star ratings and written reviews will be displayed on the reader\'s profile page. Your feedback helps us improve our services and helps other clients choose the best palm reader for their needs.',
    },
    {
      question: 'How does the consultation process work?',
      answer: 'You can browse our palm readers and check their availability status: online, offline, or busy. When a reader is online, you can start an immediate consultation. If they are offline or busy, you can schedule a session or leave a message. Our readers will respond within 24-48 hours.',
    },
    {
      question: 'What are the different pricing options?',
      answer: 'Our palm reading sessions are priced per minute for live consultations, or you can choose from various package options for comprehensive readings. Pricing varies based on the reader\'s experience and specialization. All prices are clearly displayed on each reader\'s profile.',
    },
    {
      question: 'Are there additional costs for specialized readings?',
      answer: 'Basic palm readings include standard line and mount analysis. Some readers offer specialized services like relationship compatibility through palm analysis, career guidance, or detailed written reports for an additional fee. All pricing is transparent and shown before booking.',
    },
    {
      question: 'How will I receive my palm reading results?',
      answer: 'Palm readings are conducted through our secure chat platform or video calls. You will receive your interpretation and insights directly during the session. Some readers also provide written summaries or detailed reports via email.',
    },
    {
      question: 'How long does a typical palm reading session take?',
      answer: 'A standard palm reading session typically takes 15-30 minutes, depending on the complexity of your questions and the depth of analysis requested. More comprehensive readings that include detailed life path analysis may take 45-60 minutes.',
    },
    {
      question: 'What can palm reading tell me about my future?',
      answer: 'Palm reading provides insights into your personality traits, natural talents, potential life paths, and relationship patterns. While it can indicate tendencies and possibilities, remember that your choices and actions ultimately shape your future. Palm reading is a tool for self-understanding and guidance.',
    },
    {
      question: 'How do I get my personalized palm reading report?',
      answer: 'After your consultation, detailed palm reading reports are typically delivered within 24 hours to your registered email address. The report includes analysis of your major lines, mounts, finger characteristics, and personalized insights. Please check both your inbox and spam folder.',
    },
  ];

  // 转换为 JsonLd 所需的格式
  const questions = palmistryFaqData.map(item => ({
    question: {
      '@type': 'Question',
      'name': item.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.answer,
      },
    },
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': questions.map(q => q.question),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-8 text-4xl font-bold tracking-tight sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mb-12 text-xl text-muted-foreground">
            Find answers to common questions about our palmistry readings and hand analysis services.
          </p>

          <div className="mb-16">
            <img
              src="/images/faq-illustration.svg"
              alt="FAQ Illustration"
              className="mx-auto mb-8 h-64 w-64"
            />
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {palmistryFaqData.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="rounded-lg border">
                <AccordionTrigger className="px-6 py-4 text-left hover:bg-muted/50">
                  <h3 className="text-lg font-semibold">{item.question}</h3>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <p className="text-muted-foreground">{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-16 rounded-lg bg-muted/50 p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold">Still have questions?</h2>
            <p className="mb-6 text-muted-foreground">
              Can\'t find the answer you\'re looking for? Please chat with our friendly team.
            </p>
            <button className="rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
