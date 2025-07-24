"use client"

import Link from "next/link"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function AboutPage() {
  const timeline = [
    {
      year: "2019",
      title: "The Beginning",
      description:
        "Founded with a vision to create the perfect T-shirt that combines comfort, style, and artistic expression.",
    },
    {
      year: "2020",
      title: "First Collection",
      description:
        "Launched our debut collection featuring 5 unique designs, focusing on premium cotton and sustainable practices.",
    },
    {
      year: "2021",
      title: "Community Growth",
      description:
        "Reached 1,000+ satisfied customers and established our commitment to quality and customer satisfaction.",
    },
    {
      year: "2022",
      title: "Expansion",
      description:
        "Expanded our product line and introduced eco-friendly packaging, reinforcing our sustainability commitment.",
    },
    {
      year: "2023",
      title: "Recognition",
      description: "Received industry recognition for design excellence and sustainable business practices.",
    },
    {
      year: "2024",
      title: "Innovation",
      description: "Launched our online platform and introduced new artistic collaborations with local artists.",
    },
  ]

  const team = [
    {
      name: "Arjun Mehta",
      role: "Founder & Creative Director",
      description:
        "Passionate about merging art with fashion, Arjun founded HAXEUZ to create meaningful clothing that tells stories.",
      image: "/placeholder.svg?height=300&width=300&text=Arjun+Mehta",
    },
    {
      name: "Priya Sharma",
      role: "Head of Design",
      description:
        "With 8+ years in fashion design, Priya ensures every piece meets our high standards of comfort and style.",
      image: "/placeholder.svg?height=300&width=300&text=Priya+Sharma",
    },
    {
      name: "Rohit Kumar",
      role: "Operations Manager",
      description: "Rohit oversees our sustainable production processes and ensures timely delivery to our customers.",
      image: "/placeholder.svg?height=300&width=300&text=Rohit+Kumar",
    },
  ]

  const values = [
    {
      title: "Quality First",
      description:
        "We never compromise on the quality of our materials or craftsmanship. Every T-shirt is made to last.",
      icon: "⭐",
    },
    {
      title: "Artistic Expression",
      description: "We believe clothing should be a canvas for creativity and self-expression.",
      icon: "🎨",
    },
    {
      title: "Sustainability",
      description: "We're committed to environmentally responsible practices in every aspect of our business.",
      icon: "🌱",
    },
    {
      title: "Community",
      description: "We build lasting relationships with our customers and support local artists and communities.",
      icon: "🤝",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Our <span className="text-red-600">Story</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                HAXEUZ was born from a simple belief: that clothing should be more than just fabric. It should be a
                medium for artistic expression, a statement of quality, and a commitment to sustainability.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Since 2019, we've been crafting premium T-shirts that tell stories, inspire creativity, and provide
                unmatched comfort. Every piece in our collection is a testament to our dedication to excellence.
              </p>
              <Link href="/products">
              <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full">
                Shop Our Collection
              </Button>
              </Link>
            </div>
            <div className="relative h-96 lg:h-[500px]">
              <Image
                src="/images/busted-front.jpg"
                alt="HAXEUZ Story"
                fill
                className="object-cover rounded-lg shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=500&width=600&text=Our+Story"
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our <span className="text-red-600">Values</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              These core values guide everything we do, from design and production to customer service and community
              engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our <span className="text-red-600">Journey</span>
            </h2>
            <p className="text-lg text-gray-600">
              From a small startup to a recognized brand, here's how we've grown over the years.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-red-600"></div>
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"}`}>
                    <Card className="p-6 shadow-lg">
                      <div className="text-2xl font-bold text-red-600 mb-2">{item.year}</div>
                      <h3 className="text-xl font-semibold mb-3 text-gray-900">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </Card>
                  </div>
                  <div className="relative z-10">
                    <div className="w-4 h-4 bg-red-600 rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Meet Our <span className="text-red-600">Team</span>
            </h2>
            <p className="text-lg text-gray-600">
              The passionate individuals behind HAXEUZ who make our vision a reality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{member.name}</h3>
                <p className="text-red-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600">{member.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-96">
              <Image
                src="/images/save-flower-front.jpg"
                alt="Why Choose HAXEUZ"
                fill
                className="object-cover rounded-lg shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=400&width=600&text=Why+Choose+HAXEUZ"
                }}
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose <span className="text-red-600">HAXEUZ</span>?
              </h2>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Premium Quality Materials</h3>
                    <p className="text-gray-600">
                      We use only the finest 100% cotton, pre-shrunk and tested for durability and comfort.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Unique Artistic Designs</h3>
                    <p className="text-gray-600">
                      Original artwork and designs you won't find anywhere else, created by talented artists.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Sustainable Practices</h3>
                    <p className="text-gray-600">
                      Eco-friendly production processes and packaging that minimize environmental impact.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Customer Satisfaction</h3>
                    <p className="text-gray-600">
                      99% customer satisfaction rate with hassle-free returns and dedicated support.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link href="/products">
                <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full mr-4">Shop Now</Button>
                </Link>
                <Link href="/contact">
                <Button className="bg-black hover:bg-red-700 text-white px-8 py-3 rounded-full mr-4">
                  Contact Us
                </Button></Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
