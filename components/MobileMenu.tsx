"use client"

import { StaggeredMenu } from './StaggeredMenu'
import type { StaggeredMenuItem } from './StaggeredMenu'
import { DarkModeToggle } from '@/contexts/ThemeContext'

interface MobileMenuProps {
  items: StaggeredMenuItem[]
  isDarkMode: boolean
  onMenuOpen?: () => void
  onMenuClose?: () => void
}

export function MobileMenu({ items, isDarkMode, onMenuOpen, onMenuClose }: MobileMenuProps) {
  return (
    <div className="md:hidden fixed top-0 left-0 w-full h-screen pointer-events-none z-50">
      <StaggeredMenu
        position="right"
        items={items}
        displaySocials={false}
        displayItemNumbering={true}
        menuButtonColor={isDarkMode ? "#f3f4f6" : "#111827"}
        openMenuButtonColor={isDarkMode ? "#111827" : "#f3f4f6"}
        changeMenuColorOnOpen={true}
        colors={isDarkMode ? ['#1f2937', '#111827'] : ['#f3f4f6', '#e5e7eb']}
        accentColor="#ef4444"
        onMenuOpen={onMenuOpen}
        onMenuClose={onMenuClose}
      />
      {/* Dark Mode Toggle Overlay - appears when menu is open */}
      <div className="staggered-menu-darkmode-overlay pointer-events-auto">
        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
          <span className="text-sm font-medium">Dark Mode</span>
          <DarkModeToggle />
        </div>
      </div>
    </div>
  )
}
