import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-theme py-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-theme mb-6">
            Privacy <span className="text-[var(--accent)]">Policy</span>
          </h1>
          <p className="text-xl text-theme-2 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your personal data.
          </p>
        </div>

        <div className="space-y-12">
          {/* Introduction */}
          <Card className="p-8 shadow-md shadow-black/10 bg-card border-theme">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-bold text-theme">1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-theme-2 leading-relaxed">
              <p>
                At HAXEUS, we are committed to protecting your privacy and ensuring the security of your personal
                information. This Privacy Policy outlines how we collect, use, disclose, and safeguard your data when
                you visit our website or make a purchase.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="p-8 shadow-md shadow-black/10 bg-card border-theme">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-bold text-theme">2. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-theme-2 leading-relaxed">
              <p className="font-semibold mb-2">Personal Information:</p>
              <ul className="list-disc list-inside space-y-1 mb-4">
                <li><strong className="text-theme">Contact Data</strong>: Name, email address, phone number, shipping address, billing address.</li>
                <li><strong className="text-theme">Account Data</strong>: Username, password, purchase history.</li>
                <li><strong className="text-theme">Payment Data</strong>: Payment card details (processed securely by third-party payment processors).</li>
              </ul>
              <p className="font-semibold mb-2">Non-Personal Information:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong className="text-theme">Usage Data</strong>: IP address, browser type, operating system, referring URLs, pages viewed, time spent
                  on site.
                </li>
                <li>
                  <strong className="text-theme">Cookies and Tracking Technologies</strong>: Information collected via cookies, web beacons, and similar
                  technologies.
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card className="p-8 shadow-md shadow-black/10 bg-card border-theme">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-bold text-theme">3. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-theme-2 leading-relaxed">
              <p>We use the collected information for various purposes, including:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Processing and fulfilling your orders.</li>
                <li>Managing your account and providing customer support.</li>
                <li>Personalizing your shopping experience.</li>
                <li>Sending promotional offers and newsletters (with your consent).</li>
                <li>Improving our website, products, and services.</li>
                <li>Detecting and preventing fraud and other illegal activities.</li>
                <li>Complying with legal obligations.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Sharing Your Information */}
          <Card className="p-8 shadow-md shadow-black/10 bg-card border-theme">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-bold text-theme">4. Sharing Your Information</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-theme-2 leading-relaxed">
              <p>We may share your information with:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong className="text-theme">Service Providers</strong>: Third-party vendors who perform services on our behalf (e.g., payment
                  processing, shipping, marketing).
                </li>
                <li><strong className="text-theme">Legal Compliance</strong>: When required by law or to protect our rights, property, or safety.</li>
                <li><strong className="text-theme">Business Transfers</strong>: In connection with a merger, acquisition, or sale of assets.</li>
              </ul>
              <p className="mt-4">
                We do not sell, rent, or trade your personal information to third parties for their marketing purposes.
              </p>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="p-8 shadow-md shadow-black/10 bg-card border-theme">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-bold text-theme">5. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-theme-2 leading-relaxed">
              <p>
                We implement a variety of security measures to maintain the safety of your personal information. Your
                personal data is contained behind secured networks and is only accessible by a limited number of persons
                who have special access rights to such systems, and are required to keep the information confidential.
              </p>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="p-8 shadow-md shadow-black/10 bg-card border-theme">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-bold text-theme">6. Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-theme-2 leading-relaxed">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Access and obtain a copy of your personal data.</li>
                <li>Request correction of inaccurate data.</li>
                <li>Request deletion of your personal data.</li>
                <li>Object to the processing of your personal data.</li>
                <li>Withdraw your consent at any time.</li>
              </ul>
              <p className="mt-4">To exercise these rights, please contact us using the details provided below.</p>
            </CardContent>
          </Card>

          {/* Changes to This Policy */}
          <Card className="p-8 shadow-md shadow-black/10 bg-card border-theme">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-bold text-theme">7. Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-theme-2 leading-relaxed">
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
                Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </CardContent>
          </Card>

          {/* Contact Us */}
          <div className="text-center mt-12">
            <p className="text-lg text-theme-2 mb-6">
              If you have any questions about this Privacy Policy, please{" "}
              <Link href="/contact" className="text-[var(--accent)] hover:underline font-bold">
                contact us
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
