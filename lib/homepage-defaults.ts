import type { HomepageConfig } from "@/types/homepage"

export const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
  hero: {
    line1: "For Those Who",
    line2: "Won't Change",
    line3: "To Fit In",
    subtext: "Bold designs for bold individuals. Express yourself unapologetically with premium streetwear that refuses to blend in.",
    hero_product_image_url: "/images/save-flower-front.jpg",
    hero_product_id: null,
    badge_top: {
      label: "Artistic Designs",
      value: "Premium Quality",
      color: "#e7bf04"
    },
    badge_bottom: {
      label: "Eco-Conscious",
      value: "Sustainable",
      color: "#07e4e1"
    },
    cta_primary: { text: "Shop Collection", href: "/products" },
    cta_secondary: { text: "Our Story", href: "/about" },
    stats: [
      { value: "10+", label: "Happy Customers", color: "#e7bf04" },
      { value: "99%", label: "Satisfaction Rate", color: "#c03c9d" },
      { value: "24/7", label: "Support", color: "#07e4e1" }
    ],
    visible: true
  },
  featured_products: {
    heading: "Featured",
    heading_accent: "Collection",
    subtext: "Discover our most popular premium T-shirts, carefully crafted for ultimate comfort and style.",
    selection_mode: "manual",
    manual_product_ids: [],
    count: 3,
    visible: true
  },
  newsletter: {
    heading: "Join the movement. Your perfect T-shirt is just a click away.",
    subtext: "Get exclusive offers and updates. Unsubscribe anytime.",
    cta_text: "Shop Now",
    visible: true
  },
  preorder: {
    heading: "Pre-Order Now",
    subtext: "Secure yours before they drop. Limited quantities.",
    visible: true
  },
  about: {
    heading: "Crafting",
    heading_accent: "Premium",
    heading_suffix: "Since 2025",
    body1: "At HAXEUS, we believe that comfort shouldn't compromise style. Our journey began with a simple mission: to create the perfect T-shirt that combines premium materials, exceptional craftsmanship, and timeless design.",
    body2: "Every piece in our collection is meticulously crafted using the finest cotton blends, ensuring durability, breathability, and that luxurious feel against your skin.",
    image_url: "/images/statue-front.jpg",
    cta_text: "Learn More About Us",
    cta_href: "/about",
    features: [
      { label: "Premium Materials", color: "#e7bf04" },
      { label: "Ethical Production", color: "#c03c9d" },
      { label: "Sustainable Practices", color: "#07e4e1" },
      { label: "Perfect Fit", color: "#e93a3a" }
    ],
    visible: true
  },
  section_order: ["hero", "newsletter", "featured_products", "preorder", "testimonials", "about"],
  announcement_bar: {
    text: "",
    bg_color: "#e93a3a",
    text_color: "#ffffff",
    visible: false
  },
  hidden_sections: [],
  _version: 1,
  _updated_at: new Date().toISOString()
}
