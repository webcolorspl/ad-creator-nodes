import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BLOG_POSTS } from '@/lib/blogPosts'
import { BlogArticle } from '@/components/blog/BlogArticle'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return BLOG_POSTS.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = BLOG_POSTS.find(p => p.slug === slug)
  if (!post) return {}
  return {
    title: `${post.title} — XTOOLS.PL`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://xtools.pl/blog/${post.slug}`,
      siteName: 'XTOOLS.PL',
      type: 'article',
      publishedTime: post.date,
    },
    alternates: { canonical: `https://xtools.pl/blog/${post.slug}` },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const idx = BLOG_POSTS.findIndex(p => p.slug === slug)
  if (idx === -1) notFound()
  const post = BLOG_POSTS[idx]
  const related = BLOG_POSTS
    .filter(p => p.category === post.category && p.slug !== post.slug)
    .slice(0, 3)
  const prev = idx > 0 ? BLOG_POSTS[idx - 1] : null
  const next = idx < BLOG_POSTS.length - 1 ? BLOG_POSTS[idx + 1] : null
  return <BlogArticle post={post} related={related} prev={prev} next={next} />
}
