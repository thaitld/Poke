import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import './BorderBeam.css'

type BorderBeamProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  lightColor?: string
  lightWidth?: number
  duration?: number
  borderWidth?: number
}

export function BorderBeam({
  children,
  lightColor = '#FAFAFA',
  lightWidth = 200,
  duration = 10,
  borderWidth = 1,
  className = '',
  style,
  ...props
}: BorderBeamProps) {
  const mergedStyle = {
    ...style,
    '--beam-light-color': lightColor,
    '--beam-light-width': `${lightWidth}px`,
    '--beam-duration': `${duration}s`,
    '--beam-border-width': `${borderWidth}px`,
  } as CSSProperties

  return (
    <div {...props} className={`border-beam ${className}`.trim()} style={mergedStyle}>
      <div className="border-beam-effect" aria-hidden="true" />
      <div className="border-beam-effect border-beam-effect-secondary" aria-hidden="true" />
      <div className="border-beam-content">{children}</div>
    </div>
  )
}
