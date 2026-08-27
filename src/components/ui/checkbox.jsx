import * as RadixCheckbox from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Checkbox({ className, ...props }) {
  return (
    <RadixCheckbox.Root
      className={cn(
        'flex h-4 w-4 items-center justify-center rounded border border-zinc-600 bg-transparent data-[state=checked]:border-amber-400 data-[state=checked]:bg-amber-400',
        className,
      )}
      {...props}
    >
      <RadixCheckbox.Indicator>
        <Check size={12} className="text-black" />
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  )
}
