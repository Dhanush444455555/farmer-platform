import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, UserPlus, MoreVertical, Volume2, VolumeX, ChevronUp } from 'lucide-react';
import type { Post } from './types';

const API = 'http://localhost:5000';

const FALLBACK_POSTS = [
  { _id: '1', author: 'nagarajcprp1983', authorInitials: 'NA', authorColor: 'linear-gradient(135deg, #f59e0b, #d97706)', content: 'Fresh harvest from the paddy fields today 🌾', imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', likes: ['u1','u2','u3'], comments: [], createdAt: '' },
  { _id: '2', author: 'greenvalley_farm', authorInitials: 'GV', authorColor: 'linear-gradient(135deg, #10b981, #059669)', content: 'Organic tomatoes ready for the market today 🍅', imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80', likes: ['u1'], comments: [], createdAt: '' },
  { _id: '3', author: 'marcus_acres', authorInitials: 'MA', authorColor: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', content: 'Early morning on the wheat farm ☀️🌾', imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80', likes: [], comments: [], createdAt: '' },
  { _id: '4', author: 'beekeeper_lisa', authorInitials: 'LB', authorColor: 'linear-gradient(135deg, #ec4899, #be185d)', content: 'Honey harvest season is here! 🍯', imageUrl: 'https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?w=800&q=80', likes: ['u1','u2'], comments: [], createdAt: '' },
  { _id: '5', author: 'rootsandshoots', authorInitials: 'RS', authorColor: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', content: 'Raised beds are thriving this spring 🌱', imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80', likes: [], comments: [], createdAt: '' },
];

export const ReelsFeed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(FALLBACK_POSTS as unknown as Post[]);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [likeCountMap, setLikeCountMap] = useState<Record<string, number>>({});
  const [followMap, setFollowMap] = useState<Record<string, boolean>>({});
  const [muted, setMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API}/api/posts`)
      .then(r => r.json())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(data => { if (data.length > 0) setPosts([...data, ...FALLBACK_POSTS as any]); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const counts: Record<string, number> = {};
    posts.forEach(p => {
      const id = p._id ?? String(p.id);
      counts[id] = Array.isArray(p.likes) ? p.likes.length : 0;
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLikeCountMap(counts);
  }, [posts]);

  const handleLike = async (post: Post) => {
    const id = post._id ?? String(post.id);
    const isLiked = likedMap[id];
    setLikedMap(m => ({ ...m, [id]: !isLiked }));
    setLikeCountMap(m => ({ ...m, [id]: (m[id] ?? 0) + (isLiked ? -1 : 1) }));
    if (post._id) {
      try {
        await fetch(`${API}/api/posts/${post._id}/like`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: 'local-user' }) });
      } catch { /* ignore */ }
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        overflowY: 'scroll',
        scrollSnapType: 'y mandatory',
        background: '#000',
        zIndex: 200,
      }}
    >
      {posts.map((post) => {
        const id = post._id ?? String(post.id);
        const liked = likedMap[id] ?? false;
        const likeCount = likeCountMap[id] ?? 0;
        const followed = followMap[id] ?? false;
        const authorName = post.author ?? post.authorName ?? 'User';

        return (
          <div
            key={id}
            style={{
              position: 'relative',
              width: '100%',
              height: '100dvh',
              scrollSnapAlign: 'start',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {/* Background image */}
            {post.imageUrl ? (
              <img src={post.imageUrl} alt="post" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ position: 'absolute', inset: 0, background: post.authorColor ?? '#111' }} />
            )}

            {/* Dark gradient overlays */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 25%, transparent 55%, rgba(0,0,0,0.7) 100%)', pointerEvents: 'none' }} />

            {/* Top bar: author + follow */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '1.25rem 1rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: post.authorColor ?? 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem', border: '2px solid white', flexShrink: 0 }}>
                  {(post.authorInitials ?? authorName.slice(0, 2)).toUpperCase()}
                </div>
                <div>
                  <p style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', margin: 0, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>{authorName}</p>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem', margin: 0 }}>Suggested for you</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  onClick={() => setFollowMap(m => ({ ...m, [id]: !followed }))}
                  style={{ background: followed ? 'rgba(255,255,255,0.2)' : 'transparent', border: '1.5px solid white', borderRadius: '6px', color: 'white', padding: '0.3rem 0.85rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', fontFamily: 'inherit', transition: 'background 0.2s' }}
                >
                  {followed ? 'Following' : 'Follow'}
                </button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Bottom caption + right actions */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', zIndex: 10 }}>
              {/* Left: caption */}
              <div style={{ flex: 1, paddingRight: '1rem' }}>
                <p style={{ color: 'white', fontWeight: 500, fontSize: '0.95rem', margin: 0, textShadow: '0 1px 4px rgba(0,0,0,0.6)', lineHeight: 1.5 }}>{post.content}</p>
              </div>

              {/* Right: action buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                {/* Like */}
                <button
                  onClick={() => handleLike(post)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: liked ? '#ef4444' : 'white', transition: 'color 0.2s' }}
                >
                  <Heart size={28} fill={liked ? '#ef4444' : 'none'} strokeWidth={1.8} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'white' }}>{likeCount}</span>
                </button>

                {/* Comment */}
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'white' }}>
                  <MessageCircle size={28} strokeWidth={1.8} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{post.comments?.length ?? 0}</span>
                </button>

                {/* Share */}
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'white' }}>
                  <Share2 size={26} strokeWidth={1.8} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Share</span>
                </button>

                {/* Follow (shortcut icon) */}
                <button
                  onClick={() => setFollowMap(m => ({ ...m, [id]: !followed }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: followed ? '#10b981' : 'white' }}
                >
                  <UserPlus size={26} strokeWidth={1.8} />
                </button>

                {/* Mute */}
                <button
                  onClick={() => setMuted(m => !m)}
                  style={{ background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
                >
                  {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Scroll up hint */}
      <div style={{ position: 'fixed', top: '50%', right: '0.5rem', transform: 'translateY(-50%)', pointer: 'none', opacity: 0.4, zIndex: 300 }}>
        <ChevronUp size={20} color="white" />
      </div>
    </div>
  );
};
