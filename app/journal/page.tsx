"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { JOURNAL_POSTS } from "@/lib/journal"
import { ArrowRight, BookOpen } from "lucide-react"

export default function JournalPage() {
  return (
    <main className="min-h-screen bg-theme pt-[100px] pb-20 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <p className="text-sm uppercase tracking-[0.25em] text-[var(--accent)] font-semibold mb-3">
            The Journal
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-theme mb-4">
            Streetwear guides & style tips
          </h1>
          <p className="text-theme-2 text-lg max-w-2xl">
            From oversized fit guides to styling graphic tees — everything you need to move differently.
          </p>
        </motion.header>

        <div className="space-y-8">
          {JOURNAL_POSTS.map((post, i) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                href={`/journal/${post.slug}`}
                className="block group border border-theme/10 rounded-2xl p-6 md:p-8 hover:border-theme/20 hover:bg-card/50 transition-all duration-300"
              >
                <div className="flex items-center gap-3 text-sm text-theme-3 mb-3">
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                  <span>·</span>
                  <span>{post.readTime} read</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-theme mb-3 group-hover:text-[var(--accent)] transition-colors">
                  {post.title}
                </h2>
                <p className="text-theme-2 mb-4 line-clamp-2">{post.excerpt}</p>
                <span className="inline-flex items-center gap-2 text-[var(--accent)] font-medium text-sm group-hover:gap-3 transition-all">
                  Read article
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-theme-2 hover:text-theme transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Shop HAXEUS
          </Link>
        </motion.div>
      </div>
    </main>
  )
}
