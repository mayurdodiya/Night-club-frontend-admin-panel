import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Sparkles } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/components/ui/toaster'
import { PartyBackground } from '@/components/shared/PartyBackground'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Email and password are required')
      return
    }
    setLoading(true)
    try {
      await login(email, password, remember)
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-void">
      <PartyBackground intensity="full" />

      <motion.form
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm rounded-2xl border border-amber-400/60 bg-surface/70 p-8 shadow-glow-gold backdrop-blur-xl animate-glow-pulse"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-club-gradient shadow-glow">
            <Sparkles size={22} className="text-white" />
          </span>
          <h1 className="text-2xl font-bold tracking-wide text-zinc-50">Sign In</h1>
          <p className="mt-1 text-sm text-muted">Night Club Admin</p>
        </div>

        <label htmlFor="email" className="mb-4 flex items-center gap-2 border-b border-zinc-600 pb-2 transition-colors focus-within:border-amber-400">
          <Mail size={16} className="text-zinc-400" />
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
        </label>

        <label htmlFor="password" className="mb-4 flex items-center gap-2 border-b border-zinc-600 pb-2 transition-colors focus-within:border-amber-400">
          <Lock size={16} className="text-zinc-400" />
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
        </label>

        <div className="mb-6 flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-zinc-400">
            <Checkbox checked={remember} onCheckedChange={(checked) => setRemember(!!checked)} />
            Remember Me
          </label>
          <button
            type="button"
            onClick={() => toast.info('Contact your system administrator to reset your password.')}
            className="text-amber-400 hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-md bg-gradient-to-r from-amber-400 via-fuchsia-500 to-violet-600 py-2.5 text-sm font-semibold text-white shadow-glow-gold transition-shadow hover:shadow-glow disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'LOG IN'}
        </motion.button>
      </motion.form>
    </div>
  )
}
