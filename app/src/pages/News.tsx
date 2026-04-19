import { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { fetchNews } from '@/services/newsApi';
import type { NewsArticle } from '@/types';

export default function News() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => { setLoading(true); setArticles(await fetchNews()); setLoading(false); };
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>News</h1>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>Latest climate and environmental news</p>
        </div>
        <button onClick={load} className="glass-badge cursor-pointer" style={{ color: 'var(--text)' }}>
          <RefreshCw className="mr-1 h-3 w-3" style={{ color: 'var(--primary)' }} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="tile !p-0 overflow-hidden">
              <div className="skeleton" style={{ height: 160 }} />
              <div className="p-4 space-y-2">
                <div className="skeleton" style={{ height: 16, width: '80%' }} />
                <div className="skeleton" style={{ height: 12 }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a, i) => (
            <a key={i} href={a.link || '#'} target="_blank" rel="noopener noreferrer" className="group tile !p-0 overflow-hidden transition-all hover:-translate-y-1.5 hover:border-[var(--primary)]/30 block">
              <div className="relative h-40 overflow-hidden">
                <img src={a.thumbnail || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80'} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute right-3 top-3 rounded-lg p-1.5 opacity-0 transition-opacity group-hover:opacity-100" style={{ background: 'var(--primary)' }}>
                  <ExternalLink className="h-3.5 w-3.5 text-white" />
                </div>
              </div>
              <div className="p-4">
                <div className="mb-2 flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold" style={{ color: 'var(--primary)' }}>{a.pubDate}</span>
                  {a.source && <><span style={{ color: 'var(--text-muted)' }}>&bull;</span><span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{a.source}</span></>}
                </div>
                <h3 className="mb-2 text-sm font-bold leading-snug transition-colors group-hover:text-[#EA9D63] text-clamp-2" style={{ color: 'var(--text)' }}>{a.title}</h3>
                <p className="text-xs leading-relaxed text-clamp-3" style={{ color: 'var(--text-secondary)' }}>{a.description}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
