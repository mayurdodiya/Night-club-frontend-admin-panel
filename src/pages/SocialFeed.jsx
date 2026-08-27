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
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Avatar, AvatarStack } from '@/components/shared/Avatar'
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
              onClick={() => setActiveIndex(index)}
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
            const isLikesOpen = panel?.id === id && panel?.tab === 'likes'
            const isCommentsOpen = panel?.id === id && panel?.tab === 'comments'

            return (
              <Card key={id} className="overflow-hidden bg-surface/80 backdrop-blur-sm hover:translate-y-0">
                {post.imageUrls?.length ? <PostImageSlider imageUrls={post.imageUrls} /> : null}
                <CardContent className="space-y-3 p-3 sm:p-4">
                  {/* Author row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={post.user?.name || 'Unknown user'} src={post.user?.avatar} size="md" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-zinc-100">{post.user?.name || 'Unknown user'}</p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                          {relativeTime(post.createdAt) ? <span>{relativeTime(post.createdAt)}</span> : null}
                          {post.venue ? (
                            <Badge className="gap-1 bg-elevated/80 text-zinc-300">
                              <MapPin size={11} /> {post.venue}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setConfirmId(id)}
                      aria-label="Delete post"
                      className="shrink-0 hover:bg-red-500/10"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </Button>
                  </div>

                  {post.description ? (
                    <div className="rounded-lg border border-zinc-800/80 bg-elevated/35 px-3 py-2">
                      <p className="text-sm leading-relaxed text-zinc-300">{post.description}</p>
                    </div>
                  ) : null}

                  {/* Engagement bar */}
                  <div className="flex flex-wrap items-center justify-end gap-2 border-t border-zinc-800/80 pt-3">
                    <button
                      type="button"
                      onClick={() => openPanel(id, 'likes')}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-all duration-200',
                        isLikesOpen
                          ? 'bg-rose-500/15 text-rose-300'
                          : 'text-muted hover:bg-elevated/60 hover:text-rose-300',
                      )}
                    >
                      <Heart size={15} className={cn(isLikesOpen && 'fill-rose-400 text-rose-400')} />
                      <span className="font-medium">{post.likeCount ?? 0}</span>
                      <span className="text-xs">likes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openPanel(id, 'comments')}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-all duration-200',
                        isCommentsOpen
                          ? 'bg-blue-500/15 text-blue-300'
                          : 'text-muted hover:bg-elevated/60 hover:text-blue-300',
                      )}
                    >
                      <MessageCircle size={15} />
                      <span className="font-medium">{post.commentCount ?? 0}</span>
                      <span className="text-xs">comments</span>
                    </button>

                    {/* Preview of who liked, once loaded */}
                    {peopleCache[`${id}:likes`]?.length ? (
                      <div className="ml-auto flex items-center gap-2">
                        <AvatarStack people={peopleCache[`${id}:likes`]} max={4} />
                      </div>
                    ) : null}
                  </div>

                  {/* Expandable panel */}
                  {isLikesOpen || isCommentsOpen ? (
                    <div className="rounded-lg border border-zinc-800 bg-elevated/60 p-3">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                        {isLikesOpen ? 'Liked by' : 'Comments'}
                      </p>

                      {panelLoading && !panelData ? (
                        <div className="space-y-2">
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-2/3" />
                        </div>
                      ) : !panelData || panelData.length === 0 ? (
                        <p className="text-sm text-muted">
                          {isLikesOpen ? 'No likes on this post yet.' : 'No comments on this post yet.'}
                        </p>
                      ) : isLikesOpen ? (
                        <ul className="flex flex-wrap gap-2">
                          {panelData.map((u, i) => (
                            <li
                              key={u.id || u._id || i}
                              className="flex items-center gap-2 rounded-full border border-zinc-800 bg-surface/80 py-1 pl-1 pr-3"
                            >
                              <Avatar name={u.name || u.user?.name || 'User'} src={u.avatar} size="xs" />
                              <span className="text-xs text-zinc-200">{u.name || u.user?.name || 'User'}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <ul className="space-y-3">
                          {panelData.map((c, i) => (
                            <li key={c.id || c._id || i} className="flex gap-2.5">
                              <Avatar name={c.user?.name || 'User'} src={c.user?.avatar} size="sm" />
                              <div className="min-w-0 flex-1 rounded-lg bg-surface/80 px-3 py-2">
                                <div className="flex flex-wrap items-baseline gap-2">
                                  <span className="text-sm font-medium text-zinc-100">
                                    {c.user?.name || 'User'}
                                  </span>
                                  {relativeTime(c.createdAt) ? (
                                    <span className="text-[11px] text-zinc-500">{relativeTime(c.createdAt)}</span>
                                  ) : null}
                                </div>
                                <p className="mt-0.5 text-sm text-zinc-300">{c.description}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <div className="mt-4 rounded-lg border border-zinc-800 bg-surface/70 backdrop-blur-sm">
        <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
      </div>

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
