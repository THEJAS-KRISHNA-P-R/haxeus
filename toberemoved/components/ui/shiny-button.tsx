"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface ShinyButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export function ShinyButton({ children, onClick, className = "" }: ShinyButtonProps) {
  return (
    <>
      <style>{`
        @property --gradient-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }
        @property --gradient-angle-offset {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }
        @property --gradient-percent {
          syntax: "<percentage>";
          initial-value: 5%;
          inherits: false;
        }
        @property --gradient-shine {
          syntax: "<color>";
          initial-value: white;
          inherits: false;
        }

        .shiny-cta {
          --shiny-cta-bg:               #000000;
          --shiny-cta-bg-subtle:        #0d0d0d;
          --shiny-cta-fg:               #ffffff;
          /* HAXEUS: pink as primary border arc, cyan as subtle */
          --shiny-cta-highlight:        #c23b9a;
          --shiny-cta-highlight-subtle: #01f3f3;
          --animation:                  gradient-angle linear infinite;
          --duration:                   3s;
          --shadow-size:                2px;
          --transition:                 800ms cubic-bezier(0.25, 1, 0.5, 1);

          isolation: isolate;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          outline-offset: 4px;
          padding: 1rem 2.5rem;
          font-size: 0.9375rem;
          line-height: 1.2;
          font-weight: 600;
          letter-spacing: 0.04em;
          border: 1px solid transparent;
          border-radius: 360px;
          color: var(--shiny-cta-fg);
          background:
            linear-gradient(var(--shiny-cta-bg), var(--shiny-cta-bg)) padding-box,
            conic-gradient(
              from calc(var(--gradient-angle) - var(--gradient-angle-offset)),
              transparent,
              var(--shiny-cta-highlight) var(--gradient-percent),
              var(--gradient-shine) calc(var(--gradient-percent) * 2),
              var(--shiny-cta-highlight) calc(var(--gradient-percent) * 3),
              transparent calc(var(--gradient-percent) * 4)
            ) border-box;
          box-shadow: inset 0 0 0 1px var(--shiny-cta-bg-subtle);
          transition: var(--transition), transform 0.2s ease;
          transition-property: --gradient-angle-offset, --gradient-percent, --gradient-shine, transform, box-shadow;
        }

        .shiny-cta:hover {
          transform: scale(1.02);
          box-shadow:
            inset 0 0 0 1px var(--shiny-cta-bg-subtle),
            0 0 32px rgba(194, 59, 154, 0.3),
            0 0 64px rgba(1, 243, 243, 0.1);
        }

        .shiny-cta:active { translate: 0 1px; transform: scale(0.99); }

        /* Dot pattern overlay */
        .shiny-cta::before,
        .shiny-cta::after,
        .shiny-cta span::before {
          content: "";
          pointer-events: none;
          position: absolute;
          inset-inline-start: 50%;
          inset-block-start: 50%;
          translate: -50% -50%;
          z-index: -1;
        }

        .shiny-cta::before {
          --size: calc(100% - var(--shadow-size) * 3);
          --position: 2px;
          --space: calc(var(--position) * 2);
          width: var(--size);
          height: var(--size);
          background: radial-gradient(
            circle at var(--position) var(--position),
            rgba(1, 243, 243, 0.35) calc(var(--position) / 4),
            transparent 0
          ) padding-box;
          background-size: var(--space) var(--space);
          background-repeat: space;
          mask-image: conic-gradient(
            from calc(var(--gradient-angle) + 45deg),
            black,
            transparent 10% 90%,
            black
          );
          border-radius: inherit;
          opacity: 0.5;
          z-index: -1;
        }

        .shiny-cta::after {
          --animation: shimmer-haxeus linear infinite;
          width: 100%;
          aspect-ratio: 1;
          background: linear-gradient(
            -50deg,
            transparent,
            var(--shiny-cta-highlight),
            transparent
          );
          mask-image: radial-gradient(circle at bottom, transparent 40%, black);
          opacity: 0.6;
        }

        .shiny-cta span { z-index: 1; }

        .shiny-cta span::before {
          --size: calc(100% + 1rem);
          width: var(--size);
          height: var(--size);
          box-shadow: inset 0 -1ex 2rem 4px var(--shiny-cta-highlight);
          opacity: 0;
          transition: opacity var(--transition);
          animation: calc(var(--duration) * 1.5) breathe-haxeus linear infinite;
        }

        .shiny-cta,
        .shiny-cta::before,
        .shiny-cta::after {
          animation:
            var(--animation) var(--duration),
            var(--animation) calc(var(--duration) / 0.4) reverse paused;
          animation-composition: add;
        }

        .shiny-cta:is(:hover, :focus-visible) {
          --gradient-percent: 20%;
          --gradient-angle-offset: 95deg;
          --gradient-shine: var(--shiny-cta-highlight-subtle);
        }

        .shiny-cta:is(:hover, :focus-visible),
        .shiny-cta:is(:hover, :focus-visible)::before,
        .shiny-cta:is(:hover, :focus-visible)::after {
          animation-play-state: running;
        }

        .shiny-cta:is(:hover, :focus-visible) span::before { opacity: 1; }

        @keyframes gradient-angle { to { --gradient-angle: 360deg; } }
        @keyframes shimmer-haxeus { to { rotate: 360deg; } }
        @keyframes breathe-haxeus {
          from, to { scale: 1; }
          50% { scale: 1.2; }
        }
      `}</style>

      <button className={cn("shiny-cta", className)} onClick={onClick}>
        <span>{children}</span>
      </button>
    </>
  )
}
