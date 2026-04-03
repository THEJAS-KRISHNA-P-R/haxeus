// Shared theme-aware components for all admin pages
// Import from here in every admin page instead of hardcoding styles
import { Search, X, Loader2, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function AdminCard({ 
    children, 
    className = "", 
    style,
    glass = true,
    hoverGlow = false
}: { 
    children: React.ReactNode; 
    className?: string; 
    style?: React.CSSProperties;
    glass?: boolean;
    hoverGlow?: boolean;
}) {
    return (
        <div
            style={{ 
                background: glass ? "rgba(var(--bg-rgb), 0.7)" : "var(--bg-card)", 
                backdropFilter: glass ? "blur(24px) saturate(180%)" : "none",
                WebkitBackdropFilter: glass ? "blur(24px) saturate(180%)" : "none",
                border: "1px solid var(--border)", 
                borderRadius: "1.25rem", 
                ...style 
            }}
            className={cn(
                "relative overflow-hidden transition-all duration-300",
                hoverGlow && "hover:border-[var(--accent)]/50 hover:shadow-[0_0_40px_rgba(var(--accent-rgb),0.1)]",
                className
            )}
        >
            {children}
        </div>
    )
}

export function AdminPageHeader({ title, subtitle, className = "", style, actions }: { title: string; subtitle?: string; className?: string; style?: React.CSSProperties; actions?: React.ReactNode }) {
    return (
        <div className={cn("mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6", className)} style={style}>
            <div>
                <h1 style={{ color: "var(--text)" }} className="text-3xl font-black tracking-tight uppercase">{title}</h1>
                {subtitle && <p style={{ color: "var(--text-3)" }} className="text-[11px] font-bold uppercase tracking-[0.2em] mt-1 opacity-70">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
    )
}

export function AdminTableHeader({ children, cols, className = "", style }: { children: React.ReactNode; cols: string; className?: string; style?: React.CSSProperties }) {
    return (
        <div
            style={{ borderBottom: "1px solid var(--border)", color: "var(--text-3)", ...style }}
            className={cn(`hidden md:grid ${cols} gap-4 px-8 py-4 text-[10px] font-black uppercase tracking-[0.15em] opacity-50`, className)}
        >
            {children}
        </div>
    )
}

export function AdminTableRow({ 
    children, 
    cols, 
    className = "", 
    style,
    onClick,
    selected = false
}: { 
    children: React.ReactNode; 
    cols: string; 
    className?: string; 
    style?: React.CSSProperties;
    onClick?: () => void;
    selected?: boolean;
}) {
    return (
        <motion.div
            initial={false}
            whileHover={onClick ? { x: 4, backgroundColor: "rgba(var(--text-rgb), 0.02)" } : {}}
            onClick={onClick}
            style={{ 
                borderBottom: "1px solid var(--border)", 
                color: "var(--text-2)", 
                cursor: onClick ? "pointer" : "default",
                ...style 
            }}
            className={cn(
                `grid ${cols} gap-4 px-8 py-5 text-xs font-medium transition-all duration-200 items-center`,
                selected && "bg-[var(--accent)]/5 border-l-2 border-l-[var(--accent)]",
                className
            )}
        >
            {children}
        </motion.div>
    )
}

export function AdminStatCard({ label, value, sub, className = "", style, icon: Icon, color = "var(--accent)" }: { label: string; value: string | number; sub?: string; className?: string; style?: React.CSSProperties; icon?: LucideIcon; color?: string }) {
    return (
        <AdminCard 
            className={cn("p-6 group", className)} 
            style={style}
            hoverGlow
        >
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div 
                        className="p-3 rounded-xl transition-transform group-hover:scale-110"
                        style={{ background: `${color}15`, color: color }}
                    >
                        {Icon && <Icon size={20} />}
                    </div>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-3)] mb-1 opacity-70">
                    {label}
                </p>
                <p className="text-3xl font-black tracking-tighter text-[var(--text)]">
                    {value}
                </p>
                {sub && (
                    <p className="text-[10px] font-bold text-[var(--text-3)] mt-2 flex items-center gap-1 opacity-60">
                        {sub}
                    </p>
                )}
            </div>
            {Icon && (
                <Icon 
                    className="absolute -right-4 -bottom-4 opacity-[0.03] rotate-12 transition-transform group-hover:scale-125" 
                    size={120} 
                />
            )}
        </AdminCard>
    )
}

export function AdminSearchInput({
    value,
    onChange,
    onClear,
    placeholder = "Search dashboard...",
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
        <div className={cn("relative", className)}>
            <Search
                style={{ color: "var(--text-3)" }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-30"
                size={14}
            />
            <input
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    background: "rgba(var(--bg-rgb), 0.5)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                }}
                className="w-full pl-11 pr-11 py-3 text-xs font-bold rounded-2xl focus:outline-none focus:border-[var(--accent)] transition-all placeholder:opacity-30 tracking-wide"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {loading && <Loader2 size={14} className="animate-spin text-[var(--accent)]" />}
                {value && onClear && (
                    <button
                        onClick={onClear}
                        className="text-[var(--text-3)] hover:text-[var(--text)] transition-colors p-1"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
        </div>
    )
}

export function AdminInput({
    value,
    onChange,
    placeholder = "",
    type = "text",
    icon: Icon,
    className = "",
    label,
    ...props
}: {
    value: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
    icon?: any;
    className?: string;
    label?: string;
    [key: string]: any;
}) {
    return (
        <div className={cn("w-full space-y-1.5", className)}>
            {label && (
                <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-3)] ml-2 opacity-70">
                    {label}
                </label>
            )}
            <div className="relative group/input">
                {Icon && (
                    <Icon
                        size={14}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-3)] group-focus-within/input:text-[var(--accent)] transition-colors opacity-40 group-focus-within/input:opacity-100"
                    />
                )}
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    style={{
                        background: "rgba(var(--bg-rgb), 0.05)",
                        border: "1px solid var(--border)",
                        color: "var(--text)",
                    }}
                    className={cn(
                        "w-full py-3 pr-4 rounded-2xl text-[11px] font-bold outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/10 transition-all placeholder:opacity-30 tracking-tight",
                        Icon ? "pl-11" : "pl-5"
                    )}
                    {...props}
                />
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
    variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "accent";
    icon?: LucideIcon;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    type?: "button" | "submit" | "reset";
    href?: string;
}) {
    const variants = {
        primary: "bg-[var(--text)] text-[var(--bg)] hover:bg-[var(--accent)] hover:text-white shadow-xl hover:shadow-[var(--accent)]/30 active:scale-95",
        secondary: "bg-[var(--bg-elevated)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--text-3)] active:scale-95",
        outline: "bg-transparent border border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]",
        danger: "bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white",
        ghost: "bg-transparent text-[var(--text-3)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]",
        accent: "bg-[var(--accent)] text-white hover:shadow-xl hover:shadow-[var(--accent)]/40 active:scale-95"
    }

    const content = (
        <>
            {loading ? <Loader2 size={14} className="animate-spin" /> : Icon && <Icon size={14} />}
            {children}
        </>
    )

    const baseClass = cn(
        "flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
    )

    if (href) {
        return (
            <a href={href} className={baseClass}>
                {content}
            </a>
        )
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={baseClass}
        >
            {content}
        </button>
    )
}

export function AdminBadge({ 
    children, 
    variant = "neutral", 
    className = "", 
    icon: Icon 
}: { 
    children: React.ReactNode; 
    variant?: "success" | "warning" | "info" | "danger" | "neutral" | "accent" | "preorder";
    className?: string;
    icon?: LucideIcon;
}) {
    const variants = {
        success: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20 shadow-[0_0_12px_rgba(52,211,153,0.1)]",
        warning: "bg-amber-400/10 text-amber-400 border-amber-400/20",
        info: "bg-sky-400/10 text-sky-400 border-sky-400/20",
        danger: "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20",
        neutral: "bg-[var(--bg-elevated)] text-[var(--text-3)] border-[var(--border)]",
        accent: "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20 shadow-[0_0_12px_rgba(233,58,58,0.1)]",
        preorder: "bg-yellow-400/10 text-yellow-500 border-yellow-400/20"
    }

    return (
        <span 
            className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-[0.12em]",
                variants[variant],
                className
            )}
        >
            {Icon && <Icon size={10} />}
            {children}
        </span>
    )
}

export function AdminSelect({
    value,
    onChange,
    options,
    className = "",
    label,
    icon: Icon
}: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
    className?: string;
    label?: string;
    icon?: LucideIcon;
}) {
    return (
        <div className={cn("w-full space-y-1.5", className)}>
            {label && (
                <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-3)] ml-2 opacity-70">
                    {label}
                </label>
            )}
            <div className="relative group/select">
                {Icon && (
                    <Icon
                        size={14}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-3)] group-focus-within/select:text-[var(--accent)] transition-colors opacity-40 group-focus-within/select:opacity-100 z-10"
                    />
                )}
                <select
                    value={value}
                    onChange={onChange}
                    style={{
                        background: "rgba(var(--bg-rgb), 0.05)",
                        border: "1px solid var(--border)",
                        color: "var(--text)",
                    }}
                    className={cn(
                        "w-full py-3 pr-10 appearance-none rounded-2xl text-[11px] font-bold outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/10 transition-all tracking-tight cursor-pointer",
                        Icon ? "pl-11" : "pl-5"
                    )}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value} style={{ background: "var(--bg)", color: "var(--text)" }}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
            </div>
        </div>
    )
}
