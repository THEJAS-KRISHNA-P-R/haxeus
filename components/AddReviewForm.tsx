"use client"

import { useState, type FormEvent, useRef, type ClipboardEvent } from "react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { ReviewStars } from "@/components/ReviewStars"
import type { ProductReviewViewModel } from "@/types/reviews"
import { supabase } from "@/lib/supabase"
import { X, Camera, Loader2, Sparkles } from "lucide-react"

interface AddReviewFormProps {
  productId: number
  isAuthenticated: boolean
  onReviewCreated: (review: ProductReviewViewModel) => void
  initialReview?: ProductReviewViewModel
}

export function AddReviewForm({ productId, isAuthenticated, onReviewCreated, initialReview }: AddReviewFormProps) {
  const { toast } = useToast()
  const [rating, setRating] = useState(initialReview?.rating ?? 5)
  const [body, setBody] = useState(initialReview?.body ?? "")
  const [imageUrls, setImageUrls] = useState<string[]>(initialReview?.image_urls ?? [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditing = !!initialReview

  async function uploadFiles(files: FileList | File[]) {
    if (!files.length) return
    setIsUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Authentication required for uploads.")

      const newUrls: string[] = []

      for (const file of Array.from(files)) {
        if (imageUrls.length + newUrls.length >= 4) {
          toast({ title: "Limit reached", description: "You can upload up to 4 images.", variant: "destructive" })
          break
        }

        const fileExt = file.name.split('.').pop() || 'png'
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from("review-images")
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from("review-images")
          .getPublicUrl(filePath)

        newUrls.push(publicUrl)
      }

      setImageUrls((prev) => [...prev, ...newUrls])
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" })
    } finally {
      setIsUploading(false)
    }
  }

  function handlePaste(e: ClipboardEvent) {
    const items = e.clipboardData.items
    const files: File[] = []
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile()
        if (file) files.push(file)
      }
    }
    if (files.length) {
      uploadFiles(files)
    }
  }

  function removeImage(url: string) {
    setImageUrls((prev) => prev.filter((u) => u !== url))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (body.length < 5) {
      toast({ title: "Signal too short", description: "Please share a little more detail.", variant: "destructive" })
      return
    }
    setIsSubmitting(true)

    try {
      const method = isEditing ? "PATCH" : "POST"
      const payload = isEditing
        ? { reviewId: initialReview.id, rating, body, imageUrls }
        : { productId, rating, body, imageUrls }

      const response = await fetch("/api/reviews", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok || !result.review) {
        throw new Error(result.error || "Failed to save review.")
      }

      onReviewCreated(result.review as ProductReviewViewModel)
      if (!isEditing) {
        setBody("")
        setImageUrls([])
        setRating(5)
      }
      toast({
        title: isEditing ? "Review updated" : "Review submitted",
        description: "Thanks for the feedback."
      })
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="space-y-6 rounded-[40px] p-8 border-2 border-theme bg-card shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-xl font-black italic tracking-tighter text-theme">
            {isEditing ? "Edit Review" : "Write a Review"}
          </h2>

        </div>
      </div>

      {!isAuthenticated ? (
        <div className="rounded-2xl bg-card-2 p-8 text-center border-2 border-dashed border-theme">
          <p className="text-sm font-medium text-theme-2">
            <Link href={`/auth?redirect=/products/${productId}`} className="text-theme-2 font-black underline underline-offset-4 hover:opacity-80">
              Sign in
            </Link>{" "}
            to share your thoughts on this product.
          </p>
        </div>
      ) : (
        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <span className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-theme-3">Rate this product</span>
            <ReviewStars value={rating} onChange={setRating} size="lg" interactive />
          </div>

          <div className="space-y-3">
            <label htmlFor="review-body" className="block text-[10px] font-black uppercase tracking-[0.25em] text-theme-3 ml-2">
              Review Content
            </label>
            <div className="relative group">
              <textarea
                id="review-body"
                value={body}
                onPaste={handlePaste}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Share your experience... (Ctrl+V to attach images)"
                className="w-full rounded-[32px] bg-card-2 p-7 text-sm font-medium leading-relaxed text-theme outline-none transition-all border-2 border-theme focus:border-theme-2/50 focus:ring-8 focus:ring-theme-2/5 placeholder:text-theme-3"
                style={{ minHeight: "180px" }}
                required
              />
              <div className="absolute bottom-4 right-8 flex items-center gap-2 pointer-events-none opacity-40">
                <span className="text-[9px] font-black uppercase tracking-widest text-theme-3">Verified Review</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-theme-3">Product Images</span>
              <span className="text-[9px] font-black italic text-theme-3">{imageUrls.length}/4 ATTACHED</span>
            </div>

            <div className="flex flex-wrap gap-4">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="group relative h-24 w-24 overflow-hidden rounded-[20px] border-2 border-theme bg-card-2 shadow-sm">
                  <img src={url} alt="Review attachment" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 text-white backdrop-blur-[2px]"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}

              {imageUrls.length < 4 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex h-24 w-24 flex-col items-center justify-center gap-2 rounded-[20px] border-2 border-dashed border-theme bg-card-2 text-theme-3 transition-all hover:border-theme-2/40 hover:bg-theme-2/5 hover:text-theme-2 disabled:cursor-not-allowed group"
                >
                  {isUploading ? (
                    <Loader2 size={24} className="animate-spin text-theme-2" />
                  ) : (
                    <>
                      <Camera size={24} className="transition-transform group-hover:scale-110" />
                      <span className="text-[9px] font-black uppercase tracking-tighter">Add Photo</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && uploadFiles(e.target.files)}
            />
            <p className="text-[10px] italic text-theme-3 ml-2">Max 4 images. Verified reviews prioritize ranking.</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isUploading || rating === 0}
            className="w-full relative group overflow-hidden rounded-full bg-accent py-5 text-[11px] font-black uppercase tracking-[0.4em] text-white shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed border-none"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <span className="relative flex items-center justify-center gap-3">
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  {isEditing ? "Update Review" : "Submit Review"}
                  <Sparkles size={16} />
                </>
              )}
            </span>
          </button>
        </form>
      )}
    </section>
  )
}
