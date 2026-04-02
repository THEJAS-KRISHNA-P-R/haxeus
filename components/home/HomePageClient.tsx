"use client"

import { useState, useEffect } from "react"
import { useTheme } from "@/components/ThemeProvider"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { usePromoPopups } from "@/hooks/usePromoPopups"
import { HeroSection } from "@/components/sections/HeroSection"
import type { HomepageConfig } from "@/types/homepage"
import { Product } from "@/types/supabase"
import type { ActiveDrop } from "@/types/drops"

const PromoPopupRenderer = dynamic(() => import("@/components/PromoPopupRenderer").then(mod => mod.PromoPopupRenderer), { ssr: false })
const DynamicPreorderSection = dynamic(() => import("@/components/sections/PreorderSection").then((mod) => mod.PreorderSection), {
  loading: () => <div className="min-h-[480px]" />,
})
const DynamicNewsletterSection = dynamic(() => import("@/components/sections/NewsletterSection").then((mod) => mod.NewsletterSection), {
  loading: () => <div className="min-h-[360px]" />,
})
const DynamicFeaturedProductsSection = dynamic(() => import("@/components/sections/FeaturedProductsSection").then((mod) => mod.FeaturedProductsSection), {
  loading: () => <div className="min-h-[800px]" />,
})
const DynamicAboutSection = dynamic(() => import("@/components/sections/AboutSection").then((mod) => mod.AboutSection), {
  loading: () => <div className="min-h-[600px]" />,
})
const DynamicTestimonials = dynamic(() => import("@/components/Testimonials"), {
  loading: () => <div className="h-96 animate-pulse bg-[var(--bg-elevated)] rounded-2xl" />,
})

import { JoinMovementCTA } from "@/components/JoinMovementCTA"
import { TrustSignals } from "@/components/TrustSignals"

interface HomePageClientProps {
  config: HomepageConfig
  featuredProducts: Product[]
  preorderItems: Product[]
  activeDrop: ActiveDrop | null
}

export function HomePageClient({ 
  config, 
  featuredProducts, 
  preorderItems,
  activeDrop,
}: HomePageClientProps) {
  const router = useRouter()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Popup Systems
  const { activePopup: promoPopup, isVisible: isPromoVisible, close: handlePromoClose } = usePromoPopups()

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = !mounted ? true : theme === "dark"

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
          <HeroSection config={config.hero} activeDrop={activeDrop} />
        )}

        <TrustSignals />

        {/* Preorder Section */}
        {isSectionVisible("preorder", config.preorder.visible) && preorderItems.length > 0 && (
          <DynamicPreorderSection
            config={config.preorder} 
            products={preorderItems} 
            isDark={isDark}
            onPreorderClick={(p: Product) => router.push(`/products/${p.id}`)}
          />
        )}

        {/* Newsletter Section */}
        {isSectionVisible("newsletter", config.newsletter.visible) && (
          <DynamicNewsletterSection config={config.newsletter} isDark={isDark} />
        )}

        {/* Featured Products Section */}
        {isSectionVisible("featured_products", config.featured_products.visible) && (
          <div style={{ contentVisibility: "auto", containIntrinsicSize: "0 800px" }}>
            <DynamicFeaturedProductsSection
              config={config.featured_products} 
              products={featuredProducts} 
              isDark={isDark}
            />
          </div>
        )}

        {/* Testimonials */}
        {isSectionVisible("testimonials") && (
          <section className="relative z-10 border-t border-theme" style={{ contentVisibility: "auto", containIntrinsicSize: "0 600px" }}>
            <DynamicTestimonials />
          </section>
        )}

        {/* About Section */}
        {isSectionVisible("about", config.about.visible) && (
          <div style={{ contentVisibility: "auto", containIntrinsicSize: "0 800px" }}>
            <DynamicAboutSection config={config.about} isDark={isDark} />
          </div>
        )}

        <JoinMovementCTA />
      </div>



      {mounted && promoPopup && (
        <PromoPopupRenderer
          //@ts-ignore - promoPopup is checked by the conditional above
          popup={promoPopup}
          isVisible={isPromoVisible}
          onClose={handlePromoClose}
        />
      )}
    </>
  )
}
