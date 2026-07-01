import type { MetadataRoute } from 'next'
import { BLOG_POSTS } from '@/lib/blogPosts'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://xtools.pl'

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/creator`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/composer`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/logowanie`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/rejestracja`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
  ]

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map(post => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...blogRoutes]
}
