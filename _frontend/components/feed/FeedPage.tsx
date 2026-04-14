import React, { useState, useEffect, useRef } from 'react';
import { CreatePost } from './CreatePost';
import { PostItem } from './PostItem';
import { StoryViewer, StoryCircles } from './Stories';
import type { Post } from './types';

const API = 'http://localhost:5000';

const MOCK_STORIES = [
  { id: 1, authorName: 'Sarah J.', authorInitials: 'SJ', authorColor: 'linear-gradient(135deg, #f59e0b, #d97706)', imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80', seen: false },
  { id: 2, authorName: 'Marcus T.', authorInitials: 'MT', authorColor: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80', seen: false },
  { id: 3, authorName: 'GV Organics', authorInitials: 'GV', authorColor: 'linear-gradient(135deg, #10b981, #059669)', imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80', seen: false },
  { id: 4, authorName: 'Amit K.', authorInitials: 'AK', authorColor: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', imageUrl: 'https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?w=600&q=80', seen: false },
  { id: 5, authorName: 'Lisa B.', authorInitials: 'LB', authorColor: 'linear-gradient(135deg, #ec4899, #be185d)', imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80', seen: false },
];

export const FeedPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stories, setStories] = useState(MOCK_STORIES);
  const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null);
  const [yourStoryUrl, setYourStoryUrl] = useState<string | null>(null);
  const addStoryRef = useRef<HTMLInputElement>(null);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API}/api/posts`);
      if (!res.ok) throw new Error('Failed to load posts');
      const data = await res.json();
      setPosts(data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleNewPost = (post: object) => {
    setPosts(prev => [post as Post, ...prev]);
  };

  const handleAddStory = () => {
    addStoryRef.current?.click();
  };

  const handleStoryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setYourStoryUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMarkSeen = (id: number) => {
    setStories(prev => prev.map(s => s.id === id ? { ...s, seen: true } : s));
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
      {/* Hidden file input for "Your Story" */}
      <input ref={addStoryRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleStoryFileChange} />

      {/* Story Viewer overlay */}
      {viewingStoryIndex !== null && (
        <StoryViewer
          stories={stories}
          startIndex={viewingStoryIndex}
          onClose={() => setViewingStoryIndex(null)}
          onSeen={handleMarkSeen}
        />
      )}

      <div style={{ width: '100%', maxWidth: '600px' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>Community Feed</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Share your farm life. See what others are growing.</p>
        </div>

        {/* Instagram-style Story Circles */}
        <StoryCircles
          stories={stories}
          onStoryClick={(i) => setViewingStoryIndex(i)}
          onAddStory={handleAddStory}
          yourStoryImageUrl={yourStoryUrl}
        />

        {/* Create Post */}
        <CreatePost onPost={handleNewPost} />

        {/* Feed */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌱</div>
            Loading community posts...
          </div>
        )}

        {error && (
          <div style={{ padding: '1rem', borderRadius: 'var(--border-radius-md)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', marginBottom: '1rem' }}>
            ⚠️ {error} — make sure the server is running at port 5000.
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📭</div>
            No posts yet. Be the first to share something!
          </div>
        )}

        {posts.map(post => (
          <PostItem key={post._id ?? post.id} post={post} />
        ))}
      </div>
    </div>
  );
};
