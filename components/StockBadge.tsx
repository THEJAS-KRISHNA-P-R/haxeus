"use client";
import { useEffect, useState } from "react";

interface Props {
    stock: number;
    lowThreshold?: number;
}

export function StockBadge({ stock, lowThreshold = 5 }: Props) {
    const [pulse, setPulse] = useState(false);

    useEffect(() => {
        if (stock > 0 && stock <= lowThreshold) {
            const interval = setInterval(() => setPulse((p) => !p), 2000);
            return () => clearInterval(interval);
        }
    }, [stock, lowThreshold]);

    if (stock <= 0) {
        return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#1a1a1a] text-white/40">
                Sold Out
            </span>
        );
    }

    if (stock <= lowThreshold) {
        return (
            <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${pulse
                        ? "bg-[#e93a3a] text-white shadow-md shadow-[#e93a3a]/30 scale-105"
                        : "bg-[#e93a3a]/10 text-[#e93a3a]"
                    }`}
            >
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e93a3a]" />
                </span>
                Only {stock} left!
            </span>
        );
    }

    return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-green-400 bg-green-900/30">
            ✓ In Stock
        </span>
    );
}
