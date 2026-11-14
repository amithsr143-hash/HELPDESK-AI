import React, { useState, useEffect } from 'react';
import { BookOpen, Search, ChevronDown, ChevronUp, Sparkles, Tag } from 'lucide-react';
import { kbService } from '../../services/kb.service';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const CustomerKnowledgeBasePage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const fetchArticles = async (query = '') => {
    setLoading(true);
    try {
      const res = await kbService.getPublished({ query });
      if (res?.data) {
        setArticles(res.data);
      }
    } catch (err) {
      console.error('Failed to load KB articles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchArticles(search);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (!val.trim()) {
      fetchArticles('');
    }
  };


  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/15">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Official Help Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            How can we help you today?
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-brand-100 leading-relaxed">
            Search our verified FAQ knowledge base. All answers are curated by platform administrators and grounded directly into our AI assistant.
          </p>

          <form onSubmit={handleSearch} className="mt-6 relative max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by keywords: refund, password, tracking..."
              className="w-full pl-11 pr-4 py-3 rounded-xl text-xs sm:text-sm text-slate-900 bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </form>
        </div>
      </div>

      {/* Articles List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Published FAQ Articles ({articles.length})
          </h2>
          {search && (
            <button
              onClick={() => {
                setSearch('');
                fetchArticles('');
              }}
              className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
            >
              Clear search filter
            </button>
          )}
        </div>

        {loading ? (
          <LoadingSpinner text="Loading published articles..." />
        ) : articles.length > 0 ? (
          <div className="space-y-3">
            {articles.map((art) => {
              const isExpanded = expandedId === art.id;
              return (
                <div
                  key={art.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition"
                >
                  <button
                    onClick={() => toggleExpand(art.id)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                  >
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                          {art.category_name || 'FAQ'}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {art.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{art.question}</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-4 animate-fadeIn">
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 whitespace-pre-wrap">
                        {art.answer}
                      </div>

                      {art.keywords && art.keywords.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                          <Tag className="w-3.5 h-3.5 text-slate-400" />
                          <span>Keywords:</span>
                          {art.keywords.map((kw, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px]"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No articles match your query"
            description="Try searching with different terms like 'refund', 'tracking', or 'password'."
          />
        )}
      </div>
    </div>
  );
};

