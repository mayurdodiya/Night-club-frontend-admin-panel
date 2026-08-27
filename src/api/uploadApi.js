import { client, USE_MOCK } from './client'
import { delay } from '@/mocks/mockData'

export const uploadApi = {
  image: (file) => {
    if (USE_MOCK) return delay({ url: URL.createObjectURL(file) }, 300)
    const form = new FormData()
    form.append('file', file)
    return client.post('/upload/image', form).then((r) => r.data)
  },
  logo: (file) => {
    if (USE_MOCK) return delay({ url: URL.createObjectURL(file) }, 300)
    const form = new FormData()
    form.append('file', file)
    return client.post('/upload/logo', form).then((r) => r.data)
  },
}
