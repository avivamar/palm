import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Shipping Policy | Rolitt',
  description: 'Shipping Policy for Rolitt - Learn about our shipping procedures and delivery times.',
};

export default async function Shipping({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="container py-12 md:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-4xl font-bold tracking-tight sm:text-5xl">
          Shipping Policy
        </h1>
        <div className="prose prose-lg dark:prose-invert">
          <h2 className="text-2xl font-bold mt-8 mb-4">Shipping Policy for Rolitt</h2>
          <p className="text-muted-foreground mb-6">Last Updated: November 15, 2024</p>

          <p>
            We aim to provide efficient and reliable shipping services to ensure your Rolitt products reach you in perfect condition. Please review our shipping policy below for important information regarding delivery times, shipping methods, and other relevant details.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4">1. Processing Time</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>All orders are processed within 1-3 business days after payment confirmation.</li>
            <li>Orders placed on weekends or holidays will be processed on the next business day.</li>
            <li>During high-volume periods (e.g., holiday seasons), processing times may be extended by an additional 1-2 business days.</li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">2. Shipping Methods and Delivery Times</h3>
          <p>We offer the following shipping options:</p>

          <h4 className="text-lg font-bold mt-6 mb-3">Domestic Shipping (United States)</h4>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>Standard Shipping:</strong>
              {' '}
              5-7 business days (Free for orders over $100)
            </li>
            <li>
              <strong>Express Shipping:</strong>
              {' '}
              2-3 business days ($15)
            </li>
            <li>
              <strong>Next Day Delivery:</strong>
              {' '}
              1 business day ($25, order must be placed before 12 PM EST)
            </li>
          </ul>

          <h4 className="text-lg font-bold mt-6 mb-3">International Shipping</h4>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>Standard International:</strong>
              {' '}
              10-15 business days ($20)
            </li>
            <li>
              <strong>Express International:</strong>
              {' '}
              5-7 business days ($35)
            </li>
          </ul>

          <p>
            Please note that delivery times are estimates and not guarantees. Actual delivery times may vary based on factors such as customs clearance, weather conditions, and local postal service efficiency.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4">3. Tracking Information</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>A tracking number will be provided via email once your order has been shipped.</li>
            <li>You can track your package using the provided tracking number on our website or through the carrier's website.</li>
            <li>If you haven't received tracking information within 5 business days after your order confirmation, please contact our customer service team.</li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">4. International Orders</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>International customers are responsible for all duties, import taxes, and customs fees that may be incurred.</li>
            <li>We are not responsible for delays due to customs processing.</li>
            <li>Please ensure that your shipping address is correct and complete, including any necessary postal codes and contact information.</li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">5. Shipping Restrictions</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>We currently do not ship to P.O. boxes or APO/FPO addresses.</li>
            <li>Some countries may have restrictions on certain electronic products. Please check your local regulations before placing an order.</li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">6. Lost or Damaged Packages</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>If your package is lost or damaged during transit, please contact our customer service team within 7 days of the expected delivery date.</li>
            <li>We will work with the shipping carrier to resolve the issue and may require photos of damaged items for claims processing.</li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">7. Address Changes</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>If you need to change your shipping address after placing an order, please contact us immediately.</li>
            <li>We can only accommodate address changes if the order has not yet been processed for shipping.</li>
          </ul>

          <p className="mt-8">
            For any questions or concerns regarding shipping, please contact our customer service team at
            {' '}
            <a href="mailto:support@rolitt.com" className="text-primary hover:underline">support@rolitt.com</a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
