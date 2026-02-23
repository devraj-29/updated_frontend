import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { C, PERSON_TYPES } from '../services/constants';
import { Badge, Btn, Modal, Input, Select, Table, Tabs, PageHeader, Loading, Toast } from '../components/UI';

export default function PeoplePage({ user }) {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    const d = await api.getPeople();
    setPeople(d.results || d || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = people.filter(p => {
    if (filter !== 'all' && p.person_type !== filter) return false;
    if (search && !p.full_name.toLowerCase().includes(search.toLowerCase()) && !p.email?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const typeCounts = {};
  people.forEach(p => { typeCounts[p.person_type] = (typeCounts[p.person_type] || 0) + 1; });

  const tabs = [
    { value: 'all', label: `All (${people.length})` },
    ...Object.entries(PERSON_TYPES).map(([k, v]) => ({
      value: k, label: `${v.icon} ${v.label} (${typeCounts[k] || 0})`
    })),
  ];

  const handleCreate = async (data) => {
    const { ok } = await api.createPerson(data);
    if (ok) { load(); setModal(null); setToast({ msg: 'Person added', type: 'success' }); }
    else setToast({ msg: 'Failed to create', type: 'error' });
  };

  const handleUpdate = async (id, data) => {
    const { ok } = await api.updatePerson(id, data);
    if (ok) { load(); setModal(null); setEditing(null); setToast({ msg: 'Updated', type: 'success' }); }
    else setToast({ msg: 'Failed', type: 'error' });
  };

  const columns = [
    { key: 'full_name', label: 'Person', render: r => {
      const pt = PERSON_TYPES[r.person_type] || {};
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: `linear-gradient(135deg, ${pt.color || C.accent}18, ${pt.color || C.accent}08)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: pt.color || C.accent,
          }}>{r.full_name?.[0]?.toUpperCase()}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{r.full_name}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{r.email}</div>
          </div>
        </div>
      );
    }},
    { key: 'person_type', label: 'Type', render: r => {
      const pt = PERSON_TYPES[r.person_type] || {};
      return <Badge color={pt.color}>{pt.icon} {pt.label || r.person_type}</Badge>;
    }},
    { key: 'company_name', label: 'Company', render: r => <span style={{ fontSize: 13, color: C.sub }}>{r.company_name || '—'}</span> },
    { key: 'designation', label: 'Designation', render: r => <span style={{ fontSize: 13, color: C.muted }}>{r.designation || '—'}</span> },
    { key: 'actions', label: '', render: r => user?.can_manage_people ? (
      <Btn small ghost onClick={() => { setEditing(r); setModal('edit'); }}>Edit</Btn>
    ) : null },
  ];

  if (loading) return <Loading />;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <Toast message={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
      <PageHeader title="People" subtitle={`${people.length} contacts across ${Object.keys(typeCounts).length} types`}>
        {user?.can_manage_people && <Btn primary onClick={() => setModal('create')}>+ Add Person</Btn>}
      </PageHeader>

      <div style={{ marginBottom: 14 }}>
        <input placeholder="Search people..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: '10px 16px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: '#fff', color: C.text, fontSize: 14, outline: 'none', width: 280, transition: 'border-color 0.2s' }}
          onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.border} />
      </div>

      <Tabs tabs={tabs} active={filter} onChange={setFilter} />
      <Table columns={columns} data={filtered} />

      <Modal open={modal === 'create'} onClose={() => setModal(null)} title="Add Person">
        <PersonForm onSubmit={handleCreate} />
      </Modal>
      <Modal open={modal === 'edit'} onClose={() => { setModal(null); setEditing(null); }} title={`Edit — ${editing?.full_name}`}>
        <PersonForm initial={editing} isEdit onSubmit={(d) => handleUpdate(editing?.id, d)} />
      </Modal>
    </div>
  );
}

function PersonForm({ onSubmit, initial, isEdit }) {
  const [form, setForm] = useState({
    person_type: initial?.person_type || 'employee',
    full_name: initial?.full_name || '',
    email: initial?.email || '',
    phone: initial?.phone || '',
    company_name: initial?.company_name || '',
    designation: initial?.designation || '',
    notes: initial?.notes || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
  };

  return (
    <form onSubmit={submit}>
      <Select label="Type *" value={form.person_type} onChange={e => set('person_type', e.target.value)}
        options={Object.entries(PERSON_TYPES).map(([k, v]) => ({ value: k, label: `${v.icon} ${v.label}` }))} />
      <Input label="Full Name *" value={form.full_name} onChange={e => set('full_name', e.target.value)} required />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="Email *" type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
        <Input label="Phone" value={form.phone} onChange={e => set('phone', e.target.value)} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input label="Company" value={form.company_name} onChange={e => set('company_name', e.target.value)} />
        <Input label="Designation" value={form.designation} onChange={e => set('designation', e.target.value)} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
        <Btn primary type="submit" disabled={submitting || !form.full_name || !form.email}>
          {submitting ? 'Saving...' : isEdit ? 'Update' : 'Add Person'}
        </Btn>
      </div>
    </form>
  );
}
