'use client'

import React, { useRef, useState } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'

interface MagneticButtonProps {
    children: React.ReactNode
    className?: string
    strength?: number
}

export function MagneticButton({ children, className = "", strength = 40 }: MagneticButtonProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [isHovered, setIsHovered] = useState(false)

    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const springConfig = { damping: 15, stiffness: 150, mass: 0.1 }
    const springX = useSpring(x, springConfig)
    const springY = useSpring(y, springConfig)

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return
        
        const { clientX, clientY } = e
        const { left, top, width, height } = ref.current.getBoundingClientRect()
        
        const centerX = left + width / 2
        const centerY = top + height / 2
        
        const distanceX = clientX - centerX
        const distanceY = clientY - centerY
        
        x.set(distanceX * (strength / 100))
        y.set(distanceY * (strength / 100))
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
        setIsHovered(false)
    }

    const handleMouseEnter = () => {
        setIsHovered(true)
    }

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative flex items-center justify-center ${className}`}
            style={{ x: springX, y: springY }}
            animate={{
              filter: isHovered ? 'drop-shadow(0 0 8px rgba(255,255,255,0.1))' : 'drop-shadow(0 0 0px rgba(255,255,255,0))'
            }}
        >
            {children}
        </motion.div>
    )
}
