import React from 'react';
import { Sprout, Bell, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import './layout.css';

export const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Sprout size={32} color="var(--color-primary)" />
        <span>FarmPlatform</span>
      </div>
      
      <div className="nav-profile">
        <Button variant="ghost" icon={<Search size={20} />}>Search</Button>
        <Button variant="ghost" icon={<Bell size={20} />}>Notifications</Button>
        <div className="avatar">JD</div>
      </div>
    </nav>
  );
};
