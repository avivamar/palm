import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Refund Policy | Rolitt',
  description: 'Refund Policy for Rolitt - Learn about our refund procedures and terms.',
};

export default async function RefundPolicy({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="container py-12 md:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-4xl font-bold tracking-tight sm:text-5xl">
          Return & Refund Policy
        </h1>
        <div className="prose prose-lg dark:prose-invert">
          <h2 className="text-2xl font-bold mt-8 mb-4">Return & Refund Policy for Rolitt</h2>
          <p className="text-muted-foreground mb-6">Effective Date: November 11, 2024</p>

          <p>
            Thank you for shopping with Rolitt Inc.! We are committed to providing high-quality products and ensuring a smooth and pleasant shopping experience. Below is our Return and Refund Policy:
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4">1. Return Eligibility</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>Return Period:</strong>
              {' '}
              You may request a return within 7 days of receiving the product.
            </li>
            <li>
              <strong>Valid Return Reasons:</strong>
              {' '}
              We only accept returns under the following conditions:
              <ul className="list-disc pl-6 mt-2">
                <li>The product is defective or damaged upon delivery.</li>
                <li>The delivered product differs from your selected color.</li>
                <li>The delivered product significantly differs from the description provided at the time of purchase.</li>
              </ul>
            </li>
            <li>
              <strong>Return Requirements:</strong>
              <ul className="list-disc pl-6 mt-2">
                <li>The returned product must be in its original, unused, and unopened condition.</li>
                <li>If you find defects, damages, or discrepancies, please provide clear photos to support your claim.</li>
                <li>The return request must be submitted within 7 days from the delivery date.</li>
              </ul>
            </li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">2. Return Process</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>
              Please contact our customer service team before returning any items and provide your order number, product photos, and a detailed description of the issue.
            </li>
            <li>
              Once the return is approved, you will have 7 days to return the product.
            </li>
            <li>
              The returned product must include all accessories and original packaging.
            </li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">3. Return Shipping Costs</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>
              If the return is due to defects, damage, or order errors, Rolitt will cover the return shipping costs.
            </li>
            <li>
              If the return is due to personal reasons (e.g., change of mind), the customer is responsible for return shipping fees.
            </li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">4. Refund Processing</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>
              Once we receive the returned product and confirm that it meets our return conditions, we will process the refund within 30 days.
            </li>
            <li>
              The refund will be issued via the original payment method, and a 12% restocking fee will be deducted.
            </li>
            <li>
              Final sale items are not eligible for return.
            </li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">5. Additional Fees for Returns & Exchanges</h3>
          <p>
            If the returned product shows signs of damage, contamination, wear, or missing parts, Rolitt reserves the right to deduct the diminished value of the product from the refund.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4">6. Order Cancellations</h3>
          <p>
            You may cancel your order before the product is shipped. Please contact our customer service team, and we will process your refund immediately after receiving your cancellation request.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4">7. Warranty</h3>
          <p>
            Rolitt offers a 1-year warranty for non-EEA (European Economic Area) countries and a 2-year warranty for EEA countries.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4">Contact Information</h3>
          <p>
            If you have any questions, please contact us at:
          </p>
          <p>
            <a href="mailto:support@rolitt.com" className="text-primary hover:underline">cs@rolitt.com</a>
            <br />
            <a href="http://rolitt.shop" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">http://rolitt.shop</a>
          </p>
        </div>
      </div>
    </div>
  );
}
