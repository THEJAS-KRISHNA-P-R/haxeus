import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Calendar, User } from 'lucide-react';
import { Metadata } from 'next';
import { getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Journal | HAXEUS',
  description: 'Inside the movement. Perspectives on streetwear, art, and identity.',
};

export default async function JournalListingPage() {
  const posts = await getAllPosts();

  return (
    <main className="bg-theme min-h-screen pt-32 pb-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 md:mb-24">
          <span className="text-[var(--accent)] font-bold tracking-[0.4em] uppercase text-xs mb-4 block">
            The Journal
          </span>
          <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter mb-8 leading-none">
            INSIDE <span className="text-theme-2">HAXEUS.</span>
          </h1>
          <p className="max-w-2xl text-theme-2 text-xl italic leading-relaxed">
            Explorations into the subcultures, technologies, and artistic movements that define our era.
          </p>
        </header>

        {posts.length === 0 ? (
          <div className="py-20 text-center border-t border-theme border-dashed">
            <p className="text-theme-2 text-lg italic opacity-40">No entries in the journal yet. Coming soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {posts.map((post) => (
              <Link 
                key={post.slug} 
                href={`/journal/${post.slug}`}
                className="group block space-y-6"
              >
                <div className="aspect-[16/9] bg-theme-2/10 rounded-3xl overflow-hidden border border-theme relative">
                  <Image 
                    src={post.metadata.coverImage} 
                    alt={post.metadata.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-theme-2">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-[var(--accent)]" />
                      {post.metadata.date}
                    </span>
                    <span className="flex items-center gap-2">
                      <User className="w-3 h-3 text-[var(--accent)]" />
                      {post.metadata.author}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-bold italic group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                    {post.metadata.title}
                  </h2>
                  
                  <p className="text-theme-2 line-clamp-3 leading-relaxed font-medium opacity-80">
                    {post.metadata.description}
                  </p>
                  
                  <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform">
                    Read Analysis <ChevronRight className="w-4 h-4 text-[var(--accent)]" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

