import type { NewsArticle } from '@/types';

const FEEDS = [
  'https://www.theguardian.com/environment/rss',
  'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
];

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80',
  'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=400&q=80',
  'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&q=80',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80',
];

export async function fetchNews(): Promise<NewsArticle[]> {
  for (const feed of FEEDS) {
    try {
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed)}&count=12`);
      const data = await res.json();
      if (data.status === 'ok' && data.items?.length) return parseItems(data.items);
    } catch { continue; }
  }
  return getFallbackNews();
}

function parseItems(items: any[]): NewsArticle[] {
  return items.map((item, i) => ({
    title: item.title || 'News Article',
    link: item.link || '#',
    thumbnail: item.thumbnail || item.enclosure?.link || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length],
    pubDate: item.pubDate ? new Date(item.pubDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
    description: (item.description || '').replace(/<[^>]*>/g, '').substring(0, 120) + '...',
  }));
}

function getFallbackNews(): NewsArticle[] {
  const now = Date.now();
  return [
    { title: 'Global Climate Action Summit Announces New Targets', link: '#', thumbnail: FALLBACK_IMAGES[0], pubDate: new Date(now).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }), description: 'World leaders gather to set new emission reduction targets for the coming decade.' },
    { title: 'Study Links Air Pollution to Cognitive Decline', link: '#', thumbnail: FALLBACK_IMAGES[1], pubDate: new Date(now - 86400000).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }), description: 'New research shows long-term exposure to PM2.5 may affect brain function.' },
    { title: 'Renewable Energy Surpasses Coal in Global Mix', link: '#', thumbnail: FALLBACK_IMAGES[2], pubDate: new Date(now - 172800000).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }), description: 'Solar and wind now account for more power generation than coal worldwide.' },
    { title: 'Ocean Temperatures Hit Record High', link: '#', thumbnail: FALLBACK_IMAGES[3], pubDate: new Date(now - 259200000).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }), description: 'Marine scientists report unprecedented warming across all ocean basins.' },
    { title: 'Cities Adopt Green Transportation Initiatives', link: '#', thumbnail: FALLBACK_IMAGES[0], pubDate: new Date(now - 345600000).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }), description: 'Urban centers worldwide are investing in electric buses and bike lanes.' },
    { title: 'Reforestation Projects Show Promising Results', link: '#', thumbnail: FALLBACK_IMAGES[1], pubDate: new Date(now - 432000000).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }), description: 'New data shows restored forests are absorbing more carbon than expected.' },
  ];
}
