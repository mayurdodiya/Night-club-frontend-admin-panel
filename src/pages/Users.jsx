import { useState } from 'react'
import { DataTable } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { useUsers } from '@/hooks/useUsers'

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'phone', header: 'Phone', render: (row) => `${row.countryCode || ''} ${row.phone || ''}` },
  { key: 'email', header: 'Email' },
  {
    key: 'createdAt',
    header: 'Joined',
    render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'),
  },
]

export default function Users() {
  const [page, setPage] = useState(1)
  const limit = 10
  const { rows, total, loading } = useUsers(page, limit)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">Users</h1>
      <div className="rounded-lg border border-zinc-800 bg-surface">
        <DataTable columns={columns} rows={rows} loading={loading} emptyMessage="No users found." />
        <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
      </div>
    </div>
  )
}
