import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-150 text-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">HAXEUZ</h3>
            <p className="text-gray-700 mb-4">
              Elevate your style with HAXEUZ. Premium apparel designed for the modern individual.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-600 hover:text-black">
                Instagram
              </Link>
              <Link href="#" className="text-gray-600 hover:text-black">
                Twitter
              </Link>
              <Link href="#" className="text-gray-600 hover:text-black">
                Facebook
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-gray-600 hover:text-black">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-black">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-black">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-600 hover:text-black">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-black">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-black">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link href="/returns-refunds" className="text-gray-600 hover:text-black">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="text-gray-600 hover:text-black">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-600 hover:text-black">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
          <p>HAXEUZ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
