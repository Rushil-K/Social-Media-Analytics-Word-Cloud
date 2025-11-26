import { Review, WordFrequency, Sentiment, DashboardStats } from "../types";

// Expanded Word Banks for realistic generation
const FOOD_ITEMS = [
  'Biryani', 'Butter Chicken', 'Pizza', 'Burger', 'Sushi', 'Pasta', 'Dimsum', 'Tacos', 'Dosa', 'Thali', 
  'Momos', 'Waffles', 'Coffee', 'Dessert', 'Curry', 'Naan', 'Ramen', 'Salad', 'Sandwich', 'Kebab',
  'Shawarma', 'Falafel', 'Paneer', 'Dal Makhani', 'Fried Rice', 'Noodles', 'Manchurian', 'Soup',
  'Steak', 'Fries', 'Milkshake', 'Ice Cream', 'Cake', 'Donut', 'Croissant', 'Bagel', 'Burrito',
  'Nachos', 'Hot Dog', 'Lasagna', 'Risotto', 'Tandoori', 'Samosa',
  'Chaat', 'Idli', 'Vada', 'Uttapam', 'Paratha', 'Brownie', 'Tea', 'Bhature',
  'Rolls', 'Dumplings'
];

const POSITIVE_ADJECTIVES = [
  'delicious', 'excellent', 'fast', 'polite', 'fresh', 'authentic', 'yummy', 'superb', 'clean', 'tasty', 
  'amazing', 'loved', 'great', 'warm', 'perfect', 'scrumptious', 'delightful', 'flavorful',
  'heavenly', 'fantastic', 'brilliant', 'top-notch', 'wonderful', 'satisfying', 'rich',
  'spicy', 'creamy', 'succulent', 'juicy', 'crispy', 'hot', 'appetizing', 'impressive',
  'splendid', 'fabulous', 'outstanding', 'terrific', 'awesome',
  'generous', 'prompt', 'courteous', 'classy', 'efficient', 'hygienic', 'premium', 'worth-it'
];

const NEGATIVE_ADJECTIVES = [
  'cold', 'stale', 'late', 'rude', 'expensive', 'salty', 'worst', 'bad', 'messy', 'raw', 'burnt', 
  'pathetic', 'slow', 'missing', 'oily', 'horrible', 'terrible', 'disgusting', 'awful', 'bland',
  'tasteless', 'undercooked', 'overcooked', 'soggy', 'greasy', 'stinky', 'sour', 'bitter', 'rotten',
  'unhygienic', 'dirty', 'filthy', 'nasty', 'gross', 'revolting', 'inedible',
  'dry', 'hard', 'tough', 'chewy', 'rubbery', 'watery', 'flavorless', 'disappointing',
  'waste', 'horrendous', 'appalling', 'dreadful'
];

const NEUTRAL_ADJECTIVES = [
  'okay', 'average', 'decent', 'edible', 'standard', 'fine', 'moderate', 'passable', 'basic', 'typical',
  'mediocre', 'so-so', 'alright', 'fair', 'plain', 'simple', 'ordinary', 'acceptable', 'satisfactory',
  'tolerable', 'bearable', 'unremarkable', 'expected', 'reasonable', 'sufficient', 'ok', 'manageable'
];

const CONTEXT_WORDS = [
  'delivery', 'packaging', 'rider', 'app', 'discount', 'service', 'taste', 'quality', 'portion', 'price', 
  'hygiene', 'experience', 'presentation', 'quantity', 'temperature', 'texture', 'aroma', 'flavor', 'spices',
  'ingredients', 'cutlery', 'sauces', 'waiting time', 'refund', 'support',
  'behavior', 'timing', 'promo code', 'bill', 'gps', 'location'
];

// Map for canonical display (e.g. "pizza" -> "Pizza", "bad" -> "bad")
const KEYWORD_MAP = new Map<string, string>();
[...FOOD_ITEMS].forEach(w => KEYWORD_MAP.set(w.toLowerCase(), w)); // Title Case for Food
[...POSITIVE_ADJECTIVES, ...NEGATIVE_ADJECTIVES, ...NEUTRAL_ADJECTIVES, ...CONTEXT_WORDS].forEach(w => KEYWORD_MAP.set(w.toLowerCase(), w)); // Keep original case

// Helper to generate random int
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to pick random item
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Templates allow for dynamic insertion
type TemplateFn = (food: string, adj: string, ctx: string) => string;

const POSITIVE_TEMPLATES: TemplateFn[] = [
  (f, a, c) => `Absolutely loved the ${f}!`,
  (f, a, c) => `Super fast ${c} and ${a} food.`,
  (f, a, c) => `The ${f} was ${a}. Highly recommended!`,
  (f, a, c) => `${a} experience. The rider was very polite.`,
  (f, a, c) => `Best ${f} in town. Fresh and ${a}.`,
  (f, a, c) => `Ordered ${f} for lunch, it was ${a}.`,
  (f, a, c) => `Just wow! The ${f} is simply ${a}.`,
  (f, a, c) => `Great ${c}, will order again.`,
  (f, a, c) => `My kids loved the ${f}. So ${a}.`,
  (f, a, c) => `Finally found good ${f}. It was ${a}.`,
  (f, a, c) => `Packaging was great and ${f} was ${a}.`,
  (f, a, c) => `Value for money! The ${f} was ${a}.`,
  (f, a, c) => `A truly ${a} meal. Thanks Zomato!`,
  (f, a, c) => `Fastest delivery ever. ${f} was piping hot and ${a}.`,
  (f, a, c) => `${a} flavor and good quantity.`,
  (f, a, c) => `I'm impressed by the ${c}. ${f} was ${a}.`,
  (f, a, c) => `Five stars for the ${f}. Truly ${a}.`,
  (f, a, c) => `The ${f} arrived hot and ${a}.`,
  (f, a, c) => `Dinner was ${a}. The ${f} was spot on.`, // Fixed 'Such a' grammar
  (f, a, c) => `Delivered before time and the ${f} tasted ${a}.`
];

const NEGATIVE_TEMPLATES: TemplateFn[] = [
  (f, a, c) => `The ${f} was ${a}. Never ordering again.`,
  (f, a, c) => `Worst ${c} ever. Food arrived ${a}.`,
  (f, a, c) => `Very disappointed with the ${f}. It was ${a}.`,
  (f, a, c) => `Rider was ${a} and the packaging was damaged.`,
  (f, a, c) => `Too ${a} for the price.`,
  (f, a, c) => `I found a hair in my ${f}. Absolutely ${a}.`,
  (f, a, c) => `${f} was completely ${a}. Refund requested.`,
  (f, a, c) => `Delivery took 2 hours and food was ${a}.`,
  (f, a, c) => `The ${f} smelled ${a}. Threw it away.`,
  (f, a, c) => `Zero attention to ${c}. ${f} was ${a}.`,
  (f, a, c) => `Not worth the money. ${f} is ${a}.`,
  (f, a, c) => `Portion size is a joke and ${f} tastes ${a}.`,
  (f, a, c) => `The ${f} was unacceptably ${a}.`,
  (f, a, c) => `Don't waste your money on the ${f}, it's ${a}.`,
  (f, a, c) => `Received wrong order and the support was ${a}.`,
  (f, a, c) => `${c} was terrible. ${f} leaked everywhere.`,
  (f, a, c) => `Why is the ${f} so ${a}?`,
  (f, a, c) => `My ${f} was ${a} and cold.`,
  (f, a, c) => `Horrible ${c}. ${f} was ${a}.`,
  (f, a, c) => `Totally ${a} experience. Avoid this place.`
];

const NEUTRAL_TEMPLATES: TemplateFn[] = [
  (f, a, c) => `The ${f} was ${a}, nothing special.`,
  (f, a, c) => `Delivery was on time but ${f} was just ${a}.`,
  (f, a, c) => `${c} is ${a}. Good for a quick bite.`,
  (f, a, c) => `Not bad, but the ${f} could be better.`,
  (f, a, c) => `It's ${a}. Standard Zomato experience.`,
  (f, a, c) => `Average ${f}, but the price is ${a}.`,
  (f, a, c) => `The ${f} is ${a}, I've had better.`,
  (f, a, c) => `Portion was small but ${f} taste was ${a}.`,
  (f, a, c) => `Meal was ${a}. ${f} was okay.`, // Fixed 'An' grammar
  (f, a, c) => `${c} was ${a}. No complaints.`, // Fixed 'Just an' grammar
  (f, a, c) => `The ${f} was ${a}. Might order again.`,
  (f, a, c) => `Decent ${f}, but delivery was ${a}.`,
  (f, a, c) => `Food was ${a}. Packaging needs improvement.`,
  (f, a, c) => `It was ${a}. ${f} was slightly cold.`,
  (f, a, c) => `Good ${c}, but ${f} is ${a}.`
];

// Generate a realistic comment
const generateComment = (sentiment: Sentiment): string => {
  const food = pick(FOOD_ITEMS);
  const context = pick(CONTEXT_WORDS);
  let templates = NEUTRAL_TEMPLATES;
  let adjList = NEUTRAL_ADJECTIVES;

  if (sentiment === 'Positive') {
    templates = POSITIVE_TEMPLATES;
    adjList = POSITIVE_ADJECTIVES;
  } else if (sentiment === 'Negative') {
    templates = NEGATIVE_TEMPLATES;
    adjList = NEGATIVE_ADJECTIVES;
  }

  const adj = pick(adjList);
  const template = pick(templates);
  
  return template(food, adj, context);
};

// --- CORE GENERATION LOGIC ---

// 1. Generate the Master Dataset (Source of Truth)
export const generateMasterDataset = (count: number = 10001): Review[] => {
  const reviews: Review[] = [];
  const usedComments = new Set<string>();
  let attempts = 0;
  const maxAttempts = count * 20; 

  while (reviews.length < count && attempts < maxAttempts) {
    attempts++;
    
    const rand = Math.random();
    const sentiment: Sentiment = rand > 0.45 ? 'Positive' : (rand > 0.15 ? 'Neutral' : 'Negative');
    const comment = generateComment(sentiment);

    if (!usedComments.has(comment) || attempts > count * 5) { // Fallback if uniques exhausted
        usedComments.add(comment);
        
        const date = new Date();
        date.setDate(date.getDate() - randomInt(0, 90)); 
        date.setHours(randomInt(8, 23), randomInt(0, 59), randomInt(0, 59));

        reviews.push({
            id: `rev-${Math.random().toString(36).substr(2, 9)}-${reviews.length}`,
            date: date.toISOString(),
            comment: comment,
            sentiment,
            shares: randomInt(0, 100),
            likes: randomInt(0, 500),
            source: pick(['iOS', 'Android', 'Web', 'Aggregator']),
        });
    }
  }
  
  return reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// 2. Process Dataset to derive Analytics (Word Clouds + Stats)
// This ensures the visuals match the data exactly.
export const processDataset = (reviews: Review[]) => {
    const wordCounts: Record<Sentiment, Record<string, number>> = {
        Positive: {},
        Negative: {},
        Neutral: {}
    };

    const stats: DashboardStats = {
        totalReviews: reviews.length,
        avgRating: 0, 
        sentimentBreakdown: { Positive: 0, Negative: 0, Neutral: 0 }
    };

    let totalRating = 0;

    reviews.forEach(review => {
        // Update Stats
        stats.sentimentBreakdown[review.sentiment]++;
        
        // Simulating rating based on sentiment for the aggregate stat
        let rating = 0;
        if (review.sentiment === 'Positive') rating = randomInt(4, 5);
        else if (review.sentiment === 'Neutral') rating = randomInt(3, 4);
        else rating = randomInt(1, 2);
        totalRating += rating;

        // Extract Keywords for Word Cloud
        // Simple tokenization: remove punctuation, split by space
        const tokens = review.comment.toLowerCase().replace(/[.,!?;:"]/g, '').split(/\s+/);
        
        tokens.forEach(token => {
            // Only count if it is a known keyword (Food, Adj, Context)
            // This acts as a Stopword filter and ensures aesthetic quality
            if (KEYWORD_MAP.has(token)) {
                const displayWord = KEYWORD_MAP.get(token) || token;
                
                if (!wordCounts[review.sentiment][displayWord]) {
                    wordCounts[review.sentiment][displayWord] = 0;
                }
                wordCounts[review.sentiment][displayWord]++;
            }
        });
    });

    stats.avgRating = parseFloat((totalRating / reviews.length).toFixed(1));

    // Convert Word Count Maps to Sorted Arrays for D3
    const wordCloudData: Record<Sentiment, WordFrequency[]> = {
        Positive: [], Negative: [], Neutral: []
    };

    (['Positive', 'Negative', 'Neutral'] as Sentiment[]).forEach(s => {
        wordCloudData[s] = Object.entries(wordCounts[s])
            .map(([text, value]) => ({
                text, 
                value, 
                sentiment: s
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 100); // Top 100 words per sentiment
    });

    return { stats, wordCloudData };
};