import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Priora | Finish Before It\'s Urgent',
    short_name: 'Priora',
    description: 'An elite productivity planner that actively helps you finish work before deadlines become emergencies.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#F1F5E2',
    theme_color: '#6D9C9F',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/icon.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  }
}
