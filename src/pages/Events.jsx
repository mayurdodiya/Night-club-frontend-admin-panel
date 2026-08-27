import { useState } from 'react'
import { CalendarDays, List, MapPin, Pencil, Plus, Grid2X2, Trash2 } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ImageUploader } from '@/components/shared/ImageUploader'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/toaster'
import { uploadApi } from '@/api/uploadApi'
import { useEvents } from '@/hooks/useEvents'

const emptyForm = {
  name: '',
  address: '',
  latitude: '',
  longitude: '',
  description: '',
  imageUrls: [],
}

export default function Events() {
  const [page, setPage] = useState(1)
  const limit = 10
  const { rows, total, loading, createEvent, updateEvent, deleteEvent, setFeatured } = useEvents(page, limit)

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirmId, setConfirmId] = useState(null)
  const [viewMode, setViewMode] = useState('grid')

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  function openEdit(row) {
    setEditingId(row.id || row._id)
    setForm({
      name: row.name || '',
      address: row.address || '',
      latitude: row.latitude ?? '',
      longitude: row.longitude ?? '',
      description: row.description || '',
      imageUrls: row.imageUrls || [],
    })
    setFormOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    const payload = {
      name: form.name,
      address: form.address,
      latitude: form.latitude === '' ? undefined : Number(form.latitude),
      longitude: form.longitude === '' ? undefined : Number(form.longitude),
      description: form.description,
      imageUrls: form.imageUrls,
    }
    if (editingId) {
      await updateEvent(editingId, payload)
    } else {
      await createEvent(payload)
    }
    setFormOpen(false)
  }

  const columns = [
    {
      key: 'name',
      header: 'Event',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.imageUrls?.[0] ? (
            <img src={row.imageUrls[0]} alt="" className="h-12 w-16 rounded-md border border-zinc-800 object-cover" loading="lazy" />
          ) : (
            <div className="h-12 w-16 rounded-md border border-zinc-800 bg-elevated" />
          )}
          <span className="font-medium text-zinc-100">{row.name}</span>
        </div>
      ),
    },
    { key: 'address', header: 'Address' },
    {
      key: 'isFeatured',
      header: 'Featured',
      render: (row) => (
        <Switch checked={!!row.isFeatured} onCheckedChange={(checked) => setFeatured(row.id || row._id, checked)} />
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
            <Pencil size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setConfirmId(row.id || row._id)}>
            <Trash2 size={16} className="text-red-400" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-fuchsia-400">Club calendar</p>
          <h1 className="text-2xl font-bold text-zinc-100">Events</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-zinc-800 bg-surface p-1">
            <button
              type="button"
              aria-label="Grid view"
              onClick={() => setViewMode('grid')}
              className={`rounded-md p-2 transition-colors ${viewMode === 'grid' ? 'bg-club-gradient text-white' : 'text-zinc-400 hover:text-zinc-100'}`}
            >
              <Grid2X2 size={16} />
            </button>
            <button
              type="button"
              aria-label="List view"
              onClick={() => setViewMode('list')}
              className={`rounded-md p-2 transition-colors ${viewMode === 'list' ? 'bg-club-gradient text-white' : 'text-zinc-400 hover:text-zinc-100'}`}
            >
              <List size={16} />
            </button>
          </div>
          <Button onClick={openCreate}>
            <Plus size={16} />
            New Event
          </Button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="rounded-lg border border-zinc-800 bg-surface">
          <DataTable columns={columns} rows={rows} loading={loading} emptyMessage="No events yet." />
          <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-80 animate-pulse rounded-xl border border-zinc-800 bg-surface" />)}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-surface p-8 text-center text-sm text-muted">No events yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((event) => (
            <div key={event.id || event._id} className="group overflow-hidden rounded-xl border border-fuchsia-500/15 bg-surface/90 shadow-[0_12px_30px_rgba(0,0,0,0.16)] transition-all hover:-translate-y-1 hover:border-fuchsia-400/40">
              {event.imageUrls?.[0] ? (
                <img src={event.imageUrls[0]} alt={event.name} className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              ) : <div className="h-44 bg-elevated" />}
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-zinc-100">{event.name}</h2>
                  {event.isFeatured ? <span className="rounded-full bg-fuchsia-500/15 px-2 py-1 text-[10px] font-medium text-fuchsia-300">Featured</span> : null}
                </div>
                <p className="line-clamp-2 min-h-10 text-sm leading-relaxed text-muted">{event.description}</p>
                <p className="flex items-center gap-1.5 text-xs text-zinc-400"><MapPin size={13} className="text-fuchsia-400" />{event.address}</p>
                <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3">
                  <span className="flex items-center gap-1.5 text-xs text-zinc-500"><CalendarDays size={13} /> Night event</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(event)} aria-label={`Edit ${event.name}`}><Pencil size={15} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setConfirmId(event.id || event._id)} aria-label={`Delete ${event.name}`}><Trash2 size={15} className="text-red-400" /></Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'grid' ? (
        <div className="mt-4 rounded-lg border border-zinc-800 bg-surface/70">
          <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
        </div>
      ) : null}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Event' : 'New Event'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="e-name">Name</Label>
              <Input id="e-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="e-address">Address</Label>
              <Input id="e-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="e-lat">Latitude</Label>
                <Input
                  id="e-lat"
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="e-lng">Longitude</Label>
                <Input
                  id="e-lng"
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="e-desc">Description</Label>
              <Textarea
                id="e-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <ImageUploader
              value={form.imageUrls}
              onChange={(imageUrls) => setForm({ ...form, imageUrls })}
              uploadFn={uploadApi.image}
              label="Event Images"
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingId ? 'Save changes' : 'Create event'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(open) => !open && setConfirmId(null)}
        title="Delete this event?"
        description="This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => confirmId && deleteEvent(confirmId)}
      />
    </div>
  )
}
