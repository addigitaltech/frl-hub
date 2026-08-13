import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { db } from '@/lib/db';
import { ArticleStatus } from '@prisma/client';

export default async function Blog() {
  // Real, published-only query. An article whose unpublishAt has passed
  // is excluded from the public list without changing its stored status
  // (see the schema comment on Article.unpublishAt) — history is kept,
  // visibility is filtered.
  let posts: Awaited<ReturnType<typeof fetchPosts>> = [];
  try {
    posts = await fetchPosts();
  } catch (err) {
    console.error('[Blog] could not load articles:', err);
  }

  return (
    <>
      <SiteHeader tagline="FRL Journal" />
      <section className="section" style={{ paddingBottom: 25 }}>
        <div className="container">
          <span className="eyebrow">FRL JOURNAL</span>
          <h1 style={{ fontSize: 48, letterSpacing: -2, margin: '16px 0 8px' }}>FRL Journal</h1>
          <p className="lead">Ideas, insights, stories and updates from FutureReadiness Lab.</p>
        </div>
      </section>
      <main className="section">
        <div className="container">
          {posts.length === 0 ? (
            <p className="lead">No articles have been published yet. Check back soon.</p>
          ) : (
            <div className="grid3">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="article" style={{ display: 'block' }}>
                  <span className="tag">{post.categories[0]?.name ?? 'FRL Update'}</span>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <span style={{ fontWeight: 800, color: 'var(--green)' }}>
                    {post.readingTimeMinutes} min read →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

async function fetchPosts() {
  const now = new Date();
  return db.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      OR: [{ unpublishAt: null }, { unpublishAt: { gt: now } }],
    },
    include: { categories: true },
    orderBy: { publishedAt: 'desc' },
    take: 30,
  });
}
