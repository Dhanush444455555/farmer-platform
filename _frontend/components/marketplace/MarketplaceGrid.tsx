import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ShoppingCart } from 'lucide-react';

const DUMMY_CROPS = [
  { id: 1, name: 'Organic Tomatoes', price: '$2.50/lb', farm: 'Sunny Valley Farm', emoji: '🍅' },
  { id: 2, name: 'Fresh Sweet Corn', price: '$0.80/ear', farm: 'Oakwood Acres', emoji: '🌽' },
  { id: 3, name: 'Russet Potatoes', price: '$1.20/lb', farm: 'Highland Farms', emoji: '🥔' },
  { id: 4, name: 'Local Honey', price: '$8.00/jar', farm: 'Bee Happy Apiary', emoji: '🍯' },
  { id: 5, name: 'Crisp Apples', price: '$3.00/lb', farm: 'Riverbed Orchards', emoji: '🍎' },
];

export const MarketplaceGrid: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Marketplace</h1>
        <p className="page-subtitle">Discover fresh, local produce directly from farmers.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {DUMMY_CROPS.map(crop => (
          <Card key={crop.id} hoverable>
            <div style={{ fontSize: '4rem', textAlign: 'center', marginBottom: '1rem' }}>{crop.emoji}</div>
            <h3 className="card-title">{crop.name}</h3>
            <p style={{ color: 'var(--color-primary)', fontWeight: '600', marginBottom: '0.25rem' }}>{crop.price}</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>By {crop.farm}</p>
            <Button variant="primary" style={{ width: '100%' }} icon={<ShoppingCart size={16} />}>
              Add to Cart
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
