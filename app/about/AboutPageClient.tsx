"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Shirt, 
  Layers, 
  Zap, 
  ChevronRight 
} from 'lucide-react';
import Image from 'next/image';

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" as const } 
  },
};

const differences = [
  {
    icon: Shirt,
    title: "Premium Fabrication",
    desc: "We exclusively use 240gsm-280gsm heavyweight cotton for a luxury drape that lasts years, not months."
  },
  {
    icon: Layers,
    title: "Artistic Depth",
    desc: "Every design is born from a physical canvas. We transform fine art into wearable rebellion."
  },
  {
    icon: Zap,
    title: "No Middlemen",
    desc: "We control the full cycle—from sourcing and dyeing to printing. Rare quality at an honest price."
  }
];

const team = [
  {
    name: "Founder 1",
    role: "Creative Direction",
    image: "/placeholder.svg"
  },
  {
    name: "Founder 2",
    role: "Production & Ops",
    image: "/placeholder.svg"
  }
];

export default function AboutPageClient() {
  return (
    <main className="bg-theme min-h-screen pt-20">
      {/* ───── 1. HERO ───── */}
      <section className="relative h-[80vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="z-10"
        >
          <span className="text-[var(--accent)] font-bold tracking-[0.4em] uppercase text-xs mb-6 block">
            EST. 2026
          </span>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-none italic">
            HAXEUS <span className="text-theme-2">IDENTITY.</span>
          </h1>
          <p className="max-w-xl mx-auto text-lg md:text-xl text-theme-2 font-medium leading-relaxed">
            HAXEUS is a rebellion against mass-produced mediocrity, crafting premium streetwear that serves as a canvas for your personal identity.
          </p>
        </motion.div>

        {/* Decorative Blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--accent)]/10 blur-[120px] rounded-full -z-0" />
      </section>

      {/* ───── 2. ORIGIN STORY ───── */}
      <section className="py-32 px-6 lg:px-8 border-t border-theme">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-5xl font-black italic">The <span className="text-[var(--accent)]">Origin</span> Story</h2>
            <p className="text-theme-2 leading-relaxed text-lg italic">
              [ORIGIN STORY COPY GOES HERE - 200-300 WORDS]
            </p>
            <p className="text-theme-2 leading-relaxed text-lg italic">
              Placeholder content: HAXEUS began in a small studio in India, driven by the frustration of seeing the same generic designs in every mall. We wanted to build something that felt like art, something that didn't compromise on fabric weight or print quality. Our first 240gsm sample changed everything.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="aspect-[4/5] bg-theme-2/10 rounded-3xl border border-theme overflow-hidden flex items-center justify-center relative group"
          >
            <Image 
               src="/placeholder.svg" 
               alt="Origin" 
               fill 
               className="object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-700" 
            />
            <span className="z-10 text-xs font-bold tracking-widest uppercase opacity-40">Brand Archive 001</span>
          </motion.div>
        </div>
      </section>

      {/* ───── 3. WHAT MAKES US DIFFERENT ───── */}
      <section className="py-32 px-6 lg:px-8 bg-black/5 dark:bg-white/5 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6">Built <span className="text-[var(--accent)]">Differently</span></h2>
            <p className="text-theme-2 max-w-xl mx-auto text-lg italic">No compromise. No corners cut. Just the best version of what you wear every day.</p>
          </div>

          <motion.div 
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {differences.map((diff, index) => (
              <motion.div 
                key={index}
                variants={fadeUp}
                className="p-10 rounded-3xl border border-theme bg-theme hover:border-[var(--accent)] transition-all duration-500 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  <diff.icon className="w-7 h-7 text-[var(--accent)]" />
                </div>
                <h3 className="text-2xl font-bold mb-4 italic uppercase">{diff.title}</h3>
                <p className="text-theme-2 leading-relaxed italic">{diff.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───── 4. THE TEAM ───── */}
      <section className="py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-black italic">The <span className="text-[var(--accent)]">Studio.</span></h2>
              <p className="text-theme-2 text-xl italic max-w-md">Our team is small, obsessed, and based out of our Mumbai studio. We don&apos;t just design—we create.</p>
            </div>
            <div className="bg-[var(--accent)] text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em]">
              Coming Soon
            </div>
          </div>

          <motion.div 
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10"
          >
            {team.map((member, i) => (
              <motion.div key={i} variants={fadeUp} className="group cursor-wait">
                <div className="aspect-[16/9] bg-theme-2/10 rounded-3xl overflow-hidden border border-theme mb-6 relative">
                   <div className="absolute inset-0 flex items-center justify-center text-[var(--accent)]/40 font-black text-4xl italic opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
                     HAXEUS STUDIO
                   </div>
                   <Image 
                     src={member.image} 
                     alt={member.name} 
                     fill 
                     className="object-cover grayscale group-hover:opacity-20 transition-all duration-700" 
                   />
                </div>
                <h4 className="text-2xl font-bold italic uppercase mb-1">{member.name}</h4>
                <p className="text-[var(--accent)] text-xs font-black uppercase tracking-widest">{member.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───── 5. CTA ───── */}
      <section className="py-24 px-6 lg:px-8 border-t border-theme">
        <div className="max-w-7xl mx-auto rounded-[4rem] bg-black text-white px-8 py-24 md:py-40 text-center overflow-hidden relative group">
          <motion.div
             initial={{ opacity: 0, y: 40 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="relative z-10 space-y-12"
          >
            <h2 className="text-5xl md:text-[8rem] font-black tracking-tighter italic leading-none">
              OWN YOUR <br />REBELLION.
            </h2>
            <Link href="/products" className="inline-flex items-center gap-4 bg-[var(--accent)] text-white px-12 py-6 rounded-full font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-700 group/btn shadow-2xl shadow-[var(--accent)]/20">
              Shop the current collection
              <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
            </Link>
          </motion.div>

          {/* Background Branding */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25rem] font-black opacity-[0.03] select-none italic pointer-events-none whitespace-nowrap group-hover:scale-110 transition-transform [transition-duration:20s] ease-linear">
            HAXEUS HAXEUS HAXEUS
          </div>
        </div>
      </section>
    </main>
  );
}
