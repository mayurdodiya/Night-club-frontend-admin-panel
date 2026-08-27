import { useEffect, useState, useCallback } from 'react'
import { venueApi } from '@/api/venueApi'
import { toast } from '@/components/ui/toaster'

export function useVenues(page, limit) {
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    venueApi
      .list(page, limit)
      .then((data) => {
        setRows(data.data || data.venues || data || [])
        setTotal(typeof data.total === 'number' ? data.total : null)
      })
      .finally(() => setLoading(false))
  }, [page, limit])

  useEffect(() => {
    load()
  }, [load])

  async function createVenue(payload) {
    await venueApi.create(payload)
    toast.success('Venue created')
    load()
  }

  async function updateVenue(id, payload) {
    await venueApi.update(id, payload)
    toast.success('Venue updated')
    load()
  }

  async function deleteVenue(id) {
    await venueApi.remove(id)
    toast.success('Venue deleted')
    load()
  }

  async function setFeatured(id, isFeatured) {
    await venueApi.setFeatured(id, isFeatured)
    toast.success(isFeatured ? 'Marked as featured' : 'Removed from featured')
    load()
  }

  return { rows, total, loading, createVenue, updateVenue, deleteVenue, setFeatured, refetch: load }
}
