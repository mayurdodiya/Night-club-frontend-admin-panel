export function EmptyState({ message = 'Nothing here yet.' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p className="text-muted">{message}</p>
    </div>
  )
}
