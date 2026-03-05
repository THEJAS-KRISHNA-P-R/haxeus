"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { User, Mail, Calendar } from "lucide-react"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-white/40 text-sm mt-1">{customers.length} total customers</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
        <div className="grid grid-cols-4 gap-4 px-6 py-3 text-xs font-medium text-white/30 uppercase tracking-wider border-b border-white/[0.06]">
          <span>Customer</span>
          <span>Email</span>
          <span>Role</span>
          <span>Joined</span>
        </div>

        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-14 mx-4 my-2 rounded-lg bg-white/[0.03] animate-pulse" />
          ))
        ) : customers.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <User className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No customers yet</p>
          </div>
        ) : (
          customers.map(c => (
            <div key={c.id} className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors text-sm">
              <span className="text-white font-medium">{c.full_name || 'Unknown'}</span>
              <span className="text-white/50">{c.email}</span>
              <span className={`text-xs px-2 py-1 rounded-full w-fit ${c.role === 'admin' ? 'bg-[#e93a3a]/10 text-[#e93a3a]' : 'bg-white/[0.06] text-white/50'}`}>
                {c.role || 'customer'}
              </span>
              <span className="text-white/40">{new Date(c.created_at).toLocaleDateString('en-IN')}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
