import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { canView } from '../../../utils/permissions';
import {
  FaCopy, FaExternalLinkAlt, FaTrash, FaEdit, FaClone,
  FaToggleOn, FaToggleOff, FaGripVertical, FaPlus, FaCheck,
  FaTimes, FaChevronDown, FaChevronUp, FaSearch, FaEye,
  FaFont, FaAlignLeft, FaEnvelope, FaHashtag, FaCalendarAlt,
  FaListUl, FaDotCircle, FaCheckSquare, FaLink, FaPhone,
  FaArrowLeft, FaImage, FaClock, FaUsers, FaWpforms
} from 'react-icons/fa';
import './AdminForms.css';
import api from '../../../utils/api';
import Loader from '../../../components/loader/Loader';

/* ─── Field type definitions ─── */
const FIELD_TYPES = [
  { type: 'text',     label: 'Short Text',   icon: FaFont,        color: '#6366f1' },
  { type: 'textarea', label: 'Long Text',    icon: FaAlignLeft,   color: '#8b5cf6' },
  { type: 'email',    label: 'Email',        icon: FaEnvelope,    color: '#ec4899' },
  { type: 'number',   label: 'Number',       icon: FaHashtag,     color: '#f59e0b' },
  { type: 'date',     label: 'Date',         icon: FaCalendarAlt, color: '#10b981' },
  { type: 'dropdown', label: 'Dropdown',     icon: FaListUl,      color: '#3b82f6' },
  { type: 'radio',    label: 'Radio',        icon: FaDotCircle,   color: '#06b6d4' },
  { type: 'checkbox', label: 'Checkboxes',   icon: FaCheckSquare, color: '#f97316' },
];

const RESPONDENT_TYPES = [
  { type: 'text',   label: 'Text',   icon: FaFont },
  { type: 'email',  label: 'Email',  icon: FaEnvelope },
  { type: 'number', label: 'Number', icon: FaHashtag },
  { type: 'tel',    label: 'Phone',  icon: FaPhone },
  { type: 'url',    label: 'URL',    icon: FaLink },
  { type: 'date',   label: 'Date',   icon: FaCalendarAlt },
];

const TYPE_META = Object.fromEntries(FIELD_TYPES.map(f => [f.type, f]));

const EMPTY_QUESTION = { question: '', type: 'text', options: [], required: false, placeholder: '', showIf: null };
const EMPTY_RESPONDENT = { fieldName: '', label: '', type: 'text', required: false, placeholder: '' };
const EMPTY_FORM = {
  title: '', description: '', headerImage: '', customRoute: '',
  isActive: false, customQuestions: [],
  successMessage: 'Thank you for your submission!',
  closedMessage: 'This form is currently closed. Please check back later.',
  allowMultipleSubmissions: false, maxSubmissions: null, submissionDeadline: null,
  collectEmail: true, collectName: true, respondentFields: []
};

/* ─── Toast ─── */
let _addToast = null;
function toast(msg, type = 'success') { _addToast?.(msg, type); }

function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  _addToast = (msg, type) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };
  return (
    <div className="af-toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`af-toast af-toast--${t.type}`}>
          {t.type === 'success' ? <FaCheck /> : <FaTimes />}
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Drag-to-reorder hook ─── */
function useDrag(items, setItems) {
  const dragIdx = useRef(null);
  const onDragStart = (i) => { dragIdx.current = i; };
  const onDragOver = (e, i) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === i) return;
    const next = [...items];
    const [moved] = next.splice(dragIdx.current, 1);
    next.splice(i, 0, moved);
    dragIdx.current = i;
    setItems(next);
  };
  const onDragEnd = () => { dragIdx.current = null; };
  return { onDragStart, onDragOver, onDragEnd };
}

/* ─── QuestionCard ─── */
function QuestionCard({ q, index, total, onEdit, onRemove, dragProps }) {
  const meta = TYPE_META[q.type] || FIELD_TYPES[0];
  const Icon = meta.icon;
  return (
    <div
      className="af-qcard"
      draggable
      onDragStart={() => dragProps.onDragStart(index)}
      onDragOver={(e) => dragProps.onDragOver(e, index)}
      onDragEnd={dragProps.onDragEnd}
    >
      <div className="af-qcard__grip"><FaGripVertical /></div>
      <div className="af-qcard__icon" style={{ background: meta.color + '22', color: meta.color }}>
        <Icon />
      </div>
      <div className="af-qcard__body">
        <div className="af-qcard__title">
          {q.question || <em style={{ opacity: 0.5 }}>Untitled question</em>}
          {q.required && <span className="af-badge af-badge--req">Required</span>}
        </div>
        <div className="af-qcard__meta">
          <span className="af-badge" style={{ background: meta.color + '22', color: meta.color }}>{meta.label}</span>
          {q.options?.length > 0 && (
            <span className="af-qcard__opts">{q.options.slice(0, 3).join(' · ')}{q.options.length > 3 ? ` +${q.options.length - 3}` : ''}</span>
          )}
        </div>
      </div>
      <div className="af-qcard__actions">
        <button type="button" className="af-icon-btn af-icon-btn--edit" onClick={() => onEdit(index)} title="Edit"><FaEdit /></button>
        <button type="button" className="af-icon-btn af-icon-btn--del" onClick={() => onRemove(index)} title="Remove"><FaTrash /></button>
      </div>
    </div>
  );
}

/* ─── RespondentCard ─── */
function RespondentCard({ f, index, onEdit, onRemove, dragProps }) {
  const meta = RESPONDENT_TYPES.find(t => t.type === f.type) || RESPONDENT_TYPES[0];
  const Icon = meta.icon;
  return (
    <div
      className="af-qcard"
      draggable
      onDragStart={() => dragProps.onDragStart(index)}
      onDragOver={(e) => dragProps.onDragOver(e, index)}
      onDragEnd={dragProps.onDragEnd}
    >
      <div className="af-qcard__grip"><FaGripVertical /></div>
      <div className="af-qcard__icon" style={{ background: '#64748b22', color: '#64748b' }}>
        <Icon />
      </div>
      <div className="af-qcard__body">
        <div className="af-qcard__title">
          {f.label || <em style={{ opacity: 0.5 }}>Untitled field</em>}
          {f.required && <span className="af-badge af-badge--req">Required</span>}
        </div>
        <div className="af-qcard__meta">
          <span className="af-badge">{meta.label}</span>
          {f.fieldName && <span className="af-qcard__opts">key: {f.fieldName}</span>}
        </div>
      </div>
      <div className="af-qcard__actions">
        <button type="button" className="af-icon-btn af-icon-btn--edit" onClick={() => onEdit(index)} title="Edit"><FaEdit /></button>
        <button type="button" className="af-icon-btn af-icon-btn--del" onClick={() => onRemove(index)} title="Remove"><FaTrash /></button>
      </div>
    </div>
  );
}

/* ─── EditQuestionDrawer ─── */
function EditQuestionDrawer({ question, onSave, onCancel }) {
  const [q, setQ] = useState({ ...EMPTY_QUESTION, ...question });
  const [newOpt, setNewOpt] = useState('');
  const needsOptions = ['dropdown', 'radio', 'checkbox'].includes(q.type);

  const addOpt = () => {
    const v = newOpt.trim();
    if (v) { setQ(prev => ({ ...prev, options: [...(prev.options || []), v] })); setNewOpt(''); }
  };
  const removeOpt = (i) => setQ(prev => ({ ...prev, options: prev.options.filter((_, idx) => idx !== i) }));

  return (
    <div className="af-edit-drawer">
      <div className="af-edit-drawer__header">
        <span>Edit Question</span>
        <button type="button" className="af-icon-btn" onClick={onCancel}><FaTimes /></button>
      </div>
      <div className="af-edit-drawer__body">
        <label className="af-label">Question text *</label>
        <input className="af-input" value={q.question} onChange={e => setQ(p => ({ ...p, question: e.target.value }))} placeholder="Enter your question..." />

        <label className="af-label">Type</label>
        <div className="af-type-grid">
          {FIELD_TYPES.map(ft => {
            const Icon = ft.icon;
            return (
              <button
                key={ft.type}
                type="button"
                className={`af-type-tile ${q.type === ft.type ? 'af-type-tile--active' : ''}`}
                style={q.type === ft.type ? { borderColor: ft.color, background: ft.color + '18' } : {}}
                onClick={() => setQ(p => ({ ...p, type: ft.type, options: ['dropdown','radio','checkbox'].includes(ft.type) ? (p.options || []) : [] }))}
              >
                <Icon style={{ color: ft.color }} />
                <span>{ft.label}</span>
              </button>
            );
          })}
        </div>

        {needsOptions && (
          <>
            <label className="af-label">Options</label>
            <div className="af-options-list">
              {(q.options || []).map((opt, i) => (
                <div key={i} className="af-option-row">
                  <input
                    className="af-input af-input--sm"
                    value={opt}
                    onChange={e => setQ(p => ({ ...p, options: p.options.map((o, idx) => idx === i ? e.target.value : o) }))}
                  />
                  <button type="button" className="af-icon-btn af-icon-btn--del" onClick={() => removeOpt(i)}><FaTimes /></button>
                </div>
              ))}
              <div className="af-option-row">
                <input
                  className="af-input af-input--sm"
                  value={newOpt}
                  placeholder="Add option..."
                  onChange={e => setNewOpt(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addOpt(); } }}
                />
                <button type="button" className="af-btn af-btn--ghost af-btn--sm" onClick={addOpt}><FaPlus /></button>
              </div>
            </div>
          </>
        )}

        <label className="af-label">Placeholder</label>
        <input className="af-input" value={q.placeholder || ''} onChange={e => setQ(p => ({ ...p, placeholder: e.target.value }))} placeholder="Hint text shown inside field..." />

        <label className="af-toggle-row">
          <input type="checkbox" checked={q.required} onChange={e => setQ(p => ({ ...p, required: e.target.checked }))} />
          <span>Required field</span>
        </label>
      </div>
      <div className="af-edit-drawer__footer">
        <button type="button" className="af-btn af-btn--ghost" onClick={onCancel}>Cancel</button>
        <button type="button" className="af-btn af-btn--primary" onClick={() => {
          if (!q.question.trim()) return toast('Question text is required', 'error');
          if (needsOptions && (!q.options || q.options.length === 0)) return toast('Add at least one option', 'error');
          onSave(q);
        }}>Save Question</button>
      </div>
    </div>
  );
}

/* ─── EditRespondentDrawer ─── */
function EditRespondentDrawer({ field, onSave, onCancel }) {
  const [f, setF] = useState({ ...EMPTY_RESPONDENT, ...field });
  return (
    <div className="af-edit-drawer">
      <div className="af-edit-drawer__header">
        <span>Edit Respondent Field</span>
        <button type="button" className="af-icon-btn" onClick={onCancel}><FaTimes /></button>
      </div>
      <div className="af-edit-drawer__body">
        <label className="af-label">Label (shown to user) *</label>
        <input
          className="af-input"
          value={f.label}
          onChange={e => {
            const label = e.target.value;
            setF(p => ({
              ...p,
              label,
              fieldName: p.fieldName || label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
            }));
          }}
          placeholder="e.g. Email Address"
        />

        <label className="af-label">Internal key</label>
        <input
          className="af-input af-input--mono"
          value={f.fieldName}
          onChange={e => setF(p => ({ ...p, fieldName: e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') }))}
          placeholder="e.g. email_address"
        />
        <small className="af-hint">Used internally — auto-generated from label if left blank</small>

        <label className="af-label">Type</label>
        <div className="af-type-grid af-type-grid--sm">
          {RESPONDENT_TYPES.map(rt => {
            const Icon = rt.icon;
            return (
              <button
                key={rt.type}
                type="button"
                className={`af-type-tile ${f.type === rt.type ? 'af-type-tile--active' : ''}`}
                onClick={() => setF(p => ({ ...p, type: rt.type }))}
              >
                <Icon />
                <span>{rt.label}</span>
              </button>
            );
          })}
        </div>

        <label className="af-label">Placeholder</label>
        <input className="af-input" value={f.placeholder || ''} onChange={e => setF(p => ({ ...p, placeholder: e.target.value }))} placeholder="Hint text..." />

        <label className="af-toggle-row">
          <input type="checkbox" checked={f.required} onChange={e => setF(p => ({ ...p, required: e.target.checked }))} />
          <span>Required field</span>
        </label>
      </div>
      <div className="af-edit-drawer__footer">
        <button type="button" className="af-btn af-btn--ghost" onClick={onCancel}>Cancel</button>
        <button type="button" className="af-btn af-btn--primary" onClick={() => {
          if (!f.label.trim()) return toast('Label is required', 'error');
          const resolved = { ...f, fieldName: f.fieldName || f.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') };
          onSave(resolved);
        }}>Save Field</button>
      </div>
    </div>
  );
}

/* ─── FormBuilder (full-page drawer) ─── */
function FormBuilder({ editingForm, onClose, onSaved }) {
  const [formData, setFormData] = useState(() => ({
    ...EMPTY_FORM,
    ...(editingForm ? {
      ...editingForm,
      customQuestions: Array.isArray(editingForm.customQuestions) ? editingForm.customQuestions : [],
      respondentFields: Array.isArray(editingForm.respondentFields) ? editingForm.respondentFields : [],
      submissionDeadline: editingForm.submissionDeadline
        ? new Date(editingForm.submissionDeadline).toISOString().split('T')[0] : null,
      headerImage: editingForm.headerImage || ''
    } : {})
  }));
  const [builderTab, setBuilderTab] = useState('questions'); // 'questions' | 'respondents' | 'settings'
  const [editingQIdx, setEditingQIdx] = useState(null);       // null = not editing
  const [editingRIdx, setEditingRIdx] = useState(null);
  const [addingQ, setAddingQ] = useState(false);
  const [addingR, setAddingR] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const setQuestions = (qs) => setFormData(p => ({ ...p, customQuestions: qs }));
  const setRespondents = (rs) => setFormData(p => ({ ...p, respondentFields: rs }));

  const qDrag = useDrag(formData.customQuestions, setQuestions);
  const rDrag = useDrag(formData.respondentFields, setRespondents);

  const handleField = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({
      ...p,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? null : Number(value)) : value)
    }));
  };

  const saveQuestion = (q, idx) => {
    if (idx !== null) {
      setQuestions(formData.customQuestions.map((item, i) => i === idx ? q : item));
    } else {
      setQuestions([...formData.customQuestions, q]);
    }
    setEditingQIdx(null);
    setAddingQ(false);
  };

  const saveRespondent = (f, idx) => {
    if (idx !== null) {
      setRespondents(formData.respondentFields.map((item, i) => i === idx ? f : item));
    } else {
      setRespondents([...formData.respondentFields, f]);
    }
    setEditingRIdx(null);
    setAddingR(false);
  };

  const addFieldOfType = (type) => {
    const newQ = { ...EMPTY_QUESTION, type };
    setAddingQ(newQ);
    setEditingQIdx(null);
  };

  const handleHeaderImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return toast('Please select an image file', 'error');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('headerImage', file);
      const res = await api.post('/form/admin/upload-header', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data?.url) setFormData(p => ({ ...p, headerImage: res.data.url }));
    } catch { toast('Image upload failed', 'error'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) return toast('Title is required', 'error');
    if (!formData.description.trim()) return toast('Description is required', 'error');
    if (!formData.customRoute.trim()) return toast('Custom route is required', 'error');

    const cleanQ = formData.customQuestions
      .filter(q => q?.question?.trim())
      .map(({ _id, ...q }) => {
        const out = { ...q };
        if (!['dropdown', 'radio', 'checkbox'].includes(out.type)) delete out.options;
        if (!out.showIf) delete out.showIf;
        if (!out.validation || Object.keys(out.validation || {}).length === 0) delete out.validation;
        Object.keys(out).forEach(k => { if (out[k] === null || out[k] === undefined) delete out[k]; });
        return out;
      });

    const cleanR = formData.respondentFields
      .filter(f => f?.fieldName?.trim() && f?.label?.trim())
      .map(({ _id, ...f }) => {
        const out = { ...f };
        if (!out.validation || Object.keys(out.validation || {}).length === 0) delete out.validation;
        Object.keys(out).forEach(k => { if (out[k] === null || out[k] === undefined) delete out[k]; });
        return out;
      });

    const payload = {
      title: formData.title,
      description: formData.description,
      customRoute: formData.customRoute,
      isActive: formData.isActive,
      customQuestions: cleanQ,
      respondentFields: cleanR.length ? cleanR : undefined,
      successMessage: formData.successMessage,
      closedMessage: formData.closedMessage,
      allowMultipleSubmissions: formData.allowMultipleSubmissions,
      maxSubmissions: formData.maxSubmissions || undefined,
      submissionDeadline: formData.submissionDeadline || undefined,
      collectEmail: formData.collectEmail,
      collectName: formData.collectName,
      ...(formData.headerImage ? { headerImage: formData.headerImage } : {})
    };

    setSaving(true);
    try {
      const res = editingForm
        ? await api.put(`/form/admin/update/${editingForm._id}`, payload)
        : await api.post('/form/admin/create', payload);
      if (res.data.success) {
        toast(editingForm ? 'Form updated!' : 'Form created!');
        onSaved();
      }
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save form', 'error');
    } finally { setSaving(false); }
  };

  const activeDrawer = addingQ || editingQIdx !== null
    ? (
      <EditQuestionDrawer
        question={addingQ || formData.customQuestions[editingQIdx]}
        onSave={(q) => saveQuestion(q, editingQIdx !== null ? editingQIdx : null)}
        onCancel={() => { setAddingQ(false); setEditingQIdx(null); }}
      />
    ) : addingR || editingRIdx !== null
    ? (
      <EditRespondentDrawer
        field={addingR || formData.respondentFields[editingRIdx]}
        onSave={(f) => saveRespondent(f, editingRIdx !== null ? editingRIdx : null)}
        onCancel={() => { setAddingR(false); setEditingRIdx(null); }}
      />
    ) : null;

  return (
    <div className="af-builder-overlay">
      <div className="af-builder">
        {/* ── Builder header ── */}
        <div className="af-builder__header">
          <button type="button" className="af-back-btn" onClick={onClose}>
            <FaArrowLeft /> Forms
          </button>
          <div className="af-builder__title-area">
            <input
              className="af-builder__title-input"
              value={formData.title}
              onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
              placeholder="Form title..."
            />
          </div>
          <div className="af-builder__header-actions">
            <label className="af-toggle-pill">
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleField} />
              <span className="af-toggle-pill__track">
                <span className="af-toggle-pill__thumb" />
              </span>
              <span>{formData.isActive ? 'Active' : 'Inactive'}</span>
            </label>
            <button type="button" className="af-btn af-btn--primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving…' : (editingForm ? 'Update Form' : 'Publish Form')}
            </button>
          </div>
        </div>

        {/* ── Builder tabs ── */}
        <div className="af-builder__tabs">
          {[
            { id: 'questions',   label: 'Questions',       icon: FaWpforms },
            { id: 'respondents', label: 'Respondent Info', icon: FaUsers },
            { id: 'settings',   label: 'Settings',        icon: FaClock },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                className={`af-builder__tab ${builderTab === tab.id ? 'af-builder__tab--active' : ''}`}
                onClick={() => setBuilderTab(tab.id)}
              >
                <Icon /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Builder body ── */}
        <div className="af-builder__body">
          {/* LEFT: palette (only for questions and respondents tabs) */}
          {(builderTab === 'questions' || builderTab === 'respondents') && (
            <div className="af-palette">
              {builderTab === 'questions' ? (
                <>
                  <div className="af-palette__title">Click to add a field</div>
                  {FIELD_TYPES.map(ft => {
                    const Icon = ft.icon;
                    return (
                      <button
                        key={ft.type}
                        type="button"
                        className="af-palette__item"
                        onClick={() => addFieldOfType(ft.type)}
                      >
                        <span className="af-palette__icon" style={{ background: ft.color + '22', color: ft.color }}>
                          <Icon />
                        </span>
                        <span>{ft.label}</span>
                        <FaPlus className="af-palette__plus" />
                      </button>
                    );
                  })}
                </>
              ) : (
                <>
                  <div className="af-palette__title">Add respondent field</div>
                  {RESPONDENT_TYPES.map(rt => {
                    const Icon = rt.icon;
                    return (
                      <button
                        key={rt.type}
                        type="button"
                        className="af-palette__item"
                        onClick={() => setAddingR({ ...EMPTY_RESPONDENT, type: rt.type })}
                      >
                        <span className="af-palette__icon" style={{ background: '#64748b22', color: '#64748b' }}>
                          <Icon />
                        </span>
                        <span>{rt.label}</span>
                        <FaPlus className="af-palette__plus" />
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* RIGHT: canvas */}
          <div className="af-canvas">
            {/* ── Questions tab ── */}
            {builderTab === 'questions' && (
              <>
                {activeDrawer && builderTab === 'questions' ? activeDrawer : (
                  formData.customQuestions.length === 0 ? (
                    <div className="af-empty-canvas">
                      <FaWpforms />
                      <p>No questions yet</p>
                      <span>Click a field type on the left to add your first question</span>
                    </div>
                  ) : (
                    <div className="af-canvas__list">
                      {formData.customQuestions.map((q, i) => (
                        <QuestionCard
                          key={i} q={q} index={i} total={formData.customQuestions.length}
                          onEdit={(idx) => { setEditingQIdx(idx); setAddingQ(false); }}
                          onRemove={(idx) => setQuestions(formData.customQuestions.filter((_, ii) => ii !== idx))}
                          dragProps={qDrag}
                        />
                      ))}
                    </div>
                  )
                )}
              </>
            )}

            {/* ── Respondents tab ── */}
            {builderTab === 'respondents' && (
              <>
                {activeDrawer && builderTab === 'respondents' ? activeDrawer : (
                  <>
                    <p className="af-canvas__hint">Define what personal info you want to collect (name, email, phone…) separately from the form questions.</p>
                    {formData.respondentFields.length === 0 ? (
                      <div className="af-empty-canvas">
                        <FaUsers />
                        <p>No respondent fields</p>
                        <span>Click a field type on the left to add one</span>
                      </div>
                    ) : (
                      <div className="af-canvas__list">
                        {formData.respondentFields.map((f, i) => (
                          <RespondentCard
                            key={i} f={f} index={i}
                            onEdit={(idx) => { setEditingRIdx(idx); setAddingR(false); }}
                            onRemove={(idx) => setRespondents(formData.respondentFields.filter((_, ii) => ii !== idx))}
                            dragProps={rDrag}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* ── Settings tab ── */}
            {builderTab === 'settings' && (
              <div className="af-settings">
                {/* Header image */}
                <section className="af-settings__section">
                  <h3>Header image</h3>
                  <p className="af-settings__desc">Banner shown at the top of the form (like Google Forms)</p>
                  {formData.headerImage ? (
                    <div className="af-img-preview">
                      <img src={formData.headerImage} alt="Header" />
                      <div className="af-img-preview__actions">
                        <label className="af-btn af-btn--ghost af-btn--sm">
                          {uploading ? 'Uploading…' : 'Change image'}
                          <input type="file" accept="image/*" hidden disabled={uploading} onChange={handleHeaderImage} />
                        </label>
                        <button type="button" className="af-btn af-btn--danger af-btn--sm" onClick={() => setFormData(p => ({ ...p, headerImage: '' }))}>Remove</button>
                      </div>
                    </div>
                  ) : (
                    <label className="af-upload-area">
                      <FaImage />
                      <span>{uploading ? 'Uploading…' : 'Click to upload header image'}</span>
                      <input type="file" accept="image/*" hidden disabled={uploading} onChange={handleHeaderImage} />
                    </label>
                  )}
                </section>

                {/* Route & meta */}
                <section className="af-settings__section">
                  <h3>URL & Description</h3>
                  <label className="af-label">Custom route *</label>
                  <div className="af-route-row">
                    <span className="af-route-prefix">/f/</span>
                    <input
                      className="af-input"
                      name="customRoute"
                      value={formData.customRoute}
                      onChange={handleField}
                      placeholder="my-form"
                      pattern="[a-z0-9-]+"
                    />
                  </div>
                  <small className="af-hint">Only lowercase letters, numbers, and hyphens</small>

                  <label className="af-label" style={{ marginTop: '1.25rem' }}>Description *</label>
                  <textarea
                    className="af-input af-input--textarea"
                    name="description"
                    value={formData.description}
                    onChange={handleField}
                    rows={3}
                    placeholder="Brief description of this form..."
                  />
                </section>

                {/* Submission limits */}
                <section className="af-settings__section">
                  <h3>Submission limits</h3>
                  <div className="af-settings__row">
                    <div>
                      <label className="af-label">Deadline</label>
                      <input className="af-input" type="date" name="submissionDeadline" value={formData.submissionDeadline || ''} onChange={handleField} />
                    </div>
                    <div>
                      <label className="af-label">Max submissions</label>
                      <input className="af-input" type="number" name="maxSubmissions" value={formData.maxSubmissions || ''} onChange={handleField} min="1" placeholder="Unlimited" />
                    </div>
                  </div>
                </section>

                {/* Toggles */}
                <section className="af-settings__section">
                  <h3>Options</h3>
                  {[
                    { name: 'allowMultipleSubmissions', label: 'Allow multiple submissions from same user' },
                    { name: 'collectEmail', label: 'Collect email (legacy — use Respondent Info instead)' },
                    { name: 'collectName', label: 'Collect name (legacy — use Respondent Info instead)' },
                  ].map(opt => (
                    <label key={opt.name} className="af-toggle-row af-toggle-row--block">
                      <input type="checkbox" name={opt.name} checked={formData[opt.name]} onChange={handleField} />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </section>

                {/* Messages */}
                <section className="af-settings__section">
                  <h3>Custom messages</h3>
                  <label className="af-label">Success message</label>
                  <textarea className="af-input af-input--textarea" name="successMessage" value={formData.successMessage} onChange={handleField} rows={2} />
                  <label className="af-label" style={{ marginTop: '1rem' }}>Closed message</label>
                  <textarea className="af-input af-input--textarea" name="closedMessage" value={formData.closedMessage} onChange={handleField} rows={2} />
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── FormCard ─── */
function FormCard({ form, onEdit, onDelete, onViewResponses, onDuplicate }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/f/${form.customRoute}`;
  const copyUrl = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { toast('Failed to copy', 'error'); }
  };
  return (
    <div className="af-card">
      <div className="af-card__top">
        <div className="af-card__title-row">
          <h3 className="af-card__title">{form.title}</h3>
          <span className={`af-status ${form.isActive ? 'af-status--active' : 'af-status--inactive'}`}>
            {form.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <p className="af-card__desc">{form.description?.slice(0, 120) || '—'}{form.description?.length > 120 ? '…' : ''}</p>
      </div>

      <div className="af-card__stats">
        <div className="af-card__stat">
          <span className="af-card__stat-label">Submissions</span>
          <span className="af-card__stat-val">{form.currentSubmissions}{form.maxSubmissions ? ` / ${form.maxSubmissions}` : ''}</span>
        </div>
        <div className="af-card__stat">
          <span className="af-card__stat-label">Questions</span>
          <span className="af-card__stat-val">{form.customQuestions?.length || 0}</span>
        </div>
        <div className="af-card__stat">
          <span className="af-card__stat-label">Info fields</span>
          <span className="af-card__stat-val">{form.respondentFields?.length || 0}</span>
        </div>
      </div>

      <div className="af-card__url-row">
        <code className="af-card__url">{url}</code>
        <button type="button" className="af-copy-btn" onClick={copyUrl}>
          {copied ? <><FaCheck /> Copied</> : <><FaCopy /> Copy</>}
        </button>
      </div>

      <div className="af-card__actions">
        <a href={`/f/${form.customRoute}`} target="_blank" rel="noopener noreferrer" className="af-btn af-btn--ghost af-btn--sm">
          <FaExternalLinkAlt /> Preview
        </a>
        <button type="button" className="af-btn af-btn--ghost af-btn--sm" onClick={() => onViewResponses(form)}>
          <FaEye /> Responses
        </button>
        <button type="button" className="af-btn af-btn--ghost af-btn--sm" onClick={() => onEdit(form)}>
          <FaEdit /> Edit
        </button>
        <button type="button" className="af-btn af-btn--ghost af-btn--sm" onClick={() => onDuplicate(form._id)} title="Duplicate form">
          <FaClone /> Duplicate
        </button>
        <button type="button" className="af-btn af-btn--danger af-btn--sm" onClick={() => onDelete(form._id)}>
          <FaTrash />
        </button>
      </div>
    </div>
  );
}

/* ─── Main AdminForms ─── */
const AdminForms = () => {
  const { user, isLoading } = useAuth();
  const [forms, setForms] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('forms');
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [questionFilter, setQuestionFilter] = useState({ questionIndex: '', answerValue: '' });
  const [choiceQuestions, setChoiceQuestions] = useState([]);

  useEffect(() => { fetchForms(); }, []);

  const fetchForms = async () => {
    try { setLoading(true); const r = await api.get('/form/admin/all'); setForms(r.data.data || []); }
    catch { toast('Failed to load forms', 'error'); }
    finally { setLoading(false); }
  };

  const fetchResponses = async (formId, page = 1, search = '', filter = null) => {
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (filter?.questionIndex !== '' && filter?.answerValue !== '') {
        params.questionIndex = filter.questionIndex;
        params.answerValue = filter.answerValue;
      }
      const r = await api.get(`/form/admin/responses/${formId}`, { params });
      setResponses(r.data.data.responses);
      setPagination(r.data.data.pagination || { current: page, pages: 1, total: r.data.data.responses.length });
      setCurrentPage(page);
    } catch { toast('Failed to load responses', 'error'); }
  };

  const deleteForm = async (id) => {
    if (!window.confirm('Delete this form? This will also delete all responses.')) return;
    try {
      await api.delete(`/form/admin/delete/${id}`);
      toast('Form deleted');
      fetchForms();
    } catch (err) { toast(err.response?.data?.message || 'Error deleting form', 'error'); }
  };

  const duplicateForm = async (id) => {
    try {
      await api.post(`/form/admin/duplicate/${id}`);
      toast('Form duplicated — edit the copy to activate it');
      fetchForms();
    } catch (err) { toast(err.response?.data?.message || 'Error duplicating form', 'error'); }
  };

  const updateResponseStatus = async (responseId, status) => {
    try {
      await api.put(`/form/admin/response/${responseId}/status`, { status });
      toast('Status updated');
      if (selectedForm) fetchResponses(selectedForm._id, currentPage, searchQuery, questionFilter);
    } catch { toast('Error updating status', 'error'); }
  };

  const openViewResponses = (form) => {
    setSelectedForm(form);
    setCurrentPage(1);
    setSearchQuery('');
    setQuestionFilter({ questionIndex: '', answerValue: '' });
    const cq = (form.customQuestions || []).map((q, idx) => ({ ...q, index: idx })).filter(q => ['dropdown', 'radio', 'checkbox'].includes(q.type));
    setChoiceQuestions(cq);
    fetchResponses(form._id, 1, '', null);
    setActiveTab('responses');
  };

  if (isLoading) return <Loader />;
  if (!canView(user, 'forms')) return <Navigate to="/admin/dashboard" replace />;
  if (loading) return <Loader />;

  return (
    <>
      <ToastContainer />

      {showBuilder && (
        <FormBuilder
          editingForm={editingForm}
          onClose={() => { setShowBuilder(false); setEditingForm(null); }}
          onSaved={() => { setShowBuilder(false); setEditingForm(null); fetchForms(); }}
        />
      )}

      <div className="af-page">
        {/* Page header */}
        <div className="af-page__header">
          <div>
            <h1 className="af-page__title">Form Management</h1>
            <p className="af-page__subtitle">{forms.length} form{forms.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="af-btn af-btn--primary" onClick={() => { setEditingForm(null); setShowBuilder(true); }}>
            <FaPlus /> New Form
          </button>
        </div>

        {/* Tabs */}
        <div className="af-tabs">
          <button className={`af-tab ${activeTab === 'forms' ? 'af-tab--active' : ''}`} onClick={() => setActiveTab('forms')}>
            <FaWpforms /> Forms
          </button>
          <button className={`af-tab ${activeTab === 'responses' ? 'af-tab--active' : ''}`} onClick={() => setActiveTab('responses')}>
            <FaUsers /> Responses {selectedForm && <span className="af-tab__badge">{selectedForm.title}</span>}
          </button>
        </div>

        {/* Forms grid */}
        {activeTab === 'forms' && (
          <div className="af-grid">
            {forms.length === 0 ? (
              <div className="af-empty-page">
                <FaWpforms />
                <p>No forms yet</p>
                <span>Create your first form to get started</span>
                <button className="af-btn af-btn--primary" onClick={() => { setEditingForm(null); setShowBuilder(true); }}>
                  <FaPlus /> Create Form
                </button>
              </div>
            ) : forms.map(form => (
              <FormCard
                key={form._id}
                form={form}
                onEdit={(f) => { setEditingForm(f); setShowBuilder(true); }}
                onDelete={deleteForm}
                onViewResponses={openViewResponses}
                onDuplicate={duplicateForm}
              />
            ))}
          </div>
        )}

        {/* Responses */}
        {activeTab === 'responses' && (
          <div className="af-responses">
            {selectedForm && (
              <div className="af-responses__header">
                <h2>Responses for <em>{selectedForm.title}</em></h2>
                <span className="af-responses__total">{pagination.total} total</span>
              </div>
            )}

            {/* Search */}
            {selectedForm && (
              <div className="af-search-bar">
                <FaSearch className="af-search-bar__icon" />
                <input
                  className="af-search-bar__input"
                  type="text"
                  placeholder="Search by name, email, or answers..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    if (!e.target.value) fetchResponses(selectedForm._id, 1, '');
                  }}
                  onKeyDown={e => { if (e.key === 'Enter') fetchResponses(selectedForm._id, 1, searchQuery, questionFilter); }}
                />
                {searchQuery && (
                  <button type="button" className="af-icon-btn" onClick={() => { setSearchQuery(''); fetchResponses(selectedForm._id, 1, ''); }}>
                    <FaTimes />
                  </button>
                )}
              </div>
            )}

            {/* Question filter */}
            {selectedForm && choiceQuestions.length > 0 && (
              <div className="af-filter-bar">
                <span className="af-filter-bar__label">Filter by:</span>
                <select
                  className="af-select"
                  value={questionFilter.questionIndex}
                  onChange={e => {
                    const nf = { questionIndex: e.target.value, answerValue: '' };
                    setQuestionFilter(nf);
                    fetchResponses(selectedForm._id, 1, searchQuery, nf);
                  }}
                >
                  <option value="">Select question…</option>
                  {choiceQuestions.map(q => <option key={q.index} value={q.index}>{q.question}</option>)}
                </select>
                {questionFilter.questionIndex !== '' && (
                  <>
                    <select
                      className="af-select"
                      value={questionFilter.answerValue}
                      onChange={e => {
                        const nf = { ...questionFilter, answerValue: e.target.value };
                        setQuestionFilter(nf);
                        fetchResponses(selectedForm._id, 1, searchQuery, nf);
                      }}
                    >
                      <option value="">Select answer…</option>
                      {choiceQuestions.find(q => q.index === parseInt(questionFilter.questionIndex))?.options?.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <button type="button" className="af-btn af-btn--ghost af-btn--sm" onClick={() => {
                      const cf = { questionIndex: '', answerValue: '' };
                      setQuestionFilter(cf);
                      fetchResponses(selectedForm._id, 1, searchQuery, cf);
                    }}>Clear</button>
                  </>
                )}
              </div>
            )}

            {/* Table */}
            {responses.length === 0 ? (
              <div className="af-empty-page">
                <FaUsers />
                <p>{searchQuery ? 'No results found' : 'No responses yet'}</p>
              </div>
            ) : (
              <>
                <div className="af-table-wrap">
                  <table className="af-table">
                    <thead>
                      <tr>
                        {selectedForm?.respondentFields?.length > 0
                          ? selectedForm.respondentFields.slice(0, 3).map(f => <th key={f.fieldName}>{f.label}</th>)
                          : <><th>Name</th><th>Email</th></>}
                        <th>Submitted</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {responses.map(resp => (
                        <tr key={resp._id} className="af-table__row" onClick={() => { setSelectedResponse(resp); setShowResponseModal(true); }}>
                          {selectedForm?.respondentFields?.length > 0
                            ? selectedForm.respondentFields.slice(0, 3).map(f => <td key={f.fieldName}>{resp.respondentInfo?.[f.fieldName] || '—'}</td>)
                            : <><td>{resp.respondentInfo?.name || '—'}</td><td>{resp.respondentInfo?.email || '—'}</td></>}
                          <td>{new Date(resp.submittedAt).toLocaleDateString()}</td>
                          <td onClick={e => e.stopPropagation()}>
                            <select
                              className="af-status-select"
                              value={resp.status}
                              onChange={e => updateResponseStatus(resp._id, e.target.value)}
                            >
                              <option value="submitted">Submitted</option>
                              <option value="reviewed">Reviewed</option>
                              <option value="archived">Archived</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {pagination.pages > 1 && (
                  <div className="af-pagination">
                    <button className="af-btn af-btn--ghost af-btn--sm" disabled={currentPage === 1} onClick={() => fetchResponses(selectedForm._id, currentPage - 1, searchQuery, questionFilter)}>← Prev</button>
                    <span>{currentPage} / {pagination.pages}</span>
                    <button className="af-btn af-btn--ghost af-btn--sm" disabled={currentPage === pagination.pages} onClick={() => fetchResponses(selectedForm._id, currentPage + 1, searchQuery, questionFilter)}>Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Response detail modal */}
      {showResponseModal && selectedResponse && (
        <div className="af-modal-overlay" onClick={() => setShowResponseModal(false)}>
          <div className="af-modal" onClick={e => e.stopPropagation()}>
            <div className="af-modal__header">
              <h2>Response Details</h2>
              <button className="af-icon-btn" onClick={() => setShowResponseModal(false)}><FaTimes /></button>
            </div>
            <div className="af-modal__body">
              <div className="af-resp-info">
                <h3>Respondent</h3>
                {selectedForm?.respondentFields?.length > 0
                  ? selectedForm.respondentFields.map(f => (
                    <div key={f.fieldName} className="af-resp-field">
                      <span className="af-resp-field__label">{f.label}</span>
                      <span>{selectedResponse.respondentInfo?.[f.fieldName] || '—'}</span>
                    </div>
                  ))
                  : <>
                    <div className="af-resp-field"><span className="af-resp-field__label">Name</span><span>{selectedResponse.respondentInfo?.name || '—'}</span></div>
                    <div className="af-resp-field"><span className="af-resp-field__label">Email</span><span>{selectedResponse.respondentInfo?.email || '—'}</span></div>
                  </>}
                <div className="af-resp-field">
                  <span className="af-resp-field__label">Submitted</span>
                  <span>{new Date(selectedResponse.submittedAt).toLocaleString()}</span>
                </div>
                <div className="af-resp-field">
                  <span className="af-resp-field__label">Status</span>
                  <span className={`af-status af-status--${selectedResponse.status}`}>{selectedResponse.status}</span>
                </div>
              </div>
              {selectedResponse.answers?.length > 0 && (
                <div className="af-resp-answers">
                  <h3>Answers</h3>
                  {selectedResponse.answers
                    .filter(a => a.answer !== '' && !(Array.isArray(a.answer) && a.answer.length === 0))
                    .map((a, i) => (
                      <div key={i} className="af-answer">
                        <div className="af-answer__q">{a.question}</div>
                        <div className="af-answer__a">{Array.isArray(a.answer) ? a.answer.join(', ') : String(a.answer)}</div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            <div className="af-modal__footer">
              <button className="af-btn af-btn--ghost" onClick={() => setShowResponseModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminForms;
