import React from 'react';
import { Card } from '../ui/Card';
import { CloudRain, ThermometerSun, Leaf, Activity } from 'lucide-react';
import { CropYieldChart } from '../analytics/CropYieldChart';

export const DashboardWidget: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Farmer Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here's an overview of your farm metrics.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <Card hoverable className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Current Temp</p>
              <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>72°F</h2>
            </div>
            <ThermometerSun size={32} color="var(--color-accent)" />
          </div>
        </Card>
        
        <Card hoverable className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Soil Moisture</p>
              <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>45%</h2>
            </div>
            <CloudRain size={32} color="#3b82f6" />
          </div>
        </Card>

        <Card hoverable className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Active Crops</p>
              <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>14</h2>
            </div>
            <Leaf size={32} color="var(--color-primary)" />
          </div>
        </Card>

        <Card hoverable className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>System Status</p>
              <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem', color: 'var(--color-primary)' }}>Healthy</h2>
            </div>
            <Activity size={32} color="var(--color-primary)" />
          </div>
        </Card>
      </div>
      
      {/* Analytics Chart */}
      <div style={{ marginTop: '2rem' }}>
        <CropYieldChart />
      </div>
      
      {/* AI AI Recommendations Placeholder */}
      <Card title="AI Insights" style={{ marginTop: '2rem' }}>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Based on recent weather patterns, we recommend increasing irrigation for your Tomato crops by 15% today.</p>
        <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--border-radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          ✅ Optimal time to water: 6:00 PM - 8:00 PM
        </div>
      </Card>
    </div>
  );
};
