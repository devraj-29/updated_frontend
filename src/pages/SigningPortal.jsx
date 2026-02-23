import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { C } from '../services/constants';
import Logo from '../assets/logo.svg';

export default function SigningPortal() {
  const { token } = useParams();
  const [nda, setNda] = useState(null);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [phase, setPhase] = useState('loading'); // loading | view | sign | done | dead
  const [hasRead, setHasRead] = useState(false);
  const [canSign, setCanSign] = useState(false);
  const [consent, setConsent] = useState(false);
  const [nameConfirm, setNameConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [scrollPct, setScrollPct] = useState(0);
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/documents/portal/${token}/`)
      .then(r => r.json().then(d => ({ ok: r.ok, status: r.status, data: d })))
      .then(({ ok, status, data }) => {
        if (ok) {
          setNda(data);
          setHasRead(data.has_read || data.status === 'read');
          setCanSign(data.can_sign || data.status === 'read');
          setPhase('view');
        } else {
          setError(data.error || 'Cannot load NDA.');
          setErrorCode(data.code || '');
          setPhase(status === 410 ? 'dead' : 'dead');
        }
      })
      .catch(() => { setError('Network error. Please check your connection.'); setPhase('dead'); });
  }, [token]);

  // Canvas setup for signature
  useEffect(() => {
    if (phase !== 'sign') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 440; canvas.height = 140;
    ctx.fillStyle = '#fafafa'; ctx.fillRect(0, 0, 440, 140);
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    const getPos = (e) => { const r = canvas.getBoundingClientRect(); const cx = e.touches ? e.touches[0].clientX : e.clientX; const cy = e.touches ? e.touches[0].clientY : e.clientY; return { x: cx - r.left, y: cy - r.top }; };
    const start = (e) => { e.preventDefault(); drawingRef.current = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
    const draw = (e) => { if (!drawingRef.current) return; e.preventDefault(); const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); };
    const end = () => { drawingRef.current = false; };
    canvas.addEventListener('mousedown', start); canvas.addEventListener('mousemove', draw); canvas.addEventListener('mouseup', end); canvas.addEventListener('mouseleave', end);
    canvas.addEventListener('touchstart', start, { passive: false }); canvas.addEventListener('touchmove', draw, { passive: false }); canvas.addEventListener('touchend', end);
    return () => { canvas.removeEventListener('mousedown', start); canvas.removeEventListener('mousemove', draw); canvas.removeEventListener('mouseup', end); canvas.removeEventListener('mouseleave', end); canvas.removeEventListener('touchstart', start); canvas.removeEventListener('touchmove', draw); canvas.removeEventListener('touchend', end); };
  }, [phase]);

  const markRead = async () => {
    const r = await fetch(`/api/documents/portal/${token}/read/`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    const d = await r.json();
    if (r.ok) { setHasRead(true); setCanSign(true); }
  };

  const clearSig = () => { const c = canvasRef.current; if (!c) return; const ctx = c.getContext('2d'); ctx.fillStyle = '#fafafa'; ctx.fillRect(0, 0, 440, 140); };

  const handleSign = async () => {
    setSubmitting(true); setError('');
    const sig = canvasRef.current?.toDataURL('image/png') || '';
    const txt = `I, ${nameConfirm}, acknowledge that I have read and agree to "${nda.nda_name}" (v${nda.nda_version}).`;
    const res = await fetch(`/api/documents/portal/${token}/sign/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signature_image_base64: sig, consent_text: txt, signer_name_confirmation: nameConfirm }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (res.ok) { setResult(data); setPhase('done'); }
    else if (data.code === 'NOT_READ') { setError(data.message); setPhase('view'); }
    else setError(data.error || 'Signing failed.');
  };

  const handleDecline = async () => {
    const reason = prompt('Reason for declining (optional):');
    if (reason === null) return;
    await fetch(`/api/documents/portal/${token}/decline/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: reason || '' }),
    });
    setPhase('dead'); setError('You have declined this NDA. The sender has been notified.');
    setErrorCode('DECLINED');
  };

  const handleScroll = (e) => {
    const el = e.target;
    const pct = Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
    setScrollPct(pct);
    if (pct >= 95 && !hasRead) markRead();
  };

  // ── LOADING ──
  if (phase === 'loading') return <Wrap><div style={{ textAlign: 'center', padding: 60 }}><Spinner /><div style={{ marginTop: 16, color: C.muted }}>Loading NDA...</div></div></Wrap>;

  // ── LINK DEAD / EXPIRED / SIGNED / REVOKED ──
  if (phase === 'dead') {
    const icons = { ALREADY_SIGNED: '✅', EXPIRED: '⏰', REVOKED: '🚫', DECLINED: '✕' };
    const titles = { ALREADY_SIGNED: 'Already Signed', EXPIRED: 'Link Expired', REVOKED: 'Access Revoked', DECLINED: 'NDA Declined' };
    return (
      <Wrap>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24, margin: '0 auto 20px',
            background: errorCode === 'ALREADY_SIGNED' ? 'rgba(52,199,89,0.08)' : 'rgba(255,59,48,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38,
          }}>{icons[errorCode] || '⚠️'}</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, color: C.text, margin: '0 0 8px' }}>
            {titles[errorCode] || 'Page No Longer Available'}
          </h2>
          <p style={{ fontSize: 15, color: C.muted, margin: 0, lineHeight: 1.7, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto' }}>
            {error || 'This signing link is no longer active.'}
          </p>
          <div style={{ marginTop: 28, padding: '16px 20px', background: 'rgba(0,0,0,0.02)', borderRadius: 14, fontSize: 13, color: C.muted }}>
            🔐 For security, each signing link can only be used once.<br/>
            If you need a new link, please contact the sender.
          </div>
        </div>
      </Wrap>
    );
  }

  // ── SIGNED CONFIRMATION ──
  if (phase === 'done') return (
    <Wrap>
      <div style={{ textAlign: 'center', padding: '30px 10px' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(52,199,89,0.1)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38 }}>✅</div>
        <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, color: C.text, margin: '0 0 6px' }}>Successfully Signed</h2>
        <p style={{ fontSize: 14, color: C.muted, margin: '0 0 28px' }}>A confirmation email has been sent to your inbox.</p>
        <div style={{ background: C.bg, borderRadius: 16, padding: 24, display: 'inline-block', textAlign: 'left' }}>
          <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Confirmation ID</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.accent, fontFamily: "monospace", letterSpacing: -0.5 }}>{result?.confirmation_id}</div>
          <div style={{ height: 1, background: C.border, margin: '14px 0' }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{result?.nda_name}</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Signed by {result?.signer_name}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{result?.signed_at?.replace('T', ' ').slice(0, 19)}</div>
        </div>
        <div style={{ marginTop: 24, padding: '14px 18px', background: 'rgba(0,200,83,0.05)', borderRadius: 12, fontSize: 12, color: '#4a7c5f' }}>
          🔒 This link is now permanently deactivated. Your signature is cryptographically secured.
        </div>
      </div>
    </Wrap>
  );

  // ── SIGN PHASE ──
  if (phase === 'sign') return (
    <Wrap>
      <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, color: C.text, margin: '0 0 4px' }}>Sign: {nda.nda_name}</h2>
      <p style={{ fontSize: 13, color: C.muted, margin: '0 0 24px' }}>v{nda.nda_version} · {nda.company_name}</p>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: C.sub, display: 'block', marginBottom: 8 }}>Draw Your Signature</label>
        <canvas ref={canvasRef} style={{ border: `2px solid ${C.border}`, borderRadius: 14, cursor: 'crosshair', display: 'block', width: 440, height: 140, background: '#fafafa' }} />
        <button onClick={clearSig} style={{ marginTop: 6, padding: '6px 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontSize: 12, cursor: 'pointer' }}>Clear</button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: C.sub, display: 'block', marginBottom: 6 }}>Type Your Full Legal Name</label>
        <input value={nameConfirm} onChange={e => setNameConfirm(e.target.value)} placeholder={nda.signer_name}
          style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: '#fafafa', color: C.text, fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
      </div>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 24, padding: '14px 16px', background: C.accentSoft, borderRadius: 14 }}>
        <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: 3, accentColor: C.accent }} />
        <span style={{ fontSize: 13, color: C.sub, lineHeight: 1.6 }}>
          I, <strong style={{ color: C.text }}>{nameConfirm || nda.signer_name}</strong>, hereby confirm that I have <strong>read the entire NDA</strong>, understood its terms, and agree to be legally bound by this Non-Disclosure Agreement.
        </span>
      </label>

      {error && <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,59,48,0.06)', color: C.red, fontSize: 13, marginBottom: 14 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => { setPhase('view'); setError(''); }} style={{ padding: '14px 24px', borderRadius: 14, border: `1px solid ${C.border}`, background: 'transparent', color: C.sub, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>← Back</button>
        <button onClick={handleSign} disabled={submitting || !consent || !nameConfirm} style={{
          flex: 1, padding: '14px', borderRadius: 14, border: 'none',
          background: submitting || !consent || !nameConfirm ? '#ccc' : `linear-gradient(135deg, ${C.accent}, ${C.accent2})`,
          color: '#fff', fontSize: 16, fontWeight: 700, cursor: submitting ? 'wait' : 'pointer',
          boxShadow: consent && nameConfirm ? `0 4px 16px ${C.accentGlow}` : 'none',
          transition: 'all 0.25s',
        }}>{submitting ? 'Signing...' : '✍️ Sign NDA'}</button>
      </div>
    </Wrap>
  );

  // ── VIEW PHASE — A4 Reader with Read Progress ──
  return (
    <Wrap>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, color: C.text, margin: 0 }}>{nda.nda_name}</h2>
          <p style={{ fontSize: 13, color: C.muted, margin: '4px 0 0' }}>v{nda.nda_version} · {nda.nda_category} · {nda.company_name}</p>
          {nda.assigned_by && <p style={{ fontSize: 12, color: C.sub, margin: '2px 0 0' }}>Assigned by: {nda.assigned_by}</p>}
        </div>
        <div style={{ textAlign: 'right', background: '#fafafa', borderRadius: 12, padding: '10px 14px' }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>Signer</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{nda.signer_name}</div>
          <div style={{ fontSize: 12, color: C.muted }}>{nda.signer_email}</div>
        </div>
      </div>

      {nda.message && (
        <div style={{ background: 'rgba(255,204,0,0.08)', borderLeft: `3px solid ${C.yellow}`, borderRadius: '0 12px 12px 0', padding: '12px 16px', marginBottom: 12, fontSize: 13, color: '#5D4037', fontStyle: 'italic' }}>💬 "{nda.message}"</div>
      )}

      {nda.expires_at && (
        <div style={{ fontSize: 12, color: C.orange, marginBottom: 12, padding: '8px 12px', background: 'rgba(255,149,0,0.06)', borderRadius: 10, fontWeight: 500 }}>⏰ Link expires: {new Date(nda.expires_at).toLocaleString()}</div>
      )}

      {/* Reading progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${scrollPct}%`, background: hasRead ? C.green : C.blue, borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontSize: 11, color: C.muted, fontWeight: 600, minWidth: 60, textAlign: 'right' }}>
          {hasRead ? '✅ Read' : `${scrollPct}% read`}
        </span>
      </div>

      {/* A4 NDA Document */}
      <div onScroll={handleScroll} style={{
        background: '#fff', border: `1px solid ${C.border}`, borderRadius: 4,
        padding: '50px 56px', marginBottom: 16, maxHeight: 420, overflowY: 'auto',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        fontFamily: "'Times New Roman', Georgia, serif",
        fontSize: 14, lineHeight: 1.9, color: '#222',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24, borderBottom: '2px solid #333', paddingBottom: 14 }}>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Non-Disclosure Agreement</div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{nda.nda_name} · Version {nda.nda_version}</div>
        </div>
        {nda.content_html ? (
          <div dangerouslySetInnerHTML={{ __html: nda.content_html }} />
        ) : (
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{nda.content_plain || 'No content'}</pre>
        )}
      </div>

      {!hasRead && (
        <div style={{ padding: '12px 16px', background: 'rgba(255,149,0,0.06)', borderRadius: 12, marginBottom: 12, fontSize: 13, color: C.orange, fontWeight: 500, textAlign: 'center' }}>
          ⬇️ Please scroll through the entire document to continue. You must read the full NDA before signing.
        </div>
      )}

      <div style={{ padding: '12px 16px', background: 'rgba(0,200,83,0.04)', borderRadius: 12, marginBottom: 16, fontSize: 12, color: '#4a7c5f', display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 16 }}>🔐</span>
        <span>This is a <strong>secure, one-time link</strong> unique to you. After signing, this link will be permanently deactivated.</span>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={handleDecline} style={{ padding: '14px 24px', borderRadius: 14, border: 'none', background: 'rgba(255,59,48,0.06)', color: C.red, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>✕ Decline</button>
        <button onClick={() => { if (!canSign) { setError('Please read the entire NDA first.'); return; } setPhase('sign'); setError(''); }} disabled={!hasRead}
          style={{
            flex: 1, padding: '14px', borderRadius: 14, border: 'none',
            background: hasRead ? `linear-gradient(135deg, ${C.accent}, ${C.accent2})` : '#ccc',
            color: '#fff', fontSize: 16, fontWeight: 700,
            cursor: hasRead ? 'pointer' : 'not-allowed',
            boxShadow: hasRead ? `0 4px 16px ${C.accentGlow}` : 'none',
            opacity: hasRead ? 1 : 0.5,
            transition: 'all 0.3s',
          }}>
          {hasRead ? 'Proceed to Sign →' : '📖 Read NDA First'}
        </button>
      </div>
    </Wrap>
  );
}

function Wrap({ children }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f5f7, #e8e8ed, #f0f0f5)', padding: 20,
    }}>
      <div style={{ position: 'fixed', width: 300, height: 300, borderRadius: '50%', background: 'rgba(0,200,83,0.05)', filter: 'blur(60px)', top: '-5%', right: '-3%' }} />
      
      <div style={{
        width: 600, background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(40px) saturate(180%)', WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        borderRadius: 24, padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
        border: '1px solid rgba(255,255,255,0.5)', position: 'relative',
      }}>
         <div style={{textAlign:'center'}} >
                <img src={Logo} style={{
                width: 180, height: 100, 
              }}/>
              </div>
        {children}
      </div>
    </div>
  );
}

function Spinner() {
  return <>
    <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid rgba(0,0,0,0.06)`, borderTopColor: C.accent, animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </>;
}
