import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

type ContactInformationProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: ContactInformationProps): Promise<Metadata> {
  await params; // Ensure params is awaited for Next.js

  return {
    title: 'Contact Information | Rolitt',
    description: 'Contact information for Rolitt - Get in touch with our team for support, inquiries, or feedback.',
  };
}

export default async function ContactInformation({ params }: ContactInformationProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="container py-12 md:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-4xl font-bold tracking-tight sm:text-5xl">
          Contact Information
        </h1>
        <div className="prose prose-lg dark:prose-invert">
          <h2 className="text-2xl font-bold mt-8 mb-4">Get in Touch with Rolitt</h2>
          <p className="text-muted-foreground mb-6">Last Updated: November 15, 2024</p>

          <p>
            Thank you for your interest in Rolitt. We're here to help with any questions, concerns, or feedback you may have. Please find our contact information below.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4">Customer Support</h3>
          <p>
            For general inquiries, product support, or assistance with your order:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>Email:</strong>
              {' '}
              <a href="mailto:support@rolitt.com" className="text-primary hover:underline">support@rolitt.com</a>
            </li>
            <li>
              <strong>Phone:</strong>
              {' '}
              +1 (302) 444-2859
            </li>
            <li>
              <strong>Hours:</strong>
              {' '}
              Monday to Friday, 9:00 AM - 5:00 PM EST
            </li>
            <li>
              <strong>Response Time:</strong>
              {' '}
              We strive to respond to all inquiries within 24-48 business hours
            </li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">Returns and Refunds</h3>
          <p>
            For questions about returns, refunds, or exchanges:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>Email:</strong>
              {' '}
              <a href="mailto:cs@rolitt.com" className="text-primary hover:underline">cs@rolitt.com</a>
            </li>
            <li>Please include your order number and details about your return request</li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">Business Inquiries</h3>
          <p>
            For partnership opportunities, wholesale inquiries, or business collaborations:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>Email:</strong>
              {' '}
              <a href="mailto:business@rolitt.com" className="text-primary hover:underline">business@rolitt.com</a>
            </li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">Media Inquiries</h3>
          <p>
            For press, media requests, or interview opportunities:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>Email:</strong>
              {' '}
              <a href="mailto:press@rolitt.com" className="text-primary hover:underline">press@rolitt.com</a>
            </li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">Mailing Address</h3>
          <p>
            For legal documents and physical mail:
          </p>
          <address className="not-italic">
            Rolitt Inc.
            <br />
            1111B S Governors Ave STE 20948
            <br />
            Dover, DE 19904
            <br />
            United States
          </address>

          <h3 className="text-xl font-bold mt-8 mb-4">Social Media</h3>
          <p>
            Connect with us on social media:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>Facebook:</strong>
              {' '}
              <a href="https://www.facebook.com/profile.php?id=61560959570699" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Facebook</a>
            </li>
            <li>
              <strong>Instagram:</strong>
              {' '}
              <a href="https://www.instagram.com/rolittrobot/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Instagram</a>
            </li>
            <li>
              <strong>Twitter/X:</strong>
              {' '}
              <a href="https://x.com/Rolittai" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">X</a>
            </li>
            <li>
              <strong>LinkedIn:</strong>
              {' '}
              <a href="https://www.linkedin.com/company/rolitt" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </li>
            <li>
              <strong>YouTube:</strong>
              {' '}
              <a href="https://www.youtube.com/@RolittRobot" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">YouTube</a>
            </li>
            <li>
              <strong>GitHub:</strong>
              {' '}
              <a href="https://github.com/rolittai" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">GitHub</a>
            </li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4">Newsletter</h3>
          <p>
            Stay updated with our latest products, promotions, and news by subscribing to our newsletter on our homepage.
          </p>

          <div className="bg-muted p-6 rounded-lg mt-8">
            <h3 className="text-xl font-bold mb-4">Contact Form</h3>
            <p>
              For a faster response, please use our
              {' '}
              <Link href="/contact" className="text-primary hover:underline">contact form</Link>
              {' '}
              to send us a message directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
