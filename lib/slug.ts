import slugify from 'slugify';
import { db } from './db';

// Generic uniqueness loop shared by every sluggable model. Two editors
// publishing similarly-titled items the same day is common enough to
// design for, and the @unique DB constraint on each model's slug column
// remains the real backstop either way.
async function uniqueSlug(
  title: string,
  fallback: string,
  exists: (slug: string) => Promise<boolean>
): Promise<string> {
  const base = slugify(title, { lower: true, strict: true }).slice(0, 80) || fallback;
  let slug = base;
  let suffix = 1;
  while (await exists(slug)) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
  return slug;
}

export function uniqueArticleSlug(title: string, excludeId?: string) {
  return uniqueSlug(title, 'article', async (slug) => {
    const found = await db.article.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    });
    return !!found;
  });
}

export function uniqueProgramSlug(title: string, excludeId?: string) {
  return uniqueSlug(title, 'program', async (slug) => {
    const found = await db.program.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    });
    return !!found;
  });
}

export function uniqueActivitySlug(title: string, excludeId?: string) {
  return uniqueSlug(title, 'activity', async (slug) => {
    const found = await db.activity.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    });
    return !!found;
  });
}

export function uniqueEventSlug(title: string, excludeId?: string) {
  return uniqueSlug(title, 'event', async (slug) => {
    const found = await db.event.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    });
    return !!found;
  });
}
