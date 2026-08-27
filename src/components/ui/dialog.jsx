import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Dialog = RadixDialog.Root
export const DialogTrigger = RadixDialog.Trigger

export function DialogContent({ className, children, ...props }) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
      <RadixDialog.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-zinc-800 bg-surface p-6 shadow-glow max-h-[85vh] overflow-y-auto data-[state=open]:animate-dialog-in',
          className,
        )}
        {...props}
      >
        {children}
        <RadixDialog.Close className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-100">
          <X size={18} />
        </RadixDialog.Close>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  )
}

export function DialogHeader({ className, ...props }) {
  return <div className={cn('mb-4', className)} {...props} />
}
export function DialogTitle({ className, ...props }) {
  return <RadixDialog.Title className={cn('text-lg font-semibold text-zinc-100', className)} {...props} />
}
export function DialogFooter({ className, ...props }) {
  return <div className={cn('mt-6 flex justify-end gap-2', className)} {...props} />
}
