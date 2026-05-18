import { Interactions } from './interactions';
export interface Post {
  id: string;
  author_id: string;
  type: string;            
  content: string;
  timestamp: string;
  to: string | null;       
  interactions: Interactions;
}