import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { C, PERSON_TYPES, CATEGORIES } from '../services/constants';
import { Glass, Badge, Btn, Table, PageHeader, Loading, Stat } from '../components/UI';

export default function DocsPage() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getSignedDocs()
      .then(d => setDocs(d.results || d || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = docs.filter(d =>
    !search || d.signer_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.nda_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.confirmation_id?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'confirmation_id', label: 'Confirmation', render: r => (
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: C.accent }}>{r.confirmation_id}</div>
    )},
    { key: 'signer_name', label: 'Signer', render: r => (
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{r.signer_name}</div>
        <div style={{ fontSize: 12, color: C.muted }}>{r.signer_email}</div>
      </div>
    )},
    { key: 'nda_name', label: 'NDA', render: r => (
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{r.nda_name}</div>
        <Badge color={(CATEGORIES[r.nda_category] || {}).color} size="sm">{r.nda_category}</Badge>
      </div>
    )},
    { key: 'consent_timestamp', label: 'Signed At', render: r => (
      <span style={{ fontSize: 12, color: C.sub }}>{r.consent_timestamp ? new Date(r.consent_timestamp).toLocaleString() : '—'}</span>
    )},
    { key: 'actions', label: '', render: r => (
      <div style={{ display: 'flex', gap: 6 }}>
        <Btn small ghost style={{ color: C.blue }}>📄 Details</Btn>
      </div>
    )},
  ];

  if (loading) return <Loading />;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <PageHeader title="Signed Documents" subtitle={`${docs.length} legally binding signed documents`} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 18 }}>
        <Stat label="Total Signed" value={docs.length} icon="📝" color={C.green} />
        <Stat label="This Month" value={docs.filter(d => { const m = new Date(); return d.consent_timestamp && new Date(d.consent_timestamp).getMonth() === m.getMonth(); }).length} icon="📅" color={C.blue} />
        <Stat label="Unique Signers" value={new Set(docs.map(d => d.signer_email)).size} icon="👥" color={C.purple} />
      </div>

      <div style={{ marginBottom: 14 }}>
        <input placeholder="Search by name, NDA, or confirmation ID..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: '10px 16px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: '#fff', color: C.text, fontSize: 14, outline: 'none', width: 360, transition: 'border-color 0.2s' }}
          onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.border} />
      </div>

      <Table columns={columns} data={filtered} />
    </div>
  );
}
