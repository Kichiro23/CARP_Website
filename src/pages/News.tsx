import { useState, useEffect } from 'react';
import { ExternalLink, Calendar, RefreshCw, Newspaper, MapPin } from 'lucide-react';
import { fetchNews } from '@/services/newsApi';
import type { NewsArticle } from '@/types';
import type { SavedLocation } from '@/hooks/useLocation';

const NEWS_FALLBACK = './news-fallback.jpg';

interface Props { current: SavedLocation; }

export default function News(_props: Props) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const data = await fetchNews();
      setArticles(data);
      if (data.length === 0) setError('No articles available at the moment.');
    } catch { setError('Failed to load news.'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  if (loading) return (
    <div>
      <div className="mb-4"><h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Climate News</h1><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Latest environmental updates</p></div>
      <div className="grid-tiles-2">{[1,2,3,4].map(i => <div key={i} className="tile"><div className="skeleton mb-3 h-32 w-full rounded-lg" /><div className="skeleton mb-2 h-4 w-3/4" /><div className="skeleton h-3 w-full" /></div>)}</div>
    </div>
  );

  if (error) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
      <Newspaper className="h-10 w-10" style={{ color: 'var(--text-muted)' }} />
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{error}</p>
      <button onClick={load} className="glass-btn px-5 py-2 text-xs"><RefreshCw className="mr-1 h-3 w-3" /> Retry</button>
    </div>
  );

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Climate News</h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}><MapPin className="mr-1 inline h-3 w-3" style={{ color: 'var(--primary)' }} />Global environmental updates</p>
        </div>
        <button onClick={load} className="glass-badge cursor-pointer"><RefreshCw className="mr-1 h-3 w-3" style={{ color: 'var(--primary)' }} /> Refresh</button>
      </div>
      {articles.length === 0 ? (
        <div className="tile text-center py-12"><Newspaper className="mx-auto mb-3 h-8 w-8" style={{ color: 'var(--text-muted)' }} /><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No articles available</p></div>
      ) : (
        <div className="grid-tiles-2">
          {articles.map((a, i) => (
            <a key={i} href={a.link} target="_blank" rel="noopener noreferrer" className="tile block transition-all hover:border-[#EA9D6330]">
              <div className="mb-3 overflow-hidden rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <img
                  src={a.thumbnail || NEWS_FALLBACK}
                  alt=""
                  className="h-40 w-full object-cover transition-transform duration-500 hover:scale-105"
                  onError={e => { (e.target as HTMLImageElement).src = NEWS_FALLBACK; }}
                  loading="lazy"
                />
              </div>
              <h3 className="mb-2 text-sm font-bold leading-snug text-clamp-2" style={{ color: 'var(--text)' }}>{a.title}</h3>
              <p className="mb-3 text-xs leading-relaxed text-clamp-3" style={{ color: 'var(--text-secondary)' }}>{a.description}</p>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}><Calendar className="h-3 w-3" />{a.pubDate}</span>
                <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: 'var(--primary)' }}><ExternalLink className="h-3 w-3" /> Read</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
