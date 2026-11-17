import type React from 'react'
import { useState } from 'react'
import { motion, type Transition } from 'motion/react'
import './LiquidGlassCard.css'

export interface LiquidGlassCardProps {
  children: React.ReactNode
  className?: string
  draggable?: boolean
  expandable?: boolean
  width?: string
  height?: string
  expandedWidth?: string
  expandedHeight?: string
  blurIntensity?: 'sm' | 'md' | 'lg' | 'xl'
  shadowIntensity?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  borderRadius?: string
  glowIntensity?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  tone?: 'light' | 'dark' | 'mint' | 'clear'
  style?: React.CSSProperties
}

const SHADOW_STYLES: Record<NonNullable<LiquidGlassCardProps['shadowIntensity']>, string> = {
  none: 'inset 0 0 0 0 rgba(255, 255, 255, 0)',
  xs: 'inset 1px 1px 1px 0 rgba(255, 255, 255, 0.35), inset -1px -1px 1px 0 rgba(255, 255, 255, 0.25)',
  sm: 'inset 2px 2px 2px 0 rgba(255, 255, 255, 0.45), inset -2px -2px 2px 0 rgba(255, 255, 255, 0.3)',
  md: 'inset 3px 3px 3px 0 rgba(255, 255, 255, 0.55), inset -3px -3px 3px 0 rgba(255, 255, 255, 0.35)',
  lg: 'inset 4px 4px 4px 0 rgba(255, 255, 255, 0.6), inset -4px -4px 4px 0 rgba(255, 255, 255, 0.4)',
  xl: 'inset 6px 6px 6px 0 rgba(255, 255, 255, 0.65), inset -6px -6px 6px 0 rgba(255, 255, 255, 0.45)',
  '2xl': 'inset 8px 8px 8px 0 rgba(255, 255, 255, 0.7), inset -8px -8px 8px 0 rgba(255, 255, 255, 0.5)',
}

const GLOW_STYLES: Record<NonNullable<LiquidGlassCardProps['glowIntensity']>, string> = {
  none: 'none',
  xs: 'inset 0 0 12px rgba(255, 255, 255, 0.14)',
  sm: 'inset 0 0 18px rgba(255, 255, 255, 0.22)',
  md: 'inset 0 0 24px rgba(255, 255, 255, 0.28)',
  lg: 'inset 0 0 32px rgba(255, 255, 255, 0.34)',
  xl: 'inset 0 0 40px rgba(255, 255, 255, 0.4)',
  '2xl': 'inset 0 0 48px rgba(255, 255, 255, 0.48)',
}

export function LiquidGlassFilter() {
  return (
    <svg className="lg-svg-filter" aria-hidden="true">
      <defs>
        <filter
          id="lg-glass-blur"
          x="0"
          y="0"
          width="100%"
          height="100%"
          filterUnits="objectBoundingBox"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.003 0.007"
            numOctaves={1}
            result="turbulence"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="turbulence"
            scale={160}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  )
}

export function LiquidGlassCard({
  children,
  className = '',
  draggable = false,
  expandable = false,
  width,
  height,
  expandedWidth,
  expandedHeight,
  blurIntensity = 'xl',
  borderRadius = '28px',
  glowIntensity = 'sm',
  shadowIntensity = 'md',
  tone = 'light',
  style,
}: LiquidGlassCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleToggleExpansion = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!expandable) return
    const target = e.target as HTMLElement | null
    if (target?.closest('a, button, input, select, textarea')) return
    setIsExpanded((prev) => !prev)
  }

  const expandTransition: Transition = {
    duration: 0.4,
    ease: [0.5, 1.5, 0.5, 1],
  }

  const classes = [
    'lg-card',
    draggable ? 'is-draggable' : '',
    expandable ? 'is-expandable' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const cardStyle: React.CSSProperties = {
    borderRadius,
    ...(width && !expandable ? { width } : {}),
    ...(height && !expandable ? { height } : {}),
    ...style,
  }

  const layers = (
    <>
      <div
        className={`lg-layer-bend blur-${blurIntensity} tone-${tone}`}
        style={{ borderRadius }}
        aria-hidden="true"
      />
      <div
        className="lg-layer-face"
        style={{ borderRadius, boxShadow: GLOW_STYLES[glowIntensity] }} /* taste-skill-ignore */
        aria-hidden="true"
      />
      <div
        className="lg-layer-edge"
        style={{ borderRadius, boxShadow: SHADOW_STYLES[shadowIntensity] }} /* taste-skill-ignore */
        aria-hidden="true"
      />
      <div className="lg-content">{children}</div>
    </>
  )

  if (draggable || expandable) {
    return (
      <motion.div
        className={classes}
        style={cardStyle}
        animate={
          expandable
            ? {
                width: isExpanded ? expandedWidth || 'auto' : width || 'auto',
                height: isExpanded ? expandedHeight || 'auto' : height || 'auto',
                transition: expandTransition,
              }
            : undefined
        }
        onClick={expandable ? handleToggleExpansion : undefined}
        drag={draggable}
        dragConstraints={draggable ? { left: 0, right: 0, top: 0, bottom: 0 } : undefined}
        dragElastic={draggable ? 0.25 : undefined}
        dragTransition={
          draggable
            ? {
                bounceStiffness: 300,
                bounceDamping: 14,
                power: 0.3,
              }
            : undefined
        }
        whileDrag={draggable ? { scale: 1.02 } : undefined}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {layers}
      </motion.div>
    )
  }

  return (
    <div className={classes} style={cardStyle}>
      {layers}
    </div>
  )
}

export default LiquidGlassCard
