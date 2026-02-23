import React, { useState } from 'react';
import api from '../services/api';
import { C } from '../services/constants';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { ok, data } = await api.login(email, password);
    setLoading(false);
    if (ok) onLogin(data.user);
    else setError(data.error || data.detail || 'Invalid credentials');
  };

  const demos = [
    { email: 'admin@cybersec.com', pass: 'admin123', role: 'Super Admin', icon: '⚡' },
    { email: 'legal@cybersec.com', pass: 'legal123', role: 'Legal', icon: '⚖️' },
    { email: 'hr@cybersec.com', pass: 'hr123', role: 'HR', icon: '👥' },
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 50%, #f0f0f5 100%)`,
      padding: 20,
    }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', width: 400, height: 400, borderRadius: '50%', background: 'rgba(0,200,83,0.06)', filter: 'blur(80px)', top: '-10%', right: '-5%' }} />
      <div style={{ position: 'fixed', width: 300, height: 300, borderRadius: '50%', background: 'rgba(0,122,255,0.04)', filter: 'blur(60px)', bottom: '-5%', left: '-3%' }} />

      <div style={{
        width: 400, background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(40px) saturate(180%)', WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        borderRadius: 24, padding: '40px 36px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        border: '1px solid rgba(255,255,255,0.5)',
        animation: 'scaleIn 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
        position: 'relative',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 14px',
            background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 8px 24px ${C.accentGlow}`,
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v5.5c0 5.6 3.8 10.7 9 12 5.2-1.3 9-6.4 9-12V7L12 2z" fill="rgba(255,255,255,0.3)" stroke="#fff" strokeWidth="1.5"/>
              <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.8, color: C.text, margin: 0 }}>Docs</h1>
          <p style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>Secure document signing platform</p>
        </div>

        <form onSubmit={submit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.sub, marginBottom: 6 }}>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required
              placeholder="you@company.com"
              onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
              style={{
                width: '100%', padding: '13px 16px', borderRadius: 12,
                border: `1.5px solid ${focused === 'email' ? C.accent : C.border}`,
                background: focused === 'email' ? '#fff' : '#fafafa',
                fontSize: 15, outline: 'none', color: C.text,
                boxShadow: focused === 'email' ? `0 0 0 3px ${C.accentSoft}` : 'none',
                transition: 'all 0.2s ease',
              }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.sub, marginBottom: 6 }}>Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" required
              placeholder="••••••••"
              onFocus={() => setFocused('pass')} onBlur={() => setFocused(null)}
              style={{
                width: '100%', padding: '13px 16px', borderRadius: 12,
                border: `1.5px solid ${focused === 'pass' ? C.accent : C.border}`,
                background: focused === 'pass' ? '#fff' : '#fafafa',
                fontSize: 15, outline: 'none', color: C.text,
                boxShadow: focused === 'pass' ? `0 0 0 3px ${C.accentSoft}` : 'none',
                transition: 'all 0.2s ease',
              }} />
          </div>

          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 10, marginBottom: 14,
              background: 'rgba(255,59,48,0.06)', color: C.red,
              fontSize: 13, fontWeight: 500, textAlign: 'center',
            }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', borderRadius: 14, border: 'none',
            background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`,
            color: '#fff', fontSize: 16, fontWeight: 700, letterSpacing: -0.3,
            cursor: loading ? 'wait' : 'pointer',
            boxShadow: `0 4px 16px ${C.accentGlow}`,
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.25s ease',
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo accounts */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, color: C.muted, textAlign: 'center', marginBottom: 12, fontWeight: 500, letterSpacing: 0.5, textTransform: 'uppercase' }}>Demo Accounts</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {demos.map(d => (
              <button key={d.email} onClick={() => { setEmail(d.email); setPassword(d.pass); }}
                style={{
                  flex: 1, padding: '10px 4px', borderRadius: 10, border: `1px solid ${C.border}`,
                  background: 'rgba(0,0,0,0.015)', cursor: 'pointer',
                  fontSize: 11, color: C.sub, fontWeight: 500, textAlign: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.target.style.background = 'rgba(0,0,0,0.04)'; e.target.style.borderColor = 'rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.target.style.background = 'rgba(0,0,0,0.015)'; e.target.style.borderColor = C.border; }}
              >{d.icon} {d.role}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
