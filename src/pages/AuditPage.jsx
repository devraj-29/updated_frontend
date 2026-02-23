import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { C, AUDIT_COLORS } from '../services/constants';
import { Glass, Badge, Tabs, PageHeader, Loading } from '../components/UI';

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getAuditLogs()
      .then(d => setLogs(d.results || d || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const actions = [...new Set(logs.map(l => l.action))];
  const tabs = [
    { value: 'all', label: `All (${logs.length})` },
    ...actions.map(a => ({ value: a, label: `${a.replace(/_/g, ' ')} (${logs.filter(l => l.action === a).length})` })),
  ];

  const filtered = logs.filter(l => {
    if (filter !== 'all' && l.action !== filter) return false;
    if (search && !l.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <Loading />;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <PageHeader title="Audit Log" subtitle="Complete activity trail — every action tracked" />

      <div style={{ marginBottom: 14 }}>
        <input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: '10px 16px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: '#fff', color: C.text, fontSize: 14, outline: 'none', width: 280, transition: 'border-color 0.2s' }}
          onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.border} />
      </div>

      <Tabs tabs={tabs} active={filter} onChange={setFilter} />

      <Glass style={{ overflow: 'hidden' }}>
        {filtered.length === 0 && <div style={{ padding: 50, textAlign: 'center', color: C.muted }}>No logs found</div>}
        {filtered.map((log, i) => {
          const clr = AUDIT_COLORS[log.action] || C.muted;
          return (
            <div key={log.id || i} style={{
              display: 'flex', gap: 14, padding: '14px 20px',
              borderBottom: `1px solid ${C.border}`,
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.015)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 5, gap: 4, flexShrink: 0 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: clr, boxShadow: `0 0 8px ${clr}30` }} />
                {i < filtered.length - 1 && <div style={{ width: 1, flex: 1, background: C.border }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Badge color={clr} size="sm">{log.action?.replace(/_/g, ' ')}</Badge>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{log.user_name || 'System'}</span>
                  </div>
                  <span style={{ fontSize: 11, color: C.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                    {log.created_at ? new Date(log.created_at).toLocaleString() : ''}
                  </span>
                </div>
                {log.description && <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.5 }}>{log.description}</div>}
                <div style={{ display: 'flex', gap: 14, fontSize: 11, color: C.muted, marginTop: 4 }}>
                  {log.ip_address && <span>🌐 {log.ip_address}</span>}
                  {log.target_type && <span>📎 {log.target_type} #{log.target_id}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </Glass>
    </div>
  );
}
