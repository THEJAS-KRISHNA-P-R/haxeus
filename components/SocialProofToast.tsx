"use client";
import { useEffect, useState } from "react";

interface Sale {
    name: string;
    city: string;
    product: string;
    timeAgo: string;
}

const MOCK_SALES: Sale[] = [
    { name: "Arjun", city: "Mumbai", product: "HAXEUS Raven Tee", timeAgo: "2 min ago" },
    { name: "Priya", city: "Bangalore", product: "HAXEUS Neon Skull", timeAgo: "5 min ago" },
    { name: "Rahul", city: "Delhi", product: "HAXEUS Abstract", timeAgo: "8 min ago" },
    { name: "Sneha", city: "Pune", product: "HAXEUS Midnight", timeAgo: "12 min ago" },
    { name: "Vikram", city: "Chennai", product: "HAXEUS Cypher", timeAgo: "15 min ago" },
];

export function SocialProofToast() {
    const [current, setCurrent] = useState<Sale | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let index = 0;
        const show = () => {
            setCurrent(MOCK_SALES[index % MOCK_SALES.length]);
            setVisible(true);
            setTimeout(() => setVisible(false), 4000);
            index++;
        };

        // First toast after 8 seconds
        const firstTimeout = setTimeout(show, 8000);
        // Then every 25 seconds
        const interval = setInterval(show, 25000);

        return () => {
            clearTimeout(firstTimeout);
            clearInterval(interval);
        };
    }, []);

    if (!current) return null;

    return (
        <div
            className={`fixed bottom-24 left-6 z-40 max-w-xs bg-[#111] rounded-xl shadow-md shadow-black/10 shadow-black/20 border border-white/[0.04] border-white/[0.06] px-4 py-3 transition-all duration-500 ${visible
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-full opacity-0 pointer-events-none"
                }`}
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#e93a3a]/10 flex items-center justify-center text-lg flex-shrink-0">
                    🛒
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                        {current.name} from {current.city}
                    </p>
                    <p className="text-xs text-white/40 truncate">
                        just bought <span className="font-semibold text-[#e93a3a]">{current.product}</span>
                    </p>
                    <p className="text-xs text-white/30">{current.timeAgo}</p>
                </div>
            </div>
        </div>
    );
}
