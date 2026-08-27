import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Pagination({ page, limit, total, onPageChange }) {
  const totalPages = total ? Math.max(1, Math.ceil(total / limit)) : null

  return (
    <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-3 text-sm text-muted">
      <span>
        Page {page}
        {totalPages ? ` of ${totalPages}` : ''}
      </span>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft size={16} />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={totalPages ? page >= totalPages : false}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}
