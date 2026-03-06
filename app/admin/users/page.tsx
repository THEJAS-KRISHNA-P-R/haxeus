"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User, Mail, Calendar, Search, X } from "lucide-react";
import {
  AdminCard,
  AdminPageHeader,
  AdminTableHeader,
  AdminTableRow
} from "@/components/admin/AdminUI";
import { cn } from "@/lib/utils";

export default function CustomersPage() {
  const searchParams = useSearchParams();
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("email") || "")

  useEffect(() => {
    async function fetchCustomers() {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at, role')
        .order('created_at', { ascending: false })

      if (!error) {
        setCustomers(data || [])
      }
      setLoading(false)
    }
    fetchCustomers()
  }, [])

  const filteredCustomers = customers.filter(c =>
    (c.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <AdminPageHeader
          title="Customers"
          subtitle={`${customers.length} registered users found in the database.`}
        />
      </div>

      <AdminCard>
        {/* Search Bar */}
        <div
          style={{ borderBottom: "1px solid var(--border)" }}
          className="px-6 py-4"
        >
          <div className="relative max-w-sm">
            <Search
              style={{ color: "var(--text-3)" }}
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
              size={14}
            />
            <input
              placeholder="Search customers by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl focus:outline-none focus:border-[var(--accent)] transition-all placeholder:opacity-30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
        <AdminTableHeader cols="grid-cols-[2fr_2fr_1fr_1fr] px-6 py-4">
          <span>Customer</span>
          <span>Email Address</span>
          <span>Account Role</span>
          <span className="text-right">Joined Date</span>
        </AdminTableHeader>

        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="px-6 py-5 flex items-center justify-between gap-4">
                <div style={{ background: "var(--bg-elevated)" }} className="h-4 w-32 rounded animate-pulse" />
                <div style={{ background: "var(--bg-elevated)" }} className="h-4 w-48 rounded animate-pulse" />
                <div style={{ background: "var(--bg-elevated)" }} className="h-6 w-16 rounded-full animate-pulse" />
                <div style={{ background: "var(--bg-elevated)" }} className="h-4 w-24 rounded animate-pulse" />
              </div>
            ))
          ) : customers.length === 0 ? (
            <div className="text-center py-20 px-6">
              <div
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-3)" }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              >
                <User size={32} className="opacity-20" />
              </div>
              <p style={{ color: "var(--text)" }} className="font-bold text-lg">No customers registered yet</p>
              <p style={{ color: "var(--text-3)" }} className="text-sm mt-1 max-w-[280px] mx-auto">Once users sign up or place orders, they will appear here in this management list.</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-20 px-6">
              <p style={{ color: "var(--text-3)" }} className="text-sm font-medium">No results matching "{searchQuery}"</p>
            </div>
          ) : (
            filteredCustomers.map(c => (
              <AdminTableRow key={c.id} cols="grid-cols-[2fr_2fr_1fr_1fr]" className="px-6 py-5 items-center">
                <div className="flex items-center gap-3">
                  <div
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--accent)" }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs"
                  >
                    {(c.full_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span style={{ color: "var(--text)" }} className="font-bold text-sm">{c.full_name || 'Unknown User'}</span>
                </div>
                <div style={{ color: "var(--text-3)" }} className="text-sm font-medium">{c.email}</div>
                <div>
                  <span
                    className={cn(
                      "inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border",
                      c.role === 'admin' ? "text-[var(--accent)]" : "text-[var(--text-3)]"
                    )}
                    style={{
                      background: c.role === 'admin'
                        ? "color-mix(in srgb, var(--accent) 10%, transparent)"
                        : "var(--bg-elevated)",
                      borderColor: c.role === 'admin'
                        ? "color-mix(in srgb, var(--accent) 20%, transparent)"
                        : "var(--border)"
                    }}
                  >
                    {c.role || 'customer'}
                  </span>
                </div>
                <div style={{ color: "var(--text-2)" }} className="text-sm font-bold tabular-nums text-right">
                  {new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </AdminTableRow>
            ))
          )}
        </div>
      </AdminCard>
    </div>
  )
}
