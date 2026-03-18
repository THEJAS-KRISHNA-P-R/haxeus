"use client"

import { useEffect, useState } from "react"
import { useTheme } from "@/components/ThemeProvider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import type {
  HeroConfig,
} from "@/types/homepage"
import { cn } from "@/lib/utils"
import { X, ImageIcon } from "lucide-react"
import { ImagePicker } from "@/components/admin/storage/ImagePicker"

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
    <EditorCard title="Hero Section Image">
      <FormField label="Hero Image Select" subtext="Select an image from your storage.">
        <div className="flex gap-2">
           <AdminImageSelect 
             value={config.hero_product_image_url} 
             onSelect={(url) => update({ hero_product_image_url: url })}
             isDark={isDark}
           />
        </div>
      </FormField>
      <FormField label="Hero Image URL" subtext="Or paste a direct URL here.">
        <Input value={config.hero_product_image_url} onChange={(e) => update({ hero_product_image_url: e.target.value })} className={fieldClassName(isDark)} />
      </FormField>
      <p className={`text-xs mt-4 ${isDark ? "text-white/30 italic" : "text-black/30 italic"}`}>
        * Other hero text fields are currently disabled to reduce resource usage.
      </p>
    </EditorCard>
  )
}

function AdminImageSelect({ value, onSelect, isDark }: { value: string, onSelect: (url: string) => void, isDark: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col gap-3 w-full">
      {value && (
        <div className={cn(
          "relative aspect-video w-full max-w-sm rounded-2xl overflow-hidden border",
          isDark ? "border-white/10" : "border-black/10"
        )}>
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button 
            type="button"
            onClick={() => onSelect("")}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}
      
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center justify-center gap-2 px-4 py-6 rounded-2xl border-2 border-dashed transition-all",
          isDark 
            ? "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] text-white/50" 
            : "border-black/10 bg-black/[0.02] hover:border-black/20 hover:bg-black/[0.04] text-black/50"
        )}
      >
        <ImageIcon size={20} />
        <span className="text-sm font-bold uppercase tracking-wider">Select from Storage</span>
      </button>

      {open && (
        <ImagePicker 
          isDark={isDark} 
          onClose={() => setOpen(false)} 
          onSelect={(url) => {
            onSelect(url)
            setOpen(false)
          }} 
        />
      )}
    </div>
  )
}
