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
import { NotificationsPage } from '../components/features/NotificationsPage';
import { MyCropsPage } from '../components/features/MyCropsPage';
import { AIAssistant } from '../components/features/AIAssistant';
import { MarketPrices } from '../components/features/MarketPrices';
import { CropInsurance } from '../components/features/CropInsurance';
import { FarmFinance } from '../components/features/FarmFinance';
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
            <Route path="/mkt-listings" element={<MarketplaceGrid />} />
            <Route path="/farmfeed" element={<FarmFeed />} />
            {/* Feature pages */}
            <Route path="/my-crops"      element={<MyCropsPage />} />
            <Route path="/farm-finance"  element={<FarmFinance />} />
            <Route path="/crop-insurance" element={<CropInsurance />} />
            <Route path="/market-prices" element={<MarketPrices />} />
            <Route path="/ai-assistant"  element={<AIAssistant />} />
            <Route path="/alerts"  element={<NotificationsPage />} />
            <Route path="/support" element={<FeaturePage sectionIndex={7} />} />
            {/* Misc */}
            <Route path="/features" element={<Navigate to="/my-crops" replace />} />
            <Route path="/feed"     element={<Navigate to="/farmfeed" replace />} />
            <Route path="/reels"    element={<Navigate to="/farmfeed" replace />} />

          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
