const WORDS_PER_MINUTE = 200;

export function estimateReadingTime(html: string | null | undefined): number {
  if (!html) return 0;
  const text = html.replace(/<[^>]+>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
