import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, Search, ShoppingBag } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="p-12 text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-9xl font-bold text-[#e93a3a]">404</h1>
            <h2 className="text-3xl font-bold text-white">Page Not Found</h2>
            <p className="text-lg text-white/50 max-w-md mx-auto">
              Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button className="bg-[#e93a3a] hover:bg-[#e93a3a]/80 flex items-center gap-2">
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Browse Products
              </Button>
            </Link>
          </div>

          <div className="pt-8 border-t">
            <p className="text-sm text-white/50 mb-4">Popular pages you might be looking for:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link href="/about">
                <Button variant="ghost" size="sm" className="text-white/50 hover:text-[#e93a3a]">
                  About Us
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="ghost" size="sm" className="text-white/50 hover:text-[#e93a3a]">
                  Contact
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="ghost" size="sm" className="text-white/50 hover:text-[#e93a3a]">
                  Cart
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="text-white/50 hover:text-[#e93a3a]">
                  Profile
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
