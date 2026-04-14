import React, { useState, useRef } from 'react';
import { Image, X, Send } from 'lucide-react';

const API = 'http://localhost:5000';

interface CreatePostProps {
  onPost: (post: object) => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onPost }) => {
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      const res = await fetch(`${API}/api/posts`, { method: 'POST', body: formData });
      const newPost = await res.json();
      onPost(newPost);
      setContent('');
      setPreview(null);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'var(--color-bg-card)', backdropFilter: 'blur(12px)',
      border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-lg)',
      padding: '1.25rem', marginBottom: '1.5rem',
    }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: '1rem'
        }}>JD</div>

        <div style={{ flex: 1 }}>
          <textarea
            placeholder="Share something with the farming community..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            style={{
              width: '100%', resize: 'none', background: 'transparent',
              border: 'none', outline: 'none', color: 'var(--color-text-main)',
              fontFamily: 'inherit', fontSize: '1rem', lineHeight: 1.6,
            }}
          />

          {preview && (
            <div style={{ position: 'relative', marginBottom: '0.75rem', borderRadius: 'var(--border-radius-md)', overflow: 'hidden' }}>
              <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', display: 'block' }} />
              <button onClick={() => { setPreview(null); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <X size={14} />
              </button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
            <button onClick={() => fileInputRef.current?.click()}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', fontWeight: 500, fontSize: '0.9rem', fontFamily: 'inherit', padding: '0.25rem 0.5rem', borderRadius: 'var(--border-radius-sm)' }}>
              <Image size={20} /> Photo
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />

            <button onClick={handlePost} disabled={loading || (!content.trim() && !file)}
              style={{ background: (loading || (!content.trim() && !file)) ? 'rgba(16,185,129,0.4)' : 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--border-radius-md)', padding: '0.45rem 1.25rem', cursor: (loading || (!content.trim() && !file)) ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.95rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }}>
              <Send size={16} /> {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
