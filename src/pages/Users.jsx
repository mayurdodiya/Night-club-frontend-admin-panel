import { useState } from 'react'
import { CalendarDays, Disc3, Eye, ListMusic, Mail, Phone, ShieldCheck, Users as UsersIcon } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { Avatar } from '@/components/shared/Avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useUsers } from '@/hooks/useUsers'

function getColumns(onView) {
  return [
  {
    key: 'name',
    header: 'Member',
    render: (row) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.name} src={row.avatar} size="md" ring />
        <div className="min-w-0">
          <p className="truncate font-medium text-zinc-100">{row.name || 'Unknown user'}</p>
          <p className="text-xs text-muted">Member account</p>
        </div>
      </div>
    ),
  },
  {
    key: 'phone',
    header: 'Contact',
    render: (row) => (
      <div className="space-y-1 text-xs">
        <p className="flex items-center gap-1.5 text-zinc-300"><Phone size={12} className="text-fuchsia-400" /> {row.countryCode || ''} {row.phone || '—'}</p>
        <p className="flex items-center gap-1.5 text-muted"><Mail size={12} /> {row.email || '—'}</p>
      </div>
    ),
  },
  {
    key: 'createdAt',
    header: 'Joined date',
    render: (row) => (
      <span className="inline-flex items-center gap-1.5 text-sm text-zinc-300">
        <CalendarDays size={14} className="text-blue-400" />
        {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN') : '—'}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: () => (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Active
      </span>
    ),
    },
    {
      key: 'actions',
      header: 'Details',
      render: (row) => (
        <button
          type="button"
          aria-label={`View ${row.name || 'user'} details`}
          onClick={() => onView(row)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900/70 text-zinc-400 transition-colors hover:border-fuchsia-400/50 hover:bg-fuchsia-500/10 hover:text-fuchsia-300"
        >
          <Eye size={15} />
        </button>
      ),
    },
  ]
}

export default function Users() {
  const [page, setPage] = useState(1)
  const limit = 10
  const { rows, total, loading } = useUsers(page, limit)
  const [selectedUser, setSelectedUser] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const columns = getColumns(setSelectedUser)

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-fuchsia-400">
            <ShieldCheck size={13} /> Community
          </p>
          <h1 className="text-2xl font-bold text-zinc-100">Members</h1>
          <p className="mt-1 text-sm text-muted">Manage registered members and their account details.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-lg border border-zinc-800 bg-surface p-1">
            <button
              type="button"
              aria-label="Grid view"
              onClick={() => setViewMode('grid')}
              className={`rounded-md p-2 transition-colors ${viewMode === 'grid' ? 'bg-club-gradient text-white' : 'text-zinc-400 hover:text-zinc-100'}`}
            >
              <Disc3 size={16} />
            </button>
            <button
              type="button"
              aria-label="List view"
              onClick={() => setViewMode('list')}
              className={`rounded-md p-2 transition-colors ${viewMode === 'list' ? 'bg-club-gradient text-white' : 'text-zinc-400 hover:text-zinc-100'}`}
            >
              <ListMusic size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-fuchsia-500/20 bg-surface/70 px-3 py-2 text-sm text-zinc-300">
            <UsersIcon size={16} className="text-fuchsia-400" />
            <span className="font-semibold text-zinc-100">{total ?? rows.length}</span> members
          </div>
        </div>
      </div>
      {viewMode === 'list' ? (
        <div className="overflow-hidden rounded-xl border border-fuchsia-500/15 bg-surface/85 shadow-[0_12px_30px_rgba(0,0,0,0.18)] backdrop-blur-sm">
          <DataTable columns={columns} rows={rows} loading={loading} emptyMessage="No users found." />
          <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-72 animate-pulse rounded-xl border border-zinc-800 bg-surface" />)}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-surface p-8 text-center text-sm text-muted">No users found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((user) => (
            <div key={user.id || user._id} className="group overflow-hidden rounded-xl border border-fuchsia-500/15 bg-surface/90 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.16)] transition-all hover:-translate-y-1 hover:border-fuchsia-400/40">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={user.name} src={user.avatar} size="lg" ring />
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-zinc-100">{user.name || 'Unknown user'}</h2>
                    <p className="text-xs text-muted">Member account</p>
                  </div>
                </div>
                <button type="button" aria-label={`View ${user.name || 'user'} details`} onClick={() => setSelectedUser(user)} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900/70 text-zinc-400 transition-colors hover:border-fuchsia-400/50 hover:bg-fuchsia-500/10 hover:text-fuchsia-300">
                  <Eye size={15} />
                </button>
              </div>
              <div className="mt-5 space-y-2 border-t border-zinc-800/80 pt-4 text-sm">
                <p className="flex items-center gap-2 text-zinc-300"><Mail size={14} className="text-fuchsia-400" />{user.email || 'Not provided'}</p>
                <p className="flex items-center gap-2 text-zinc-400"><Phone size={14} className="text-blue-400" />{user.countryCode || ''} {user.phone || 'Not provided'}</p>
                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="flex items-center gap-1.5 text-zinc-500"><CalendarDays size={13} />Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : '—'}</span>
                  <span className="text-emerald-300">Active</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {viewMode === 'grid' ? <div className="mt-4 rounded-lg border border-zinc-800 bg-surface/70"><Pagination page={page} limit={limit} total={total} onPageChange={setPage} /></div> : null}

      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-md border-fuchsia-500/25 bg-[linear-gradient(145deg,rgba(35,25,48,0.98),rgba(14,14,22,0.98))] p-0 shadow-[0_0_45px_rgba(168,85,247,0.25)]">
          {selectedUser ? (
            <div>
              <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-t-lg bg-black/40 sm:h-72">
                {selectedUser.avatar ? (
                  <img src={selectedUser.avatar} alt={selectedUser.name || 'User profile'} className="h-full w-full object-contain" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Avatar name={selectedUser.name} size="lg" className="h-28 w-28 text-3xl ring-4 ring-white/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              </div>
              <div className="p-6">
                <DialogHeader className="flex flex-col items-center text-center">
                <DialogTitle className="text-xl">{selectedUser.name || 'Unknown user'}</DialogTitle>
                <p className="mt-1 text-sm text-muted">Member account</p>
                </DialogHeader>

                <div className="mt-5 grid gap-2">
                <div className="rounded-lg border border-white/5 bg-black/20 p-3">
                  <p className="mb-1 text-[11px] uppercase tracking-wider text-zinc-500">Contact</p>
                  <p className="flex items-center gap-2 text-sm text-zinc-200"><Mail size={14} className="text-fuchsia-400" />{selectedUser.email || 'Not provided'}</p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-zinc-200"><Phone size={14} className="text-blue-400" />{selectedUser.countryCode || ''} {selectedUser.phone || 'Not provided'}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-white/5 bg-black/20 p-3">
                    <p className="mb-1 text-[11px] uppercase tracking-wider text-zinc-500">Joined</p>
                    <p className="flex items-center gap-2 text-sm text-zinc-200"><CalendarDays size={14} className="text-blue-400" />{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-IN') : '—'}</p>
                  </div>
                  <div className="rounded-lg border border-white/5 bg-black/20 p-3">
                    <p className="mb-1 text-[11px] uppercase tracking-wider text-zinc-500">Status</p>
                    <p className="flex items-center gap-2 text-sm text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-400" />Active</p>
                  </div>
                </div>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
