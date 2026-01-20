"use client"

import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import './Shuffle.css';

export interface ShuffleProps {
    text: string;
    className?: string;
    style?: React.CSSProperties;
    shuffleDirection?: 'left' | 'right' | 'up' | 'down';
    duration?: number;
    ease?: string;
    tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
    textAlign?: React.CSSProperties['textAlign'];
    onShuffleComplete?: () => void;
    shuffleTimes?: number;
    animationMode?: 'random' | 'evenodd';
    stagger?: number;
    colorFrom?: string;
    colorTo?: string;
    triggerOnce?: boolean;
    respectReducedMotion?: boolean;
    triggerOnHover?: boolean;
    threshold?: number;
}

const Shuffle: React.FC<ShuffleProps> = ({
    text,
    className = '',
    style = {},
    shuffleDirection = 'right',
    duration = 0.3,
    ease = 'power3.out',
    tag = 'h3',
    textAlign = 'left',
    onShuffleComplete,
    shuffleTimes = 1,
    animationMode = 'evenodd',
    stagger = 0.02,
    triggerOnce = false,
    respectReducedMotion = true,
    triggerOnHover = true,
}) => {
    const ref = useRef<HTMLElement>(null);
    const [isReady, setIsReady] = useState(false);
    const charsRef = useRef<HTMLSpanElement[]>([]);
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (!ref.current) return;
        if (respectReducedMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setIsReady(true);
            return;
        }

        // Split text into characters
        const chars = text.split('').map((char, i) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.className = 'shuffle-char';
            span.style.display = 'inline-block';
            return span;
        });

        // Clear and append characters
        if (ref.current) {
            ref.current.innerHTML = '';
            chars.forEach(char => ref.current?.appendChild(char));
            charsRef.current = chars;
        }

        setIsReady(true);
    }, [text, respectReducedMotion]);

    const playAnimation = () => {
        if (!charsRef.current.length) return;
        if (triggerOnce && hasAnimated.current) return;

        const chars = charsRef.current;
        const rolls = Math.max(1, shuffleTimes);

        // Reset positions
        gsap.set(chars, {
            x: 0,
            y: 0,
            opacity: 1
        });

        if (animationMode === 'evenodd') {
            const odd = chars.filter((_, i) => i % 2 === 1);
            const even = chars.filter((_, i) => i % 2 === 0);

            const timeline = gsap.timeline({
                onComplete: () => {
                    hasAnimated.current = true;
                    onShuffleComplete?.();
                }
            });

            // Animate odd characters
            if (odd.length) {
                timeline.to(odd, {
                    y: shuffleDirection === 'up' || shuffleDirection === 'down' ? -20 : 0,
                    x: shuffleDirection === 'left' || shuffleDirection === 'right' ? (shuffleDirection === 'right' ? 10 : -10) : 0,
                    opacity: 0.3,
                    duration: duration / 2,
                    stagger: stagger,
                    ease: ease,
                }).to(odd, {
                    y: 0,
                    x: 0,
                    opacity: 1,
                    duration: duration / 2,
                    stagger: stagger,
                    ease: ease,
                }, `>-${duration / 4}`);
            }

            // Animate even characters with overlap
            if (even.length) {
                timeline.to(even, {
                    y: shuffleDirection === 'up' || shuffleDirection === 'down' ? -20 : 0,
                    x: shuffleDirection === 'left' || shuffleDirection === 'right' ? (shuffleDirection === 'right' ? 10 : -10) : 0,
                    opacity: 0.3,
                    duration: duration / 2,
                    stagger: stagger,
                    ease: ease,
                }, `<${duration * 0.3}`).to(even, {
                    y: 0,
                    x: 0,
                    opacity: 1,
                    duration: duration / 2,
                    stagger: stagger,
                    ease: ease,
                }, `>-${duration / 4}`);
            }
        } else {
            // Random animation
            gsap.to(chars, {
                y: shuffleDirection === 'up' || shuffleDirection === 'down' ? -20 : 0,
                x: shuffleDirection === 'left' || shuffleDirection === 'right' ? (shuffleDirection === 'right' ? 10 : -10) : 0,
                opacity: 0.3,
                duration: duration / 2,
                stagger: {
                    each: stagger,
                    from: 'random'
                },
                ease: ease,
                onComplete: () => {
                    gsap.to(chars, {
                        y: 0,
                        x: 0,
                        opacity: 1,
                        duration: duration / 2,
                        stagger: {
                            each: stagger,
                            from: 'random'
                        },
                        ease: ease,
                        onComplete: () => {
                            hasAnimated.current = true;
                            onShuffleComplete?.();
                        }
                    });
                }
            });
        }
    };

    useEffect(() => {
        if (!triggerOnHover || !ref.current) return;

        const element = ref.current;
        const handleMouseEnter = () => {
            playAnimation();
        };

        element.addEventListener('mouseenter', handleMouseEnter);

        return () => {
            element.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, [triggerOnHover, text]);

    const Tag = tag as keyof JSX.IntrinsicElements;
    const combinedStyle: React.CSSProperties = {
        textAlign,
        ...style,
    };

    return React.createElement(
        Tag,
        {
            ref: ref as any,
            className: `shuffle-parent ${isReady ? 'is-ready' : ''} ${className}`,
            style: combinedStyle,
        },
        text
    );
};

export default Shuffle;
