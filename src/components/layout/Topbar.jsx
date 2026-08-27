import { useEffect, useState } from 'react'
import { Clock3 } from 'lucide-react'

export function Topbar() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const time = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(now)

  const date = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(now)

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-800 bg-surface/60 px-6 backdrop-blur">
      <div />

      <div className="flex items-center justify-end">
        <div className="flex items-center gap-3 rounded-lg border border-zinc-700/80 bg-black/20 px-3 py-2 shadow-[0_0_20px_rgba(168,85,247,0.08)]">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-club-gradient shadow-glow">
            <Clock3 size={15} className="text-white" />
          </div>
          <div className="text-right leading-tight">
            <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-400">{date}</div>
            <div className="text-sm font-semibold text-zinc-100">{time}</div>
          </div>
        </div>
      </div>
    </header>
  )
}
