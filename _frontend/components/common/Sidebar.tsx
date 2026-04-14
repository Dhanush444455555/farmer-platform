import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Store, MessageSquare, Sprout, Layers } from 'lucide-react';
import './layout.css';

export const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar glass">
      <NavLink to="/dashboard" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={20} />
        Dashboard
      </NavLink>
      <NavLink to="/marketplace" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <Store size={20} />
        Marketplace
      </NavLink>
      <NavLink to="/farmfeed" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <Sprout size={20} />
        FarmFeed
      </NavLink>
      <NavLink to="/features" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <Layers size={20} />
        Features
      </NavLink>
      <NavLink to="/chat" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
        <MessageSquare size={20} />
        Messages
      </NavLink>
    </aside>
  );
};
