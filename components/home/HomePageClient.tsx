"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import dynamic from "next/dynamic"
import { usePromoPopups } from "@/hooks/usePromoPopups"
import { PreorderModal } from "@/components/PreorderModal"
import { HeroSection } from "@/components/sections/HeroSection"
import { FeaturedProductsSection } from "@/components/sections/FeaturedProductsSection"
import { PreorderSection } from "@/components/sections/PreorderSection"
import { NewsletterSection } from "@/components/sections/NewsletterSection"
import { AboutSection } from "@/components/sections/AboutSection"
import type { HomepageConfig } from "@/types/homepage"
import type { Product } from "@/lib/supabase"

const PromoPopupRenderer = dynamic(() => import("@/components/PromoPopupRenderer").then(mod => mod.PromoPopupRenderer), { ssr: false })
const DynamicTestimonials = dynamic(() => import("@/components/Testimonials"), {
  loading: () => <div className="h-96 animate-pulse bg-[var(--bg-elevated)] rounded-2xl" />,
})

interface HomePageClientProps {
  config: HomepageConfig
  featuredProducts: Product[]
  preorderItems: Product[]
}

export function HomePageClient({ 
  config, 
  featuredProducts, 
  preorderItems 
}: HomePageClientProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [preorderModalItem, setPreorderModalItem] = useState<Product | null>(null)
  
  // Popup Systems
  const { activePopup: promoPopup, isVisible: isPromoVisible, close: handlePromoClose } = usePromoPopups()

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = !mounted ? true : (
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  )

  const isSectionVisible = (sectionKey: string, visible = true) => {
    return visible !== false && !config.hidden_sections?.includes(sectionKey as any)
  }

  return (
    <>
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Announcement Bar */}
        {isSectionVisible("announcement_bar", config.announcement_bar?.visible) && config.announcement_bar?.text && (
          <div
            className="w-full text-center py-2.5 px-4 text-sm font-semibold tracking-wide z-20"
            style={{
              backgroundColor: config.announcement_bar.bg_color ?? "#e93a3a",
              color: config.announcement_bar.text_color ?? "#ffffff"
            }}
          >
            {config.announcement_bar.text}
          </div>
        )}

        {/* Hero Section */}
        {isSectionVisible("hero", config.hero.visible) && (
          <HeroSection config={config.hero} />
        )}

        {/* Preorder Section */}
        {isSectionVisible("preorder", config.preorder.visible) && preorderItems.length > 0 && (
          <PreorderSection 
            config={config.preorder} 
            products={preorderItems} 
            isDark={isDark}
            onPreorderClick={(p) => setPreorderModalItem(p)}
          />
        )}

        {/* Newsletter Section */}
        {isSectionVisible("newsletter", config.newsletter.visible) && (
          <NewsletterSection config={config.newsletter} isDark={isDark} />
        )}

        {/* Featured Products Section */}
        {isSectionVisible("featured_products", config.featured_products.visible) && (
          <FeaturedProductsSection 
            config={config.featured_products} 
            products={featuredProducts} 
            isDark={isDark}
          />
        )}

        {/* Testimonials */}
        {isSectionVisible("testimonials") && (
          <section className="relative z-10 border-t border-theme">
            <DynamicTestimonials />
          </section>
        )}

        {/* About Section */}
        {isSectionVisible("about", config.about.visible) && (
          <AboutSection config={config.about} isDark={isDark} />
        )}
      </div>

      {/* Modals & Popups */}
      {preorderModalItem && (
        <PreorderModal
          item={preorderModalItem as any}
          isOpen={!!preorderModalItem}
          onClose={() => setPreorderModalItem(null)}
        />
      )}

      {mounted && (
        <PromoPopupRenderer
          popup={promoPopup}
          isVisible={isPromoVisible}
          onClose={handlePromoClose}
        />
      )}
    </>
  )
}
