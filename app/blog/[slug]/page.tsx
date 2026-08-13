import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { db } from '@/lib/db';
import { ArticleStatus } from '@prisma/client';

async function getPublishedArticle(slug: string) {
  const now = new Date();
  const article = await db.article.findFirst({
    where: {
      slug,
      status: ArticleStatus.PUBLISHED,
      OR: [{ unpublishAt: null }, { unpublishAt: { gt: now } }],
    },
    include: { author: { select: { name: true } }, categories: true, tags: true },
  });
  return article;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);
  if (!article) return {};
  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt || undefined,
    openGraph: article.featuredImageUrl ? { images: [article.featuredImageUrl] } : undefined,
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);
  if (!article) notFound();

  // Best-effort view count — not awaited into the response path, and a
  // failure here should never break the page render.
  db.article.update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } }).catch((err) => {
    console.error('[ArticlePage] view count increment failed:', err);
  });

  return (
    <>
      <SiteHeader tagline="FRL Journal" />
      <main className="section">
        <div className="container" style={{ maxWidth: 780 }}>
          <span className="tag">{article.categories[0]?.name ?? 'FRL Update'}</span>
          <h1 style={{ fontSize: 40, letterSpacing: -1, margin: '12px 0' }}>{article.title}</h1>
          <p className="lead" style={{ marginBottom: 24 }}>
            By {article.author?.name} · {article.readingTimeMinutes} min read
            {article.publishedAt &&
              ` · ${new Date(article.publishedAt).toLocaleDateString('en-GB', { timeZone: 'Africa/Lagos', day: 'numeric', month: 'long', year: 'numeric' })}`}
          </p>
          {article.featuredImageUrl && (
            <img src={article.featuredImageUrl} alt="" style={{ width: '100%', borderRadius: 18, marginBottom: 24 }} />
          )}
          <div
            className="editable prose"
            dangerouslySetInnerHTML={{ __html: article.contentHtml ?? '' }}
          />
          {article.tags.length > 0 && (
            <div style={{ marginTop: 30, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {article.tags.map((tag) => (
                <span key={tag.id} className="pill graypill">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
