import type { NewsArticle } from '@/types';

const CACHE_KEY = 'carp_news_cache';
const CACHE_TTL = 30 * 60 * 1000;
const FALLBACK_IMAGE = './news-fallback.jpg';

function getCache(): NewsArticle[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return Array.isArray(data) ? data : null;
  } catch { return null; }
}
function setCache(data: NewsArticle[]) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })); } catch {}
}

function sanitizeTitle(title: string): string {
  return title.replace(/<[^>]*>/g, '').trim();
}

function sanitizeDescription(desc: string): string {
  return desc.replace(/<[^>]*>/g, '').trim().slice(0, 220);
}

function extractThumbnail(item: any): string {
  if (item.enclosure?.link) return item.enclosure.link;
  if (item.thumbnail) return item.thumbnail;
  return FALLBACK_IMAGE;
}

export async function fetchNews(): Promise<NewsArticle[]> {
  try {
    const feeds = [
      'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.theguardian.com%2Fuk%2Fenvironment%2Frss',
      'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Ffeeds.bbci.co.uk%2Fnews%2Fscience_and_environment%2Frss.xml',
    ];
    const results = await Promise.all(feeds.map(async (url) => {
      try {
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();
        if (!data.items || !Array.isArray(data.items)) return [];
        return data.items.map((item: any) => ({
          title: sanitizeTitle(item.title || ''),
          description: sanitizeDescription(item.description || item.content || ''),
          link: item.link || '',
          pubDate: new Date(item.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          thumbnail: extractThumbnail(item),
          source: data.feed?.title || 'News',
        }));
      } catch { return []; }
    }));
    const all = results.flat().slice(0, 12);
    if (all.length > 0) { setCache(all); return all; }
  } catch {}
  return getCache() || [];
}
