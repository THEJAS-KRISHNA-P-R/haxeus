"use client"

import { useEffect, useState } from "react"
import { useTheme } from "@/components/ThemeProvider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import type {
  HeroConfig,
  FeaturedProductsConfig,
  NewsletterConfig,
  PreorderSectionConfig,
  AboutConfig,
  AnnouncementBarConfig,
} from "@/types/homepage"
import { Toggle } from "@/components/ui/Toggle"
import { supabase } from "@/lib/supabase"
import { Check, X } from "lucide-react"

function useIsDark() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return !mounted ? true : theme === "dark"
}

function fieldClassName(isDark: boolean) {
  return `w-full px-4 py-2.5 rounded-xl border text-sm transition-colors bg-transparent focus:outline-none focus:ring-1 focus:ring-[#e93a3a]/50 ${
    isDark
      ? "border-white/[0.10] text-white placeholder:text-white/30"
      : "border-black/[0.10] text-black placeholder:text-black/30"
  }`
}

const EditorCard = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const isDark = useIsDark()

  return (
    <div className={`rounded-2xl border ${isDark ? "bg-white/[0.03] border-white/[0.07]" : "bg-black/[0.02] border-black/[0.07]"}`}>
      <h3 className={`text-lg font-bold p-6 border-b ${isDark ? "text-white border-white/[0.07]" : "text-black border-black/[0.07]"}`}>{title}</h3>
      <div className="p-6 space-y-6">{children}</div>
    </div>
  )
}

const FormField = ({ label, subtext, children }: { label: string; subtext?: string; children: React.ReactNode }) => {
  const isDark = useIsDark()

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] items-center gap-4">
        <Label className={`text-sm font-medium ${isDark ? "text-white/65" : "text-black/65"}`}>{label}</Label>
        {children}
      </div>
      {subtext && <p className={`text-xs mt-1 ${isDark ? "text-white/40" : "text-black/40"}`}>{subtext}</p>}
    </div>
  )
}

export function HeroEditor({ config, update }: { config: HeroConfig; update: (updates: Partial<HeroConfig>) => void }) {
  const isDark = useIsDark()

  return (
    <EditorCard title="Hero Section">
      <FormField label="Line 1" subtext="First line of the big hero title.">
        <Input value={config.line1} onChange={(e) => update({ line1: e.target.value })} className={fieldClassName(isDark)} />
      </FormField>
      <FormField label="Line 2" subtext="Second line of the hero title.">
        <Input value={config.line2} onChange={(e) => update({ line2: e.target.value })} className={fieldClassName(isDark)} />
      </FormField>
      <FormField label="Line 3" subtext="Third line of the hero title.">
        <Input value={config.line3} onChange={(e) => update({ line3: e.target.value })} className={fieldClassName(isDark)} />
      </FormField>
      <FormField label="Subtext" subtext="Intro text shown below the main title.">
        <Textarea value={config.subtext} onChange={(e) => update({ subtext: e.target.value })} className={fieldClassName(isDark)} />
      </FormField>
      <FormField label="Hero Image URL" subtext="The main image shown in the hero.">
        <Input value={config.hero_product_image_url} onChange={(e) => update({ hero_product_image_url: e.target.value })} className={fieldClassName(isDark)} />
      </FormField>
      <FormField label="Primary CTA Text">
        <Input value={config.cta_primary.text} onChange={(e) => update({ cta_primary: { ...config.cta_primary, text: e.target.value } })} className={fieldClassName(isDark)} />
      </FormField>
      <FormField label="Primary CTA Href">
        <Input value={config.cta_primary.href} onChange={(e) => update({ cta_primary: { ...config.cta_primary, href: e.target.value } })} className={fieldClassName(isDark)} />
      </FormField>
      <FormField label="Visible">
        <Toggle checked={config.visible} onChange={(visible) => update({ visible })} />
      </FormField>
    </EditorCard>
  )
}

export function FeaturedProductsEditor({ config, update }: { config: FeaturedProductsConfig; update: (updates: Partial<FeaturedProductsConfig>) => void }) {
  const isDark = useIsDark()
  const [allProducts, setAllProducts] = useState<{ id: number, name: string, front_image: string | null, price: number }[]>([])
  const [productSearch, setProductSearch] = useState("")

  useEffect(() => {
    supabase
      .from("products")
      .select("id, name, front_image, price")
      .order("name")
      .then(({ data }) => {
        if (data) setAllProducts(data)
      })
  }, [])

  function toggleProduct(id: number) {
    const current = config.manual_product_ids
    const limit = config.count ?? 3
    if (current.includes(id)) {
      update({ manual_product_ids: current.filter((value) => value !== id) })
    } else if (current.length < limit) {
      update({ manual_product_ids: [...current, id] })
    } else {
      toast.error(`You can only select ${limit} featured products at a time.`)
    }
  }

  return (
    <EditorCard title="Featured Products Section">
      <FormField label="Heading" subtext="Main title for the featured section.">
        <Input value={config.heading} onChange={(e) => update({ heading: e.target.value })} className={fieldClassName(isDark)} />
      </FormField>
      <FormField label="Heading Accent" subtext="The colored word in the heading.">
        <Input value={config.heading_accent} onChange={(e) => update({ heading_accent: e.target.value })} className={fieldClassName(isDark)} />
      </FormField>
      <FormField label="Subtext" subtext="Description shown below the heading.">
        <Textarea value={config.subtext} onChange={(e) => update({ subtext: e.target.value })} className={fieldClassName(isDark)} />
      </FormField>
      <FormField label="Selection Mode">
        <select value={config.selection_mode} onChange={(e) => update({ selection_mode: e.target.value as FeaturedProductsConfig["selection_mode"] })} className={fieldClassName(isDark)}>
          <option value="manual">Manual</option>
          <option value="top_selling">Top Selling</option>
          <option value="newest">Newest</option>
        </select>
      </FormField>
      <FormField label="Count" subtext="This also limits how many manual picks can be selected.">
        <select value={String(config.count)} onChange={(e) => update({ count: Number(e.target.value) as FeaturedProductsConfig["count"] })} className={fieldClassName(isDark)}>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="6">6</option>
        </select>
      </FormField>
      <FormField label="Visible">
        <Toggle checked={config.visible} onChange={(visible) => update({ visible })} />
      </FormField>

      {config.selection_mode === "manual" && (
        <div className="space-y-4">
          <div className={`rounded-2xl border overflow-hidden ${isDark ? "border-white/[0.07]" : "border-black/[0.07]"}`}>
            <input
              type="text"
              placeholder="Search products..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className={`w-full px-4 py-3 text-sm border-b bg-transparent focus:outline-none ${
                isDark
                  ? "border-white/[0.07] text-white placeholder:text-white/30"
                  : "border-black/[0.07] text-black placeholder:text-black/30"
              }`}
            />

            <div className="max-h-64 overflow-y-auto">
              {allProducts
                .filter((product) => product.name.toLowerCase().includes(productSearch.toLowerCase()))
                .map((product) => {
                  const isSelected = config.manual_product_ids.includes(product.id)

                  return (
                    <div
                      key={product.id}
                      onClick={() => toggleProduct(product.id)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b last:border-0 ${
                        isDark ? "border-white/[0.04] hover:bg-white/[0.04]" : "border-black/[0.04] hover:bg-black/[0.04]"
                      } ${isSelected ? (isDark ? "bg-white/[0.06]" : "bg-black/[0.06]") : ""}`}
                    >
                      {product.front_image && <img src={product.front_image} alt={product.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-black"}`}>{product.name}</p>
                        <p className={`text-xs ${isDark ? "text-white/50" : "text-black/50"}`}>₹{product.price.toLocaleString("en-IN")} · ID: {product.id}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "bg-[#e93a3a] border-[#e93a3a]" : (isDark ? "border-white/[0.20]" : "border-black/[0.20]")
                      }`}>
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>
                    </div>
                  )
                })}
              {allProducts.length === 0 && (
                <p className={`px-4 py-6 text-sm text-center ${isDark ? "text-white/40" : "text-black/40"}`}>
                  No products found
                </p>
              )}
            </div>
          </div>

          {config.manual_product_ids.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {config.manual_product_ids.map((id) => {
                const product = allProducts.find((item) => item.id === id)
                if (!product) return null

                return (
                  <div key={id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${isDark ? "bg-white/[0.06] text-white" : "bg-black/[0.06] text-black"}`}>
                    {product.name}
                    <button onClick={() => toggleProduct(id)} className="hover:text-[#e93a3a] transition-colors">
                      <X size={12} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </EditorCard>
  )
}

export function NewsletterEditor({ config, update }: { config: NewsletterConfig; update: (updates: Partial<NewsletterConfig>) => void }) {
  const isDark = useIsDark()

  return (
    <EditorCard title="Newsletter Section">
      <FormField label="Heading">
        <Input value={config.heading} onChange={(e) => update({ heading: e.target.value })} className={fieldClassName(isDark)} />
      </FormField>
      <FormField label="Subtext">
        <Textarea value={config.subtext} onChange={(e) => update({ subtext: e.target.value })} className={fieldClassName(isDark)} />
      </FormField>
      <FormField label="CTA Text">
        <Input value={config.cta_text} onChange={(e) => update({ cta_text: e.target.value })} className={fieldClassName(isDark)} />
      </FormField>
      <FormField label="Visible">
        <Toggle checked={config.visible} onChange={(visible) => update({ visible })} />
      </FormField>
    </EditorCard>
  )
}

export function PreorderSectionEditor({ config, update }: { config: PreorderSectionConfig; update: (updates: Partial<PreorderSectionConfig>) => void }) {
  const isDark = useIsDark()

  return (
    <EditorCard title="Pre-order Section">
      <FormField label="Heading">
        <Input value={config.heading} onChange={(e) => update({ heading: e.target.value })} className={fieldClassName(isDark)} />
      </FormField>
      <FormField label="Subtext">
        <Textarea value={config.subtext} onChange={(e) => update({ subtext: e.target.value })} className={fieldClassName(isDark)} />
      </FormField>
      <FormField label="Visible">
        <Toggle checked={config.visible} onChange={(visible) => update({ visible })} />
      </FormField>
    </EditorCard>
  )
}

export function AboutEditor({ config, update }: { config: AboutConfig; update: (updates: Partial<AboutConfig>) => void }) {
  const isDark = useIsDark()

  return (
    <EditorCard title="About Section">
      <FormField label="Heading">
        <Input value={config.heading} onChange={(e) => update({ heading: e.target.value })} className={fieldClassName(isDark)} />
      </FormField>
      <FormField label="Heading Accent">
        <Input value={config.heading_accent} onChange={(e) => update({ heading_accent: e.target.value })} className={fieldClassName(isDark)} />
      </FormField>
      <FormField label="Body 1">
        <Textarea value={config.body1} onChange={(e) => update({ body1: e.target.value })} className={fieldClassName(isDark)} />
      </FormField>
      <FormField label="Body 2">
        <Textarea value={config.body2} onChange={(e) => update({ body2: e.target.value })} className={fieldClassName(isDark)} />
      </FormField>
      <FormField label="Image URL">
        <Input value={config.image_url} onChange={(e) => update({ image_url: e.target.value })} className={fieldClassName(isDark)} />
      </FormField>
      <FormField label="Visible">
        <Toggle checked={config.visible} onChange={(visible) => update({ visible })} />
      </FormField>
    </EditorCard>
  )
}

export function AnnouncementBarEditor({ config, update }: { config: AnnouncementBarConfig; update: (updates: Partial<AnnouncementBarConfig>) => void }) {
  const isDark = useIsDark()

  return (
    <EditorCard title="Announcement Bar">
      <FormField label="Text">
        <Input value={config.text} onChange={(e) => update({ text: e.target.value })} className={fieldClassName(isDark)} />
      </FormField>
      <FormField label="Background Color">
        <Input value={config.bg_color} onChange={(e) => update({ bg_color: e.target.value })} className={fieldClassName(isDark)} />
      </FormField>
      <FormField label="Text Color">
        <Input value={config.text_color} onChange={(e) => update({ text_color: e.target.value })} className={fieldClassName(isDark)} />
      </FormField>
      <FormField label="Visible">
        <Toggle checked={config.visible} onChange={(visible) => update({ visible })} />
      </FormField>
    </EditorCard>
  )
}
