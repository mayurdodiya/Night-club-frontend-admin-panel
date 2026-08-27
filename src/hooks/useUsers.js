import { useEffect, useState, useCallback } from 'react'
import { userApi } from '@/api/userApi'

export function useUsers(page, limit) {
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    userApi
      .list(page, limit)
      .then((data) => {
        setRows(data.data || data.users || data || [])
        setTotal(typeof data.total === 'number' ? data.total : null)
      })
      .finally(() => setLoading(false))
  }, [page, limit])

  useEffect(() => {
    load()
  }, [load])

  return { rows, total, loading, refetch: load }
}
