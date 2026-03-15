import { useState, useId } from 'react'

interface TooltipProps {
  content: string
  children: React.ReactNode
}

export function Tooltip({ content, children }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const tooltipId = useId()

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      <div aria-describedby={visible ? tooltipId : undefined}>
        {children}
      </div>
      {visible && (
        <div
          id={tooltipId}
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-slate-950 px-2 py-1 text-xs text-slate-300 shadow-lg"
        >
          {content}
        </div>
      )}
    </div>
  )
}
