export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white"
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
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            You're Offline
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            No internet connection found. Check your connection and try again.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
          >
            Try Again
          </button>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p className="mb-2">✨ Tip: Some pages might still work offline</p>
            <div className="flex justify-center space-x-4">
              <a href="/" className="text-purple-600 hover:text-purple-700 dark:text-purple-400">
                Home
              </a>
              <a href="/products" className="text-purple-600 hover:text-purple-700 dark:text-purple-400">
                Products
              </a>
              <a href="/cart" className="text-purple-600 hover:text-purple-700 dark:text-purple-400">
                Cart
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            💡 Install our app for a better offline experience and faster access!
          </p>
        </div>
      </div>
    </div>
  )
}
