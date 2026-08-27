import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function Table({ className, ...props }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-zinc-800">
      <table className={cn('w-full text-left text-sm', className)} {...props} />
    </div>
  )
}
export function TableHeader({ className, ...props }) {
  return <thead className={cn('bg-elevated text-zinc-400', className)} {...props} />
}
export function TableBody({ className, ...props }) {
  return <tbody className={cn('divide-y divide-zinc-800', className)} {...props} />
}
export function TableRow({ className, ...props }) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn('transition-colors hover:bg-elevated/60', className)}
      {...props}
    />
  )
}
export function TableHead({ className, ...props }) {
  return <th className={cn('px-4 py-3 font-medium', className)} {...props} />
}
export function TableCell({ className, ...props }) {
  return <td className={cn('px-4 py-3 text-zinc-200', className)} {...props} />
}
