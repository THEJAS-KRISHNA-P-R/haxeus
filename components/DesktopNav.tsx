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
            px-4 py-2 rounded-md text-sm font-medium
            ${
              isActive(item.href)
                ? 'text-red-600 dark:text-red-500 font-semibold'
                : 'text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500'
            }
          `}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
