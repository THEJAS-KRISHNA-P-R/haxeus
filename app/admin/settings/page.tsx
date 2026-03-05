"use client"
import { useState } from "react"
import { Settings, Store, CreditCard, Truck, Bell } from "lucide-react"

const sections = [
  {
    icon: Store,
    title: "Store Settings",
    description: "Store name, currency, contact email",
    fields: [
      { label: "Store Name", key: "storeName", value: "HAXEUS", type: "text" },
      { label: "Contact Email", key: "contactEmail", value: "admin@haxeus.com", type: "email" },
      { label: "Currency", key: "currency", value: "INR", type: "text" },
    ]
  },
  {
    icon: Truck,
    title: "Shipping Settings",
    description: "Default shipping rates and zones",
    fields: [
      { label: "Free Shipping Above (₹)", key: "freeShippingThreshold", value: "999", type: "number" },
      { label: "Default Shipping Rate (₹)", key: "defaultShipping", value: "79", type: "number" },
    ]
  },
  {
    icon: Bell,
    title: "Notification Settings",
    description: "Email alerts for new orders and low stock",
    fields: [
      { label: "Order Alert Email", key: "orderAlertEmail", value: "admin@haxeus.com", type: "email" },
      { label: "Low Stock Threshold", key: "lowStockThreshold", value: "5", type: "number" },
    ]
  }
]

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-white/40 text-sm mt-1">Configure your store settings</p>
      </div>

      <div className="space-y-4">
        {sections.map(section => (
          <div key={section.title} className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
              <div className="p-2 rounded-lg bg-[#e93a3a]/10">
                <section.icon className="h-4 w-4 text-[#e93a3a]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{section.title}</p>
                <p className="text-xs text-white/40">{section.description}</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {section.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-xs text-white/40 mb-1.5">{field.label}</label>
                  <input
                    type={field.type}
                    defaultValue={field.value}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#e93a3a]/50 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}
        className="mt-6 px-6 py-2.5 bg-[#e93a3a] hover:bg-[#e93a3a]/80 text-white text-sm font-bold rounded-full transition-all"
      >
        {saved ? '✓ Saved' : 'Save Changes'}
      </button>
    </div>
  )
}
