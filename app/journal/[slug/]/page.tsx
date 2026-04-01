import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react';
import { Metadata } from 'next';
import { getPostBySlug, getAllPosts } from '@/lib/blog';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  
  if (!post) return { title: 'Post Not Found' };

  return {
    title: `${post.metadata.title} | HAXEUS JOURNAL`,
    description: post.metadata.description,
    openGraph: {
      title: post.metadata.title,
      description: post.metadata.description,
      images: [post.metadata.coverImage],
      type: 'article',
    },
  };
}

export default async function BlogPostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="bg-theme min-h-screen pt-32 pb-40">
      <article className="max-w-4xl mx-auto px-6">
        <Link 
          href="/journal" 
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-theme-2 hover:text-[var(--accent)] transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Journal
        </Link>

        <header className="mb-16 space-y-8">
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

          <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter leading-none">
            {post.metadata.title}
          </h1>

          <p className="text-xl md:text-2xl text-theme-2 italic leading-relaxed font-medium">
            {post.metadata.description}
          </p>
        </header>

        <div className="aspect-[21/10] bg-theme-2/10 rounded-[3rem] overflow-hidden border border-theme mb-20 relative">
          <Image 
            src={post.metadata.coverImage} 
            alt={post.metadata.title} 
            fill 
            className="object-cover" 
            priority
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_80px] gap-12 items-start">
          <div className="prose prose-invert prose-brand max-w-none prose-p:italic prose-p:text-lg prose-p:leading-relaxed prose-headings:italic prose-headings:font-black prose-headings:tracking-tighter">
            {post.content}
          </div>

          <aside className="sticky top-40 flex md:flex-col gap-4">
             <button className="w-12 h-12 rounded-full border border-theme flex items-center justify-center hover:bg-[var(--accent)] hover:text-white transition-all duration-500 group" title="Share via X">
               <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
             </button>
          </aside>
        </div>

        <footer className="mt-40 pt-16 border-t border-theme">
           <div className="flex flex-col md:flex-row justify-between items-center gap-8">
             <div className="space-y-4 text-center md:text-left">
               <h3 className="text-2xl font-black italic uppercase">About the Author</h3>
               <p className="text-theme-2 font-medium italic">HAXEUS Editorial explores the intersection of design, rebellion, and luxury in the modern age.</p>
             </div>
             <Link href="/products" className="bg-[var(--accent)] text-white px-10 py-5 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-[var(--accent)]/20">
               Shop the Vibe
             </Link>
           </div>
        </footer>
      </article>
    </main>
  );
}
