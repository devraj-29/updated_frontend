import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { C, ROLES } from '../services/constants';
import Logo from '../assets/logo.svg';

const NAV = [
  { path: '/',            icon: '◉', label: 'Dashboard' },
  { path: '/ndas',        icon: '◈', label: 'NDA Templates' },
  { path: '/people',      icon: '◎', label: 'People' },
  { path: '/assignments', icon: '◇', label: 'Assignments' },
  { path: '/documents',   icon: '◆', label: 'Documents' },
  { path: '/audit',       icon: '◈', label: 'Audit Log' },
  { path: '/settings',    icon: '⚙', label: 'Settings' },
];

export default function Sidebar({ user, onLogout }) {
  const loc = useLocation();
  const nav = useNavigate();
  const role = ROLES[user?.role] || {};

  return (
    <div style={{
      width: 240, height: '100vh', position: 'sticky', top: 0,
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      borderRight: `1px solid ${C.border}`,
      display: 'flex', flexDirection: 'column',
      padding: '20px 12px',
      transition: 'all 0.3s ease',
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '4px 10px', marginBottom: 24,
      }}>
        <div style={{
          width: 170, height: 10, borderRadius: 10, 
          margin: 0, padding: 0,  
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          // background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`,
          // display: 'flex', alignItems: 'center', justifyContent: 'center',
          // boxShadow: `0 4px 12px ${C.accentGlow}`,
        }}>
          <img src={Logo}/>
        </div>
        {/* <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.text, letterSpacing: -0.5, lineHeight: 1.1 }}>NDA Shield</div>
          <div style={{ fontSize: 10, color: C.muted, letterSpacing: 0.5, fontWeight: 500 }}>SECURE · VERIFIED</div>
        </div> */}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1 }}>
        {NAV.map(item => {
          const active = loc.pathname === item.path;
          return (
            <NavItem key={item.path} active={active} onClick={() => nav(item.path)}
              icon={item.icon} label={item.label} />
          );
        })}
      </nav>

      {/* User Card */}
      <div style={{
        background: 'rgba(0,0,0,0.025)', borderRadius: 14,
        padding: '14px 12px', marginTop: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: `linear-gradient(135deg, ${role.color || C.accent}30, ${role.color || C.accent}10)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: role.color || C.accent,
          }}>{user?.full_name?.[0]?.toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name}</div>
            <div style={{ fontSize: 11, color: role.color || C.muted, fontWeight: 500 }}>{role.icon} {role.label}</div>
          </div>
        </div>
        <button onClick={onLogout} style={{
          width: '100%', padding: '8px 0', borderRadius: 8, border: 'none',
          background: 'rgba(255,59,48,0.06)', color: C.red,
          fontSize: 12, fontWeight: 600, cursor: 'pointer',
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => e.target.style.background = 'rgba(255,59,48,0.12)'}
          onMouseLeave={e => e.target.style.background = 'rgba(255,59,48,0.06)'}
        >Sign Out</button>
      </div>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
        padding: '10px 12px', marginBottom: 2, borderRadius: 12, border: 'none',
        fontSize: 14, fontWeight: active ? 600 : 500,
        color: active ? C.accent : hover ? C.text : C.sub,
        background: active ? C.accentSoft : hover ? 'rgba(0,0,0,0.03)' : 'transparent',
        cursor: 'pointer', textAlign: 'left',
        transition: 'all 0.2s cubic-bezier(0.25,0.46,0.45,0.94)',
      }}
    >
      <span style={{ fontSize: 15, opacity: active ? 1 : 0.6 }}>{icon}</span>
      {label}
    </button>
  );
}
