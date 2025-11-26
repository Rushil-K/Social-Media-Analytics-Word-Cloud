import { Sentiment } from "./types";

export const SENTIMENT_COLORS: Record<Sentiment, string> = {
  Positive: '#16a34a', // green-600
  Negative: '#dc2626', // red-600
  Neutral: '#ca8a04',  // yellow-600
};

export const SENTIMENT_BG_COLORS: Record<Sentiment, string> = {
  Positive: '#dcfce7', // green-100
  Negative: '#fee2e2', // red-100
  Neutral: '#fef9c3',  // yellow-100
};

export const ZOMATO_RED = '#cb202d';
export const ZOMATO_BLACK = '#1c1c1c';