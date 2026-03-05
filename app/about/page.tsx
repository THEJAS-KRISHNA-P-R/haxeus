"use client";
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Palette, Shirt, Truck, Recycle, Heart, Users, Sparkles, ArrowDown
} from 'lucide-react';

const SparklesCore = dynamic(
  () => import('@/components/ui/sparkles').then(m => m.SparklesCore),
  { ssr: false }
);

const values = [
  {
    icon: Palette,
    title: 'Artist First',
    desc: 'We collaborate with underground artists and pay 30% royalty on every sale. No exceptions.',
  },
  {
    icon: Shirt,
    title: '300gsm Heavyweight',
    desc: 'Premium bio-washed cotton that feels incredible on day 1 and day 100. Pre-shrunk. Built to last.',
  },
  {
    icon: Sparkles,
    title: 'Limited Drops',
    desc: 'Every piece is numbered. Once a drop sells out, it\'s gone forever. No restocks.',
  },
  {
    icon: Truck,
    title: 'Ships in 48h',
    desc: 'Order today, we ship within 48 hours. Pan-India delivery in 5-7 days.',
  },
  {
    icon: Recycle,
    title: 'Conscious Craft',
    desc: 'Eco-friendly inks, plastic-free packaging, and sustainable sourcing wherever possible.',
  },
  {
    icon: Heart,
    title: 'Community Driven',
    desc: 'Built by the people who wear it. Your style shapes our next drop.',
  },
];

const timeline = [
  { year: '2024', event: 'The idea is born — art meets streetwear.' },
  { year: '2025', event: 'First collection drops. First 100 customers.' },
  { year: '2026', event: 'HAXEUS goes live. The movement begins.' },
];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function AboutPage() {
  return (
    <main className="bg-theme text-theme transition-colors duration-300">

      {/* ───── HERO ───── */}
      <section
        className="relative w-full flex flex-col items-center justify-center overflow-hidden"
        style={{ minHeight: '100dvh', paddingTop: '80px' }}
      >
        {/* Sparkles background */}
        <div className="absolute inset-0 w-full h-full bg-theme">
          <SparklesCore
            id="haxeus-about-hero"
            background="transparent"
            minSize={0.4}
            maxSize={1.2}
            particleDensity={60}
            className="w-full h-full"
            particleColor="#e93a3a"
            speed={1}
          />
        </div>

        {/* Radial mask for soft edges */}
        <div className="absolute inset-0 w-full h-full [mask-image:radial-gradient(700px_500px_at_center,transparent_20%,black)]" />

        {/* Content */}
        <div className="relative z-10 text-center px-4">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-sm uppercase tracking-[0.3em] text-[var(--accent)] font-semibold mb-4"
          >
            Our Story
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter select-none bg-gradient-to-b from-theme to-theme-2 bg-clip-text text-transparent"
          >
            HAXEUS
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-4 text-lg text-theme-2 tracking-widest uppercase"
          >
            Art · Identity · Culture
          </motion.p>
        </div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 z-10 text-theme-2 flex flex-col items-center gap-2"
        >
          <span className="text-xs tracking-wider uppercase">Scroll</span>
          <ArrowDown className="w-4 h-4" />
        </motion.div>
      </section>

      {/* ───── BRAND STORY ───── */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="space-y-6"
          >
            <motion.h2
              variants={fadeUp}
              className="text-4xl md:text-5xl font-black leading-tight"
            >
              Born from a <span className="text-[var(--accent)]">rebellion</span> against boring merch.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg text-theme-2 leading-relaxed"
            >
              HAXEUS started with a simple belief: your clothes should say something about you.
              Not a logo someone else chose. Not a trend everyone follows. Something real.
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="text-lg text-theme-2 leading-relaxed"
            >
              We partner with underground artists from across India to create limited-edition drops
              you'll never find in a mall. Every tee is a canvas. Every purchase supports an independent creator.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ───── TIMELINE ───── */}
      <section className="py-20 px-6 lg:px-8 bg-card transition-colors duration-300">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-black mb-12 text-center"
          >
            The Journey
          </motion.h2>
          <div className="relative border-l-2 border-[var(--accent)]/20 ml-4 space-y-12">
            {timeline.map((t, i) => (
              <motion.div
                key={t.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative pl-8"
              >
                <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-[var(--accent)] border-4 border-theme" />
                <span className="text-sm font-bold text-[var(--accent)] uppercase tracking-wider">{t.year}</span>
                <p className="mt-1 text-lg text-theme-2">{t.event}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── VALUES GRID ───── */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-black mb-4 text-center"
          >
            What We Stand For
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-theme-2 mb-14 max-w-xl mx-auto"
          >
            Every decision we make is driven by these principles.
          </motion.p>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {values.map((v) => (
              <motion.div
                key={v.title}
                variants={fadeUp}
                className="group rounded-2xl border border-theme p-8 hover:border-[var(--accent)] hover:shadow-lg hover:shadow-[var(--accent)]/5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center mb-5 group-hover:bg-[var(--accent)]/20 transition-colors">
                  <v.icon className="w-6 h-6 text-[var(--accent)]" />
                </div>
                <h3 className="text-xl font-bold mb-2">{v.title}</h3>
                <p className="text-theme-2 leading-relaxed text-sm">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───── NUMBERS ───── */}
      <section className="py-20 px-6 lg:px-8 bg-card transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: '300gsm', label: 'Premium Cotton' },
              { value: '48h', label: 'Ship Time' },
              { value: '30%', label: 'Artist Royalty' },
              { value: '∞', label: 'Creativity' },
            ].map((s) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-black text-[var(--accent)]">{s.value}</div>
                <div className="text-sm text-theme-2 mt-2 uppercase tracking-widest">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="py-28 px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto space-y-8"
        >
          <h2 className="text-4xl md:text-6xl font-black leading-tight">
            Ready to <span className="text-[var(--accent)]">wear art</span>?
          </h2>
          <p className="text-lg text-theme-2">
            Every drop is limited. Once it's gone, it's gone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="px-10 py-4 bg-red-600 text-white font-bold text-lg rounded-full hover:bg-red-700 transition-colors shadow-lg shadow-red-500/25"
              >
                Shop the Drop
              </motion.button>
            </Link>
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="px-10 py-4 border-2 border-theme text-theme font-bold text-lg rounded-full hover:bg-card transition-colors"
              >
                Get in Touch
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
