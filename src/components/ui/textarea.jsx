import { cn } from '@/lib/utils'

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'flex min-h-20 w-full rounded-md border border-zinc-700 bg-surface px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-600',
        className,
      )}
      {...props}
    />
  )
}
