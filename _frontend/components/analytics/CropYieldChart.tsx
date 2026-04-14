import React from 'react';
import { Card } from '../ui/Card';

const MOCK_DATA = [
  { month: 'Jan', yield: 40 },
  { month: 'Feb', yield: 55 },
  { month: 'Mar', yield: 30 },
  { month: 'Apr', yield: 80 },
  { month: 'May', yield: 65 },
  { month: 'Jun', yield: 95 },
];

export const CropYieldChart: React.FC = () => {
  const maxYield = Math.max(...MOCK_DATA.map(d => d.yield));

  return (
    <Card title="Crop Yields (Last 6 Months)">
      <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '10%', marginTop: '2rem' }}>
        {MOCK_DATA.map((data, index) => {
          const heightPercentage = (data.yield / maxYield) * 100;
          return (
            <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%', marginBottom: '0.5rem' }}>
                <div 
                  style={{ 
                    width: '100%', 
                    height: `${heightPercentage}%`, 
                    backgroundColor: 'var(--color-primary)', 
                    borderRadius: 'var(--border-radius-sm) var(--border-radius-sm) 0 0',
                    transition: 'height 1s ease-out'
                  }} 
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{data.month}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
