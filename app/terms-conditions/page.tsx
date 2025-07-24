import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Terms & <span className="text-red-600">Conditions</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Please read these terms carefully before using our website.
          </p>
        </div>

        <div className="space-y-12">
          {/* Introduction */}
          <Card className="p-8 shadow-lg">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-gray-700 leading-relaxed">
              <p>
                Welcome to HAXEUZ! These Terms and Conditions ("Terms") govern your use of the HAXEUZ website and the
                purchase of products from us. By accessing or using our website, you agree to be bound by these Terms.
                If you do not agree with any part of these Terms, you must not use our website.
              </p>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className="p-8 shadow-lg">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">2. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-gray-700 leading-relaxed">
              <p>
                All content on this website, including text, graphics, logos, images, and software, is the property of
                HAXEUZ or its content suppliers and protected by international copyright laws. The compilation of all
                content on this site is the exclusive property of HAXEUZ.
              </p>
            </CardContent>
          </Card>

          {/* Use of Website */}
          <Card className="p-8 shadow-lg">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">3. Use of Website</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-gray-700 leading-relaxed">
              <p>
                You agree to use the website only for lawful purposes and in a way that does not infringe the rights of,
                restrict, or inhibit anyone else's use and enjoyment of the website. Prohibited behavior includes
                harassing or causing distress or inconvenience to any other user, transmitting obscene or offensive
                content, or disrupting the normal flow of dialogue within our website.
              </p>
            </CardContent>
          </Card>

          {/* Product Information and Pricing */}
          <Card className="p-8 shadow-lg">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">4. Product Information and Pricing</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-gray-700 leading-relaxed">
              <p>
                We strive to ensure that all information on our website, including product descriptions and pricing, is
                accurate. However, errors may occur. If we discover an error in the price of any goods you have ordered,
                we will inform you as soon as possible and give you the option of reconfirming your order at the correct
                price or canceling it.
              </p>
            </CardContent>
          </Card>

          {/* Orders and Payment */}
          <Card className="p-8 shadow-lg">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">5. Orders and Payment</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-gray-700 leading-relaxed">
              <p>
                All orders placed through our website are subject to acceptance and availability. We reserve the right
                to refuse any order. Payment must be received in full before dispatch of goods. We accept various
                payment methods as indicated on our checkout page.
              </p>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="p-8 shadow-lg">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">6. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-gray-700 leading-relaxed">
              <p>
                HAXEUZ will not be liable for any direct, indirect, incidental, special, consequential, or exemplary
                damages, including but not limited to, damages for loss of profits, goodwill, use, data, or other
                intangible losses resulting from the use or the inability to use the website or products.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card className="p-8 shadow-lg">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">7. Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-gray-700 leading-relaxed">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of India, without regard to
                its conflict of law provisions. Any dispute arising under these Terms shall be subject to the exclusive
                jurisdiction of the courts in Mumbai, Maharashtra, India.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card className="p-8 shadow-lg">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">8. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-gray-700 leading-relaxed">
              <p>
                We reserve the right to modify these Terms at any time. Any changes will be effective immediately upon
                posting on the website. Your continued use of the website after any such changes constitutes your
                acceptance of the new Terms.
              </p>
            </CardContent>
          </Card>

          {/* Contact Us */}
          <div className="text-center mt-12">
            <p className="text-lg text-gray-700 mb-6">
              If you have any questions about these Terms, please{" "}
              <Link href="/contact" className="text-red-600 hover:underline">
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
