export function delay(data, ms = 400) {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}

function paginate(items, page, limit) {
  const start = (page - 1) * limit
  return {
    data: items.slice(start, start + limit),
    total: items.length,
    page,
    limit,
  }
}

export const mockAdmin = { email: 'admin@nightclub.dev', name: 'Demo Admin' }

export const mockVenues = [
  {
    _id: 'venue-1',
    name: 'Skyline Lounge',
    address: 'SG Highway, Ahmedabad',
    latitude: 23.0225,
    longitude: 72.5714,
    description: 'Rooftop lounge with live DJ and city views.',
    imageUrls: ['https://picsum.photos/seed/venue1/400/300'],
    amenities: ['Parking', 'AC'],
    offers: ['2+1 on cocktails'],
    isFeatured: true,
  },
  {
    _id: 'venue-2',
    name: 'Neon Basement',
    address: 'CG Road, Ahmedabad',
    latitude: 23.0339,
    longitude: 72.5583,
    description: 'Underground techno club with laser shows.',
    imageUrls: ['https://picsum.photos/seed/venue2/400/300'],
    amenities: ['VIP Booths', 'Coat Check'],
    offers: [],
    isFeatured: false,
  },
  {
    _id: 'venue-3',
    name: 'Velvet Room',
    address: 'Prahlad Nagar, Ahmedabad',
    latitude: 23.0104,
    longitude: 72.5066,
    description: 'Speakeasy-style bar with live jazz on weekends.',
    imageUrls: ['https://picsum.photos/seed/venue3/400/300'],
    amenities: ['Live Music', 'Valet'],
    offers: ['Ladies night Wednesday'],
    isFeatured: false,
  },
]

export const mockEvents = [
  {
    _id: 'event-1',
    name: 'New Year Bash',
    address: 'SG Highway, Ahmedabad',
    latitude: 23.0225,
    longitude: 72.5714,
    description: 'Countdown party with international DJs.',
    imageUrls: ['https://picsum.photos/seed/event1/400/300'],
    amenities: ['Parking'],
    offers: ['Early bird discount'],
    isFeatured: true,
  },
  {
    _id: 'event-2',
    name: 'Retro Night',
    address: 'CG Road, Ahmedabad',
    latitude: 23.0339,
    longitude: 72.5583,
    description: '90s and 2000s throwback night.',
    imageUrls: ['https://picsum.photos/seed/event2/400/300'],
    amenities: [],
    offers: [],
    isFeatured: false,
  },
]

export const mockUsers = [
  { _id: 'user-1', name: 'Aditi Shah', countryCode: '+91', phone: '9876543210', email: 'aditi@example.com', createdAt: '2026-06-12T10:00:00Z' },
  { _id: 'user-2', name: 'Rohan Mehta', countryCode: '+91', phone: '9812345678', email: 'rohan@example.com', createdAt: '2026-07-02T10:00:00Z' },
  { _id: 'user-3', name: 'Priya Nair', countryCode: '+91', phone: '9900112233', email: 'priya@example.com', createdAt: '2026-07-18T10:00:00Z' },
  { _id: 'user-4', name: 'Karan Verma', countryCode: '+91', phone: '9765432109', email: 'karan@example.com', createdAt: '2026-08-01T10:00:00Z' },
]

export const mockSubscriptionPlans = [
  { _id: 'plan-1', name: 'Monthly', amount: 599, duration: 'month' },
  { _id: 'plan-2', name: 'Quarterly', amount: 1499, duration: 'quarter' },
  { _id: 'plan-3', name: 'Annual', amount: 4999, duration: 'year' },
]

const mockComments = {
  'post-1': [
    { _id: 'c-1', user: { name: 'Rohan Mehta' }, description: 'Looks amazing!', createdAt: '2026-08-20T19:12:00Z' },
    { _id: 'c-2', user: { name: 'Priya Nair' }, description: 'Wish I was there.', createdAt: '2026-08-20T20:40:00Z' },
  ],
  'post-2': [
    { _id: 'c-3', user: { name: 'Karan Verma' }, description: 'Great vibes!', createdAt: '2026-08-18T22:05:00Z' },
  ],
  'post-3': [
    { _id: 'c-4', user: { name: 'Aditi Shah' }, description: 'That drop was insane.', createdAt: '2026-08-22T23:30:00Z' },
    { _id: 'c-5', user: { name: 'Rohan Mehta' }, description: 'Best set of the month.', createdAt: '2026-08-23T00:05:00Z' },
    { _id: 'c-6', user: { name: 'Priya Nair' }, description: 'Booking for next week already.', createdAt: '2026-08-23T09:15:00Z' },
  ],
  'post-4': [],
  'post-5': [
    { _id: 'c-7', user: { name: 'Karan Verma' }, description: 'Rooftop views are unreal.', createdAt: '2026-08-25T21:44:00Z' },
  ],
  'post-6': [
    { _id: 'c-8', user: { name: 'Aditi Shah' }, description: 'The rooftop looked incredible tonight!', createdAt: '2026-08-26T22:45:00Z' },
    { _id: 'c-9', user: { name: 'Karan Verma' }, description: 'That DJ set was absolutely perfect.', createdAt: '2026-08-26T23:02:00Z' },
  ],
  'post-7': [
    { _id: 'c-10', user: { name: 'Rohan Mehta' }, description: 'The energy in this room was unreal.', createdAt: '2026-08-27T00:05:00Z' },
    { _id: 'c-11', user: { name: 'Aditi Shah' }, description: 'Best night out this weekend!', createdAt: '2026-08-27T00:18:00Z' },
  ],
  'post-8': [
    { _id: 'c-12', user: { name: 'Priya Nair' }, description: 'Such a beautiful intimate set.', createdAt: '2026-08-27T00:50:00Z' },
  ],
  'post-9': [
    { _id: 'c-13', user: { name: 'Aditi Shah' }, description: 'This looks like such a fun night!', createdAt: '2026-08-27T01:22:00Z' },
    { _id: 'c-14', user: { name: 'Rohan Mehta' }, description: 'The atmosphere is perfect.', createdAt: '2026-08-27T01:35:00Z' },
  ],
}

// Who liked each post. Mirrors GET /social-feed/:id/likes on the real API.
const mockLikes = {
  'post-1': [
    { _id: 'user-2', name: 'Rohan Mehta' },
    { _id: 'user-3', name: 'Priya Nair' },
    { _id: 'user-4', name: 'Karan Verma' },
  ],
  'post-2': [
    { _id: 'user-1', name: 'Aditi Shah' },
    { _id: 'user-3', name: 'Priya Nair' },
  ],
  'post-3': [
    { _id: 'user-1', name: 'Aditi Shah' },
    { _id: 'user-2', name: 'Rohan Mehta' },
    { _id: 'user-4', name: 'Karan Verma' },
  ],
  'post-4': [{ _id: 'user-2', name: 'Rohan Mehta' }],
  'post-5': [
    { _id: 'user-1', name: 'Aditi Shah' },
    { _id: 'user-3', name: 'Priya Nair' },
  ],
  'post-6': [
    { _id: 'user-1', name: 'Aditi Shah' },
    { _id: 'user-3', name: 'Priya Nair' },
    { _id: 'user-4', name: 'Karan Verma' },
  ],
  'post-7': [
    { _id: 'user-1', name: 'Aditi Shah' },
    { _id: 'user-2', name: 'Rohan Mehta' },
    { _id: 'user-4', name: 'Karan Verma' },
  ],
  'post-8': [
    { _id: 'user-2', name: 'Rohan Mehta' },
    { _id: 'user-3', name: 'Priya Nair' },
  ],
  'post-9': [
    { _id: 'user-1', name: 'Aditi Shah' },
    { _id: 'user-2', name: 'Rohan Mehta' },
    { _id: 'user-4', name: 'Karan Verma' },
  ],
}

export const mockSocialFeed = [
  {
    _id: 'post-1',
    user: { name: 'Aditi Shah', avatar: '/images/pf1.jpg' },
    description: 'Great night out at Skyline Lounge with amazing music, flowing cocktails, and a dance floor full of energy until late.',
    imageUrls: ['/images/p1.jpg', '/images/p6.jpg'],
    likeCount: 24,
    commentCount: 2,
    venue: 'Skyline Lounge',
    createdAt: '2026-08-20T18:30:00Z',
  },
  {
    _id: 'post-2',
    user: { name: 'Rohan Mehta', avatar: '/images/pf2.jpg' },
    description: 'Retro Night was unreal, with throwback anthems, colorful lights, and everyone singing along to their favorite classics.',
    imageUrls: ['/images/p2.jpg', '/images/p7.jpg'],
    likeCount: 11,
    commentCount: 1,
    venue: 'Neon Basement',
    createdAt: '2026-08-18T21:10:00Z',
  },
  {
    _id: 'post-3',
    user: { name: 'Priya Nair', avatar: '/images/pf3.jpg' },
    description: 'Techno till sunrise at Neon Basement, where the laser show, deep bass, and packed dance floor created an unforgettable night.',
    imageUrls: ['/images/p3.jpg', '/images/p6.jpg'],
    likeCount: 47,
    commentCount: 3,
    venue: 'Neon Basement',
    createdAt: '2026-08-22T23:05:00Z',
  },
  {
    _id: 'post-4',
    user: { name: 'Karan Verma', avatar: '/images/pf4.jpg' },
    description: 'Velvet Room jazz night brought a completely different mood with smooth live music, intimate seating, and beautifully crafted drinks.',
    imageUrls: ['/images/p4.jpg'],
    likeCount: 6,
    commentCount: 0,
    venue: 'Velvet Room',
    createdAt: '2026-08-24T20:00:00Z',
  },
  {
    _id: 'post-5',
    user: { name: 'Aditi Shah', avatar: '/images/pf5.jpg' },
    description: 'Sunset session on the rooftop before the crowd arrived, with warm city views, relaxed conversations, and the perfect evening atmosphere.',
    imageUrls: ['/images/p5.jpg', '/images/p7.jpg'],
    likeCount: 33,
    commentCount: 1,
    venue: 'Skyline Lounge',
    createdAt: '2026-08-25T19:20:00Z',
  },
  {
    _id: 'post-6',
    user: { name: 'Rohan Mehta', avatar: '/images/pf6.jpg' },
    description: 'Friday lights, rooftop views, and the perfect soundtrack made this a memorable evening for friends enjoying the city from above.',
    imageUrls: ['/images/p8.jpg', '/images/p1.jpg'],
    likeCount: 29,
    commentCount: 4,
    venue: 'Skyline Lounge',
    createdAt: '2026-08-26T22:15:00Z',
  },
  {
    _id: 'post-7',
    user: { name: 'Priya Nair', avatar: '/images/pf7.jpg' },
    description: 'A packed dance floor and unforgettable energy defined the weekend takeover, with powerful beats and an incredible crowd from start to finish.',
    imageUrls: ['/images/p9.jpg', '/images/p3.jpg'],
    likeCount: 38,
    commentCount: 5,
    venue: 'Neon Basement',
    createdAt: '2026-08-26T23:40:00Z',
  },
  {
    _id: 'post-8',
    user: { name: 'Karan Verma', avatar: '/images/pf8.jpg' },
    description: 'Late-night moments from an intimate set at Velvet Room, where soulful performances and a warm atmosphere made the evening feel truly special.',
    imageUrls: ['/images/p10.jpg', '/images/p4.jpg'],
    likeCount: 18,
    commentCount: 2,
    venue: 'Velvet Room',
    createdAt: '2026-08-27T00:30:00Z',
  },
  {
    _id: 'post-9',
    user: { name: 'Meera Joshi', avatar: '/images/pf9.jpg' },
    description: 'A vibrant night of music, friends, and city lights with every moment captured on the dance floor.',
    imageUrls: ['/images/p6.jpg', '/images/p2.jpg'],
    likeCount: 26,
    commentCount: 3,
    venue: 'Skyline Lounge',
    createdAt: '2026-08-27T01:10:00Z',
  },
]

export const mockDb = {
  venues: [...mockVenues],
  events: [...mockEvents],
  users: [...mockUsers],
  plans: [...mockSubscriptionPlans],
  posts: [...mockSocialFeed],
  comments: { ...mockComments },
  likes: { ...mockLikes },
}

export { paginate }
