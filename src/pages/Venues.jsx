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
import { useVenues } from '@/hooks/useVenues'

const emptyForm = {
  name: '',
  address: '',
  latitude: '',
  longitude: '',
  description: '',
  imageUrls: [],
}

export default function Venues() {
  const [page, setPage] = useState(1)
  const limit = 10
  const { rows, total, loading, createVenue, updateVenue, deleteVenue, setFeatured } = useVenues(page, limit)

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
      await updateVenue(editingId, payload)
    } else {
      await createVenue(payload)
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
        <Switch
          checked={!!row.isFeatured}
          onCheckedChange={(checked) => setFeatured(row.id || row._id, checked)}
        />
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
        <h1 className="text-2xl font-bold text-zinc-100">Venues</h1>
        <Button onClick={openCreate}>
          <Plus size={16} />
          New Venue
        </Button>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-surface">
        <DataTable columns={columns} rows={rows} loading={loading} emptyMessage="No venues yet." />
        <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Venue' : 'New Venue'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="v-name">Name</Label>
              <Input id="v-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="v-address">Address</Label>
              <Input id="v-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="v-lat">Latitude</Label>
                <Input
                  id="v-lat"
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="v-lng">Longitude</Label>
                <Input
                  id="v-lng"
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="v-desc">Description</Label>
              <Textarea
                id="v-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <ImageUploader
              value={form.imageUrls}
              onChange={(imageUrls) => setForm({ ...form, imageUrls })}
              uploadFn={uploadApi.image}
              label="Venue Images"
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingId ? 'Save changes' : 'Create venue'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(open) => !open && setConfirmId(null)}
        title="Delete this venue?"
        description="This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => confirmId && deleteVenue(confirmId)}
      />
    </div>
  )
}
