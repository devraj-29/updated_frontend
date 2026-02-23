import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { C } from '../services/constants';

export default function NotFoundPage() {
  const nav = useNavigate();
  const loc = useLocation();

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f5f7, #e8e8ed, #f0f0f5)', padding: 20,
    }}>
      <div style={{ position: 'fixed', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,59,48,0.03)', filter: 'blur(80px)', top: '10%', left: '20%' }} />
      <div style={{ position: 'fixed', width: 300, height: 300, borderRadius: '50%', background: 'rgba(0,200,83,0.04)', filter: 'blur(60px)', bottom: '10%', right: '15%' }} />

      <div style={{
        textAlign: 'center', position: 'relative', maxWidth: 500,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(40px) saturate(180%)', WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        borderRadius: 28, padding: '60px 48px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.5)',
        animation: 'scaleIn 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
      }}>
        {/* Shield icon */}
        <div style={{
          width: 80, height: 80, borderRadius: 24, margin: '0 auto 24px',
          background: 'linear-gradient(135deg, rgba(255,59,48,0.08), rgba(255,149,0,0.06))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7v5.5c0 5.6 3.8 10.7 9 12 5.2-1.3 9-6.4 9-12V7L12 2z" fill="rgba(255,59,48,0.1)" stroke="#FF3B30" strokeWidth="1.5"/>
            <path d="M15 9l-6 6M9 9l6 6" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        <div style={{ fontSize: 72, fontWeight: 900, letterSpacing: -4, color: C.text, lineHeight: 1, marginBottom: 8,
          background: 'linear-gradient(135deg, #1d1d1f, #424245)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>404</div>

        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: -0.5, margin: '0 0 8px' }}>Page Not Found</h2>
        <p style={{ fontSize: 15, color: C.muted, margin: '0 0 8px', lineHeight: 1.6 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <p style={{ fontSize: 12, color: C.light, fontFamily: "'JetBrains Mono', monospace", marginBottom: 28 }}>
          {loc.pathname}
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={() => nav(-1)} style={{
            padding: '13px 28px', borderRadius: 14, border: `1px solid ${C.border}`,
            background: 'transparent', color: C.sub, fontSize: 15, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s',
          }}>← Go Back</button>
          <button onClick={() => nav('/')} style={{
            padding: '13px 28px', borderRadius: 14, border: 'none',
            background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`,
            color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            boxShadow: `0 4px 16px ${C.accentGlow}`, transition: 'all 0.25s',
          }}>Dashboard</button>
        </div>

        <div style={{ marginTop: 32, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12, color: C.muted }}>
            🛡️ Pinak Docs · Secure Document Signing Platform
          </div>
        </div>
      </div>
    </div>
  );
}
