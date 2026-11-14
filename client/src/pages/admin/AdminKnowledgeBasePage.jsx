import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Tag,
  Loader2
} from 'lucide-react';
import { kbService } from '../../services/kb.service';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export const AdminKnowledgeBasePage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await kbService.getAllAdmin({ query: search });
      if (res?.data) {
        setArticles(res.data);
      }
    } catch (err) {
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleOpenCreate = () => {
    setEditingArticle(null);
    setTitle('');
    setQuestion('');
    setAnswer('');
    setKeywords('');
    setIsPublished(true);
    setShowModal(true);
  };

  const handleOpenEdit = (article) => {
    setEditingArticle(article);
    setTitle(article.title);
    setQuestion(article.question);
    setAnswer(article.answer);
    setKeywords(article.keywords ? article.keywords.join(', ') : '');
    setIsPublished(Boolean(article.is_published));
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const keywordsArray = keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    try {
      if (editingArticle) {
        await kbService.updateArticle(editingArticle.id, {
          title,
          question,
          answer,
          keywords: keywordsArray,
          is_published: isPublished
        });
        toast.success('Article updated successfully');
      } else {
        await kbService.createArticle({
          title,
          question,
          answer,
          keywords: keywordsArray,
          is_published: isPublished
        });
        toast.success('Knowledge Base article published');
      }
      setShowModal(false);
      fetchArticles();
    } catch (err) {
      toast.error(err.message || 'Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Knowledge Base article?')) {
      return;
    }
    try {
      await kbService.deleteArticle(id);
      toast.success('Article removed');
      fetchArticles();
    } catch (err) {
      toast.error('Failed to delete article');
    }
  };

  const handleTogglePublish = async (article) => {
    try {
      await kbService.updateArticle(article.id, {
        is_published: !article.is_published
      });
      toast.success(`Article ${!article.is_published ? 'Published' : 'Unpublished'}`);
      fetchArticles();
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Knowledge Base CMS
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Publish verified FAQs. Only published articles are indexed by Gemini AI for customer support.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 transition"
        >
          <Plus className="w-4 h-4" /> New Article
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchArticles()}
            placeholder="Search FAQs by title or question..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Articles Grid / List */}
      {loading ? (
        <LoadingSpinner text="Loading Knowledge Base articles..." />
      ) : articles.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
          {articles.map((art) => (
            <div
              key={art.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
            >
              <div className="space-y-1.5 flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      art.is_published
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {art.is_published ? 'Published' : 'Draft / Unpublished'}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{art.title}</h3>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  Q: {art.question}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {art.answer}
                </p>

                {art.keywords && art.keywords.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 pt-1 text-[10px] text-slate-400">
                    <Tag className="w-3 h-3 text-slate-400" />
                    <span>Keywords: {art.keywords.join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => handleTogglePublish(art)}
                  className={`p-2 rounded-lg text-xs font-semibold border transition ${
                    art.is_published
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60'
                      : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800'
                  }`}
                  title={art.is_published ? 'Unpublish' : 'Publish to AI & Customers'}
                >
                  {art.is_published ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                <button
                  onClick={() => handleOpenEdit(art)}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Edit FAQ"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(art.id)}
                  className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Delete Article"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={BookOpen} title="No articles found" />
      )}

      {/* Editor Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingArticle ? 'Edit Knowledge Base Article' : 'Create Knowledge Base Article'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Article Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Standard 30-Day Return Policy"
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Customer Question *
            </label>
            <input
              type="text"
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What is your refund policy for monthly subscriptions?"
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Verified Answer * (Primary AI grounding source)
            </label>
            <textarea
              required
              rows={4}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Provide exact official guidelines, policy rules, and steps..."
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Keywords (comma-separated for semantic search)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="refund, return, money back, billing, cancel"
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="pubStatus"
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
            />
            <label htmlFor="pubStatus" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Publish immediately (available to Customer AI Chatbot)
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Article'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

