import React from 'react';
import { DashboardStats } from '../types';

interface StatsCardProps {
    stats: DashboardStats;
}

const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Total Reviews</p>
                </div>
                <p className="text-3xl font-bold text-slate-800 tracking-tight">{stats.totalReviews.toLocaleString()}</p>
                <div className="w-full bg-slate-100 h-1.5 mt-4 rounded-full overflow-hidden">
                    <div className="bg-slate-800 h-full w-full rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export default StatsCard;