import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Users, MapPin, CalendarDays, CreditCard, MessageSquare, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BACKGROUNDS, BACKDROP_OPACITY, bgImage } from '@/lib/backgrounds'
import { useAuth } from '@/context/AuthContext'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/venues', label: 'Venues', icon: MapPin },
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { to: '/social-feed', label: 'Social Feed', icon: MessageSquare },
]

export function Sidebar() {
  const { admin, logout } = useAuth()

  return (
    <aside className="relative flex h-screen w-60 shrink-0 flex-col overflow-hidden border-r border-zinc-800">
      {/* Background photo, kept faint so navigation text stays the focus. */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ ...bgImage(BACKGROUNDS.sidebar), opacity: BACKDROP_OPACITY.sidebar }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-surface/95 via-surface/90 to-void/95 backdrop-blur-[2px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-16 top-1/4 h-64 w-64 rounded-full bg-fuchsia-600/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="relative overflow-hidden border-b border-zinc-800/80 p-5">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={bgImage(BACKGROUNDS.sidebarHeader)}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/70 to-transparent" aria-hidden="true" />
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            <span className="bg-club-gradient bg-clip-text text-lg font-bold tracking-wide text-transparent">
              Night Club
            </span>
            <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-zinc-500">Admin Panel</p>
          </motion.div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {links.map(({ to, label, icon: Icon, end }, i) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
            >
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 overflow-hidden rounded-md px-3 py-2 text-sm text-zinc-300 transition-all duration-300 hover:bg-elevated/70 hover:pl-4',
                    isActive && 'bg-club-gradient text-white shadow-glow',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-white/80" aria-hidden="true" />
                    )}
                    <Icon size={18} className="transition-transform duration-300 group-hover:scale-110" />
                    {label}
                  </>
                )}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        <div className="mt-auto border-t border-zinc-800/80 p-3">
          <div className="flex items-center justify-between gap-2 rounded-xl border border-zinc-700/80 bg-black/20 px-2.5 py-2.5 shadow-[0_0_20px_rgba(168,85,247,0.08)]">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-club-gradient text-[10px] font-bold text-white shadow-glow">
                {((admin?.name || admin?.email || 'A').charAt(0) || 'A').toUpperCase()}
              </div>
              <span className="truncate text-[11px] font-medium text-zinc-200">{admin?.email || 'Admin'}</span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900/60 px-2 py-1 text-[11px] font-medium text-zinc-100 transition-colors hover:border-violet-400/60 hover:text-white"
            >
              <LogOut size={12} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
