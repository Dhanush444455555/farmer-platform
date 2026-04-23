import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, BellOff, Trash2, CheckCheck, TrendingUp, CloudRain,
  Package, Users, AlertTriangle, RefreshCcw, X, Check, ShieldAlert
} from 'lucide-react';

/* ─────────────────────────── Types ─────────────────────────── */
type NotifType = 'price' | 'weather' | 'order' | 'community' | 'govt';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  action?: string;
}

/* ─────────────────────────── Config ────────────────────────── */
const STORAGE_KEY = 'farm_notifications_v2';
export const BADGE_KEY  = 'farm_notif_unread';

const TYPE_CFG: Record<NotifType, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  price:     { color: '#f59e0b', bg: '#fffbeb', icon: <TrendingUp size={18}  />, label: 'Price Alert' },
  weather:   { color: '#3b82f6', bg: '#eff6ff', icon: <CloudRain  size={18}  />, label: 'Weather'     },
  order:     { color: '#10b981', bg: '#f0fdf4', icon: <Package    size={18}  />, label: 'Orders'      },
  community: { color: '#8b5cf6', bg: '#f5f3ff', icon: <Users      size={18}  />, label: 'Community'   },
  govt:      { color: '#ef4444', bg: '#fff1f2', icon: <ShieldAlert size={18} />, label: 'Govt Alert'  },
};

/* ─────────────────────────── Seeds ─────────────────────────── */
const SEEDS: Notification[] = [
  {
    id: 'n1', type: 'price',
    title: 'Wheat Prices Surge 8% in Punjab',
    body: 'Wheat mandi rates in Ludhiana touched ₹2,350/quintal today — highest this season. Consider selling now.',
    timestamp: Date.now() - 1000 * 60 * 12, read: false, action: 'View Market Prices',
  },
  {
    id: 'n2', type: 'order',
    title: 'Your Order Has Been Shipped',
    body: '50kg NPK Fertilizer (Order #FP-2024-0812) is on its way. Expected delivery: Tomorrow by 6 PM.',
    timestamp: Date.now() - 1000 * 60 * 45, read: false, action: 'Track Order',
  },
  {
    id: 'n3', type: 'community',
    title: 'New Reply on Your Post',
    body: '@RajeshFarmer replied: "Great harvest! What variety of tomatoes did you use this season?"',
    timestamp: Date.now() - 1000 * 60 * 90, read: false, action: 'View Post',
  },
  {
    id: 'n4', type: 'price',
    title: 'Tomato Prices Dropping Fast',
    body: 'Tomato prices in Maharashtra mandis fell to ₹420/quintal — down 22% in 3 days. Review your sell strategy.',
    timestamp: Date.now() - 1000 * 60 * 180, read: true,
  },
  {
    id: 'n5', type: 'govt',
    title: 'PMFBY Registration Deadline',
    body: 'Last date to register for Pradhan Mantri Fasal Bima Yojana (Kharif season) is May 31st, 2024.',
    timestamp: Date.now() - 1000 * 60 * 60 * 5, read: true, action: 'Apply Now',
  },
  {
    id: 'n6', type: 'community',
    title: 'You have 3 new followers',
    body: 'KisanSuresh, MangoFarmer99, and 1 other started following your farm profile.',
    timestamp: Date.now() - 1000 * 60 * 60 * 8, read: true,
  },
  {
    id: 'n7', type: 'order',
    title: 'Order Delivered Successfully',
    body: 'Drip Irrigation Kit (Order #FP-2024-0798) was delivered. Rate your experience!',
    timestamp: Date.now() - 1000 * 60 * 60 * 24, read: true, action: 'Rate Now',
  },
];

/* ─────────────────────────── Helpers ───────────────────────── */
function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function load(): Notification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return SEEDS;
}

function persist(notifs: Notification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
  localStorage.setItem(BADGE_KEY, String(notifs.filter(n => !n.read).length));
  window.dispatchEvent(new Event('notifications-updated'));
}

/* ─────────────────────────── Component ─────────────────────── */
export const NotificationsPage: React.FC = () => {
  const [notifs, setNotifs]           = useState<Notification[]>(load);
  const [tab, setTab]                 = useState<'all' | NotifType>('all');
  const [weatherLoading, setWLoad]    = useState(false);
  const [weatherDone, setWDone]       = useState(false);

  /* persist on every change */
  useEffect(() => { persist(notifs); }, [notifs]);

  /* ── Real weather alerts via Open-Meteo (free, no API key) ── */
  const fetchWeather = useCallback(async () => {
    if (weatherDone) return;
    setWLoad(true); setWDone(true);
    try {
      let lat = 20.5937, lon = 78.9629; // fallback: India center
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 4000 })
        );
        lat = pos.coords.latitude; lon = pos.coords.longitude;
      } catch { /* use fallback */ }

      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=weathercode,windspeed_10m,precipitation` +
        `&daily=precipitation_sum,weathercode&timezone=auto&forecast_days=3`;

      const data = await (await fetch(url)).json();
      const wCode: number = data.current?.weathercode ?? 0;
      const wind: number  = data.current?.windspeed_10m ?? 0;
      const precip: number[] = data.daily?.precipitation_sum ?? [];

      const alerts: Notification[] = [];

      if (wCode >= 95) {
        alerts.push({ id: `wlive-${Date.now()}`, type: 'weather',
          title: '⛈️ Thunderstorm Warning — Protect Your Crops',
          body: `Live: Thunderstorms active in your area. Wind: ${wind.toFixed(0)} km/h. Move harvested produce to shelter immediately.`,
          timestamp: Date.now(), read: false, action: 'View Forecast' });
      } else if (wCode >= 51) {
        alerts.push({ id: `wlive-${Date.now()}`, type: 'weather',
          title: '🌧️ Heavy Rain Expected — Take Precautions',
          body: `Live: Moderate–heavy rain detected (${wind.toFixed(0)} km/h winds). Delay pesticide spraying and check field drainage.`,
          timestamp: Date.now(), read: false, action: 'View Forecast' });
      } else if (wind > 40) {
        alerts.push({ id: `wlive-${Date.now()}`, type: 'weather',
          title: '💨 Strong Winds Advisory',
          body: `Live: Winds at ${wind.toFixed(0)} km/h. Secure loose farm equipment and avoid aerial spraying.`,
          timestamp: Date.now(), read: false });
      } else {
        alerts.push({ id: `wlive-${Date.now()}`, type: 'weather',
          title: '✅ Clear Weather — Good Day to Farm',
          body: `Live: Conditions look good in your area (wind: ${wind.toFixed(0)} km/h). Good day for spraying or harvesting.`,
          timestamp: Date.now(), read: false });
      }

      if (precip[1] > 15) {
        alerts.push({ id: `wtmrw-${Date.now()}`, type: 'weather',
          title: '🌦️ Heavy Rain Forecast Tomorrow',
          body: `${precip[1].toFixed(0)}mm of rain expected tomorrow. Plan irrigation and delay soil tilling.`,
          timestamp: Date.now() - 1000, read: false, action: 'View Forecast' });
      }

      setNotifs(prev => {
        const clean = prev.filter(n => !n.id.startsWith('wlive-') && !n.id.startsWith('wtmrw-'));
        return [...alerts, ...clean];
      });
    } catch (e) {
      console.warn('Weather fetch failed:', e);
    } finally { setWLoad(false); }
  }, [weatherDone]);

  useEffect(() => { fetchWeather(); }, [fetchWeather]);

  /* ── Actions ── */
  const markRead    = (id: string) => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = ()           => setNotifs(p => p.map(n => ({ ...n, read: true })));
  const deleteOne   = (id: string) => setNotifs(p => p.filter(n => n.id !== id));
  const clearAll    = ()           => setNotifs([]);

  const displayed   = tab === 'all' ? notifs : notifs.filter(n => n.type === tab);
  const unread      = notifs.filter(n => !n.read).length;

  const TABS = [
    { key: 'all'       as const, label: 'All',        emoji: '🔔' },
    { key: 'price'     as const, label: 'Prices',     emoji: '📊' },
    { key: 'weather'   as const, label: 'Weather',    emoji: '⛈️' },
    { key: 'order'     as const, label: 'Orders',     emoji: '📦' },
    { key: 'community' as const, label: 'Community',  emoji: '👥' },
    { key: 'govt'      as const, label: 'Govt',       emoji: '🏛️' },
  ];

  return (
    <div className="np-root">
      <style>{`
        .np-root {
          min-height: 100vh;
          background: #f1f5f9;
          font-family: 'Inter', system-ui, sans-serif;
          padding-bottom: 4rem;
        }

        /* ── Hero ── */
        .np-hero {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
          padding: 2.5rem 2rem 5rem;
          color: white;
          position: relative;
          overflow: hidden;
        }
        .np-hero::after {
          content: '';
          position: absolute;
          top: -40%; right: -20%;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .np-hero-inner {
          max-width: 860px; margin: 0 auto;
          display: flex; align-items: center;
          justify-content: space-between; gap: 1rem;
          position: relative; z-index: 2;
        }
        .np-hero-left { display: flex; align-items: center; gap: 1.25rem; }
        .np-hero-icon {
          width: 64px; height: 64px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 18px;
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(8px);
        }
        .np-hero-title { font-size: 1.9rem; font-weight: 800; margin: 0 0 0.3rem; }
        .np-hero-sub   { font-size: 0.95rem; opacity: 0.7; margin: 0; }
        .np-unread-pill {
          background: #ef4444; color: white;
          font-size: 0.75rem; font-weight: 800;
          padding: 4px 14px; border-radius: 999px;
          box-shadow: 0 4px 12px rgba(239,68,68,0.4);
          white-space: nowrap;
        }

        /* ── Stats Row ── */
        .np-stats {
          max-width: 860px; margin: -2.5rem auto 1.5rem;
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem; padding: 0 1.5rem;
          position: relative; z-index: 10;
        }
        .np-stat {
          background: white; border-radius: 16px;
          padding: 1.25rem 1.5rem;
          box-shadow: 0 6px 24px rgba(0,0,0,0.06);
          border: 1px solid #e2e8f0;
        }
        .np-stat-label { font-size: 0.78rem; font-weight: 600; color: #64748b; text-transform: uppercase; }
        .np-stat-val   { font-size: 1.6rem; font-weight: 800; color: #0f172a; margin-top: 0.25rem; }

        /* ── Tabs ── */
        .np-tabs-wrap {
          max-width: 860px; margin: 0 auto 1.5rem;
          padding: 0 1.5rem;
        }
        .np-tabs {
          display: flex; gap: 0.5rem; flex-wrap: wrap;
        }
        .np-tab {
          background: white; border: 1px solid #e2e8f0;
          border-radius: 10px; padding: 0.5rem 1rem;
          font-size: 0.85rem; font-weight: 600; color: #64748b;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; gap: 0.4rem;
        }
        .np-tab:hover     { border-color: #3b82f6; color: #3b82f6; }
        .np-tab.np-active { background: #0f172a; color: white; border-color: #0f172a; }
        .np-tab-count {
          background: #f1f5f9; color: #64748b;
          font-size: 0.7rem; font-weight: 800;
          padding: 1px 7px; border-radius: 999px;
        }
        .np-tab.np-active .np-tab-count { background: rgba(255,255,255,0.2); color: white; }

        /* ── Toolbar ── */
        .np-toolbar {
          max-width: 860px; margin: 0 auto 1rem;
          padding: 0 1.5rem;
          display: flex; justify-content: space-between; align-items: center;
          gap: 1rem;
        }
        .np-toolbar-info { font-size: 0.9rem; color: #64748b; font-weight: 500; }
        .np-toolbar-actions { display: flex; gap: 0.75rem; }
        .np-btn {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.5rem 1rem; border-radius: 10px;
          font-size: 0.82rem; font-weight: 700;
          cursor: pointer; transition: all 0.2s; border: none;
        }
        .np-btn-outline {
          background: white; border: 1px solid #e2e8f0; color: #475569;
        }
        .np-btn-outline:hover { border-color: #10b981; color: #10b981; }
        .np-btn-danger {
          background: #fff1f2; border: 1px solid #fecdd3; color: #ef4444;
        }
        .np-btn-danger:hover { background: #ef4444; color: white; }

        /* ── Notification Cards ── */
        .np-list {
          max-width: 860px; margin: 0 auto;
          padding: 0 1.5rem;
          display: flex; flex-direction: column; gap: 0.75rem;
        }
        .np-card {
          background: white; border-radius: 16px;
          border: 1px solid #e2e8f0;
          padding: 1.25rem 1.5rem;
          display: flex; gap: 1rem; align-items: flex-start;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }
        .np-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.07); transform: translateY(-2px); }
        .np-card.np-unread { border-left: 4px solid; background: #fafffe; }
        .np-card-stripe {
          position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
        }
        .np-card-icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .np-card-body { flex: 1; min-width: 0; }
        .np-card-top  { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; }
        .np-card-title { font-size: 0.97rem; font-weight: 700; color: #0f172a; margin: 0 0 0.35rem; }
        .np-card-text  { font-size: 0.88rem; color: #64748b; line-height: 1.55; margin: 0 0 0.75rem; }
        .np-card-meta  { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
        .np-card-time  { font-size: 0.78rem; color: #94a3b8; font-weight: 500; }
        .np-type-badge {
          font-size: 0.7rem; font-weight: 700;
          padding: 2px 8px; border-radius: 999px;
        }
        .np-action-link {
          font-size: 0.8rem; font-weight: 700;
          background: none; border: none; cursor: pointer;
          text-decoration: underline; padding: 0;
        }
        .np-card-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }
        .np-icon-btn {
          width: 32px; height: 32px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid #e2e8f0; background: #f8fafc;
          cursor: pointer; transition: all 0.15s; color: #94a3b8;
        }
        .np-icon-btn:hover.read-btn  { background: #10b981; color: white; border-color: #10b981; }
        .np-icon-btn:hover.del-btn   { background: #ef4444; color: white; border-color: #ef4444; }

        /* ── Empty / Loading ── */
        .np-empty {
          max-width: 860px; margin: 2rem auto;
          padding: 0 1.5rem; text-align: center;
        }
        .np-empty-inner {
          background: white; border-radius: 20px;
          border: 2px dashed #e2e8f0; padding: 4rem 2rem; color: #94a3b8;
        }
        .np-empty-inner h3 { margin: 1rem 0 0.5rem; color: #0f172a; font-size: 1.1rem; }
        .np-empty-inner p  { margin: 0; font-size: 0.9rem; }

        .np-weather-banner {
          max-width: 860px; margin: 0 auto 1.25rem;
          padding: 0 1.5rem;
        }
        .np-weather-inner {
          background: #eff6ff; border: 1px solid #bfdbfe;
          border-radius: 12px; padding: 0.75rem 1.25rem;
          display: flex; align-items: center; gap: 0.75rem;
          font-size: 0.87rem; color: #1d4ed8; font-weight: 500;
        }
      `}</style>

      {/* ── Hero ── */}
      <div className="np-hero">
        <div className="np-hero-inner">
          <div className="np-hero-left">
            <div className="np-hero-icon"><Bell size={30} color="white" /></div>
            <div>
              <h1 className="np-hero-title">Notifications</h1>
              <p className="np-hero-sub">Price alerts, weather warnings & order updates</p>
            </div>
          </div>
          {unread > 0 && <span className="np-unread-pill">{unread} Unread</span>}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="np-stats">
        <div className="np-stat">
          <div className="np-stat-label">Total</div>
          <div className="np-stat-val">{notifs.length}</div>
        </div>
        <div className="np-stat">
          <div className="np-stat-label">Unread</div>
          <div className="np-stat-val" style={{ color: unread > 0 ? '#ef4444' : '#10b981' }}>{unread}</div>
        </div>
        <div className="np-stat">
          <div className="np-stat-label">Weather Live</div>
          <div className="np-stat-val" style={{ fontSize: '1rem', marginTop: '0.5rem', color: '#3b82f6' }}>
            {weatherLoading ? 'Fetching…' : 'Synced ✓'}
          </div>
        </div>
      </div>

      {/* ── Weather loading banner ── */}
      {weatherLoading && (
        <div className="np-weather-banner">
          <div className="np-weather-inner">
            <RefreshCcw size={16} style={{ animation: 'spin 1s linear infinite' }} />
            Fetching live weather alerts for your location…
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="np-tabs-wrap">
        <div className="np-tabs">
          {TABS.map(t => {
            const count = t.key === 'all' ? notifs.length : notifs.filter(n => n.type === t.key).length;
            return (
              <button key={t.key} className={`np-tab ${tab === t.key ? 'np-active' : ''}`} onClick={() => setTab(t.key)}>
                {t.emoji} {t.label} <span className="np-tab-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="np-toolbar">
        <span className="np-toolbar-info">{displayed.length} notification{displayed.length !== 1 ? 's' : ''}</span>
        <div className="np-toolbar-actions">
          <button className="np-btn np-btn-outline" onClick={markAllRead}>
            <CheckCheck size={15} /> Mark all read
          </button>
          <button className="np-btn np-btn-danger" onClick={clearAll}>
            <Trash2 size={15} /> Clear all
          </button>
        </div>
      </div>

      {/* ── List ── */}
      {displayed.length === 0 ? (
        <div className="np-empty">
          <div className="np-empty-inner">
            <BellOff size={52} color="#cbd5e1" />
            <h3>All Clear!</h3>
            <p>No notifications in this category.</p>
          </div>
        </div>
      ) : (
        <div className="np-list">
          {displayed.map(n => {
            const cfg = TYPE_CFG[n.type];
            return (
              <div key={n.id} className={`np-card ${!n.read ? 'np-unread' : ''}`}
                style={!n.read ? { borderLeftColor: cfg.color } : {}}>
                <div className="np-card-icon" style={{ background: cfg.bg, color: cfg.color }}>
                  {cfg.icon}
                </div>
                <div className="np-card-body">
                  <div className="np-card-top">
                    <div style={{ flex: 1 }}>
                      <p className="np-card-title">
                        {!n.read && (
                          <span style={{
                            display: 'inline-block', width: 8, height: 8,
                            borderRadius: '50%', background: cfg.color,
                            marginRight: 8, verticalAlign: 'middle',
                          }} />
                        )}
                        {n.title}
                      </p>
                      <p className="np-card-text">{n.body}</p>
                      <div className="np-card-meta">
                        <span className="np-card-time">{timeAgo(n.timestamp)}</span>
                        <span className="np-type-badge" style={{ background: cfg.bg, color: cfg.color }}>
                          {cfg.label}
                        </span>
                        {n.action && (
                          <button className="np-action-link" style={{ color: cfg.color }}>
                            {n.action} →
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="np-card-actions">
                      {!n.read && (
                        <button className="np-icon-btn read-btn" title="Mark as read" onClick={() => markRead(n.id)}>
                          <Check size={15} />
                        </button>
                      )}
                      <button className="np-icon-btn del-btn" title="Delete" onClick={() => deleteOne(n.id)}>
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
