import { client, USE_MOCK } from './client'
import { delay, mockDb } from '@/mocks/mockData'

export const subscriptionApi = {
  list: () => {
    if (USE_MOCK) return delay(mockDb.plans)
    return client.get('/subscription').then((r) => r.data)
  },
  update: (id, payload) => {
    if (USE_MOCK) {
      const idx = mockDb.plans.findIndex((p) => p._id === id)
      if (idx !== -1) mockDb.plans[idx] = { ...mockDb.plans[idx], ...payload }
      return delay(mockDb.plans[idx])
    }
    return client.put(`/subscription/${id}`, payload).then((r) => r.data)
  },
}
