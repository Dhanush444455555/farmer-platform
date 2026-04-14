import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from 'lucide-react';
import type { Post } from './types';

const API = 'http://localhost:5000';

interface PostItemProps {
  post: Post;
}

export const PostItem: React.FC<PostItemProps> = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes?.length ?? 0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(post.comments ?? []);
  const [lastTap, setLastTap] = useState(0);
  const [heartAnim, setHeartAnim] = useState(false);

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap < 350) {
      handleLike();
      setHeartAnim(true);
      setTimeout(() => setHeartAnim(false), 900);
    }
    setLastTap(now);
  };

  const handleLike = async () => {
    try {
      const res = await fetch(`${API}/api/posts/${post._id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'local-user' })
      });
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.likes);
    } catch {
      // optimistic fallback
      setLiked(l => !l);
      setLikeCount(c => liked ? c - 1 : c + 1);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`${API}/api/posts/${post._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: 'You', text: newComment.trim() })
      });
      const comment = await res.json();
      setComments(prev => [...prev, { user: comment.author, text: comment.text }]);
      setNewComment('');
    } catch {
      setComments(prev => [...prev, { user: 'You', text: newComment.trim() }]);
      setNewComment('');
    }
  };

  const timeAgo = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : post.timeAgo;

  return (
    <div style={{ background: 'var(--color-bg-card)', backdropFilter: 'blur(12px)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-lg)', marginBottom: '1.5rem', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: post.authorColor ?? 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
            {post.authorInitials ?? post.authorName?.slice(0,2).toUpperCase()}
          </div>
          <div>
            <p style={{ fontWeight: 600, color: 'var(--color-text-main)', margin: 0 }}>{post.authorName ?? post.author}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>{timeAgo}</p>
          </div>
        </div>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Caption */}
      <p style={{ padding: '0 1.25rem 0.75rem', color: 'var(--color-text-main)', margin: 0 }}>{post.content}</p>

      {/* Photo - double tap to like */}
      {post.imageUrl && (
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={handleDoubleTap}>
          <img src={post.imageUrl} alt="Post" style={{ width: '100%', maxHeight: '480px', objectFit: 'cover', display: 'block' }} />
          {heartAnim && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <span style={{ fontSize: '5rem', animation: 'heartPop 0.9s ease forwards' }}>❤️</span>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ padding: '0.75rem 1.25rem', display: 'flex', gap: '1.25rem', alignItems: 'center', borderTop: '1px solid var(--color-border)' }}>
        <button onClick={handleLike} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: liked ? '#ef4444' : 'var(--color-text-muted)', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}>
          <Heart size={22} fill={liked ? '#ef4444' : 'none'} /> {likeCount}
        </button>
        <button onClick={() => setShowComments(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 500 }}>
          <MessageCircle size={22} /> {comments.length}
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
          <Share2 size={22} />
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div style={{ padding: '0 1.25rem 1rem', borderTop: '1px solid var(--color-border)' }}>
          {comments.length === 0 && <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', padding: '0.75rem 0' }}>No comments yet. Be the first!</p>}
          {comments.map((c, i) => (
            <div key={i} style={{ paddingTop: '0.6rem', display: 'flex', gap: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.875rem' }}>{c.user ?? c.author}</span>
              <span style={{ color: 'var(--color-text-main)', fontSize: '0.875rem' }}>{c.text}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddComment()} placeholder="Add a comment..."
              style={{ flex: 1, border: 'none', borderBottom: '1px solid var(--color-border)', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: '0.9rem', color: 'var(--color-text-main)', paddingBottom: '0.25rem' }} />
            <button onClick={handleAddComment} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}>
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes heartPop {
          0% { opacity: 0; transform: scale(0.3); }
          40% { opacity: 1; transform: scale(1.2); }
          70% { transform: scale(0.9); }
          100% { opacity: 0; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
