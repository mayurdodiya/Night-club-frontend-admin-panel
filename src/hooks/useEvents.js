import { useEffect, useState, useCallback } from 'react'
import { eventApi } from '@/api/eventApi'
import { toast } from '@/components/ui/toaster'

export function useEvents(page, limit) {
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    eventApi
      .list(page, limit)
      .then((data) => {
        setRows(data.data || data.events || data || [])
        setTotal(typeof data.total === 'number' ? data.total : null)
      })
      .finally(() => setLoading(false))
  }, [page, limit])

  useEffect(() => {
    load()
  }, [load])

  async function createEvent(payload) {
    await eventApi.create(payload)
    toast.success('Event created')
    load()
  }

  async function updateEvent(id, payload) {
    await eventApi.update(id, payload)
    toast.success('Event updated')
    load()
  }

  async function deleteEvent(id) {
    await eventApi.remove(id)
    toast.success('Event deleted')
    load()
  }

  async function setFeatured(id, isFeatured) {
    await eventApi.setFeatured(id, isFeatured)
    toast.success(isFeatured ? 'Marked as featured' : 'Removed from featured')
    load()
  }

  return { rows, total, loading, createEvent, updateEvent, deleteEvent, setFeatured, refetch: load }
}
