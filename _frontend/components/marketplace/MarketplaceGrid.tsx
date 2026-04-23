import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, X, ShoppingCart, MapPin, Tag, Trash2, ImagePlus } from 'lucide-react';

/* ─── Types ─── */
type Category = 'All' | 'Grains' | 'Vegetables' | 'Fruits' | 'Dairy' | 'Other';
interface Listing {
  id: string;
  name: string;
  price: string;
  unit: string;
  category: Exclude<Category, 'All'>;
  seller: string;
  location: string;
  desc: string;
  image: string;   // base64 or empty
  emoji: string;
  createdAt: number;
}

const STORAGE_KEY = 'farm_mkt_listings_v1';
const CATS: Category[] = ['All', 'Grains', 'Vegetables', 'Fruits', 'Dairy', 'Other'];
const CAT_EMOJI: Record<string, string> = {
  Grains: '🌾', Vegetables: '🥦', Fruits: '🍎', Dairy: '🥛', Other: '📦',
};
const SEEDS: Listing[] = [
  { id: 's1', name: 'Organic Wheat', price: '2200', unit: 'quintal', category: 'Grains',
    seller: 'Ramesh Farms', location: 'Ludhiana, Punjab', desc: 'Fresh A-grade wheat, pesticide-free.',
    image: '', emoji: '🌾', createdAt: Date.now() - 86400000 * 2 },
  { id: 's2', name: 'Fresh Tomatoes', price: '35', unit: 'kg', category: 'Vegetables',
    seller: 'Sunita Agro', location: 'Nashik, Maharashtra', desc: 'Hybrid tomatoes, bulk available.',
    image: '', emoji: '🍅', createdAt: Date.now() - 86400000 },
  { id: 's3', name: 'Alphonso Mangoes', price: '450', unit: 'dozen', category: 'Fruits',
    seller: 'Konkan Orchards', location: 'Ratnagiri, Maharashtra', desc: 'GI-tagged Alphonso mangoes.',
    image: '', emoji: '🥭', createdAt: Date.now() - 3600000 * 5 },
  { id: 's4', name: 'Buffalo Milk', price: '65', unit: 'litre', category: 'Dairy',
    seller: 'Gir Cow Dairy', location: 'Anand, Gujarat', desc: 'Pure buffalo milk, farm-fresh daily.',
    image: '', emoji: '🥛', createdAt: Date.now() - 3600000 * 2 },
];

function load(): Listing[] {
  try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch {}
  return SEEDS;
}
function save(d: Listing[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }

const BLANK = { name: '', price: '', unit: 'kg', category: 'Vegetables' as Exclude<Category,'All'>,
  seller: '', location: '', desc: '', image: '', emoji: '' };

export const MarketplaceGrid: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>(load);
  const [cat, setCat]           = useState<Category>('All');
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState(typeof BLANK === 'object' ? { ...BLANK } : BLANK);
  const [preview, setPreview]   = useState('');
  const [err, setErr]           = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { save(listings); }, [listings]);

  const filtered = listings.filter(l =>
    (cat === 'All' || l.category === cat) &&
    (l.name.toLowerCase().includes(search.toLowerCase()) ||
     l.seller.toLowerCase().includes(search.toLowerCase()) ||
     l.location.toLowerCase().includes(search.toLowerCase()))
  ).sort((a, b) => b.createdAt - a.createdAt);

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { setErr('Image must be < 3 MB'); return; }
    const reader = new FileReader();
    reader.onload = ev => { const b64 = ev.target?.result as string; setPreview(b64); setForm(f => ({ ...f, image: b64 })); };
    reader.readAsDataURL(file);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.price || !form.seller) { setErr('Name, price and seller are required.'); return; }
    const listing: Listing = {
      ...form, id: `l-${Date.now()}`,
      emoji: CAT_EMOJI[form.category] || '📦',
      createdAt: Date.now(),
    };
    setListings(p => [listing, ...p]);
    setModal(false); setForm({ ...BLANK }); setPreview(''); setErr('');
  }

  function deleteListing(id: string) { setListings(p => p.filter(l => l.id !== id)); }

  return (
    <div className="mkt-root">
      <style>{`
        .mkt-root { min-height:100vh; background:#f1f5f9; font-family:'Inter',sans-serif; padding-bottom:4rem; }

        /* Hero */
        .mkt-hero { background:linear-gradient(135deg,#14532d 0%,#16a34a 100%);
          padding:2.5rem 2rem 5rem; color:white; position:relative; overflow:hidden; }
        .mkt-hero::after { content:''; position:absolute; top:-30%; right:-10%;
          width:400px; height:400px;
          background:radial-gradient(circle,rgba(255,255,255,0.1),transparent 65%); pointer-events:none; }
        .mkt-hero-inner { max-width:980px; margin:0 auto; display:flex;
          align-items:center; justify-content:space-between; gap:1rem; position:relative; z-index:2; }
        .mkt-hero h1 { font-size:2rem; font-weight:800; margin:0 0 0.3rem; }
        .mkt-hero p  { font-size:0.95rem; opacity:0.8; margin:0; }
        .mkt-post-btn { display:flex; align-items:center; gap:0.5rem;
          background:white; color:#16a34a; border:none; border-radius:14px;
          padding:0.75rem 1.5rem; font-weight:800; font-size:0.95rem; cursor:pointer;
          box-shadow:0 4px 20px rgba(0,0,0,0.15); transition:all 0.2s; white-space:nowrap; }
        .mkt-post-btn:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(0,0,0,0.2); }

        /* Controls */
        .mkt-controls { max-width:980px; margin:-2.5rem auto 1.5rem; padding:0 1.5rem; position:relative; z-index:10; }
        .mkt-search-bar { background:white; border-radius:14px; padding:0.85rem 1.25rem;
          display:flex; align-items:center; gap:0.75rem; box-shadow:0 6px 24px rgba(0,0,0,0.07);
          border:1px solid #e2e8f0; margin-bottom:1rem; transition:all 0.2s; }
        .mkt-search-bar:focus-within { border-color:#16a34a; box-shadow:0 6px 24px rgba(22,163,74,0.1); }
        .mkt-search-bar input { flex:1; border:none; outline:none; font-size:0.97rem; font-family:inherit; color:#0f172a; background:transparent; }
        .mkt-cats { display:flex; gap:0.5rem; flex-wrap:wrap; }
        .mkt-cat { background:white; border:1px solid #e2e8f0; border-radius:10px;
          padding:0.45rem 1rem; font-size:0.85rem; font-weight:600; color:#64748b;
          cursor:pointer; transition:all 0.2s; }
        .mkt-cat:hover  { border-color:#16a34a; color:#16a34a; }
        .mkt-cat.active { background:#14532d; color:white; border-color:#14532d; }

        /* Grid */
        .mkt-grid-wrap { max-width:980px; margin:0 auto; padding:0 1.5rem; }
        .mkt-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(270px,1fr)); gap:1.25rem; }
        .mkt-card { background:white; border-radius:18px; border:1px solid #e2e8f0;
          overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.03);
          transition:all 0.25s; display:flex; flex-direction:column; }
        .mkt-card:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(0,0,0,0.09); border-color:#16a34a; }
        .mkt-img { width:100%; height:180px; object-fit:cover; }
        .mkt-emoji-img { width:100%; height:180px; display:flex; align-items:center;
          justify-content:center; font-size:5rem; background:#f0fdf4; }
        .mkt-card-body { padding:1.25rem; flex:1; display:flex; flex-direction:column; gap:0.4rem; }
        .mkt-card-top { display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem; }
        .mkt-card-name { font-size:1.05rem; font-weight:800; color:#0f172a; margin:0; }
        .mkt-cat-tag { font-size:0.7rem; font-weight:700; background:#f0fdf4; color:#16a34a;
          padding:2px 8px; border-radius:999px; white-space:nowrap; }
        .mkt-price { font-size:1.4rem; font-weight:800; color:#16a34a; }
        .mkt-unit  { font-size:0.82rem; color:#94a3b8; font-weight:500; }
        .mkt-meta  { font-size:0.82rem; color:#64748b; display:flex; align-items:center; gap:0.35rem; }
        .mkt-desc  { font-size:0.83rem; color:#94a3b8; line-height:1.5; margin-top:0.25rem; flex:1; }
        .mkt-actions { display:flex; gap:0.5rem; margin-top:0.75rem; }
        .mkt-buy-btn { flex:1; background:#14532d; color:white; border:none; border-radius:10px;
          padding:0.6rem; font-weight:700; font-size:0.85rem; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:0.4rem; transition:all 0.2s; }
        .mkt-buy-btn:hover { background:#166534; }
        .mkt-del-btn { background:#fff1f2; color:#ef4444; border:1px solid #fecdd3;
          border-radius:10px; padding:0.6rem 0.75rem; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; }
        .mkt-del-btn:hover { background:#ef4444; color:white; }

        /* Empty */
        .mkt-empty { background:white; border-radius:18px; border:2px dashed #e2e8f0;
          padding:4rem 2rem; text-align:center; color:#94a3b8; }
        .mkt-empty h3 { color:#0f172a; margin:1rem 0 0.5rem; }

        /* Modal */
        .mkt-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.55);
          backdrop-filter:blur(4px); z-index:1000; display:flex; align-items:center; justify-content:center; padding:1rem; }
        .mkt-modal { background:white; border-radius:22px; width:100%; max-width:520px;
          max-height:90vh; overflow-y:auto; padding:2rem; box-shadow:0 30px 80px rgba(0,0,0,0.25); }
        .mkt-modal-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem; }
        .mkt-modal-hdr h2 { font-size:1.3rem; font-weight:800; margin:0; }
        .mkt-close { background:none; border:none; cursor:pointer; color:#94a3b8; padding:4px; border-radius:8px; }
        .mkt-close:hover { color:#ef4444; background:#fff1f2; }
        .mkt-field { display:flex; flex-direction:column; gap:0.4rem; margin-bottom:1rem; }
        .mkt-label { font-size:0.82rem; font-weight:700; color:#374151; }
        .mkt-input { border:1px solid #e2e8f0; border-radius:10px; padding:0.65rem 0.9rem;
          font-size:0.93rem; font-family:inherit; color:#0f172a; outline:none; transition:border 0.2s; }
        .mkt-input:focus { border-color:#16a34a; box-shadow:0 0 0 3px rgba(22,163,74,0.1); }
        .mkt-row2 { display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; }
        .mkt-img-drop { border:2px dashed #e2e8f0; border-radius:14px; padding:2rem;
          text-align:center; cursor:pointer; transition:all 0.2s; color:#94a3b8; }
        .mkt-img-drop:hover { border-color:#16a34a; color:#16a34a; background:#f0fdf4; }
        .mkt-preview { width:100%; height:160px; object-fit:cover; border-radius:10px; margin-bottom:0.5rem; }
        .mkt-err { background:#fff1f2; color:#ef4444; border-radius:8px; padding:0.5rem 0.75rem; font-size:0.83rem; font-weight:600; margin-bottom:0.75rem; }
        .mkt-submit { width:100%; background:#14532d; color:white; border:none; border-radius:12px;
          padding:0.85rem; font-weight:800; font-size:1rem; cursor:pointer; margin-top:0.5rem; transition:all 0.2s; }
        .mkt-submit:hover { background:#166534; transform:translateY(-1px); }
      `}</style>

      {/* Hero */}
      <div className="mkt-hero">
        <div className="mkt-hero-inner">
          <div>
            <h1>🛒 Market Listings</h1>
            <p>Buy and sell fresh produce directly from farmers</p>
          </div>
          <button className="mkt-post-btn" onClick={() => setModal(true)}>
            <Plus size={18} /> Post a Listing
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="mkt-controls">
        <div className="mkt-search-bar">
          <Search size={20} color="#94a3b8" />
          <input placeholder="Search crop, seller or location…" value={search} onChange={e => setSearch(e.target.value)} />
          {search && <X size={18} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => setSearch('')} />}
        </div>
        <div className="mkt-cats">
          {CATS.map(c => (
            <button key={c} className={`mkt-cat ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>
              {c !== 'All' ? CAT_EMOJI[c] + ' ' : ''}{c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="mkt-grid-wrap">
        <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '1rem', fontWeight: 600 }}>
          {filtered.length} listing{filtered.length !== 1 ? 's' : ''} found
        </p>
        {filtered.length === 0 ? (
          <div className="mkt-empty">
            <div style={{ fontSize: '3rem' }}>🌱</div>
            <h3>No listings found</h3>
            <p>Be the first to post in this category!</p>
          </div>
        ) : (
          <div className="mkt-grid">
            {filtered.map(l => (
              <div key={l.id} className="mkt-card">
                {l.image
                  ? <img src={l.image} alt={l.name} className="mkt-img" />
                  : <div className="mkt-emoji-img">{l.emoji}</div>
                }
                <div className="mkt-card-body">
                  <div className="mkt-card-top">
                    <h3 className="mkt-card-name">{l.name}</h3>
                    <span className="mkt-cat-tag">{CAT_EMOJI[l.category]} {l.category}</span>
                  </div>
                  <div>
                    <span className="mkt-price">₹{l.price}</span>
                    <span className="mkt-unit"> / {l.unit}</span>
                  </div>
                  <p className="mkt-meta"><Tag size={12} /> {l.seller}</p>
                  <p className="mkt-meta"><MapPin size={12} /> {l.location}</p>
                  {l.desc && <p className="mkt-desc">{l.desc}</p>}
                  <div className="mkt-actions">
                    <button className="mkt-buy-btn"><ShoppingCart size={15} /> Contact Seller</button>
                    <button className="mkt-del-btn" onClick={() => deleteListing(l.id)}><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="mkt-overlay" onClick={e => { if (e.target === e.currentTarget) { setModal(false); setErr(''); } }}>
          <div className="mkt-modal">
            <div className="mkt-modal-hdr">
              <h2>📦 Post a Listing</h2>
              <button className="mkt-close" onClick={() => { setModal(false); setErr(''); setPreview(''); setForm({ ...BLANK }); }}>
                <X size={22} />
              </button>
            </div>

            {/* Image Upload */}
            <div className="mkt-field">
              <label className="mkt-label">Product Photo</label>
              {preview
                ? <><img src={preview} alt="preview" className="mkt-preview" />
                    <button style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '4px 12px', cursor: 'pointer', fontSize: '0.8rem', color: '#64748b' }}
                      onClick={() => { setPreview(''); setForm(f => ({ ...f, image: '' })); if (fileRef.current) fileRef.current.value = ''; }}>
                      Remove Photo
                    </button></>
                : <div className="mkt-img-drop" onClick={() => fileRef.current?.click()}>
                    <ImagePlus size={32} style={{ marginBottom: 8 }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>Click to upload photo</p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.78rem' }}>JPG, PNG, WebP · max 3 MB</p>
                  </div>
              }
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
            </div>

            <form onSubmit={submit}>
              <div className="mkt-field">
                <label className="mkt-label">Product / Crop Name *</label>
                <input className="mkt-input" placeholder="e.g. Organic Wheat" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="mkt-row2">
                <div className="mkt-field">
                  <label className="mkt-label">Price (₹) *</label>
                  <input className="mkt-input" type="number" placeholder="e.g. 2200" value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                </div>
                <div className="mkt-field">
                  <label className="mkt-label">Unit</label>
                  <select className="mkt-input" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                    {['kg','quintal','ton','litre','dozen','piece','bag','crate'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="mkt-field">
                <label className="mkt-label">Category</label>
                <select className="mkt-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Exclude<Category,'All'> }))}>
                  {(['Grains','Vegetables','Fruits','Dairy','Other'] as const).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="mkt-row2">
                <div className="mkt-field">
                  <label className="mkt-label">Your Name / Farm *</label>
                  <input className="mkt-input" placeholder="e.g. Ramesh Farms" value={form.seller}
                    onChange={e => setForm(f => ({ ...f, seller: e.target.value }))} />
                </div>
                <div className="mkt-field">
                  <label className="mkt-label">Location</label>
                  <input className="mkt-input" placeholder="e.g. Ludhiana, Punjab" value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                </div>
              </div>
              <div className="mkt-field">
                <label className="mkt-label">Description</label>
                <textarea className="mkt-input" rows={3} placeholder="Describe quality, quantity available…"
                  style={{ resize: 'vertical' }} value={form.desc}
                  onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
              </div>
              {err && <div className="mkt-err">⚠️ {err}</div>}
              <button type="submit" className="mkt-submit">✅ Post Listing</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
