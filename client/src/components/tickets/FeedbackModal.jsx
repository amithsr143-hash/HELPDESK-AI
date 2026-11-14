import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { ticketService } from '../../services/ticket.service';
import { Star, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const FeedbackModal = ({ isOpen, onClose, ticketId, onSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await ticketService.submitFeedback(ticketId, {
        rating,
        comment: comment.trim() || undefined
      });
      toast.success('Thank you for rating your customer experience!');
      onClose();
      if (onSubmitted) onSubmitted(res.data);
    } catch (err) {
      toast.error(err.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="How was your support experience?">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="text-center py-2">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Please rate the resolution quality and service for this ticket:
          </p>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 focus:outline-none transition transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    (hoverRating || rating) >= star
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300 dark:text-slate-600'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">
            {rating === 5 && 'Outstanding! (5/5)'}
            {rating === 4 && 'Good support (4/5)'}
            {rating === 3 && 'Average (3/5)'}
            {rating === 2 && 'Needs improvement (2/5)'}
            {rating === 1 && 'Unsatisfactory (1/5)'}
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Optional Feedback or Comments
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What went well or what could we do better?"
            className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 disabled:opacity-50 transition"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

