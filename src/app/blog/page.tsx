import type { Metadata } from 'next'
import { BlogListing } from '@/components/blog/BlogListing'

export const metadata: Metadata = {
  title: 'Blog — XTOOLS.PL | Reklama, AI i marketing cyfrowy',
  description: 'Artykuły o generowaniu kreacji z AI, kampaniach reklamowych, social media i e-commerce. Praktyczna wiedza dla marketerów i agencji.',
  openGraph: {
    title: 'Blog XTOOLS.PL — AI, reklama, marketing',
    description: 'Praktyczne artykuły o tworzeniu reklam z AI, kampaniach i social media.',
    url: 'https://xtools.pl/blog',
    siteName: 'XTOOLS.PL',
    type: 'website',
  },
  alternates: { canonical: 'https://xtools.pl/blog' },
}

export default function BlogPage() {
  return <BlogListing />
}
