// News service to fetch real news from NewsAPI
// Get your free API key from https://newsapi.org/

import Constants from 'expo-constants';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  image: string;
  url?: string;
  publishedAt?: string;
  source?: string;
}

// Get API key from environment variables
const getNewsApiKey = (): string => {
  if (process.env.EXPO_PUBLIC_NEWS_API_KEY) {
    return process.env.EXPO_PUBLIC_NEWS_API_KEY;
  }
  if (Constants.expoConfig?.extra?.newsApiKey) {
    return Constants.expoConfig.extra.newsApiKey;
  }
  if ((Constants.manifest as any)?.extra?.newsApiKey) {
    return (Constants.manifest as any).extra.newsApiKey;
  }
  return '';
};

const NEWS_API_KEY = getNewsApiKey();
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

// Helper function to shuffle array
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Fallback news data in case API fails
const FALLBACK_NEWS: NewsArticle[] = [
  {
    id: '1',
    title: 'ความปลอดภัยในการเดินทาง',
    description: 'คำแนะนำเพื่อความปลอดภัยในการเดินทางและป้องกันอุบัติเหตุ',
    image: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    title: 'แจ้งเตือนเหตุฉุกเฉิน',
    description: 'ข้อมูลสำคัญเกี่ยวกับการแจ้งเหตุฉุกเฉินและขอความช่วยเหลือ',
    image: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    title: 'ความปลอดภัยในชุมชน',
    description: 'ข่าวสารและคำแนะนำเพื่อความปลอดภัยในชุมชน',
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
];

/**
 * Fetches top headlines from NewsAPI (Thailand)
 * @param forceRefresh - If true, adds timestamp to bypass cache
 */
export const fetchTopHeadlines = async (forceRefresh = false): Promise<NewsArticle[]> => {
  // If no API key is provided, return fallback news
  if (!NEWS_API_KEY || NEWS_API_KEY.trim() === '') {
    console.warn('NewsAPI key not found. Using fallback news. Get your free API key from https://newsapi.org/');
    return FALLBACK_NEWS;
  }

  try {
    
    // Add timestamp to force refresh if needed
    const timestamp = forceRefresh ? `&_t=${Date.now()}` : '';
    
    // Use different queries randomly to get different news each time
    const queries = [
      '(Thailand OR ไทย) AND (accident OR emergency OR safety OR danger OR hazard OR incident OR crash OR disaster OR rescue OR disability OR accessibility)',
      '(Thailand OR ไทย) AND (traffic OR road OR vehicle OR crash OR collision)',
      '(Thailand OR ไทย) AND (emergency OR rescue OR help OR assistance)',
      '(Thailand OR ไทย) AND (safety OR security OR protection)',
      '(Thailand OR ไทย) AND (disaster OR flood OR fire OR earthquake)',
      '(Thailand OR ไทย) AND (police OR ambulance OR hospital OR medical)',
      '(Thailand OR ไทย) AND (emergency OR urgent OR critical)',
      '(Thailand OR ไทย) AND (accident OR injury OR wounded)',
      '(Thailand OR ไทย) AND (help OR support OR aid)',
      '(Thailand OR ไทย) AND (danger OR risk OR threat)'
    ];
    
    // Randomly select a query to get different news
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    const query = encodeURIComponent(randomQuery);
    
    // Randomly select sortBy to get different ordering
    const sortOptions = ['publishedAt', 'relevancy', 'popularity'];
    const randomSort = sortOptions[Math.floor(Math.random() * sortOptions.length)];
    

    const randomPage = Math.floor(Math.random() * 3) + 1;
    
    let url = `${NEWS_API_BASE_URL}/everything?q=${query}&sortBy=${randomSort}&page=${randomPage}&pageSize=20&language=en&apiKey=${NEWS_API_KEY}${timestamp}`;
    let response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('NewsAPI error:', response.status, errorData);
      
      // Fallback: try top headlines from Thailand
      url = `${NEWS_API_BASE_URL}/top-headlines?country=th&pageSize=20&apiKey=${NEWS_API_KEY}${timestamp}`;
      response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`NewsAPI error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }
    }
    
    let data = await response.json();

    if (data.status === 'ok' && data.articles && data.articles.length > 0) {
      // Transform NewsAPI articles to our format
      let articles: NewsArticle[] = data.articles
        .filter((article: any) => article.title && article.description)
        .map((article: any, index: number) => ({
          id: article.url || `headline-${index}`,
          title: article.title || 'ไม่มีหัวข้อ',
          description: article.description || article.content?.substring(0, 150) || 'ไม่มีรายละเอียด',
          image: article.urlToImage || 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          url: article.url,
          publishedAt: article.publishedAt,
          source: article.source?.name,
        }));

      // Shuffle articles to get different order each time
      articles = shuffleArray(articles);
      
      // Limit to 10 articles after shuffling
      articles = articles.slice(0, 10);

      if (articles.length > 0) {
        return articles;
      }
    }

    // If no articles found, return fallback
    return FALLBACK_NEWS;
  } catch (error: any) {
    console.error('Error fetching top headlines:', error.message || error);
    return FALLBACK_NEWS;
  }
};

