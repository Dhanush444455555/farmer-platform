import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Store, Sprout,
  Leaf, ShoppingBag, IndianRupee, BarChart2,
  Cpu, Bell, MessageCircle, ShieldCheck
} from 'lucide-react';
import './layout.css';
import { BADGE_KEY } from '../features/NotificationsPage';

const STATIC_NAV = [
  { to: '/dashboard',     icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { to: '/farmfeed',      icon: <Sprout          size={20} />, label: 'FarmFeed' },
  { to: '/marketplace',   icon: <Store           size={20} />, label: 'Marketplace' },
  { to: '/my-crops',      icon: <Leaf            size={20} />, label: 'My Active Crops' },
  { to: '/mkt-listings',  icon: <ShoppingBag     size={20} />, label: 'Mkt Listings',  badge: 3 },
  { to: '/farm-finance',  icon: <IndianRupee     size={20} />, label: 'Farm Finance' },
  { to: '/crop-insurance',icon: <ShieldCheck     size={20} />, label: 'Crop Insurance' },
  { to: '/market-prices', icon: <BarChart2       size={20} />, label: 'Market Prices' },
  { to: '/ai-assistant',  icon: <Cpu             size={20} />, label: 'AI Assistant',  badge: 1 },
  { to: '/support',       icon: <MessageCircle   size={20} />, label: 'Connect & Support' },
];

function readBadge(): number {
  return parseInt(localStorage.getItem(BADGE_KEY) || '0', 10);
}

export const Sidebar: React.FC = () => {
  const [notifBadge, setNotifBadge] = useState<number>(readBadge);

  useEffect(() => {
    const sync = () => setNotifBadge(readBadge());
    window.addEventListener('notifications-updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('notifications-updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const NAV_ITEMS = [
    ...STATIC_NAV.slice(0, 9),
    { to: '/alerts', icon: <Bell size={20} />, label: 'Notifications', badge: notifBadge || undefined },
    ...STATIC_NAV.slice(9),
  ];

  return (
    <aside className="sidebar glass">
      {NAV_ITEMS.map(({ to, icon, label, badge }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          {icon}
          <span style={{ flex: 1 }}>{label}</span>
          {badge && (
            <span style={{
              background: '#ef4444', color: '#fff',
              fontSize: '0.65rem', fontWeight: 800,
              borderRadius: '999px', padding: '1px 6px',
              lineHeight: '1.5', minWidth: 18, textAlign: 'center',
            }}>
              {badge}
            </span>
          )}
        </NavLink>
      ))}
    </aside>
  );
};
