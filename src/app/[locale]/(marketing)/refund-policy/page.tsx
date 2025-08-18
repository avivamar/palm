import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Refund Policy | NEBULA',
  description: 'Refund Policy for NEBULA - Learn about our refund procedures and terms for personalized compatibility reports and relationship guidance.',
};

export default async function RefundPolicy({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="container py-12 md:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-4xl font-bold tracking-tight sm:text-5xl">
          Refund Policy
        </h1>
        <div className="prose prose-lg dark:prose-invert">
          <p className="text-muted-foreground mb-6">Effective Date: August 17, 2021</p>

          <p>
            This refund guarantee policy ("Refund Policy") applies to purchases made on the
            {' '}
            <a href="https://asknebula.com" className="text-primary hover:underline">
              https://asknebula.com
            </a>
            {' '}
            website.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4">General Refund Rules</h3>
          <p>
            Generally, the fees you pay for services are non-refundable and/or non-exchangeable, unless otherwise specified in this Refund Policy or required by applicable law.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4">Refund Guarantee Rules</h3>
          <p>
            However, if you meet the following conditions, we decide to provide you with a refund opportunity ("Voluntary Refund").
          </p>
          <p>
            If you did not achieve the expected results through our personalized compatibility report and relationship guidance, and meet all of the following conditions, you are eligible for a voluntary refund:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>You contact us within 30 days after purchasing the personalized compatibility report and relationship guidance; and</li>
            <li>You have followed the personalized compatibility report and relationship guidance for at least 14 consecutive days within the first 30 days after purchase; and</li>
            <li>You can prove that you have followed the personalized compatibility report and relationship guidance as described in the "How to Prove You Have Followed the Guidelines" section below.</li>
          </ul>
          <p>
            We will review your application and notify you by email whether it is approved. If the application is approved, we will process your refund and automatically transfer the amount to your credit card or original payment method.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4">How to Prove You Have Followed the Guidelines</h3>
          <p>
            To be eligible for a voluntary refund, you must provide evidence that you have followed the personalized compatibility report and relationship guidance for at least 14 consecutive days. This evidence may include:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Screenshots or photos showing your implementation of the guidance</li>
            <li>Detailed written records of your daily activities following the recommendations</li>
            <li>Any other documentation that demonstrates your consistent adherence to the provided guidance</li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">Important Notice</h3>
          <p>
            Please note that this refund guarantee is offered voluntarily by us and is not required by law. We reserve the right to modify or discontinue this refund guarantee at any time without prior notice. Any changes to this policy will be effective immediately upon posting on our website.
          </p>
          <p>
            This Refund Policy is part of our Terms of Service and is subject to the same terms and conditions. By using our services, you agree to be bound by this Refund Policy.
          </p>

          <p className="text-sm text-muted-foreground mt-8">
            Last updated: August 17, 2021
          </p>
        </div>
      </div>
    </div>
  );
}
