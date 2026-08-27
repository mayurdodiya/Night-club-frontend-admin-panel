import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-void text-zinc-100">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="text-muted">Page not found.</p>
      <Link to="/" className="text-fuchsia-400 hover:underline">
        Back to dashboard
      </Link>
    </div>
  )
}
