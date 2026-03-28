import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { StarIcon, ThumbsUpIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { reviewService } from '../../services';
import { formatDate } from '../../utils/helpers';
import { ReviewSkeleton } from '../ui/Skeletons';

function StarRatingInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map((s) => (
        <button key={s} type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110">
          <StarSolid className={`w-8 h-8 ${(hover || value) >= s ? 'text-gold-400' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ productId }) {
  const { user }   = useSelector((s) => s.auth);
  const [reviews,  setReviews]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [dist,     setDist]     = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState({ rating: 5, title: '', comment: '' });
  const [submitting, setSub]    = useState(false);
  const [filterRating, setFilter] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewService.getByProduct(productId, { page, limit: 8, rating: filterRating || undefined });
      setReviews(res.data.data);
      setTotal(res.data.total);
      setDist(res.data.distribution || []);
    } catch { setReviews([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, [productId, page, filterRating]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!form.comment.trim()) { toast.error('Please write a review comment'); return; }
    setSub(true);
    try {
      await reviewService.create(productId, form);
      toast.success('Review submitted!');
      setShowForm(false);
      setForm({ rating: 5, title: '', comment: '' });
      setPage(1); fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSub(false); }
  };

  const avgRating = dist.reduce((s, d) => s + d._id * d.count, 0) / (dist.reduce((s, d) => s + d.count, 0) || 1);
  const ratingMap = Object.fromEntries(dist.map((d) => [d._id, d.count]));

  return (
    <div>
      {/* Summary */}
      <div className="flex flex-col md:flex-row gap-8 mb-8 bg-ethnic-cream rounded-2xl p-6">
        <div className="text-center shrink-0">
          <div className="text-6xl font-bold text-gray-900">{avgRating.toFixed(1)}</div>
          <div className="flex justify-center mt-2">
            {[1,2,3,4,5].map((s) => (
              <StarSolid key={s} className={`w-5 h-5 ${s <= Math.round(avgRating) ? 'text-gold-400' : 'text-gray-300'}`} />
            ))}
          </div>
          <p className="text-gray-500 text-sm mt-1">{total} reviews</p>
        </div>
        <div className="flex-1 space-y-2">
          {[5,4,3,2,1].map((r) => {
            const count = ratingMap[r] || 0;
            const pct = total ? (count / total) * 100 : 0;
            return (
              <button key={r} onClick={() => setFilter(filterRating == r ? '' : r)}
                className={`flex items-center gap-3 w-full group ${filterRating == r ? 'opacity-100' : 'hover:opacity-80'}`}>
                <span className="text-sm w-4 text-gray-600">{r}</span>
                <StarSolid className="w-4 h-4 text-gold-400 shrink-0" />
                <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gold-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-6">{count}</span>
              </button>
            );
          })}
        </div>
        {user && (
          <div className="shrink-0">
            <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2.5 px-5">
              Write a Review
            </button>
          </div>
        )}
      </div>

      {/* Review form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
          <h3 className="font-serif text-xl font-bold mb-5">Your Review</h3>
          <form onSubmit={submitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <StarRatingInput value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Summarize your experience" className="input-field" maxLength={100} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Review *</label>
              <textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })}
                placeholder="Share details of your experience with this product" rows={4}
                className="input-field resize-none" maxLength={1000} required />
              <p className="text-xs text-gray-400 mt-1">{form.comment.length}/1000</p>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary px-8">{submitting ? 'Submitting...' : 'Submit Review'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-6">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Review list */}
      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <ReviewSkeleton key={i} />)}</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <StarIcon className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p>No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {review.user?.avatar
                    ? <img src={review.user.avatar} alt={review.user.name} className="w-10 h-10 rounded-full object-cover" />
                    : <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600">{review.user?.name?.[0]}</div>
                  }
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{review.user?.name}</p>
                    <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                {review.isVerifiedPurchase && (
                  <span className="badge bg-green-100 text-green-700 text-xs shrink-0">✓ Verified Purchase</span>
                )}
              </div>
              <div className="flex mt-3 mb-2">
                {[1,2,3,4,5].map((s) => (
                  <StarSolid key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-gold-400' : 'text-gray-200'}`} />
                ))}
              </div>
              {review.title && <p className="font-semibold text-gray-800 text-sm mb-1">{review.title}</p>}
              <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
              {review.images?.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {review.images.map((img, i) => (
                    <img key={i} src={img} alt="" className="w-20 h-20 object-cover rounded-lg" />
                  ))}
                </div>
              )}
              <button onClick={() => reviewService.markHelpful(review._id).then(fetchReviews)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary-600 mt-3 transition-colors">
                👍 Helpful ({review.helpfulCount})
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
