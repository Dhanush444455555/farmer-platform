import React, { useState } from 'react';
import {
  Leaf, ShoppingBag, IndianRupee, BarChart2,
  Cpu, Gift, Bell, MessageCircle, ChevronRight, Activity, Sprout, Cloud, ArrowRight
} from 'lucide-react';

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
    icon: <Leaf size={24} color="#fff" />,
    iconBg: 'linear-gradient(135deg, #10b981, #059669)',
    title: 'My Active Crops',
    subtitle: 'View and manage your active listings & crops',
    items: [
      { label: '🌾 Wheat — 500 kg available', badge: 'Active' },
      { label: '🍅 Tomatoes — 200 kg available' },
      { label: '🌽 Sweet Corn — 80 kg available' },
      { label: '+ Add New Crop Listing', badge: 'New' },
    ],
  },
  {
    icon: <ShoppingBag size={24} color="#fff" />,
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
    icon: <IndianRupee size={24} color="#fff" />,
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
    icon: <BarChart2 size={24} color="#fff" />,
    iconBg: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    title: 'Market Prices & Analytics',
    subtitle: 'Live mandi rates, weather & yield reports',
    items: [
      { label: "📊 Today's Mandi Rates" },
      { label: '🌦️ Weather Forecast' },
      { label: '📈 Crop Yield Reports' },
      { label: '🤖 AI Price Predictions', badge: 'AI' },
    ],
  },
  {
    icon: <Cpu size={24} color="#fff" />,
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
    icon: <Gift size={24} color="#fff" />,
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
    icon: <Bell size={24} color="#fff" />,
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
  {
    icon: <MessageCircle size={24} color="#fff" />,
    iconBg: 'linear-gradient(135deg, #84cc16, #65a30d)',
    title: 'Connect & Support',
    subtitle: 'Chat with experts, buyers and the community',
    items: [
      { label: '👨‍🌾 Talk to Agri Expert' },
      { label: '🤝 Buyer Direct Chat' },
      { label: '💬 Community Forum' },
      { label: '🚩 Report an Issue' },
    ],
  },
];

export const FeaturePage: React.FC<{ sectionIndex: number }> = ({ sectionIndex }) => {
  const section = FOLDERS[sectionIndex];
  const [activeItem, setActiveItem] = useState<number | null>(null);

  if (!section) return <div className="page-container"><p>Section not found.</p></div>;

  return (
    <div className="fp-page">
      <style>{`
        .fp-page {
          min-height: 100vh;
          background: #f8fafc;
          padding: 0;
          font-family: 'Inter', sans-serif;
        }

        /* ── Hero Banner ────────────────────────────── */
        .fp-hero-banner {
          position: relative;
          padding: 4rem 3rem 6rem;
          background: ${section.iconBg};
          border-radius: 0 0 40px 40px;
          color: white;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }
        
        .fp-hero-banner::after {
          content: '';
          position: absolute;
          top: -50%; left: -50%; right: -50%; bottom: -50%;
          background: radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 60%);
          transform: rotate(30deg);
          pointer-events: none;
        }

        .fp-hero-content {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: flex-start;
          gap: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .fp-hero-icon-wrapper {
          width: 80px; height: 80px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }

        .fp-hero-text h1 {
          font-size: 2.5rem; font-weight: 800;
          margin: 0 0 0.5rem;
          letter-spacing: -0.5px;
          display: flex; align-items: center; gap: 1rem;
        }

        .fp-hero-text p {
          font-size: 1.1rem; opacity: 0.9; margin: 0;
          font-weight: 400;
        }

        .fp-badge-hero {
          background: #ef4444; color: white;
          font-size: 0.8rem; font-weight: 800;
          border-radius: 999px; padding: 4px 12px;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }

        /* ── Glass Metrics ────────────────────────── */
        .fp-metrics-row {
          display: flex;
          gap: 1.5rem;
          max-width: 1000px;
          margin: -3rem auto 3rem;
          position: relative;
          z-index: 10;
          padding: 0 1rem;
        }

        .fp-metric-card {
          flex: 1;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .fp-metric-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .fp-metric-value {
          font-size: 1.8rem;
          font-weight: 800;
          color: #0f172a;
        }

        /* ── Actions Grid ─────────────────────────── */
        .fp-actions-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 1rem 4rem;
        }

        .fp-section-title {
          font-size: 1.25rem; font-weight: 700;
          color: #0f172a; margin-bottom: 1.5rem;
          display: flex; align-items: center; justify-content: space-between;
        }

        .fp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
        }

        .fp-action-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
          position: relative;
          overflow: hidden;
          text-align: left;
        }

        .fp-action-card:hover {
          transform: translateY(-4px) scale(1.01);
          border-color: #10b981;
          box-shadow: 0 15px 35px rgba(16, 185, 129, 0.1);
        }

        .fp-action-card.active-item {
          border-color: #10b981;
          background: #f0fdf4;
        }

        .fp-action-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 4px; height: 100%;
          background: #10b981;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .fp-action-card:hover::before { opacity: 1; }

        .fp-card-title {
          font-size: 1.05rem; font-weight: 600; color: #1e293b;
          display: flex; align-items: center; justify-content: space-between;
          width: 100%;
        }

        .fp-card-badge {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white; font-size: 0.7rem; font-weight: 800;
          padding: 3px 10px; border-radius: 999px;
        }

        .fp-card-arrow {
          align-self: flex-end;
          margin-top: auto;
          color: #cbd5e1;
          transition: all 0.2s;
        }
        .fp-action-card:hover .fp-card-arrow {
          color: #10b981;
          transform: translateX(4px);
        }

        .fp-coming-soon {
          background: #fffbeb; border: 1px solid #fcd34d; color: #b45309;
          font-size: 0.85rem; font-weight: 600; padding: 0.5rem 1rem;
          border-radius: 8px; margin-top: 3rem; display: inline-block;
        }
      `}</style>

      {/* Hero Banner */}
      <div className="fp-hero-banner">
        <div className="fp-hero-content">
          <div className="fp-hero-icon-wrapper">
            {React.cloneElement(section.icon as React.ReactElement, { size: 40 })}
          </div>
          <div className="fp-hero-text">
            <h1>
              {section.title}
              {section.badgeCount && (
                <span className="fp-badge-hero">{section.badgeCount} New</span>
              )}
            </h1>
            <p>{section.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Floating Glass Metrics */}
      <div className="fp-metrics-row">
        <div className="fp-metric-card">
          <span className="fp-metric-label">System Status</span>
          <span className="fp-metric-value" style={{ color: '#10b981' }}>Optimal</span>
        </div>
        <div className="fp-metric-card">
          <span className="fp-metric-label">Available Modules</span>
          <span className="fp-metric-value">{section.items.length}</span>
        </div>
        <div className="fp-metric-card">
          <span className="fp-metric-label">Last Synchronized</span>
          <span className="fp-metric-value" style={{ fontSize: '1.2rem', marginTop: 'auto' }}>Just Now</span>
        </div>
      </div>

      {/* Action Grid */}
      <div className="fp-actions-container">
        <div className="fp-section-title">
          <span>Action Directory</span>
        </div>
        
        <div className="fp-grid">
          {section.items.map((item, i) => (
            <button
              key={i}
              className={`fp-action-card ${activeItem === i ? 'active-item' : ''}`}
              onClick={() => setActiveItem(prev => prev === i ? null : i)}
            >
              <div className="fp-card-title">
                {item.label}
                {item.badge && <span className="fp-card-badge">{item.badge}</span>}
              </div>
              <ChevronRight size={24} className="fp-card-arrow" />
            </button>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
           <span className="fp-coming-soon">🚧 Core Backend Logic for this module is under active development.</span>
        </div>
      </div>
    </div>
  );
};
