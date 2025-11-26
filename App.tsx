import React, { useState, useEffect } from 'react';
import SentimentBubbleCloud from './components/SentimentBubbleCloud';
import RecentReviews from './components/RecentReviews';
import StatsCard from './components/StatsCard';
import ReviewHighlights from './components/ReviewHighlights';
import { generateMasterDataset, processDataset } from './services/dataGenerator';
import { WordFrequency, Review, DashboardStats } from './types';
import { ZOMATO_RED } from './constants';

const App: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [wordData, setWordData] = useState<Record<string, WordFrequency[]> | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Initial Load: Generate Master Dataset once and derive all other data from it.
  useEffect(() => {
    // 1. Generate Source of Truth (10,001 reviews)
    const masterDataset = generateMasterDataset(10001);
    setReviews(masterDataset);

    // 2. Derive Analytics (Stats + Word Clouds) from the dataset
    const { stats: derivedStats, wordCloudData: derivedWordData } = processDataset(masterDataset);
    setStats(derivedStats);
    setWordData(derivedWordData);
  }, []);

  const handleDownloadDataset = () => {
    if (reviews.length === 0) return;
    
    const headers = ['ID', 'Date', 'Sentiment', 'Source', 'Likes', 'Shares', 'Comment'];
    const csvContent = [
      headers.join(','),
      ...reviews.map(row => {
        const escapedComment = `"${row.comment.replace(/"/g, '""')}"`;
        return [row.id, row.date, row.sentiment, row.source, row.likes, row.shares, escapedComment].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'zomato_reviews_dataset.csv');
    link.click();
  };

  if (!wordData || !stats || reviews.length === 0) return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400 font-medium">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-red-500 rounded-full animate-spin mb-4"></div>
          Loading Analytics Engine...
      </div>
  );

  const topNegativeKeyword = wordData.Negative && wordData.Negative.length > 0 ? wordData.Negative[0].text : "Service";

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 pb-20 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-2xl italic shadow-xl shadow-red-200/50 transform transition-transform hover:scale-105" style={{ backgroundColor: ZOMATO_RED }}>
              Z
            </div>
            <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">Review Analytics</h1>
                <div className="flex items-center space-x-2 mt-1.5">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-bold text-slate-500 tracking-wide">RESTAURANT PARTNER DASHBOARD</span>
                </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Profile" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        
        <StatsCard stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Visualizations */}
            <div className="lg:col-span-2 space-y-8">
                
                <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Sentiment Keywords</h2>
                        <p className="text-slate-500 mt-1">Dominant themes extracted from {stats.totalReviews.toLocaleString()} customer reviews.</p>
                    </div>
                    <button 
                        onClick={handleDownloadDataset}
                        className="flex items-center space-x-3 bg-white border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-400 text-slate-800 px-6 py-3 rounded-xl transition-all font-bold text-base shadow-sm active:scale-95 group"
                    >
                        <svg className="w-5 h-5 text-slate-500 group-hover:text-slate-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        <span>DOWNLOAD DATASET</span>
                    </button>
                </div>

                {/* Positive Cloud */}
                <SentimentBubbleCloud data={wordData.Positive} sentiment="Positive" />

                {/* Negative Cloud */}
                <SentimentBubbleCloud data={wordData.Negative} sentiment="Negative" />

                {/* Neutral Cloud */}
                <SentimentBubbleCloud data={wordData.Neutral} sentiment="Neutral" />

                {/* Dynamic Pro Tip */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div>
                        <h4 className="text-blue-900 font-bold text-sm uppercase tracking-wide mb-1">Pro Tip</h4>
                        <p className="text-blue-700 font-medium">
                            Improve your ratings by addressing the top negative keyword <span className="font-bold">"{topNegativeKeyword}"</span>.
                        </p>
                    </div>
                </div>

                {/* High Impact Reviews Section */}
                <ReviewHighlights reviews={reviews} />

            </div>

            {/* Right Column: Feed */}
            <div className="lg:col-span-1">
                <RecentReviews reviews={reviews.slice(0, 50)} />
            </div>
        </div>

      </main>

      {/* Footer - Team & Professor Details */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                
                {/* Team Members */}
                <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Submitted By</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                        <div className="flex items-center space-x-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                            <span className="text-slate-700 font-medium">Nidhi Gupta <span className="text-slate-400 text-sm ml-1">(055005)</span></span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                            <span className="text-slate-700 font-medium">Rushil Kohli <span className="text-slate-400 text-sm ml-1">(055027)</span></span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                            <span className="text-slate-700 font-medium">Saumya Raghuvanshi <span className="text-slate-400 text-sm ml-1">(055040)</span></span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                            <span className="text-slate-700 font-medium">Shagun Seth <span className="text-slate-400 text-sm ml-1">(055042)</span></span>
                        </div>
                    </div>
                </div>

                {/* Submitted To */}
                <div className="md:text-right">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Submitted To</h3>
                    <p className="text-lg font-bold text-slate-800">Professor Rakhi Tripathi</p>
                    <p className="text-slate-500 font-medium">FORE School of Management</p>
                </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-100 text-center text-xs text-slate-400">
                &copy; {new Date().getFullYear()} Zomato Sentiment Lens. Internal Project.
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;