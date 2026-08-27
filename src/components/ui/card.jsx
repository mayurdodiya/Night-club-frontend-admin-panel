import { cn } from '@/lib/utils'

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-lg border border-zinc-800 bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-fuchsia-600/40 hover:shadow-glow',
        className,
      )}
      {...props}
    />
  )
}
export function CardHeader({ className, ...props }) {
  return <div className={cn('border-b border-zinc-800 p-4', className)} {...props} />
}
export function CardTitle({ className, ...props }) {
  return <h3 className={cn('text-base font-semibold text-zinc-100', className)} {...props} />
}
export function CardContent({ className, ...props }) {
  return <div className={cn('p-4', className)} {...props} />
}
