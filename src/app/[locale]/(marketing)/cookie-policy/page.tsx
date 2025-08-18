import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Cookie Policy | Thepalmistrylife',
  description: 'Learn about how Thepalmistrylife uses cookies and similar technologies to enhance your experience.',
};

export default async function CookiePolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
          
          <div className="bg-muted/50 p-6 rounded-lg mb-8">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Last Updated:</strong>
              {' '}
              May 19, 2021
            </p>
          </div>

          <p>
            This Cookie Policy explains how we use cookies and other similar technologies, tracking technologies when you use our services, 
            what these technologies are and why we use them. This policy also explains how you can control the use of these technologies.
          </p>
          <p>
            If you have any questions, you can contact us through our{' '}
            <a href="https://thepalmistry.life/contact" className="text-primary hover:underline">
              Support Center
            </a>.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Cookies</h2>
          <p>
            Cookies are small text files that are placed on your device (such as a computer, smartphone, or other electronic device) 
            when you visit our website to store a range of information, such as your language preferences, or the browser and device 
            you use to access the website. These cookies are set by us and are called <em>first-party cookies</em>. We also use 
            <em>third-party cookies</em> (from domains different from our website domain) for advertising and marketing campaigns.
          </p>
          <p>
            <em>Session cookies</em> expire each time you close your browser and are not retained on your device thereafter. 
            These cookies allow our website to link your actions during a particular browser session.
          </p>
          <p>
            <em>Persistent cookies</em> remain on your device for a period of time and expire on a set expiration date or 
            when you manually delete them from your cache. These cookies are stored on your device during browser sessions 
            to remember your preferences and actions on our website.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Similar Technologies</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">Web Beacons</h3>
          <p>
            A small transparent image (also called "pixel tags", "web bugs", "GIFs") that contains a unique identifier. 
            It is embedded in websites or emails. When your browser reads the website code, it communicates with our servers 
            to display the image and through this process obtains information about your device technical specifications, 
            operating system and settings being used. It can also track your activity during a session. Additionally, 
            it allows us to identify when each email is opened, IP address and device. We use this information to improve 
            our email communications.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Software Development Kits (SDK)</h3>
          <p>
            Third-party software development kits that may be installed in our mobile applications. SDKs help us understand 
            how you interact with our mobile applications and collect certain information about the device and network you 
            use to access the application.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Local Shared Objects</h3>
          <p>
            Commonly known as "Flash Cookies", are data that websites using Adobe Flash may store on a user's computer 
            to support Flash functionality. We may use Adobe Flash to display graphics, interactive animations, and other 
            enhancements. Local shared objects can track parameters similar to cookies, but they can also provide information 
            about your use of specific features enabled by cookies.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">HTML5 Local Storage</h3>
          <p>
            HTML 5 is the fifth version of the HTML language with features that allow information to be stored in your 
            browser's data files. HTML5 local storage operates similarly to cookies but differs in that it can store 
            larger amounts of information and does not rely on data exchange with website servers.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Fingerprinting</h3>
          <p>
            A technique that combines a set of information elements to uniquely identify a specific device. These information 
            elements include: device configuration data, CSS information, JavaScript objects, installed fonts, installed 
            browser plugins, usage of any APIs, HTTP header information, and clock information.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Device Identifiers</h3>
          <p>
            Identifiers composed of numbers and letters that are unique to each specific device. These identifiers include 
            Apple's Identifier for Advertisers (IDFA) and Google's Android Advertising ID (AAID). They are stored on devices 
            and used to identify you and your device across different applications and devices for marketing and advertising 
            purposes. You can reset device identifiers or opt out of personalized advertising in your device settings.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">How You Can Manage Cookies and Similar Technologies</h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Browser and Device Settings</h3>
          <p>
            Most browsers and devices offer their own privacy settings for cookies and similar technologies. 
            Please note that if you choose to remove or reject cookies or clear local storage, this could affect 
            the features, availability, and functionality of our website.
          </p>
          <p>
            For information about cookies and how to manage or delete them, visit 
            <a href="https://www.allaboutcookies.org" className="text-primary hover:underline">
              www.allaboutcookies.org
            </a>
            .
          </p>
          <p>
            To opt out of being tracked by Google Analytics across all websites, visit 
            <a href="https://tools.google.com/dlpage/gaoptout" className="text-primary hover:underline">
              https://tools.google.com/dlpage/gaoptout
            </a>
            .
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Opting Out of Interest-Based Internet Advertising</h3>
          <p>
            To learn more about interest-based advertising and how to opt-out of this type of advertising 
            by companies participating in industry self-regulation, please visit:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              United States: 
              <a href="https://www.aboutads.info/choices/" className="text-primary hover:underline">
                https://www.aboutads.info/choices/
              </a>
            </li>
            <li>
              Canada: 
              <a href="https://youradchoices.ca/" className="text-primary hover:underline">
                https://youradchoices.ca/
              </a>
            </li>
            <li>
              Europe: 
              <a href="https://www.youronlinechoices.eu/" className="text-primary hover:underline">
                https://www.youronlinechoices.eu/
              </a>
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Absolutely Necessary Cookies</h2>
          <p>
            The following table provides information about the absolutely necessary cookies we use:
          </p>
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Cookie Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Purpose</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Duration</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">session_id</td>
                  <td className="border border-gray-300 px-4 py-2">Maintains user session state</td>
                  <td className="border border-gray-300 px-4 py-2">Session</td>
                  <td className="border border-gray-300 px-4 py-2">First-party</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">csrf_token</td>
                  <td className="border border-gray-300 px-4 py-2">Security protection against cross-site request forgery</td>
                  <td className="border border-gray-300 px-4 py-2">Session</td>
                  <td className="border border-gray-300 px-4 py-2">First-party</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">auth_token</td>
                  <td className="border border-gray-300 px-4 py-2">User authentication</td>
                  <td className="border border-gray-300 px-4 py-2">30 days</td>
                  <td className="border border-gray-300 px-4 py-2">First-party</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">language_pref</td>
                  <td className="border border-gray-300 px-4 py-2">Stores user language preference</td>
                  <td className="border border-gray-300 px-4 py-2">1 year</td>
                  <td className="border border-gray-300 px-4 py-2">First-party</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Updates to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational,
            legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website
            and updating the "Last Updated" date.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p>
            If you have any questions about this Cookie Policy, please contact us at:
          </p>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p>
              <strong>Thepalmistrylife</strong>
            </p>
            <p>
              Email:
              {' '}
              <a href="mailto:support@thepalmistry.life" className="text-blue-600 hover:underline">
                support@thepalmistry.life
              </a>
            </p>
          </div>

          <p className="text-sm text-gray-600 mt-8">
            Last updated: January 1, 2025
          </p>
        </div>
      </div>
    </div>
  );
}