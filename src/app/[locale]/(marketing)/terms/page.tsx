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
          <h2 className="text-2xl font-bold mt-8 mb-4">Terms of Service for Rolitt</h2>
          <p className="text-muted-foreground mb-6">Effective Date: November 11, 2024</p>

          <p>
            These Terms of Service ("Terms") govern the use of the Rolitt website and services provided by Rolitt Inc. ("Company", "We", "Our", "Us"). By accessing or using our website, you agree to be bound by these Terms and any additional terms or policies referenced herein. If you do not agree with these Terms, you should not access or use our services.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4">1. Acceptance of Terms</h3>
          <p>
            By using the Rolitt website and services hosted on the Shopify platform (the "Service"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service, including our Privacy Policy and any other policies incorporated by reference.
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>Eligibility:</strong>
              {' '}
              You must be at least 18 years old or have the legal capacity to enter into a binding contract in your jurisdiction. If you are using the Service on behalf of someone under the age of 18, you must have legal authority to do so.
            </li>
            <li>
              <strong>Modification:</strong>
              {' '}
              Rolitt reserves the right to modify or update these Terms at any time without prior notice. It is your responsibility to review these Terms regularly. Any updates will be effective immediately upon posting on this website.
            </li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">2. Registration and Account</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>Account Creation:</strong>
              {' '}
              To use certain features of the Service, you may be required to create an account. During registration, you agree to provide accurate, current, and complete information, and to maintain the security of your account credentials.
            </li>
            <li>
              <strong>Account Security:</strong>
              {' '}
              You are responsible for safeguarding your account and notifying Rolitt immediately of any unauthorized use or breach of security. Rolitt is not responsible for any loss or damage caused by unauthorized use of your account.
            </li>
            <li>
              <strong>User Content:</strong>
              {' '}
              You retain ownership of the content you submit to the Service (e.g., reviews, comments, or other user-generated content), but by submitting it, you grant Rolitt Inc. a worldwide, irrevocable, royalty-free license to use, display, modify, and distribute the content.
            </li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">3. Orders and Payments</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>Product Availability:</strong>
              {' '}
              While we make every effort to ensure accurate product listings, availability and pricing are subject to change without notice. We do not guarantee that products or services will be available at all times.
            </li>
            <li>
              <strong>Pricing:</strong>
              {' '}
              All prices on the Service are listed in USD, excluding taxes and shipping. We reserve the right to modify product pricing, shipping charges, or promotional offers at any time.
            </li>
            <li>
              <strong>Payment:</strong>
              {' '}
              All payments are processed securely through Shopify's payment platform, and you agree to provide accurate and valid payment information. You authorize Rolitt Inc. to charge the payment method you select at checkout for the total cost of your order, including applicable taxes, shipping, and other fees.
            </li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">4. Shipping and Delivery</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>Processing Time:</strong>
              {' '}
              We aim to ship products promptly after the order is placed. Shipping times may vary depending on product availability and your location.
            </li>
            <li>
              <strong>Shipping Charges:</strong>
              {' '}
              Shipping charges will be calculated and displayed at checkout based on the delivery method and destination.
            </li>
            <li>
              <strong>Delivery:</strong>
              {' '}
              Delivery times depend on the shipping method and location. Rolitt is not liable for delays caused by third-party carriers or customs processing.
            </li>
            <li>
              <strong>Risk of Loss:</strong>
              {' '}
              All products purchased from Rolitt are shipped in accordance with our shipping terms. The risk of loss and title for such products passes to you upon delivery to the carrier.
            </li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">5. Returns and Refunds</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>Return Policy:</strong>
              {' '}
              For information on returns, exchanges, and refunds, please refer to our detailed Return Policy on the website.
            </li>
            <li>
              <strong>Refunds:</strong>
              {' '}
              If you are eligible for a refund under our Return Policy, the refund will be processed to the original payment method used for the purchase.
            </li>
            <li>
              <strong>Non-Returnable Items:</strong>
              {' '}
              Certain products may be non-returnable due to their nature (e.g., perishable goods, intimate items).
            </li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">6. Third-Party Services</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>Third-Party Links:</strong>
              {' '}
              The Service may contain links to third-party websites or services that are not owned or controlled by Rolitt Inc. We are not responsible for the content, privacy policies, or practices of third-party services.
            </li>
            <li>
              <strong>Third-Party Content:</strong>
              {' '}
              Any opinions, advice, statements, services, offers, or other information expressed in or available through third-party websites are those of the respective authors or distributors and not of Rolitt Inc.
            </li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">7. User Responsibilities and Restrictions</h3>
          <p>
            You agree not to use the Service for any unlawful purpose or in a way that violates these Terms. Prohibited activities include, but are not limited to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>Harassment or Defamation:</strong>
              {' '}
              You may not engage in conduct that harasses, abuses, or defames others.
            </li>
            <li>
              <strong>Infringement:</strong>
              {' '}
              You may not use the Service to infringe on the intellectual property rights of others, including trademarks, copyrights, or patents.
            </li>
            <li>
              <strong>Malicious Activities:</strong>
              {' '}
              You may not upload viruses, malware, or harmful code to the Service, or use the Service to disrupt or interfere with its normal operation.
            </li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">8. Limitation of Liability</h3>
          <p>
            To the fullest extent permitted by law, Rolitt Inc. and its affiliates, officers, directors, employees, agents, and suppliers are not liable for any indirect, incidental, special, consequential, or punitive damages arising from:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Your use or inability to use the Service.</li>
            <li>The purchase of products from the Service.</li>
            <li>Any content provided by third parties on the Service.</li>
          </ul>
          <p>
            Rolitt Inc.'s total liability, whether in contract, tort, or otherwise, shall not exceed the amount paid by you to Rolitt Inc. for the specific product or service giving rise to the claim.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4">9. Indemnification</h3>
          <p>
            You agree to indemnify and hold harmless Rolitt Inc., its affiliates, officers, directors, employees, and agents from any claims, damages, losses, and expenses (including reasonable attorneys' fees) arising from:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Your violation of these Terms.</li>
            <li>Your use of the Service.</li>
            <li>Any content you post or submit to the Service.</li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">10. Termination</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>By Rolitt:</strong>
              {' '}
              We may suspend or terminate your access to the Service, with or without notice, for violations of these Terms or other behavior that we deem detrimental to the Service or our brand.
            </li>
            <li>
              <strong>By You:</strong>
              {' '}
              You may terminate your account at any time by contacting us. However, termination does not affect any obligations or liabilities incurred before the termination.
            </li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">11. Governing Law</h3>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the state of Delaware, USA, without regard to its conflict of laws principles. You agree to submit to the exclusive jurisdiction of the courts located in Delaware for any disputes arising out of these Terms or your use of the Service.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4">12. Miscellaneous</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>Severability:</strong>
              {' '}
              If any provision of these Terms is deemed invalid or unenforceable, the remaining provisions will remain in full force and effect.
            </li>
            <li>
              <strong>Entire Agreement:</strong>
              {' '}
              These Terms, along with the Privacy Policy and any other policies referenced herein, constitute the entire agreement between you and Rolitt Inc. regarding your use of the Service.
            </li>
            <li>
              <strong>Force Majeure:</strong>
              {' '}
              Rolitt Inc. will not be liable for failure or delay in performance due to causes beyond its reasonable control, including but not limited to natural disasters, acts of government, labor disputes, or other force majeure events.
            </li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">Contact Information</h3>
          <p>
            For any questions regarding these Terms of Service, please contact us at:
          </p>
          <p className="font-bold">Rolitt Inc.</p>
          <p>
            <a href="mailto:support@rolitt.com" className="text-primary hover:underline">support@rolitt.com</a>
            <br />
            Phone: +1 (302) 444-2859
            <br />
            Website:
            {' '}
            <a href="http://rolitt.shop" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">http://rolitt.shop</a>
          </p>
        </div>
      </div>
    </div>
  );
}
