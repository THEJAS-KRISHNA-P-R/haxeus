export interface JournalPost {
  slug: string
  title: string
  excerpt: string
  publishedAt: string
  readTime: string
  keywords: string[]
  content?: string
}

const POST_CONTENT: Record<string, string> = {
  "streetwear-india-guide": `
Streetwear in India has evolved from niche subculture to mainstream fashion. Metro cities like Mumbai, Delhi, Bangalore, and Hyderabad lead the way, with local brands and international influences shaping the scene.

**What Makes Indian Streetwear Unique**

Indian streetwear blends global trends with local aesthetics — think graphic tees with regional motifs, oversized fits suited to the climate, and premium fabrics that stand up to Indian summers. Brands like HAXEUS focus on quality cotton, relaxed fits, and limited drops that create genuine demand.

**Where to Start**

If you're new to streetwear in India, start with basics: a solid oversized tee, a quality hoodie, and well-fitted joggers. Look for brands that prioritize fabric (240gsm cotton is a good benchmark) and construction over flashy logos.
  `,
  "oversized-fit-guide": `
The oversized look isn't about wearing clothes that are too big — it's about intentional proportion and comfort. Here's how to get it right.

**Sizing Tips**

- Go one or two sizes up from your usual fit for tees and hoodies
- Shoulders should sit lower than your natural shoulder line
- Sleeves can extend past your wrists for a relaxed vibe
- Length matters: oversized tees often hit mid-thigh

**Layering**

Layer an oversized hoodie over a fitted tee, or pair an oversized tee with slim joggers. The key is balance — if one piece is loose, another can be more fitted.
  `,
  "how-to-style-graphic-tees": `
Graphic tees are versatile. Here are seven outfit ideas that work:

1. **Classic casual**: Graphic tee + jeans + sneakers
2. **Layered look**: Tee under an open flannel or jacket
3. **Smart casual**: Tuck a graphic tee into chinos
4. **Streetwear**: Oversized tee + joggers + dad caps
5. **Monochrome**: Black tee, black pants, white sneakers
6. **Summer**: Tee + shorts + slides
7. **Winter**: Tee under a hoodie or puffer

Choose tees with designs that reflect your personality. Quality matters — 240gsm cotton holds prints better and lasts longer.
  `,
  "premium-streetwear-brands-india": `
The Indian streetwear market has grown rapidly. Here are brands worth watching in 2025:

**What to Look For**

- **Fabric**: 240gsm+ cotton for tees and hoodies
- **Fit**: Relaxed, oversized options
- **Design**: Unique graphics, limited drops
- **Transparency**: Clear sizing, shipping, and return policies

**HAXEUS** offers premium streetwear with oversized fits, dark aesthetics, and limited drops. Each piece is crafted for those who move differently.
  `,
  "dark-aesthetic-fashion-tips": `
A dark aesthetic wardrobe is timeless and versatile. Here's how to build one:

**Core Pieces**

- Black oversized tees and hoodies
- Grey joggers or cargos
- Black or dark denim
- Minimal sneakers (black or white)

**Accents**

Add depth with burgundy, olive, or charcoal. A single accent piece — like a red hoodie or gold chain — can elevate the whole look.

**Maintenance**

Dark clothes fade with washing. Wash inside out, use cold water, and avoid over-drying to keep blacks rich and deep.
  `,
}

export const JOURNAL_POSTS: JournalPost[] = [
  {
    slug: "streetwear-india-guide",
    title: "Streetwear in India: A Complete Guide to the Growing Scene",
    excerpt: "Discover how streetwear has taken root in India — from metro cities to emerging brands. Learn what makes Indian streetwear unique and where to find the best pieces.",
    publishedAt: "2025-03-01",
    readTime: "5 min",
    keywords: ["streetwear India", "Indian streetwear", "hax", "haxe", "haxeus", "urban fashion India", "tshirt", "t", "tee", "t-shirt", "premium", "art", "haxeus"],
  },
  {
    slug: "oversized-fit-guide",
    title: "The Oversized Fit Guide: How to Wear Relaxed Streetwear",
    excerpt: "Master the oversized look. From sizing tips to layering, learn how to style oversized hoodies and tees for that effortless streetwear aesthetic.",
    publishedAt: "2025-02-28",
    readTime: "4 min",
    keywords: ["oversized fit guide", "oversized tshirts", "relaxed fit streetwear"],
  },
  {
    slug: "how-to-style-graphic-tees",
    title: "How to Style Graphic Tees: 7 Outfit Ideas That Work",
    excerpt: "Graphic tees are wardrobe staples. Here's how to pair them with everything from jeans to layered looks for maximum impact.",
    publishedAt: "2025-02-25",
    readTime: "4 min",
    keywords: ["how to style graphic tees", "graphic tee outfits", "streetwear styling"],
  },
  {
    slug: "premium-streetwear-brands-india",
    title: "Best Premium Streetwear Brands in India (2025)",
    excerpt: "A curated list of Indian streetwear brands offering quality, design, and that premium feel. From limited drops to everyday essentials.",
    publishedAt: "2025-02-20",
    readTime: "6 min",
    keywords: ["premium streetwear India", "streetwear brands India", "best streetwear India"],
  },
  {
    slug: "dark-aesthetic-fashion-tips",
    title: "Dark Aesthetic Fashion: Building a Monochrome Streetwear Wardrobe",
    excerpt: "Embrace the dark side. Tips for building a cohesive dark aesthetic wardrobe with blacks, greys, and bold accents.",
    publishedAt: "2025-02-15",
    readTime: "5 min",
    keywords: ["dark aesthetic clothing", "monochrome streetwear", "dark fashion"],
  },
]

export function getPostBySlug(slug: string): (JournalPost & { content: string }) | undefined {
  const post = JOURNAL_POSTS.find((p) => p.slug === slug)
  if (!post) return undefined
  const content = POST_CONTENT[slug] ?? ""
  return { ...post, content: content.trim() }
}

export function getAllSlugs(): string[] {
  return JOURNAL_POSTS.map((p) => p.slug)
}
