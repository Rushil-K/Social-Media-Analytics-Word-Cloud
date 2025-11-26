export type Sentiment = 'Positive' | 'Negative' | 'Neutral';

export interface Review {
  id: string;
  date: string; // ISO date string
  comment: string;
  sentiment: Sentiment;
  shares: number;
  likes: number;
  source: 'iOS' | 'Android' | 'Web' | 'Aggregator';
}

export interface WordFrequency {
  text: string;
  value: number; // Frequency
  sentiment: Sentiment;
}

export interface DashboardStats {
  totalReviews: number;
  avgRating: number;
  sentimentBreakdown: {
    Positive: number;
    Negative: number;
    Neutral: number;
  };
}