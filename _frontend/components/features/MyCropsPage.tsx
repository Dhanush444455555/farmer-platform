import React, { useState, useEffect, useRef } from 'react';
import { Leaf, Trash2, Activity, Sprout, Search, X, CheckCircle2 } from 'lucide-react';

// ─── Crop Catalog ─────────────────────────────────────────────────────────────
interface CropInfo {
  name: string;
  emoji: string;
  season: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  facts: string[];
}

const CROP_CATALOG: CropInfo[] = [
  { name: 'Papaya',    emoji: '🍈', season: 'Year-round', duration: '9–11 months', difficulty: 'Easy',   facts: ['Grows fast in tropical climate', 'Rich in Vitamin C & A', 'Needs well-drained soil'] },
  { name: 'Pappaya',   emoji: '🍈', season: 'Year-round', duration: '9–11 months', difficulty: 'Easy',   facts: ['Same as Papaya', 'Rich in Vitamin C & A', 'Needs well-drained soil'] },
  { name: 'Tomato',    emoji: '🍅', season: 'Rabi / Kharif', duration: '60–80 days', difficulty: 'Medium', facts: ['High water demand', 'Best with drip irrigation', 'Prone to blight in humidity'] },
  { name: 'Wheat',     emoji: '🌾', season: 'Rabi (Oct–Mar)', duration: '100–130 days', difficulty: 'Medium', facts: ['Top staple grain of India', 'High nitrogen demand', 'Thrives in cool, dry weather'] },
  { name: 'Rice',      emoji: '🌾', season: 'Kharif (Jun–Oct)', duration: '110–145 days', difficulty: 'Hard',   facts: ['Requires flooding / paddy fields', 'Major water consumption', 'Watch for stem borers'] },
  { name: 'Corn',      emoji: '🌽', season: 'Kharif', duration: '80–100 days', difficulty: 'Easy',   facts: ['Fast growing crop', 'Side-dress nitrogen at knee-height', 'Watch for corn borers'] },
  { name: 'Potato',    emoji: '🥔', season: 'Rabi (Oct–Mar)', duration: '70–100 days', difficulty: 'Medium', facts: ['Plant in loose soil', 'Hill up as plant grows', 'Harvest after foliage dies'] },
  { name: 'Mango',     emoji: '🥭', season: 'Mar–Jun', duration: '3–5 years (fruit)', difficulty: 'Medium', facts: ['Long-term fruit tree', 'Needs dry period to fruit', 'Rich in Indian export trade'] },
  { name: 'Banana',    emoji: '🍌', season: 'Year-round', duration: '9–12 months', difficulty: 'Easy',   facts: ['Fast cropping cycle', 'High potassium demand', 'Remove old suckers regularly'] },
  { name: 'Cotton',    emoji: '🪴', season: 'Kharif (Apr–Sep)', duration: '150–200 days', difficulty: 'Hard',   facts: ['Major cash crop', 'Highly pest-prone (bollworm)', 'Needs hot dry climate'] },
  { name: 'Onion',     emoji: '🧅', season: 'Rabi / Kharif', duration: '100–120 days', difficulty: 'Medium', facts: ['Harvest when tops fall over', 'High export commodity', 'Sensitive to waterlogging'] },
  { name: 'Sugarcane', emoji: '🎋', season: 'Oct–Mar (planting)', duration: '12–18 months', difficulty: 'Hard',   facts: ['Highest water use crop', 'Long growing period', 'Processed for sugar & ethanol'] },
  { name: 'Groundnut', emoji: '🥜', season: 'Kharif (Jun–Sep)', duration: '90–130 days', difficulty: 'Easy',   facts: ['Nitrogen-fixing legume', 'Improves soil health', 'Harvest when pods show dark marks'] },
  { name: 'Soybean',   emoji: '🫘', season: 'Kharif', duration: '90–120 days', difficulty: 'Medium', facts: ['High protein oilseed', 'Moderate water need', 'Harvest when pods rattle'] },
];

interface Crop {
  _id: string;
  name: string;
  quantity: string;
  status: string;
  createdAt: string;
}

const LS_KEY = 'farm_my_crops';

function loadFromStorage(): Crop[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveToStorage(crops: Crop[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(crops));
}

export const MyCropsPage: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [maintenanceSchedule, setMaintenanceSchedule] = useState<{ [key: string]: string[] }>({});

  // ─── Search & Confirm flow ────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CropInfo[]>([]);
  const [pendingCrop, setPendingCrop] = useState<CropInfo | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (q.trim().length === 0) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    const matches = CROP_CATALOG.filter(c =>
      c.name.toLowerCase().includes(q.toLowerCase())
    );
    setSuggestions(matches);
    setShowDropdown(true);
  };

  const handleSelectSuggestion = (crop: CropInfo) => {
    setPendingCrop(crop);
    setSearchQuery('');
    setSuggestions([]);
    setShowDropdown(false);
  };

  const handleConfirmAdd = async () => {
    if (!pendingCrop) return;
    const newCrop: Crop = {
      _id: `local-${Date.now()}`,
      name: pendingCrop.name,
      quantity: '',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    const updated = [newCrop, ...crops];
    setCrops(updated);
    saveToStorage(updated);
    fetchMaintenancePlan(newCrop._id, newCrop.name);
    setPendingCrop(null);
    // Try backend sync
    try {
      const res = await fetch('http://localhost:5000/api/crops', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCrop.name }),
      });
      const saved = await res.json();
      setCrops(prev => {
        const next = prev.map(c => c._id === newCrop._id ? { ...saved } : c);
        saveToStorage(next);
        setMaintenanceSchedule(m => {
          const copy = { ...m, [saved._id]: m[newCrop._id] ?? [] };
          delete copy[newCrop._id];
          return copy;
        });
        return next;
      });
    } catch { /* offline */ }
  };

  // Load from localStorage on mount, then try backend
  useEffect(() => {
    const local = loadFromStorage();
    setCrops(local);
    setLoading(false);
    local.forEach((crop) => fetchMaintenancePlan(crop._id, crop.name));

    // Try to sync from backend if available
    fetch('http://localhost:5000/api/crops')
      .then(r => r.json())
      .then((data: Crop[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setCrops(data);
          saveToStorage(data);
          data.forEach((crop) => fetchMaintenancePlan(crop._id, crop.name));
        }
      })
      .catch(() => { /* backend not running — use local data */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMaintenancePlan = async (cropId: string, cropName: string) => {
    // Built-in maintenance rules (no backend needed)
    const rules: Record<string, string[]> = {
      tomato:   ['💧 Water daily at the base.', '✂️ Prune lower leaves to prevent blight.', '🌾 Apply nitrogen-rich fertilizer every 2 weeks.'],
      wheat:    ['💧 Water every 3–4 days.', '🔍 Monitor for rust and aphids.', '🌿 Apply Urea if yellowing occurs.'],
      corn:     ['💧 Heavy watering during silking.', '🌱 Side-dress with nitrogen when knee-high.', '🐛 Watch for corn borers.'],
      rice:     ['🌊 Maintain 2–5 cm flooding.', '🌾 Top dress 30 days after transplanting.', '🔍 Check for stem borers.'],
      potato:   ['💧 Water consistently to keep soil moist.', '🌱 Hill up soil around stems.', '🐞 Spray for potato beetles if seen.'],
      papaya:   ['☀️ Full sun and well-drained soil required.', '💧 Water 2–3 times per week.', '🍂 Remove old/infected leaves regularly.', '🌿 Apply balanced NPK monthly.'],
      pappaya:  ['☀️ Full sun and well-drained soil required.', '💧 Water 2–3 times per week.', '🍂 Remove old/infected leaves regularly.', '🌿 Apply balanced NPK monthly.'],
      mango:    ['💧 Water young trees frequently.', '🌼 Encourage flowering with potash in dry season.', '🐛 Spray neem oil for pest control.'],
      banana:   ['💧 Water every 2 days.', '🌿 Apply compost monthly.', '🍌 Remove suckers to keep 1–2 per plant.'],
      cotton:   ['💧 Water every 10–14 days.', '🌿 Apply NPK at bloom stage.', '🐛 Watch for bollworms.'],
    };

    const key = cropName.toLowerCase().trim();
    const match = Object.entries(rules).find(([k]) => key.includes(k));
    const tasks = match
      ? match[1]
      : ['💧 Water moderately based on soil moisture.', '🔍 Check closely for common pests.', '🌿 Apply balanced NPK fertilizer.'];

    // Try AI engine for richer recommendations
    try {
      const res = await fetch('http://localhost:8000/crop-maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crop_name: cropName }),
      });
      const data = await res.json();
      setMaintenanceSchedule(prev => ({ ...prev, [cropId]: data.daily_maintenance ?? tasks }));
    } catch {
      setMaintenanceSchedule(prev => ({ ...prev, [cropId]: tasks }));
    }
  };



  const handleRemoveCrop = async (id: string) => {
    const updated = crops.filter(c => c._id !== id);
    setCrops(updated);
    saveToStorage(updated);
    const newSchedule = { ...maintenanceSchedule };
    delete newSchedule[id];
    setMaintenanceSchedule(newSchedule);

    // Try backend delete
    try {
      await fetch(`http://localhost:5000/api/crops/${id}`, { method: 'DELETE' });
    } catch { /* offline — already removed from local */ }
  };


  // ─── Per-crop expanded state, sub-folders, checklist ─────────────────────
  const [expandedCrop, setExpandedCrop] = useState<string | null>(null);
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean[]>>({});
  const [openSubs, setOpenSubs] = useState<Record<string, Set<string>>>({});
  const [cropNotes, setCropNotes] = useState<Record<string, string>>({});
  const [cropExpenses, setCropExpenses] = useState<Record<string, {label:string;amount:string}[]>>({});
  const [newExpLabel, setNewExpLabel] = useState<Record<string, string>>({});
  const [newExpAmt, setNewExpAmt]     = useState<Record<string, string>>({});

  const toggleSub = (cropId: string, key: string) => {
    setOpenSubs(prev => {
      const s = new Set(prev[cropId] ?? []);
      s.has(key) ? s.delete(key) : s.add(key);
      return { ...prev, [cropId]: s };
    });
  };
  const isSubOpen = (cropId: string, key: string) => openSubs[cropId]?.has(key) ?? false;

  const addExpense = (cropId: string) => {
    const label = newExpLabel[cropId]?.trim();
    const amount = newExpAmt[cropId]?.trim();
    if (!label || !amount) return;
    setCropExpenses(prev => ({ ...prev, [cropId]: [...(prev[cropId] ?? []), { label, amount }] }));
    setNewExpLabel(prev => ({ ...prev, [cropId]: '' }));
    setNewExpAmt(prev => ({ ...prev, [cropId]: '' }));
  };

  const toggleTask = (cropId: string, idx: number, total: number) => {
    setCheckedTasks(prev => {
      const arr = prev[cropId] ?? Array(total).fill(false);
      const next = [...arr];
      next[idx] = !next[idx];
      return { ...prev, [cropId]: next };
    });
  };

  // Build a 7-day roadmap from the maintenance tasks
  const buildRoadmap = (tasks: string[], plantedAt: string) => {
    const daysAgo = Math.floor((Date.now() - new Date(plantedAt).getTime()) / 86400000);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date().getDay(); // 0=Sun
    return Array.from({ length: 7 }, (_, i) => {
      const dayLabel = days[(today - 1 + i) % 7] || days[i % 7];
      const isToday = i === 0;
      const task = tasks[i % tasks.length] ?? tasks[0];
      return { dayLabel, isToday, task, day: daysAgo + i };
    });
  };

  const getCropEmoji = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('papaya') || n.includes('pappaya')) return '🍈';
    if (n.includes('tomato')) return '🍅';
    if (n.includes('wheat')) return '🌾';
    if (n.includes('rice') || n.includes('paddy')) return '🌾';
    if (n.includes('corn') || n.includes('maize')) return '🌽';
    if (n.includes('potato')) return '🥔';
    if (n.includes('mango')) return '🥭';
    if (n.includes('banana')) return '🍌';
    if (n.includes('cotton')) return '🪴';
    if (n.includes('onion')) return '🧅';
    return '🌱';
  };

  return (
    <div className="mcp-root">
      <style>{`
        .mcp-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%);
          padding: 2rem;
          font-family: 'Inter', system-ui, sans-serif;
        }

        /* ── Hero ── */
        .mcp-hero {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 24px;
          padding: 2rem 2.5rem;
          color: white;
          margin-bottom: 2rem;
          box-shadow: 0 12px 40px rgba(16,185,129,0.25);
          display: flex; align-items: center; gap: 1.5rem;
        }
        .mcp-hero-icon {
          background: rgba(255,255,255,0.2);
          padding: 1.1rem; border-radius: 18px;
          backdrop-filter: blur(8px);
        }
        .mcp-hero h1 { font-size: 2rem; font-weight: 800; margin: 0; }
        .mcp-hero p  { margin: 0.4rem 0 0; opacity: 0.88; font-size: 0.95rem; }

        /* ── Add Form ── */
        .mcp-form {
          background: white; border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          display: flex; gap: 1rem; padding: 1.25rem 1.5rem;
          margin-bottom: 2rem;
        }
        .mcp-input {
          flex: 1; padding: 0.85rem 1.25rem;
          border: 2px solid #e2e8f0; border-radius: 12px;
          font-family: inherit; font-size: 1rem; color: #0f172a;
          transition: border-color 0.2s;
          outline: none;
        }
        .mcp-input:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }
        .mcp-add-btn {
          background: #10b981; color: white; border: none;
          padding: 0 1.75rem; border-radius: 12px;
          font-family: inherit; font-weight: 700; font-size: 0.95rem;
          cursor: pointer; display: flex; align-items: center; gap: 0.5rem;
          transition: all 0.2s; white-space: nowrap;
        }
        .mcp-add-btn:hover { background: #059669; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(16,185,129,0.3); }

        /* ── Master-Detail Layout ── */
        .mcp-split-layout {
          display: grid;
          grid-template-columns: minmax(320px, 35%) 1fr;
          gap: 1.5rem;
          align-items: start;
        }
        @media (max-width: 900px) {
          .mcp-split-layout { grid-template-columns: 1fr; }
        }
        .mcp-crops-list {
          display: flex; flex-direction: column; gap: 1rem;
        }
        .mcp-crop-details-panel {
          background: white; border-radius: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
          overflow: hidden;
          animation: mcp-fade-in 0.2s ease;
        }
        @keyframes mcp-fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .mcp-no-selection {
          background: #f8fafc; border-radius: 20px;
          border: 2px dashed #cbd5e1;
          padding: 4rem 2rem; text-align: center; color: #64748b;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }

        /* ── Crop Folder Card (Master List) ── */
        .mcp-folder {
          background: white; border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
          transition: all 0.2s; overflow: hidden;
          cursor: pointer;
        }
        .mcp-folder:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
        .mcp-folder.active {
          border: 2px solid #10b981;
          box-shadow: 0 8px 24px rgba(16,185,129,0.12);
        }
        .mcp-folder-header {
          padding: 1.1rem 1.25rem; display: flex; align-items: center; justify-content: space-between;
        }
        .mcp-folder-left { display: flex; align-items: center; gap: 1rem; }
        .mcp-crop-emoji {
          width: 48px; height: 48px; border-radius: 14px;
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.6rem; flex-shrink: 0;
        }
        .mcp-folder.active .mcp-crop-emoji { background: #ecfdf5; }
        .mcp-crop-title { font-size: 1.1rem; font-weight: 800; color: #0f172a; margin: 0; }
        .mcp-crop-meta  { font-size: 0.75rem; color: #64748b; margin: 2px 0 0; }
        .mcp-folder-right { display: flex; align-items: center; gap: 0.6rem; }
        .mcp-today-badge {
          background: #ecfdf5; color: #059669;
          font-size: 0.75rem; font-weight: 700;
          padding: 4px 10px; border-radius: 999px;
          border: 1px solid #a7f3d0;
        }
        .mcp-delete-btn {
          background: #fef2f2; color: #ef4444; border: none;
          padding: 0.45rem; border-radius: 8px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .mcp-delete-btn:hover { background: #fee2e2; }
        .mcp-chevron {
          color: #94a3b8; transition: transform 0.25s;
          display: flex; align-items: center;
        }
        .mcp-chevron.open { transform: rotate(180deg); }

        /* ── Today's Highlight Bar ── */
        .mcp-today-bar {
          margin: 0 1.5rem 0;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 14px;
          padding: 1rem 1.25rem;
          display: flex; align-items: flex-start; gap: 0.85rem;
          color: white;
        }
        .mcp-today-icon { font-size: 1.5rem; flex-shrink: 0; margin-top: 1px; }
        .mcp-today-label { font-size: 0.68rem; font-weight: 700; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.8px; margin: 0; }
        .mcp-today-task  { font-size: 1rem; font-weight: 700; margin: 3px 0 0; }

        /* ── Folder Body ── */
        .mcp-folder-body {
          padding: 1.25rem 1.5rem 1.5rem;
          display: flex; flex-direction: column; gap: 1.5rem;
        }

        /* ── Section titles ── */
        .mcp-section-title {
          font-size: 0.75rem; font-weight: 800; color: #94a3b8;
          text-transform: uppercase; letter-spacing: 0.8px;
          margin: 0 0 0.75rem;
        }

        /* ── Daily Checklist ── */
        .mcp-checklist { display: flex; flex-direction: column; gap: 0.5rem; }
        .mcp-check-item {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.65rem 1rem;
          background: #f8fafc; border-radius: 10px;
          border: 1px solid #e2e8f0;
          cursor: pointer; transition: all 0.15s;
          user-select: none;
        }
        .mcp-check-item:hover { background: #f0fdf4; border-color: #a7f3d0; }
        .mcp-check-item.done { background: #f0fdf4; border-color: #6ee7b7; opacity: 0.75; }
        .mcp-checkbox {
          width: 20px; height: 20px; border-radius: 6px;
          border: 2px solid #d1d5db; background: white;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.15s;
        }
        .mcp-check-item.done .mcp-checkbox {
          background: #10b981; border-color: #10b981;
        }
        .mcp-check-text { font-size: 0.9rem; color: #374151; flex: 1; }
        .mcp-check-item.done .mcp-check-text { text-decoration: line-through; color: #94a3b8; }
        .mcp-progress-bar-wrap { background: #e2e8f0; border-radius: 999px; height: 6px; overflow: hidden; margin-top: 0.5rem; }
        .mcp-progress-bar { height: 100%; border-radius: 999px; background: linear-gradient(90deg,#10b981,#059669); transition: width 0.4s ease; }

        /* ── 7-Day Roadmap ── */
        .mcp-roadmap { display: flex; gap: 0.5rem; overflow-x: auto; scrollbar-width: none; padding-bottom: 4px; }
        .mcp-roadmap::-webkit-scrollbar { display: none; }
        .mcp-day-card {
          flex-shrink: 0; width: 80px;
          border-radius: 14px; padding: 0.75rem 0.5rem;
          display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
          border: 1.5px solid #e2e8f0;
          background: white; transition: all 0.15s;
        }
        .mcp-day-card.today {
          background: linear-gradient(135deg, #10b981, #059669);
          border-color: #059669;
          box-shadow: 0 4px 16px rgba(16,185,129,0.3);
        }
        .mcp-day-label { font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
        .mcp-day-card.today .mcp-day-label { color: rgba(255,255,255,0.8); }
        .mcp-day-num { font-size: 0.75rem; font-weight: 600; color: #64748b; }
        .mcp-day-card.today .mcp-day-num { color: white; }
        .mcp-day-emoji { font-size: 1.3rem; }
        .mcp-day-task-mini { font-size: 0.6rem; color: #64748b; text-align: center; line-height: 1.3; max-width: 70px; }
        .mcp-day-card.today .mcp-day-task-mini { color: rgba(255,255,255,0.9); }

        /* ── Empty state ── */
        .mcp-empty { text-align: center; padding: 4rem 2rem; color: #94a3b8; }
        .mcp-empty-icon { font-size: 4rem; margin-bottom: 1rem; }
        .mcp-empty h3 { font-size: 1.1rem; color: #475569; margin: 0 0 0.5rem; }

        /* ── Search bar ── */
        .mcp-search-wrap {
          background: white; border-radius: 18px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.07);
          padding: 1.1rem 1.5rem;
          margin-bottom: 1.5rem;
          position: relative;
        }
        .mcp-search-inner {
          display: flex; align-items: center;
          border: 2px solid #e2e8f0; border-radius: 12px;
          padding: 0.7rem 1rem; gap: 0.75rem;
          transition: border-color 0.2s;
          background: #f8fafc;
        }
        .mcp-search-inner:focus-within {
          border-color: #10b981;
          background: white;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
        }
        .mcp-search-input {
          flex: 1; border: none; outline: none;
          font-family: inherit; font-size: 1rem; color: #0f172a;
          background: transparent;
        }
        .mcp-search-input::placeholder { color: #94a3b8; }
        .mcp-search-clear {
          background: none; border: none; cursor: pointer;
          color: #94a3b8; display: flex; padding: 2px;
          border-radius: 4px; transition: color 0.15s;
        }
        .mcp-search-clear:hover { color: #ef4444; }

        /* ── Suggestions Dropdown ── */
        .mcp-suggestions {
          position: absolute; left: 1.5rem; right: 1.5rem;
          top: calc(100% - 8px);
          background: white; border-radius: 14px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 12px 40px rgba(0,0,0,0.12);
          z-index: 100; overflow: hidden;
        }
        .mcp-suggestion-item {
          display: flex; align-items: center; gap: 0.85rem;
          padding: 0.85rem 1.25rem;
          cursor: pointer; transition: background 0.12s;
          border-bottom: 1px solid #f1f5f9;
        }
        .mcp-suggestion-item:last-child { border-bottom: none; }
        .mcp-suggestion-item:hover { background: #f0fdf4; }
        .mcp-sug-emoji { font-size: 1.5rem; }
        .mcp-sug-name { font-weight: 700; color: #0f172a; font-size: 0.95rem; }
        .mcp-sug-meta { font-size: 0.75rem; color: #64748b; margin-top: 1px; }
        .mcp-sug-badge {
          margin-left: auto;
          font-size: 0.7rem; font-weight: 700;
          padding: 2px 8px; border-radius: 999px;
        }
        .mcp-sug-badge.easy   { background: #dcfce7; color: #166534; }
        .mcp-sug-badge.medium { background: #fef3c7; color: #92400e; }
        .mcp-sug-badge.hard   { background: #fee2e2; color: #991b1b; }
        .mcp-no-results {
          padding: 1.25rem; text-align: center;
          color: #94a3b8; font-size: 0.875rem;
        }

        /* ── Confirm Card (inline, above folders) ── */
        .mcp-confirm-card {
          background: white;
          border: 2px solid #10b981;
          border-radius: 20px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 8px 32px rgba(16,185,129,0.15);
          animation: mcp-slide-in 0.25s ease;
        }
        @keyframes mcp-slide-in {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mcp-confirm-header {
          display: flex; align-items: center; gap: 1rem;
          margin-bottom: 1.1rem;
        }
        .mcp-confirm-emoji {
          width: 64px; height: 64px; border-radius: 18px;
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          display: flex; align-items: center; justify-content: center;
          font-size: 2.2rem; flex-shrink: 0;
        }
        .mcp-confirm-title { font-size: 1.4rem; font-weight: 800; color: #0f172a; margin: 0; }
        .mcp-confirm-season { font-size: 0.8rem; color: #64748b; margin: 4px 0 0; }
        .mcp-confirm-badges { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem; }
        .mcp-confirm-badge {
          font-size: 0.72rem; font-weight: 700;
          padding: 3px 10px; border-radius: 999px;
          border: 1px solid;
        }
        .mcp-confirm-facts {
          background: #f0fdf4; border-radius: 12px;
          padding: 0.85rem 1rem; margin: 1rem 0;
          display: flex; flex-direction: column; gap: 0.4rem;
        }
        .mcp-fact-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #374151; }
        .mcp-confirm-btns { display: flex; gap: 0.75rem; }
        .mcp-apply-btn {
          flex: 1; background: linear-gradient(135deg, #10b981, #059669);
          color: white; border: none; border-radius: 12px;
          padding: 0.85rem; font-family: inherit; font-size: 0.95rem;
          font-weight: 700; cursor: pointer; display: flex;
          align-items: center; justify-content: center; gap: 0.5rem;
          transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(16,185,129,0.3);
        }
        .mcp-apply-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(16,185,129,0.4); }
        .mcp-cancel-btn {
          background: #f1f5f9; color: #64748b; border: none;
          border-radius: 12px; padding: 0.85rem 1.5rem;
          font-family: inherit; font-size: 0.95rem; font-weight: 600;
          cursor: pointer; transition: background 0.15s;
        }
        .mcp-cancel-btn:hover { background: #e2e8f0; }

        /* ── Sub-folder accordion ── */
        .mcp-sub-folder {
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .mcp-sub-folder.active { border-color: #a7f3d0; }
        .mcp-sub-header {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.85rem 1rem;
          cursor: pointer; user-select: none;
          background: #f8fafc;
          transition: background 0.15s;
        }
        .mcp-sub-folder.active .mcp-sub-header { background: #f0fdf4; }
        .mcp-sub-header:hover { background: #ecfdf5; }
        .mcp-sub-icon {
          width: 32px; height: 32px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; font-size: 1rem;
        }
        .mcp-sub-label { font-weight: 700; font-size: 0.88rem; color: #0f172a; flex: 1; }
        .mcp-sub-meta  { font-size: 0.72rem; color: #94a3b8; margin-right: 0.5rem; }
        .mcp-sub-chevron { color: #94a3b8; transition: transform 0.22s; display: flex; }
        .mcp-sub-chevron.open { transform: rotate(180deg); }
        .mcp-sub-body { padding: 1rem; border-top: 1px solid #e2e8f0; }

        /* Notes textarea */
        .mcp-notes-area {
          width: 100%; box-sizing: border-box;
          border: 1.5px solid #e2e8f0; border-radius: 10px;
          padding: 0.75rem 1rem; font-family: inherit;
          font-size: 0.875rem; color: #374151; resize: vertical;
          min-height: 90px; outline: none; transition: border-color 0.2s;
          background: #f8fafc;
        }
        .mcp-notes-area:focus { border-color: #10b981; background: white; }

        /* Expense row */
        .mcp-exp-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.5rem 0.75rem; background: #f8fafc;
          border-radius: 8px; border: 1px solid #e2e8f0;
          font-size: 0.85rem; color: #374151; margin-bottom: 0.4rem;
        }
        .mcp-exp-amount { font-weight: 700; color: #059669; }
        .mcp-exp-form { display: flex; gap: 0.5rem; margin-top: 0.75rem; }
        .mcp-exp-input {
          flex: 1; padding: 0.55rem 0.75rem;
          border: 1.5px solid #e2e8f0; border-radius: 8px;
          font-family: inherit; font-size: 0.85rem; outline: none;
          transition: border-color 0.15s;
        }
        .mcp-exp-input:focus { border-color: #10b981; }
        .mcp-exp-input.amount { width: 90px; flex: none; }
        .mcp-exp-add {
          background: #10b981; color: white; border: none;
          border-radius: 8px; padding: 0 0.85rem;
          font-weight: 700; font-size: 0.82rem; cursor: pointer;
          transition: background 0.15s; white-space: nowrap;
        }
        .mcp-exp-add:hover { background: #059669; }
        .mcp-exp-total {
          text-align: right; font-size: 0.8rem; font-weight: 700;
          color: #059669; margin-top: 0.5rem;
        }
      `}</style>

      {/* Hero */}
      <div className="mcp-hero">
        <div className="mcp-hero-icon"><Leaf size={40} color="white" /></div>
        <div>
          <h1>My Active Crops</h1>
          <p>Manage your crops and view your AI daily maintenance schedule</p>
        </div>
      </div>

      {/* ── Search Bar with Suggestions ── */}
      <div className="mcp-search-wrap" ref={searchRef}>
        <div className="mcp-search-inner">
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            className="mcp-search-input"
            placeholder="Search crop (e.g. Papaya, Tomato, Wheat)…"
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            onFocus={() => searchQuery && setShowDropdown(true)}
          />
          {searchQuery && (
            <button className="mcp-search-clear" onClick={() => { setSearchQuery(''); setSuggestions([]); setShowDropdown(false); }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showDropdown && (
          <div className="mcp-suggestions">
            {suggestions.length === 0 ? (
              <div className="mcp-no-results">No crops found for "{searchQuery}"</div>
            ) : (
              suggestions.map(crop => (
                <div
                  key={crop.name}
                  className="mcp-suggestion-item"
                  onClick={() => handleSelectSuggestion(crop)}
                >
                  <span className="mcp-sug-emoji">{crop.emoji}</span>
                  <div>
                    <p className="mcp-sug-name">{crop.name}</p>
                    <p className="mcp-sug-meta">{crop.season} · {crop.duration}</p>
                  </div>
                  <span className={`mcp-sug-badge ${crop.difficulty.toLowerCase()}`}>
                    {crop.difficulty}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Confirmation Card ── */}
      {pendingCrop && (
        <div className="mcp-confirm-card">
          <div className="mcp-confirm-header">
            <div className="mcp-confirm-emoji">{pendingCrop.emoji}</div>
            <div>
              <p className="mcp-confirm-title">{pendingCrop.name}</p>
              <p className="mcp-confirm-season">🗓 {pendingCrop.season} &nbsp;·&nbsp; ⏱ {pendingCrop.duration}</p>
              <div className="mcp-confirm-badges">
                <span className={`mcp-confirm-badge mcp-sug-badge ${pendingCrop.difficulty.toLowerCase()}`}>
                  {pendingCrop.difficulty} to grow
                </span>
                <span className="mcp-confirm-badge" style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}>
                  🌱 Add to My Crops?
                </span>
              </div>
            </div>
          </div>

          {/* Facts */}
          <div className="mcp-confirm-facts">
            {pendingCrop.facts.map((f, i) => (
              <div key={i} className="mcp-fact-row">
                <CheckCircle2 size={14} color="#10b981" style={{ flexShrink: 0 }} />
                <span>{f}</span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="mcp-confirm-btns">
            <button className="mcp-apply-btn" onClick={handleConfirmAdd}>
              <CheckCircle2 size={18} /> Apply — Add to My Crops
            </button>
            <button className="mcp-cancel-btn" onClick={() => setPendingCrop(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Crop List & Details Split Layout */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#64748b' }}>Loading...</p>
      ) : crops.length === 0 ? (
        <div className="mcp-empty">
          <div className="mcp-empty-icon">🌱</div>
          <h3>No active crops yet</h3>
          <p>Add a crop above to see your daily AI maintenance roadmap!</p>
        </div>
      ) : (
        <div className="mcp-split-layout">
          
          {/* ── Left Column: Crops List ── */}
          <div className="mcp-crops-list">
            {crops.map(crop => {
              const tasks = maintenanceSchedule[crop._id] ?? [];
              const isActive = expandedCrop === crop._id;
              const checked = checkedTasks[crop._id] ?? Array(tasks.length).fill(false);
              const doneCount = checked.filter(Boolean).length;
              const emoji = getCropEmoji(crop.name);
              const daysSincePlanting = Math.floor((Date.now() - new Date(crop.createdAt).getTime()) / 86400000);

              return (
                <div 
                  key={crop._id} 
                  className={`mcp-folder ${isActive ? 'active' : ''}`}
                  onClick={() => setExpandedCrop(isActive ? null : crop._id)}
                >
                  <div className="mcp-folder-header">
                    <div className="mcp-folder-left">
                      <div className="mcp-crop-emoji">{emoji}</div>
                      <div>
                        <p className="mcp-crop-title">{crop.name.toUpperCase()}</p>
                        <p className="mcp-crop-meta">
                          🗓 Day {daysSincePlanting + 1} {'  •  '} Planted: {new Date(crop.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="mcp-folder-right">
                      {tasks.length > 0 && (
                        <span className="mcp-today-badge">
                          {tasks.length > 0 ? `${doneCount}/${tasks.length} ✓` : 'Loading...'}
                        </span>
                      )}
                      <button
                        className="mcp-delete-btn"
                        onClick={e => { e.stopPropagation(); handleRemoveCrop(crop._id); }}
                        title="Remove Crop"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Right Column: Selected Crop Details ── */}
          <div className="mcp-details-container">
            {!expandedCrop ? (
              <div className="mcp-no-selection">
                <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌱</span>
                <p style={{ margin: 0, fontWeight: '600' }}>Select a crop to view details</p>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem' }}>Check your daily tasks, roadmap, and manage crop expenses.</p>
              </div>
            ) : (
              (() => {
                const crop = crops.find(c => c._id === expandedCrop);
                if (!crop) return null;
                const tasks = maintenanceSchedule[crop._id] ?? [];
                const checked = checkedTasks[crop._id] ?? Array(tasks.length).fill(false);
                const doneCount = checked.filter(Boolean).length;
                const roadmap = buildRoadmap(tasks, crop.createdAt);
                const todayTask = tasks[0] ?? '🌱 Check your crop today';

                return (
                  <div className="mcp-crop-details-panel">
                    
                    {/* Header Banner */}
                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                       <div className="mcp-crop-emoji" style={{ width: '64px', height: '64px', fontSize: '2rem', background: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                         {getCropEmoji(crop.name)}
                       </div>
                       <div>
                         <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>{crop.name.toUpperCase()} Maintenance</h2>
                         <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>Day {Math.floor((Date.now() - new Date(crop.createdAt).getTime()) / 86400000) + 1} of Growth</p>
                       </div>
                    </div>

                    <div className="mcp-folder-body" style={{ padding: '1.5rem' }}>
                      {/* Today's Highlight bar */}
                      <div className="mcp-today-bar" style={{ margin: '0 0 1.5rem' }}>
                        <div className="mcp-today-icon">☀️</div>
                        <div>
                          <p className="mcp-today-label">Today's Priority Task</p>
                          <p className="mcp-today-task">{todayTask}</p>
                        </div>
                      </div>

                      {/* ─── 4 Sub-folders ─── */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

                        {/* SUB 1: Daily Checklist */}
                        <div className={`mcp-sub-folder ${isSubOpen(crop._id,'checklist') ? 'active' : ''}`}>
                          <div className="mcp-sub-header" onClick={() => toggleSub(crop._id,'checklist')}>
                            <div className="mcp-sub-icon" style={{ background: '#dcfce7' }}>✅</div>
                            <span className="mcp-sub-label">Daily Checklist</span>
                            <span className="mcp-sub-meta">{doneCount}/{tasks.length} done</span>
                            <div className={`mcp-sub-chevron ${isSubOpen(crop._id,'checklist') ? 'open' : ''}`}>
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                          </div>
                          {isSubOpen(crop._id,'checklist') && (
                            <div className="mcp-sub-body">
                              <div className="mcp-progress-bar-wrap" style={{ marginBottom: '0.75rem' }}>
                                <div className="mcp-progress-bar" style={{ width: `${tasks.length ? (doneCount/tasks.length)*100 : 0}%` }} />
                              </div>
                              {tasks.length === 0 ? (
                                <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center' }}>⏳ Loading maintenance plan...</p>
                              ) : (
                                <div className="mcp-checklist">
                                  {tasks.map((task, i) => (
                                    <div key={i} className={`mcp-check-item ${checked[i] ? 'done' : ''}`} onClick={() => toggleTask(crop._id, i, tasks.length)}>
                                      <div className="mcp-checkbox">
                                        {checked[i] && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                      </div>
                                      <span className="mcp-check-text">{task}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* SUB 2: 7-Day Roadmap */}
                        <div className={`mcp-sub-folder ${isSubOpen(crop._id,'roadmap') ? 'active' : ''}`}>
                          <div className="mcp-sub-header" onClick={() => toggleSub(crop._id,'roadmap')}>
                            <div className="mcp-sub-icon" style={{ background: '#dbeafe' }}>🗓️</div>
                            <span className="mcp-sub-label">7-Day Roadmap</span>
                            <span className="mcp-sub-meta">Day {Math.floor((Date.now()-new Date(crop.createdAt).getTime())/86400000)+1}</span>
                            <div className={`mcp-sub-chevron ${isSubOpen(crop._id,'roadmap') ? 'open' : ''}`}>
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                          </div>
                          {isSubOpen(crop._id,'roadmap') && (
                            <div className="mcp-sub-body">
                              <div className="mcp-roadmap">
                                {roadmap.map((d, i) => (
                                  <div key={i} className={`mcp-day-card ${d.isToday ? 'today' : ''}`}>
                                    <span className="mcp-day-label">{d.isToday ? 'TODAY' : d.dayLabel}</span>
                                    <span className="mcp-day-num">Day {d.day+1}</span>
                                    <span className="mcp-day-emoji">{d.task.match(/\p{Emoji}/u)?.[0] ?? '🌿'}</span>
                                    <span className="mcp-day-task-mini">{d.task.replace(/\p{Emoji}/gu,'').slice(0,30).trim()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* SUB 3: My Notes */}
                        <div className={`mcp-sub-folder ${isSubOpen(crop._id,'notes') ? 'active' : ''}`}>
                          <div className="mcp-sub-header" onClick={() => toggleSub(crop._id,'notes')}>
                            <div className="mcp-sub-icon" style={{ background: '#fef9c3' }}>📝</div>
                            <span className="mcp-sub-label">My Notes</span>
                            <span className="mcp-sub-meta">{cropNotes[crop._id]?.trim() ? 'Has notes' : 'Empty'}</span>
                            <div className={`mcp-sub-chevron ${isSubOpen(crop._id,'notes') ? 'open' : ''}`}>
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                          </div>
                          {isSubOpen(crop._id,'notes') && (
                            <div className="mcp-sub-body">
                              <textarea
                                className="mcp-notes-area"
                                placeholder="Write observations, issues, or reminders about this crop..."
                                value={cropNotes[crop._id] ?? ''}
                                onChange={e => setCropNotes(prev => ({ ...prev, [crop._id]: e.target.value }))}
                              />
                              <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.35rem', textAlign: 'right' }}>
                                {cropNotes[crop._id]?.length ?? 0} chars
                              </p>
                            </div>
                          )}
                        </div>

                        {/* SUB 4: Expense Log */}
                        {(() => {
                          const exps = cropExpenses[crop._id] ?? [];
                          const total = exps.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
                          return (
                            <div className={`mcp-sub-folder ${isSubOpen(crop._id,'expenses') ? 'active' : ''}`}>
                              <div className="mcp-sub-header" onClick={() => toggleSub(crop._id,'expenses')}>
                                <div className="mcp-sub-icon" style={{ background: '#fce7f3' }}>💰</div>
                                <span className="mcp-sub-label">Expense Log</span>
                                <span className="mcp-sub-meta">{exps.length > 0 ? `₹${total.toFixed(0)} total` : 'No entries'}</span>
                                <div className={`mcp-sub-chevron ${isSubOpen(crop._id,'expenses') ? 'open' : ''}`}>
                                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </div>
                              </div>
                              {isSubOpen(crop._id,'expenses') && (
                                <div className="mcp-sub-body">
                                  {exps.length === 0 && (
                                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem' }}>No expenses logged yet.</p>
                                  )}
                                  {exps.map((ex, i) => (
                                    <div key={i} className="mcp-exp-row">
                                      <span>{ex.label}</span>
                                      <span className="mcp-exp-amount">₹{ex.amount}</span>
                                    </div>
                                  ))}
                                  {exps.length > 0 && (
                                    <p className="mcp-exp-total">Total: ₹{total.toFixed(2)}</p>
                                  )}
                                  <div className="mcp-exp-form">
                                    <input
                                      className="mcp-exp-input"
                                      placeholder="Item (e.g. Fertilizer)"
                                      value={newExpLabel[crop._id] ?? ''}
                                      onChange={e => setNewExpLabel(prev => ({ ...prev, [crop._id]: e.target.value }))}
                                    />
                                    <input
                                      className="mcp-exp-input amount"
                                      placeholder="₹ Amount"
                                      type="number"
                                      value={newExpAmt[crop._id] ?? ''}
                                      onChange={e => setNewExpAmt(prev => ({ ...prev, [crop._id]: e.target.value }))}
                                    />
                                    <button className="mcp-exp-add" onClick={() => addExpense(crop._id)}>+ Add</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}
    </div>
  );
};



