import fs from 'fs'
import path from 'path'
import { compileMDX } from 'next-mdx-remote/rsc'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

export interface BlogPostMetadata {
  title: string
  description: string
  date: string
  author: string
  tags: string[]
  coverImage: string
  published: boolean
}

export interface BlogPost {
  slug: string
  metadata: BlogPostMetadata
  content: any
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const fileName = slug.endsWith('.mdx') ? slug : `${slug}.mdx`
    const filePath = path.join(BLOG_DIR, fileName)
    const fileContent = fs.readFileSync(filePath, 'utf8')

    const { content, frontmatter } = await compileMDX<BlogPostMetadata>({
      source: fileContent,
      options: { 
        parseFrontmatter: true,
      },
    })

    return {
      slug: slug.replace('.mdx', ''),
      metadata: frontmatter,
      content,
    }
  } catch (error) {
    console.error(`Error loading blog post ${slug}:`, error)
    return null
  }
}

export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    if (!fs.existsSync(BLOG_DIR)) {
      return []
    }

    const files = fs.readdirSync(BLOG_DIR)
    const posts = await Promise.all(
      files
        .filter((file) => file.endsWith('.mdx'))
        .map(async (file) => {
          const post = await getPostBySlug(file)
          return post
        })
    )

    // filter only published posts and sort by date desc
    return (posts.filter((post) => post !== null && post.metadata.published) as BlogPost[])
      .sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime())
  } catch (error) {
    console.error('Error loading all blog posts:', error)
    return []
  }
}
