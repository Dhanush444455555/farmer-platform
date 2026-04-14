import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CreditCard, Trash2 } from 'lucide-react';

const MOCK_CART = [
  { id: 1, name: 'Organic Tomatoes', qty: 2, price: 2.50 },
  { id: 2, name: 'Local Honey', qty: 1, price: 8.00 },
];

export const CartSummary: React.FC = () => {
  const subtotal = MOCK_CART.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        
        <div style={{ flex: '1 1 400px' }}>
          <h2 className="page-title" style={{ marginBottom: '1.5rem' }}>Your Basket</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {MOCK_CART.map(item => (
              <Card key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{item.name}</h4>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Qty: {item.qty} × ${item.price.toFixed(2)}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontWeight: 700 }}>${(item.price * item.qty).toFixed(2)}</span>
                  <Button variant="ghost" size="sm" icon={<Trash2 size={16} color="var(--color-accent)" />} />
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div style={{ flex: '1 1 300px' }}>
          <Card title="Order Summary" style={{ position: 'sticky', top: '100px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1rem 0 0.5rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Estimated Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
              <span style={{ fontWeight: 600 }}>Total</span>
              <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>${total.toFixed(2)}</span>
            </div>
            <Button variant="primary" style={{ width: '100%' }} icon={<CreditCard size={18} />}>
              Proceed to Checkout
            </Button>
          </Card>
        </div>

      </div>
    </div>
  );
};
