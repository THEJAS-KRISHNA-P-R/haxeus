import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReturnsRefundsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Returns & <span className="text-red-600">Refunds</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your satisfaction is our priority. Here's everything you need to know about returning a product.
          </p>
        </div>

        <div className="space-y-12">
          {/* Policy Overview */}
          <Card className="p-8 shadow-lg">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">Our Policy at a Glance</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4 text-gray-700 leading-relaxed">
              <p>
                We want you to be completely happy with your HAXEUZ purchase. If for any reason you are not satisfied,
                we offer a straightforward return and refund policy.
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>**30-Day Return Window**: You have 30 days from the date of delivery to return eligible items.</li>
                <li>
                  **Condition**: Items must be unworn, unwashed, and in their original condition with all tags attached.
                </li>
                <li>**Refund Method**: Refunds will be issued to the original payment method.</li>
                <li>
                  **Processing Time**: Please allow 7-10 business days for your return to be processed after we receive
                  the item.
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* How to Initiate a Return */}
          <Card className="p-8 shadow-lg">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">How to Initiate a Return</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-6 text-gray-700 leading-relaxed">
              <p>Follow these simple steps to return your item(s):</p>
              <ol className="list-decimal list-inside space-y-3">
                <li>
                  **Contact Us**: Send an email to{" "}
                  <Link href="mailto:returns@haxeuz.com" className="text-red-600 hover:underline">
                    returns@haxeuz.com
                  </Link>{" "}
                  with your order number and the reason for your return.
                </li>
                <li>
                  **Receive Instructions**: Our customer service team will provide you with detailed return instructions
                  and a return shipping address.
                </li>
                <li>
                  **Package Your Item**: Securely package the item(s) in their original packaging, if possible, along
                  with a copy of your invoice.
                </li>
                <li>
                  **Ship Your Return**: Ship the package using a trackable and insured method. We are not responsible
                  for lost or damaged return shipments.
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Non-Returnable Items */}
          <Card className="p-8 shadow-lg">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">Non-Returnable Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4 text-gray-700 leading-relaxed">
              <p>Certain items are not eligible for return:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Items marked as "Final Sale" or "Non-Returnable".</li>
                <li>Gift cards.</li>
                <li>Items that have been worn, washed, altered, or damaged.</li>
                <li>Items without original tags or packaging.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Damaged or Defective Items */}
          <Card className="p-8 shadow-lg">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">Damaged or Defective Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4 text-gray-700 leading-relaxed">
              <p>
                If you receive a damaged or defective item, please contact us immediately at{" "}
                <Link href="mailto:support@haxeuz.com" className="text-red-600 hover:underline">
                  support@haxeuz.com
                </Link>{" "}
                with photos of the damage. We will arrange for a replacement or full refund.
              </p>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <div className="text-center mt-12">
            <p className="text-lg text-gray-700 mb-6">
              Still have questions about returns or refunds? Our customer support team is here to help.
            </p>
            <Link href="/contact">
              <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full">Contact Support</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
