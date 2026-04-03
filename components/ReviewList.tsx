"use client"

import { useState } from "react"
import type { ProductReviewViewModel } from "@/types/reviews"
import { ReviewCard } from "@/components/ReviewCard"
import { ReviewStars } from "@/components/ReviewStars"
import { AddReviewForm } from "@/components/AddReviewForm"
import { Image as ImageIcon, MessageSquare, Sparkles } from "lucide-react"

interface ReviewListProps {
  productId: number
  userId?: string | null
  canReview?: boolean
  reviews: ProductReviewViewModel[]
  onReviewCreated: (review: ProductReviewViewModel) => void
  onReviewDeleted: (id: string) => void
}

export function ReviewList({ productId, userId, canReview = false, reviews, onReviewCreated, onReviewDeleted }: ReviewListProps) {
  const [editingReview, setEditingReview] = useState<ProductReviewViewModel | null>(null)

  // Calculate stats for bars
  const totalReviews = reviews.length
  const avgRating = totalReviews > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews : 0
  
  const ratingCounts = [1, 2, 3, 4, 5].reduce((acc, star) => {
    acc[star] = reviews.filter((r) => r.rating === star).length
    return acc
  }, {} as Record<number, number>)

  // Extract all images for the gallery
  const allImages = reviews.flatMap(r => r.image_urls || [])

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return
    try {
      const resp = await fetch(`/api/reviews?reviewId=${reviewId}`, { method: "DELETE" })
      if (resp.ok) {
        onReviewDeleted(reviewId)
      }
    } catch (err) {
      console.error("Delete failed:", err)
    }
  }

  return (
    <div className="space-y-16 py-8">
      {/* Prime Header & Summary Container */}
      <section className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="sticky top-24 space-y-8">
            <div>
              <h2 className="text-2xl font-black italic tracking-tighter text-theme sm:text-3xl">Customer Reviews</h2>
              <div className="mt-4 flex items-center gap-4">
                <ReviewStars value={avgRating} size="md" />
                <span className="text-xl font-black text-theme">{avgRating.toFixed(1)} <span className="text-theme-3 italic">/ 5</span></span>
              </div>
              {totalReviews === 0 ? (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-theme-2/10 px-3 py-1 border border-theme-2/20">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-theme-2" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-theme-2">Be the first to review</span>
                </div>
              ) : (
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.25em] text-theme-3">
                  {totalReviews} Verified Reviews
                </p>
              )}
            </div>

            {/* Rating Bars (Flipkart/Amazon style but with no %) */}
            <div className="space-y-4">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingCounts[star] || 0
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                return (
                  <div key={star} className="flex items-center gap-4 group">
                    <span className="w-12 text-[10px] font-black text-theme-3 transition-colors group-hover:text-theme-2">{star} STAR</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-card-2 border-1.5 border-theme">
                      <div 
                        className="h-full bg-[#ffa41c] transition-all duration-700 ease-out" 
                        style={{ width: `${percentage}%`, boxShadow: percentage > 0 ? "0 0 12px rgba(255, 164, 28, 0.3)" : "none" }} 
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Write Review CTA (Normal/Easy UX) */}
            {!editingReview && (
              canReview ? (
                <div className="rounded-[32px] bg-card-2 p-6 border-1.5 border-theme">
                  <h4 className="text-xs font-black uppercase tracking-widest text-theme">Review this product</h4>
                  <p className="mt-2 text-[11px] leading-relaxed text-theme-2">
                    Help the community by sharing your feedback. Verified reviews help others choose better.
                  </p>
                </div>
              ) : (
                <div className="rounded-[32px] bg-card-2 p-6 border-1.5 border-theme text-center">
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-theme-2">
                    Purchase & delivery required to review.
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        <div className="lg:col-span-8 xl:col-span-9 space-y-12">
          {/* Global Media Gallery */}
          {allImages.length > 0 && (
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-theme-2">
                   <ImageIcon size={14} className="text-theme-2" /> Customer Photos
                 </h3>
               </div>
               <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
                 {allImages.map((url, idx) => (
                   <div 
                    key={idx} 
                    className="group relative h-40 w-40 shrink-0 overflow-hidden rounded-[24px] border-2 border-theme bg-card-2 shadow-2xl transition-all hover:scale-[1.03] hover:border-theme-2"
                   >
                     <img src={url} alt="User feedback" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                   </div>
                 ))}
               </div>
            </div>
          )}

          {/* Form Integration */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
             {canReview ? (
               editingReview ? (
                 <div className="relative">
                    <div className="mb-4 flex items-center justify-between px-2">
                      <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-theme-2">
                        <Sparkles size={14} /> Editing Review
                      </span>
                      <button
                        onClick={() => setEditingReview(null)}
                        className="text-[10px] font-black uppercase tracking-widest text-theme-3 hover:text-theme hover:underline"
                      >
                        Cancel Edit
                      </button>
                    </div>
                    <AddReviewForm 
                      productId={productId} 
                      isAuthenticated={true} 
                      onReviewCreated={(r) => { onReviewCreated(r); setEditingReview(null); }}
                      initialReview={editingReview}
                    />
                 </div>
               ) : (
                 <AddReviewForm 
                   productId={productId} 
                   isAuthenticated={!!userId} 
                   onReviewCreated={onReviewCreated} 
                 />
               )
             ) : null}
          </div>

          {/* Feed List */}
          <div className="space-y-6 pt-8">
            <div className="flex items-center gap-4">
              <h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-theme-2">
                <MessageSquare size={14} className="text-theme-2" /> All Reviews
              </h3>
              <div className="h-px flex-1 bg-theme border-b border-theme" />
            </div>

            {reviews.length === 0 ? (
              <div className="group flex flex-col items-center justify-center rounded-[48px] border-2 border-dashed border-theme bg-card/10 py-24 px-8 text-center transition-all hover:bg-theme-2/[0.03] hover:border-theme-2/30">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-card border-2 border-theme shadow-lg group-hover:scale-110 transition-transform">
                  <Sparkles size={24} className="text-theme-2" />
                </div>
                <h3 className="text-xl font-black italic tracking-tighter text-theme">No Reviews Yet</h3>
                <p className="mt-3 max-w-[280px] text-xs font-medium leading-relaxed text-theme-3">
                  Be the <span className="font-black italic text-theme-2">First Reviewer</span> for this item and help the community decide.
                </p>
                <div className="mt-8 inline-flex items-center justify-center rounded-full bg-[#e93a3a] px-6 py-2 shadow-xl shadow-[#e93a3a]/30 transition-transform active:scale-95">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">EARLY ADOPTER BADGE</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {reviews.map((review) => (
                  <ReviewCard 
                    key={review.id} 
                    review={review} 
                    isOwner={review.user_id === userId}
                    onEdit={setEditingReview}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
