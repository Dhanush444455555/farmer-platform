import React, { useState } from 'react';
import {
  IndianRupee, CreditCard, Landmark, Calculator, ChevronRight,
  TrendingUp, ShieldCheck, Activity, CheckCircle2, AlertCircle, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

type Tab = 'overview' | 'kcc' | 'subsidies' | 'emi';

export const FarmFinance: React.FC = () => {
  const [tab, setTab] = useState<Tab>('overview');

  // KCC Calculator State
  const [kccCrop, setKccCrop] = useState('wheat');
  const [kccAcres, setKccAcres] = useState<number | ''>('');
  
  // EMI Calculator State
  const [loanAmount, setLoanAmount] = useState<number | ''>(500000);
  const [interestRate, setInterestRate] = useState<number | ''>(8.5);
  const [loanTenure, setLoanTenure] = useState<number | ''>(5); // Years

  // KCC Scale of Finance (Mock values per acre in INR)
  const SCALE_OF_FINANCE: Record<string, { name: string; rate: number }> = {
    wheat: { name: 'Wheat', rate: 35000 },
    paddy: { name: 'Paddy', rate: 42000 },
    cotton: { name: 'Cotton', rate: 50000 },
    sugarcane: { name: 'Sugarcane', rate: 85000 },
    vegetables: { name: 'Mixed Vegetables', rate: 45000 },
  };

  const calculateKCCLimit = () => {
    if (!kccAcres || kccAcres <= 0) return 0;
    const baseLimit = kccAcres * SCALE_OF_FINANCE[kccCrop].rate;
    // KCC limits usually include 10% for post-harvest + 20% for maintenance
    const totalLimit = baseLimit + (baseLimit * 0.1) + (baseLimit * 0.2);
    return Math.round(totalLimit);
  };

  const calculateEMI = () => {
    if (!loanAmount || !interestRate || !loanTenure) return { emi: 0, totalInterest: 0, totalPayment: 0 };
    const p = Number(loanAmount);
    const r = Number(interestRate) / 12 / 100;
    const n = Number(loanTenure) * 12;
    
    if (r === 0) return { emi: p / n, totalInterest: 0, totalPayment: p };
    
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - p;
    
    return {
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment)
    };
  };

  const SUBSIDIES = [
    { id: 1, title: 'PM-KISAN Samman Nidhi', desc: '₹6,000 per year minimum income support.', status: 'Active', amount: '₹2,000/installment' },
    { id: 2, title: 'Solar Pump Subsidy (PM-KUSUM)', desc: 'Up to 60% subsidy on standalone solar agriculture pumps.', status: 'Apply Now', amount: 'Up to 60%' },
    { id: 3, title: 'Agricultural Mechanization (SMAM)', desc: 'Financial assistance for purchasing tractors and farm equipment.', status: 'Apply Now', amount: '40-50% Subsidy' },
    { id: 4, title: 'Seed Subsidy Scheme', desc: 'Subsidy on certified/foundation seeds for food crops.', status: 'Processing', amount: '₹1,500/Qtl' },
  ];

  return (
    <div className="ff-root">
      <style>{`
        .ff-root {
          min-height: 100vh;
          background: #f1f5f9;
          font-family: 'Inter', system-ui, sans-serif;
          padding-bottom: 4rem;
        }

        /* ── Hero ── */
        .ff-hero {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          padding: 3rem 2rem 5rem;
          color: white;
          position: relative;
          overflow: hidden;
        }
        .ff-hero::after {
          content: '';
          position: absolute;
          top: -50%; right: -20%;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
          pointer-events: none;
        }
        .ff-hero-inner {
          max-width: 1000px; margin: 0 auto;
          display: flex; align-items: center; gap: 1.5rem;
          position: relative; z-index: 2;
        }
        .ff-hero-icon {
          width: 72px; height: 72px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
        }
        .ff-hero-title { font-size: 2.2rem; font-weight: 800; margin: 0 0 0.5rem; letter-spacing: -0.5px; }
        .ff-hero-sub { font-size: 1.05rem; opacity: 0.9; margin: 0; font-weight: 500; }

        /* ── Navigation Tabs ── */
        .ff-tabs {
          max-width: 1000px; margin: -2rem auto 2rem;
          background: white; border-radius: 16px; padding: 0.5rem;
          display: flex; gap: 0.5rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          position: relative; z-index: 10; border: 1px solid #e2e8f0;
          overflow-x: auto;
        }
        .ff-tab {
          flex: 1; padding: 1rem; border-radius: 12px;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          font-weight: 700; font-size: 0.95rem; color: #64748b;
          border: none; background: transparent; cursor: pointer; transition: all 0.2s;
          white-space: nowrap;
        }
        .ff-tab:hover { background: #f8fafc; color: #3b82f6; }
        .ff-tab.active { background: #eff6ff; color: #1d4ed8; }

        /* ── Content Container ── */
        .ff-content { max-width: 1000px; margin: 0 auto; padding: 0 1.5rem; }

        /* ── Overview Dashboard ── */
        .ff-overview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
        .ff-card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 1.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
        .ff-stat-label { font-size: 0.85rem; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
        .ff-stat-value { font-size: 2rem; font-weight: 800; color: #0f172a; }
        .ff-stat-sub { font-size: 0.85rem; color: #10b981; font-weight: 600; margin-top: 0.25rem; display: flex; align-items: center; gap: 0.25rem; }
        
        .ff-action-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
        .ff-action-card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 1.5rem; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: all 0.2s; text-decoration: none; color: inherit; }
        .ff-action-card:hover { border-color: #3b82f6; box-shadow: 0 8px 25px rgba(59,130,246,0.1); transform: translateY(-2px); }
        .ff-ac-left { display: flex; align-items: center; gap: 1rem; }
        .ff-ac-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .ff-ac-title { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin: 0 0 0.25rem; }
        .ff-ac-desc { font-size: 0.85rem; color: #64748b; margin: 0; }

        /* ── Tools / Calculators ── */
        .ff-tool-container { background: white; border-radius: 20px; border: 1px solid #e2e8f0; display: flex; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.04); }
        .ff-tool-form { flex: 1; padding: 2.5rem; }
        .ff-tool-result { width: 380px; background: #1e293b; color: white; padding: 2.5rem; display: flex; flex-direction: column; justify-content: center; }
        
        .ff-form-group { margin-bottom: 1.5rem; }
        .ff-label { display: block; font-size: 0.9rem; font-weight: 700; color: #334155; margin-bottom: 0.5rem; }
        .ff-input, .ff-select { width: 100%; border: 1px solid #cbd5e1; border-radius: 10px; padding: 0.75rem 1rem; font-size: 1rem; font-family: inherit; color: #0f172a; transition: all 0.2s; outline: none; }
        .ff-input:focus, .ff-select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        
        .ff-res-title { font-size: 1rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; margin: 0 0 0.5rem; }
        .ff-res-value { font-size: 2.8rem; font-weight: 800; color: #fff; margin: 0 0 1.5rem; line-height: 1.1; }
        .ff-res-breakdown { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem; }
        .ff-res-row { display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.95rem; }
        .ff-res-row span:first-child { color: #94a3b8; }
        .ff-res-row span:last-child { font-weight: 700; }
        .ff-btn-primary { background: #3b82f6; color: white; border: none; padding: 1rem; border-radius: 10px; font-weight: 700; font-size: 1rem; width: 100%; cursor: pointer; transition: all 0.2s; margin-top: 1rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .ff-btn-primary:hover { background: #2563eb; transform: translateY(-2px); }

        /* ── Subsidies List ── */
        .ff-sub-grid { display: grid; gap: 1rem; }
        .ff-sub-card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 1.5rem; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s; }
        .ff-sub-card:hover { border-color: #10b981; box-shadow: 0 4px 20px rgba(16,185,129,0.05); transform: translateX(4px); }
        .ff-sub-info h3 { margin: 0 0 0.25rem; font-size: 1.15rem; color: #0f172a; display: flex; align-items: center; gap: 0.5rem; }
        .ff-sub-info p { margin: 0; color: #64748b; font-size: 0.9rem; }
        .ff-sub-badge { font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 999px; }
        .ff-sub-badge.apply { background: #eff6ff; color: #3b82f6; border: 1px solid #bfdbfe; cursor: pointer; }
        .ff-sub-badge.active { background: #f0fdf4; color: #10b981; border: 1px solid #bbf7d0; }
        .ff-sub-badge.pending { background: #fffbeb; color: #f59e0b; border: 1px solid #fde68a; }
        .ff-sub-amount { font-weight: 800; color: #0f172a; text-align: right; }
        .ff-sub-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.75rem; }

        @media (max-width: 768px) {
          .ff-overview-grid { grid-template-columns: 1fr; }
          .ff-action-grid { grid-template-columns: 1fr; }
          .ff-tool-container { flex-direction: column; }
          .ff-tool-result { width: 100%; }
        }
      `}</style>

      {/* Hero */}
      <div className="ff-hero">
        <div className="ff-hero-inner">
          <div className="ff-hero-icon">
            <IndianRupee size={36} color="white" />
          </div>
          <div>
            <h1 className="ff-hero-title">Farm Finance</h1>
            <p className="ff-hero-sub">Manage loans, calculate eligibility, and apply for government subsidies.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="ff-tabs">
        <button className={`ff-tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>
          <Activity size={18} /> Overview
        </button>
        <button className={`ff-tab ${tab === 'kcc' ? 'active' : ''}`} onClick={() => setTab('kcc')}>
          <CreditCard size={18} /> KCC Limit
        </button>
        <button className={`ff-tab ${tab === 'emi' ? 'active' : ''}`} onClick={() => setTab('emi')}>
          <Calculator size={18} /> Loan EMI
        </button>
        <button className={`ff-tab ${tab === 'subsidies' ? 'active' : ''}`} onClick={() => setTab('subsidies')}>
          <Landmark size={18} /> Subsidies
        </button>
      </div>

      <div className="ff-content">
        
        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="animate-fade-in">
            <div className="ff-overview-grid">
              <div className="ff-card">
                <span className="ff-stat-label"><CreditCard size={16} /> KCC Available Limit</span>
                <div className="ff-stat-value">₹2,45,000</div>
                <div className="ff-stat-sub"><CheckCircle2 size={14} /> Account Active</div>
              </div>
              <div className="ff-card">
                <span className="ff-stat-label"><Landmark size={16} /> Active Loans</span>
                <div className="ff-stat-value">₹1,20,000</div>
                <div className="ff-stat-sub" style={{ color: '#f59e0b' }}><AlertCircle size={14} /> Tractor Loan - EMI ₹4,500/mo</div>
              </div>
              <div className="ff-card">
                <span className="ff-stat-label"><TrendingUp size={16} /> Credit Score (CIBIL)</span>
                <div className="ff-stat-value">765</div>
                <div className="ff-stat-sub"><TrendingUp size={14} /> Excellent</div>
              </div>
            </div>

            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0f172a' }}>Quick Actions</h2>
            <div className="ff-action-grid">
              <div className="ff-action-card" onClick={() => setTab('kcc')}>
                <div className="ff-ac-left">
                  <div className="ff-ac-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}><CreditCard size={24} /></div>
                  <div>
                    <h3 className="ff-ac-title">Apply for KCC Limit Increase</h3>
                    <p className="ff-ac-desc">Check your eligibility based on new crops.</p>
                  </div>
                </div>
                <ChevronRight size={20} color="#cbd5e1" />
              </div>
              <Link to="/crop-insurance" className="ff-action-card">
                <div className="ff-ac-left">
                  <div className="ff-ac-icon" style={{ background: '#f0fdf4', color: '#10b981' }}><ShieldCheck size={24} /></div>
                  <div>
                    <h3 className="ff-ac-title">Crop Insurance (PMFBY)</h3>
                    <p className="ff-ac-desc">Protect your yield from natural calamities.</p>
                  </div>
                </div>
                <ChevronRight size={20} color="#cbd5e1" />
              </Link>
              <div className="ff-action-card" onClick={() => setTab('subsidies')}>
                <div className="ff-ac-left">
                  <div className="ff-ac-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}><Landmark size={24} /></div>
                  <div>
                    <h3 className="ff-ac-title">Government Subsidies</h3>
                    <p className="ff-ac-desc">View and apply for active farming schemes.</p>
                  </div>
                </div>
                <ChevronRight size={20} color="#cbd5e1" />
              </div>
              <div className="ff-action-card" onClick={() => setTab('emi')}>
                <div className="ff-ac-left">
                  <div className="ff-ac-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}><Calculator size={24} /></div>
                  <div>
                    <h3 className="ff-ac-title">Loan EMI Calculator</h3>
                    <p className="ff-ac-desc">Plan your finances for equipment purchases.</p>
                  </div>
                </div>
                <ChevronRight size={20} color="#cbd5e1" />
              </div>
            </div>
          </div>
        )}

        {/* KCC CALCULATOR TAB */}
        {tab === 'kcc' && (
          <div className="ff-tool-container animate-fade-in">
            <div className="ff-tool-form">
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#0f172a' }}>KCC Eligibility Calculator</h2>
              <p style={{ color: '#64748b', marginBottom: '2rem' }}>Estimate your Kisan Credit Card limit based on the District Level Technical Committee (DLTC) Scale of Finance.</p>
              
              <div className="ff-form-group">
                <label className="ff-label">Select Primary Crop</label>
                <select className="ff-select" value={kccCrop} onChange={e => setKccCrop(e.target.value)}>
                  {Object.entries(SCALE_OF_FINANCE).map(([key, data]) => (
                    <option key={key} value={key}>{data.name} (Base: ₹{data.rate.toLocaleString()}/Acre)</option>
                  ))}
                </select>
              </div>
              
              <div className="ff-form-group">
                <label className="ff-label">Cultivable Area (in Acres)</label>
                <input 
                  type="number" 
                  className="ff-input" 
                  placeholder="e.g. 5" 
                  value={kccAcres} 
                  onChange={e => setKccAcres(e.target.value ? Number(e.target.value) : '')}
                  min="0"
                />
              </div>

              <button className="ff-btn-primary"><FileText size={18} /> Apply for New Limit</button>
            </div>
            <div className="ff-tool-result">
              <p className="ff-res-title">Estimated KCC Limit</p>
              <h3 className="ff-res-value">₹{calculateKCCLimit().toLocaleString()}</h3>
              
              <div className="ff-res-breakdown">
                <div className="ff-res-row">
                  <span>Crop Base Limit</span>
                  <span>₹{kccAcres ? (Number(kccAcres) * SCALE_OF_FINANCE[kccCrop].rate).toLocaleString() : 0}</span>
                </div>
                <div className="ff-res-row">
                  <span>Post-Harvest (10%)</span>
                  <span>₹{kccAcres ? (Number(kccAcres) * SCALE_OF_FINANCE[kccCrop].rate * 0.1).toLocaleString() : 0}</span>
                </div>
                <div className="ff-res-row">
                  <span>Farm Maintenance (20%)</span>
                  <span>₹{kccAcres ? (Number(kccAcres) * SCALE_OF_FINANCE[kccCrop].rate * 0.2).toLocaleString() : 0}</span>
                </div>
                <div className="ff-res-row" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed rgba(255,255,255,0.2)', color: '#34d399', fontSize: '1.1rem' }}>
                  <span>Eligible Limit</span>
                  <span>₹{calculateKCCLimit().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EMI CALCULATOR TAB */}
        {tab === 'emi' && (
          <div className="ff-tool-container animate-fade-in">
            <div className="ff-tool-form">
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#0f172a' }}>Agri Loan EMI Calculator</h2>
              <p style={{ color: '#64748b', marginBottom: '2rem' }}>Calculate monthly installments for tractor, equipment, or infrastructure loans.</p>
              
              <div className="ff-form-group">
                <label className="ff-label">Loan Amount (₹)</label>
                <input 
                  type="number" 
                  className="ff-input" 
                  value={loanAmount} 
                  onChange={e => setLoanAmount(e.target.value ? Number(e.target.value) : '')}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="ff-form-group">
                  <label className="ff-label">Interest Rate (% p.a.)</label>
                  <input 
                    type="number" 
                    className="ff-input" 
                    step="0.1"
                    value={interestRate} 
                    onChange={e => setInterestRate(e.target.value ? Number(e.target.value) : '')}
                  />
                </div>
                <div className="ff-form-group">
                  <label className="ff-label">Loan Tenure (Years)</label>
                  <input 
                    type="number" 
                    className="ff-input" 
                    value={loanTenure} 
                    onChange={e => setLoanTenure(e.target.value ? Number(e.target.value) : '')}
                  />
                </div>
              </div>
              
              <button className="ff-btn-primary" style={{ background: '#10b981' }}>Apply for Agri Loan</button>
            </div>
            
            {(() => {
              const res = calculateEMI();
              return (
                <div className="ff-tool-result" style={{ background: '#064e3b' }}>
                  <p className="ff-res-title" style={{ color: '#a7f3d0' }}>Monthly EMI</p>
                  <h3 className="ff-res-value">₹{res.emi.toLocaleString()}</h3>
                  
                  <div className="ff-res-breakdown">
                    <div className="ff-res-row">
                      <span style={{ color: '#a7f3d0' }}>Principal Amount</span>
                      <span>₹{Number(loanAmount || 0).toLocaleString()}</span>
                    </div>
                    <div className="ff-res-row">
                      <span style={{ color: '#a7f3d0' }}>Total Interest</span>
                      <span>₹{res.totalInterest.toLocaleString()}</span>
                    </div>
                    <div className="ff-res-row" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed rgba(255,255,255,0.2)', color: '#34d399', fontSize: '1.1rem' }}>
                      <span>Total Amount Payable</span>
                      <span>₹{res.totalPayment.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* SUBSIDIES TAB */}
        {tab === 'subsidies' && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#0f172a' }}>Available Government Subsidies</h2>
            <div className="ff-sub-grid">
              {SUBSIDIES.map(sub => (
                <div key={sub.id} className="ff-sub-card">
                  <div className="ff-sub-info">
                    <h3>
                      {sub.title} 
                      {sub.status === 'Active' && <CheckCircle2 size={16} color="#10b981" />}
                    </h3>
                    <p>{sub.desc}</p>
                  </div>
                  <div className="ff-sub-right">
                    <div className="ff-sub-amount">{sub.amount}</div>
                    <span className={`ff-sub-badge ${
                      sub.status === 'Active' ? 'active' : 
                      sub.status === 'Processing' ? 'pending' : 'apply'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
