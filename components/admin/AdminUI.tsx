// Shared theme-aware components for all admin pages
// Import from here in every admin page instead of hardcoding styles

export function AdminCard({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
    return (
        <div
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "1rem", ...style }}
            className={className}
        >
            {children}
        </div>
    )
}

export function AdminPageHeader({ title, subtitle, className = "", style }: { title: string; subtitle?: string; className?: string; style?: React.CSSProperties }) {
    return (
        <div className={`mb-6 ${className}`} style={style}>
            <h1 style={{ color: "var(--text)" }} className="text-2xl font-bold">{title}</h1>
            {subtitle && <p style={{ color: "var(--text-2)" }} className="text-sm mt-1">{subtitle}</p>}
        </div>
    )
}

export function AdminTableHeader({ children, cols, className = "", style }: { children: React.ReactNode; cols: string; className?: string; style?: React.CSSProperties }) {
    return (
        <div
            style={{ borderBottom: "1px solid var(--border)", color: "var(--text-3)", ...style }}
            className={`grid ${cols} gap-4 px-6 py-3 text-xs font-medium uppercase tracking-wider ${className}`}
        >
            {children}
        </div>
    )
}

export function AdminTableRow({ children, cols, className = "", style }: { children: React.ReactNode; cols: string; className?: string; style?: React.CSSProperties }) {
    return (
        <div
            style={{ borderBottom: "1px solid var(--border)", color: "var(--text-2)", ...style }}
            className={`grid ${cols} gap-4 px-6 py-4 text-sm
                  hover:bg-[var(--bg-elevated)] transition-colors ${className}`}
        >
            {children}
        </div>
    )
}

export function AdminStatCard({ label, value, sub, className = "", style }: { label: string; value: string | number; sub?: string; className?: string; style?: React.CSSProperties }) {
    return (
        <div
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "1rem", ...style }}
            className={`p-6 ${className}`}
        >
            <p style={{ color: "var(--text-2)" }} className="text-sm mb-2">{label}</p>
            <p style={{ color: "var(--text)" }} className="text-3xl font-bold">{value}</p>
            {sub && <p style={{ color: "var(--text-3)" }} className="text-xs mt-1">{sub}</p>}
        </div>
    )
}

export function AdminInput({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                borderRadius: "0.5rem",
                padding: "0.5rem 0.75rem",
                fontSize: "0.875rem",
                outline: "none",
                width: "100%",
                ...props.style,
            }}
            onFocus={e => { e.target.style.borderColor = "var(--accent)"; props.onFocus?.(e); }}
            onBlur={e => { e.target.style.borderColor = "var(--border)"; props.onBlur?.(e); }}
        />
    )
}
