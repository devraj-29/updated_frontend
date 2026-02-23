// Apple-inspired liquid glass color system
export const C = {
  // Core
  bg: '#f5f5f7',
  bg2: '#fafafa',
  surface: 'rgba(255,255,255,0.72)',
  card: 'rgba(255,255,255,0.82)',
  glass: 'rgba(255,255,255,0.6)',

  // Text
  text: '#1d1d1f',
  sub: '#424245',
  muted: '#86868b',
  light: '#aeaeb2',

  // Accent
  accent: '#00C853',
  accent2: '#34C759',
  accentSoft: 'rgba(0,200,83,0.1)',
  accentGlow: 'rgba(0,200,83,0.25)',

  // Semantic
  blue: '#007AFF',
  indigo: '#5856D6',
  purple: '#AF52DE',
  pink: '#FF2D55',
  red: '#FF3B30',
  orange: '#FF9500',
  yellow: '#FFCC00',
  green: '#34C759',
  teal: '#5AC8FA',
  mint: '#00C7BE',

  // Structure
  border: 'rgba(0,0,0,0.06)',
  borderL: 'rgba(0,0,0,0.1)',
  shadow: '0 2px 20px rgba(0,0,0,0.04)',
  shadowLg: '0 8px 40px rgba(0,0,0,0.08)',
  shadowXl: '0 20px 60px rgba(0,0,0,0.1)',
  blur: 'blur(20px)',
  blurHeavy: 'blur(40px)',

  // Radius
  r: 16,
  rLg: 22,
  rSm: 10,
  rXs: 8,
};

export const SC = {
  draft:    { color: C.muted,  bg: 'rgba(142,142,147,0.1)',  label: 'Draft' },
  sent:     { color: C.blue,   bg: 'rgba(0,122,255,0.1)',    label: 'Sent' },
  viewed:   { color: C.indigo, bg: 'rgba(88,86,214,0.1)',    label: 'Viewed' },
  read:     { color: C.purple, bg: 'rgba(175,82,222,0.1)',   label: 'Read' },
  signed:   { color: C.green,  bg: 'rgba(52,199,89,0.1)',    label: 'Signed' },
  declined: { color: C.red,    bg: 'rgba(255,59,48,0.1)',    label: 'Declined' },
  expired:  { color: C.orange, bg: 'rgba(255,149,0,0.1)',    label: 'Expired' },
  revoked:  { color: C.pink,   bg: 'rgba(255,45,85,0.1)',    label: 'Revoked' },
};

export const ROLES = {
  super_admin: { label: 'Super Admin', color: C.accent, icon: '⚡' },
  legal:       { label: 'Legal',       color: C.blue,   icon: '⚖️' },
  hr:          { label: 'HR',          color: C.purple, icon: '👥' },
  manager:     { label: 'Manager',     color: C.orange, icon: '📋' },
  employee:    { label: 'Employee',    color: C.muted,  icon: '👤' },
};

export const PERSON_TYPES = {
  employee:   { label: 'Employee',   color: C.blue,   icon: '👤' },
  customer:   { label: 'Customer',   color: C.green,  icon: '🤝' },
  vendor:     { label: 'Vendor',     color: C.orange, icon: '📦' },
  freelancer: { label: 'Freelancer', color: C.purple, icon: '💻' },
  consultant: { label: 'Consultant', color: C.teal,   icon: '🎯' },
};

export const CATEGORIES = {
  employee:   { label: 'Employee',   color: C.blue },
  client:     { label: 'Client',     color: C.green },
  partner:    { label: 'Partner',    color: C.orange },
  consultant: { label: 'Consultant', color: C.teal },
  freelancer: { label: 'Freelancer', color: C.purple },
  vendor:     { label: 'Vendor',     color: C.pink },
  additional: { label: 'Additional', color: C.muted },
};

export const AUDIT_COLORS = {
  nda_created: C.green, nda_updated: C.blue, nda_signed: C.accent,
  nda_assigned: C.indigo, nda_group_assigned: C.purple, nda_revoked: C.red,
  nda_reminded: C.orange, nda_declined: C.pink, nda_expired: C.yellow,
  doc_downloaded: C.teal, user_login: C.blue, user_created: C.green,
};
