import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Payment Terms | NEBULA',
  description: 'Payment terms and conditions for NEBULA palm reading services including credits, billing, and refunds.',
};

export default async function PaymentTermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold mb-8">Payment Terms</h1>

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

          <h2 className="text-2xl font-semibold mt-8 mb-4">Acknowledgment</h2>
          <p>
            To access certain features of the website, you should purchase credits ("Credits") to top up your credit balance ("Credit Balance").
          </p>
          <p className="mt-4">
            When you access paid features of the website by the minute, credits will be deducted from your Credit Balance. At the beginning of each minute, 30 credits will be deducted from your Credit Balance.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Automatic Account Top-up</h2>
          <p>
            You can also use the automatic top-up feature to use the website features and your readings uninterrupted. This feature allows the Credit Balance to be automatically renewed.
          </p>
          <p className="mt-4">
            You can explicitly authorize us to automatically top up your Credit Balance to the package of your choice when your Credit Balance is insufficient to pay for the next minute of chat, until you cancel.
          </p>
          <p className="mt-4">
            You will receive a notification whenever you top up your balance. You can deactivate this feature through
            {' '}
            <a href="https://asknebula.com/settings/personal" className="text-blue-600 hover:underline">
              Account Settings
            </a>
            .
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Payment Methods</h2>
          <p>
            To top up your Credit Balance, we will charge your submitted payment method upon purchase confirmation. You authorize us to deduct the corresponding fees from your submitted payment method.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Cancellation</h2>
          <p>
            If you cancel the automatic top-up of your Credit Balance, the feature will be disabled, but you can still use all the credits remaining in your Credit Balance.
          </p>
          <p className="mt-4">
            <a href="https://asknebula.com/settings/personal" className="text-blue-600 hover:underline">
              You can turn off the automatic Credit Balance top-up feature on the Account Settings page
            </a>
            {' '}
            to cancel this feature.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Credit Forfeiture</h2>
          <p>
            If your account is suspended or terminated for any reason, we have the right, at our sole discretion and without prior notice, to forfeit all credits, including but not limited to the following reasons:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Your account on this website has been inactive (i.e., not used or logged in) for one year;</li>
            <li>You fail to comply with any documents posted on the website (Terms and Conditions, Privacy Policy, Live Chat Rules);</li>
            <li>We suspect you of fraud or abuse of credits and services;</li>
            <li>We suspect any other illegal activities in your account;</li>
            <li>We are taking action to protect the service, any of our users, psychics, or our reputation.</li>
          </ul>
          <p className="mt-4">
            When your account is closed, whether voluntarily or involuntarily, you will not receive monetary or other compensation for unused credits.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Changes</h2>
          <p>
            To the maximum extent permitted by applicable law, we may change the payment terms at any time. We will give you reasonable notice of any such changes by posting new terms on the website, sending email notifications, or in other prominent ways. If you do not want to pay new fees, you can cancel automatic top-up before the changes take effect.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Refunds</h2>
          <p>
            <a href="https://asknebula.com/terms" className="text-blue-600 hover:underline">
              Refund rules are explained in our Terms and Conditions
            </a>
            .
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Other Terms</h2>
          <p>
            You agree that purchased credits have no monetary value and do not constitute any form of actual currency or property. Credits may not be sold, transferred, traded, or exchanged for any legal payment method, goods, or other items of monetary value (by us or any other party).
          </p>
          <p className="mt-4">
            You may not purchase or sell any credits or your account in exchange for legally accepted money or otherwise convert them to any other type of value, unless we have provided otherwise.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Information</h2>
          <p>
            If you have any questions about these terms, please contact our
            {' '}
            <a href="https://24hours.support-nebula.com/hc/en-us" className="text-blue-600 hover:underline">
              Support Center
            </a>
            .
          </p>
          <p className="mt-4">
            Please take a screenshot of this information for reference.
          </p>
          <div className="bg-muted/30 p-4 rounded-lg mt-4">
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