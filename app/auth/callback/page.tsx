'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Authentication error:', error);
      // Redirect to error page or show message
      router.push('/auth/error');
    } else if (code) {
      // You can exchange the code for a token here or redirect to the API route that does
      console.log('Auth code received:', code);
      
      // Example: Redirect after handling
      router.push('/dashboard'); // or your landing page
    }
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-lg">
      <p>Signing you in...</p>
    </div>
  );
}
