import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { ticketService } from '../../services/ticket.service';
import { categoryService } from '../../services/category.service';
import { Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const CreateTicketModal = ({ isOpen, onClose, onCreated }) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      categoryService
        .getCategories()
        .then((res) => {
          if (res?.data) {
            setCategories(res.data);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (subject.trim().length < 5) {
      toast.error('Subject must be at least 5 characters');
      return;
    }
    if (description.trim().length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }

    setSubmitting(true);
    try {
      const res = await ticketService.createTicket({
        subject,
        description,
        priority,
        category_id: categoryId || undefined
      });
      toast.success(`Ticket #${res.data?.ticket_number} created with AI classification!`);
      setSubject('');
      setDescription('');
      setCategoryId('');
      onClose();
      if (onCreated) onCreated(res.data);
    } catch (err) {
      toast.error(err.message || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Support Ticket" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-brand-50 dark:bg-brand-950/50 rounded-xl border border-brand-200 dark:border-brand-800/60 flex items-start gap-2.5">
          <Sparkles className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
          <p className="text-xs text-brand-900 dark:text-brand-200 leading-relaxed">
            <strong>AI Auto-Classification Active:</strong> Gemini AI will automatically inspect your issue, verify intent & sentiment, assign category, and suggest priority for optimal routing.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Subject *
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. 504 gateway timeout on webhook ingestion"
            className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Priority (AI Recommended)
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="low">Low (General inquiry)</option>
              <option value="medium">Medium (Normal)</option>
              <option value="high">High (Service affected)</option>
              <option value="urgent">Urgent (Critical disruption)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Auto-Detect via AI</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Detailed Description *
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please detail what happened, any error messages, and reproduction steps..."
            className="w-full p-3.5 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 disabled:opacity-50 transition"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Classifying & Creating...
              </>
            ) : (
              'Submit Support Ticket'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
