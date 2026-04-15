import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface Story {
  id: number;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  imageUrl: string;
  seen: boolean;
}

interface StoryViewerProps {
  stories: Story[];
  startIndex: number;
  onClose: () => void;
  onSeen: (id: number) => void;
}

const STORY_DURATION = 5000;

export const StoryViewer: React.FC<StoryViewerProps> = ({ stories, startIndex, onClose, onSeen }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef(0);

  const current = stories[currentIndex];

  const goNext = () => {
    onSeen(current.id);
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(i => i + 1);
      setProgress(0);
      startTime.current = Date.now();
    } else {
      onClose();
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
      setProgress(0);
      startTime.current = Date.now();
    }
  };

  useEffect(() => {
    startTime.current = Date.now();
    setProgress(0);
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(pct);
      if (elapsed >= STORY_DURATION) goNext();
    }, 50);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.95)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'relative', width: '100%', maxWidth: '400px', height: '100dvh',
        maxHeight: '750px', background: '#000', borderRadius: '1rem', overflow: 'hidden',
      }}>
        {/* Progress bars */}
        <div style={{ position: 'absolute', top: '1rem', left: '0.75rem', right: '0.75rem', zIndex: 10, display: 'flex', gap: '4px' }}>
          {stories.map((_, i) => (
            <div key={i} style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.35)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '99px', background: 'white',
                width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%',
                transition: i === currentIndex ? 'none' : undefined,
              }} />
            </div>
          ))}
        </div>

        {/* Author info */}
        <div style={{ position: 'absolute', top: '2.5rem', left: '1rem', right: '3rem', zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: current.authorColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem', border: '2px solid white', flexShrink: 0 }}>
            {current.authorInitials}
          </div>
          <span style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{current.authorName}</span>
        </div>

        {/* Close button */}
        <button onClick={onClose} style={{ position: 'absolute', top: '2.5rem', right: '1rem', zIndex: 10, background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
          <X size={18} />
        </button>

        {/* Story image */}
        <img src={current.imageUrl} alt="story" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.3) 100%)', pointerEvents: 'none' }} />

        {/* Tap zones */}
        <div onClick={goPrev} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '35%', cursor: 'pointer', zIndex: 5 }} />
        <div onClick={goNext} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '35%', cursor: 'pointer', zIndex: 5 }} />

        {/* Nav arrows */}
        {currentIndex > 0 && <button onClick={goPrev} style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', zIndex: 8, background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}><ChevronLeft size={20} /></button>}
        {currentIndex < stories.length - 1 && <button onClick={goNext} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', zIndex: 8, background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}><ChevronRight size={20} /></button>}
      </div>
    </div>
  );
};


interface StoryCirclesProps {
  stories: Story[];
  onStoryClick: (index: number) => void;
  onAddStory: () => void;
  yourStoryImageUrl: string | null;
}

export const StoryCircles: React.FC<StoryCirclesProps> = ({ stories, onStoryClick, onAddStory, yourStoryImageUrl }) => {
  return (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
      {/* Your Story */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
        <div
          onClick={yourStoryImageUrl ? () => onStoryClick(-1) : onAddStory}
          style={{
            width: '64px', height: '64px', borderRadius: '50%', position: 'relative', cursor: 'pointer',
            background: yourStoryImageUrl ? 'transparent' : 'var(--color-bg-card)',
            border: yourStoryImageUrl ? '3px solid var(--color-primary)' : '2px dashed var(--color-border)',
            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.2s',
          }}
          onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {yourStoryImageUrl
            ? <img src={yourStoryImageUrl} alt="Your story" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-text-muted)' }}>
                <div style={{ background: 'var(--color-primary)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2px' }}>
                  <Plus size={14} color="white" />
                </div>
              </div>
          }
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>Your Story</span>
      </div>

      {/* Other Stories */}
      {stories.map((s, i) => (
        <div key={s.id} onClick={() => onStoryClick(i)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', flexShrink: 0, cursor: 'pointer' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden',
            padding: '2px',
            background: s.seen ? 'rgba(128,128,128,0.3)' : 'linear-gradient(135deg, #f59e0b, #10b981, #3b82f6)',
            transition: 'transform 0.2s',
          }}
            onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--color-bg-base)' }}>
              <img src={s.imageUrl} alt={s.authorName} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
          <span style={{ fontSize: '0.72rem', color: s.seen ? 'var(--color-text-muted)' : 'var(--color-text-main)', whiteSpace: 'nowrap', fontWeight: s.seen ? 400 : 600 }}>{s.authorName}</span>
        </div>
      ))}
    </div>
  );
};
