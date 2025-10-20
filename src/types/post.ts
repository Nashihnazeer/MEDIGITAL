export type Post = {
  id: string;
  title: string;
  image: string;
  summary: string;
  content: string; // HTML string
  author?: string;
  date?: string;
  category?: string;
};