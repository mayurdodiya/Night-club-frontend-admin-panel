// Single place to control which photo sits behind each surface of the admin panel.
// Swap a filename here and the change applies wherever that surface is rendered.
//
// Every surface below uses a DIFFERENT photo, so the sidebar never shares an image
// with the area next to it.
//
// Files live in public/images/ — reference them from the site root ("/images/...").

export const BACKGROUNDS = {
  // Tall, narrow sidebar. stage-lights is the only portrait image (335x597),
  // so it crops best in this shape.
  sidebar: '/images/stage-lights-crowd.jpg',

  // Small logo block at the top of the sidebar.
  sidebarHeader: '/images/dj-booth-crowd.jpg',

  // Full-page backdrop behind the dashboard. party-crowd-hero is the only true HD
  // asset (1920x1080), so it is the one that stays sharp at full-page size.
  // dashboardBackdrop: '/images/party-crowd-hero.jpg',
  dashboardBackdrop: '/images/dashboard-image.jpg',

  // dashboard top streep banner.
  // dashboardHero: '/images/club-crowd-blue.jpg',
  dashboardHero: '/images/dashboard-image.jpg',
  dashboardHero: '/images/h3.jpg',

  // Banner strip at the top of the Social Feed page.
  socialHero: '/images/club-crowd-purple.jpg',
  // socialHero: '/images/dashboard-image.jpg',
}

// Opacity for the two faint backdrop layers. Kept low on purpose so the photo reads
// as atmosphere and never competes with the content on top of it.
export const BACKDROP_OPACITY = {
  sidebar: 0.16,
  dashboard: 0.12,
}

// Convenience helper for inline style objects.
export function bgImage(path) {
  return { backgroundImage: `url('${path}')` }
}
