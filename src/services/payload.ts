const API_URL = 'https://innogyzer-lms.vercel.app/api';

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: any; // Lexical rich text format
  publishedAt: string;
  heroImage?: {
    url: string;
    alt: string;
  };
  _status: 'draft' | 'published';
}

/**
 * Fetch all published posts
 */
export const getPosts = async (): Promise<Post[]> => {
  try {
    const res = await fetch(`${API_URL}/posts?where[_status][equals]=published&sort=-publishedAt`);
    if (!res.ok) throw new Error('Failed to fetch posts');
    const data = await res.json();
    return data.docs;
  } catch (error) {
    console.error(error);
    return [];
  }
};

/**
 * Fetch a single post by slug
 */
export const getPostBySlug = async (slug: string): Promise<Post | null> => {
  try {
    const res = await fetch(`${API_URL}/posts?where[slug][equals]=${slug}&limit=1`);
    if (!res.ok) throw new Error('Failed to fetch post');
    const data = await res.json();
    return data.docs[0] || null;
  } catch (error) {
    console.error(error);
    return null;
  }
};
