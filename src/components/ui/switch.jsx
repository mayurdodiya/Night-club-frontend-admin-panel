import * as RadixSwitch from '@radix-ui/react-switch'
import { cn } from '@/lib/utils'

export function Switch({ className, ...props }) {
  return (
    <RadixSwitch.Root
      className={cn(
        'relative h-6 w-11 rounded-full bg-zinc-700 outline-none transition-colors data-[state=checked]:bg-club-gradient',
        className,
      )}
      {...props}
    >
      <RadixSwitch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-5" />
    </RadixSwitch.Root>
  )
}
