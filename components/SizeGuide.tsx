"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface SizeGuideMeasurement {
  size: string
  chest: string
  length: string
  shoulder: string
}

const SIZE_GUIDE_ROWS: SizeGuideMeasurement[] = [
  { size: "XS", chest: "98", length: "68", shoulder: "44" },
  { size: "S", chest: "104", length: "70", shoulder: "46" },
  { size: "M", chest: "110", length: "72", shoulder: "48" },
  { size: "L", chest: "116", length: "74", shoulder: "50" },
  { size: "XL", chest: "122", length: "76", shoulder: "52" },
  { size: "XXL", chest: "128", length: "78", shoulder: "54" },
]

const MEASURING_STEPS = [
  "Lay your best-fitting tee flat on a smooth surface.",
  "Measure chest across from armpit to armpit and double it for the full width.",
  "Measure length from the highest shoulder point and shoulder width seam to seam.",
]

export function SizeGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-80"
          style={{ color: "var(--color-foreground-muted)" }}
        >
          Size Guide
        </button>
      </DialogTrigger>
      <DialogContent
        className="max-h-[85vh] max-w-3xl overflow-hidden rounded-[28px] border p-0"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
          color: "var(--color-foreground)",
        }}
      >
        <div className="overflow-y-auto p-5 sm:p-7">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold tracking-tight">Size Guide</DialogTitle>
            <DialogDescription style={{ color: "var(--color-foreground-muted)" }}>
              Relaxed HAXEUS fits measured in centimetres. If you like a roomier streetwear silhouette, size up once.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 overflow-hidden rounded-3xl border" style={{ borderColor: "var(--color-border)" }}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left">
                <thead style={{ background: "var(--color-surface-elevated)" }}>
                  <tr>
                    {["Size", "Chest", "Length", "Shoulder"].map((heading) => (
                      <th key={heading} className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--color-foreground-muted)" }}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SIZE_GUIDE_ROWS.map((row) => (
                    <tr key={row.size} className="border-t" style={{ borderColor: "var(--color-border)" }}>
                      <td className="px-4 py-4 text-sm font-semibold">{row.size}</td>
                      <td className="px-4 py-4 text-sm" style={{ color: "var(--color-foreground-muted)" }}>{row.chest} cm</td>
                      <td className="px-4 py-4 text-sm" style={{ color: "var(--color-foreground-muted)" }}>{row.length} cm</td>
                      <td className="px-4 py-4 text-sm" style={{ color: "var(--color-foreground-muted)" }}>{row.shoulder} cm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border p-5 sm:p-6" style={{ borderColor: "var(--color-border)", background: "var(--color-surface-muted)" }}>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--color-accent-warm)" }}>
              How To Measure
            </h3>
            <ol className="mt-4 space-y-3">
              {MEASURING_STEPS.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: "color-mix(in srgb, var(--color-accent) 18%, transparent)", color: "var(--color-accent)" }}
                  >
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6" style={{ color: "var(--color-foreground-muted)" }}>{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

