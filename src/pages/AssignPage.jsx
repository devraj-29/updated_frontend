import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { C, SC, CATEGORIES, PERSON_TYPES } from '../services/constants';
import { Glass, Badge, Btn, Modal, Input, Select, TextArea, Table, Tabs, Stat, PageHeader, Loading, Toast } from '../components/UI';

export default function AssignPage({ user }) {
  const [assignments, setAssignments] = useState([]);
  const [ndas, setNdas] = useState([]);
  const [people, setPeople] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    const [a, n, p, s] = await Promise.all([
      api.getAssignments(), api.getNDAs(), api.getPeople(), api.getAssignmentStats(),
    ]);
    setAssignments(a.results || a || []);
    setNdas((n.results || n || []).filter(x => x.status === 'active'));
    setPeople((p.results || p || []).filter(x => x.is_active !== false));
    setStats(s || {});
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const statusCounts = {};
  assignments.forEach(a => { statusCounts[a.status] = (statusCounts[a.status] || 0) + 1; });

  const tabs = [
    { value: 'all', label: `All (${assignments.length})` },
    ...Object.entries(SC).filter(([k]) => statusCounts[k]).map(([k, v]) => ({
      value: k, label: `${v.label} (${statusCounts[k] || 0})`,
    })),
  ];

  const filtered = assignments.filter(a => filter === 'all' || a.status === filter);

  const handleSingle = async (data) => {
    const { ok, data: res } = await api.assignSingle(data);
    if (ok) { load(); setModal(null); setToast({ msg: `NDA assigned — email sent to ${res.person_name || 'signer'}`, type: 'success' }); }
    else setToast({ msg: res.error || 'Failed', type: 'error' });
  };

  const handleGroup = async (data) => {
    const { ok, data: res } = await api.assignGroup(data);
    if (ok) { load(); setModal(null); setToast({ msg: `Group "${res.group_name}": ${res.created} assigned, ${res.skipped} skipped — emails sent`, type: 'success' }); }
    else setToast({ msg: res.error || 'Failed', type: 'error' });
  };

  const columns = [
    { key: 'person_name', label: 'Signer', render: r => (
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{r.person_name}</div>
        <div style={{ fontSize: 12, color: C.muted }}>{r.person_email}</div>
      </div>
    )},
    { key: 'nda_name', label: 'NDA', render: r => (
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{r.nda_name}</div>
        <div style={{ fontSize: 11, color: C.muted }}>v{r.nda_version}</div>
      </div>
    )},
    { key: 'status', label: 'Status', render: r => {
      const s = SC[r.status] || {};
      return <Badge color={s.color}>{s.label || r.status}</Badge>;
    }},
    { key: 'sent_at', label: 'Sent', render: r => (
      <span style={{ fontSize: 12, color: C.muted }}>{r.sent_at ? new Date(r.sent_at).toLocaleDateString() : '—'}</span>
    )},
    { key: 'actions', label: '', render: r => {
      if (!user?.can_assign_ndas) return null;
      return (
        <div style={{ display: 'flex', gap: 4 }}>
          {['sent', 'viewed', 'read'].includes(r.status) && (
            <Btn small ghost onClick={async () => {
              await api.remindAssignment(r.id);
              load();
              setToast({ msg: `Reminder email sent to ${r.person_name}`, type: 'success' });
            }} style={{ color: C.blue }}>📧 Remind</Btn>
          )}
          {r.status !== 'signed' && r.status !== 'revoked' && (
            <Btn small ghost onClick={async () => {
              await api.revokeAssignment(r.id);
              load();
              setToast({ msg: 'Assignment revoked', type: 'info' });
            }} style={{ color: C.red }}>Revoke</Btn>
          )}
          {r.status === 'sent' && r.signing_url && (
            <Btn small ghost onClick={() => { navigator.clipboard.writeText(r.signing_url); setToast({ msg: 'Signing link copied!', type: 'info' }); }}
              style={{ color: C.accent }}>🔗 Copy Link</Btn>
          )}
        </div>
      );
    }},
  ];

  if (loading) return <Loading />;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <Toast message={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
      <PageHeader title="Assignments" subtitle="Assign NDAs, track signatures, send email notifications">
        {user?.can_assign_ndas && <>
          <Btn onClick={() => setModal('group')}>📦 Group Assign</Btn>
          <Btn primary onClick={() => setModal('single')}>+ Single Assign</Btn>
        </>}
      </PageHeader>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 18 }}>
        <Stat label="Total" value={stats.total || 0} icon="📊" color={C.blue} />
        <Stat label="Pending" value={stats.pending || 0} icon="⏳" color={C.orange} />
        <Stat label="Signed" value={stats.signed || 0} icon="✅" color={C.green} />
        <Stat label="Declined" value={stats.declined || 0} icon="✕" color={C.red} />
      </div>

      <Tabs tabs={tabs} active={filter} onChange={setFilter} />
      <Table columns={columns} data={filtered} />

      {/* Single Assign Modal */}
      <Modal open={modal === 'single'} onClose={() => setModal(null)} title="Assign NDA">
        <SingleForm ndas={ndas} people={people} onSubmit={handleSingle} />
      </Modal>

      {/* Group Assign Modal */}
      <Modal open={modal === 'group'} onClose={() => setModal(null)} title="Group Assignment" wide>
        <GroupForm ndas={ndas} people={people} onSubmit={handleGroup} />
      </Modal>
    </div>
  );
}

function SingleForm({ ndas, people, onSubmit }) {
  const [form, setForm] = useState({ nda_template_id: '', person_id: '', message: '', send_immediately: true });
  const [sub, setSub] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <form onSubmit={async e => { e.preventDefault(); setSub(true); await onSubmit({ ...form, nda_template_id: +form.nda_template_id, person_id: +form.person_id }); setSub(false); }}>
      <Select label="NDA Template *" value={form.nda_template_id} onChange={e => set('nda_template_id', e.target.value)}
        options={[{ value: '', label: 'Select NDA...' }, ...ndas.map(n => ({ value: n.id, label: `${n.name} (v${n.current_version_number || '?'})` }))]} />
      <Select label="Person *" value={form.person_id} onChange={e => set('person_id', e.target.value)}
        options={[{ value: '', label: 'Select Person...' }, ...people.map(p => ({ value: p.id, label: `${p.full_name} (${p.email})` }))]} />
      <TextArea label="Personal Message (included in email)" value={form.message} onChange={e => set('message', e.target.value)} placeholder="Optional message for the signer..." />
      <Glass style={{ padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>📧</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Send Email Notification</div>
          <div style={{ fontSize: 12, color: C.muted }}>Signer receives an email with a secure one-time signing link</div>
        </div>
        <label style={{ position: 'relative', width: 44, height: 24, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.send_immediately} onChange={e => set('send_immediately', e.target.checked)}
            style={{ opacity: 0, position: 'absolute' }} />
          <div style={{
            width: 44, height: 24, borderRadius: 12,
            background: form.send_immediately ? C.accent : '#ddd',
            transition: 'background 0.2s', position: 'relative',
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: 10, background: '#fff',
              position: 'absolute', top: 2, left: form.send_immediately ? 22 : 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'left 0.2s',
            }} />
          </div>
        </label>
      </Glass>
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
        <Btn primary type="submit" disabled={sub || !form.nda_template_id || !form.person_id}>
          {sub ? 'Assigning...' : '📧 Assign & Send Email'}
        </Btn>
      </div>
    </form>
  );
}

function GroupForm({ ndas, people, onSubmit }) {
  const [name, setName] = useState('');
  const [selNdas, setSelNdas] = useState([]);
  const [selPeople, setSelPeople] = useState([]);
  const [msg, setMsg] = useState('');
  const [sub, setSub] = useState(false);

  const toggleNda = (id) => setSelNdas(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const togglePerson = (id) => setSelPeople(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  return (
    <form onSubmit={async e => { e.preventDefault(); setSub(true); await onSubmit({ name, nda_template_ids: selNdas, person_ids: selPeople, message: msg, send_immediately: true }); setSub(false); }}>
      <Input label="Group Name *" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g., Q1 Employee Onboarding" />
      <TextArea label="Message for Signers (included in all emails)" value={msg} onChange={e => setMsg(e.target.value)} placeholder="Optional message..." />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.sub, marginBottom: 8 }}>
            Select NDAs ({selNdas.length} selected)
          </label>
          <div style={{ maxHeight: 200, overflowY: 'auto', border: `1px solid ${C.border}`, borderRadius: 12, padding: 4 }}>
            {ndas.map(n => (
              <label key={n.id} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                borderRadius: 8, cursor: 'pointer',
                background: selNdas.includes(n.id) ? C.accentSoft : 'transparent',
                transition: 'background 0.15s',
              }}>
                <input type="checkbox" checked={selNdas.includes(n.id)} onChange={() => toggleNda(n.id)} />
                <span style={{ fontSize: 13 }}>{n.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.sub, marginBottom: 8 }}>
            Select People ({selPeople.length} selected)
          </label>
          <div style={{ maxHeight: 200, overflowY: 'auto', border: `1px solid ${C.border}`, borderRadius: 12, padding: 4 }}>
            {people.map(p => (
              <label key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                borderRadius: 8, cursor: 'pointer',
                background: selPeople.includes(p.id) ? C.accentSoft : 'transparent',
                transition: 'background 0.15s',
              }}>
                <input type="checkbox" checked={selPeople.includes(p.id)} onChange={() => togglePerson(p.id)} />
                <span style={{ fontSize: 13 }}>{p.full_name} <span style={{ color: C.muted }}>({p.email})</span></span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {selNdas.length > 0 && selPeople.length > 0 && (
        <Glass style={{ padding: '12px 16px', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
            📧 {selNdas.length * selPeople.length} emails will be sent
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>
            {selNdas.length} NDA(s) × {selPeople.length} person(s) — each signer gets a unique link per NDA
          </div>
        </Glass>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
        <Btn primary type="submit" disabled={sub || !name || !selNdas.length || !selPeople.length}>
          {sub ? 'Assigning...' : `📧 Assign & Send ${selNdas.length * selPeople.length} Emails`}
        </Btn>
      </div>
    </form>
  );
}
