"use client"

import { useState } from "react"
import type { ProductReviewViewModel } from "@/types/reviews"
import { ReviewStars } from "@/components/ReviewStars"
import { MoreVertical, Edit2, Trash2, ShieldCheck } from "lucide-react"

interface ReviewCardProps {
  review: ProductReviewViewModel
  isOwner: boolean
  onEdit: (review: ProductReviewViewModel) => void
  onDelete: (id: string) => void
}

export function ReviewCard({ review, isOwner, onEdit, onDelete }: ReviewCardProps) {
  const [showActions, setShowActions] = useState(false)

  // Extract initials for avatar
  const initials = review.authorLabel.substring(0, 2).toUpperCase()

  return (
    <article
      className="group relative overflow-hidden rounded-[32px] p-6 transition-all hover:translate-y-[-2px] bg-card/40 backdrop-blur-md border-1.5 border-theme shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card-2 text-[10px] font-black tracking-tighter text-theme-3">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-theme">{review.authorLabel}</span>
              {review.verified_purchase && (
                <div className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-green-500 border border-green-500/20">
                  <ShieldCheck size={10} />
                  Verified
                </div>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2">
               <ReviewStars value={review.rating} size="sm" />
               <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-theme-3">
                 {new Date(review.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
               </span>
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="relative">
            <button 
              onClick={() => setShowActions(!showActions)}
              className="rounded-full p-2 text-theme-3 transition-colors hover:bg-card-2 hover:text-theme"
            >
              <MoreVertical size={18} />
            </button>
            
            {showActions && (
              <>
                <div 
                   className="fixed inset-0 z-10" 
                   onClick={() => setShowActions(false)} 
                />
                <div className="absolute right-0 top-full z-20 mt-2 min-w-[120px] overflow-hidden rounded-2xl border-1.5 border-theme bg-card p-1 shadow-2xl">
                  <button
                    onClick={() => { onEdit(review); setShowActions(false); }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold transition-colors hover:bg-card-2 text-theme"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => { onDelete(review.id); setShowActions(false); }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-red-500 transition-colors hover:bg-red-500/10"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-black italic tracking-tight text-theme">
           &quot;{review.body}&quot;
        </h3>
        
        {review.image_urls && review.image_urls.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {review.image_urls.map((url, idx) => (
              <div 
                key={idx} 
                className="h-20 w-20 overflow-hidden rounded-xl border-1.5 border-theme transition-transform hover:scale-105 bg-card-2"
              >
                <img src={url} alt="User feedback" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-theme-3">
         <span>Product Review</span>
         <div className="h-px flex-1 bg-theme" />
      </div>
    </article>
  )
}

