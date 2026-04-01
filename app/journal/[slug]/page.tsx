import { notFound } from "next/navigation"
import Link from "next/link"
import { getPostBySlug, getAllSlugs } from "@/lib/journal"
import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://haxeus.in"

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: "Article Not Found" }

  const fullTitle = `${post.title} | HAXEUS Journal`
  const description = post.excerpt
  const canonical = `${SITE_URL}/journal/${slug}`

  return {
    title: post.title,
    description,
    keywords: post.keywords,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title: fullTitle,
      description,
      siteName: "HAXEUS",
      images: [
        {
          url: `${SITE_URL}/api/og?title=${encodeURIComponent(post.title)}&type=journal`,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [`${SITE_URL}/api/og?title=${encodeURIComponent(post.title)}&type=journal`],
    },
  }
}

function formatContent(content: string) {
  return content.split("\n\n").map((block) => {
    const trimmed = block.trim()
    if (!trimmed) return null
    if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
      return { type: "heading", text: trimmed.replace(/\*\*/g, "") }
    }
    const parts = trimmed.split(/(\*\*[^*]+\*\*)/g)
    return { type: "paragraph", parts }
  })
}

export default async function JournalPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const blocks = formatContent(post.content)

  return (
    <main className="min-h-screen bg-theme pt-[100px] pb-20 transition-colors duration-300">
      <article className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 text-theme-2 hover:text-theme text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Journal
        </Link>

        <header className="mb-12">
          <div className="flex items-center gap-3 text-sm text-theme-3 mb-4">
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
          <h1 className="text-3xl md:text-4xl font-bold text-theme leading-tight">
            {post.title}
          </h1>
          <p className="mt-4 text-theme-2 text-lg">{post.excerpt}</p>
        </header>

        <div className="prose prose-invert max-w-none">
          {blocks.map((block, i) => {
            if (!block) return null
            if (block.type === "heading") {
              return (
                <h2
                  key={i}
                  className="text-xl font-bold text-theme mt-8 mb-4"
                >
                  {(block as { type: string; text: string }).text}
                </h2>
              )
            }
            const { parts } = block as { type: string; parts: string[] }
            return (
              <p key={i} className="text-theme-2 leading-relaxed mb-4">
                {parts.map((part, j) =>
                  part.startsWith("**") && part.endsWith("**") ? (
                    <strong key={j} className="font-semibold text-theme">
                      {part.replace(/\*\*/g, "")}
                    </strong>
                  ) : (
                    <span key={j}>{part}</span>
                  )
                )}
              </p>
            )
          })}
        </div>

        <footer className="mt-16 pt-8 border-t border-theme/10">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 text-[var(--accent)] hover:opacity-90 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            More articles
          </Link>
        </footer>
      </article>
    </main>
  )
}
