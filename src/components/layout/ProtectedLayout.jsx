import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { PartyBackground } from '@/components/shared/PartyBackground'

export function ProtectedLayout() {
  const { token } = useAuth()
  const location = useLocation()
  if (!token) return <Navigate to="/login" replace />
  return (
    // h-screen (not min-h-screen) pins the shell to the viewport, so the sidebar and
    // topbar stay put and <main> below is the only element that scrolls.
    <div className="relative flex h-screen overflow-hidden bg-void">
      <PartyBackground intensity="ambient" className="z-0" />
      <div className="relative z-10 flex h-full w-full overflow-hidden">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="min-h-0 flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  )
}
