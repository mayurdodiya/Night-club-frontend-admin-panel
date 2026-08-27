import { client, USE_MOCK } from './client'
import { delay, mockDb, paginate } from '@/mocks/mockData'

let nextMockId = 100

export const venueApi = {
  list: (page = 1, limit = 10) => {
    if (USE_MOCK) return delay(paginate(mockDb.venues, page, limit))
    return client.get('/venue/admin/list', { params: { page, limit } }).then((r) => r.data)
  },
  create: (payload) => {
    if (USE_MOCK) {
      const venue = { _id: `venue-mock-${nextMockId++}`, isFeatured: false, imageUrls: [], ...payload }
      mockDb.venues.unshift(venue)
      return delay(venue)
    }
    return client.post('/venue', payload).then((r) => r.data)
  },
  update: (id, payload) => {
    if (USE_MOCK) {
      const idx = mockDb.venues.findIndex((v) => v._id === id)
      if (idx !== -1) mockDb.venues[idx] = { ...mockDb.venues[idx], ...payload }
      return delay(mockDb.venues[idx])
    }
    return client.put(`/venue/${id}`, payload).then((r) => r.data)
  },
  remove: (id) => {
    if (USE_MOCK) {
      mockDb.venues = mockDb.venues.filter((v) => v._id !== id)
      return delay({ success: true })
    }
    return client.delete(`/venue/${id}`).then((r) => r.data)
  },
  setFeatured: (id, isFeatured) => {
    if (USE_MOCK) {
      const idx = mockDb.venues.findIndex((v) => v._id === id)
      if (idx !== -1) mockDb.venues[idx].isFeatured = isFeatured
      return delay(mockDb.venues[idx])
    }
    return client.put(`/venue/${id}/feature`, { isFeatured }).then((r) => r.data)
  },
}
