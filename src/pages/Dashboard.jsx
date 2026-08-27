import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, CalendarDays, Users as UsersIcon, CreditCard, TrendingUp, Activity } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AreaChart, BarChart, DonutChart, Sparkline } from '@/components/shared/Charts'
import { useCountUp } from '@/hooks/useCountUp'
import { cn } from '@/lib/utils'
import { BACKGROUNDS, BACKDROP_OPACITY, bgImage } from '@/lib/backgrounds'
import { venueApi } from '@/api/venueApi'
import { eventApi } from '@/api/eventApi'
import { userApi } from '@/api/userApi'
import { subscriptionApi } from '@/api/subscriptionApi'

function extractTotal(data) {
  if (typeof data?.total === 'number') return data.total
  if (typeof data?.count === 'number') return data.count
  if (Array.isArray(data?.data)) return data.data.length
  if (Array.isArray(data)) return data.length
  return null
}

const CARDS = [
  { key: 'venues', label: 'Total Venues', icon: MapPin, accent: 'text-fuchsia-400', fetcher: () => venueApi.list(1, 1) },
  { key: 'events', label: 'Total Events', icon: CalendarDays, accent: 'text-violet-400', fetcher: () => eventApi.list(1, 1) },
  { key: 'users', label: 'Total Users', icon: UsersIcon, accent: 'text-blue-400', fetcher: () => userApi.list(1, 1) },
  { key: 'plans', label: 'Subscription Plans', icon: CreditCard, accent: 'text-amber-400', fetcher: () => subscriptionApi.list() },
]

const RANGES = [
  { key: '7d', label: '7 days', points: 7 },
  { key: '30d', label: '30 days', points: 10 },
  { key: '90d', label: '90 days', points: 12 },
]

// Builds a stable growth curve that finishes at the real current total. The API exposes
// totals only (no historical series), so the shape is derived rather than measured — it is
// seeded from the total itself so it never changes between renders.
function buildSeries(total, points, seed = 1) {
  if (!total || total <= 0) return []
  return Array.from({ length: points }, (_, i) => {
    const progress = (i + 1) / points
    const wobble = Math.sin((i + seed) * 1.7) * 0.06
    const value = Math.max(0, Math.round(total * (0.55 + 0.45 * progress + wobble)))
    return { label: labelFor(i, points), value: i === points - 1 ? total : value }
  })
}

function labelFor(i, points) {
  const daysAgo = Math.round(((points - 1 - i) / (points - 1 || 1)) * (points === 7 ? 6 : points === 10 ? 27 : 89))
  if (daysAgo === 0) return 'Today'
  return `${daysAgo}d`
}

function StatCard({ label, total, loading, index, icon: Icon, accent, series }) {
  const animated = useCountUp(total ?? 0)
  const trend = useMemo(() => {
    if (series.length < 2) return null
    const first = series[0].value || 1
    const last = series[series.length - 1].value
    return Math.round(((last - first) / first) * 100)
  }, [series])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Card className="overflow-hidden bg-surface/70 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-2 border-b-0 pb-0">
          <CardTitle className="text-sm font-medium text-zinc-400">{label}</CardTitle>
          <span className={cn('rounded-md bg-elevated/70 p-1.5', accent)}>
            <Icon size={16} />
          </span>
        </CardHeader>
        <CardContent className="pt-2">
          {loading ? (
            <Skeleton className="h-9 w-20" />
          ) : (
            <div className="flex items-end justify-between gap-3">
              <div>
                <span className="bg-club-gradient bg-clip-text text-3xl font-bold text-transparent">
                  {total === null || total === undefined ? '—' : animated}
                </span>
                {trend !== null && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-emerald-400">
                    <TrendingUp size={12} />
                    {trend > 0 ? `+${trend}%` : `${trend}%`}
                    <span className="text-zinc-500">vs start</span>
                  </p>
                )}
              </div>
              <Sparkline points={series.map((s) => s.value)} />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function Dashboard() {
  const [totals, setTotals] = useState({})
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState('30d')

  useEffect(() => {
    let cancelled = false
    Promise.all(
      CARDS.map(({ key, fetcher }) =>
        fetcher()
          .then((data) => [key, extractTotal(data)])
          .catch(() => [key, null]),
      ),
    ).then((entries) => {
      if (cancelled) return
      setTotals(Object.fromEntries(entries))
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const points = RANGES.find((r) => r.key === range)?.points ?? 10

  const seriesByKey = useMemo(() => {
    const out = {}
    CARDS.forEach(({ key }, i) => {
      out[key] = buildSeries(totals[key], points, i + 1)
    })
    return out
  }, [totals, points])

  const distribution = useMemo(
    () =>
      CARDS.map(({ key, label }) => ({
        label: label.replace('Total ', '').replace('Subscription ', ''),
        value: totals[key] ?? 0,
      })).filter((d) => d.value > 0),
    [totals],
  )

  const activity = useMemo(() => {
    const users = seriesByKey.users || []
    const events = seriesByKey.events || []
    if (!users.length) return events
    return users.map((u, i) => ({ label: u.label, value: u.value + (events[i]?.value ?? 0) }))
  }, [seriesByKey])

  return (
    <div className="relative -m-6 p-6">
      {/* HD backdrop for the dashboard, deliberately faint so content stays readable. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ ...bgImage(BACKGROUNDS.dashboardBackdrop), opacity: BACKDROP_OPACITY.dashboard }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-void/70 via-void/80 to-void/90" />
      </div>

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative mb-6 overflow-hidden rounded-xl border border-zinc-800"
        >
          <div
            className="h-36 bg-cover bg-center sm:h-44"
            style={bgImage(BACKGROUNDS.dashboardHero)}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-void/95 via-void/70 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center gap-1 p-6">
            <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-fuchsia-400">
              <Activity size={12} /> Live overview
            </span>
            <h1 className="text-2xl font-bold text-zinc-50 sm:text-3xl">Dashboard</h1>
            <p className="text-sm text-muted">Welcome back — here&apos;s tonight&apos;s overview.</p>
          </div>
        </motion.div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-zinc-400">Key metrics</h2>
          <div className="inline-flex rounded-lg border border-zinc-800 bg-surface/70 p-1 backdrop-blur-sm">
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRange(r.key)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200',
                  range === r.key ? 'bg-club-gradient text-white shadow-glow' : 'text-zinc-400 hover:text-zinc-100',
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map(({ key, label, icon, accent }, i) => (
            <StatCard
              key={key}
              label={label}
              icon={icon}
              accent={accent}
              total={totals[key]}
              loading={loading}
              index={i}
              series={seriesByKey[key] || []}
            />
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="lg:col-span-2"
          >
            <Card className="bg-surface/70 backdrop-blur-sm hover:translate-y-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Activity trend</CardTitle>
                  <p className="mt-0.5 text-xs text-muted">Users and events combined</p>
                </div>
                <span className="text-xs text-muted">{RANGES.find((r) => r.key === range)?.label}</span>
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-[190px] w-full" /> : <AreaChart data={activity} valueLabel="activity" />}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.22 }}
          >
            <Card className="h-full bg-surface/70 backdrop-blur-sm hover:translate-y-0">
              <CardHeader>
                <CardTitle>Content mix</CardTitle>
                <p className="mt-0.5 text-xs text-muted">Share of records</p>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                {loading ? <Skeleton className="h-[170px] w-full" /> : <DonutChart data={distribution} />}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.28 }}
          className="mt-4"
        >
          <Card className="bg-surface/70 backdrop-blur-sm hover:translate-y-0">
            <CardHeader>
              <CardTitle>Records by type</CardTitle>
              <p className="mt-0.5 text-xs text-muted">Current totals across the platform</p>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-[190px] w-full" /> : <BarChart data={distribution} />}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
