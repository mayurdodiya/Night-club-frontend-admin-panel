import { cn } from '@/lib/utils'

const variants = {
  primary: 'bg-club-gradient text-white hover:shadow-glow',
  secondary: 'bg-elevated text-zinc-100 hover:bg-elevated/80',
  ghost: 'bg-transparent text-zinc-300 hover:bg-elevated/60',
  destructive: 'bg-red-600 text-white hover:bg-red-500',
}

export function Button({ className, variant = 'primary', size = 'md', ...props }) {
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    icon: 'h-9 w-9 p-0',
  }
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:hover:scale-100',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}
