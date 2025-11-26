import React from 'react';
import { DashboardStats } from '../types';

interface StatsCardProps {
    stats: DashboardStats;
}

const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Total Reviews</p>
                    {/* Badge Removed as per request */}
                </div>
                <p className="text-3xl font-bold text-slate-800 tracking-tight">{stats.totalReviews.toLocaleString()}</p>
                <div className="w-full bg-slate-100 h-1.5 mt-4 rounded-full overflow-hidden">
                    <div className="bg-slate-800 h-full w-full rounded-full"></div>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Avg Rating</p>
                    <span className="text-slate-400 text-xs">Target: 4.5</span>
                </div>
                <div className="flex items-baseline space-x-2">
                    <p className="text-3xl font-bold text-slate-800 tracking-tight">{stats.avgRating}</p>
                    <span className="text-sm text-slate-400 font-medium">/ 5.0</span>
                </div>
                <div className="flex mt-4 space-x-1">
                     {[1,2,3,4].map(i => <div key={i} className="flex-1 h-1.5 bg-yellow-400 rounded-full"></div>)}
                     <div className="flex-1 h-1.5 bg-slate-200 rounded-full"></div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Positive Sentiment</p>
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                </div>
                <p className="text-3xl font-bold text-green-600 tracking-tight">{((stats.sentimentBreakdown.Positive / stats.totalReviews) * 100).toFixed(1)}%</p>
                 <div className="w-full bg-slate-100 h-1.5 mt-4 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: '55%'}}></div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                 <div className="flex justify-between items-start mb-4">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Negative Sentiment</p>
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
                </div>
                <p className="text-3xl font-bold text-red-600 tracking-tight">{((stats.sentimentBreakdown.Negative / stats.totalReviews) * 100).toFixed(1)}%</p>
                 <div className="w-full bg-slate-100 h-1.5 mt-4 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: '15%'}}></div>
                </div>
            </div>
        </div>
    );
};

export default StatsCard;