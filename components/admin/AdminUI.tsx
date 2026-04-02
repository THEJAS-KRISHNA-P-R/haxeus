// Shared theme-aware components for all admin pages
// Import from here in every admin page instead of hardcoding styles

export function AdminCard({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
    return (
        <div
            style={{ 
                background: "var(--bg-card)", 
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid var(--border)", 
                borderRadius: "1rem", 
                ...style 
            }}
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
            style={{ 
                background: "var(--bg-card)", 
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid var(--border)", 
                borderRadius: "1.25rem", 
                ...style 
            }}
            className={`p-6 shadow-sm hover:shadow-md transition-shadow ${className}`}
        >
            <p style={{ color: "var(--text-3)" }} className="text-[10px] uppercase tracking-widest font-bold mb-1">{label}</p>
            <p style={{ color: "var(--text)" }} className="text-3xl font-bold tracking-tight">{value}</p>
            {sub && <p style={{ color: "var(--text-2)" }} className="text-xs mt-2 flex items-center gap-1 font-medium">{sub}</p>}
        </div>
    )
}

import { Search, X, Loader2 } from "lucide-react";

export function AdminSearchInput({
    value,
    onChange,
    onClear,
    placeholder = "Search...",
    loading = false,
    className = ""
}: {
    value: string;
    onChange: (val: string) => void;
    onClear?: () => void;
    placeholder?: string;
    loading?: boolean;
    className?: string;
}) {
    return (
        <div className={`relative ${className}`}>
            <Search
                style={{ color: "var(--text-3)" }}
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                size={14}
            />
            <input
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                }}
                className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl focus:outline-none focus:border-[var(--accent)] transition-all placeholder:opacity-30"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {loading && <Loader2 size={14} className="animate-spin text-[var(--accent)]" />}
                {value && onClear && (
                    <button
                        onClick={onClear}
                        className="text-[var(--text-3)] hover:text-[var(--text)] transition-colors"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
        </div>
    )
}

export function AdminButton({
    children,
    onClick,
    variant = "primary",
    icon: Icon,
    disabled = false,
    loading = false,
    className = "",
    type = "button",
    href
}: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
    icon?: any;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    type?: "button" | "submit" | "reset";
    href?: string;
}) {
    const variants = {
        primary: "bg-[var(--text)] text-[var(--bg)] hover:shadow-xl hover:shadow-[var(--text)]/10 active:scale-95",
        secondary: "bg-[var(--bg-elevated)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--text-3)] active:scale-95",
        outline: "bg-transparent border border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]",
        danger: "bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white",
        ghost: "bg-transparent text-[var(--text-3)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]"
    }

    const content = (
        <>
            {loading ? <Loader2 size={16} className="animate-spin" /> : Icon && <Icon size={16} />}
            {children}
        </>
    )

    if (href) {
        return (
            <a
                href={href}
                className={`
                    flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl 
                    text-[10px] font-bold uppercase tracking-widest transition-all
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${variants[variant]}
                    ${className}
                `}
            >
                {content}
            </a>
        )
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl 
                text-[10px] font-bold uppercase tracking-widest transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
                ${variants[variant]}
                ${className}
            `}
        >
            {content}
        </button>
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
                borderRadius: "0.75rem",
                padding: "0.75rem 1rem",
                fontSize: "0.875rem",
                outline: "none",
                width: "100%",
                ...props.style,
            }}
            className={`focus:border-[var(--accent)] transition-all placeholder:opacity-30 ${props.className || ""}`}
        />
    )
}
