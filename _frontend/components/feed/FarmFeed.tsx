import React, { useState, useEffect, useRef } from 'react';
import { StoryViewer } from './Stories';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, Bookmark, Search, Bell, Plus, Image, X, Home, Compass, Film, ShoppingBag, User } from 'lucide-react';

const API = 'http://localhost:5000';

interface Story {
  id: number;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  imageUrl: string;
  seen: boolean;
}

interface Comment {
  user?: string;
  author?: string;
  text: string;
}

interface Post {
  _id?: string;
  id?: string | number;
  author?: string;
  authorName?: string;
  authorInitials?: string;
  authorColor?: string;
  content?: string;
  imageUrl?: string;
  likes?: unknown[];
  comments?: Comment[];
  createdAt?: string;
  timeAgo?: string;
}

const MOCK_STORIES: Story[] = [
  { id: 1, authorName: 'sarah_j', authorInitials: 'SJ', authorColor: 'linear-gradient(135deg, #f59e0b, #d97706)', imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80', seen: false },
  { id: 2, authorName: 'marcus_t', authorInitials: 'MT', authorColor: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80', seen: false },
  { id: 3, authorName: 'gv_organic', authorInitials: 'GV', authorColor: 'linear-gradient(135deg, #10b981, #059669)', imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80', seen: false },
  { id: 4, authorName: 'amit.k', authorInitials: 'AK', authorColor: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', imageUrl: 'https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?w=600&q=80', seen: false },
  { id: 5, authorName: 'lisa_bee', authorInitials: 'LB', authorColor: 'linear-gradient(135deg, #ec4899, #be185d)', imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80', seen: false },
  { id: 6, authorName: 'roots_farm', authorInitials: 'RF', authorColor: 'linear-gradient(135deg, #f97316, #ea580c)', imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80', seen: false },
];

const FALLBACK_POSTS: Post[] = [
  { _id: '1', author: 'nagarajcprp', authorInitials: 'NA', authorColor: 'linear-gradient(135deg, #f59e0b, #d97706)', content: 'Fresh harvest from the paddy fields today 🌾 #farming #paddy #harvest', imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', likes: [{}, {}], comments: [{ user: 'sarah_j', text: 'Beautiful harvest! 🌾' }], timeAgo: '2h' },
  { _id: '2', author: 'greenvalley', authorInitials: 'GV', authorColor: 'linear-gradient(135deg, #10b981, #059669)', content: 'Organic tomatoes ready for the market 🍅 Pesticide-free, grown with love. #organic #tomatoes', imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80', likes: [{}, {}, {}], comments: [{ user: 'amit.k', text: 'Amazing color! 🍅' }, { user: 'You', text: 'Where can I buy?' }], timeAgo: '4h' },
  { _id: '3', author: 'marcus_acres', authorInitials: 'MA', authorColor: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', content: 'Early morning on the wheat farm ☀️ 5am and the fields are glowing. Nothing beats this view.', imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80', likes: [{}], comments: [], timeAgo: '6h' },
  { _id: '4', author: 'beekeeper_lisa', authorInitials: 'LB', authorColor: 'linear-gradient(135deg, #ec4899, #be185d)', content: 'Honey harvest season is here! 🍯 First batch of pure natural honey. Limited stock available!', imageUrl: 'https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?w=800&q=80', likes: [{}, {}, {}, {}], comments: [{ user: 'gv_organic', text: 'I need 5kg! DM me.' }], timeAgo: '1d' },
  { _id: '5', author: 'rootsandshoots', authorInitials: 'RS', authorColor: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', content: 'Raised beds thriving this spring 🌱 Started with compost, ended with paradise. #gardening', imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80', likes: [], comments: [], timeAgo: '2d' },
];

// ─── PostCard Component ───────────────────────────────────────────────────────
const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes?.length ?? 0);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>(post.comments ?? []);
  const [lastTap, setLastTap] = useState(0);
  const [heartAnim, setHeartAnim] = useState(false);
  const [followed, setFollowed] = useState(false);

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap < 350) {
      if (!liked) {
        setLiked(true);
        setLikeCount(c => c + 1);
      }
      setHeartAnim(true);
      setTimeout(() => setHeartAnim(false), 900);
    }
    setLastTap(now);
  };

  const handleLike = async () => {
    setLiked(l => !l);
    setLikeCount(c => liked ? c - 1 : c + 1);
    if (post._id) {
      try {
        await fetch(`${API}/api/posts/${post._id}/like`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: 'local-user' }) });
      } catch {}
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const newCmt = { user: 'You', text: newComment.trim() };
    setComments(prev => [...prev, newCmt]);
    setNewComment('');
    if (post._id) {
      try {
        await fetch(`${API}/api/posts/${post._id}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ author: 'You', text: newCmt.text }) });
      } catch {}
    }
  };

  const authorName = post.author ?? post.authorName ?? 'farmuser';
  const timeAgo = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : post.timeAgo ?? '';

  return (
    <div className="ig-post-card">
      {/* Post Header */}
      <div className="ig-post-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div className="ig-post-avatar" style={{ background: post.authorColor ?? 'linear-gradient(135deg,#10b981,#059669)' }}>
            {(post.authorInitials ?? authorName.slice(0, 2)).toUpperCase()}
          </div>
          <div>
            <p className="ig-post-username">{authorName}</p>
            <p className="ig-post-time">{timeAgo}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setFollowed(f => !f)}
            className={`ig-follow-btn ${followed ? 'following' : ''}`}
          >
            {followed ? 'Following' : 'Follow'}
          </button>
          <button className="ig-icon-btn"><MoreHorizontal size={20} /></button>
        </div>
      </div>

      {/* Post Image */}
      {post.imageUrl && (
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={handleDoubleTap}>
          <img src={post.imageUrl} alt="Farm post" className="ig-post-image" />
          {heartAnim && (
            <div className="ig-heart-pop-container">
              <span className="ig-heart-pop">❤️</span>
            </div>
          )}
        </div>
      )}

      {/* Action Row */}
      <div className="ig-action-row">
        <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'center' }}>
          <button onClick={handleLike} className={`ig-icon-btn ${liked ? 'liked' : ''}`}>
            <Heart size={26} fill={liked ? '#ef4444' : 'none'} stroke={liked ? '#ef4444' : 'currentColor'} strokeWidth={1.8} />
          </button>
          <button onClick={() => setShowComments(s => !s)} className="ig-icon-btn">
            <MessageCircle size={26} strokeWidth={1.8} />
          </button>
          <button className="ig-icon-btn">
            <Share2 size={24} strokeWidth={1.8} />
          </button>
        </div>
        <button onClick={() => setSaved(s => !s)} className={`ig-icon-btn ${saved ? 'saved' : ''}`}>
          <Bookmark size={24} fill={saved ? 'currentColor' : 'none'} strokeWidth={1.8} />
        </button>
      </div>

      {/* Likes */}
      <div className="ig-post-body">
        {likeCount > 0 && <p className="ig-likes-count">{likeCount.toLocaleString()} {likeCount === 1 ? 'like' : 'likes'}</p>}

        {/* Caption */}
        {post.content && (
          <p className="ig-caption">
            <span className="ig-caption-user">{authorName} </span>
            {post.content}
          </p>
        )}

        {/* View comments link */}
        {comments.length > 0 && (
          <button onClick={() => setShowComments(s => !s)} className="ig-view-comments">
            View all {comments.length} comment{comments.length > 1 ? 's' : ''}
          </button>
        )}

        {/* Inline comments (latest 2) */}
        {showComments && (
          <div className="ig-comments-list">
            {comments.map((c, i) => (
              <div key={i} className="ig-comment-row">
                <span className="ig-comment-user">{c.user ?? c.author ?? 'User'}</span>
                <span className="ig-comment-text">{c.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Comment */}
      <div className="ig-add-comment">
        <div className="ig-comment-avatar">JD</div>
        <input
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddComment()}
          placeholder="Add a comment…"
          className="ig-comment-input"
        />
        {newComment.trim() && (
          <button onClick={handleAddComment} className="ig-post-btn">Post</button>
        )}
      </div>
    </div>
  );
};

// ─── Create Post Modal ────────────────────────────────────────────────────────
const CreatePostModal: React.FC<{ onClose: () => void; onPost: (post: Post) => void }> = ({ onClose, onPost }) => {
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    }
  };

  const handlePost = async () => {
    if (!content.trim() && !file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('author', 'You');
      formData.append('authorInitials', 'JD');
      formData.append('authorColor', 'linear-gradient(135deg, #10b981, #059669)');
      formData.append('content', content);
      if (file) formData.append('image', file);
      let newPost: Post;
      try {
        const res = await fetch(`${API}/api/posts`, { method: 'POST', body: formData });
        newPost = await res.json();
      } catch {
        newPost = { _id: String(Date.now()), author: 'You', authorInitials: 'JD', authorColor: 'linear-gradient(135deg,#10b981,#059669)', content, imageUrl: preview ?? undefined, likes: [], comments: [], timeAgo: 'Just now' };
      }
      onPost(newPost);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ig-modal-backdrop" onClick={onClose}>
      <div className="ig-modal" onClick={e => e.stopPropagation()}>
        <div className="ig-modal-header">
          <button onClick={onClose} className="ig-icon-btn"><X size={22} /></button>
          <h3>Create post</h3>
          <button onClick={handlePost} disabled={loading || (!content.trim() && !file)} className="ig-share-btn">
            {loading ? 'Sharing…' : 'Share'}
          </button>
        </div>
        <div className="ig-modal-body">
          <div className="ig-post-avatar" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', margin: '0 1rem 0 0', flexShrink: 0 }}>JD</div>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write a caption…"
            className="ig-modal-textarea"
            autoFocus
          />
        </div>
        {preview && (
          <div style={{ position: 'relative' }}>
            <img src={preview} alt="preview" style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', display: 'block' }} />
            <button onClick={() => { setPreview(null); setFile(null); }} className="ig-remove-img">
              <X size={16} />
            </button>
          </div>
        )}
        <div className="ig-modal-footer">
          <button onClick={() => fileRef.current?.click()} className="ig-modal-media-btn">
            <Image size={22} /><span>Photo</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
        </div>
      </div>
    </div>
  );
};

// ─── Main FarmFeed ─────────────────────────────────────────────────────────────
export const FarmFeed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(FALLBACK_POSTS);
  const [stories, setStories] = useState<Story[]>(MOCK_STORIES);
  const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null);
  const [yourStoryUrl, setYourStoryUrl] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const addStoryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${API}/api/posts`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setPosts([...data, ...FALLBACK_POSTS]); })
      .catch(() => {});
  }, []);

  const handleMarkSeen = (id: number) => setStories(prev => prev.map(s => s.id === id ? { ...s, seen: true } : s));
  const handleStoryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setYourStoryUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="ig-root">
      <style>{`
        /* ── Instagram Root ───────────────────────── */
        .ig-root {
          background: #fafafa;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        @media (prefers-color-scheme: dark) {
          .ig-root { background: #000; }
        }

        /* ── Top Navbar ───────────────────────────── */
        .ig-navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          width: 100%;
          max-width: 470px;
          background: rgba(250,250,250,0.92);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid #dbdbdb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.6rem 1rem;
        }
        @media (prefers-color-scheme: dark) {
          .ig-navbar { background: rgba(0,0,0,0.92); border-color: #262626; }
        }
        .ig-navbar-logo {
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #10b981, #3b82f6, #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }
        .ig-navbar-icons { display: flex; gap: 1rem; align-items: center; }

        /* ── Icon Buttons ────────────────────────── */
        .ig-icon-btn {
          background: none; border: none; cursor: pointer;
          color: var(--color-text-main, #0f172a);
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%; padding: 4px;
          transition: opacity 0.15s;
        }
        .ig-icon-btn:hover { opacity: 0.6; }
        .ig-icon-btn.liked { color: #ef4444; }
        .ig-icon-btn.saved { color: var(--color-text-main, #0f172a); }

        /* ── Feed Container ──────────────────────── */
        .ig-feed-container {
          width: 100%;
          max-width: 470px;
          display: flex;
          flex-direction: column;
        }

        /* ── Stories Bar ─────────────────────────── */
        .ig-stories-bar {
          background: var(--color-bg-card, #fff);
          border-bottom: 1px solid #dbdbdb;
          padding: 0.65rem 0.75rem;
          display: flex;
          gap: 0.85rem;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .ig-stories-bar::-webkit-scrollbar { display: none; }
        @media (prefers-color-scheme: dark) {
          .ig-stories-bar { background: #000; border-color: #262626; }
        }

        .ig-story-item {
          display: flex; flex-direction: column; align-items: center; gap: 5px; flex-shrink: 0; cursor: pointer;
        }
        .ig-story-ring {
          width: 62px; height: 62px; border-radius: 50%;
          padding: 2.5px;
          background: linear-gradient(135deg, #f59e0b, #ec4899, #3b82f6);
          transition: transform 0.2s;
        }
        .ig-story-ring.seen { background: #dbdbdb; }
        .ig-story-ring:hover { transform: scale(1.05); }
        .ig-story-inner {
          width: 100%; height: 100%; border-radius: 50%; overflow: hidden;
          border: 2.5px solid #fafafa;
        }
        @media (prefers-color-scheme: dark) {
          .ig-story-inner { border-color: #000; }
        }
        .ig-story-inner img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .ig-story-add-ring {
          width: 62px; height: 62px; border-radius: 50%;
          border: 1.5px solid #dbdbdb;
          display: flex; align-items: center; justify-content: center;
          position: relative; cursor: pointer; overflow: hidden;
          transition: transform 0.2s;
          background: #fff;
        }
        @media (prefers-color-scheme: dark) {
          .ig-story-add-ring { background: #1a1a1a; border-color: #333; }
        }
        .ig-story-add-ring:hover { transform: scale(1.05); }
        .ig-story-add-badge {
          position: absolute; bottom: 0; right: 0;
          background: #0095f6; border-radius: 50%;
          width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;
          border: 2px solid #fafafa;
        }
        .ig-story-name {
          font-size: 0.68rem; color: #737373; text-align: center;
          white-space: nowrap; max-width: 68px; overflow: hidden; text-overflow: ellipsis;
          font-weight: 400;
        }
        @media (prefers-color-scheme: dark) {
          .ig-story-name { color: #a8a8a8; }
        }

        /* ── Post Card ───────────────────────────── */
        .ig-post-card {
          background: #fff;
          border-bottom: 1px solid #dbdbdb;
          margin-bottom: 0;
        }
        @media (prefers-color-scheme: dark) {
          .ig-post-card { background: #000; border-color: #262626; }
        }

        .ig-post-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.6rem 0.85rem;
        }
        .ig-post-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: white; font-weight: 700; font-size: 0.82rem;
          border: 2px solid #fff;
          box-shadow: 0 0 0 1.5px #dbdbdb;
          flex-shrink: 0;
        }
        @media (prefers-color-scheme: dark) {
          .ig-post-avatar { box-shadow: 0 0 0 1.5px #333; border-color: #000; }
        }
        .ig-post-username { font-weight: 600; font-size: 0.9rem; color: #0f172a; margin: 0; }
        @media (prefers-color-scheme: dark) { .ig-post-username { color: #f8fafc; } }
        .ig-post-time { font-size: 0.72rem; color: #737373; margin: 0; }
        .ig-follow-btn {
          background: transparent; border: 1.5px solid #0095f6;
          color: #0095f6; border-radius: 8px;
          padding: 4px 14px; font-size: 0.82rem; font-weight: 600;
          cursor: pointer; font-family: inherit; transition: all 0.2s;
        }
        .ig-follow-btn.following {
          border-color: #dbdbdb; color: #0f172a; background: transparent;
        }
        @media (prefers-color-scheme: dark) {
          .ig-follow-btn.following { color: #f8fafc; border-color: #333; }
        }
        .ig-follow-btn:hover { opacity: 0.7; }

        .ig-post-image { width: 100%; display: block; max-height: 500px; object-fit: cover; }

        /* ── Heart Pop ───────────────────────────── */
        .ig-heart-pop-container {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          pointer-events: none;
        }
        .ig-heart-pop {
          font-size: 5rem;
          animation: heartPop 0.9s ease forwards;
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));
        }
        @keyframes heartPop {
          0% { opacity: 0; transform: scale(0.3); }
          40% { opacity: 1; transform: scale(1.25); }
          70% { transform: scale(0.95); }
          100% { opacity: 0; transform: scale(1); }
        }

        /* ── Action Row ──────────────────────────── */
        .ig-action-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.45rem 0.75rem 0.3rem;
        }

        /* ── Post Body ───────────────────────────── */
        .ig-post-body { padding: 0 0.85rem 0.75rem; }
        .ig-likes-count { font-weight: 700; font-size: 0.88rem; color: #0f172a; margin: 0 0 0.35rem; }
        @media (prefers-color-scheme: dark) { .ig-likes-count { color: #f8fafc; } }
        .ig-caption { font-size: 0.88rem; color: #0f172a; margin: 0 0 0.3rem; line-height: 1.5; }
        @media (prefers-color-scheme: dark) { .ig-caption { color: #f8fafc; } }
        .ig-caption-user { font-weight: 700; }
        .ig-view-comments { background: none; border: none; color: #737373; font-size: 0.85rem; cursor: pointer; padding: 0; font-family: inherit; display: block; margin-bottom: 0.2rem; }
        .ig-comments-list { display: flex; flex-direction: column; gap: 0.25rem; margin-top: 0.25rem; }
        .ig-comment-row { display: flex; gap: 0.4rem; font-size: 0.87rem; }
        .ig-comment-user { font-weight: 700; color: #0f172a; flex-shrink: 0; }
        @media (prefers-color-scheme: dark) { .ig-comment-user { color: #f8fafc; } }
        .ig-comment-text { color: #263238; }
        @media (prefers-color-scheme: dark) { .ig-comment-text { color: #d1d5db; } }

        /* ── Add Comment Row ─────────────────────── */
        .ig-add-comment {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.6rem 0.85rem;
          border-top: 1px solid #efefef;
        }
        @media (prefers-color-scheme: dark) {
          .ig-add-comment { border-color: #262626; }
        }
        .ig-comment-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white; font-size: 0.72rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .ig-comment-input {
          flex: 1; background: none; border: none; outline: none;
          font-family: inherit; font-size: 0.875rem; color: #0f172a;
        }
        @media (prefers-color-scheme: dark) { .ig-comment-input { color: #f8fafc; } }
        .ig-comment-input::placeholder { color: #a3a3a3; }
        .ig-post-btn {
          background: none; border: none; cursor: pointer;
          color: #0095f6; font-weight: 700; font-size: 0.875rem; font-family: inherit;
        }

        /* ── Bottom Nav ──────────────────────────── */
        .ig-bottom-nav {
          position: sticky; bottom: 0; width: 100%; max-width: 470px;
          background: rgba(250,250,250,0.95); border-top: 1px solid #dbdbdb;
          display: flex; justify-content: space-around; align-items: center;
          padding: 0.6rem 0; z-index: 100;
          backdrop-filter: blur(10px);
        }
        @media (prefers-color-scheme: dark) {
          .ig-bottom-nav { background: rgba(0,0,0,0.95); border-color: #262626; }
        }
        .ig-bottom-nav button {
          background: none; border: none; cursor: pointer;
          color: #0f172a; padding: 6px;
          transition: opacity 0.15s;
        }
        @media (prefers-color-scheme: dark) { .ig-bottom-nav button { color: #f8fafc; } }
        .ig-bottom-nav button:hover { opacity: 0.6; }
        .ig-bottom-nav .active-tab { color: #10b981; }

        /* ── Create Post Btn ─────────────────────── */
        .ig-create-btn {
          width: 36px; height: 36px;
          border: 2px solid #0f172a; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; background: none;
          color: #0f172a; transition: all 0.2s;
        }
        @media (prefers-color-scheme: dark) {
          .ig-create-btn { border-color: #f8fafc; color: #f8fafc; }
        }

        /* ── Create Post Modal ───────────────────── */
        .ig-modal-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.65);
          z-index: 500; display: flex; align-items: center; justify-content: center;
          animation: fadeIn 0.2s ease;
        }
        .ig-modal {
          background: #fff; border-radius: 12px; width: 100%; max-width: 420px;
          margin: 1rem; overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
          animation: slideUp 0.25s ease;
        }
        @media (prefers-color-scheme: dark) {
          .ig-modal { background: #1a1a1a; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ig-modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.9rem 1rem; border-bottom: 1px solid #dbdbdb;
        }
        @media (prefers-color-scheme: dark) { .ig-modal-header { border-color: #333; } }
        .ig-modal-header h3 { font-weight: 700; font-size: 1rem; margin: 0; color: #0f172a; }
        @media (prefers-color-scheme: dark) { .ig-modal-header h3 { color: #f8fafc; } }
        .ig-share-btn {
          background: none; border: none; cursor: pointer;
          color: #0095f6; font-weight: 700; font-size: 0.95rem; font-family: inherit;
        }
        .ig-share-btn:disabled { opacity: 0.4; cursor: default; }
        .ig-modal-body { display: flex; align-items: flex-start; padding: 1rem; gap: 0.75rem; }
        .ig-modal-textarea {
          flex: 1; border: none; outline: none; resize: none;
          font-family: inherit; font-size: 1rem; color: #0f172a;
          background: transparent; min-height: 80px; line-height: 1.5;
        }
        @media (prefers-color-scheme: dark) { .ig-modal-textarea { color: #f8fafc; } }
        .ig-modal-textarea::placeholder { color: #a3a3a3; }
        .ig-remove-img {
          position: absolute; top: 8px; right: 8px;
          background: rgba(0,0,0,0.6); border: none; border-radius: 50%;
          width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: white;
        }
        .ig-modal-footer {
          border-top: 1px solid #dbdbdb; padding: 0.75rem 1rem;
          display: flex; gap: 1rem;
        }
        @media (prefers-color-scheme: dark) { .ig-modal-footer { border-color: #333; } }
        .ig-modal-media-btn {
          background: none; border: none; cursor: pointer;
          display: flex; align-items: center; gap: 0.4rem;
          color: #0f172a; font-family: inherit; font-size: 0.9rem; font-weight: 500;
        }
        @media (prefers-color-scheme: dark) { .ig-modal-media-btn { color: #f8fafc; } }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* Story Viewer overlay */}
      {viewingStoryIndex !== null && (
        <StoryViewer
          stories={stories}
          startIndex={viewingStoryIndex}
          onClose={() => setViewingStoryIndex(null)}
          onSeen={handleMarkSeen}
        />
      )}

      {/* Create Post Modal */}
      {showCreate && (
        <CreatePostModal
          onClose={() => setShowCreate(false)}
          onPost={(p) => setPosts(prev => [p, ...prev])}
        />
      )}

      {/* Hidden story file input */}
      <input ref={addStoryRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleStoryFileChange} />

      {/* ── Top Navbar ── */}
      <nav className="ig-navbar">
        <span className="ig-navbar-logo">🌿 FarmFeed</span>
        <div className="ig-navbar-icons">
          <Bell size={24} />
          <button className="ig-create-btn" onClick={() => setShowCreate(true)}>
            <Plus size={18} strokeWidth={2.5} />
          </button>
          <button className="ig-icon-btn">
            <Search size={24} />
          </button>
        </div>
      </nav>

      <div className="ig-feed-container">
        {/* ── Stories Bar ── */}
        <div className="ig-stories-bar">
          {/* Your Story */}
          <div className="ig-story-item" onClick={() => addStoryRef.current?.click()}>
            <div className="ig-story-add-ring">
              {yourStoryUrl
                ? <img src={yourStoryUrl} alt="Your story" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : <div className="ig-comment-avatar" style={{ width: '56px', height: '56px', fontSize: '0.9rem' }}>JD</div>
              }
              <div className="ig-story-add-badge">
                <Plus size={12} color="white" strokeWidth={3} />
              </div>
            </div>
            <span className="ig-story-name">Your Story</span>
          </div>

          {/* Other Stories */}
          {stories.map((s, i) => (
            <div key={s.id} className="ig-story-item" onClick={() => setViewingStoryIndex(i)}>
              <div className={`ig-story-ring ${s.seen ? 'seen' : ''}`}>
                <div className="ig-story-inner">
                  <img src={s.imageUrl} alt={s.authorName} />
                </div>
              </div>
              <span className="ig-story-name">{s.authorName}</span>
            </div>
          ))}
        </div>

        {/* ── Post Feed ── */}
        {posts.map(post => (
          <PostCard key={post._id ?? post.id} post={post} />
        ))}
      </div>

      {/* ── Bottom Navbar ── */}
      <nav className="ig-bottom-nav">
        <button className="active-tab"><Home size={26} strokeWidth={2} /></button>
        <button><Search size={26} /></button>
        <button onClick={() => setShowCreate(true)}><Film size={26} /></button>
        <button><ShoppingBag size={26} /></button>
        <button><User size={26} /></button>
      </nav>
    </div>
  );
};
