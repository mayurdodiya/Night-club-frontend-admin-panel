import { client, USE_MOCK } from './client'
import { delay, mockDb, paginate } from '@/mocks/mockData'

export const userApi = {
  list: (page = 1, limit = 10) => {
    if (USE_MOCK) return delay(paginate(mockDb.users, page, limit))
    return client.get('/user', { params: { page, limit } }).then((r) => r.data)
  },
}
