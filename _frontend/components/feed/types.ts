export interface Post {
  _id?: string;
  id?: number;
  authorName?: string;
  author?: string;
  authorInitials?: string;
  authorColor?: string;
  timeAgo?: string;
  content: string;
  imageUrl?: string;
  likes: string[] | number;
  comments: { user?: string; author?: string; text: string }[];
  createdAt?: string;
}
