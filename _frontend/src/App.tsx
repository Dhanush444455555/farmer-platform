import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { MarketplaceGrid } from '../components/marketplace/MarketplaceGrid';
import { DashboardWidget } from '../components/dashboard/DashboardWidget';
import { CartSummary } from '../components/orders/CartSummary';
import { FarmFeed } from '../components/feed/FarmFeed';
import { LoginCard } from '../components/auth/LoginCard';
import { FeaturePage } from '../components/features/FeaturePage';
import { MyCropsPage } from '../components/features/MyCropsPage';
import { AIAssistant } from '../components/features/AIAssistant';
import { MarketPrices } from '../components/features/MarketPrices';
import './App.css';

const ComingSoon: React.FC<{ title: string; emoji?: string }> = ({ title, emoji = '🚧' }) => (
  <div className="page-container">
    <div className="page-header">
      <h1 className="page-title">{emoji} {title}</h1>
      <p className="page-subtitle">Coming Soon…</p>
    </div>
  </div>
);

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
            <Route path="/mkt-listings" element={<MarketplaceGrid />} />
            <Route path="/farmfeed" element={<FarmFeed />} />
            {/* Feature pages */}
            <Route path="/my-crops"      element={<MyCropsPage />} />
            <Route path="/farm-finance"  element={<FeaturePage sectionIndex={2} />} />
            <Route path="/market-prices" element={<MarketPrices />} />
            <Route path="/ai-assistant"  element={<AIAssistant />} />
            <Route path="/rewards"       element={<FeaturePage sectionIndex={5} />} />
            <Route path="/alerts"        element={<FeaturePage sectionIndex={6} />} />
            <Route path="/support"       element={<FeaturePage sectionIndex={7} />} />
            {/* Misc */}
            <Route path="/features" element={<Navigate to="/my-crops" replace />} />
            <Route path="/feed"     element={<Navigate to="/farmfeed" replace />} />
            <Route path="/reels"    element={<Navigate to="/farmfeed" replace />} />
            <Route path="/chat" element={<ComingSoon title="Messages" emoji="💬" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
