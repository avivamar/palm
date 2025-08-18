import type { Metadata } from 'next';
import { ChevronDown } from 'lucide-react';
import { JsonLd } from '@/components/JsonLd';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | NEBULA',
  description: 'Find answers to common questions about NEBULA personalized compatibility reports, relationship guidance, and astrological insights.',
  keywords: 'FAQ, questions, NEBULA, compatibility reports, relationship guidance, astrology, psychic readings',
  alternates: {
    canonical: 'https://nebula.com/faq',
  },
  openGraph: {
    title: 'Frequently Asked Questions | NEBULA',
    description: 'Find answers to common questions about NEBULA personalized compatibility reports, relationship guidance, and astrological insights.',
    url: 'https://nebula.com/faq',
    siteName: 'NEBULA',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frequently Asked Questions | NEBULA',
    description: 'Find answers to common questions about NEBULA personalized compatibility reports, relationship guidance, and astrological insights.',
  },
};

export default function FAQPage() {
  // NEBULA FAQ 数据
  const nebulaFaqData = [
    {
      question: 'What are the benefits of a consultation?',
      answer: 'A consultation can provide valuable insights into your personality, relationships, and life path. It can help you understand your strengths and challenges, and provide guidance for making important decisions.',
    },
    {
      question: 'How can this platform improve my life?',
      answer: 'Our platform offers personalized compatibility reports and relationship guidance based on astrological insights. This can help you better understand yourself and your relationships, leading to improved communication and stronger connections.',
    },
    {
      question: 'How should I prepare for a reading?',
      answer: 'To get the most accurate reading, please provide your exact birth date, time, and location. Come with an open mind and specific questions you would like answered. The more focused your questions, the more helpful the reading will be.',
    },
    {
      question: 'How can I get an accurate reading?',
      answer: 'Accuracy depends on the precision of your birth information and your openness during the consultation. Provide exact birth details and be honest about your situation. Our experienced advisors use proven astrological methods to provide insights.',
    },
    {
      question: 'How do I choose a psychic?',
      answer: 'Browse our advisor profiles to find someone who specializes in your area of interest. Read their reviews and ratings from other clients. You can also try our matching system that suggests advisors based on your needs and preferences.',
    },
    {
      question: 'How are reviews displayed?',
      answer: 'Reviews are displayed on each advisor\'s profile page, showing ratings and written feedback from verified clients. Reviews are sorted by most recent first, and we maintain authenticity by only allowing reviews from actual consultation clients.',
    },
    {
      question: 'How do I use this platform?',
      answer: 'Simply create an account, browse our advisor profiles, and select the one that resonates with you. You can then book a consultation at a time that works for both you and your chosen advisor. Payment is processed securely through our platform.',
    },
    {
      question: 'How does the payment system work?',
      answer: 'We accept major credit cards and secure online payment methods. Payment is processed when you book a consultation. You can view your payment history and receipts in your account dashboard. All transactions are encrypted and secure.',
    },
    {
      question: 'Do I need to pay for additional services?',
      answer: 'Basic consultations include the agreed-upon services. Some advisors may offer additional services like detailed written reports or follow-up sessions for an extra fee. All pricing is clearly displayed before booking.',
    },
    {
      question: 'How does it help get the most accurate and fast readings?',
      answer: 'Our psychics will use various techniques and tools to help you, many of which require you to provide accurate information such as birth date, time and place, so that we can provide you with the most accurate answers. Therefore, if you fill in all this information in your profile, the psychic will not waste your time asking for details in the chat. In addition, please ensure that all the information you provide is kept confidential.',
    },
    {
      question: 'How should I choose a psychic?',
      answer: 'First of all, becoming a psychic on AskNebula is not easy. All psychics undergo security and reputation checks before they start using our platform. In addition, before starting work, we train them according to our unique technical and empathy policies. We do our best to ensure that you get a unique and best experience in consultation. Our psychics will answer any of your questions, and nothing is impossible for them. You can use convenient filters to choose your exclusive psychic, or you can view the psychic\'s personal information in their personal profile, or choose based on charging standards and reviews. There are many factors that affect a psychic\'s charging standards: experience, popularity, achievements, free time, service scope, technical knowledge, etc. But what all psychics have in common is their talent and sincere willingness to help. If you have difficulty choosing your exclusive psychic, you can contact customer service at any time, and we will do our best to help you choose the psychic that best suits your needs.',
    },
    {
      question: 'How are reviews displayed?',
      answer: 'After your reading is over, you can leave feedback immediately. Only submitted star ratings and written feedback will be displayed at the bottom of the psychic list page under the corresponding username. Feedback is very useful when choosing the best psychic. Therefore, this not only helps us better improve our services, but also helps other customers choose the psychic that best suits them.',
    },
    {
      question: 'How do I use this platform?',
      answer: 'You can click the \'Psychics\' tab on the homepage to select a psychic. Psychics have three different statuses: online, offline, and busy. If the psychic is online, you will chat through a real-time chat session. The psychic will not be disturbed by other messages and will provide you with answers and readings at the fastest speed. To start chatting, please click the \'Start Chat\' button, and the psychic will contact you within 60 seconds. If the psychic is offline or busy, you will have a chat similar to using instant messaging software, and you will get a reading immediately as long as the psychic is available.',
    },
    {
      question: 'How does the payment system work?',
      answer: 'Whether you choose to chat online through real-time chat or send messages when the psychic is busy or offline, you need to pay by the minute. During real-time chat, you will have a private conversation with our psychic without any interference, with only you and the psychic in a real chat. At the same time, if the psychic is busy or offline, you can send any number of messages for free within 1 minute. No fees are charged for the time the psychic replies to you.',
    },
    {
      question: 'Should I pay for additional services in chat (tarot cards, runes, rituals, etc.)?',
      answer: 'Absolutely not! You can choose the type of reading you like and trust. No matter what kind of reading you want to get, it doesn\'t matter; you only pay for communicating with the psychic.',
    },
    {
      question: 'How will I get my reading?',
      answer: 'Any type of reading will be provided by your psychic through chat. After selecting a package, you will be redirected to the chat room to start the conversation and get answers.',
    },
    {
      question: 'How long does it usually take to get my reading?',
      answer: 'When the psychic is online, you can get answers within 2 minutes. Sometimes, it may take longer, depending on your needs. Some questions require deeper analysis. In order to make you feel completely satisfied during the consultation process and clarify your doubts, the psychic will choose the appropriate reading type according to your questions, thoroughly and carefully study and analyze the reading results and horoscope, which may take some time. When the psychic is offline, you will receive a reply within 48 hours. Thank you for your patience and understanding! If you miss the reply, we will notify you by email.',
    },
    {
      question: 'How is my zodiac sign calculated on the platform?',
      answer: 'To determine your zodiac sign, modern Western astrology considers three most important factors: your birth date, your birth place, and your birth time. The sun sign transition does not happen exactly at midnight. The specific time of the sun sign transition also depends on your location. For example, in 2019, the sun entered Virgo at 6:02 AM (New York time) on August 23, while it was 3:02 AM Los Angeles time. In 2020, because it was a leap year, everything was postponed by one day (after February), and the sun entered Virgo from Leo at 11:45 AM (New York time) on August 22, while it was 8:45 AM (Los Angeles time). The \'start\' date of a new zodiac sign is (most years) the date when the sun changes houses. Therefore, providing specific time and location helps us determine where the sun was when you were born.',
    },
    {
      question: 'How do I find a compatibility report?',
      answer: 'From placing an order to receiving information, it may take us up to an hour to generate a compatibility report and send it to you. The report will be sent to the email address you used when registering on the platform. Please carefully check your inbox and spam folder.',
    },
  ];

  // 转换为 JsonLd 所需的格式
  const questions = nebulaFaqData.map(item => ({
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
            Find answers to common questions about our personalized compatibility reports and relationship guidance.
          </p>

          <div className="mb-16">
            <img
              src="/images/faq-illustration.svg"
              alt="FAQ Illustration"
              className="mx-auto mb-8 h-64 w-64"
            />
          </div>

          <div className="space-y-4">
            {nebulaFaqData.map((item, index) => (
              <Collapsible key={index} className="rounded-lg border">
                <CollapsibleTrigger className="flex w-full items-center justify-between p-6 text-left hover:bg-muted/50">
                  <h3 className="text-lg font-semibold">{item.question}</h3>
                  <ChevronDown className="h-5 w-5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-6 pb-6">
                  <p className="text-muted-foreground">{item.answer}</p>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>

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
