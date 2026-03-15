interface CardProps {
  children: React.ReactNode
  title?: string
  className?: string
}

export function Card({ children, title, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-slate-700 bg-slate-800 p-3 ${className}`}
    >
      {title && (
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}
