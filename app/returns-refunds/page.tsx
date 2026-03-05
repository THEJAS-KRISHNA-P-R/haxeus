import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReturnsRefundsPage() {
  return (
    <div className="min-h-screen bg-theme py-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-theme mb-6">
            Returns & <span className="text-[var(--accent)]">Refunds</span>
          </h1>
          <p className="text-xl text-theme-2 max-w-2xl mx-auto">
            Your satisfaction is our priority. Here's everything you need to know about returning a product.
          </p>
        </div>

        <div className="space-y-12">
          {/* Policy Overview */}
          <Card className="p-8 shadow-md shadow-black/10 bg-card border-theme">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-bold text-theme">Our Policy at a Glance</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4 text-theme-2 leading-relaxed">
              <p>
                We want you to be completely happy with your HAXEUS purchase. If for any reason you are not satisfied,
                we offer a straightforward return and refund policy.
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong className="text-theme">30-Day Return Window</strong>: You have 30 days from the date of delivery to return eligible items.</li>
                <li>
                  <strong className="text-theme">Condition</strong>: Items must be unworn, unwashed, and in their original condition with all tags attached.
                </li>
                <li><strong className="text-theme">Refund Method</strong>: Refunds will be issued to the original payment method.</li>
                <li>
                  <strong className="text-theme">Processing Time</strong>: Please allow 7-10 business days for your return to be processed after we receive
                  the item.
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* How to Initiate a Return */}
          <Card className="p-8 shadow-md shadow-black/10 bg-card border-theme">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-bold text-theme">How to Initiate a Return</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-6 text-theme-2 leading-relaxed">
              <p>Follow these simple steps to return your item(s):</p>
              <ol className="list-decimal list-inside space-y-3">
                <li>
                  <strong className="text-theme">Contact Us</strong>: Send an email to{" "}
                  <Link href="mailto:returns@haxeus.com" className="text-[var(--accent)] hover:underline font-bold">
                    returns@haxeus.com
                  </Link>{" "}
                  with your order number and the reason for your return.
                </li>
                <li>
                  <strong className="text-theme">Receive Instructions</strong>: Our customer service team will provide you with detailed return instructions
                  and a return shipping address.
                </li>
                <li>
                  <strong className="text-theme">Package Your Item</strong>: Securely package the item(s) in their original packaging, if possible, along
                  with a copy of your invoice.
                </li>
                <li>
                  <strong className="text-theme">Ship Your Return</strong>: Ship the package using a trackable and insured method. We are not responsible
                  for lost or damaged return shipments.
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Non-Returnable Items */}
          <Card className="p-8 shadow-md shadow-black/10 bg-card border-theme">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-bold text-theme">Non-Returnable Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4 text-theme-2 leading-relaxed">
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
          <Card className="p-8 shadow-md shadow-black/10 bg-card border-theme">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-bold text-theme">Damaged or Defective Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4 text-theme-2 leading-relaxed">
              <p>
                If you receive a damaged or defective item, please contact us immediately at{" "}
                <Link href="mailto:support@haxeus.com" className="text-[var(--accent)] hover:underline font-bold">
                  support@haxeus.com
                </Link>{" "}
                with photos of the damage. We will arrange for a replacement or full refund.
              </p>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <div className="text-center mt-12">
            <p className="text-lg text-theme-2 mb-6">
              Still have questions about returns or refunds? Our customer support team is here to help.
            </p>
            <Link href="/contact">
              <Button className="bg-[var(--accent)] hover:opacity-90 text-white px-8 py-3 rounded-full font-bold">Contact Support</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
