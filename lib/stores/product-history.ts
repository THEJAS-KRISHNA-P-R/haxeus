import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { Product } from "@/types/supabase"

const MAX_RECENT = 10

interface ProductHistoryState {
  recentlyViewed: Product[]
  addViewed: (product: Product) => void
  clearHistory: () => void
}

export const useProductHistory = create<ProductHistoryState>()(
  persist(
    (set, get) => ({
      recentlyViewed: [],

      addViewed: (product: Product) => {
        const current = get().recentlyViewed
        // Remove if already exists (will re-add at front)
        const filtered = current.filter(p => p.id !== product.id)
        // Add to front, cap at MAX_RECENT
        set({ recentlyViewed: [product, ...filtered].slice(0, MAX_RECENT) })
      },

      clearHistory: () => set({ recentlyViewed: [] }),
    }),
    {
      name: "haxeus-product-history",     // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist what we need — skip functions
      partialize: (state) => ({ recentlyViewed: state.recentlyViewed }),
    }
  )
)
