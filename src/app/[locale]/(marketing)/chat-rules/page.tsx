import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Live Chat Rules | Thepalmistrylife',
  description: 'Guidelines and rules for using Thepalmistrylife live chat services with psychics, ensuring respectful interactions.',
};

export default async function ChatRulesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold mb-8">Live Chat Rules</h1>
          
          <div className="bg-muted/50 p-6 rounded-lg mb-8">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Effective Date:</strong>
              {' '}
              May 19, 2021
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Last Updated:</strong>
              {' '}
              May 19, 2021
            </p>
          </div>

          <p>
            Your conversations with astrologers, tarot readers, numerologists, or other psychics (
            <strong>Psychics</strong>
            ) in the live chat section of Thepalmistrylife (
            <strong>Live Chat</strong>
            ) are hosted by us and are subject to these Thepalmistrylife Live Chat Rules (
            <strong>Rules</strong>
            ).
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Rules for Live Chat Conversations</h2>

          <p>When engaging in live chat conversations with psychics, you should follow these rules:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Ask psychics clear and specific questions about your concerns and interests. Your questions should be one at a time and should not be vague.</li>
            <li>Do not end the chat without getting a response from the psychic.</li>
            <li>Be polite to psychics. Do not use obscene, offensive, or otherwise inappropriate language.</li>
            <li>Do not insult, harass, humiliate, or threaten psychics.</li>
            <li>Do not question or criticize the professional qualifications of psychics. Our psychics have years of reading experience and are all carefully selected by us based on their expertise and counseling skills.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Consequences of Rule Violations</h2>
          <p>
            Each violation of these rules will result in a warning. If you continue to violate the rules after a second warning,
            your access to live chat may be terminated and you may receive a corresponding notification.
          </p>
          
          <p>
            We may also terminate your access to live chat without prior warning if you violate our
            {' '}
            <Link href="/terms" className="text-primary hover:underline">
              Terms and Conditions
            </Link>
            .
          </p>

          <p>
            You may challenge the termination of your live chat access by contacting us through our
            {' '}
            <a href="https://thepalmistry.life/contact" className="text-primary hover:underline">
              Support Center
            </a>
            .
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Important Disclaimer</h2>
          <p className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <strong>
              The information provided through live chat is for reference and entertainment purposes only.
              This service is not intended to replace any professional advice, including but not limited to
              (a) professional medical or psychiatric advice, diagnosis, or treatment, or
              (b) professional financial or investment advice or guidance, or
              (c) professional legal advice.
              Whether you rely on the information provided by this service is entirely at your own discretion.
              Any and all decisions you make based on the information provided by this service,
              whether in whole or in part, are at your own risk.
            </strong>
          </p>

          <div className="bg-muted/30 p-4 rounded-lg mt-8">
            <p>
              <strong>Last Updated:</strong>
              {' '}
              May 19, 2021
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}