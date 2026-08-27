import { useEffect, useState, useCallback } from 'react'
import { subscriptionApi } from '@/api/subscriptionApi'
import { toast } from '@/components/ui/toaster'

export function useSubscriptions() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    subscriptionApi
      .list()
      .then((data) => setPlans(data.data || data.plans || data || []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function updatePlan(id, amount) {
    await subscriptionApi.update(id, { amount })
    toast.success('Plan updated')
    load()
  }

  return { plans, loading, updatePlan, refetch: load }
}
