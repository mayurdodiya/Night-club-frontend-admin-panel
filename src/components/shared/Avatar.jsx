import { cn } from '@/lib/utils'

// Deterministic gradient per user so the same person always gets the same colour.
const GRADIENTS = [
  'from-violet-500 to-fuchsia-600',
  'from-fuchsia-500 to-pink-600',
  'from-blue-500 to-violet-600',
  'from-cyan-500 to-blue-600',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-red-600',
]

function hashOf(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) % 100000
  return h
}

export function initialsOf(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const SIZES = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
}

export function Avatar({ name, src, size = 'md', className, ring = false }) {
  const gradient = GRADIENTS[hashOf(name) % GRADIENTS.length]

  return (
    <span
      title={name || undefined}
      className={cn(
        'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-semibold text-white',
        `bg-gradient-to-br ${gradient}`,
        SIZES[size] || SIZES.md,
        ring && 'ring-2 ring-void',
        className,
      )}
    >
      {src ? (
        <img src={src} alt={name || ''} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        initialsOf(name)
      )}
    </span>
  )
}

// Overlapping avatar row, e.g. for "who liked this".
export function AvatarStack({ people = [], max = 5, size = 'xs' }) {
  const shown = people.slice(0, max)
  const rest = people.length - shown.length

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {shown.map((p, i) => (
          <Avatar key={p.id || p._id || i} name={p.name} src={p.avatar} size={size} ring />
        ))}
      </div>
      {rest > 0 && (
        <span className="ml-2 text-xs text-muted">+{rest}</span>
      )}
    </div>
  )
}
