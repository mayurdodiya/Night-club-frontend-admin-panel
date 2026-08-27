import { client, USE_MOCK } from './client'
import { delay, mockDb, paginate } from '@/mocks/mockData'

let nextMockId = 100

export const eventApi = {
  list: (page = 1, limit = 10) => {
    if (USE_MOCK) return delay(paginate(mockDb.events, page, limit))
    return client.get('/event/admin/list', { params: { page, limit } }).then((r) => r.data)
  },
  create: (payload) => {
    if (USE_MOCK) {
      const event = { _id: `event-mock-${nextMockId++}`, isFeatured: false, imageUrls: [], ...payload }
      mockDb.events.unshift(event)
      return delay(event)
    }
    return client.post('/event', payload).then((r) => r.data)
  },
  update: (id, payload) => {
    if (USE_MOCK) {
      const idx = mockDb.events.findIndex((e) => e._id === id)
      if (idx !== -1) mockDb.events[idx] = { ...mockDb.events[idx], ...payload }
      return delay(mockDb.events[idx])
    }
    return client.put(`/event/${id}`, payload).then((r) => r.data)
  },
  remove: (id) => {
    if (USE_MOCK) {
      mockDb.events = mockDb.events.filter((e) => e._id !== id)
      return delay({ success: true })
    }
    return client.delete(`/event/${id}`).then((r) => r.data)
  },
  setFeatured: (id, isFeatured) => {
    if (USE_MOCK) {
      const idx = mockDb.events.findIndex((e) => e._id === id)
      if (idx !== -1) mockDb.events[idx].isFeatured = isFeatured
      return delay(mockDb.events[idx])
    }
    return client.put(`/event/${id}/feature`, { isFeatured }).then((r) => r.data)
  },
}
