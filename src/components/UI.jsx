import React, { useState, useEffect } from 'react';
import { C } from '../services/constants';

/* ── Glass Card ── */
export function Glass({ children, style, hover, onClick, ...props }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered && hover ? 'rgba(255,255,255,0.88)' : C.card,
        backdropFilter: C.blur,
        WebkitBackdropFilter: C.blur,
        border: `1px solid ${hovered && hover ? 'rgba(0,0,0,0.08)' : C.border}`,
        borderRadius: C.rLg,
        boxShadow: hovered && hover ? C.shadowLg : C.shadow,
        transition: 'all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

/* ── Badge ── */
export function Badge({ children, color = C.accent, size = 'md', style }) {
  const sizes = { sm: { p: '2px 8px', fs: 10 }, md: { p: '4px 12px', fs: 11 }, lg: { p: '6px 16px', fs: 12 } };
  const s = sizes[size] || sizes.md;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: s.p, borderRadius: 20,
      fontSize: s.fs, fontWeight: 600, letterSpacing: -0.1,
      color: color, background: color + '14',
      ...style,
    }}>{children}</span>
  );
}

/* ── Button ── */
export function Btn({ children, primary, danger, small, ghost, disabled, style, ...props }) {
  const [hover, setHover] = useState(false);
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: small ? '8px 16px' : '12px 24px',
    borderRadius: small ? C.rSm : 14,
    fontSize: small ? 13 : 15, fontWeight: 600, letterSpacing: -0.2,
    border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.25s cubic-bezier(0.25,0.46,0.45,0.94)',
    opacity: disabled ? 0.4 : 1,
    transform: hover && !disabled ? 'scale(1.02)' : 'scale(1)',
  };
  if (primary) Object.assign(base, {
    background: hover ? '#00B848' : `linear-gradient(135deg, ${C.accent}, ${C.accent2})`,
    color: '#fff', boxShadow: hover ? '0 4px 16px rgba(0,200,83,0.3)' : '0 2px 8px rgba(0,200,83,0.2)',
  });
  else if (danger) Object.assign(base, {
    background: hover ? '#FF2D20' : C.red, color: '#fff',
    boxShadow: hover ? '0 4px 16px rgba(255,59,48,0.3)' : 'none',
  });
  else if (ghost) Object.assign(base, {
    background: 'transparent', color: hover ? C.text : C.sub, padding: small ? '6px 10px' : '10px 16px',
  });
  else Object.assign(base, {
    background: hover ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.03)',
    color: C.text, border: `1px solid ${C.border}`,
  });
  return (
    <button
      disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ ...base, ...style }} {...props}
    >{children}</button>
  );
}

/* ── Stat Card ── */
export function Stat({ label, value, icon, color = C.accent, trend, style }) {
  return (
    <Glass style={{ padding: '20px 22px', ...style }} hover>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 13, color: C.muted, fontWeight: 500, marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1.5, color: C.text, lineHeight: 1 }}>{value}</div>
          {trend && <div style={{ fontSize: 12, color: trend > 0 ? C.green : C.red, marginTop: 6, fontWeight: 500 }}>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%</div>}
        </div>
        {icon && (
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: `linear-gradient(135deg, ${color}20, ${color}08)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>{icon}</div>
        )}
      </div>
    </Glass>
  );
}

/* ── Progress Bar ── */
export function Bar({ value = 0, color = C.accent, label, height = 6, style }) {
  return (
    <div style={style}>
      {label && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
        <span style={{ color: C.sub, fontWeight: 500 }}>{label}</span>
        <span style={{ color: C.muted, fontWeight: 600 }}>{Math.round(value)}%</span>
      </div>}
      <div style={{ height, borderRadius: height, background: 'rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: height,
          width: `${Math.min(100, value)}%`,
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          transition: 'width 0.8s cubic-bezier(0.25,0.46,0.45,0.94)',
        }} />
      </div>
    </div>
  );
}

/* ── Input ── */
export function Input({ label, error, style, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14, ...style }}>
      {label && <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.sub, marginBottom: 6, letterSpacing: -0.1 }}>{label}</label>}
      <input
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '11px 14px', borderRadius: C.rSm,
          border: `1.5px solid ${focused ? C.accent : error ? C.red : C.border}`,
          background: focused ? '#fff' : C.bg2,
          color: C.text, fontSize: 14, outline: 'none',
          transition: 'all 0.2s ease',
          boxShadow: focused ? `0 0 0 3px ${C.accentSoft}` : 'none',
        }}
        {...props}
      />
      {error && <div style={{ fontSize: 12, color: C.red, marginTop: 4 }}>{error}</div>}
    </div>
  );
}

/* ── Select ── */
export function Select({ label, options = [], style, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14, ...style }}>
      {label && <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.sub, marginBottom: 6 }}>{label}</label>}
      <select
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '11px 14px', borderRadius: C.rSm,
          border: `1.5px solid ${focused ? C.accent : C.border}`,
          background: focused ? '#fff' : C.bg2,
          color: C.text, fontSize: 14, outline: 'none',
          appearance: 'none', cursor: 'pointer',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%2386868b' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
          transition: 'all 0.2s ease',
          boxShadow: focused ? `0 0 0 3px ${C.accentSoft}` : 'none',
        }}
        {...props}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

/* ── TextArea ── */
export function TextArea({ label, style, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14, ...style }}>
      {label && <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.sub, marginBottom: 6 }}>{label}</label>}
      <textarea
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        rows={3}
        style={{
          width: '100%', padding: '11px 14px', borderRadius: C.rSm,
          border: `1.5px solid ${focused ? C.accent : C.border}`,
          background: focused ? '#fff' : C.bg2,
          color: C.text, fontSize: 14, outline: 'none', resize: 'vertical',
          transition: 'all 0.2s ease',
          boxShadow: focused ? `0 0 0 3px ${C.accentSoft}` : 'none',
        }}
        {...props}
      />
    </div>
  );
}

/* ── Modal ── */
export function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} />
      <div style={{
        position: 'relative', width: wide ? 680 : 480, maxHeight: '85vh', overflow: 'auto',
        background: '#fff', borderRadius: C.rLg, padding: 28,
        boxShadow: C.shadowXl, animation: 'scaleIn 0.25s cubic-bezier(0.25,0.46,0.45,0.94)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5, color: C.text, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '50%', border: 'none',
            background: 'rgba(0,0,0,0.05)', cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted,
            transition: 'all 0.2s',
          }} onMouseEnter={e => e.target.style.background = 'rgba(0,0,0,0.1)'}
             onMouseLeave={e => e.target.style.background = 'rgba(0,0,0,0.05)'}
          >✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── Table ── */
export function Table({ columns = [], data = [], onRowClick }) {
  return (
    <Glass style={{ overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} style={{
                  padding: '14px 18px', textAlign: 'left', fontSize: 11,
                  fontWeight: 600, color: C.muted, textTransform: 'uppercase',
                  letterSpacing: 0.5, borderBottom: `1px solid ${C.border}`,
                  background: 'rgba(0,0,0,0.015)',
                }}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr><td colSpan={columns.length} style={{ padding: 50, textAlign: 'center', color: C.muted, fontSize: 14 }}>No data found</td></tr>
            )}
            {data.map((row, i) => (
              <tr key={row.id || i}
                onClick={() => onRowClick?.(row)}
                style={{ cursor: onRowClick ? 'pointer' : 'default', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {columns.map(col => (
                  <td key={col.key} style={{
                    padding: '14px 18px', fontSize: 14, color: C.text,
                    borderBottom: `1px solid ${C.border}`,
                  }}>{col.render ? col.render(row) : row[col.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Glass>
  );
}

/* ── Tabs ── */
export function Tabs({ tabs = [], active, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 4, marginBottom: 18,
      background: 'rgba(0,0,0,0.03)', borderRadius: C.r,
      padding: 4, overflowX: 'auto',
    }}>
      {tabs.map(t => {
        const isActive = active === t.value;
        return (
          <button key={t.value} onClick={() => onChange(t.value)}
            style={{
              padding: '9px 18px', borderRadius: 12, border: 'none',
              fontSize: 13, fontWeight: isActive ? 600 : 500,
              color: isActive ? C.text : C.muted,
              background: isActive ? '#fff' : 'transparent',
              boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'all 0.25s cubic-bezier(0.25,0.46,0.45,0.94)',
            }}
          >{t.label}</button>
        );
      })}
    </div>
  );
}

/* ── Page Header ── */
export function PageHeader({ title, subtitle, children }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      marginBottom: 24, animation: 'fadeIn 0.4s ease',
    }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, color: C.text, margin: 0, lineHeight: 1.2 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 15, color: C.muted, marginTop: 4, fontWeight: 400 }}>{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{children}</div>
    </div>
  );
}

/* ── Loading ── */
export function Loading() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: `3px solid ${C.border}`, borderTopColor: C.accent,
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ── Toast ── */
export function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (message) {
      const t = setTimeout(onClose, 3500);
      return () => clearTimeout(t);
    }
  }, [message, onClose]);
  if (!message) return null;
  const colors = { success: C.green, error: C.red, info: C.blue };
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const clr = colors[type] || C.green;
  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 2000,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '14px 22px', borderRadius: 14,
      background: '#fff', border: `1px solid ${clr}20`,
      boxShadow: `0 8px 32px rgba(0,0,0,0.1), 0 0 0 1px ${clr}20`,
      animation: 'slideIn 0.3s cubic-bezier(0.25,0.46,0.45,0.94)',
      backdropFilter: C.blur, WebkitBackdropFilter: C.blur,
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%', background: clr + '15',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: clr, fontSize: 12, fontWeight: 700,
      }}>{icons[type]}</div>
      <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{message}</span>
    </div>
  );
}

/* ── Empty State ── */
export function Empty({ icon = '📋', title, subtitle }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', animation: 'fadeIn 0.4s ease' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: -0.3 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>{subtitle}</div>}
    </div>
  );
}
