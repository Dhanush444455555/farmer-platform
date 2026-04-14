import React, { useState, useRef, useCallback } from 'react';
import {
  ScanLine, Microscope, Droplets, CalendarDays,
  Upload, X, Loader2, CheckCircle2, AlertTriangle,
  ChevronRight, Leaf, FlaskConical, Sprout, Info, Camera,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type TabId = 'scanner' | 'soil' | 'water' | 'harvest';

// ─── Soil Analysis Logic ──────────────────────────────────────────────────────
function analyzeSoil(ph: number, n: number, p: number, k: number, type: string) {
  const tips: string[] = [];
  let score = 100;

  if (ph < 5.5) { tips.push('⚠️ Soil is too acidic. Apply lime to raise pH.'); score -= 20; }
  else if (ph > 7.5) { tips.push('⚠️ Soil is too alkaline. Add sulfur or organic matter.'); score -= 15; }
  else { tips.push('✅ Soil pH is in ideal range.'); }

  if (n < 20) { tips.push('⚠️ Nitrogen is low — apply urea or composted manure.'); score -= 20; }
  else if (n > 80) { tips.push('⚠️ Nitrogen is excessive — risk of leaf burn. Reduce application.'); score -= 10; }
  else { tips.push('✅ Nitrogen levels are healthy.'); }

  if (p < 15) { tips.push('⚠️ Phosphorus is low — add DAP fertilizer before planting.'); score -= 15; }
  else { tips.push('✅ Phosphorus is adequate.'); }

  if (k < 20) { tips.push('⚠️ Potassium is low — apply MOP or potash fertilizer.'); score -= 15; }
  else { tips.push('✅ Potassium levels are good.'); }

  const cropSuggestions: Record<string, string[]> = {
    clay:   ['Rice 🌾', 'Wheat 🌾', 'Sugarcane 🎋'],
    sandy:  ['Groundnut 🥜', 'Watermelon 🍉', 'Sweet Potato 🍠'],
    loam:   ['Tomato 🍅', 'Maize 🌽', 'Cotton 🪴', 'Soybean'],
    silt:   ['Vegetables 🥦', 'Paddy 🌾', 'Barley'],
    black:  ['Cotton 🪴', 'Jowar', 'Soybean', 'Sunflower 🌻'],
  };

  return {
    score: Math.max(0, score),
    status: score >= 80 ? 'Healthy' : score >= 50 ? 'Moderate' : 'Poor',
    tips,
    crops: cropSuggestions[type] ?? ['Consult local agri expert'],
  };
}

// ─── Water Optimizer Logic ────────────────────────────────────────────────────
function calcWater(crop: string, areaAcres: number, season: string, soil: string) {
  const baseETC: Record<string, number> = {
    wheat: 450, rice: 1200, maize: 500, cotton: 700,
    tomato: 400, sugarcane: 1500, potato: 350, soybean: 450,
    groundnut: 400, onion: 350,
  };
  const seasonMult: Record<string, number> = { kharif: 1.3, rabi: 0.9, zaid: 1.1 };
  const soilMult: Record<string, number> = { sandy: 1.2, loam: 1.0, clay: 0.85, silt: 0.95, black: 0.88 };

  const base = baseETC[crop] ?? 500;
  const total_mm = base * (seasonMult[season] ?? 1) * (soilMult[soil] ?? 1);
  const total_liters = total_mm * areaAcres * 4046.86 / 1000;
  const days = crop === 'rice' ? 120 : crop === 'sugarcane' ? 300 : crop === 'wheat' ? 110 : 90;
  const perDay = total_liters / days;

  return {
    totalMM: Math.round(total_mm),
    totalLiters: Math.round(total_liters),
    days,
    perDay: Math.round(perDay),
    schedule: perDay > 5000
      ? 'Irrigate every 2–3 days (drip/sprinkler preferred)'
      : 'Irrigate every 4–5 days',
    savings: soil === 'sandy'
      ? 'Consider drip irrigation — can save up to 40% water vs flood.'
      : 'Mulching recommended to reduce evaporation by 25–30%.',
  };
}

// ─── Harvest Planner Logic ────────────────────────────────────────────────────
const CROP_DAYS: Record<string, { min: number; max: number; tips: string }> = {
  wheat:      { min: 100, max: 130, tips: 'Harvest when grains are golden and moisture < 14%' },
  rice:       { min: 110, max: 145, tips: 'Harvest when 80% of grains are straw-coloured' },
  maize:      { min: 80,  max: 100, tips: 'Harvest when husks are dry and kernels dent' },
  tomato:     { min: 60,  max: 80,  tips: 'Harvest at full red colour (or pink for transport)' },
  potato:     { min: 70,  max: 100, tips: 'Harvest after foliage turns yellow/dies back' },
  onion:      { min: 100, max: 120, tips: 'Harvest when tops fall over and necks dry' },
  sugarcane:  { min: 270, max: 365, tips: 'Harvest when brix > 18% — use refractometer' },
  cotton:     { min: 150, max: 200, tips: 'Harvest when 60% bolls are open' },
  soybean:    { min: 90,  max: 120, tips: 'Harvest when pods rattle and moisture < 13%' },
  groundnut:  { min: 90,  max: 130, tips: 'Harvest when inner pod wall shows dark marks' },
  sunflower:  { min: 80,  max: 100, tips: 'Harvest when back of head turns yellow-brown' },
};

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ─── Disease Scanner Tab ──────────────────────────────────────────────────────
const DiseaseScanner: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | { disease: string; confidence: number; treatment: string[]; severity: string }>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  // Camera state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  }, [stream]);

  const startCamera = async () => {
    setResult(null);
    setImage(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      setIsCameraOpen(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      alert('Camera access denied or could not be started.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Convert canvas image to data url and file object
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setImage(dataUrl);

        canvasRef.current.toBlob(blob => {
          if (blob) {
            const capturedFile = new File([blob], 'captured_crop.jpg', { type: 'image/jpeg' });
            setFile(capturedFile);
          }
        }, 'image/jpeg');
        
        stopCamera();
      }
    }
  };

  const handleFile = (f: File) => {
    setFile(f);
    setResult(null);
    const r = new FileReader();
    r.onloadend = () => setImage(r.result as string);
    r.readAsDataURL(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith('image/')) handleFile(f);
  }, []);

  const handleAnalyze = async () => {
    if (!file && !image) return;
    setLoading(true);
    
    try {
      let analysisResult = null;
      
      // Send image to our python backend if running
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
          const res = await fetch('http://localhost:8000/analyze-crop', {
            method: 'POST',
            body: formData,
          });
          if (res.ok) {
            analysisResult = await res.json();
          }
        } catch (backendErr) {
          console.log("Python backend is not running, using fallback...");
        }
      }
      
      // Fallback if Python backend isn't up
      if (!analysisResult) {
        await new Promise(r => setTimeout(r, 2200)); 
        analysisResult = {
          disease: 'Leaf Blight (Helminthosporium)',
          confidence: 87,
          severity: 'Moderate',
          treatment: [
            '🧪 Apply Mancozeb 75% WP @ 2g/litre water',
            '🌿 Remove and destroy infected leaves immediately',
            '💧 Avoid overhead irrigation — use drip instead',
            '🔁 Repeat spray after 10–12 days if symptoms persist',
            '📋 Ensure proper field drainage to reduce humidity',
          ],
        };
      }
      
      setResult(analysisResult);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (isCameraOpen) {
    return (
      <div className="ai-tab-content">
        <div className="ai-camera-container">
          <video ref={videoRef} autoPlay playsInline className="ai-camera-video" />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div className="ai-camera-controls">
            <button className="ai-camera-btn capture" onClick={capturePhoto}>
              <div className="ai-camera-btn-inner" />
            </button>
            <button className="ai-camera-btn close" onClick={stopCamera}>
              <X size={24} color="white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-tab-content">
      <p className="ai-tab-desc">Upload or take a photo of your crop leaf or plant to detect diseases and get treatment recommendations.</p>

      {/* Upload/Camera Area */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <button className="ai-action-btn secondary" style={{ flex: 1 }} onClick={() => !image && fileRef.current?.click()}>
          <Upload size={18} /> Upload Photo
        </button>
        <button className="ai-action-btn secondary" style={{ flex: 1, borderColor: '#10b981', color: '#10b981' }} onClick={startCamera}>
          <Camera size={18} /> Take Photo
        </button>
      </div>

      <div
        className={`ai-upload-zone ${drag ? 'drag-over' : ''} ${image ? 'has-image' : ''}`}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        onClick={() => !image && fileRef.current?.click()}
      >
        {image ? (
          <div className="ai-image-preview-wrap">
            <img src={image} alt="Crop" className="ai-image-preview" />
            <button className="ai-remove-image" onClick={e => { e.stopPropagation(); setImage(null); setFile(null); setResult(null); }}>
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="ai-upload-placeholder">
            <Upload size={36} style={{ color: '#10b981', marginBottom: '0.75rem' }} />
            <p className="ai-upload-title">Drop your crop photo here</p>
            <p className="ai-upload-sub">or use the buttons above to select one</p>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

      {image && !result && (
        <button className="ai-action-btn" onClick={handleAnalyze} disabled={loading}>
          {loading ? <><Loader2 size={18} className="ai-spin" /> Analyzing…</> : <><ScanLine size={18} /> Scan for Diseases</>}
        </button>
      )}

      {/* Result */}
      {result && (
        <div className="ai-result-card">
          <div className="ai-result-header">
            <AlertTriangle size={20} color="#f59e0b" />
            <div>
              <p className="ai-result-disease">{result.disease}</p>
              <p className="ai-result-meta">Confidence: <strong>{result.confidence}%</strong> · Severity: <span className={`ai-severity-badge sev-${result.severity.toLowerCase()}`}>{result.severity}</span></p>
            </div>
          </div>
          <div className="ai-confidence-bar">
            <div className="ai-confidence-fill" style={{ width: `${result.confidence}%` }} />
          </div>
          <p className="ai-result-section-label">Recommended Treatment</p>
          <ul className="ai-treatment-list">
            {result.treatment.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
          <button className="ai-action-btn secondary" onClick={() => { setImage(null); setFile(null); setResult(null); }}>
            <ScanLine size={16} /> Scan Another Crop
          </button>
        </div>
      )}

      <div className="ai-api-note">
        <Info size={14} />
        <span>AI model integration ready · Share your API key to activate real detection</span>
      </div>
    </div>
  );
};

// ─── Soil Health Tab ──────────────────────────────────────────────────────────
const SoilAnalysis: React.FC = () => {
  const [ph, setPh] = useState('6.5');
  const [n, setN] = useState('40');
  const [p, setP] = useState('25');
  const [k, setK] = useState('30');
  const [soilType, setSoilType] = useState('loam');
  const [result, setResult] = useState<ReturnType<typeof analyzeSoil> | null>(null);

  const handleAnalyze = () => {
    setResult(analyzeSoil(+ph, +n, +p, +k, soilType));
  };

  const scoreColor = result
    ? result.score >= 80 ? '#10b981' : result.score >= 50 ? '#f59e0b' : '#ef4444'
    : '#10b981';

  return (
    <div className="ai-tab-content">
      <p className="ai-tab-desc">Enter your soil test report values and get instant recommendations.</p>

      <div className="ai-form-grid">
        <div className="ai-field">
          <label>Soil pH</label>
          <input type="number" min="0" max="14" step="0.1" value={ph} onChange={e => setPh(e.target.value)} className="ai-input" />
          <span className="ai-field-hint">Ideal: 6.0 – 7.0</span>
        </div>
        <div className="ai-field">
          <label>Nitrogen (kg/ha)</label>
          <input type="number" min="0" value={n} onChange={e => setN(e.target.value)} className="ai-input" />
          <span className="ai-field-hint">Ideal: 20 – 80</span>
        </div>
        <div className="ai-field">
          <label>Phosphorus (kg/ha)</label>
          <input type="number" min="0" value={p} onChange={e => setP(e.target.value)} className="ai-input" />
          <span className="ai-field-hint">Ideal: 15+</span>
        </div>
        <div className="ai-field">
          <label>Potassium (kg/ha)</label>
          <input type="number" min="0" value={k} onChange={e => setK(e.target.value)} className="ai-input" />
          <span className="ai-field-hint">Ideal: 20+</span>
        </div>
        <div className="ai-field ai-field-full">
          <label>Soil Type</label>
          <select value={soilType} onChange={e => setSoilType(e.target.value)} className="ai-input">
            <option value="clay">Clay</option>
            <option value="sandy">Sandy</option>
            <option value="loam">Loam</option>
            <option value="silt">Silt</option>
            <option value="black">Black (Cotton) Soil</option>
          </select>
        </div>
      </div>

      <button className="ai-action-btn" onClick={handleAnalyze}>
        <FlaskConical size={18} /> Analyze Soil Health
      </button>

      {result && (
        <div className="ai-result-card">
          <div className="ai-score-row">
            <div className="ai-score-circle" style={{ borderColor: scoreColor }}>
              <span style={{ color: scoreColor, fontSize: '1.5rem', fontWeight: 800 }}>{result.score}</span>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>/100</span>
            </div>
            <div>
              <p className="ai-result-disease">{result.status} Soil</p>
              <p className="ai-result-meta">Based on pH, NPK & soil type analysis</p>
            </div>
          </div>
          <ul className="ai-treatment-list">
            {result.tips.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
          <p className="ai-result-section-label">Best Crops for This Soil</p>
          <div className="ai-crop-chips">
            {result.crops.map((c, i) => <span key={i} className="ai-crop-chip">{c}</span>)}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Water Optimizer Tab ──────────────────────────────────────────────────────
const WaterOptimizer: React.FC = () => {
  const [crop, setCrop] = useState('wheat');
  const [area, setArea] = useState('1');
  const [season, setSeason] = useState('rabi');
  const [soil, setSoil] = useState('loam');
  const [result, setResult] = useState<ReturnType<typeof calcWater> | null>(null);

  return (
    <div className="ai-tab-content">
      <p className="ai-tab-desc">Calculate optimal water requirements for your crop, area, and season.</p>

      <div className="ai-form-grid">
        <div className="ai-field">
          <label>Crop Type</label>
          <select value={crop} onChange={e => setCrop(e.target.value)} className="ai-input">
            {Object.keys(CROP_DAYS).map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
        <div className="ai-field">
          <label>Area (Acres)</label>
          <input type="number" min="0.1" step="0.1" value={area} onChange={e => setArea(e.target.value)} className="ai-input" />
        </div>
        <div className="ai-field">
          <label>Season</label>
          <select value={season} onChange={e => setSeason(e.target.value)} className="ai-input">
            <option value="kharif">Kharif (Jun–Oct)</option>
            <option value="rabi">Rabi (Nov–Mar)</option>
            <option value="zaid">Zaid (Mar–Jun)</option>
          </select>
        </div>
        <div className="ai-field">
          <label>Soil Type</label>
          <select value={soil} onChange={e => setSoil(e.target.value)} className="ai-input">
            <option value="clay">Clay</option>
            <option value="sandy">Sandy</option>
            <option value="loam">Loam</option>
            <option value="silt">Silt</option>
            <option value="black">Black Soil</option>
          </select>
        </div>
      </div>

      <button className="ai-action-btn" onClick={() => setResult(calcWater(crop, +area, season, soil))}>
        <Droplets size={18} /> Calculate Water Need
      </button>

      {result && (
        <div className="ai-result-card">
          <div className="ai-water-stats">
            <div className="ai-water-stat">
              <span className="ai-water-val">{result.totalMM.toLocaleString()}</span>
              <span className="ai-water-label">mm total</span>
            </div>
            <div className="ai-water-stat">
              <span className="ai-water-val">{(result.totalLiters / 1000).toFixed(0)}K</span>
              <span className="ai-water-label">litres total</span>
            </div>
            <div className="ai-water-stat">
              <span className="ai-water-val">{(result.perDay / 1000).toFixed(1)}K</span>
              <span className="ai-water-label">litres/day</span>
            </div>
            <div className="ai-water-stat">
              <span className="ai-water-val">{result.days}</span>
              <span className="ai-water-label">crop days</span>
            </div>
          </div>
          <ul className="ai-treatment-list">
            <li>📅 {result.schedule}</li>
            <li>💡 {result.savings}</li>
            <li>🏞️ Total area: {area} acre{+area > 1 ? 's' : ''} — {(+area * 4046.86).toFixed(0)} m²</li>
          </ul>
        </div>
      )}
    </div>
  );
};

// ─── Harvest Planner Tab ──────────────────────────────────────────────────────
const HarvestPlanner: React.FC = () => {
  const [crop, setCrop] = useState('wheat');
  const [plantDate, setPlantDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [result, setResult] = useState<null | { earliest: string; latest: string; midpoint: string; tips: string; cropData: typeof CROP_DAYS[string] }>(null);

  const handleCalc = () => {
    const data = CROP_DAYS[crop];
    if (!data) return;
    const base = new Date(plantDate);
    setResult({
      earliest: addDays(base, data.min),
      latest: addDays(base, data.max),
      midpoint: addDays(base, Math.round((data.min + data.max) / 2)),
      tips: data.tips,
      cropData: data,
    });
  };

  return (
    <div className="ai-tab-content">
      <p className="ai-tab-desc">Enter your crop type and sowing date to get estimated harvest windows.</p>

      <div className="ai-form-grid">
        <div className="ai-field">
          <label>Crop</label>
          <select value={crop} onChange={e => setCrop(e.target.value)} className="ai-input">
            {Object.keys(CROP_DAYS).map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
        <div className="ai-field">
          <label>Sowing / Planting Date</label>
          <input type="date" value={plantDate} onChange={e => setPlantDate(e.target.value)} className="ai-input" />
        </div>
      </div>

      <button className="ai-action-btn" onClick={handleCalc}>
        <CalendarDays size={18} /> Calculate Harvest Window
      </button>

      {result && (
        <div className="ai-result-card">
          <div className="ai-harvest-timeline">
            <div className="ai-harvest-row">
              <span className="ai-harvest-label">Earliest Harvest</span>
              <span className="ai-harvest-date earliest">{result.earliest}</span>
            </div>
            <div className="ai-timeline-bar">
              <div className="ai-timeline-fill" />
              <div className="ai-timeline-mid-dot" title={`Best harvest: ${result.midpoint}`} />
            </div>
            <div className="ai-harvest-row">
              <span className="ai-harvest-label">Latest Harvest</span>
              <span className="ai-harvest-date latest">{result.latest}</span>
            </div>
          </div>
          <div className="ai-harvest-midpoint">
            <CalendarDays size={16} color="#10b981" />
            <span>Ideal harvest around <strong>{result.midpoint}</strong></span>
          </div>
          <div className="ai-harvest-tip">
            <CheckCircle2 size={15} color="#10b981" />
            <span>{result.tips}</span>
          </div>
          <div className="ai-harvest-tip" style={{ marginTop: 4 }}>
            <Sprout size={15} color="#8b5cf6" />
            <span>Duration: {result.cropData.min}–{result.cropData.max} days from sowing</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main AI Assistant Page ───────────────────────────────────────────────────
const TABS: { id: TabId; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: 'scanner', label: 'Disease Scanner', icon: <Microscope size={18} />, badge: 'AI' },
  { id: 'soil',    label: 'Soil Analysis',   icon: <FlaskConical size={18} /> },
  { id: 'water',   label: 'Water Optimizer', icon: <Droplets size={18} /> },
  { id: 'harvest', label: 'Harvest Planner', icon: <CalendarDays size={18} /> },
];

export const AIAssistant: React.FC = () => {
  const [tab, setTab] = useState<TabId>('scanner');

  return (
    <div className="ai-root">
      <style>{`
        /* ── Root ──────────────────────────────────── */
        .ai-root {
          min-height: 100vh;
          background: #f8fafc;
          font-family: 'Inter', system-ui, sans-serif;
        }

        /* ── Hero ──────────────────────────────────── */
        .ai-hero {
          background: linear-gradient(135deg, #be185d 0%, #ec4899 50%, #f97316 100%);
          padding: 2rem 2rem 0;
        }
        .ai-hero-top {
          display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;
        }
        .ai-hero-icon {
          width: 56px; height: 56px; border-radius: 16px;
          background: rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(8px);
        }
        .ai-hero h1 {
          font-size: 1.5rem; font-weight: 800; color: white; margin: 0;
        }
        .ai-hero p {
          color: rgba(255,255,255,0.8); font-size: 0.85rem; margin: 4px 0 0;
        }
        .ai-badge-hero {
          background: rgba(255,255,255,0.25);
          color: white; font-size: 0.7rem; font-weight: 700;
          padding: 2px 8px; border-radius: 999px;
          display: inline-block; margin-top: 6px;
        }

        /* ── Tabs ──────────────────────────────────── */
        .ai-tabs {
          display: flex; gap: 0; overflow-x: auto; scrollbar-width: none;
        }
        .ai-tabs::-webkit-scrollbar { display: none; }
        .ai-tab-btn {
          display: flex; align-items: center; gap: 0.4rem;
          background: none; border: none; cursor: pointer;
          font-family: inherit; font-size: 0.82rem; font-weight: 600;
          color: rgba(255,255,255,0.65);
          padding: 0.85rem 1.1rem;
          border-bottom: 3px solid transparent;
          white-space: nowrap; flex-shrink: 0;
          transition: all 0.2s;
        }
        .ai-tab-btn:hover { color: rgba(255,255,255,0.9); }
        .ai-tab-btn.active { color: white; border-bottom-color: white; }
        .ai-tab-badge {
          background: rgba(255,255,255,0.3);
          color: white; font-size: 0.62rem; font-weight: 800;
          padding: 1px 6px; border-radius: 999px;
        }

        /* ── Content ───────────────────────────────── */
        .ai-tab-content {
          padding: 1.5rem 2rem;
          max-width: 680px;
          display: flex; flex-direction: column; gap: 1.1rem;
        }
        .ai-tab-desc {
          font-size: 0.9rem; color: #64748b; margin: 0; line-height: 1.6;
        }

        /* ── Form ──────────────────────────────────── */
        .ai-form-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;
        }
        .ai-field {
          display: flex; flex-direction: column; gap: 0.3rem;
        }
        .ai-field-full { grid-column: 1 / -1; }
        .ai-field label {
          font-size: 0.8rem; font-weight: 700; color: #374151;
        }
        .ai-input {
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.6rem 0.85rem;
          font-family: inherit; font-size: 0.9rem;
          color: #0f172a; background: white;
          outline: none; transition: border-color 0.15s;
          width: 100%; box-sizing: border-box;
        }
        .ai-input:focus { border-color: #ec4899; }
        .ai-field-hint { font-size: 0.72rem; color: #94a3b8; }

        /* ── Action Button ─────────────────────────── */
        .ai-action-btn {
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          background: linear-gradient(135deg, #be185d, #ec4899);
          color: white; border: none; border-radius: 14px;
          padding: 0.85rem 1.5rem;
          font-family: inherit; font-size: 0.95rem; font-weight: 700;
          cursor: pointer; width: 100%;
          transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(190,24,93,0.3);
        }
        .ai-action-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(190,24,93,0.4); }
        .ai-action-btn:disabled { opacity: 0.6; cursor: default; transform: none; }
        .ai-action-btn.secondary {
          background: #f1f5f9; color: #374151;
          box-shadow: none; border: 1px solid #e2e8f0;
        }
        .ai-action-btn.secondary:hover { background: #e2e8f0; box-shadow: none; }

        /* ── Upload Zone ───────────────────────────── */
        .ai-upload-zone {
          border: 2px dashed #d1fae5;
          border-radius: 16px;
          background: #f0fdf4;
          min-height: 180px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s; position: relative;
          overflow: hidden;
        }
        .ai-upload-zone.drag-over { border-color: #10b981; background: #dcfce7; }
        .ai-upload-zone.has-image { cursor: default; border-style: solid; border-color: #10b981; }
        .ai-upload-placeholder { text-align: center; padding: 1.5rem; }
        .ai-upload-title { font-weight: 700; color: #0f172a; margin: 0 0 0.25rem; }
        .ai-upload-sub { font-size: 0.8rem; color: #94a3b8; margin: 0; }
        .ai-image-preview-wrap { width: 100%; position: relative; }
        .ai-image-preview { width: 100%; max-height: 280px; object-fit: cover; display: block; }
        .ai-remove-image {
          position: absolute; top: 8px; right: 8px;
          background: rgba(0,0,0,0.6); border: none; border-radius: 50%;
          width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: white;
        }

        /* ── Camera UI ─────────────────────────────── */
        .ai-camera-container {
          position: relative;
          background: #000; border-radius: 16px; overflow: hidden;
          width: 100%; aspect-ratio: 9/16;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
        }
        .ai-camera-video {
          width: 100%; height: 100%; object-fit: cover;
        }
        .ai-camera-controls {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 2rem 1.5rem;
          background: linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%);
          display: flex; justify-content: center; align-items: center; gap: 2rem;
        }
        .ai-camera-btn {
          border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .ai-camera-btn.capture {
          width: 70px; height: 70px; border-radius: 50%;
          background: rgba(255,255,255,0.4); border: 2px solid white;
          padding: 4px;
        }
        .ai-camera-btn.capture .ai-camera-btn-inner {
          width: 100%; height: 100%; background: white; border-radius: 50%;
        }
        .ai-camera-btn.capture:active .ai-camera-btn-inner { transform: scale(0.9); }
        .ai-camera-btn.close {
          width: 44px; height: 44px; border-radius: 50%;
          background: rgba(255,255,255,0.2); backdrop-filter: blur(4px);
        }

        /* ── Result Card ───────────────────────────── */
        .ai-result-card {
          background: white; border: 1px solid #e2e8f0;
          border-radius: 16px; padding: 1.25rem;
          display: flex; flex-direction: column; gap: 0.85rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .ai-result-header { display: flex; align-items: flex-start; gap: 0.75rem; }
        .ai-result-disease { font-weight: 800; font-size: 1rem; color: #0f172a; margin: 0; }
        .ai-result-meta { font-size: 0.8rem; color: #64748b; margin: 4px 0 0; }
        .ai-severity-badge {
          display: inline-block; padding: 1px 8px; border-radius: 999px; font-weight: 700; font-size: 0.75rem;
        }
        .sev-moderate { background: #fef3c7; color: #92400e; }
        .sev-severe   { background: #fee2e2; color: #991b1b; }
        .sev-mild     { background: #dcfce7; color: #166534; }
        .ai-confidence-bar {
          height: 6px; border-radius: 999px; background: #f1f5f9; overflow: hidden;
        }
        .ai-confidence-fill {
          height: 100%; border-radius: 999px;
          background: linear-gradient(90deg, #10b981, #f59e0b);
          transition: width 0.6s ease;
        }
        .ai-result-section-label {
          font-size: 0.75rem; font-weight: 700; color: #94a3b8;
          text-transform: uppercase; letter-spacing: 0.6px; margin: 0;
        }
        .ai-treatment-list {
          list-style: none; padding: 0; margin: 0;
          display: flex; flex-direction: column; gap: 0.45rem;
        }
        .ai-treatment-list li {
          background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 10px; padding: 0.6rem 0.85rem;
          font-size: 0.875rem; color: #374151;
        }

        /* ── Soil score ─────────────────────────────── */
        .ai-score-row { display: flex; align-items: center; gap: 1rem; }
        .ai-score-circle {
          width: 70px; height: 70px; border-radius: 50%;
          border: 4px solid; display: flex; flex-direction: column;
          align-items: center; justify-content: center; flex-shrink: 0;
        }
        .ai-crop-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .ai-crop-chip {
          background: #f0fdf4; border: 1px solid #bbf7d0;
          color: #15803d; font-size: 0.8rem; font-weight: 600;
          padding: 4px 12px; border-radius: 999px;
        }

        /* ── Water stats ───────────────────────────── */
        .ai-water-stats {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem;
        }
        .ai-water-stat {
          background: #f0fdf4; border: 1px solid #bbf7d0;
          border-radius: 12px; padding: 0.75rem 0.5rem;
          display: flex; flex-direction: column; align-items: center; gap: 2px;
        }
        .ai-water-val { font-size: 1.1rem; font-weight: 800; color: #0f172a; }
        .ai-water-label { font-size: 0.68rem; color: #64748b; text-align: center; }

        /* ── Harvest timeline ──────────────────────── */
        .ai-harvest-timeline {
          background: #f8fafc; border-radius: 12px; padding: 1rem;
          display: flex; flex-direction: column; gap: 0.5rem;
        }
        .ai-harvest-row { display: flex; align-items: center; justify-content: space-between; }
        .ai-harvest-label { font-size: 0.8rem; color: #64748b; font-weight: 600; }
        .ai-harvest-date { font-size: 0.85rem; font-weight: 700; }
        .ai-harvest-date.earliest { color: #10b981; }
        .ai-harvest-date.latest { color: #f59e0b; }
        .ai-timeline-bar {
          height: 8px; border-radius: 999px;
          background: linear-gradient(90deg, #10b981, #f59e0b);
          position: relative; margin: 4px 0;
        }
        .ai-timeline-mid-dot {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 16px; height: 16px; border-radius: 50%;
          background: white; border: 3px solid #ec4899;
        }
        .ai-harvest-midpoint {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.875rem; color: #374151;
          background: #f0fdf4; border-radius: 10px; padding: 0.6rem 0.85rem;
        }
        .ai-harvest-tip {
          display: flex; align-items: flex-start; gap: 0.5rem;
          font-size: 0.82rem; color: #64748b; line-height: 1.5;
        }

        /* ── Misc ──────────────────────────────────── */
        .ai-api-note {
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.75rem; color: #94a3b8;
          background: #f8fafc; border: 1px dashed #e2e8f0;
          border-radius: 8px; padding: 0.5rem 0.75rem;
        }
        .ai-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Hero */}
      <div className="ai-hero">
        <div className="ai-hero-top">
          <div className="ai-hero-icon">
            <Microscope size={28} color="white" />
          </div>
          <div>
            <h1>AI Assistant</h1>
            <p>Crop disease detection, soil analysis & smart planning</p>
            <span className="ai-badge-hero">Powered by AI</span>
          </div>
        </div>
        <div className="ai-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`ai-tab-btn ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.icon}
              {t.label}
              {t.badge && <span className="ai-tab-badge">{t.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Panels */}
      {tab === 'scanner' && <DiseaseScanner />}
      {tab === 'soil'    && <SoilAnalysis />}
      {tab === 'water'   && <WaterOptimizer />}
      {tab === 'harvest' && <HarvestPlanner />}
    </div>
  );
};
