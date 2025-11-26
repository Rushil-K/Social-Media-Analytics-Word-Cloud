import React, { useState } from 'react';
import { Review, Sentiment } from '../types';
import { SENTIMENT_COLORS, SENTIMENT_BG_COLORS } from '../constants';

interface ReviewHighlightsProps {
  reviews: Review[];
}

const ReviewHighlights: React.FC<ReviewHighlightsProps> = ({ reviews }) => {
  const [activeTab, setActiveTab] = useState<Sentiment>('Negative');

  // Get top 5 reviews based on likes for the active sentiment
  const getTopReviews = (sentiment: Sentiment) => {
    return [...reviews]
      .filter(r => r.sentiment === sentiment)
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 5);
  };

  const topReviews = getTopReviews(activeTab);

  const titles: Record<Sentiment, string> = {
      Negative: 'Most Terrible',
      Positive: 'Most Positive',
      Neutral: 'Most Neutral'
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h3 className="text-lg font-bold text-slate-900">Review Highlights</h3>
                <p className="text-sm text-slate-500">Top 5 high-impact reviews by sentiment</p>
            </div>
            
            <div className="flex bg-slate-100/80 p-1 rounded-xl">
                {(['Negative', 'Positive', 'Neutral'] as Sentiment[]).map((sentiment) => (
                    <button
                        key={sentiment}
                        onClick={() => setActiveTab(sentiment)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                            activeTab === sentiment 
                            ? 'bg-white text-slate-800 shadow-sm' 
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        {titles[sentiment]}
                    </button>
                ))}
            </div>
        </div>
      </div>
      
      <div className="divide-y divide-slate-50">
        {topReviews.map((review, idx) => (
            <div key={review.id} className="p-5 hover:bg-slate-50 transition-colors group">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                         <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
                            {idx + 1}
                         </span>
                         <span 
                            className="text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide"
                            style={{ 
                                color: SENTIMENT_COLORS[review.sentiment],
                                backgroundColor: SENTIMENT_BG_COLORS[review.sentiment]
                            }}
                        >
                            {review.sentiment}
                        </span>
                        <span className="text-xs text-slate-400 font-medium bg-slate-50 px-1.5 py-0.5 rounded">
                            {review.source}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center text-xs font-medium text-slate-400">
                            <svg className="w-3.5 h-3.5 mr-1 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"></path></svg>
                            {review.likes}
                        </div>
                        <span className="text-xs text-slate-300">
                            {new Date(review.date).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed pl-9 italic opacity-90">"{review.comment}"</p>
            </div>
        ))}
        {topReviews.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">
                No reviews found for this category.
            </div>
        )}
      </div>
    </div>
  );
};

export default ReviewHighlights;