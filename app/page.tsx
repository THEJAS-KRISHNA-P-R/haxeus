"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  const featuredProducts = [
    {
      id: 1,
      name: "BUSTED Vintage Tee",
      price: 2499.0,
      image: "/images/busted-front.jpg",
    },
    {
      id: 2,
      name: "Save the Flower Tee",
      price: 2799.0,
      image: "/images/save-flower-front.jpg",
    },
    {
      id: 5,
      name: "Renaissance Fusion Tee",
      price: 3199.0,
      image: "/images/statue-front.jpg",
    },
  ]

  const testimonials = [
    {
      id: 1,
      name: "Arjun Sharma",
      role: "Fashion Enthusiast",
      text: "The quality is absolutely incredible. These are hands down the most comfortable T-shirts I've ever owned. The fabric feels luxurious and the fit is perfect.",
      rating: 5,
    },
    {
      id: 2,
      name: "Priya Patel",
      role: "Creative Director",
      text: "I've been wearing HAXEUZ tees for over a year now. They maintain their shape and softness even after countless washes. Worth every penny.",
      rating: 5,
    },
    {
      id: 3,
      name: "Rohit Kumar",
      role: "Software Engineer",
      text: "Finally found T-shirts that look professional enough for work but comfortable enough for weekend lounging. The attention to detail is remarkable.",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Artistic <span className="text-red-600">Expression</span>
                  <br />
                  Meets Comfort
                </h1>
                <p className="text-lg text-gray-600 mt-6 leading-relaxed">
                  Discover unique, artistic T-shirts that blend creative expression with premium comfort. Each design
                  tells a story, crafted for those who dare to stand out.
                </p>
              </div>

              <div className="flex gap-4">
                <Link href="/products">
                  <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full">
                    Shop Collection
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" size="lg" className="px-8 py-3 rounded-full border-gray-300 bg-transparent">
                    Our Story
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div>
                  <div className="text-3xl font-bold text-red-600">10K+</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-600">99%</div>
                  <div className="text-sm text-gray-600">Satisfaction Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-600">24/7</div>
                  <div className="text-sm text-gray-600">Support</div>
                </div>
              </div>
            </div>

            {/* Product Showcase */}
            <div className="relative">
              <div className="bg-black rounded-3xl p-8 relative overflow-hidden">
                <Image
                  src="/images/save-flower-front.jpg"
                  alt="Featured T-shirt"
                  width={400}
                  height={500}
                  className="mx-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=500&width=400&text=Featured+Product"
                  }}
                />

                {/* Floating Badges */}
                <div className="absolute top-4 right-4 bg-white rounded-lg px-3 py-2 shadow-lg">
                  <div className="text-xs text-gray-600">Artistic Designs</div>
                  <div className="text-sm font-semibold text-red-600">Premium Quality</div>
                </div>

                <div className="absolute bottom-4 left-4 bg-white rounded-lg px-3 py-2 shadow-lg">
                  <div className="text-xs text-gray-600">Eco-Conscious</div>
                  <div className="text-sm font-semibold text-red-600">Sustainable</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-red-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">
            Join thousands of satisfied customers who've made the switch to HAXEUZ. Your perfect T-shirt is just a click
            away.
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 mb-8">
            <Link href="/products">
              <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3 rounded-full">
                Shop Now
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-red-600 px-8 py-3 rounded-full bg-transparent"
            >
              Subscribe to Newsletter
            </Button>
          </div>

          <div className="flex max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-l-full text-gray-900"
            />
            <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-6 rounded-r-full">Subscribe</Button>
          </div>
          <p className="text-sm mt-4 opacity-90">Get exclusive offers and updates. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured <span className="text-red-600">Collection</span>
            </h2>
            <p className="text-lg text-gray-600">
              Discover our most popular premium T-shirts, carefully crafted for ultimate comfort and style.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square relative bg-black">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=400&width=400&text=Product+Image"
                    }}
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                  <p className="text-2xl font-bold text-gray-900 mb-4">₹{product.price.toLocaleString("en-IN")}</p>
                  <Link href={`/products/${product.id}`}>
                    <Button className="w-full bg-red-600 text-white hover:bg-red-700">View Details</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our <span className="text-red-600">Customers</span> Say
            </h2>
            <p className="text-lg text-gray-600">
              Don't just take our word for it. Here's what our community of satisfied customers has to say about their
              HAXEUZ experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="p-6 shadow-lg">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">
                      ⭐
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-300 rounded-full mr-4 flex items-center justify-center">
                    <span className="text-gray-600 font-semibold">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-96">
              <Image
                src="/images/statue-front.jpg"
                alt="HAXEUZ Quality"
                fill
                className="object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=400&width=600&text=About+HAXEUZ"
                }}
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Crafting <span className="text-red-600">Premium</span> Since 2019
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                At HAXEUZ, we believe that comfort shouldn't compromise style. Our journey began with a simple mission:
                to create the perfect T-shirt that combines premium materials, exceptional craftsmanship, and timeless
                design.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Every piece in our collection is meticulously crafted using the finest cotton blends, ensuring
                durability, breathability, and that luxurious feel against your skin. We're not just making clothes;
                we're creating experiences.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-600 rounded-full mr-3"></div>
                  <span className="font-semibold">Premium Materials</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-600 rounded-full mr-3"></div>
                  <span className="font-semibold">Ethical Production</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-600 rounded-full mr-3"></div>
                  <span className="font-semibold">Sustainable Practices</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-600 rounded-full mr-3"></div>
                  <span className="font-semibold">Perfect Fit</span>
                </div>
              </div>

              <div className="mt-8">
                <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full">
                  Learn More About Us
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
