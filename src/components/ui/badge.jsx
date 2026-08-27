import { cn } from '@/lib/utils'

const variants = {
  default: 'bg-elevated text-zinc-200',
  success: 'bg-emerald-600/20 text-emerald-400',
  warning: 'bg-amber-600/20 text-amber-400',
  danger: 'bg-red-600/20 text-red-400',
}

export function Badge({ className, variant = 'default', ...props }) {
  return (
    <span
      className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', variants[variant], className)}
      {...props}
    />
  )
}
