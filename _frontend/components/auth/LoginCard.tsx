import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { User, Lock } from 'lucide-react';

export const LoginCard: React.FC = () => {

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '2rem' }}>
      <Card title="Welcome Back" style={{ width: '100%', maxWidth: '400px' }}>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Login to your Farm Platform account.</p>

        {/* Google SSO Button */}
        <button 
          style={{ 
            width: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.75rem',
            padding: '0.75rem',
            marginBottom: '1.5rem',
            backgroundColor: 'white',
            color: '#3f3f3f',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius-md)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '1rem',
            transition: 'background-color 0.2s ease',
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25C22.56 11.47 22.49 10.73 22.36 10.02H12V14.25H17.92C17.66 15.63 16.86 16.8 15.69 17.58V20.35H19.26C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
            <path d="M12 23C14.97 23 17.47 22.01 19.26 20.35L15.69 17.58C14.72 18.23 13.46 18.63 12 18.63C9.18 18.63 6.79 16.72 5.92 14.16H2.22V17.03C4.02 20.61 7.72 23 12 23Z" fill="#34A853"/>
            <path d="M5.92 14.16C5.7 13.49 5.57 12.76 5.57 12C5.57 11.24 5.7 10.51 5.92 9.84V6.97H2.22C1.48 8.44 1 10.16 1 12C1 13.84 1.48 15.56 2.22 17.03L5.92 14.16Z" fill="#FBBC05"/>
            <path d="M12 5.38C13.62 5.38 15.08 5.94 16.22 7.02L19.34 3.9C17.47 2.16 14.97 1 12 1C7.72 1 4.02 3.39 2.22 6.97L5.92 9.84C6.79 7.28 9.18 5.38 12 5.38Z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', color: 'var(--color-text-muted)' }}>
          <hr style={{ flex: 1, borderColor: 'var(--color-border)', borderBottom: 'none' }} />
          <span style={{ padding: '0 1rem', fontSize: '0.875rem' }}>or use email</span>
          <hr style={{ flex: 1, borderColor: 'var(--color-border)', borderBottom: 'none' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ position: 'relative' }}>
            <User size={20} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Username or Email" 
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 3rem',
                borderRadius: 'var(--border-radius-md)',
                border: '1px solid var(--color-border)',
                background: 'rgba(255,255,255,0.5)',
                color: 'var(--color-text-main)',
                fontFamily: 'inherit',
                fontSize: '1rem',
                outline: 'none'
              }} 
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={20} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: 'var(--color-text-muted)' }} />
            <input 
              type="password" 
              placeholder="Password" 
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 3rem',
                borderRadius: 'var(--border-radius-md)',
                border: '1px solid var(--color-border)',
                background: 'rgba(255,255,255,0.5)',
                color: 'var(--color-text-main)',
                fontFamily: 'inherit',
                fontSize: '1rem',
                outline: 'none'
              }} 
            />
          </div>
        </div>

        <Button variant="primary" size="lg" style={{ width: '100%' }}>
          Log In
        </Button>
      </Card>
    </div>
  );
};
