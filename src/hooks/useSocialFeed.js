import { useEffect, useState, useCallback } from 'react'
import { socialFeedApi } from '@/api/socialFeedApi'
import { toast } from '@/components/ui/toaster'

export function useSocialFeed(page, limit) {
  const [posts, setPosts] = useState([])
  const [total, setTotal] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    socialFeedApi
      .list(page, limit)
      .then((data) => {
        setPosts(data.data || data.posts || data || [])
        setTotal(typeof data.total === 'number' ? data.total : null)
      })
      .finally(() => setLoading(false))
  }, [page, limit])

  useEffect(() => {
    load()
  }, [load])

  async function deletePost(id) {
    await socialFeedApi.remove(id)
    toast.success('Post deleted')
    load()
  }

  async function loadComments(id) {
    const data = await socialFeedApi.comments(id)
    return data.data || data.comments || data || []
  }

  // Users who liked a post. Resolves to [] rather than throwing, so a backend that does
  // not expose the likes endpoint degrades to "no data" instead of breaking the page.
  async function loadLikes(id) {
    try {
      const data = await socialFeedApi.likes(id)
      return data.data || data.likes || data || []
    } catch {
      return []
    }
  }

  return { posts, total, loading, deletePost, loadComments, loadLikes, refetch: load }
}
