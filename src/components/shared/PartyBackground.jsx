import { cn } from '@/lib/utils'

const PARTICLES = Array.from({ length: 24 }, (_, i) => i)

const PHOTOS = {
  full: '/images/party-crowd-hero.jpg',
  ambient: '/images/club-crowd-blue.jpg',
}

export function PartyBackground({ intensity = 'full', className }) {
  const isFull = intensity === 'full'

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${PHOTOS[intensity] || PHOTOS.full})` }}
      />

      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-b from-[#0b0b1a]/80 via-[#0d0d20]/85 to-[#050508]/95',
          !isFull && 'from-[#0b0b1a]/92 via-[#0d0d20]/94 to-[#050508]/97',
        )}
      />

      <div
        className={cn(
          'absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-fuchsia-900/25 to-transparent blur-2xl',
          isFull ? 'opacity-70' : 'opacity-25',
        )}
      />
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 h-1/4 animate-drift-slow bg-gradient-to-t from-blue-900/25 to-transparent blur-3xl',
          isFull ? 'opacity-60' : 'opacity-20',
        )}
      />

      <div
        className={cn(
          'absolute -left-20 top-10 h-72 w-72 animate-drift-slow rounded-full bg-fuchsia-600/30 blur-3xl',
          !isFull && 'opacity-40',
        )}
      />
      <div
        className={cn(
          'absolute right-0 top-1/3 h-96 w-96 animate-drift-med rounded-full bg-violet-600/30 blur-3xl',
          !isFull && 'opacity-40',
        )}
      />
      <div
        className={cn(
          'absolute bottom-0 left-1/3 h-80 w-80 animate-drift-fast rounded-full bg-blue-600/30 blur-3xl',
          !isFull && 'opacity-40',
        )}
      />
      <div
        className={cn(
          'absolute bottom-1/4 right-1/4 h-64 w-64 animate-drift-med rounded-full bg-amber-500/20 blur-3xl',
          !isFull && 'opacity-30',
        )}
      />

      {isFull && (
        <>
          <div className="absolute left-1/4 top-0 h-full w-24 origin-top animate-spotlight-a bg-gradient-to-b from-fuchsia-400/15 via-fuchsia-400/5 to-transparent blur-xl" />
          <div className="absolute right-1/4 top-0 h-full w-24 origin-top animate-spotlight-b bg-gradient-to-b from-amber-300/15 via-amber-300/5 to-transparent blur-xl" />

          {PARTICLES.map((i) => (
            <span
              key={i}
              className="absolute animate-float-up rounded-full bg-white/70"
              style={{
                left: `${(i * 41) % 100}%`,
                bottom: 0,
                width: `${2 + (i % 3)}px`,
                height: `${2 + (i % 3)}px`,
                animationDelay: `${(i % 8) * 1.1}s`,
                animationDuration: `${9 + (i % 5)}s`,
                boxShadow: '0 0 6px 2px rgba(255,255,255,0.5)',
              }}
            />
          ))}

          <div className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 animate-sweep bg-white/5" />
        </>
      )}
    </div>
  )
}
