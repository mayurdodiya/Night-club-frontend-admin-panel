import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { Toaster } from '@/components/ui/toaster'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'
import Dashboard from '@/pages/Dashboard'
import Users from '@/pages/Users'
import Venues from '@/pages/Venues'
import Events from '@/pages/Events'
import Subscriptions from '@/pages/Subscriptions'
import SocialFeed from '@/pages/SocialFeed'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/venues" element={<Venues />} />
            <Route path="/events" element={<Events />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/social-feed" element={<SocialFeed />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
