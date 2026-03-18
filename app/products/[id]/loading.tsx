export default function ProductLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-[88px] pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-8 lg:gap-12">
        {/* Left - Image Skeleton */}
        <div className="aspect-square rounded-2xl animate-pulse bg-white/[0.04] dark:bg-white/[0.04] bg-black/[0.04]" />
        
        {/* Right - Details Skeleton */}
        <div className="flex flex-col gap-6">
          <div className="space-y-4">
            <div className="h-10 w-3/4 rounded-xl animate-pulse bg-white/[0.04] dark:bg-white/[0.04] bg-black/[0.04]" />
            <div className="h-8 w-1/4 rounded-xl animate-pulse bg-white/[0.04] dark:bg-white/[0.04] bg-black/[0.04]" />
          </div>
          
          <div className="space-y-3 mt-4">
            <div className="h-4 w-12 rounded animate-pulse bg-white/[0.04] dark:bg-white/[0.04] bg-black/[0.04]" />
            <div className="flex gap-2">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-12 h-12 rounded-xl animate-pulse bg-white/[0.04] dark:bg-white/[0.04] bg-black/[0.04]" />
              ))}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <div className="flex-1 h-14 rounded-full animate-pulse bg-white/[0.04] dark:bg-white/[0.04] bg-black/[0.04]" />
            <div className="flex-1 h-14 rounded-full animate-pulse bg-white/[0.04] dark:bg-white/[0.04] bg-black/[0.04]" />
          </div>
          
          <div className="space-y-2 mt-4">
            <div className="h-4 w-full rounded animate-pulse bg-white/[0.04] dark:bg-white/[0.04] bg-black/[0.04]" />
            <div className="h-4 w-5/6 rounded animate-pulse bg-white/[0.04] dark:bg-white/[0.04] bg-black/[0.04]" />
          </div>
        </div>
      </div>
    </div>
  )
}
