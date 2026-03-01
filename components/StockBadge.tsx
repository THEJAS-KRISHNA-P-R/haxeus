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
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                Sold Out
            </span>
        );
    }

    if (stock <= lowThreshold) {
        return (
            <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${pulse
                        ? "bg-red-600 text-white shadow-lg shadow-red-500/30 scale-105"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
            >
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
                </span>
                Only {stock} left!
            </span>
        );
    }

    return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            ✓ In Stock
        </span>
    );
}
