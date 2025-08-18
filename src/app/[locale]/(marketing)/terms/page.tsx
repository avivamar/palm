import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Terms of Service | Rolitt',
  description: 'Terms of Service for Rolitt - Read our terms and conditions for using our products and services.',
};

export default async function Terms({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="container py-12 md:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-4xl font-bold tracking-tight sm:text-5xl">
          Terms of Service
        </h1>
        <div className="prose prose-lg dark:prose-invert">
          <h2 className="text-2xl font-bold mt-8 mb-4">Terms of Service</h2>
          <p className="text-muted-foreground mb-6">Effective Date: December 1, 2024</p>

          <h3 className="text-xl font-bold mt-8 mb-4">Acceptance of Terms</h3>
          <p>
            By accessing or using the NEBULA website and services ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4">Important Disclaimers</h3>
          <p className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <strong>IMPORTANT:</strong>
            {' '}
            NEBULA provides palm reading and astrological services for entertainment purposes only. Our readings are not intended to replace professional advice from licensed medical, legal, financial, or psychological professionals. Please consult appropriate professionals for serious life decisions.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4">Account Registration</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>You must be at least 18 years old to create an account</li>
            <li>You must provide accurate and complete information during registration</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>You must notify us immediately of any unauthorized use of your account</li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">Service Terms</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>Palm Reading Services:</strong>
              {' '}
              Our AI-powered palm reading analysis is provided for entertainment and self-reflection purposes
            </li>
            <li>
              <strong>Accuracy:</strong>
              {' '}
              We do not guarantee the accuracy of readings or predictions
            </li>
            <li>
              <strong>Personal Responsibility:</strong>
              {' '}
              You acknowledge that any decisions made based on our readings are your own responsibility
            </li>
            <li>
              <strong>Service Availability:</strong>
              {' '}
              We strive to maintain service availability but do not guarantee uninterrupted access
            </li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">Third-Party Advertising</h3>
          <p>
            Our Service may display advertisements from third parties. We are not responsible for the content, accuracy, or practices of third-party advertisers. Your interactions with advertisers are solely between you and the advertiser.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4">Intellectual Property</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>All content on our Service, including text, graphics, logos, and software, is our property or licensed to us</li>
            <li>You may not reproduce, distribute, or create derivative works without our written permission</li>
            <li>User-generated content remains your property, but you grant us a license to use it in connection with our Service</li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">User Content</h3>
          <p>
            By submitting content to our Service (including photos for palm reading), you:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Represent that you own or have the right to submit such content</li>
            <li>Grant us a non-exclusive license to use, process, and analyze your content</li>
            <li>Agree that your content will not violate any laws or third-party rights</li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">Payment and Refund Policy</h3>
          <h4 className="text-lg font-semibold mt-6 mb-3">Payment Terms</h4>
          <ul className="list-disc pl-6 mb-4">
            <li>All fees are charged in advance and are non-refundable except as required by law</li>
            <li>Prices are subject to change with notice</li>
            <li>You authorize us to charge your payment method for all fees</li>
          </ul>

          <h4 className="text-lg font-semibold mt-6 mb-3">Refund Policy</h4>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>General Policy:</strong>
              {' '}
              All sales are final. We do not offer refunds for digital services once delivered
            </li>
            <li>
              <strong>Technical Issues:</strong>
              {' '}
              If you experience technical problems preventing service delivery, contact us within 48 hours
            </li>
            <li>
              <strong>EU Residents:</strong>
              {' '}
              You have the right to withdraw from purchases within 14 days, except for digital content that has been delivered
            </li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">User Representations and Restrictions</h3>
          <p>You represent and warrant that:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>You are at least 18 years old</li>
            <li>You will use our Service only for lawful purposes</li>
            <li>You will not use our Service for commercial purposes without permission</li>
            <li>You will not attempt to reverse engineer or hack our Service</li>
            <li>You will not submit false or misleading information</li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">Prohibited Activities</h3>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Use our Service for any illegal or unauthorized purpose</li>
            <li>Violate any laws in your jurisdiction</li>
            <li>Transmit viruses, malware, or other harmful code</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Impersonate any person or entity</li>
            <li>Collect user information without consent</li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">Disclaimers</h3>
          <p className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border">
            <strong>DISCLAIMER:</strong>
            {' '}
            Our Service is provided "as is" without warranties of any kind. We disclaim all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that our Service will be uninterrupted, secure, or error-free.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4">Limitation of Liability</h3>
          <p>
            To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or other intangible losses, resulting from your use of our Service.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4">Indemnification</h3>
          <p>
            You agree to indemnify and hold us harmless from any claims, damages, losses, and expenses arising from your use of our Service or violation of these Terms.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4">International Use</h3>
          <p>
            Our Service is controlled and operated from the United States. We make no representation that our Service is appropriate or available for use in other locations. If you access our Service from other jurisdictions, you are responsible for compliance with local laws.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4">Mandatory Binding Arbitration and Class Action Waiver</h3>
          <h4 className="text-lg font-semibold mt-6 mb-3">Arbitration Agreement</h4>
          <p>
            Any dispute arising from these Terms or your use of our Service will be resolved through binding arbitration rather than in court, except that you may assert claims in small claims court if they qualify.
          </p>

          <h4 className="text-lg font-semibold mt-6 mb-3">Arbitration Process</h4>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>Administrator:</strong>
              {' '}
              American Arbitration Association (AAA)
            </li>
            <li>
              <strong>Rules:</strong>
              {' '}
              AAA Consumer Arbitration Rules
            </li>
            <li>
              <strong>Location:</strong>
              {' '}
              Your county of residence or another mutually agreed location
            </li>
            <li>
              <strong>Costs:</strong>
              {' '}
              We will pay arbitration fees for claims under $10,000
            </li>
          </ul>

          <h4 className="text-lg font-semibold mt-6 mb-3">Class Action Waiver</h4>
          <p>
            You agree that disputes will be resolved individually and not as part of a class action, collective action, or representative proceeding.
          </p>

          <h4 className="text-lg font-semibold mt-6 mb-3">Arbitrator Powers</h4>
          <p>
            The arbitrator may award the same damages and relief as a court, but only in favor of the individual party seeking relief.
          </p>

          <h4 className="text-lg font-semibold mt-6 mb-3">Time Limit</h4>
          <p>
            Any arbitration must be commenced within one year of the dispute arising, or the claim will be permanently barred.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4">Governing Law</h3>
          <p>
            These Terms are governed by the laws of the State of California, United States, without regard to conflict of law principles.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4">Miscellaneous</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>Waiver:</strong>
              {' '}
              Our failure to enforce any provision does not constitute a waiver
            </li>
            <li>
              <strong>Severability:</strong>
              {' '}
              If any provision is invalid, the remaining provisions remain in effect
            </li>
            <li>
              <strong>Assignment:</strong>
              {' '}
              We may assign these Terms; you may not assign them without our consent
            </li>
            <li>
              <strong>Electronic Communications:</strong>
              {' '}
              You consent to receive communications electronically
            </li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">Contact Information</h3>
          <p>
            For questions about these Terms, please contact us at:
          </p>
          <p>
            Email:
            {' '}
            <a href="mailto:support@nebula-palm.com" className="text-primary hover:underline">
              support@nebula-palm.com
            </a>
          </p>

          <p className="text-sm text-muted-foreground mt-8">
            Last Updated: December 1, 2024
          </p>
        </div>
      </div>
    </div>
  );
}
