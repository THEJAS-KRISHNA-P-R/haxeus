"use client"

import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { scrollReveal, staggerFast, cardHover } from "@/lib/animations"

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

export default function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={scrollReveal}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            What Our <span className="text-red-600">Customers</span> Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our community of satisfied customers has to say about their
            HAXEUZ experience.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerFast}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              variants={scrollReveal}
              custom={index}
            >
              <motion.div 
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-8 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white border-0 h-full">
                  <motion.div 
                    className="flex mb-6"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.span
                        key={i}
                        className="text-yellow-400 text-2xl"
                        initial={{ opacity: 0, rotate: -180 }}
                        whileInView={{ opacity: 1, rotate: 0 }}
                        transition={{ delay: index * 0.1 + 0.4 + i * 0.05 }}
                      >
                        ⭐
                      </motion.span>
                    ))}
                  </motion.div>
                  <p className="text-gray-700 mb-6 italic text-lg leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center">
                    <motion.div
                      className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-full mr-4 flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <span className="text-white font-bold text-xl">{testimonial.name.charAt(0)}</span>
                    </motion.div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
