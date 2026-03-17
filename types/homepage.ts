// ─── HOMEPAGE CMS TYPES ──────────────────────────────────────────────

export type SectionKey =
  | "hero"
  | "newsletter"
  | "featured_products"
  | "preorder"
  | "testimonials"
  | "about"
  | "announcement_bar"  | "exit_popup"

export interface ExitPopupConfig {
  enabled: boolean
  headline: string
  subtext: string
  offer_label: string
  coupon_code: string
  cta_text: string
  cta_href: string
  fine_print: string
  dismiss_text: string
  image_url: string
  image_alt: string
  accent_color: string
  overlay_opacity: number
  cooldown_hours: number
  trigger_delay_ms: number
}
export type ProductSelectionMode = "manual" | "top_selling" | "newest"

export interface HeroStat {
  value: string
  label: string
  color: string
}

export interface HeroBadge {
  label: string
  value: string
  color: string
}

export interface HeroCTA {
  text: string
  href: string
}

export interface HeroFeature {
  label: string
  color: string
}

export interface HeroConfig {
  line1: string
  line2: string
  line3: string
  subtext: string
  hero_product_image_url: string
  hero_product_id: number | null        // if set, link the image to this product
  badge_top: HeroBadge
  badge_bottom: HeroBadge
  cta_primary: HeroCTA
  cta_secondary: HeroCTA
  stats: HeroStat[]                     // always exactly 3
  visible: boolean
}

export interface FeaturedProductsConfig {
  heading: string
  heading_accent: string                // the colored word
  subtext: string
  selection_mode: ProductSelectionMode
  manual_product_ids: number[]         // used when selection_mode = 'manual'
  count: 3 | 4 | 6                    // how many cards to show
  visible: boolean
}

export interface NewsletterConfig {
  heading: string
  subtext: string
  cta_text: string
  visible: boolean
}

export interface PreorderSectionConfig {
  heading: string
  subtext: string
  visible: boolean
}

export interface AboutConfig {
  heading: string
  heading_accent: string
  heading_suffix: string
  body1: string
  body2: string
  image_url: string
  cta_text: string
  cta_href: string
  features: HeroFeature[]             // always exactly 4
  visible: boolean
}

export interface AnnouncementBarConfig {
  text: string
  bg_color: string
  text_color: string
  visible: boolean
}

export interface HomepageConfig {
  hero: HeroConfig
  featured_products: FeaturedProductsConfig
  newsletter: NewsletterConfig
  preorder: PreorderSectionConfig
  about: AboutConfig
  section_order: SectionKey[]         // admin can drag to reorder
  announcement_bar: AnnouncementBarConfig
  hidden_sections: SectionKey[]
  _version: number                    // increment on every save for conflict detection
  _updated_at: string                 // ISO timestamp of last save
}
