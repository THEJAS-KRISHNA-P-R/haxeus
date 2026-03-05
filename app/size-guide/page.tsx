import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Ruler, Info, CheckCircle } from "lucide-react"

export default function SizeGuidePage() {
  return (
    <div className="min-h-screen bg-theme py-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--accent)]/10 mb-6">
            <Ruler className="w-8 h-8 text-[var(--accent)]" />
          </div>
          <h1 className="text-5xl font-bold text-theme mb-6">
            Size <span className="text-[var(--accent)]">Guide</span>
          </h1>
          <p className="text-xl text-theme-2 max-w-2xl mx-auto">
            Find your perfect fit. Use our size chart to ensure you get the right size for ultimate comfort.
          </p>
        </div>

        <div className="space-y-12">
          {/* Size Chart Table */}
          <Card className="p-8 shadow-md shadow-black/10 bg-card border-theme overflow-hidden">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-bold text-theme">
                Men&apos;s Relaxed Fit T-Shirt Size Chart
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-theme opacity-5 text-theme">
                      <th className="px-6 py-4 text-left font-semibold text-lg border-b border-theme">Size</th>
                      <th className="px-6 py-4 text-center font-semibold text-lg border-b border-theme">Chest (in)</th>
                      <th className="px-6 py-4 text-center font-semibold text-lg border-b border-theme">Length (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-theme opacity-5 transition-colors">
                      <td className="px-6 py-4 font-bold text-theme border-b border-theme">S</td>
                      <td className="px-6 py-4 text-center text-theme-2 border-b border-theme">40</td>
                      <td className="px-6 py-4 text-center text-theme-2 border-b border-theme">27.5</td>
                    </tr>
                    <tr className="hover:bg-theme opacity-5 transition-colors">
                      <td className="px-6 py-4 font-bold text-theme border-b border-theme">M</td>
                      <td className="px-6 py-4 text-center text-theme-2 border-b border-theme">42</td>
                      <td className="px-6 py-4 text-center text-theme-2 border-b border-theme">28.5</td>
                    </tr>
                    <tr className="hover:bg-theme opacity-5 transition-colors">
                      <td className="px-6 py-4 font-bold text-theme border-b border-theme">L</td>
                      <td className="px-6 py-4 text-center text-theme-2 border-b border-theme">44</td>
                      <td className="px-6 py-4 text-center text-theme-2 border-b border-theme">29.5</td>
                    </tr>
                    <tr className="hover:bg-theme opacity-5 transition-colors">
                      <td className="px-6 py-4 font-bold text-theme border-b border-theme">XL</td>
                      <td className="px-6 py-4 text-center text-theme-2 border-b border-theme">46</td>
                      <td className="px-6 py-4 text-center text-theme-2 border-b border-theme">30.5</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* How to Measure */}
          <Card className="p-8 shadow-md shadow-black/10 bg-card border-theme">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-bold text-theme flex items-center gap-2">
                <Info className="w-6 h-6 text-[var(--accent)]" />
                How to Measure
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-6 text-theme-2 leading-relaxed">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-theme opacity-5 rounded-lg">
                  <h4 className="font-semibold text-theme mb-2">Chest</h4>
                  <p>Measure around the fullest part of your chest, keeping the tape horizontal. This is the circumference measurement.</p>
                </div>
                <div className="p-4 bg-theme opacity-5 rounded-lg">
                  <h4 className="font-semibold text-theme mb-2">Length</h4>
                  <p>Measure from the highest point of the shoulder (where the seam would be) down to the bottom hem of the shirt.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Size Tips */}
          <Card className="p-8 shadow-md shadow-black/10 bg-card border-theme">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-bold text-theme flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                Fit Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4 text-theme-2 leading-relaxed">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[var(--accent)] rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong className="text-theme">Relaxed Fit:</strong> Our T-shirts are designed with a relaxed, comfortable fit. If you prefer a slimmer look, consider sizing down.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[var(--accent)] rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong className="text-theme">Between Sizes?</strong> If you&apos;re between sizes, we recommend going with the larger size for a more comfortable fit.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[var(--accent)] rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong className="text-theme">Pre-shrunk Fabric:</strong> All our T-shirts are pre-shrunk, so minimal shrinkage will occur after washing.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[var(--accent)] rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong className="text-theme">Premium Cotton:</strong> Made with 100% premium cotton for maximum breathability and softness.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Need Help */}
          <div className="text-center mt-12">
            <p className="text-lg text-theme-2 mb-6">
              Still unsure about your size? Our team is happy to help you find the perfect fit.
            </p>
            <Link href="/contact">
              <Button className="bg-[var(--accent)] hover:opacity-90 text-white px-8 py-3 rounded-full font-bold">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
