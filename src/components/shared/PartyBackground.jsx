import { cn } from '@/lib/utils'

const PHOTOS = {
  full: '/images/party-crowd-hero.jpg',
  ambient: '/images/image-2.jpg',
}

const VIDEOS = {
  full: '/images/vd1.mp4',
}

export function PartyBackground({ intensity = 'full', className }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      {VIDEOS[intensity] ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={VIDEOS[intensity]}
          autoPlay
          loop
          muted
          playsInline
        />
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${PHOTOS[intensity] || PHOTOS.full})` }}
        />
      )}

      <div className="absolute inset-0 bg-black/45" />
    </div>
  )
}
