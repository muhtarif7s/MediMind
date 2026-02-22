import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MediMind Medication Tracker',
    short_name: 'MediMind',
    description: 'Intelligent medication manager with AI refill alerts.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f0f9ff',
    theme_color: '#bae6fd',
    categories: ['medical', 'health', 'lifestyle'],
    icons: [
      {
        src: 'https://picsum.photos/seed/icon/192/192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: 'https://picsum.photos/seed/icon/512/512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
    ],
  }
}