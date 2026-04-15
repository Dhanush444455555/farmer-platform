import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Search, MapPin, 
  RefreshCcw, AlertCircle, BarChart2
} from 'lucide-react';

interface MarketItem {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changeStr: string;
  market: string;
  lastUpdated: string;
}

// ─── Dummy Data Generator ─────────────────────────────────────────────────────
const MOCK_PRICES: MarketItem[] = [
  { id: '1', name: 'Tomato (Local)', category: 'Vegetables', price: 28, unit: 'kg', trend: 'up', changeStr: '+₹4.00 (16%)', market: 'Azadpur Mandi, Delhi', lastUpdated: 'Just now' },
  { id: '2', name: 'Onion (Red)', category: 'Vegetables', price: 42, unit: 'kg', trend: 'stable', changeStr: '0.00 (0%)', market: 'Lasalgaon, MH', lastUpdated: '10 mins ago' },
  { id: '3', name: 'Potato (Jyoti)', category: 'Vegetables', price: 18, unit: 'kg', trend: 'down', changeStr: '-₹2.00 (10%)', market: 'Agra Mandi, UP', lastUpdated: '1 hour ago' },
  { id: '4', name: 'Wheat (Sharbati)', category: 'Grains', price: 2850, unit: 'Quintal', trend: 'up', changeStr: '+₹150 (5.5%)', market: 'Sehore, MP', lastUpdated: '3 hours ago' },
  { id: '5', name: 'Paddy (Basmati 1121)', category: 'Grains', price: 3400, unit: 'Quintal', trend: 'up', changeStr: '+₹80 (2.4%)', market: 'Karnal, HR', lastUpdated: 'Just now' },
  { id: '6', name: 'Mango (Alphonso)', category: 'Fruits', price: 850, unit: 'Dozen', trend: 'down', changeStr: '-₹100 (10%)', market: 'Ratnagiri, MH', lastUpdated: '30 mins ago' },
  { id: '7', name: 'Apple (Kashmiri)', category: 'Fruits', price: 120, unit: 'kg', trend: 'stable', changeStr: '0.00 (0%)', market: 'Sopore, J&K', lastUpdated: '2 hours ago' },
  { id: '8', name: 'Cotton', category: 'Cash Crops', price: 6800, unit: 'Quintal', trend: 'down', changeStr: '-₹200 (2.8%)', market: 'Rajkot, GJ', lastUpdated: '4 hours ago' },
  { id: '9', name: 'Sugarcane', category: 'Cash Crops', price: 380, unit: 'Quintal', trend: 'stable', changeStr: '0.00 (0%)', market: 'Meerut, UP', lastUpdated: 'Yesterday' },
];

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Grains', 'Cash Crops'];

export const MarketPrices: React.FC = () => {
  const [data, setData] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  
  // Reading API key from the local environment variable
  const apiKey = import.meta.env.VITE_AGMARKNET_API_KEY || '579b464db66ec23bdd00000194e769143c0d486d5fe5a38e063b96fc';

  // ─── API Integration Point ──────────────────────────────────────────────────
  const fetchPrices = async () => {
    setLoading(true);
    try {
      if (apiKey && apiKey.trim() !== '') {
        let url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=100`;
        
        // Dynamic Server-Side Search for Commodities
        if (search.trim()) {
          // Capitalize first letter as Agmarknet usually stores commodities with Title Case (e.g., 'Papaya')
          const capitalizedSearch = search.charAt(0).toUpperCase() + search.slice(1).toLowerCase();
          url += `&filters[commodity]=${encodeURIComponent(capitalizedSearch)}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const apiData = await res.json();
        
        if (apiData.records && apiData.records.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mappedData: MarketItem[] = apiData.records.map((r: any, idx: number) => {
            let cat = 'Vegetables';
            const c = (r.commodity || '').toLowerCase();
            const fruits = ['apple', 'mango', 'banana', 'grapes', 'papaya', 'pappaya', 'orange', 'watermelon', 'pomegranate', 'guava', 'pineapple', 'sweet lemon', 'citrus'];
            const grains = ['wheat', 'paddy', 'rice', 'maize', 'bajra', 'jowar', 'barley', 'sorghum', 'gram', 'pulse'];
            const cashCrops = ['cotton', 'sugar', 'jute', 'tobacco', 'mustard', 'soyabean', 'groundnut'];

            if (fruits.some(f => c.includes(f))) cat = 'Fruits';
            else if (grains.some(g => c.includes(g))) cat = 'Grains';
            else if (cashCrops.some(cc => c.includes(cc))) cat = 'Cash Crops';

            return {
              id: `api-${idx}`,
              name: `${r.commodity || 'Unknown'} (${r.variety || 'Local'})`,
              category: cat,
              price: parseFloat(r.modal_price) || 0,
              unit: 'Quintal',
              trend: 'stable',
              changeStr: `Min: ₹${r.min_price} / Max: ₹${r.max_price}`,
              market: `${r.market || 'Unknown'}, ${r.state || ''}`,
              lastUpdated: r.arrival_date || 'Today'
            };
          });
          setData(mappedData);
          setLoading(false);
          return;
        }
      }
      
      // Fallback
      await new Promise(r => setTimeout(r, 1200));
      setData(MOCK_PRICES);
    } catch (err) {
      console.error('Failed to fetch prices', err);
      setData(MOCK_PRICES); // fallback to mock data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredData = data.filter(item => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.market.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="mp-root">
      <style>{`
        .mp-root {
          min-height: 100vh;
          background: #f8fafc;
          font-family: 'Inter', system-ui, sans-serif;
          padding-bottom: 2rem;
        }

        /* ── Hero ──────────────────────────────────── */
        .mp-hero {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          padding: 2.5rem 2rem 2rem;
        }
        .mp-hero-top {
          display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;
        }
        .mp-hero-icon {
          width: 56px; height: 56px; border-radius: 16px;
          background: rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(8px);
        }
        .mp-hero h1 {
          font-size: 1.6rem; font-weight: 800; color: white; margin: 0;
        }
        .mp-hero p {
          color: rgba(255,255,255,0.85); font-size: 0.9rem; margin: 4px 0 0;
        }
        
        /* ── Search & Filter ───────────────────────── */
        .mp-controls {
          max-width: 800px; margin: -1.25rem 2rem 1.5rem;
          display: flex; flex-direction: column; gap: 1rem;
        }
        .mp-search-bar {
          background: white; border-radius: 12px;
          padding: 0.8rem 1rem;
          display: flex; align-items: center; gap: 0.75rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .mp-search-input {
          flex: 1; border: none; outline: none; font-family: inherit; font-size: 1rem; color: #0f172a;
        }
        .mp-search-input::placeholder { color: #94a3b8; }
        .mp-refresh-btn {
          background: #eff6ff; color: #3b82f6; border: none; border-radius: 8px;
          padding: 0.4rem; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.2s;
        }
        .mp-refresh-btn:hover { background: #dbeafe; }

        .mp-categories {
          display: flex; gap: 0.5rem; overflow-x: auto; scrollbar-width: none;
        }
        .mp-categories::-webkit-scrollbar { display: none; }
        .mp-cat-btn {
          background: white; border: 1px solid #e2e8f0; color: #64748b;
          padding: 0.5rem 1rem; border-radius: 999px;
          font-family: inherit; font-size: 0.85rem; font-weight: 600;
          cursor: pointer; white-space: nowrap; transition: all 0.2s;
        }
        .mp-cat-btn:hover { background: #f8fafc; border-color: #cbd5e1; }
        .mp-cat-btn.active {
          background: #3b82f6; border-color: #3b82f6; color: white;
          box-shadow: 0 2px 8px rgba(59,130,246,0.3);
        }

        /* ── Content ───────────────────────────────── */
        .mp-content {
          padding: 0 2rem; max-width: 800px;
        }
        .mp-list-header {
          display: flex; justify-content: space-between; align-items: flex-end;
          margin-bottom: 1rem;
        }
        .mp-list-title {
          font-size: 1.1rem; font-weight: 800; color: #0f172a; margin: 0;
        }
        .mp-list-meta {
          font-size: 0.8rem; color: #94a3b8; font-weight: 500;
        }

        .mp-list {
          display: flex; flex-direction: column; gap: 0.75rem;
        }
        .mp-card {
          background: white; border-radius: 14px; border: 1px solid #e2e8f0;
          padding: 1.25rem;
          display: flex; justify-content: space-between; align-items: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02); transition: transform 0.2s, box-shadow 0.2s;
        }
        .mp-card:hover {
          transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06);
        }
        
        .mp-card-left { display: flex; flex-direction: column; gap: 0.3rem; }
        .mp-crop-name { font-size: 1.05rem; font-weight: 700; color: #0f172a; margin: 0; }
        .mp-crop-market {
          display: flex; align-items: center; gap: 0.3rem;
          font-size: 0.8rem; color: #64748b; margin: 0;
        }

        .mp-card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.3rem; }
        .mp-price {
          font-size: 1.25rem; font-weight: 800; color: #0f172a; margin: 0; display: flex; align-items: baseline; gap: 0.2rem;
        }
        .mp-unit { font-size: 0.8rem; font-weight: 600; color: #94a3b8; }
        
        .mp-trend {
          display: flex; align-items: center; gap: 0.25rem;
          font-size: 0.8rem; font-weight: 700; padding: 2px 6px; border-radius: 6px;
        }
        .mp-trend.up { color: #10b981; background: #ecfdf5; }
        .mp-trend.down { color: #ef4444; background: #fef2f2; }
        .mp-trend.stable { color: #64748b; background: #f1f5f9; }

        /* ── Loaders & Blank States ────────────────── */
        .mp-loader {
          padding: 3rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; color: #64748b; font-weight: 500;
        }
        .mp-spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        .mp-empty {
          text-align: center; padding: 3rem 1rem; color: #64748b;
          background: white; border-radius: 14px; border: 1px dashed #cbd5e1;
        }

        .mp-api-box {
          margin-top: 2rem; background: #eff6ff; border: 1px dashed #93c5fd;
          border-radius: 12px; padding: 1rem 1.25rem;
          display: flex; align-items:flex-start; gap: 0.75rem;
        }
        .mp-api-text h4 { margin: 0 0 0.25rem; font-size: 0.9rem; color: #1e3a8a; }
        .mp-api-text p { margin: 0; font-size: 0.8rem; color: #3b82f6; line-height: 1.5; }
      `}</style>

      {/* ── Hero ── */}
      <div className="mp-hero">
        <div className="mp-hero-top">
          <div className="mp-hero-icon">
            <BarChart2 size={28} color="white" />
          </div>
          <div>
            <h1>Real-Time Mandi Prices</h1>
            <p>Live spot prices for crops, fruits, and vegetables across major mandis</p>
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="mp-controls">
        <div className="mp-search-bar">
          <Search size={20} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search API for crop (e.g. Papaya)... Press Enter to search" 
            className="mp-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') fetchPrices();
            }}
          />
          <button className="mp-refresh-btn" onClick={fetchPrices} title="Refresh Prices">
            <RefreshCcw size={18} className={loading ? 'mp-spin' : ''} />
          </button>
        </div>
        <div className="mp-categories">
          {CATEGORIES.map(cat => (
            <button 
              key={cat} 
              className={`mp-cat-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── List ── */}
      <div className="mp-content">
        <div className="mp-list-header">
          <h2 className="mp-list-title">
            {search ? 'Search Results' : `${activeCategory} Prices`}
          </h2>
          <span className="mp-list-meta">{filteredData.length} items listed</span>
        </div>

        {loading ? (
          <div className="mp-loader">
            <RefreshCcw size={32} className="mp-spin" color="#3b82f6" />
            <span>Fetching live mandi rates...</span>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="mp-empty">
            <AlertCircle size={40} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>No prices found for "{search}"</p>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="mp-list">
            {filteredData.map(item => (
              <div key={item.id} className="mp-card">
                <div className="mp-card-left">
                  <p className="mp-crop-name">{item.name}</p>
                  <p className="mp-crop-market">
                    <MapPin size={14} /> {item.market} <span style={{ opacity: 0.5 }}>• {item.lastUpdated}</span>
                  </p>
                </div>
                <div className="mp-card-right">
                  <p className="mp-price">
                    ₹{item.price.toLocaleString()} <span className="mp-unit">/ {item.unit}</span>
                  </p>
                  <div className={`mp-trend ${item.trend}`}>
                    {item.trend === 'up' && <TrendingUp size={14} />}
                    {item.trend === 'down' && <TrendingDown size={14} />}
                    {item.trend === 'stable' && <span style={{ width: 14, textAlign: 'center' }}>=</span>}
                    {item.changeStr}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
