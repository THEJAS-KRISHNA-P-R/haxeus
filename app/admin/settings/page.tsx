"use client";
import { useState } from "react";
import { Settings, Store, CreditCard, Truck, Bell } from "lucide-react";
import {
  AdminCard,
  AdminPageHeader
} from "@/components/admin/AdminUI";
import { cn } from "@/lib/utils";

const sections = [
  {
    icon: Store,
    title: "Store Settings",
    description: "Global store configuration including name, currency, and contact email.",
    fields: [
      { label: "Store Name", key: "storeName", value: "HAXEUS", type: "text" },
      { label: "Contact Email", key: "contactEmail", value: "admin@haxeus.com", type: "email" },
      { label: "Currency Display", key: "currency", value: "INR (₹)", type: "text" },
    ]
  },
  {
    icon: Truck,
    title: "Shipping Logistics",
    description: "Manage your default shipping rates, thresholds, and delivery zones.",
    fields: [
      { label: "Free Shipping Threshold (₹)", key: "freeShippingThreshold", value: "999", type: "number" },
      { label: "Standard Shipping Rate (₹)", key: "defaultShipping", value: "79", type: "number" },
    ]
  },
  {
    icon: Bell,
    title: "System Notifications",
    description: "Configure automated email alerts for orders and inventory management.",
    fields: [
      { label: "Alert Recipient Email", key: "orderAlertEmail", value: "admin@haxeus.com", type: "email" },
      { label: "Low Stock Alert Level", key: "lowStockThreshold", value: "5", type: "number" },
    ]
  }
]

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="mb-2">
        <AdminPageHeader
          title="Settings"
          subtitle="Configure your store's global parameters, shipping, and notifications."
        />
      </div>

      <div className="space-y-5">
        {sections.map(section => (
          <AdminCard key={section.title} className="overflow-hidden">
            <div
              style={{ borderBottom: "1px solid var(--border)" }}
              className="flex items-center gap-4 px-6 py-5 bg-[var(--bg-elevated)]/30"
            >
              <div
                style={{
                  background: "color-mix(in srgb, var(--accent) 10%, transparent)",
                  borderColor: "color-mix(in srgb, var(--accent) 20%, transparent)"
                }}
                className="p-3 rounded-xl border shrink-0"
              >
                <section.icon size={18} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <p style={{ color: "var(--text)" }} className="text-sm font-bold">{section.title}</p>
                <p style={{ color: "var(--text-3)" }} className="text-[10px] font-bold uppercase tracking-wider mt-0.5">{section.description}</p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {section.fields.map(field => (
                <div key={field.key} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <label
                    style={{ color: "var(--text-2)" }}
                    className="text-[11px] font-bold uppercase tracking-widest"
                  >
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    defaultValue={field.value}
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                    }}
                    className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl focus:outline-none focus:border-[var(--accent)] transition-all"
                  />
                </div>
              ))}
            </div>
          </AdminCard>
        ))}
      </div>

      <div className="flex justify-end pt-4 pb-8">
        <button
          onClick={handleSave}
          className={cn(
            "px-8 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-lg",
            saved
              ? "bg-emerald-500 text-white shadow-emerald-500/20"
              : "bg-[var(--accent)] text-white hover:brightness-110 shadow-red-500/20"
          )}
        >
          {saved ? '✓ Changes Saved' : 'Update Settings'}
        </button>
      </div>
    </div>
  )
}
