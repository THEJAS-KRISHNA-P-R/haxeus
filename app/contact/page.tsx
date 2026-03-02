"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Form submitted:", formData)
    alert("Thank you for your message! We'll get back to you soon.")
    setFormData({ name: "", email: "", subject: "", message: "" })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const faqs = [
    {
      question: "What is your return policy?",
      answer:
        "We offer a 30-day return policy for all unworn items in original condition. Please visit our Returns & Refunds page for detailed information.",
    },
    {
      question: "How long does shipping take?",
      answer:
        "Standard shipping takes 3-5 business days within India. Express shipping (1-2 business days) is available for an additional fee.",
    },
    {
      question: "What sizes do you offer?",
      answer:
        "We offer sizes from S to XXL. Please check our size guide on each product page for detailed measurements.",
    },
    {
      question: "Are your T-shirts pre-shrunk?",
      answer:
        "Yes, all our T-shirts are pre-shrunk and made from 100% premium cotton to ensure they maintain their fit after washing.",
    },
    {
      question: "Do you offer international shipping?",
      answer: "Currently, we only ship within India. We're working on expanding to international markets soon.",
    },
    {
      question: "How can I track my order?",
      answer:
        "Once your order ships, you'll receive a tracking number via email. You can use this to track your package on our website or the courier's website.",
    },
  ]

  return (
    <div className="min-h-screen py-16 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Get in <span className="text-[#e93a3a]">Touch</span>
          </h1>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            Have a question, suggestion, or just want to say hello? We'd love to hear from you. Reach out to us using
            any of the methods below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-md shadow-black/10 bg-[#111] border-white/[0.06]">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-white/60">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1 bg-[#111] border-white/[0.06] text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-white/60">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="mt-1 bg-[#111] border-white/[0.06] text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject" className="text-white/60">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="mt-1 bg-[#111] border-white/[0.06] text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-white/60">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="mt-1 bg-[#111] border-white/[0.06] text-white"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <Button type="submit" className="w-full bg-[#e93a3a] text-white hover:bg-[#e93a3a]/80">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="shadow-md shadow-black/10 bg-[#111] border-white/[0.06]">
              <CardHeader>
                <CardTitle className="text-xl text-white">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-white mb-1">Email</h3>
                  <p className="text-white/40">haxeus.is.us@gmail.com</p>
                  <p className="text-white/40">haxeus.is.us@gmail.com</p>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-1">Phone</h3>
                  <p className="text-white/40">+91 98765 43210</p>
                  <p className="text-sm text-white/40">Mon-Fri, 9 AM - 6 PM IST</p>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-1">Address</h3>
                  <p className="text-white/40">
                    HAXEUS Fashion Pvt. Ltd.
                    <br />
                    123 Design Street
                    <br />
                    Bangalore, Karnataka 560001
                    <br />
                    India
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md shadow-black/10 bg-[#111] border-white/[0.06]">
              <CardHeader>
                <CardTitle className="text-xl text-white">Business Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/40">Monday - Friday</span>
                    <span className="text-white font-medium">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Saturday</span>
                    <span className="text-white font-medium">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Sunday</span>
                    <span className="text-white font-medium">Closed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Frequently Asked <span className="text-[#e93a3a]">Questions</span>
            </h2>
            <p className="text-lg text-white/40">
              Find quick answers to common questions about our products and services.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-white/[0.06] rounded-lg px-6 bg-[#111]">
                  <AccordionTrigger className="text-left font-semibold text-white">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-white/40 pb-4">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-[#0a0a0a] bg-[#111] rounded-lg p-8">
          <h3 className="text-2xl font-bold text-white mb-4">Still have questions?</h3>
          <p className="text-white/40 mb-6">Our customer support team is here to help you with any inquiries.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-[#e93a3a] text-white hover:bg-[#e93a3a]/80">Call Us Now</Button>

          </div>
        </div>
      </div>
    </div>
  )
}
