import { useMemo, useState } from 'react'
import {
  Trash2,
  MessageCircle,
  Heart,
  Search,
  ImageIcon,
  MapPin,
  ArrowUpDown,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Avatar } from '@/components/shared/Avatar'
import { useSocialFeed } from '@/hooks/useSocialFeed'
import { cn } from '@/lib/utils'
import { BACKGROUNDS, bgImage } from '@/lib/backgrounds'

const SORTS = [
  { key: 'recent', label: 'Most recent' },
  { key: 'likes', label: 'Most liked' },
  { key: 'comments', label: 'Most discussed' },
]

function relativeTime(value) {
  if (!value) return null
  const then = new Date(value).getTime()
  if (Number.isNaN(then)) return null
  const diff = Date.now() - then
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(value).toLocaleDateString()
}

function StatTile({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-surface/70 px-4 py-3 backdrop-blur-sm">
      <span className={cn('rounded-md bg-elevated/70 p-2', accent)}>
        <Icon size={16} />
      </span>
      <div>
        <p className="text-lg font-semibold leading-none text-zinc-100">{value}</p>
        <p className="mt-1 text-xs text-muted">{label}</p>
      </div>
    </div>
  )
}

function PostImageSlider({ imageUrls = [] }) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (!imageUrls.length) return null

  return (
    <div className="relative overflow-hidden border-b border-zinc-800/80 bg-black/20">
      <img
        src={imageUrls[activeIndex]}
        alt="Post media"
        loading="lazy"
        className="h-44 w-full object-cover sm:h-52"
      />
      {imageUrls.length > 1 ? (
        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
          {imageUrls.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Show image ${index + 1}`}
              onClick={(event) => {
                event.stopPropagation()
                setActiveIndex(index)
              }}
              className={cn(
                'h-1.5 rounded-full transition-all duration-200',
                index === activeIndex ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80',
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default function SocialFeed() {
  const [page, setPage] = useState(1)
  const limit = 10
  const { posts, total, loading, deletePost, loadComments, loadLikes } = useSocialFeed(page, limit)

  const [confirmId, setConfirmId] = useState(null)
  const [selectedPost, setSelectedPost] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // One expandable panel at a time: { id, tab: 'likes' | 'comments' }
  const [panel, setPanel] = useState(null)
  const [panelLoading, setPanelLoading] = useState(false)
  const [peopleCache, setPeopleCache] = useState({})

  // Filters apply to the posts loaded for the current page.
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('recent')
  const [withImagesOnly, setWithImagesOnly] = useState(false)

  const visible = useMemo(() => {
    let list = [...posts]
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (p) =>
          (p.description || '').toLowerCase().includes(q) ||
          (p.user?.name || '').toLowerCase().includes(q) ||
          (p.venue || '').toLowerCase().includes(q),
      )
    }
    if (withImagesOnly) list = list.filter((p) => p.imageUrls?.length)
    if (sort === 'likes') list.sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0))
    else if (sort === 'comments') list.sort((a, b) => (b.commentCount ?? 0) - (a.commentCount ?? 0))
    else list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    return list
  }, [posts, search, sort, withImagesOnly])

  const stats = useMemo(
    () => ({
      posts: posts.length,
      likes: posts.reduce((s, p) => s + (p.likeCount ?? 0), 0),
      comments: posts.reduce((s, p) => s + (p.commentCount ?? 0), 0),
    }),
    [posts],
  )

  const filtersActive = search.trim() || withImagesOnly || sort !== 'recent'

  async function openPanel(postId, tab) {
    if (panel?.id === postId && panel?.tab === tab) {
      setPanel(null)
      return
    }
    setPanel({ id: postId, tab })

    const cacheKey = `${postId}:${tab}`
    if (peopleCache[cacheKey]) return

    setPanelLoading(true)
    try {
      const list = tab === 'likes' ? await loadLikes(postId) : await loadComments(postId)
      setPeopleCache((prev) => ({ ...prev, [cacheKey]: list || [] }))
    } catch {
      setPeopleCache((prev) => ({ ...prev, [cacheKey]: [] }))
    } finally {
      setPanelLoading(false)
    }
  }

  function resetFilters() {
    setSearch('')
    setSort('recent')
    setWithImagesOnly(false)
  }

  const panelData = panel ? peopleCache[`${panel.id}:${panel.tab}`] : null

  return (
    <div>
      {/* Header */}
      <div className="relative mb-5 overflow-hidden rounded-xl border border-zinc-800">
        <div
          className="h-24 bg-cover bg-center sm:h-28"
          style={bgImage(BACKGROUNDS.socialHero)}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-void/95 via-void/75 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center gap-1 p-5">
          <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-fuchsia-400">
            <Sparkles size={12} /> Moderation
          </span>
          <h1 className="text-xl font-bold text-zinc-50 sm:text-2xl">Social Feed</h1>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile icon={ImageIcon} label="Posts on this page" value={stats.posts} accent="text-fuchsia-400" />
        <StatTile icon={Heart} label="Total likes" value={stats.likes} accent="text-rose-400" />
        <StatTile icon={MessageCircle} label="Total comments" value={stats.comments} accent="text-blue-400" />
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-zinc-800 bg-surface/70 p-3 backdrop-blur-sm">
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts, people or venues…"
            className="pl-9"
          />
        </div>

        <div className="inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-elevated/50 p-1">
          <ArrowUpDown size={14} className="ml-1.5 text-zinc-500" />
          {SORTS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSort(s.key)}
              className={cn(
                'rounded px-2.5 py-1 text-xs font-medium transition-all duration-200',
                sort === s.key ? 'bg-club-gradient text-white' : 'text-zinc-400 hover:text-zinc-100',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setWithImagesOnly((v) => !v)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all duration-200',
            withImagesOnly
              ? 'border-fuchsia-600/50 bg-fuchsia-600/15 text-fuchsia-300'
              : 'border-zinc-800 bg-elevated/50 text-zinc-400 hover:text-zinc-100',
          )}
        >
          <ImageIcon size={14} /> With images
        </button>

        {filtersActive ? (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-zinc-200"
          >
            <X size={13} /> Reset
          </button>
        ) : null}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState message="No posts found." />
      ) : visible.length === 0 ? (
        <EmptyState message="No posts match these filters." />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
          {visible.map((post) => {
            const id = post.id || post._id

            return (
              <Card
                key={id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelectedPost(post)
                  setSelectedImageIndex(0)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') setSelectedPost(post)
                }}
                className="group flex h-full cursor-pointer flex-col overflow-hidden border-zinc-800/90 bg-surface/85 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-fuchsia-400/40"
              >
                {post.imageUrls?.length ? <PostImageSlider imageUrls={post.imageUrls} /> : null}
                <CardContent className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
                  {/* Author row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={post.user?.name || 'Unknown user'} src={post.user?.avatar} size="md" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-zinc-100">{post.user?.name || 'Unknown user'}</p>
                        <div className="mt-1 flex min-w-0 flex-nowrap items-center gap-1.5 text-[11px]">
                          {relativeTime(post.createdAt) ? (
                            <span className="shrink-0 text-muted">{relativeTime(post.createdAt)}</span>
                          ) : null}
                          {post.venue ? (
                            <Badge className="min-w-0 gap-1 whitespace-nowrap bg-elevated/80 text-zinc-300">
                              <MapPin size={11} /> {post.venue}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(event) => {
                        event.stopPropagation()
                        setConfirmId(id)
                      }}
                      aria-label="Delete post"
                      className="shrink-0 hover:bg-red-500/10"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </Button>
                  </div>

                  {post.description ? (
                    <div className="min-h-14 rounded-lg border border-fuchsia-400/10 bg-elevated/35 px-3 py-2">
                      <p className="line-clamp-2 text-sm leading-relaxed text-zinc-300">{post.description}</p>
                    </div>
                  ) : null}

                  {/* Engagement bar */}
                  <div className="mt-auto flex flex-wrap items-center justify-end gap-2 border-t border-zinc-800/80 pt-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-muted">
                      <Heart size={15} />
                      <span className="font-medium">{post.likeCount ?? 0}</span>
                      <span className="text-xs">likes</span>
                    </span>

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-muted">
                      <MessageCircle size={15} />
                      <span className="font-medium">{post.commentCount ?? 0}</span>
                      <span className="text-xs">comments</span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <div className="mt-4 rounded-lg border border-zinc-800 bg-surface/70 backdrop-blur-sm">
        <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
      </div>

      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent className="max-w-xl border-fuchsia-500/25 bg-[linear-gradient(145deg,rgba(35,25,48,0.98),rgba(14,14,22,0.98))] p-0 shadow-[0_0_45px_rgba(168,85,247,0.25)]">
          {selectedPost ? (
            <>
              {selectedPost.imageUrls?.length ? (
                <div className="relative">
                  <img
                    src={selectedPost.imageUrls[selectedImageIndex]}
                    alt="Post media"
                    className="max-h-[48vh] w-full rounded-t-lg object-cover"
                  />
                  {selectedPost.imageUrls.length > 1 ? (
                    <>
                      <button
                        type="button"
                        aria-label="Previous image"
                        onClick={() => setSelectedImageIndex((index) => (index - 1 + selectedPost.imageUrls.length) % selectedPost.imageUrls.length)}
                        className="absolute left-3 top-1/2 rounded-full bg-black/55 p-1.5 text-white transition-colors hover:bg-fuchsia-600"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        type="button"
                        aria-label="Next image"
                        onClick={() => setSelectedImageIndex((index) => (index + 1) % selectedPost.imageUrls.length)}
                        className="absolute right-3 top-1/2 rounded-full bg-black/55 p-1.5 text-white transition-colors hover:bg-fuchsia-600"
                      >
                        <ChevronRight size={18} />
                      </button>
                      <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
                        {selectedPost.imageUrls.map((_, index) => (
                          <button
                            key={index}
                            type="button"
                            aria-label={`Show popup image ${index + 1}`}
                            onClick={() => setSelectedImageIndex(index)}
                            className={cn(
                              'h-1.5 rounded-full transition-all duration-200',
                              index === selectedImageIndex ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80',
                            )}
                          />
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              ) : null}
              <div className="p-5">
                <DialogHeader>
                  <DialogTitle>{selectedPost.user?.name || 'Unknown user'}'s post</DialogTitle>
                </DialogHeader>
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted">
                  {relativeTime(selectedPost.createdAt) ? <span>{relativeTime(selectedPost.createdAt)}</span> : null}
                  {selectedPost.venue ? (
                    <Badge className="gap-1 bg-elevated/80 text-zinc-300">
                      <MapPin size={11} /> {selectedPost.venue}
                    </Badge>
                  ) : null}
                </div>
                <p className="rounded-lg border border-fuchsia-400/10 bg-black/20 p-3 text-sm leading-relaxed text-zinc-200">
                  {selectedPost.description || 'No description available.'}
                </p>
                <div className="mt-4 flex justify-end gap-2 text-sm text-muted">
                  <button
                    type="button"
                    onClick={() => openPanel(selectedPost.id || selectedPost._id, 'likes')}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-colors hover:bg-rose-500/10 hover:text-rose-300',
                      panel?.id === (selectedPost.id || selectedPost._id) && panel?.tab === 'likes' && 'bg-rose-500/15 text-rose-300',
                    )}
                  >
                    <Heart size={15} /> {selectedPost.likeCount ?? 0} likes
                  </button>
                  <button
                    type="button"
                    onClick={() => openPanel(selectedPost.id || selectedPost._id, 'comments')}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-colors hover:bg-blue-500/10 hover:text-blue-300',
                      panel?.id === (selectedPost.id || selectedPost._id) && panel?.tab === 'comments' && 'bg-blue-500/15 text-blue-300',
                    )}
                  >
                    <MessageCircle size={15} /> {selectedPost.commentCount ?? 0} comments
                  </button>
                </div>
                {panel?.id === (selectedPost.id || selectedPost._id) ? (
                  <div className="mt-3 rounded-lg border border-zinc-800 bg-black/20 p-3">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      {panel.tab === 'likes' ? 'Liked by' : 'Comments'}
                    </p>
                    {panelLoading ? (
                      <p className="text-sm text-muted">Loading details...</p>
                    ) : !panelData?.length ? (
                      <p className="text-sm text-muted">
                        {panel.tab === 'likes' ? 'No likes on this post yet.' : 'No comments on this post yet.'}
                      </p>
                    ) : panel.tab === 'likes' ? (
                      <div className="flex flex-wrap gap-2">
                        {panelData.map((person, index) => (
                          <span key={person.id || person._id || index} className="rounded-full bg-elevated px-2.5 py-1 text-xs text-zinc-200">
                            {person.name || person.user?.name || 'User'}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {panelData.map((comment, index) => (
                          <div key={comment.id || comment._id || index} className="rounded-md bg-elevated/70 px-3 py-2">
                            <p className="text-xs font-medium text-zinc-200">{comment.user?.name || 'User'}</p>
                            <p className="mt-0.5 text-sm text-zinc-300">{comment.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(open) => !open && setConfirmId(null)}
        title="Delete this post?"
        description="This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => confirmId && deletePost(confirmId)}
      />
    </div>
  )
}
