import React, { useState, useEffect } from 'react';
import SentimentBubbleCloud from './components/SentimentBubbleCloud';
import RecentReviews from './components/RecentReviews';
import StatsCard from './components/StatsCard';
import { generateWordCloudData, generateRecentReviews, generateUniqueDataset, getDashboardStats } from './services/dataGenerator';
import { WordFrequency, Review, DashboardStats } from './types';
import { ZOMATO_RED } from './constants';

const App: React.FC = () => {
  const [wordData, setWordData] = useState<Record<string, WordFrequency[]> | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Initial Load
  useEffect(() => {
    setWordData(generateWordCloudData());
    setReviews(generateRecentReviews(30));
    setStats(getDashboardStats());
  }, []);

  const handleDownloadDataset = () => {
    const fullDataset = generateUniqueDataset(10000);
    const headers = ['ID', 'Date', 'Sentiment', 'Source', 'Likes', 'Shares', 'Comment'];
    const csvContent = [
      headers.join(','),
      ...fullDataset.map(row => {
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

  if (!wordData || !stats) return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400 font-medium">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-red-500 rounded-full animate-spin mb-4"></div>
          Loading Analytics Engine...
      </div>
  );

  const topNegativeKeyword = wordData.Negative && wordData.Negative.length > 0 ? wordData.Negative[0].text : "Service";

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 pb-20">
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
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Restaurant Partner Dashboard</p>
                </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
             <div className="h-10 w-10 rounded-full bg-slate-100 p-0.5 ring-2 ring-slate-100 cursor-pointer hover:ring-slate-200 transition-all">
                <img src="https://picsum.photos/100/100" alt="User" className="w-full h-full object-cover rounded-full" />
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Top Stats */}
        <div className="mb-10">
            <StatsCard stats={stats} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Main Content: Word Clouds */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-slate-200 pb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sentiment Keywords</h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Dominant themes extracted from 10,000+ customer reviews.</p>
                </div>
                
                <button 
                  onClick={handleDownloadDataset}
                  className="group flex items-center text-xs font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-200 hover:border-slate-300 hover:text-slate-900 hover:shadow-md px-5 py-3 rounded-xl transition-all active:scale-95"
                >
                  <svg className="w-4 h-4 mr-2.5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  Download Dataset
                </button>
            </div>

            {/* Primary Positive Cloud */}
            <div className="w-full">
                <SentimentBubbleCloud data={wordData.Positive} sentiment="Positive" />
            </div>
            
            {/* Secondary Clouds */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <SentimentBubbleCloud data={wordData.Negative} sentiment="Negative" />
                <SentimentBubbleCloud data={wordData.Neutral} sentiment="Neutral" />
            </div>
          </div>

          {/* Sidebar: Raw Feed */}
          <div className="lg:col-span-4 sticky top-28 space-y-6">
             <RecentReviews reviews={reviews} />
             
             {/* Small Ad/Info Card */}
             <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <h4 className="font-bold text-blue-900 mb-2">Pro Tip</h4>
                <p className="text-sm text-blue-800/80 leading-relaxed">
                    Improve your ratings by addressing the top negative keyword "{topNegativeKeyword}".
                </p>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;