"use client"

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080808] p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-[#e93a3a]/10 border border-[#e93a3a]/20 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-[#e93a3a]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">
            You&apos;re Offline
          </h1>

          <p className="text-white/50 mb-8">
            No internet connection found. Check your connection and try again.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-[#e93a3a] hover:bg-[#e93a3a]/80 text-white rounded-full font-semibold transition-all"
          >
            Try Again
          </button>

          <div className="text-sm text-white/40">
            <p className="mb-2">✨ Tip: Some pages might still work offline</p>
            <div className="flex justify-center space-x-4">
              <a href="/" className="text-[#e7bf04] hover:text-[#e7bf04]/80">Home</a>
              <a href="/products" className="text-[#07e4e1] hover:text-[#07e4e1]/80">Products</a>
              <a href="/cart" className="text-[#c03c9d] hover:text-[#c03c9d]/80">Cart</a>
            </div>
          </div>
        </div>

        <div className="mt-12 p-4 bg-[#111] rounded-2xl border border-white/[0.06]">
          <p className="text-sm text-white/40">
            💡 Install our app for a better offline experience and faster access!
          </p>
        </div>
      </div>
    </div>
  )
}
