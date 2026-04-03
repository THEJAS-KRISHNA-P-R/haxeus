"use client"

import { useRef, useState } from "react"
import { Loader2, Upload, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

const BUCKET = "homepage-images"
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

interface AboutImageUploadProps {
  /** The current image_url from the about config */
  currentUrl: string
  /** Called with the new public URL after a successful upload */
  onUploaded: (url: string) => void
  isDark: boolean
}

export function AboutImageUpload({ currentUrl, onUploaded, isDark }: AboutImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string>(currentUrl)
  const [uploading, setUploading] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // ── Validation ─────────────────────────────────────────────────────────
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are supported (JPEG, PNG, WebP).")
      return
    }
    if (file.size > MAX_BYTES) {
      toast.error("File is too large. Maximum allowed size is 5 MB.")
      return
    }

    // ── Instant local preview ──────────────────────────────────────────────
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)

    setUploading(true)
    try {
      // ── Upload to Supabase Storage ─────────────────────────────────────
      const path = `about/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false, contentType: file.type })

      if (uploadError) {
        throw new Error(`Storage error: ${uploadError.message}`)
      }

      // ── Get public URL ─────────────────────────────────────────────────
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
      const publicUrl = urlData.publicUrl

      // ── Update homepage config in store_settings ───────────────────────
      // Read current config first so we only patch about.image_url
      const { data: settingsRow, error: fetchError } = await supabase
        .from("store_settings")
        .select("value")
        .eq("key", "homepage_config")
        .single()

      if (fetchError) throw new Error(`Config fetch failed: ${fetchError.message}`)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw JSON from Supabase
      const currentConfig = (settingsRow?.value ?? {}) as Record<string, any>
      const updatedConfig = {
        ...currentConfig,
        about: {
          ...(currentConfig.about ?? {}),
          image_url: publicUrl,
        },
      }

      const { error: updateError } = await supabase
        .from("store_settings")
        .update({ value: updatedConfig })
        .eq("key", "homepage_config")

      if (updateError) throw new Error(`Config update failed: ${updateError.message}`)

      // ── Success ────────────────────────────────────────────────────────
      setPreview(publicUrl)
      onUploaded(publicUrl)
      toast.success("About image updated. The live site will reflect this on the next page load.")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed. Check your connection."
      toast.error(message)
      // Revert preview to original
      setPreview(currentUrl)
    } finally {
      setUploading(false)
      // Reset the input so the same file can be re-selected if needed
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const mutedText = isDark ? "text-white/40" : "text-black/40"
  const borderCls = isDark ? "border-white/[0.10]" : "border-black/[0.10]"

  return (
    <div className="flex flex-col gap-4">
      {/* Current / preview image */}
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "relative w-20 h-20 rounded-lg overflow-hidden border flex-shrink-0",
            borderCls,
          )}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- intentional: admin panel, no Next Image needed here
            <img
              src={preview}
              alt="About section preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={cn("w-full h-full flex items-center justify-center", isDark ? "bg-white/[0.04]" : "bg-black/[0.04]")}>
              <ImageIcon size={24} className={mutedText} />
            </div>
          )}
        </div>

        <p className={cn("text-xs truncate max-w-[200px] font-mono", mutedText)}>
          {preview ? preview.split("/").pop() : "No image set"}
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Upload about section image"
      />

      {/* Upload button */}
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border text-sm font-bold tracking-wide transition-all",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          isDark
            ? "border-white/[0.15] bg-white/[0.04] hover:bg-white/[0.08] text-white"
            : "border-black/[0.15] bg-black/[0.04] hover:bg-black/[0.08] text-black",
        )}
      >
        {uploading ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload size={15} />
            Change image
          </>
        )}
      </button>

      <p className={cn("text-[10px]", mutedText)}>
        JPEG · PNG · WebP · Max 5 MB. Change is live on next page load.
      </p>
    </div>
  )
}
