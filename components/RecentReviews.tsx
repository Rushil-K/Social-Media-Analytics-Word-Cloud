import React from 'react';
import { Review } from '../types';
import { SENTIMENT_COLORS, SENTIMENT_BG_COLORS } from '../constants';

interface RecentReviewsProps {
  reviews: Review[];
}

const RecentReviews: React.FC<RecentReviewsProps> = ({ reviews }) => {
  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-IN', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-[700px] flex flex-col overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
        <div>
            <h2 className="text-lg font-bold text-slate-800">Live Feed</h2>
            <p className="text-xs text-slate-400 mt-0.5">Real-time customer feedback</p>
        </div>
        <div className="flex items-center">
            <span className="relative flex h-3 w-3 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Live</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-slate-50/50">
        {reviews.map((review) => (
          <div key={review.id} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span 
                    className="text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide"
                    style={{ 
                        color: SENTIMENT_COLORS[review.sentiment],
                        backgroundColor: SENTIMENT_BG_COLORS[review.sentiment]
                    }}
                >
                    {review.sentiment}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{review.source}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">{formatDate(review.date)}</span>
            </div>
            
            <p className="text-sm text-slate-700 leading-relaxed mb-4 group-hover:text-slate-900 transition-colors">"{review.comment}"</p>
            
            <div className="flex items-center space-x-4 border-t border-slate-50 pt-3 mt-1">
                <div className="flex items-center text-xs font-medium text-slate-400 group-hover:text-red-500 transition-colors">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"></path></svg>
                    {review.likes}
                </div>
                <div className="flex items-center text-xs font-medium text-slate-400 group-hover:text-blue-500 transition-colors">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                    {review.shares}
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentReviews;