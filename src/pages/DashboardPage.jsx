import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { C, SC, CATEGORIES } from '../services/constants';
import { Glass, Stat, Bar, Badge, PageHeader, Loading } from '../components/UI';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (!data) return null;

  const sigRate = data.signing_rate || 0;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <PageHeader title="Dashboard" subtitle="Real-time overview of your NDA operations" />

      {/* Hero Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        <Stat label="Total NDAs" value={data.total_ndas} icon="📋" color={C.blue} />
        <Stat label="Active NDAs" value={data.active_ndas} icon="✅" color={C.green} />
        <Stat label="People" value={data.total_people} icon="👥" color={C.purple} />
        <Stat label="Portal Users" value={data.total_users} icon="🔑" color={C.orange} />
      </div>

      {/* Signing Rate + Categories */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 14, marginBottom: 20 }}>

        {/* Signing Rate Ring */}
        <Glass style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: 140, height: 140, marginBottom: 16 }}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="10"/>
              <circle cx="70" cy="70" r="58" fill="none" stroke={C.accent} strokeWidth="10"
                strokeLinecap="round" strokeDasharray={`${sigRate * 3.64} 364`}
                transform="rotate(-90 70 70)"
                style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.25,0.46,0.45,0.94)' }}/>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 36, fontWeight: 800, letterSpacing: -2, color: C.text }}>{Math.round(sigRate)}</span>
              <span style={{ fontSize: 13, color: C.muted, fontWeight: 500, marginTop: -4 }}>%</span>
            </div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: -0.3 }}>Signing Rate</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Overall completion</div>
        </Glass>

        {/* Category Breakdown */}
        <Glass style={{ padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: -0.3, marginBottom: 18 }}>NDA Categories</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(data.category_stats || []).map(cat => {
              const cfg = CATEGORIES[cat.value] || { color: C.muted };
              const pct = data.total_ndas ? (cat.count / data.total_ndas * 100) : 0;
              return (
                <div key={cat.value} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 100, fontSize: 13, fontWeight: 500, color: C.sub }}>{cat.label}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 8, borderRadius: 4, background: 'rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 4, width: `${pct}%`,
                        background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}aa)`,
                        transition: 'width 0.8s ease',
                      }} />
                    </div>
                  </div>
                  <div style={{ width: 32, textAlign: 'right', fontSize: 14, fontWeight: 700, color: C.text }}>{cat.count}</div>
                </div>
              );
            })}
          </div>
        </Glass>
      </div>

      {/* Assignment Status + People Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Assignment Pipeline */}
        <Glass style={{ padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: -0.3, marginBottom: 18 }}>Assignment Pipeline</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { key: 'pending', label: 'Pending', icon: '⏳', color: C.blue },
              { key: 'signed', label: 'Signed', icon: '✅', color: C.green },
              { key: 'total', label: 'Total', icon: '📊', color: C.purple },
            ].map(s => (
              <div key={s.key} style={{
                padding: 16, borderRadius: 14, textAlign: 'center',
                background: s.color + '08', border: `1px solid ${s.color}10`,
              }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color, letterSpacing: -1 }}>
                  {data.assignment_stats?.[s.key] ?? 0}
                </div>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Glass>

        {/* People Types */}
        <Glass style={{ padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: -0.3, marginBottom: 18 }}>People by Type</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(data.people_stats || []).map(p => {
              const colors = { employee: C.blue, customer: C.green, vendor: C.orange, freelancer: C.purple, consultant: C.teal };
              const clr = colors[p.value] || C.muted;
              return (
                <div key={p.value} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: clr, boxShadow: `0 0 6px ${clr}40`,
                  }} />
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: C.sub }}>{p.label}</span>
                  <Badge color={clr} size="sm">{p.count}</Badge>
                </div>
              );
            })}
          </div>
        </Glass>
      </div>
    </div>
  );
}
