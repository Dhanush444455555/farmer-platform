import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { MarketplaceGrid } from '../components/marketplace/MarketplaceGrid';
import { DashboardWidget } from '../components/dashboard/DashboardWidget';
import { CartSummary } from '../components/orders/CartSummary';
import { FarmFeed } from '../components/feed/FarmFeed';
import { FeaturesMenu } from '../components/features/FeaturesMenu';
import { LoginCard } from '../components/auth/LoginCard';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Navbar />
          <Routes>
            <Route path="/" element={<Navigate to="/farmfeed" replace />} />
            <Route path="/login" element={<LoginCard />} />
            <Route path="/cart" element={<CartSummary />} />
            <Route path="/dashboard" element={<DashboardWidget />} />
            <Route path="/marketplace" element={<MarketplaceGrid />} />
            <Route path="/farmfeed" element={<FarmFeed />} />
            <Route path="/features" element={<FeaturesMenu />} />
            <Route path="/feed" element={<Navigate to="/farmfeed" replace />} />
            <Route path="/reels" element={<Navigate to="/farmfeed" replace />} />
            <Route path="/chat" element={
              <div className="page-container">
                <div className="page-header"><h1 className="page-title">Messages</h1><p className="page-subtitle">Coming Soon...</p></div>
              </div>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
