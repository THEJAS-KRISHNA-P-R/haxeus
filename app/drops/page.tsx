import Link from 'next/link';
import { Metadata } from 'next';
import { Zap, ChevronRight } from 'lucide-react';
import { TrustSignals } from '@/components/TrustSignals';
import { DropCountdown } from '@/components/DropCountdown';
import { getActiveDrop } from '@/lib/drops';

export const metadata: Metadata = {
  title: 'Limited Drops | HAXEUS',
  description: 'Exclusive, limited-edition streetwear releases. Own your rebellion once.',
};

export default async function DropsPage() {
  const activeDrop = await getActiveDrop()

  return (
    <main className="bg-theme min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <header className="mb-24 text-center max-w-3xl mx-auto">
          <span className="text-[var(--accent)] font-bold tracking-[0.4em] uppercase text-xs mb-6 block">
            The Drop System
          </span>
          <h1 className="text-5xl md:text-9xl font-black italic tracking-tighter mb-8 leading-none">
            RARE <span className="text-theme-2">IDENTITY.</span>
          </h1>
          <p className="text-theme-2 text-xl italic leading-relaxed">
            We don&apos;t do restocks. Every HAXEUS drop is a finite collection. When it&apos;s gone, it&apos;s gone forever.
          </p>
        </header>

        <section className="py-20 border-y border-theme border-dashed flex flex-col items-center justify-center text-center space-y-10">
          <div className="w-24 h-24 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
            <Zap className="w-10 h-10 fill-current" />
          </div>
          <div className="space-y-4">
             <h2 className="text-4xl font-black italic uppercase">Next Drop Incoming</h2>
             <p className="text-theme-2 font-medium italic opacity-60">Authentication required for early access.</p>
          </div>
          {activeDrop && (
            <div className="w-full max-w-3xl">
              <DropCountdown targetDate={new Date(activeDrop.target_date)} dropName={activeDrop.name} />
            </div>
          )}
          <Link href="/products" className="bg-white text-black px-12 py-6 rounded-full font-black uppercase tracking-widest hover:bg-[var(--accent)] hover:text-white transition-all duration-700 group">
             Shop Available Items
             <ChevronRight className="w-5 h-5 inline-block ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </section>

        <div className="mt-20">
          <TrustSignals />
        </div>
      </div>
    </main>
  );
}
