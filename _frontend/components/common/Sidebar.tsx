import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Store, MessageSquare, Sprout,
  Leaf, ShoppingBag, IndianRupee, BarChart2,
  Cpu, Gift, Bell, MessageCircle,
} from 'lucide-react';
import './layout.css';

const NAV_ITEMS = [
  { to: '/dashboard',   icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { to: '/farmfeed',    icon: <Sprout size={20} />,          label: 'FarmFeed' },
  { to: '/marketplace', icon: <Store size={20} />,           label: 'Marketplace' },
  { to: '/my-crops',    icon: <Leaf size={20} />,            label: 'My Active Crops' },
  { to: '/mkt-listings',icon: <ShoppingBag size={20} />,     label: 'Mkt Listings',   badge: 3 },
  { to: '/farm-finance',icon: <IndianRupee size={20} />,     label: 'Farm Finance' },
  { to: '/market-prices',icon: <BarChart2 size={20} />,      label: 'Market Prices' },
  { to: '/ai-assistant',icon: <Cpu size={20} />,             label: 'AI Assistant',   badge: 1 },
  { to: '/rewards',     icon: <Gift size={20} />,            label: 'Rewards & Offers' },
  { to: '/alerts',      icon: <Bell size={20} />,            label: 'Notifications',  badge: 5 },
  { to: '/support',     icon: <MessageCircle size={20} />,   label: 'Connect & Support' },
  { to: '/chat',        icon: <MessageSquare size={20} />,   label: 'Messages' },
];

export const Sidebar: React.FC = () => {
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
              background: '#ef4444',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 800,
              borderRadius: '999px',
              padding: '1px 6px',
              lineHeight: '1.5',
              minWidth: 18,
              textAlign: 'center',
            }}>
              {badge}
            </span>
          )}
        </NavLink>
      ))}
    </aside>
  );
};
