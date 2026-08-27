import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
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
    { key: 'name', header: 'Name' },
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Events</h1>
        <Button onClick={openCreate}>
          <Plus size={16} />
          New Event
        </Button>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-surface">
        <DataTable columns={columns} rows={rows} loading={loading} emptyMessage="No events yet." />
        <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
      </div>

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
