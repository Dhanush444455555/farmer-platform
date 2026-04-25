import React, { useState } from 'react';
import { ChevronDown, Leaf, ShoppingBag, IndianRupee, BarChart2, Wifi, Gift, Bell, MessageCircle, Settings, LogOut, Edit2, QrCode, Star } from 'lucide-react';

interface FolderItem {
  label: string;
  badge?: string;
}

interface FolderSection {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  items: FolderItem[];
  badgeCount?: number;
}

const FOLDERS: FolderSection[] = [
  {
    icon: <Leaf size={20} color="#fff" />,
    iconBg: 'linear-gradient(135deg, #10b981, #059669)',
    title: 'My Active Crops',
    subtitle: 'View and manage your active listings & crops',
    items: [
      { label: '🌾 Wheat — 500 kg available' },
      { label: '🍅 Tomatoes — 200 kg available' },
      { label: '🌽 Sweet Corn — 80 kg available' },
      { label: '+ Add New Crop Listing' },
    ],
  },
  {
    icon: <ShoppingBag size={20} color="#fff" />,
    iconBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
    title: 'Marketplace Listings',
    subtitle: 'Buy seeds, fertilizers, tools & more',
    items: [
      { label: '🌱 Browse Seeds & Saplings' },
      { label: '🧪 Fertilizers & Pesticides' },
      { label: '🚜 Farm Equipment' },
      { label: '💧 Irrigation Systems' },
    ],
    badgeCount: 3,
  },
  {
    icon: <IndianRupee size={20} color="#fff" />,
    iconBg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    title: 'Farm Finance',
    subtitle: 'Apply for instant crop loans, insurance & subsidy',
    items: [
      { label: '💳 Kisan Credit Card', badge: 'New' },
      { label: '🛡️ Crop Insurance' },
      { label: '🏛️ Government Subsidies' },
      { label: '🤝 Agri Loans' },
    ],
  },
  {
    icon: <BarChart2 size={20} color="#fff" />,
    iconBg: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    title: 'Market Prices & Analytics',
    subtitle: 'Live mandi rates, weather & yield reports',
    items: [
      { label: '📊 Today\'s Mandi Rates' },
      { label: '🌦️ Weather Forecast' },
      { label: '📈 Crop Yield Reports' },
      { label: '🤖 AI Price Predictions', badge: 'AI' },
    ],
  },
  {
    icon: <Wifi size={20} color="#fff" />,
    iconBg: 'linear-gradient(135deg, #ec4899, #be185d)',
    title: 'AI Assistant',
    subtitle: 'Crop disease detection, soil analysis & advice',
    items: [
      { label: '🔬 Crop Disease Scanner', badge: 'AI' },
      { label: '🪱 Soil Health Analysis' },
      { label: '💧 Water Usage Optimizer' },
      { label: '📅 Harvest Planner' },
    ],
    badgeCount: 1,
  },
  {
    icon: <Gift size={20} color="#fff" />,
    iconBg: 'linear-gradient(135deg, #f97316, #ea580c)',
    title: 'Rewards & Offers',
    subtitle: 'Claim cashbacks, coupons & seasonal offers',
    items: [
      { label: '🎁 Referral Bonus ₹500', badge: '₹500' },
      { label: '🏷️ Seasonal Discounts' },
      { label: '⭐ Loyalty Points' },
      { label: '🤝 Partner Deals' },
    ],
  },
  {
    icon: <Bell size={20} color="#fff" />,
    iconBg: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    title: 'Notifications & Alerts',
    subtitle: 'Price alerts, weather warnings, reminders',
    items: [
      { label: '🔔 Set Price Alerts' },
      { label: '⛈️ Weather Warnings' },
      { label: '📦 Order Updates' },
      { label: '💬 Community Mentions' },
    ],
    badgeCount: 5,
  },

];

const FolderRow: React.FC<{ section: FolderSection; isOpen: boolean; onToggle: () => void }> = ({ section, isOpen, onToggle }) => {
  return (
    <div className="fm-folder">
      <button className="fm-folder-header" onClick={onToggle} aria-expanded={isOpen}>
        <div className="fm-folder-icon" style={{ background: section.iconBg }}>
          {section.icon}
        </div>
        <div className="fm-folder-text">
          <div className="fm-folder-title-row">
            <span className="fm-folder-title">{section.title}</span>
            {section.badgeCount && (
              <span className="fm-badge-count">{section.badgeCount}</span>
            )}
          </div>
          <span className="fm-folder-subtitle">{section.subtitle}</span>
        </div>
        <div className={`fm-chevron ${isOpen ? 'open' : ''}`}>
          <ChevronDown size={18} />
        </div>
      </button>

      <div className={`fm-folder-body ${isOpen ? 'expanded' : ''}`}>
        <div className="fm-folder-items">
          {section.items.map((item, j) => (
            <button key={j} className="fm-folder-item">
              <span className="fm-item-label">{item.label}</span>
              {item.badge && <span className="fm-item-badge">{item.badge}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const FeaturesMenu: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(prev => prev === i ? null : i);

  return (
    <div className="fm-root">
      <style>{`
        /* ── Features Menu Root ──────────────────── */
        .fm-root {
          background: var(--color-bg-base, #f8fafc);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          max-width: 480px;
          width: 100%;
          margin: 0 auto;
        }

        /* ── Profile Header ──────────────────────── */
        .fm-profile-header {
          background: var(--color-bg-card, #fff);
          padding: 1.5rem 1.25rem 1.25rem;
          border-bottom: 1px solid var(--color-border, #e2e8f0);
          display: flex;
          flex-direction: column;
        }
        .fm-profile-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .fm-avatar-wrap { display: flex; align-items: center; gap: 1rem; }
        .fm-avatar {
          width: 64px; height: 64px; border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #3b82f6);
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 1.4rem; font-weight: 800;
          border: 3px solid #fff;
          box-shadow: 0 0 0 2px #10b981;
        }
        .fm-user-info {}
        .fm-user-name {
          font-size: 1.1rem; font-weight: 800;
          color: var(--color-text-main, #0f172a); margin: 0;
          letter-spacing: 0.3px;
        }
        .fm-user-phone {
          font-size: 0.875rem; font-weight: 500;
          color: var(--color-text-muted, #64748b); margin: 2px 0 0;
        }
        .fm-view-profile {
          font-size: 0.875rem; font-weight: 700;
          color: #10b981; margin: 6px 0 0; cursor: pointer;
          background: none; border: none; padding: 0; font-family: inherit;
        }
        .fm-header-icons { display: flex; gap: 0.75rem; }
        .fm-header-icon-btn {
          background: var(--color-bg-base, #f1f5f9);
          border: none; cursor: pointer;
          width: 40px; height: 40px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: var(--color-text-main, #0f172a);
          transition: all 0.2s; position: relative;
        }
        .fm-header-icon-btn:hover { background: #e2e8f0; }
        .fm-notif-dot {
          position: absolute; top: 6px; right: 6px;
          width: 8px; height: 8px; border-radius: 50%;
          background: #ef4444; border: 2px solid #fff;
        }

        /* ── Banner ──────────────────────────────── */
        .fm-banner {
          background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
          border-radius: 14px;
          margin: 1rem 1.25rem;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 6px 24px rgba(16,185,129,0.3);
        }
        .fm-banner-text {}
        .fm-banner-title {
          font-size: 0.95rem; font-weight: 700; color: #fff; margin: 0;
        }
        .fm-banner-sub { font-size: 0.8rem; color: rgba(255,255,255,0.85); margin: 3px 0 0; }
        .fm-banner-btn {
          background: #fff; border: none; border-radius: 8px;
          padding: 0.5rem 1rem; font-weight: 700; font-size: 0.82rem;
          color: #10b981; cursor: pointer; font-family: inherit;
          white-space: nowrap; flex-shrink: 0;
          transition: transform 0.15s;
        }
        .fm-banner-btn:hover { transform: scale(1.04); }

        /* ── Quick Actions Row ───────────────────── */
        .fm-quick-row {
          display: flex;
          gap: 0.75rem;
          padding: 0 1.25rem 0.75rem;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .fm-quick-row::-webkit-scrollbar { display: none; }
        .fm-quick-chip {
          display: flex; align-items: center; gap: 0.4rem;
          background: var(--color-bg-card, #fff);
          border: 1px solid var(--color-border, #e2e8f0);
          border-radius: 99px; padding: 0.45rem 0.9rem;
          font-size: 0.8rem; font-weight: 600; color: var(--color-text-main, #0f172a);
          white-space: nowrap; cursor: pointer;
          transition: all 0.2s; flex-shrink: 0;
          font-family: inherit;
        }
        .fm-quick-chip:hover { border-color: #10b981; color: #10b981; background: rgba(16,185,129,0.06); }

        /* ── Section Label ───────────────────────── */
        .fm-section-label {
          padding: 0.85rem 1.25rem 0.5rem;
          font-size: 0.75rem; font-weight: 700;
          color: var(--color-text-muted, #64748b);
          text-transform: uppercase; letter-spacing: 0.8px;
        }

        /* ── Folder Card ─────────────────────────── */
        .fm-folder {
          background: var(--color-bg-card, #fff);
          border-bottom: 1px solid var(--color-border, #e2e8f0);
          overflow: hidden;
        }
        .fm-folder-header {
          width: 100%; background: none; border: none; cursor: pointer;
          display: flex; align-items: center; gap: 1rem;
          padding: 1rem 1.25rem;
          text-align: left; font-family: inherit;
          transition: background 0.15s;
        }
        .fm-folder-header:hover { background: rgba(0,0,0,0.02); }
        .fm-folder-icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .fm-folder-text { flex: 1; min-width: 0; }
        .fm-folder-title-row { display: flex; align-items: center; gap: 0.5rem; }
        .fm-folder-title {
          font-weight: 700; font-size: 0.95rem;
          color: var(--color-text-main, #0f172a);
        }
        .fm-badge-count {
          background: #ef4444; color: white;
          font-size: 0.68rem; font-weight: 800;
          border-radius: 99px; padding: 1px 6px; min-width: 18px;
          text-align: center; line-height: 1.4;
        }
        .fm-folder-subtitle {
          font-size: 0.78rem; color: var(--color-text-muted, #64748b);
          margin-top: 2px; display: block;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .fm-chevron {
          color: var(--color-text-muted, #64748b); flex-shrink: 0;
          transition: transform 0.3s ease;
        }
        .fm-chevron.open { transform: rotate(180deg); }

        /* ── Folder Body ─────────────────────────── */
        .fm-folder-body {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.35s ease;
        }
        .fm-folder-body.expanded { max-height: 400px; }
        .fm-folder-items {
          padding: 0.25rem 1.25rem 1rem;
          display: flex; flex-direction: column; gap: 0.45rem;
        }
        .fm-folder-item {
          background: rgba(16,185,129,0.05);
          border: 1px solid rgba(16,185,129,0.12);
          border-radius: 10px;
          padding: 0.65rem 1rem;
          display: flex; align-items: center; justify-content: space-between;
          text-align: left; cursor: pointer;
          font-family: inherit; font-size: 0.875rem;
          color: var(--color-text-main, #0f172a); font-weight: 500;
          transition: all 0.15s;
        }
        .fm-folder-item:hover {
          background: rgba(16,185,129,0.12);
          border-color: rgba(16,185,129,0.3);
          transform: translateX(3px);
        }
        .fm-item-label { flex: 1; }
        .fm-item-badge {
          background: linear-gradient(135deg, #10b981, #3b82f6);
          color: white; font-size: 0.68rem; font-weight: 800;
          padding: 2px 7px; border-radius: 99px;
        }

        /* ── Footer actions ──────────────────────── */
        .fm-footer {
          padding: 1.25rem;
          display: flex; flex-direction: column; gap: 0.75rem;
          margin-top: auto;
        }
        .fm-footer-btn {
          display: flex; align-items: center; gap: 0.75rem;
          background: none; border: none; cursor: pointer;
          font-family: inherit; font-size: 0.9rem; font-weight: 600;
          color: var(--color-text-muted, #64748b);
          padding: 0.6rem 0; text-align: left;
          border-top: 1px solid var(--color-border, #e2e8f0);
          width: 100%; transition: color 0.2s;
        }
        .fm-footer-btn:hover { color: var(--color-text-main, #0f172a); }
        .fm-footer-btn.danger { color: #ef4444; }
        .fm-footer-btn.danger:hover { color: #dc2626; }
        .fm-farm-rating {
          display: flex; align-items: center; gap: 0.4rem;
          background: var(--color-bg-card, #fff);
          border: 1px solid var(--color-border, #e2e8f0);
          border-radius: 10px; padding: 0.75rem 1rem;
          margin: 0 1.25rem 0.5rem;
        }
        .fm-stars { display: flex; gap: 2px; }
        .fm-rating-text { font-size: 0.8rem; color: var(--color-text-muted, #64748b); }
        .fm-facing-issues {
          padding: 0 1.25rem 0.75rem;
          font-size: 0.875rem; color: var(--color-text-muted, #64748b);
        }
        .fm-facing-issues a {
          color: #3b82f6; font-weight: 700; cursor: pointer;
          background: none; border: none; font-family: inherit; font-size: inherit;
          text-decoration: none;
        }
      `}</style>

      {/* ── Profile Header ── */}
      <div className="fm-profile-header">
        <div className="fm-profile-top">
          <div className="fm-avatar-wrap">
            <div className="fm-avatar">JD</div>
            <div className="fm-user-info">
              <p className="fm-user-name">JOHN DOE FARMER</p>
              <p className="fm-user-phone">+91 98765 43210</p>
              <button className="fm-view-profile">View Profile</button>
            </div>
          </div>
          <div className="fm-header-icons">
            <button className="fm-header-icon-btn">
              <Bell size={20} />
              <span className="fm-notif-dot" />
            </button>
            <button className="fm-header-icon-btn">
              <QrCode size={20} />
            </button>
            <button className="fm-header-icon-btn">
              <Settings size={20} />
            </button>
          </div>
        </div>
        <p className="fm-facing-issues">
          Facing issues? <button className="fm-view-profile" style={{ display: 'inline' }}>Chat With Us</button>
        </p>
      </div>

      {/* ── Banner ── */}
      <div className="fm-banner">
        <div className="fm-banner-text">
          <p className="fm-banner-title">Sell More, Earn More 🌾</p>
          <p className="fm-banner-sub">List your produce & reach 10,000+ buyers</p>
        </div>
        <button className="fm-banner-btn">List Now</button>
      </div>

      {/* ── Quick Chips ── */}
      <div className="fm-quick-row">
        <button className="fm-quick-chip"><Leaf size={14} color="#10b981" /> My Crops</button>
        <button className="fm-quick-chip"><BarChart2 size={14} color="#8b5cf6" /> Prices</button>
        <button className="fm-quick-chip"><IndianRupee size={14} color="#3b82f6" /> Loans</button>
        <button className="fm-quick-chip"><Gift size={14} color="#f97316" /> Rewards</button>
        <button className="fm-quick-chip"><Wifi size={14} color="#ec4899" /> AI Help</button>
      </div>

      {/* ── Farm Rating ── */}
      <div className="fm-farm-rating">
        <div className="fm-stars">
          {[1, 2, 3, 4, 5].map(n => (
            <Star key={n} size={16} fill={n <= 4 ? '#f59e0b' : 'none'} stroke="#f59e0b" />
          ))}
        </div>
        <span className="fm-rating-text">4.0 · Verified Farmer · 12 Listings</span>
      </div>

      {/* ── Folder Sections ── */}
      <div className="fm-section-label">All Features</div>

      {FOLDERS.map((folder, i) => (
        <FolderRow
          key={i}
          section={folder}
          isOpen={openIndex === i}
          onToggle={() => toggle(i)}
        />
      ))}

      {/* ── Footer ── */}
      <div className="fm-footer">
        <button className="fm-footer-btn">
          <Edit2 size={18} /> Edit Profile
        </button>
        <button className="fm-footer-btn danger">
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );
};
