import { client, USE_MOCK } from './client'
import { delay, mockDb, paginate } from '@/mocks/mockData'

export const socialFeedApi = {
  list: (page = 1, limit = 10) => {
    if (USE_MOCK) return delay(paginate(mockDb.posts, page, limit))
    return client.get('/social-feed', { params: { page, limit } }).then((r) => r.data)
  },
  comments: (postId) => {
    if (USE_MOCK) return delay(mockDb.comments[postId] || [])
    return client.get(`/social-feed/${postId}/comments`).then((r) => r.data)
  },
  // Users who liked a post — GET /social-feed/:id/likes ("Get Likes List" in the API collection).
  likes: (postId) => {
    if (USE_MOCK) return delay(mockDb.likes?.[postId] || [])
    return client.get(`/social-feed/${postId}/likes`).then((r) => r.data)
  },
  remove: (postId) => {
    if (USE_MOCK) {
      mockDb.posts = mockDb.posts.filter((p) => p._id !== postId)
      return delay({ success: true })
    }
    return client.delete(`/social-feed/${postId}`).then((r) => r.data)
  },
}
