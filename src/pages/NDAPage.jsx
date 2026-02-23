import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { C, CATEGORIES } from '../services/constants';
import { Glass, Badge, Btn, Modal, Input, Select, TextArea, Table, Tabs, PageHeader, Loading, Toast } from '../components/UI';

export default function NDAPage({ user }) {
  const [ndas, setNdas] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // 'create' | 'edit' | 'view' | 'version'
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    const [n, c] = await Promise.all([api.getNDAs(), api.getCategories()]);
    setNdas(n.results || n || []);
    setCats(c || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = ndas.filter(n => {
    if (filter !== 'all' && n.category !== filter) return false;
    if (search && !n.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const tabs = [
    { value: 'all', label: `All (${ndas.length})` },
    ...cats.map(c => ({ value: c.value, label: `${c.label} (${c.count})` })),
  ];

  const handleCreate = async (data) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => { if (v != null && v !== '') fd.append(k, v); });
    const { ok } = await api.createNDA(fd);
    if (ok) { load(); setModal(null); setToast({ msg: 'NDA template created', type: 'success' }); }
    else setToast({ msg: 'Failed to create NDA', type: 'error' });
  };

  const handleUpdate = async (id, data) => {
    const { ok } = await api.updateNDA(id, data);
    if (ok) { load(); setModal(null); setSelected(null); setToast({ msg: 'NDA updated', type: 'success' }); }
    else setToast({ msg: 'Update failed', type: 'error' });
  };

  const handleDelete = async (nda) => {
    if (!confirm(`Delete "${nda.name}"? ${nda.total_assigned > 0 ? 'This NDA has assignments — it will be archived instead.' : 'This will permanently delete the template.'}`)) return;
    const { ok } = await api.del(`/ndas/${nda.id}/`);
    if (ok) { load(); setToast({ msg: nda.total_assigned > 0 ? 'NDA archived (has assignments)' : 'NDA deleted', type: 'success' }); }
    else setToast({ msg: 'Delete failed', type: 'error' });
  };

  const handleNewVersion = async (id, data) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => { if (v != null && v !== '') fd.append(k, v); });
    const { ok } = await api.createVersion(id, fd);
    if (ok) { load(); setModal(null); setSelected(null); setToast({ msg: 'New version created', type: 'success' }); }
    else setToast({ msg: 'Version creation failed', type: 'error' });
  };

  const columns = [
    { key: 'name', label: 'NDA Template', render: r => {
      const cat = CATEGORIES[r.category] || {};
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => { setSelected(r); setModal('view'); }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: `linear-gradient(135deg, ${cat.color || C.accent}18, ${cat.color || C.accent}08)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>📋</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: C.accent }}>{r.name}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{r.description?.slice(0, 60) || 'No description'}</div>
          </div>
        </div>
      );
    }},
    { key: 'category', label: 'Category', render: r => <Badge color={(CATEGORIES[r.category] || {}).color}>{(CATEGORIES[r.category] || {}).label || r.category}</Badge> },
    { key: 'version', label: 'Version', render: r => <span style={{ fontSize: 13, fontWeight: 600, color: C.sub, fontFamily: "monospace" }}>v{r.current_version_number || '—'}</span> },
    { key: 'stats', label: 'Stats', render: r => (
      <div style={{ display: 'flex', gap: 6 }}>
        <Badge color={C.blue} size="sm">{r.total_assigned || 0} sent</Badge>
        <Badge color={C.green} size="sm">{r.total_signed || 0} signed</Badge>
      </div>
    )},
    { key: 'status', label: 'Status', render: r => <Badge color={r.status === 'active' ? C.green : r.status === 'archived' ? C.muted : C.orange}>{r.status}</Badge> },
    { key: 'actions', label: '', render: r => user?.can_manage_ndas ? (
      <div style={{ display: 'flex', gap: 4 }}>
        <Btn small ghost onClick={() => { setSelected(r); setModal('edit'); }}>✏️</Btn>
        <Btn small ghost onClick={() => { setSelected(r); setModal('version'); }} style={{ color: C.blue }}>📄+</Btn>
        {r.status === 'active' && <Btn small ghost onClick={() => api.archiveNDA(r.id).then(load)} style={{ color: C.orange }}>📦</Btn>}
        {r.status !== 'active' && <Btn small ghost onClick={() => api.activateNDA(r.id).then(load)} style={{ color: C.green }}>✅</Btn>}
        <Btn small ghost onClick={() => handleDelete(r)} style={{ color: C.red }}>🗑</Btn>
      </div>
    ) : null },
  ];

  if (loading) return <Loading />;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <Toast message={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
      <PageHeader title="NDA Templates" subtitle={`${ndas.length} templates across ${cats.length} categories`}>
        {user?.can_manage_ndas && <Btn primary onClick={() => setModal('create')}>+ New Template</Btn>}
      </PageHeader>

      <div style={{ marginBottom: 14 }}>
        <input placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: '10px 16px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: '#fff', color: C.text, fontSize: 14, outline: 'none', width: 280, transition: 'border-color 0.2s' }}
          onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.border} />
      </div>

      <Tabs tabs={tabs} active={filter} onChange={setFilter} />
      <Table columns={columns} data={filtered} />

      {/* Create Modal */}
      <Modal open={modal === 'create'} onClose={() => setModal(null)} title="Create NDA Template" wide>
        <NDAForm onSubmit={handleCreate} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={modal === 'edit'} onClose={() => { setModal(null); setSelected(null); }} title={`Edit — ${selected?.name}`} wide>
        <NDAEditForm nda={selected} onSubmit={(d) => handleUpdate(selected?.id, d)} />
      </Modal>

      {/* View Modal — A4 Reader */}
      <Modal open={modal === 'view'} onClose={() => { setModal(null); setSelected(null); }} title={selected?.name} wide>
        <NDAA4Viewer nda={selected} />
      </Modal>

      {/* New Version Modal */}
      <Modal open={modal === 'version'} onClose={() => { setModal(null); setSelected(null); }} title={`New Version — ${selected?.name}`} wide>
        <VersionForm nda={selected} onSubmit={(d) => handleNewVersion(selected?.id, d)} />
      </Modal>
    </div>
  );
}

/* ── A4 Document Viewer ── */
function NDAA4Viewer({ nda }) {
  const [detail, setDetail] = useState(null);
  useEffect(() => { if (nda?.id) api.getNDA(nda.id).then(setDetail).catch(() => {}); }, [nda?.id]);

  const ver = detail?.current_version_data;
  const html = ver?.content_html || '';
  const plain = ver?.content_plain || '';

  return (
    <div>
      {/* NDA Info Bar */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <Badge color={(CATEGORIES[nda?.category]||{}).color}>{nda?.category}</Badge>
        <Badge color={nda?.status === 'active' ? C.green : C.muted}>{nda?.status}</Badge>
        {ver && <Badge color={C.blue}>v{ver.version_number}</Badge>}
        <span style={{ fontSize: 12, color: C.muted }}>Survival: {nda?.survival_years}yr · Expiry: {nda?.link_expiry_hours}h</span>
      </div>

      {/* A4 Paper Preview */}
      <div style={{
        width: '100%', maxWidth: 620, margin: '0 auto',
        background: '#fff', border: `1px solid ${C.border}`,
        borderRadius: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        padding: '60px 56px', minHeight: 600,
        fontFamily: "'Times New Roman', Georgia, serif",
        fontSize: 14, lineHeight: 1.8, color: '#222',
        overflow: 'auto', maxHeight: 500,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24, borderBottom: '2px solid #333', paddingBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
            Non-Disclosure Agreement
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{nda?.name} · Version {ver?.version_number || '—'}</div>
        </div>
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{plain || 'No content available.'}</pre>
        )}
      </div>

      {/* Version History */}
      {detail?.versions?.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.sub, marginBottom: 8 }}>Version History</div>
          {detail.versions.map(v => (
            <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
              <Badge color={v.is_active ? C.green : C.muted} size="sm">v{v.version_number}</Badge>
              <span style={{ color: C.sub }}>{v.changelog || 'No changelog'}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: C.muted }}>{new Date(v.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Create Form ── */
function NDAForm({ onSubmit }) {
  const [form, setForm] = useState({ name: '', category: 'employee', description: '', content_html: '', content_plain: '', version_number: '1.0', survival_years: 5, link_expiry_hours: 72 });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <form onSubmit={async e => { e.preventDefault(); setSubmitting(true); const d = { ...form }; if (file) d.docx_file = file; await onSubmit(d); setSubmitting(false); }}>
      <Input label="Template Name *" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g., Standard Employee NDA" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Select label="Category *" value={form.category} onChange={e => set('category', e.target.value)}
          options={Object.entries(CATEGORIES).map(([k, v]) => ({ value: k, label: v.label }))} />
        <Input label="Version" value={form.version_number} onChange={e => set('version_number', e.target.value)} placeholder="1.0" />
        <Input label="Survival (years)" type="number" value={form.survival_years} onChange={e => set('survival_years', +e.target.value)} />
      </div>
      <TextArea label="Description" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief description..." />

      {/* A4-sized content editor */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.sub, marginBottom: 6 }}>NDA Content (Plain Text) * — A4 Preview</label>
        <textarea value={form.content_plain} onChange={e => set('content_plain', e.target.value)} required
          placeholder="Enter the full NDA text here. This will be shown to signers..."
          style={{
            width: '100%', minHeight: 300, padding: '40px 50px',
            borderRadius: 4, border: `1px solid ${C.border}`,
            background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            fontFamily: "'Times New Roman', Georgia, serif", fontSize: 14,
            lineHeight: 1.8, color: '#222', resize: 'vertical', outline: 'none',
          }} />
      </div>

      <TextArea label="Content (HTML) — Optional rich formatting" value={form.content_html} onChange={e => set('content_html', e.target.value)} placeholder="<p>Optional HTML version...</p>" />

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.sub, marginBottom: 6 }}>DOCX Upload (Optional)</label>
        <input type="file" accept=".docx" onChange={e => setFile(e.target.files[0])} style={{ fontSize: 13 }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
        <Btn primary type="submit" disabled={submitting || !form.name || !form.content_plain}>
          {submitting ? 'Creating...' : 'Create Template'}
        </Btn>
      </div>
    </form>
  );
}

/* ── Edit Form ── */
function NDAEditForm({ nda, onSubmit }) {
  const [form, setForm] = useState({
    name: nda?.name || '', category: nda?.category || 'employee',
    description: nda?.description || '', survival_years: nda?.survival_years || 5,
    link_expiry_hours: nda?.link_expiry_hours || 72, is_mandatory: nda?.is_mandatory ?? true,
  });
  const [sub, setSub] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <form onSubmit={async e => { e.preventDefault(); setSub(true); await onSubmit(form); setSub(false); }}>
      <Input label="Template Name *" value={form.name} onChange={e => set('name', e.target.value)} required />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Select label="Category" value={form.category} onChange={e => set('category', e.target.value)}
          options={Object.entries(CATEGORIES).map(([k, v]) => ({ value: k, label: v.label }))} />
        <Input label="Survival (years)" type="number" value={form.survival_years} onChange={e => set('survival_years', +e.target.value)} />
        <Input label="Link Expiry (hours)" type="number" value={form.link_expiry_hours} onChange={e => set('link_expiry_hours', +e.target.value)} />
      </div>
      <TextArea label="Description" value={form.description} onChange={e => set('description', e.target.value)} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
        <Btn primary type="submit" disabled={sub || !form.name}>{sub ? 'Saving...' : 'Update NDA'}</Btn>
      </div>
    </form>
  );
}

/* ── New Version Form ── */
function VersionForm({ nda, onSubmit }) {
  const [form, setForm] = useState({ version_number: '', changelog: '', content_html: '', content_plain: '' });
  const [file, setFile] = useState(null);
  const [sub, setSub] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <form onSubmit={async e => { e.preventDefault(); setSub(true); const d = { ...form }; if (file) d.docx_file = file; await onSubmit(d); setSub(false); }}>
      <Input label="Version Number *" value={form.version_number} onChange={e => set('version_number', e.target.value)} required placeholder="e.g., 2.0" />
      <TextArea label="Changelog" value={form.changelog} onChange={e => set('changelog', e.target.value)} placeholder="What changed in this version..." />
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.sub, marginBottom: 6 }}>NDA Content (Plain Text) — A4 Editor</label>
        <textarea value={form.content_plain} onChange={e => set('content_plain', e.target.value)}
          placeholder="Full NDA text for this version..."
          style={{
            width: '100%', minHeight: 250, padding: '40px 50px', borderRadius: 4,
            border: `1px solid ${C.border}`, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            fontFamily: "'Times New Roman', Georgia, serif", fontSize: 14, lineHeight: 1.8, color: '#222',
            resize: 'vertical', outline: 'none',
          }} />
      </div>
      <TextArea label="HTML Content (Optional)" value={form.content_html} onChange={e => set('content_html', e.target.value)} />
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.sub, marginBottom: 6 }}>DOCX Upload</label>
        <input type="file" accept=".docx" onChange={e => setFile(e.target.files[0])} style={{ fontSize: 13 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
        <Btn primary type="submit" disabled={sub || !form.version_number}>{sub ? 'Creating...' : 'Create Version'}</Btn>
      </div>
    </form>
  );
}
