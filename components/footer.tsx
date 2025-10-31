import Link from "next/link"
import { NewsletterSignup } from "./NewsletterSignup"

export function Footer() {
  return (
    <footer className="bg-gray-150 dark:bg-gray-900 text-black dark:text-white py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="mb-12 text-center">
          <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Subscribe to our newsletter for exclusive deals and new arrivals
          </p>
          <div className="flex justify-center">
            <NewsletterSignup />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">HAXEUZ</h3>
            <p className="text-gray-700 dark:text-gray-400 mb-4">
              Elevate your style with HAXEUZ. Premium apparel designed for the modern individual.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                Instagram
              </Link>
              <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                Twitter
              </Link>
              <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                Facebook
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link href="/returns-refunds" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center text-gray-600 dark:text-gray-400">
          <p>HAXEUZ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
