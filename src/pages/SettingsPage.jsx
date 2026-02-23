import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { C, ROLES } from '../services/constants';
import { Glass, Badge, Btn, Modal, Input, Select, Table, PageHeader, Loading, Toast } from '../components/UI';

export default function SettingsPage({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    try { const d = await api.getUsers(); setUsers(d.results || d || []); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data) => {
    const { ok, data: res } = await api.createUser(data);
    if (ok) { load(); setModal(null); setToast({ msg: `User ${res.full_name} created`, type: 'success' }); }
    else setToast({ msg: Object.values(res).flat().join(', '), type: 'error' });
  };

  const handleUpdate = async (id, data) => {
    const { ok } = await api.updateUser(id, data);
    if (ok) { load(); setModal(null); setEditing(null); setToast({ msg: 'Updated', type: 'success' }); }
    else setToast({ msg: 'Failed', type: 'error' });
  };

  const columns = [
    { key: 'full_name', label: 'User', render: r => {
      const role = ROLES[r.role] || {};
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: `linear-gradient(135deg, ${role.color || C.accent}20, ${role.color || C.accent}08)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: role.color || C.accent,
          }}>{r.full_name?.[0]?.toUpperCase()}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{r.full_name}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{r.email}</div>
          </div>
        </div>
      );
    }},
    { key: 'role', label: 'Role', render: r => <Badge color={(ROLES[r.role] || {}).color}>{(ROLES[r.role] || {}).icon} {(ROLES[r.role] || {}).label || r.role}</Badge> },
    { key: 'department', label: 'Department', render: r => <span style={{ fontSize: 13, color: C.sub }}>{r.department || '—'}</span> },
    { key: 'is_active', label: 'Status', render: r => <Badge color={r.is_active ? C.green : C.red}>{r.is_active ? 'Active' : 'Inactive'}</Badge> },
    { key: 'actions', label: '', render: r => user?.can_manage_users ? (
      <Btn small ghost onClick={() => { setEditing(r); setModal('edit'); }}>Edit</Btn>
    ) : null },
  ];

  if (loading) return <Loading />;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <Toast message={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
      <PageHeader title="Settings & Users" subtitle="Manage portal users, roles, and access control">
        {user?.can_manage_users && <Btn primary onClick={() => setModal('create')}>+ Add User</Btn>}
      </PageHeader>

      {/* Role cards */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        {Object.entries(ROLES).map(([k, role]) => {
          const cnt = users.filter(u => u.role === k).length;
          return (
            <Glass key={k} style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flex: 1, borderLeft: `3px solid ${role.color}` }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: role.color }}>{cnt}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{role.label}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{role.icon}</div>
              </div>
            </Glass>
          );
        })}
      </div>

      <Table columns={columns} data={users} />

      {/* RBAC Matrix */}
      <Glass style={{ padding: 24, marginTop: 18 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3, margin: '0 0 16px' }}>🔐 Permission Matrix</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thS}>Permission</th>
                {Object.entries(ROLES).map(([k, r]) => <th key={k} style={{ ...thS, color: r.color }}>{r.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {[['Manage NDAs','✅','✅','✅','👁','👁'],['Manage People','✅','👁','✅','✅','👁'],['Assign NDAs','✅','✅','✅','✅','👁'],
                ['View Documents','✅','✅','✅','👁','👁'],['Full Audit','✅','✅','—','—','—'],['Manage Users','✅','—','✅','—','—']]
                .map(([perm,...vals], i) => (
                <tr key={i}>
                  <td style={tdS}>{perm}</td>
                  {vals.map((v,j) => <td key={j} style={{ ...tdS, textAlign: 'center' }}>{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Glass>

      <Modal open={modal === 'create'} onClose={() => setModal(null)} title="Create User"><UserForm onSubmit={handleCreate} /></Modal>
      <Modal open={modal === 'edit'} onClose={() => { setModal(null); setEditing(null); }} title={`Edit — ${editing?.full_name}`}>
        <UserForm initial={editing} isEdit onSubmit={d => handleUpdate(editing?.id, d)} />
      </Modal>
    </div>
  );
}

const thS = { padding: '10px 14px', textAlign: 'center', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: C.muted, borderBottom: `1px solid ${C.border}`, background: 'rgba(0,0,0,0.015)' };
const tdS = { padding: '10px 14px', fontSize: 13, color: C.sub, borderBottom: `1px solid ${C.border}` };

function UserForm({ onSubmit, initial, isEdit }) {
  const [form, setForm] = useState({ email: initial?.email || '', full_name: initial?.full_name || '', password: '', phone: initial?.phone || '', department: initial?.department || '', designation: initial?.designation || '', role: initial?.role || 'employee', is_active: initial?.is_active ?? true });
  const [sub, setSub] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <form onSubmit={async e => { e.preventDefault(); setSub(true); const d = { ...form }; if (isEdit) { delete d.password; delete d.email; } await onSubmit(d); setSub(false); }}>
      {!isEdit && <Input label="Email *" type="email" value={form.email} onChange={e => set('email', e.target.value)} required />}
      <Input label="Full Name *" value={form.full_name} onChange={e => set('full_name', e.target.value)} required />
      {!isEdit && <Input label="Password *" type="password" value={form.password} onChange={e => set('password', e.target.value)} required />}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Select label="Role *" value={form.role} onChange={e => set('role', e.target.value)}
          options={Object.entries(ROLES).map(([k, v]) => ({ value: k, label: `${v.icon} ${v.label}` }))} />
        <Input label="Department" value={form.department} onChange={e => set('department', e.target.value)} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
        <Btn primary type="submit" disabled={sub || !form.full_name || (!isEdit && (!form.email || !form.password))}>
          {sub ? 'Saving...' : isEdit ? 'Update' : 'Create User'}
        </Btn>
      </div>
    </form>
  );
}
