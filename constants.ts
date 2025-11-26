import { Sentiment } from "./types";

// Accessible Color Palette (Blue/Orange/Gold safe for color blindness)
export const SENTIMENT_COLORS: Record<Sentiment, string> = {
  Positive: '#2563eb', // blue-600 (High contrast safe positive)
  Negative: '#dc2626', // red-600 (High contrast negative)
  Neutral: '#d97706',  // amber-600 (Distinct neutral)
};

export const SENTIMENT_BG_COLORS: Record<Sentiment, string> = {
  Positive: '#dbeafe', // blue-100
  Negative: '#fee2e2', // red-100
  Neutral: '#fef3c7',  // amber-100
};

export const ZOMATO_RED = '#cb202d';
export const ZOMATO_BLACK = '#1c1c1c';