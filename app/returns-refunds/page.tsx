const steps = [
  {
    title: "Raise your replacement request within 10 days",
    body: "Email support@haxeus.in with your order number, item name, size, and a short description of the issue. Include clear photos for damaged, defective, or incorrect items.",
  },
  {
    title: "Wait for approval and next steps",
    body: "Our team checks eligibility, confirms whether the item qualifies for replacement, and shares the return-to-origin or self-shipping instructions where needed.",
  },
  {
    title: "Replacement is dispatched after inspection",
    body: "Once the item reaches us and passes inspection, the replacement is processed and dispatched. If a replacement cannot be fulfilled, our support team will guide you on the next resolution.",
  },
]

const eligibility = [
  "Replacement requests must be raised within 10 days of delivery.",
  "Items must be unworn, unwashed, with tags attached, and in original packaging.",
  "We do not offer returns or refunds for change of mind, sizing preference, or final sale orders.",
  "If you received a damaged, defective, or wrong item, mention it in the first email and attach clear photos.",
]

export default function ReturnsRefundsPage() {
  return (
    <main
      className="min-h-screen px-4 pb-20 pt-[88px] md:px-8"
      style={{ background: "var(--color-background)", color: "var(--color-foreground)" }}
    >
      <div className="mx-auto max-w-4xl">
        <div className="pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: "var(--color-accent-warm)" }}>
            Replacements
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            A simple 10-day replacement policy, built for peace of mind.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7" style={{ color: "var(--color-foreground-muted)" }}>
            If something arrives damaged, defective, or incorrect, we will help you fix it fast. HAXEUS does not offer
            returns or refunds, but eligible items can be replaced within 10 days of delivery after inspection.
          </p>
        </div>

        <section className="mt-8 rounded-[32px] border p-6 sm:p-8" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
          <h2 className="text-xl font-bold tracking-tight">How the process works</h2>
          <div className="mt-5 grid gap-4">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-[24px] border p-5" style={{ borderColor: "var(--color-border)", background: "var(--color-surface-muted)" }}>
                <p className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--color-accent)" }}>
                  Step {index + 1}
                </p>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6" style={{ color: "var(--color-foreground-muted)" }}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[32px] border p-6 sm:p-8" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
            <h2 className="text-xl font-bold tracking-tight">Eligibility</h2>
            <ul className="mt-4 space-y-3">
              {eligibility.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6" style={{ color: "var(--color-foreground-muted)" }}>
                  <span className="mt-2 h-2 w-2 rounded-full" style={{ background: "var(--color-accent)" }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[32px] border p-6 sm:p-8" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
            <h2 className="text-xl font-bold tracking-tight">Contact & timeline</h2>
            <div className="mt-4 space-y-4 text-sm leading-6" style={{ color: "var(--color-foreground-muted)" }}>
              <p>
                Contact us at{" "}
                <a href="mailto:support@haxeus.in" className="font-semibold underline underline-offset-4" style={{ color: "var(--color-accent)" }}>
                  support@haxeus.in
                </a>
                .
              </p>
              <p>Include your order number, full name, and 2-3 clear photos if the issue is size, defect, or damage related.</p>
              <p>Approved replacements are processed after item inspection and usually move to dispatch within 5-7 business days depending on availability.</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

