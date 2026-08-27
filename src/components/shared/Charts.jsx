import { useId, useState } from 'react'
import { cn } from '@/lib/utils'

// Lightweight SVG charts. No charting library is added on purpose: the bundle stays
// the same size and there is no extra dependency to keep in sync.

const PALETTE = ['#a855f7', '#d946ef', '#3b82f6', '#f59e0b', '#10b981', '#f43f5e']

function niceMax(value) {
  if (!value || value <= 0) return 10
  const mag = 10 ** Math.floor(Math.log10(value))
  return Math.ceil(value / mag) * mag
}

function ChartEmpty({ height }) {
  return (
    <div className="flex items-center justify-center text-sm text-muted" style={{ height }}>
      No data to display
    </div>
  )
}

export function AreaChart({ data = [], height = 190, className, valueLabel = '' }) {
  const gid = useId().replace(/:/g, '')
  const [hover, setHover] = useState(null)

  if (!data.length) return <ChartEmpty height={height} />

  const W = 600
  const H = height
  const PAD = { t: 14, r: 10, b: 26, l: 34 }
  const innerW = W - PAD.l - PAD.r
  const innerH = H - PAD.t - PAD.b

  const max = niceMax(Math.max(...data.map((d) => d.value)))
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0
  const pts = data.map((d, i) => ({
    ...d,
    x: PAD.l + i * stepX,
    y: PAD.t + innerH - (d.value / max) * innerH,
  }))

  const line = pts
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`
      const prev = pts[i - 1]
      const cx = (prev.x + p.x) / 2
      return `C ${cx} ${prev.y} ${cx} ${p.y} ${p.x} ${p.y}`
    })
    .join(' ')
  const area = `${line} L ${pts[pts.length - 1].x} ${PAD.t + innerH} L ${pts[0].x} ${PAD.t + innerH} Z`

  return (
    <div className={cn('relative w-full', className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Trend chart ${valueLabel}`}>
        <defs>
          <linearGradient id={`area-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d946ef" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#d946ef" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`stroke-${gid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        {[0, 0.5, 1].map((t) => {
          const y = PAD.t + innerH - t * innerH
          return (
            <g key={t}>
              <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#27272a" strokeDasharray="3 4" />
              <text x={PAD.l - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#71717a">
                {Math.round(max * t)}
              </text>
            </g>
          )
        })}

        <path d={area} fill={`url(#area-${gid})`} />
        <path d={line} fill="none" stroke={`url(#stroke-${gid})`} strokeWidth="2.5" strokeLinecap="round" />

        {pts.map((p, i) => (
          <g key={p.label}>
            {hover === i && (
              <>
                <line x1={p.x} y1={PAD.t} x2={p.x} y2={PAD.t + innerH} stroke="#d946ef" strokeOpacity="0.4" />
                <circle cx={p.x} cy={p.y} r="5" fill="#d946ef" stroke="#0a0a0f" strokeWidth="2" />
              </>
            )}
            <rect
              x={p.x - (stepX || innerW) / 2}
              y={PAD.t}
              width={stepX || innerW}
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
            {(i === 0 || i === pts.length - 1 || data.length <= 8) && (
              <text x={p.x} y={H - 8} textAnchor="middle" fontSize="10" fill="#71717a">
                {p.label}
              </text>
            )}
          </g>
        ))}
      </svg>

      {hover !== null && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-md border border-fuchsia-600/40 bg-elevated px-2 py-1 text-xs text-zinc-100 shadow-glow"
          style={{ left: `${(pts[hover].x / W) * 100}%`, top: `${(pts[hover].y / H) * 100}%` }}
        >
          <span className="font-semibold">{pts[hover].value}</span>
          <span className="ml-1 text-muted">{pts[hover].label}</span>
        </div>
      )}
    </div>
  )
}

export function BarChart({ data = [], height = 190, className }) {
  const gid = useId().replace(/:/g, '')
  const [hover, setHover] = useState(null)

  if (!data.length) return <ChartEmpty height={height} />

  const W = 600
  const H = height
  const PAD = { t: 18, r: 10, b: 28, l: 34 }
  const innerW = W - PAD.l - PAD.r
  const innerH = H - PAD.t - PAD.b
  const max = niceMax(Math.max(...data.map((d) => d.value)))
  const slot = innerW / data.length
  const barW = Math.min(46, slot * 0.55)

  return (
    <div className={cn('relative w-full', className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Bar chart">
        <defs>
          <linearGradient id={`bar-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.55" />
          </linearGradient>
        </defs>

        {[0, 0.5, 1].map((t) => {
          const y = PAD.t + innerH - t * innerH
          return (
            <g key={t}>
              <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#27272a" strokeDasharray="3 4" />
              <text x={PAD.l - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#71717a">
                {Math.round(max * t)}
              </text>
            </g>
          )
        })}

        {data.map((d, i) => {
          const h = (d.value / max) * innerH
          const x = PAD.l + i * slot + (slot - barW) / 2
          const y = PAD.t + innerH - h
          return (
            <g key={d.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={x} y={PAD.t} width={barW} height={innerH} fill="transparent" />
              <rect
                x={x}
                y={y}
                width={barW}
                height={Math.max(h, 2)}
                rx="5"
                fill={`url(#bar-${gid})`}
                opacity={hover === null || hover === i ? 1 : 0.45}
                style={{ transition: 'opacity .2s' }}
              />
              <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize="11" fontWeight="600" fill="#e4e4e7">
                {d.value}
              </text>
              <text x={x + barW / 2} y={H - 9} textAnchor="middle" fontSize="10" fill="#a1a1aa">
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export function DonutChart({ data = [], size = 170, className }) {
  const [hover, setHover] = useState(null)
  const total = data.reduce((s, d) => s + d.value, 0)

  if (!total) return <ChartEmpty height={size} />

  const r = size / 2
  const stroke = size * 0.19
  const radius = r - stroke / 2
  const circ = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-6', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" role="img" aria-label="Distribution chart">
          <circle cx={r} cy={r} r={radius} fill="none" stroke="#1e1e2a" strokeWidth={stroke} />
          {data.map((d, i) => {
            const len = (d.value / total) * circ
            const el = (
              <circle
                key={d.label}
                cx={r}
                cy={r}
                r={radius}
                fill="none"
                stroke={PALETTE[i % PALETTE.length]}
                strokeWidth={hover === i ? stroke + 4 : stroke}
                strokeDasharray={`${len} ${circ - len}`}
                strokeDashoffset={-offset}
                opacity={hover === null || hover === i ? 1 : 0.4}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                style={{ transition: 'stroke-width .2s, opacity .2s' }}
              />
            )
            offset += len
            return el
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="bg-club-gradient bg-clip-text text-2xl font-bold text-transparent">
            {hover === null ? total : data[hover].value}
          </span>
          <span className="text-[11px] text-muted">{hover === null ? 'Total' : data[hover].label}</span>
        </div>
      </div>

      <ul className="space-y-2">
        {data.map((d, i) => (
          <li
            key={d.label}
            className="flex items-center gap-2 text-sm"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: PALETTE[i % PALETTE.length] }} />
            <span className={cn('text-zinc-300', hover === i && 'text-zinc-50')}>{d.label}</span>
            <span className="ml-auto pl-3 font-medium text-zinc-100">{d.value}</span>
            <span className="w-10 text-right text-xs text-muted">
              {total ? Math.round((d.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Sparkline({ points = [], className, stroke = '#d946ef' }) {
  if (points.length < 2) return null
  const W = 100
  const H = 28
  const max = Math.max(...points)
  const min = Math.min(...points)
  const span = max - min || 1
  const d = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * W
      const y = H - ((v - min) / span) * (H - 4) - 2
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn('h-7 w-24', className)} preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
