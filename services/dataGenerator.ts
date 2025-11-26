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
  (f, a, c) => `Such a ${a} dinner. The ${f} was spot on.`,
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
  (f, a, c) => `An ${a} meal. ${f} was okay.`,
  (f, a, c) => `Just an ${a} ${c}. No complaints.`,
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

// Generate high-volume analytics data (Word Clouds)
export const generateWordCloudData = (): Record<Sentiment, WordFrequency[]> => {
    const generateWords = (sentiment: Sentiment, adjList: string[], count: number) => {
    const words: WordFrequency[] = [];
    const usedWords = new Set<string>();

    // Add generic food items with random weights
    FOOD_ITEMS.forEach(item => {
      if(Math.random() > 0.6) { 
         // Decreased variance to prevent too many "huge" words
         const isTrend = Math.random() > 0.95; // Only 5% trends
         words.push({ 
             text: item, 
             value: isTrend ? randomInt(180, 220) : randomInt(20, 80), 
             sentiment 
         });
         usedWords.add(item);
      }
    });

    // Add adjectives
    adjList.forEach(adj => {
       if (Math.random() > 0.3) {
         const isDominant = Math.random() > 0.92; // Only 8% dominant
         words.push({ 
             text: adj, 
             value: isDominant ? randomInt(150, 200) : randomInt(30, 90), 
             sentiment 
         });
         usedWords.add(adj);
       }
    });

    // Add context words
    CONTEXT_WORDS.forEach(ctx => {
      if (Math.random() > 0.5) {
        words.push({ text: ctx, value: randomInt(20, 70), sentiment });
        usedWords.add(ctx);
      }
    });

    // Return a larger set for full screen, sorted by frequency
    return words.sort((a, b) => b.value - a.value).slice(0, 100); 
  };

  return {
    Positive: generateWords('Positive', POSITIVE_ADJECTIVES, 80),
    Negative: generateWords('Negative', NEGATIVE_ADJECTIVES, 80),
    Neutral: generateWords('Neutral', NEUTRAL_ADJECTIVES, 80),
  };
};

// Generate a subset of "Raw" reviews for the list view
export const generateRecentReviews = (count: number = 50): Review[] => {
  const reviews: Review[] = [];
  
  for (let i = 0; i < count; i++) {
    const sentiment = Math.random() > 0.6 ? 'Positive' : (Math.random() > 0.4 ? 'Neutral' : 'Negative');
    const date = new Date();
    date.setDate(date.getDate() - randomInt(0, 30)); // Past 30 days
    date.setHours(randomInt(9, 23), randomInt(0, 59));

    reviews.push({
      id: `rev-${Math.random().toString(36).substr(2, 9)}`,
      date: date.toISOString(),
      comment: generateComment(sentiment),
      sentiment,
      shares: randomInt(0, 50),
      likes: randomInt(0, 200),
      source: pick(['iOS', 'Android', 'Web', 'Aggregator']),
    });
  }

  return reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Generate Unique Large Dataset
export const generateUniqueDataset = (count: number): Review[] => {
  const reviews: Review[] = [];
  const usedComments = new Set<string>();
  let attempts = 0;
  const maxAttempts = count * 10; 

  while (reviews.length < count && attempts < maxAttempts) {
    attempts++;
    
    const rand = Math.random();
    const sentiment: Sentiment = rand > 0.45 ? 'Positive' : (rand > 0.15 ? 'Neutral' : 'Negative');
    const comment = generateComment(sentiment);

    if (!usedComments.has(comment)) {
        usedComments.add(comment);
        
        const date = new Date();
        date.setDate(date.getDate() - randomInt(0, 90)); 
        date.setHours(randomInt(8, 23), randomInt(0, 59), randomInt(0, 59));

        reviews.push({
            id: `rev-${Math.random().toString(36).substr(2, 9)}-${attempts}`,
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

export const getDashboardStats = (): DashboardStats => {
  const total = 10001; 
  const pos = Math.floor(total * 0.55);
  const neg = Math.floor(total * 0.15);
  const neu = total - pos - neg;
  
  return {
    totalReviews: total,
    avgRating: 4.1,
    sentimentBreakdown: {
      Positive: pos,
      Negative: neg,
      Neutral: neu
    }
  };
};