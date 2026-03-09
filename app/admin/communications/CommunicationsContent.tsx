"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Download, Mail, Users, BarChart3, MessageSquare, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    AdminCard,
    AdminPageHeader,
    AdminTableHeader,
    AdminTableRow,
    AdminButton
} from "@/components/admin/AdminUI";
import { useToast } from "@/hooks/use-toast";

type Tab = "messages" | "newsletter" | "overview";

export default function CommunicationsContent() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<Tab>("messages");
    const [loading, setLoading] = useState(true);

    const [messages, setMessages] = useState<any[]>([]);
    const [subscribers, setSubscribers] = useState<any[]>([]);

    const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
    const [noteInput, setNoteInput] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [msgsRes, subsRes] = await Promise.all([
                supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
                supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false })
            ]);

            if (msgsRes.error) throw msgsRes.error;
            if (subsRes.error && subsRes.error.code !== '42P01') {
                // Ignore missing table error if newsletter isn't fully migrated yet
                console.warn(subsRes.error);
            }

            setMessages(msgsRes.data || []);
            setSubscribers(subsRes.data || []);
        } catch (error) {
            console.error("Error loading communications:", error);
        } finally {
            setLoading(false);
        }
    }

    async function markAsRead(id: string) {
        try {
            const { error } = await supabase
                .from("contact_messages")
                .update({ status: "read" })
                .eq("id", id);

            if (error) throw error;

            setMessages(prev => prev.map(m => m.id === id ? { ...m, status: "read" } : m));
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    }

    async function saveNote(id: string) {
        try {
            const { error } = await supabase
                .from("contact_messages")
                .update({ admin_notes: noteInput })
                .eq("id", id);

            if (error) throw error;

            setMessages(prev => prev.map(m => m.id === id ? { ...m, admin_notes: noteInput } : m));
            setNoteInput("");
            setExpandedMessage(null);
            toast({ title: "Note saved", description: "Admin note updated successfully." });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    }

    function exportSubscribers() {
        if (!subscribers.length) return;
        const cols = ["Email", "Subscribed", "Source", "Date Joined"];
        const rows = subscribers.map((s) => [
            s.email,
            s.is_subscribed ? "Yes" : "No",
            s.source || "website",
            new Date(s.created_at).toLocaleDateString("en-IN")
        ]);
        const csv = [cols, ...rows].map((r) => r.join(",")).join("\n");
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        a.download = "newsletter_subscribers.csv";
        a.click();
    }

    const unreadCount = messages.filter(m => m.status === "unread").length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <AdminPageHeader
                    title="Communications"
                    subtitle="Manage contact messages and newsletter subscribers."
                />
            </div>

            {/* Tabs */}
            <div
                style={{
                    background: "rgba(0,0,0,0.025)",
                    border: "1px solid var(--border)",
                }}
                className="flex gap-1 p-1 rounded-full w-fit mb-6"
            >
                <button
                    onClick={() => setActiveTab("messages")}
                    className={cn(
                        "px-6 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.05em] transition-all duration-200 flex items-center gap-1.5",
                        activeTab === "messages"
                            ? "bg-[var(--text)] text-[var(--bg)] shadow-lg"
                            : "text-[var(--text-3)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]"
                    )}
                >
                    <Mail size={12} />
                    Messages
                    {unreadCount > 0 && (
                        <span className="ml-[2px] bg-red-500 text-white text-[9px] px-1.5 py-0 leading-tight rounded-full inline-block">
                            {unreadCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("newsletter")}
                    className={cn(
                        "px-6 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.05em] transition-all duration-200 flex items-center gap-1.5",
                        activeTab === "newsletter"
                            ? "bg-[var(--text)] text-[var(--bg)] shadow-lg"
                            : "text-[var(--text-3)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]"
                    )}
                >
                    <Users size={12} />
                    Newsletter
                </button>
                <button
                    onClick={() => setActiveTab("overview")}
                    className={cn(
                        "px-6 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.05em] transition-all duration-200 flex items-center gap-1.5",
                        activeTab === "overview"
                            ? "bg-[var(--text)] text-[var(--bg)] shadow-lg"
                            : "text-[var(--text-3)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]"
                    )}
                >
                    <BarChart3 size={12} />
                    Overview
                </button>
            </div>

            <AdminCard>
                {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center gap-4">
                        <div
                            style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }}
                            className="w-8 h-8 rounded-full border-2 animate-spin"
                        />
                        <p className="text-theme-3 text-[10px] font-bold uppercase tracking-widest">Loading data...</p>
                    </div>
                ) : (
                    <>
                        {/* MESSAGES TAB */}
                        {activeTab === "messages" && (
                            <div className="overflow-x-auto min-h-[400px]">
                                <AdminTableHeader cols="grid-cols-[2fr_1.5fr_1.5fr_1fr] !py-4">
                                    <div>Sender</div>
                                    <div>Subject</div>
                                    <div>Date</div>
                                    <div className="text-right">Action</div>
                                </AdminTableHeader>

                                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                                    {messages.length === 0 ? (
                                        <div className="px-6 py-16 text-center text-theme-3 text-sm font-medium">
                                            No messages found.
                                        </div>
                                    ) : (
                                        messages.map((msg, i) => (
                                            <div key={msg.id} className="flex flex-col">
                                                <motion.div
                                                    initial={{ opacity: 0, x: -4 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.02 }}
                                                    onClick={() => setExpandedMessage(expandedMessage === msg.id ? null : msg.id)}
                                                    className="cursor-pointer hover:bg-white/[0.02] transition-colors"
                                                >
                                                    <AdminTableRow cols="grid-cols-[2fr_1.5fr_1.5fr_1fr]" className="items-center py-4 bg-transparent border-0 pointer-events-none">
                                                        <div className="flex items-center gap-3">
                                                            {msg.status === "unread" ? (
                                                                <Circle size={10} className="fill-red-500 text-red-500 shrink-0" />
                                                            ) : (
                                                                <CheckCircle2 size={12} className="text-theme-3 shrink-0" />
                                                            )}
                                                            <div className="min-w-0">
                                                                <div className="font-bold text-sm text-theme truncate">{msg.name}</div>
                                                                <div className="text-xs text-theme-3 truncate">{msg.email}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-sm text-theme-2 truncate pr-4">
                                                            {msg.subject || "(No Subject)"}
                                                        </div>
                                                        <div className="text-xs font-medium text-theme-2">
                                                            {new Date(msg.created_at).toLocaleString("en-IN", {
                                                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </div>
                                                        <div className="text-right flex items-center justify-end gap-2">
                                                            {msg.status === "unread" && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); markAsRead(msg.id) }}
                                                                    className="text-[10px] uppercase font-bold tracking-wider text-theme-2 hover:text-[var(--accent)] border border-theme px-2 py-1 rounded pointer-events-auto"
                                                                >
                                                                    Mark Read
                                                                </button>
                                                            )}
                                                            <button
                                                                className="text-theme-3 hover:text-theme p-1 pointer-events-auto"
                                                                onClick={(e) => { e.stopPropagation(); setExpandedMessage(expandedMessage === msg.id ? null : msg.id); }}
                                                            >
                                                                {expandedMessage === msg.id ? 'Close' : 'View'}
                                                            </button>
                                                        </div>
                                                    </AdminTableRow>
                                                </motion.div>

                                                {/* Expanded Message View */}
                                                {expandedMessage === msg.id && (
                                                    <div className="p-6 bg-[var(--bg-elevated)]/60 border-t border-[var(--border)] flex gap-8">
                                                        <div className="flex-1 space-y-4">
                                                            <div>
                                                                <h4 className="text-xs uppercase text-theme-3 font-bold tracking-widest mb-2">Message Content</h4>
                                                                <p className="text-theme text-xs leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                                            </div>
                                                        </div>
                                                        <div className="w-1/3 border-l border-theme pl-8 space-y-4">
                                                            <h4 className="text-xs uppercase text-theme-3 font-bold tracking-widest mb-2">Admin Notes</h4>
                                                            <textarea
                                                                className="w-full bg-transparent border border-theme rounded-lg p-3 text-xs text-theme focus:outline-none focus:border-[var(--accent)] min-h-[100px]"
                                                                placeholder="Add private notes here..."
                                                                defaultValue={msg.admin_notes || ""}
                                                                onChange={(e) => setNoteInput(e.target.value)}
                                                            />
                                                            <AdminButton onClick={() => saveNote(msg.id)} className="w-full py-2 text-sm">
                                                                Save Note
                                                            </AdminButton>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* NEWSLETTER TAB */}
                        {activeTab === "newsletter" && (
                            <div className="overflow-x-auto min-h-[400px]">
                                <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-elevated)]/40">
                                    <div className="text-sm text-theme-2">
                                        Total Subscribers: <span className="text-theme font-bold ml-1">{subscribers.length}</span>
                                    </div>
                                    <AdminButton onClick={exportSubscribers} variant="outline" icon={Download} className="text-sm py-1.5 px-3">
                                        Export CSV
                                    </AdminButton>
                                </div>
                                <AdminTableHeader cols="grid-cols-[2fr_1fr_1fr_1fr] !py-4">
                                    <div>Email</div>
                                    <div>Status</div>
                                    <div>Source</div>
                                    <div>Date Joined</div>
                                </AdminTableHeader>

                                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                                    {subscribers.length === 0 ? (
                                        <div className="px-6 py-16 text-center text-theme-3 text-sm font-medium">
                                            No subscribers found.
                                        </div>
                                    ) : (
                                        subscribers.map((sub, i) => (
                                            <motion.div
                                                key={sub.id}
                                                initial={{ opacity: 0, x: -4 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.02 }}
                                            >
                                                <AdminTableRow cols="grid-cols-[2fr_1fr_1fr_1fr]" className="items-center py-4">
                                                    <div className="font-bold text-sm text-theme">{sub.email}</div>
                                                    <div>
                                                        <span className={cn("px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider", sub.is_subscribed ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500")}>
                                                            {sub.is_subscribed ? "Subscribed" : "Unsubscribed"}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-theme-3 uppercase tracking-wider">{sub.source || "Website"}</div>
                                                    <div className="text-xs font-medium text-theme-2">
                                                        {new Date(sub.created_at).toLocaleDateString("en-IN")}
                                                    </div>
                                                </AdminTableRow>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* OVERVIEW TAB */}
                        {activeTab === "overview" && (
                            <div className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="p-4 rounded-xl border border-theme bg-card hover:border-[var(--accent)] transition-colors flex items-center gap-4">
                                        <div className="p-2.5 rounded-full bg-blue-500/10 text-blue-500 shrink-0">
                                            <MessageSquare size={16} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-theme-3 uppercase tracking-wider mb-0.5">Total Messages</div>
                                            <div className="text-xl font-bold text-theme">{messages.length}</div>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl border border-theme bg-card hover:border-red-500/50 transition-colors flex items-center gap-4">
                                        <div className="p-2.5 rounded-full bg-red-500/10 text-red-500 shrink-0">
                                            <Circle size={16} className="fill-red-500" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-theme-3 uppercase tracking-wider mb-0.5">Unread</div>
                                            <div className="text-xl font-bold text-[var(--text)]">{unreadCount}</div>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl border border-theme bg-card hover:border-[var(--accent)] transition-colors flex items-center gap-4">
                                        <div className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-500 shrink-0">
                                            <Users size={16} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-theme-3 uppercase tracking-wider mb-0.5">Subscribers</div>
                                            <div className="text-xl font-bold text-theme">{subscribers.length}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </AdminCard>
        </div>
    );
}
