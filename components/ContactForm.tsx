"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  CheckCircle2, 
  Instagram, 
  MessageCircle, 
  ArrowRight,
  Hash
} from "lucide-react";
import { isValidEmail } from "@/lib/validation";

export default function ContactForm() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        order_number: "",
        message: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!isValidEmail(formData.email)) {
            setErrorMessage("Please enter a valid email address.");
            setStatus("error");
            return;
        }

        setStatus("loading");

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setStatus("success");
            } else {
                setStatus("error");
            }
        } catch (err) {
            setStatus("error");
        }
    };

    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* ───── LEFT: BRAND SUPPORT ───── */}
            <div className="space-y-12">
                <header className="space-y-6">
                    <span className="text-[var(--accent)] font-bold tracking-[0.4em] uppercase text-xs block">
                        Direct Support
                    </span>
                    <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter leading-none text-theme">
                        GET IN <span className="text-[var(--accent)]">TOUCH.</span>
                    </h1>
                    <p className="text-theme-2 text-xl italic leading-relaxed max-w-md">
                        Whether it&apos;s about an order, a collaboration, or just a shoutout—we&apos;re here.
                    </p>
                </header>

                <div className="space-y-8">
                    {/* WhatsApp CTA */}
                    <a 
                        href="https://wa.me/919999999999" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between p-8 rounded-3xl border border-theme bg-emerald-500/5 hover:bg-emerald-500/10 transition-all duration-500 hover:border-emerald-500/30"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <MessageCircle className="w-7 h-7" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-widest opacity-60 text-theme-2">Fastest Response</p>
                                <h3 className="text-2xl font-bold italic text-theme">WhatsApp Support</h3>
                            </div>
                        </div>
                        <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-emerald-500" />
                    </a>

                    {/* Instagram CTA */}
                    <a 
                        href="https://instagram.com/haxeuz.in" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between p-8 rounded-3xl border border-theme bg-[#f00078]/5 hover:bg-[#f00078]/10 transition-all duration-500 hover:border-[#f00078]/30"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-[#f00078]/10 flex items-center justify-center text-[#f00078]">
                                <Instagram className="w-7 h-7" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-widest opacity-60 text-theme-2">Direct Message</p>
                                <h3 className="text-2xl font-bold italic text-theme">Instagram DM</h3>
                            </div>
                        </div>
                        <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-[#f00078]" />
                    </a>
                </div>

                <div className="pt-8 grid grid-cols-2 gap-8 text-xs font-black uppercase tracking-widest text-theme-2">
                    <div className="space-y-2">
                        <p className="opacity-40">Email</p>
                        <p className="text-[var(--accent)] font-bold">haxeus.in@gmail.com</p>
                    </div>
                    <div className="space-y-2">
                        <p className="opacity-40">Studio</p>
                        <p className="text-theme font-bold">Mumbai, India</p>
                    </div>
                </div>
            </div>

            {/* ───── RIGHT: CONTACT FORM ───── */}
            <div className="relative">
                <AnimatePresence mode="wait">
                    {status === "success" ? (
                        <motion.div 
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 rounded-[3rem] border border-[var(--accent)]/30 bg-[var(--accent)]/5"
                        >
                            <div className="w-24 h-24 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] mb-8">
                                <CheckCircle2 className="w-12 h-12" />
                            </div>
                            <h2 className="text-5xl font-black italic mb-6 text-theme">SENT.</h2>
                            <p className="text-theme-2 text-xl italic mb-10 max-w-sm mx-auto">
                                Message received. Our team is already on it—expect a response within 24 hours.
                            </p>
                            <button 
                                onClick={() => setStatus("idle")}
                                className="px-10 py-4 border border-theme rounded-full text-xs font-black uppercase tracking-widest hover:border-[var(--accent)] transition-colors text-theme"
                            >
                                Send another
                            </button>
                        </motion.div>
                    ) : (
                        <motion.form 
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-theme-2 ml-4">Full Name</label>
                                    <input 
                                        required
                                        type="text" 
                                        className="w-full bg-theme-2/5 border border-theme focus:border-[var(--accent)]/60 rounded-3xl px-6 py-4 outline-none transition-colors italic font-medium text-theme"
                                        placeholder="Aaryan Sharma"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-theme-2 ml-4">Email Address</label>
                                    <input 
                                        required
                                        type="email" 
                                        className="w-full bg-theme-2/5 border border-theme focus:border-[var(--accent)]/60 rounded-3xl px-6 py-4 outline-none transition-colors italic font-medium text-theme"
                                        placeholder="aaryan@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-theme-2 ml-4">Order Number (Optional)</label>
                                <div className="relative">
                                    <Hash className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-2 opacity-40" />
                                    <input 
                                        type="text" 
                                        className="w-full bg-theme-2/5 border border-theme focus:border-[var(--accent)]/60 rounded-3xl pl-14 pr-6 py-4 outline-none transition-colors italic font-medium uppercase placeholder:normal-case text-theme"
                                        placeholder="HXS-12345"
                                        value={formData.order_number}
                                        onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-theme-2 ml-4">Your Message</label>
                                <textarea 
                                    required
                                    rows={6}
                                    className="w-full bg-theme-2/5 border border-theme focus:border-[var(--accent)]/60 rounded-[2rem] px-6 py-6 outline-none transition-colors italic font-medium resize-none text-theme"
                                    placeholder="Tell us what's on your mind..."
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>

                            <button 
                                disabled={status === "loading"}
                                type="submit"
                                className="w-full bg-theme-2 text-theme flex items-center justify-center gap-4 py-6 rounded-full font-black uppercase tracking-[0.2em] hover:bg-[var(--accent)] hover:text-white transition-all duration-500 disabled:opacity-50 group"
                            >
                                {status === "loading" ? "SENDING..." : (
                                    <>
                                        DISPATCH MESSAGE
                                        <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            {status === "error" && (
                                <p className="text-center text-red-500 text-xs font-black uppercase tracking-widest mt-4 font-bold">
                                    {errorMessage || "Failed to send. Please check your connection."}
                                </p>
                            )}
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
