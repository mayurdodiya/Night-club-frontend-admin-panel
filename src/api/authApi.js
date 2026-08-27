import { client, USE_MOCK } from './client'
import { delay, mockAdmin } from '@/mocks/mockData'

export const authApi = {
  adminLogin: (email, password) => {
    if (USE_MOCK) {
      if (!email || !password) return Promise.reject({ response: { data: { message: 'Email and password are required' } } })
      return delay({ token: 'mock-token-' + Date.now(), admin: { ...mockAdmin, email } })
    }
    return client.post('/auth/admin/login', { email, password }).then((r) => r.data)
  },
}
