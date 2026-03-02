'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
}

interface DesktopNavProps {
  items: NavItem[];
}

export default function DesktopNav({ items }: DesktopNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <nav className="flex items-center gap-2">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
            ${
              isActive(item.href)
                ? 'text-[#e93a3a] font-semibold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }
          `}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
