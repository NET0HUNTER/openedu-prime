import React, { useEffect, useState } from 'react';
import {
  Trash2, Star, Mail, Phone, Search, Paperclip, Users, Bot, Smile, Maximize2,
  CheckSquare, Upload, Smartphone, PlayCircle,
} from 'lucide-react';
import { getReportsForModel, checkModelAccess, type FieldDef, type ModelDef } from '@shared/meta/index';
import { apiFetch, callKw } from '../../lib/api';
import { formatDate, formatDateTime, formatMoney } from '../../lib/format';
import { useErp } from '../../context/ErpContext';
import type { Rec } from '../../lib/types';

interface FormViewProps {
  modelDef: ModelDef;
  recordId?: number;
  saveSignal?: number;
  discardSignal?: number;
  onDirtyChange?: (dirty: boolean) => void;
  onSaved: (rec: Rec) => void;
  onDeleted: () => void;
  onSmartDrill: (targetModel: string, field: string, id: number) => void;
  onSmartCounts?: (counts: any[]) => void;
}

export const FormView: React.FC<FormViewProps> = ({
  modelDef, recordId, saveSignal = 0, discardSignal = 0, onDirtyChange, onSaved, onDeleted, onSmartCounts,
}) => {
  const { showToast, activeCompany, currencyCode, term, models, refreshSession, user, navigate } = useErp();
  void getReportsForModel;
  const [form, setForm] = useState<Record<string, any>>({});
  const [messages, setMessages] = useState<Rec[]>([]);
  const [relOptions, setRelOptions] = useState<Record<string, { id: number; label: string }[]>>({});
  const [activeTab, setActiveTab] = useState(0);
  const [chatterMode, setChatterMode] = useState<'comment' | 'note' | 'whatsapp' | null>(null);
  const [chatterText, setChatterText] = useState('');
  const [focusedDateField, setFocusedDateField] = useState<string | null>(null);
  const [inlineDrafts, setInlineDrafts] = useState<Record<string, Record<string, any>>>({});
  const [addingLineFor, setAddingLineFor] = useState<string | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityForm, setActivityForm] = useState({ activity_type: 'To-Do', summary: 'To-Do', date_deadline: new Date().toISOString().slice(0, 10), note: '' });
  const [showPayModal, setShowPayModal] = useState(false);
  const [payForm, setPayForm] = useState({ journal: 'Bank', method: 'Manual Payment', bankAccount: 'KCB OERB — 1104829910', amount: 0, date: new Date().toISOString().slice(0, 10), memo: '' });
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [mpesaForm, setMpesaForm] = useState({ phone: '+254722810400', amount: 0 });
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [printPreviewHtml, setPrintPreviewHtml] = useState<string | null>(null);
  const [integrationTestResult, setIntegrationTestResult] = useState<string | null>(null);
  const [chatterSearchOpen, setChatterSearchOpen] = useState(false);
  const [chatterQuery, setChatterQuery] = useState('');
  const [chatterExpanded, setChatterExpanded] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowActivityModal(false);
        setShowPayModal(false);
        setShowMpesaModal(false);
        setShowQuizModal(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const updateForm = (updater: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)) => {
    setForm(updater);
    onDirtyChange?.(true);
  };

  const loadRecord = async (id?: number) => {
    onDirtyChange?.(false);
    if (id) {
      const res = await callKw(modelDef.name, 'web_read', { id });
      setForm(res.record ?? {});
      setMessages(res.messages ?? []);
      onSmartCounts?.(res.record?._smart_counts ?? []);
    } else {
      const init: Record<string, any> = {};
      for (const f of Object.values(modelDef.fields)) {
        if (f.default === 'company') init[f.name] = activeCompany?.id ?? 1;
        else if (f.default === 'today') init[f.name] = new Date().toISOString().slice(0, 10);
        else if (f.default === 'now') init[f.name] = new Date().toISOString().slice(0, 16).replace('T', ' ');
        else if (f.default === 'true') init[f.name] = true;
        else if (f.default === 'false') init[f.name] = false;
        else if (f.default !== undefined) {
          init[f.name] = f.type === 'integer' || f.type === 'float' || f.type === 'monetary' ? Number(f.default) : f.default;
        }
      }
      setForm(init);
      setMessages([]);
      onSmartCounts?.([]);
    }
  };

  useEffect(() => {
    loadRecord(recordId);
    setActiveTab(0);
    const relModels = Array.from(new Set(
      Object.values(modelDef.fields)
        .filter((f) => (f.type === 'many2one' || f.type === 'many2many') && f.relation)
        .map((f) => f.relation!),
    ));
    Promise.all(
      relModels.map(async (rm) => {
        const res = await callKw(rm, 'name_search', { search: '' }).catch(() => ({ options: [] }));
        return [rm, res.options ?? []] as const;
      }),
    ).then((pairs) => setRelOptions(Object.fromEntries(pairs)));
  }, [modelDef.name, recordId]);

  const handleSave = async () => {
    try {
      const res = await callKw(modelDef.name, 'web_save', { id: recordId, vals: form });
      showToast(`${modelDef.string} saved`);
      setForm(res.record);
      onDirtyChange?.(false);
      onSaved(res.record);
    } catch (e: any) {
      showToast(e.message || 'Save failed', 'error');
    }
  };

  useEffect(() => {
    if (saveSignal > 0) handleSave();
  }, [saveSignal]);

  useEffect(() => {
    if (discardSignal > 0) {
      loadRecord(recordId);
      showToast('Changes discarded');
    }
  }, [discardSignal]);

  const handleAction = async (method: string) => {
    if (!recordId) {
      showToast('Save the record first before running workflow actions.', 'error');
      return;
    }
    if ((method === 'print_invoice' || method === 'action_print_pdf') && modelDef.name === 'account.move') {
      try {
        const res = await fetch(`/report/pdf/account.report_invoice_with_payments/${recordId}`);
        const ctype = res.headers.get('content-type') || '';
        if (res.ok && ctype.includes('application/pdf')) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${String(form.name || `Invoice_${recordId}`).replace(/[/\\]/g, '_')}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          showToast('Invoice PDF downloaded.');
        } else {
          const html = await res.text();
          setPrintPreviewHtml(html);
          showToast('Opened printable QWeb Invoice preview.');
        }
      } catch (err: any) {
        showToast(err?.message || 'Unable to generate invoice report', 'error');
      }
      return;
    }
    if ((method === 'mark_paid' || method === 'action_register_payment') && modelDef.name === 'account.move') {
      setPayForm({
        journal: 'Bank',
        method: 'Manual Payment',
        bankAccount: 'KCB OERB — 1104829910',
        amount: Number(form.amount_residual ?? form.amount_total ?? 0),
        date: new Date().toISOString().slice(0, 10),
        memo: String(form.name || ''),
      });
      setShowPayModal(true);
      return;
    }
    if (method === 'pay_mpesa' && modelDef.name === 'account.move') {
      setMpesaForm({
        phone: '+254722810400',
        amount: Number(form.amount_residual ?? form.amount_total ?? 0),
      });
      setShowMpesaModal(true);
      return;
    }
    if (method === 'view_quiz' && modelDef.name === 'op.quiz') {
      setQuizAnswers({});
      setShowQuizModal(true);
      return;
    }
    try {
      const res = await callKw(modelDef.name, method, { id: recordId });
      if (res.record) setForm(res.record);
      onDirtyChange?.(false);
      if (res.message) showToast(res.message);
      const read = await callKw(modelDef.name, 'web_read', { id: recordId });
      setMessages(read.messages ?? []);
      onSmartCounts?.(read.record?._smart_counts ?? []);
    } catch (e: any) {
      showToast(e.message || 'Action failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!recordId) return;
    await callKw(modelDef.name, 'unlink', { id: recordId });
    showToast(`${modelDef.string} deleted`);
    onDeleted();
  };

  const postChatter = async () => {
    if (!recordId || !chatterText.trim()) return;
    await callKw('mail.message', 'create', {
      vals: { res_model: modelDef.name, res_id: recordId, body: chatterText.trim(), message_type: chatterMode || 'comment' },
    });
    setChatterText('');
    setChatterMode(null);
    const read = await callKw(modelDef.name, 'web_read', { id: recordId });
    setMessages(read.messages ?? []);
  };

  const canWrite = checkModelAccess(modelDef.name, (user?.role || 'admin') as any, recordId ? 'write' : 'create').allowed;
  const stageField = modelDef.stageField ? modelDef.fields[modelDef.stageField] : undefined;
  const currentStage = modelDef.stageField ? String(form[modelDef.stageField] ?? '') : '';
  const seenBtnLabels = new Set<string>();
  const READ_ONLY_SAFE_ACTIONS = new Set(['print_invoice', 'action_print_pdf', 'view_quiz']);
  const isPortalUser = user?.role === 'student' || user?.role === 'parent';
  const visibleButtons = modelDef.buttons.filter((b) => {
    const matchState = b.states === '*' || !currentStage || b.states.includes(currentStage);
    const matchRole = !canWrite
      ? READ_ONLY_SAFE_ACTIONS.has(b.name) || (isPortalUser && b.name === 'pay_mpesa')
      : (!isPortalUser
          ? true
          : ['act_submit', 'get_action_submit', 'get_action_done', 'pay_mpesa', 'enroll_learner', 'action_complete', 'action_start', 'action_reset', 'sign_now', 'action_submit', 'action_submitted', 'submit', 'view_quiz', 'action_confirm'].includes(b.name));
    if (!matchState || !matchRole) return false;
    const lblKey = b.string.trim().toLowerCase();
    if (seenBtnLabels.has(lblKey)) return false;
    seenBtnLabels.add(lblKey);
    return true;
  });

  const seenTabTitles = new Set<string>();
  const formTabs = modelDef.form.tabs.filter((t) => {
    const key = t.title.trim().toLowerCase();
    if (seenTabTitles.has(key)) return false;
    seenTabTitles.add(key);
    return true;
  });

  const isPersonForm = Boolean(modelDef.fields.first_name && modelDef.fields.last_name);
  const fullName = isPersonForm
    ? [form.first_name, form.middle_name, form.last_name].filter(Boolean).join(' ')
    : String(form[modelDef.form.title] ?? '');

  const skipInGroups = new Set<string>([
    ...(isPersonForm ? ['title', 'name', 'first_name', 'middle_name', 'last_name', 'email', 'phone', 'image', 'image_1920'] : []),
    ...(modelDef.name === 'account.move' ? ['narration'] : []),
  ]);

  const renderFieldInput = (f: FieldDef) => {
    const val = form[f.name];
    const ro = Boolean(f.readonly) || !canWrite;

    if (f.type === 'image') {
      const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => updateForm((p) => ({ ...p, [f.name]: String(reader.result || '') }));
        reader.readAsDataURL(file);
      };
      return (
        <div className="flex items-center gap-3">
          {typeof val === 'string' && val.startsWith('data:image') && (
            <img src={val} alt={f.string} className="w-12 h-12 rounded object-cover border border-slate-200" />
          )}
          {!ro && (
            <label className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium cursor-pointer">
              Upload Photo
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
          )}
        </div>
      );
    }

    if (f.type === 'boolean') {
      return (
        <input
          type="checkbox"
          disabled={ro}
          checked={Boolean(val)}
          onChange={(e) => updateForm({ ...form, [f.name]: e.target.checked })}
          className="mt-1 rounded accent-[var(--oe-brand-primary)]"
        />
      );
    }
    if (f.type === 'priority') {
      return (
        <div className="flex items-center gap-1 py-0.5">
          {[1, 2, 3].map((n) => (
            <button key={n} type="button" onClick={() => updateForm({ ...form, [f.name]: n })}>
              <Star size={15} className={Number(val) >= n ? 'fill-amber-400 text-amber-500' : 'text-slate-300'} />
            </button>
          ))}
        </div>
      );
    }
    if (f.type === 'selection') {
      return (
        <select
          disabled={ro}
          value={val ?? ''}
          onChange={(e) => updateForm({ ...form, [f.name]: e.target.value })}
          className="oe-input"
        >
          <option value="">—</option>
          {(f.selection ?? []).map(([k, lbl]) => <option key={k} value={k}>{lbl}</option>)}
        </select>
      );
    }
    if (f.type === 'many2one' && f.relation) {
      const opts = relOptions[f.relation] ?? [];
      return (
        <div>
          <select
            disabled={ro}
            value={val ?? ''}
            onChange={async (e) => {
              const nextVal = e.target.value ? Number(e.target.value) : null;
              const nextForm = { ...form, [f.name]: nextVal };
              updateForm(nextForm);
              try {
                const oc = await callKw(modelDef.name, 'onchange', { vals: nextForm, field: f.name });
                if (oc?.value && Object.keys(oc.value).length > 0) {
                  setForm((p) => ({ ...p, ...oc.value }));
                }
              } catch {
                // ignore optional onchange failures
              }
            }}
            className="oe-input text-[var(--oe-brand-primary)] font-normal"
          >
            <option value="">—</option>
            {opts.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
          {modelDef.name === 'account.move' && f.name === 'partner_id' && form._partner_address && (
            <div className="px-1 pt-0.5 text-[11.5px] text-slate-500 leading-snug">
              {form._partner_address}
            </div>
          )}
        </div>
      );
    }
    if (f.type === 'many2many' && f.relation) {
      const opts = relOptions[f.relation] ?? [];
      const selected: number[] = Array.isArray(val) ? val : [];
      return (
        <div className="space-y-1">
          <div className="flex flex-wrap gap-1">
            {selected.map((sid) => {
              const lbl = opts.find((o) => o.id === sid)?.label ?? `#${sid}`;
              return (
                <span key={sid} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--oe-surface-pale-blue)] text-[var(--oe-brand-primary)]">
                  {lbl}
                  {!ro && <button type="button" onClick={() => updateForm({ ...form, [f.name]: selected.filter((x) => x !== sid) })}>×</button>}
                </span>
              );
            })}
          </div>
          {!ro && (
            <select
              value=""
              onChange={(e) => {
                const nid = Number(e.target.value);
                if (nid && !selected.includes(nid)) updateForm({ ...form, [f.name]: [...selected, nid] });
              }}
              className="oe-input text-xs text-slate-500"
            >
              <option value="">+ Add...</option>
              {opts.filter((o) => !selected.includes(o.id)).map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          )}
        </div>
      );
    }
    if (f.type === 'text' || f.type === 'html') {
      return (
        <textarea
          disabled={ro}
          rows={f.type === 'html' ? 5 : 3}
          value={val ?? ''}
          onChange={(e) => updateForm({ ...form, [f.name]: e.target.value })}
          className="oe-input"
        />
      );
    }
    if (f.type === 'one2many') {
      const rows: Rec[] = Array.isArray(val) ? val : [];
      const relDef = models[f.relation!];
      const cols = relDef?.list.filter((c) => c !== f.inverse).slice(0, 6) ?? ['id', 'name'];
      const draft = inlineDrafts[f.name] ?? {};
      const isAdding = addingLineFor === f.name;

      const addLine = async () => {
        if (!f.relation || !f.inverse) return;
        if (!recordId) {
          const tempLine = { ...draft, id: -Date.now() };
          updateForm((p) => ({ ...p, [f.name]: [...(Array.isArray(p[f.name]) ? p[f.name] : []), tempLine] }));
          setInlineDrafts((p) => ({ ...p, [f.name]: {} }));
          setAddingLineFor(null);
          showToast('Line staged (click Save to persist)');
          return;
        }
        try {
          await callKw(f.relation, 'web_save', { vals: { ...draft, [f.inverse]: recordId } });
          setInlineDrafts((p) => ({ ...p, [f.name]: {} }));
          setAddingLineFor(null);
          await loadRecord(recordId);
          showToast('Line added');
        } catch (err: any) {
          showToast(err.message || 'Failed to add line', 'error');
        }
      };

      const deleteLine = async (rowId: number) => {
        if (!recordId || rowId < 0) {
          updateForm((p) => ({ ...p, [f.name]: (Array.isArray(p[f.name]) ? p[f.name] : []).filter((x: any) => x.id !== rowId) }));
          return;
        }
        if (!f.relation) return;
        await callKw(f.relation, 'unlink', { id: rowId });
        await loadRecord(recordId);
        showToast('Line removed');
      };

      return (
        <div className="border border-slate-200 rounded overflow-x-auto bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                {cols.map((c) => {
                  const cf = relDef?.fields[c];
                  const isNum = cf?.type === 'monetary' || cf?.type === 'float' || cf?.type === 'integer';
                  return (
                    <th key={c} className={`px-3 py-2 font-semibold ${isNum ? 'text-right' : ''}`}>
                      {cf?.string || c}
                    </th>
                  );
                })}
                {!ro && (canWrite || Boolean(recordId)) && <th className="w-8 px-2 py-2" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 && !isAdding ? (
                <tr><td colSpan={cols.length + 1} className="px-3 py-3 text-center text-slate-400">No records</td></tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    {cols.map((c) => {
                      const cf = relDef?.fields[c];
                      const rawVal = row[`${c}__label`] ?? row[c];
                      if (cf?.type === 'boolean') {
                        return (
                          <td key={c} className="px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={Boolean(row[c])}
                              disabled={ro}
                              onChange={async (e) => {
                                if (!f.relation) return;
                                await callKw(f.relation, 'write', { id: row.id, vals: { [c]: e.target.checked } });
                                await loadRecord(recordId);
                              }}
                              className="rounded accent-[var(--oe-brand-primary)] cursor-pointer"
                            />
                          </td>
                        );
                      }
                      if (cf?.type === 'monetary') {
                        return (
                          <td key={c} className="px-3 py-2 text-right font-mono whitespace-nowrap">
                            {formatMoney(row[c], currencyCode)}
                          </td>
                        );
                      }
                      if (cf?.type === 'float') {
                        return <td key={c} className="px-3 py-2 text-right font-mono">{Number(row[c] ?? 0).toFixed(2)}</td>;
                      }
                      if (cf?.type === 'integer') {
                        return <td key={c} className="px-3 py-2 text-right font-mono">{Number(row[c] ?? 0)}</td>;
                      }
                      if (cf?.type === 'date') {
                        return <td key={c} className="px-3 py-2 whitespace-nowrap">{formatDate(rawVal) || '—'}</td>;
                      }
                      if (cf?.type === 'datetime') {
                        return <td key={c} className="px-3 py-2 whitespace-nowrap">{formatDateTime(rawVal) || '—'}</td>;
                      }
                      if (c === 'tax_label' && rawVal) {
                        return (
                          <td key={c} className="px-3 py-2 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium whitespace-nowrap">
                              {String(rawVal)}
                            </span>
                          </td>
                        );
                      }
                      return <td key={c} className="px-3 py-2">{String(rawVal ?? '—')}</td>;
                    })}
                    {!ro && (
                      <td className="px-2 py-2 text-right">
                        <button type="button" onClick={() => deleteLine(row.id)} className="text-slate-400 hover:text-rose-600" title="Remove">
                          <Trash2 size={12} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
              {isAdding && (
                <tr className="bg-blue-50/40">
                  {cols.map((c) => {
                    const cf = relDef?.fields[c];
                    return (
                      <td key={c} className="px-2 py-1.5">
                        {cf?.type === 'many2one' && cf.relation ? (
                          <select
                            value={draft[c] ?? ''}
                            onChange={(e) => setInlineDrafts((p) => ({ ...p, [f.name]: { ...draft, [c]: e.target.value ? Number(e.target.value) : undefined } }))}
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                          >
                            <option value="">Select...</option>
                            {(relOptions[cf.relation] ?? []).map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                          </select>
                        ) : cf?.type === 'selection' && cf.selection ? (
                          <select
                            value={draft[c] ?? cf.selection[0]?.[0] ?? ''}
                            onChange={(e) => setInlineDrafts((p) => ({ ...p, [f.name]: { ...draft, [c]: e.target.value } }))}
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                          >
                            {cf.selection.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                          </select>
                        ) : cf?.type === 'boolean' ? (
                          <div className="flex items-center justify-center pt-1">
                            <input
                              type="checkbox"
                              checked={Boolean(draft[c])}
                              onChange={(e) => setInlineDrafts((p) => ({ ...p, [f.name]: { ...draft, [c]: e.target.checked } }))}
                              className="rounded accent-[var(--oe-brand-primary)] cursor-pointer"
                            />
                          </div>
                        ) : (
                          <input
                            type={cf?.type === 'date' ? 'date' : cf?.type === 'integer' || cf?.type === 'float' || cf?.type === 'monetary' ? 'number' : 'text'}
                            value={draft[c] ?? ''}
                            placeholder={cf?.string || c}
                            onChange={(e) => setInlineDrafts((p) => ({
                              ...p,
                              [f.name]: {
                                ...draft,
                                [c]: cf?.type === 'integer' || cf?.type === 'float' || cf?.type === 'monetary' ? Number(e.target.value) : e.target.value,
                              },
                            }))}
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                          />
                        )}
                      </td>
                    );
                  })}
                  <td className="px-2 py-1.5 flex items-center gap-1">
                    <button type="button" onClick={addLine} className="px-2 py-1 rounded bg-[var(--oe-brand-primary)] text-white text-[11px] font-medium">Add</button>
                    <button type="button" onClick={() => setAddingLineFor(null)} className="px-1.5 py-1 rounded bg-slate-200 text-slate-600 text-[11px]">×</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {!ro && !isAdding && canWrite && (
            <div className="px-3 py-1.5 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={async () => {
                  const neededRels = cols.map((c) => relDef?.fields[c]).filter((cf) => cf?.type === 'many2one' && cf.relation);
                  for (const cf of neededRels) {
                    if (cf?.relation && !relOptions[cf.relation]) {
                      const r = await callKw(cf.relation, 'name_search', { search: '' }).catch(() => ({ options: [] }));
                      setRelOptions((prev) => ({ ...prev, [cf.relation!]: r.options ?? [] }));
                    }
                  }
                  setAddingLineFor(f.name);
                }}
                className="text-[var(--oe-brand-primary)] hover:underline text-xs font-medium"
              >
                + Add a line
              </button>
            </div>
          )}
        </div>
      );
    }
    if (f.type === 'date' && focusedDateField !== f.name) {
      const displayVal = val ? formatDate(val) : '';
      return (
        <button
          type="button"
          disabled={ro}
          onClick={() => !ro && setFocusedDateField(f.name)}
          className="oe-input text-left min-h-[26px] text-slate-800"
        >
          {displayVal || <span className="text-slate-300 select-none">—</span>}
        </button>
      );
    }
    if (f.type === 'monetary' && focusedDateField !== f.name) {
      return (
        <button
          type="button"
          disabled={ro}
          onClick={() => !ro && setFocusedDateField(f.name)}
          className="oe-input text-left font-mono font-medium text-slate-800 min-h-[26px]"
        >
          {formatMoney(val, currencyCode)}
        </button>
      );
    }
    return (
      <div className="flex items-center gap-1">
        {f.type === 'monetary' && <span className="text-[11px] text-slate-500">{currencyCode}</span>}
        <input
          type={f.type === 'date' ? 'date' : f.type === 'integer' || f.type === 'float' || f.type === 'monetary' ? 'number' : 'text'}
          autoFocus={focusedDateField === f.name}
          onBlur={() => setFocusedDateField(null)}
          disabled={ro}
          value={val ?? ''}
          onChange={(e) => updateForm({
            ...form,
            [f.name]: f.type === 'integer' || f.type === 'float' || f.type === 'monetary'
              ? (e.target.value === '' ? '' : Number(e.target.value))
              : e.target.value,
          })}
          className="oe-input"
        />
      </div>
    );
  };

  const chatterBottom = activeCompany?.chatter_position === 'bottom';
  const allStages = stageField?.selection ?? [];
  const visibleStages = allStages.length <= 5
    ? allStages
    : (() => {
        const keySet = new Set(['draft', 'confirm', 'done', currentStage].filter(Boolean));
        const filtered = allStages.filter(([k]) => keySet.has(k));
        return filtered.length >= 2 ? filtered : allStages.slice(0, 4);
      })();

  const isStudentStacked = modelDef.name === 'op.student';
  const paidAmount = modelDef.name === 'account.move'
    ? Math.max(0, Number(form.amount_total || 0) - Number(form.amount_residual ?? form.amount_total ?? 0))
    : 0;

  return (
    <div className="p-3 bg-[var(--oe-bg-workspace)] min-h-[calc(100vh-6rem)]">
      {/* Side-by-Side (or Bottom) Form Sheet + Chatter matching Real OpenEduCat */}
      <div className={`flex flex-col ${chatterBottom ? '' : 'md:flex-row'} items-start gap-4`}>
        {/* Left: Optional Statusbar + White Form Sheet */}
        <div className={`flex-1 min-w-0 w-full ${chatterBottom ? 'max-w-[1040px] mx-auto' : 'max-w-[910px]'}`}>
          {/* Statusbar Action Buttons + Stage Chevrons: ONLY render if workflow stageField or buttons exist! */}
          {(allStages.length > 0 || visibleButtons.length > 0) && (
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-1 border-b border-[#dee2e6]">
              {/* Left: Workflow Action Buttons only (No Save or Delete in statusbar) */}
              <div className="flex flex-wrap items-center gap-1.5">
                {visibleButtons.map((b) => (
                  <button
                    key={b.name}
                    onClick={() => handleAction(b.name)}
                    className={`px-3 py-1 rounded-[4px] text-[12.5px] font-semibold transition-colors ${
                      b.primary
                        ? 'bg-[var(--oe-brand-primary)] text-white hover:bg-[var(--oe-brand-primary-dark)]'
                        : 'bg-[#f8f9fa] border border-[#dee2e6] text-[#212529] hover:bg-slate-100'
                    }`}
                  >
                    {b.string}
                  </button>
                ))}
                {modelDef.name === 'op.course' && recordId && (
                  <button
                    type="button"
                    onClick={() => navigate({ area: 'public', publicPath: '/courses' })}
                    className="px-3 py-1 rounded-[4px] text-[12.5px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1.5"
                  >
                    <PlayCircle size={13} />
                    <span>Launch LMS Player</span>
                  </button>
                )}
              </div>

              {/* Right: Authentic .o_arrow_button Chevrons (concise pipeline without overflow clipping) */}
              {visibleStages.length > 0 && (
                <div className="o_statusbar_status flex items-center overflow-x-auto max-w-full">
                  {visibleStages.map(([k, lbl]) => {
                    const active = k === currentStage;
                    return (
                      <button
                        type="button"
                        key={k}
                        onClick={() => {
                          if (modelDef.stageField) {
                            updateForm((p) => ({ ...p, [modelDef.stageField!]: k }));
                          }
                        }}
                        className={`o_arrow_button ${active ? 'o_arrow_button_current' : ''}`}
                      >
                        {lbl}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* White Form Sheet */}
          <div className="bg-white rounded-[4px] border border-[#dee2e6] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 relative overflow-hidden">
            {modelDef.name === 'account.move' && form.payment_state === 'partial' ? (
              <div className="ribbon ribbon-primary"><span>PARTIAL</span></div>
            ) : modelDef.name === 'account.move' && form.payment_state === 'in_payment' ? (
              <div className="ribbon"><span>IN PAYMENT</span></div>
            ) : modelDef.ribbon && String(form[modelDef.ribbon.field]) === modelDef.ribbon.value ? (
              <div className="ribbon"><span>{modelDef.ribbon.label}</span></div>
            ) : null}

            {/* Identity Header: Students stack Photo above Title/Name (step_71_shot_2), Admissions/Faculty place Photo on Left (step_20_shot_1) */}
            {isPersonForm ? (
              <div className={`flex ${isStudentStacked ? 'flex-col items-start gap-3' : 'flex-col sm:flex-row items-start gap-5'} mb-6`}>
                {(() => {
                  const avatarKey = modelDef.form.avatar || (modelDef.fields.image_1920 ? 'image_1920' : 'image');
                  const avatarVal = form[avatarKey];
                  return (
                    <label
                      title="Upload photo"
                      className={`relative group ${isStudentStacked ? 'w-[100px] h-[100px]' : 'w-[96px] h-[96px]'} rounded-[4px] bg-slate-100 text-slate-700 font-bold text-2xl flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden cursor-pointer`}
                    >
                      {typeof avatarVal === 'string' && (avatarVal.startsWith('data:image') || avatarVal.startsWith('http')) ? (
                        <img src={avatarVal} alt={fullName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[var(--oe-brand-primary)]">{(fullName || 'OE').split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase()}</span>
                      )}
                      <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] font-medium py-0.5 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                        Edit
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => updateForm((p) => ({ ...p, [avatarKey]: String(reader.result || '') }));
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  );
                })()}
                <div className="flex-1 min-w-0 w-full space-y-1">
                  <div className="text-[12.5px] text-slate-600 font-medium">{form.title || 'Mr.'}</div>
                  <div className="w-full">
                    <input
                      value={form.name || [form.first_name, form.middle_name, form.last_name].filter(Boolean).join(' ') || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const parts = val.trim().split(/\s+/);
                        const first = parts[0] || '';
                        const last = parts.slice(1).join(' ') || '';
                        updateForm({
                          ...form,
                          name: val,
                          first_name: first,
                          last_name: last,
                        });
                      }}
                      placeholder="Full Name *"
                      className="text-[24px] font-normal text-[#212529] border-b border-transparent hover:border-slate-300 focus:border-[var(--oe-brand-primary)] focus:outline-none bg-transparent w-full leading-snug"
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-[12.5px] text-slate-600 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Mail size={13} className="text-[var(--oe-brand-primary)] shrink-0" />
                      <input value={form.email ?? ''} onChange={(e) => updateForm({ ...form, email: e.target.value })} placeholder="Email" className="oe-input max-w-xs" />
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone size={13} className="text-[var(--oe-brand-primary)] shrink-0" />
                      <input value={form.phone ?? ''} onChange={(e) => updateForm({ ...form, phone: e.target.value })} placeholder="Phone" className="oe-input max-w-[180px]" />
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-5">
                <div className="text-[12px] font-medium text-slate-600">
                  {modelDef.name === 'account.move' ? 'Customer Invoice' : (modelDef.fields[modelDef.form.title]?.string || 'Name')}
                </div>
                <input
                  value={form[modelDef.form.title] ?? ''}
                  disabled={Boolean(modelDef.fields[modelDef.form.title]?.readonly)}
                  onChange={(e) => updateForm({ ...form, [modelDef.form.title]: e.target.value })}
                  placeholder={`Enter ${modelDef.string}...`}
                  className="w-full text-[24px] font-bold text-[#212529] border-b border-transparent hover:border-slate-300 pb-1 focus:outline-none focus:border-[var(--oe-brand-primary)] bg-transparent"
                />
              </div>
            )}

            {/* Clean Borderless 2-Column Field Groups */}
            {modelDef.form.groups.filter((fn) => !skipInGroups.has(fn)).length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-2.5">
                {modelDef.form.groups.filter((fn) => !skipInGroups.has(fn)).map((fn) => {
                  const f = modelDef.fields[fn];
                  if (!f) return null;
                  return (
                    <div key={fn} className="flex items-start gap-3">
                      <label className="w-36 shrink-0 text-[13px] font-medium text-slate-700 pt-1">
                        {term(f.string)}
                        {f.required && <span className="text-[var(--oe-brand-accent)] ml-0.5">*</span>}
                      </label>
                      <div className="flex-1 min-w-0">{renderFieldInput(f)}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Odoo Notebook Tabs (Single horizontal line) */}
            {formTabs.length > 0 && (
              <div className="mt-6">
                <div className="flex flex-nowrap overflow-x-auto border-b border-slate-200 gap-0.5">
                  {formTabs.map((tab, i) => (
                    <button
                      key={`${tab.title}-${i}`}
                      type="button"
                      onClick={() => setActiveTab(i)}
                      className={`px-3.5 py-2 text-[13px] rounded-t whitespace-nowrap shrink-0 transition-colors ${
                        activeTab === i
                          ? 'bg-white border border-b-0 border-slate-200 -mb-px font-medium text-[var(--oe-brand-primary)]'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.title}
                    </button>
                  ))}
                </div>
                <div className="pt-4 grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-2.5">
                  {formTabs[activeTab]?.fields.map((fn) => {
                    const f = modelDef.fields[fn];
                    if (!f) return null;
                    const full = f.type === 'one2many' || f.type === 'html' || f.type === 'text';
                    const hideSoleOne2ManyLabel = f.type === 'one2many' && modelDef.form.tabs[activeTab].fields.length === 1;
                    return (
                      <div key={fn} className={full ? 'lg:col-span-2 space-y-1' : 'flex items-start gap-3'}>
                        {!hideSoleOne2ManyLabel && (
                          <label className="w-36 shrink-0 text-[13px] font-medium text-slate-700 pt-1">
                            {term(f.string)}
                          </label>
                        )}
                        <div className="flex-1 min-w-0">{renderFieldInput(f)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Integration Connection Testers on res.config.settings */}
            {modelDef.name === 'res.config.settings' && (
              <div className="mt-6 pt-4 border-t border-slate-200 space-y-2.5 text-xs">
                <div className="font-bold text-slate-800 text-[13px]">Integration Connectivity Testers</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    ['mpesa', 'Test M-Pesa Connection'],
                    ['whatsapp', 'Test WhatsApp Connection'],
                    ['sms', 'Test SMS Connection'],
                    ['email', 'Test SMTP Connection'],
                    ['meetings', 'Test Meeting Connection'],
                    ['sso', 'Test SSO Connection'],
                    ['webhook', 'Test Webhook Connection'],
                    ['ai', 'Test AI Connection'],
                  ].map(([kind, label]) => (
                    <button
                      key={kind}
                      type="button"
                      onClick={async () => {
                        const res = await apiFetch<{ message: string }>('/api/v1/integrations/test', {
                          method: 'POST',
                          body: JSON.stringify({ kind }),
                        });
                        setIntegrationTestResult(res.message);
                        showToast(res.message);
                      }}
                      className="px-3 py-1.5 rounded border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {integrationTestResult && (
                  <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
                    {integrationTestResult}
                  </div>
                )}
              </div>
            )}

            {/* Attendance Sheet 4 Smart Summary Counters matching Real OpenEduCat */}
            {modelDef.name === 'op.attendance.sheet' && form._attendance_stats && (
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  ['Present', form._attendance_stats.present, 'text-emerald-700 bg-emerald-50 border-emerald-200'],
                  ['Absent', form._attendance_stats.absent, 'text-rose-700 bg-rose-50 border-rose-200'],
                  ['Absent Excused', form._attendance_stats.excused, 'text-amber-700 bg-amber-50 border-amber-200'],
                  ['Late', form._attendance_stats.late, 'text-sky-700 bg-sky-50 border-sky-200'],
                ].map(([lbl, cnt, cls]) => (
                  <div key={String(lbl)} className={`px-3 py-1.5 rounded border text-xs font-semibold flex items-center gap-2 ${cls}`}>
                    <span>{lbl}:</span>
                    <span className="font-bold">{cnt}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Invoice Totals Box matching step_51_shot_1_05a_invoice_form_1440 */}
            {modelDef.name === 'account.move' && (
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-start justify-between gap-4">
                <textarea
                  rows={2}
                  value={form.narration ?? ''}
                  onChange={(e) => updateForm({ ...form, narration: e.target.value })}
                  placeholder="Terms and Conditions"
                  className="oe-input text-[12px] text-slate-600 max-w-sm flex-1 min-w-[200px]"
                />
                <div className="w-64 space-y-1.5 text-[13px] ml-auto">
                  <div className="flex justify-between text-slate-600">
                    <span>Untaxed Amount:</span>
                    <span className="font-mono">{formatMoney(form.amount_total, currencyCode)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[15px] text-[#212529] border-t border-slate-200 pt-1">
                    <span>Total:</span>
                    <span className="font-mono">{formatMoney(form.amount_total, currencyCode)}</span>
                  </div>
                  {paidAmount > 0 && (
                    <div className="flex justify-between italic text-slate-600 text-[12px]">
                      <span>Paid on {formatDate(form.invoice_date || new Date().toISOString().slice(0, 10))}</span>
                      <span className="font-mono">{formatMoney(paidAmount, currencyCode)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-slate-700 border-t border-slate-200 pt-1">
                    <span>Amount Due:</span>
                    <span className="font-mono">{formatMoney(form.amount_residual ?? (form.payment_state === 'paid' ? 0 : form.amount_total) ?? 0, currencyCode)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sided (or Bottom) Chatter matching Real OpenEduCat (Collapsed by Default!) */}
        <aside className={`w-full ${chatterBottom ? 'max-w-[1040px] mx-auto bg-white rounded p-4 border border-slate-200' : 'md:w-[340px] lg:w-[440px] xl:w-[520px] bg-white md:bg-transparent rounded p-3 md:p-0 border md:border-none border-slate-200'} shrink-0 text-[13px]`}>
          <div className="flex items-center justify-between gap-1 mb-3">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setChatterMode(chatterMode === 'comment' ? null : 'comment')}
                className={`px-3 py-1.5 rounded-[4px] text-[12px] font-semibold transition-colors ${
                  chatterMode === 'comment' || chatterMode === null
                    ? 'bg-[var(--oe-brand-primary)] text-white shadow-xs'
                    : 'bg-[#e9ecef] border border-[#dee2e6] text-[#212529] hover:bg-slate-200/70'
                }`}
              >
                Send message
              </button>
              <button
                type="button"
                onClick={() => setChatterMode(chatterMode === 'note' ? null : 'note')}
                className={`px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-colors ${
                  chatterMode === 'note'
                    ? 'bg-[var(--oe-brand-primary)] text-white shadow-xs'
                    : 'bg-[#e9ecef] border border-[#dee2e6] text-[#212529] hover:bg-slate-200/70'
                }`}
              >
                Log note
              </button>
              <button
                type="button"
                onClick={() => setChatterMode(chatterMode === 'whatsapp' ? null : 'whatsapp')}
                className={`px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-colors ${
                  chatterMode === 'whatsapp'
                    ? 'bg-[var(--oe-brand-primary)] text-white shadow-xs'
                    : 'bg-[#e9ecef] border border-[#dee2e6] text-[#212529] hover:bg-slate-200/70'
                }`}
              >
                WhatsApp
              </button>
              <button
                type="button"
                disabled={!recordId}
                onClick={() => setShowActivityModal(true)}
                className="px-2.5 py-1.5 rounded-[4px] text-[12px] font-medium bg-[#e9ecef] border border-[#dee2e6] text-[#212529] hover:bg-slate-200/70 disabled:opacity-50"
              >
                Activity
              </button>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <button
                type="button"
                onClick={() => setChatterSearchOpen(!chatterSearchOpen)}
                title="Search messages"
                className={`p-1 rounded hover:bg-slate-100 ${chatterSearchOpen ? 'text-[var(--oe-brand-primary)] bg-slate-100' : 'hover:text-[var(--oe-brand-primary)]'}`}
              >
                <Search size={14} />
              </button>
              <label className="flex items-center gap-0.5 cursor-pointer hover:text-[var(--oe-brand-primary)]" title="Attach file to record">
                <Paperclip size={14} />
                <span>{messages.filter((m) => String(m.body).startsWith('Attached file:')).length || 0}</span>
                <input
                  id="oe-chatter-file-input"
                  type="file"
                  disabled={!recordId}
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !recordId) return;
                    await callKw('mail.message', 'create', {
                      vals: { res_model: modelDef.name, res_id: recordId, body: `Attached file: ${file.name} (${Math.max(1, Math.round(file.size / 1024))} KB)`, message_type: 'note' },
                    });
                    const read = await callKw(modelDef.name, 'web_read', { id: recordId });
                    setMessages(read.messages ?? []);
                    showToast(`Uploaded ${file.name}`);
                  }}
                />
              </label>
              <span className="flex items-center gap-0.5"><Users size={14} /> 0</span>
            </div>
          </div>

          {chatterSearchOpen && (
            <div className="mb-3">
              <input
                value={chatterQuery}
                onChange={(e) => setChatterQuery(e.target.value)}
                placeholder="Search chatter messages..."
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[var(--oe-brand-primary)]"
              />
            </div>
          )}

          {chatterMode && (
            <div className={`mb-4 rounded border p-3 ${chatterMode === 'note' ? 'bg-amber-50/40 border-amber-200/80' : 'bg-white border-slate-200'}`}>
              {chatterMode === 'comment' && (
                <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-100 text-[11.5px] text-slate-600">
                  <span>To:</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-medium">
                    {form.partner_id__label || fullName || 'Followers'}
                  </span>
                </div>
              )}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded bg-[var(--oe-brand-primary)] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {(user?.name || 'A').slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <textarea
                    rows={chatterExpanded ? 5 : 2}
                    value={chatterText}
                    onChange={(e) => setChatterText(e.target.value)}
                    placeholder={
                      !recordId
                        ? 'Save record to log chatter...'
                        : chatterMode === 'note'
                        ? 'Log an internal note...'
                        : chatterMode === 'whatsapp'
                        ? 'Send a WhatsApp message...'
                        : 'Send a message to followers...'
                    }
                    disabled={!recordId}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-[var(--oe-brand-primary)]"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <button
                      type="button"
                      disabled={!recordId || !chatterText.trim()}
                      onClick={postChatter}
                      className="px-3.5 py-1 rounded bg-[var(--oe-brand-primary)] text-white text-xs font-semibold disabled:opacity-40 hover:bg-[var(--oe-brand-primary-dark)]"
                    >
                      {chatterMode === 'note' ? 'Log' : 'Send'}
                    </button>
                    <div className="flex items-center gap-2 text-slate-400">
                      <button type="button" onClick={() => setChatterText((t) => `${t} 👍`)} title="Insert emoji" className="hover:text-slate-600">
                        <Smile size={14} />
                      </button>
                      <button type="button" onClick={() => document.getElementById('oe-chatter-file-input')?.click()} title="Attach file" className="hover:text-slate-600">
                        <Paperclip size={14} />
                      </button>
                      <button type="button" onClick={() => setChatterExpanded(!chatterExpanded)} title="Toggle composer height" className="hover:text-slate-600">
                        <Maximize2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-slate-400 my-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span>{messages[0]?.date ? formatDate(messages[0].date) : 'Today'}</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {messages.filter((m) => !chatterQuery.trim() || String(m.body || '').toLowerCase().includes(chatterQuery.toLowerCase())).length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-4">No messages yet.</div>
            ) : (
              messages
                .filter((m) => !chatterQuery.trim() || String(m.body || '').toLowerCase().includes(chatterQuery.toLowerCase()))
                .map((m) => (
                <div key={m.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-7 h-7 rounded bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-[var(--oe-brand-primary)]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{m.author_id__label || 'OpenEduCat Bot'}</span>
                      <span className="text-[11px] text-slate-400">{formatDateTime(m.date)}</span>
                    </div>
                    <div className="text-slate-700 mt-0.5 leading-snug">{m.body}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      {/* Exact Odoo 19 Schedule Activity Modal matching Real */}
      {showActivityModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded shadow-2xl w-full max-w-[780px] border border-slate-200 overflow-hidden text-[13px]">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <h4 className="font-bold text-[15px] text-slate-900">Schedule Activity</h4>
              <button onClick={() => setShowActivityModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-base">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {([
                  ['To-Do', CheckSquare],
                  ['Email', Mail],
                  ['Call', Phone],
                  ['Meeting', Users],
                  ['Document', Upload],
                ] as const).map(([t, Icon]) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setActivityForm((p) => ({
                      ...p,
                      activity_type: t,
                      summary: (!p.summary || ['To-Do', 'Email', 'Call', 'Meeting', 'Document'].includes(p.summary)) ? t : p.summary,
                    }))}
                    className={`px-3 py-1 rounded text-xs font-medium border flex items-center gap-1.5 ${
                      activityForm.activity_type === t
                        ? 'bg-[var(--oe-surface-pale-blue)] border-[var(--oe-brand-primary)] text-[var(--oe-brand-primary)] font-bold'
                        : 'bg-[#f8f9fa] border-[#dee2e6] text-slate-700'
                    }`}
                  >
                    <Icon size={12} />
                    <span>{t}</span>
                  </button>
                ))}
              </div>
              <input
                value={activityForm.summary}
                onChange={(e) => setActivityForm((p) => ({ ...p, summary: e.target.value }))}
                placeholder="Summary (e.g. Call parent regarding tuition)"
                className="w-full text-[16px] font-medium border-b border-slate-300 pb-1.5 focus:outline-none focus:border-[var(--oe-brand-primary)]"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="space-y-1 text-xs">
                  <span className="font-semibold text-slate-700">Due Date</span>
                  <input
                    type="date"
                    value={activityForm.date_deadline}
                    onChange={(e) => setActivityForm((p) => ({ ...p, date_deadline: e.target.value }))}
                    className="oe-input border-b border-slate-200"
                  />
                </label>
                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-slate-700">Assigned to</span>
                  <div className="py-1 text-slate-800 font-medium flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-[var(--oe-brand-primary)] text-white text-[10px] font-bold flex items-center justify-center">
                      {(user?.name || 'A').slice(0, 1).toUpperCase()}
                    </span>
                    <span>{user?.name || 'Administrator'}</span>
                  </div>
                </div>
              </div>
              <textarea
                rows={3}
                value={activityForm.note}
                onChange={(e) => setActivityForm((p) => ({ ...p, note: e.target.value }))}
                placeholder="Log a note..."
                className="w-full p-2 border border-slate-200 rounded text-xs focus:outline-none focus:border-[var(--oe-brand-primary)]"
              />
            </div>
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
              <button
                onClick={async () => {
                  await callKw('mail.activity', 'create', {
                    vals: {
                      res_model: modelDef.name,
                      res_id: recordId,
                      summary: activityForm.summary || `${activityForm.activity_type} follow-up`,
                      date_deadline: activityForm.date_deadline,
                      note: activityForm.note,
                      state: 'planned',
                    },
                  });
                  await callKw('mail.message', 'create', {
                    vals: {
                      res_model: modelDef.name,
                      res_id: recordId,
                      body: `Scheduled ${activityForm.activity_type}: ${activityForm.summary || 'Follow-up'} (Due ${formatDate(activityForm.date_deadline)})`,
                      message_type: 'note',
                    },
                  });
                  setShowActivityModal(false);
                  await refreshSession();
                  await loadRecord(recordId);
                  showToast('Activity scheduled');
                }}
                className="px-4 py-1.5 rounded bg-[var(--oe-brand-primary)] hover:bg-[var(--oe-brand-primary-dark)] text-white font-semibold text-xs"
              >
                Save
              </button>
              <button
                onClick={async () => {
                  await callKw('mail.activity', 'create', {
                    vals: {
                      res_model: modelDef.name,
                      res_id: recordId,
                      summary: activityForm.summary || `${activityForm.activity_type} follow-up`,
                      date_deadline: activityForm.date_deadline,
                      note: activityForm.note,
                      state: 'done',
                    },
                  });
                  await callKw('mail.message', 'create', {
                    vals: {
                      res_model: modelDef.name,
                      res_id: recordId,
                      body: `${activityForm.activity_type} done: ${activityForm.summary || 'Follow-up'}${activityForm.note ? ` — ${activityForm.note}` : ''}`,
                      message_type: 'note',
                    },
                  });
                  setShowActivityModal(false);
                  await refreshSession();
                  await loadRecord(recordId);
                  showToast('Activity marked as done');
                }}
                className="px-4 py-1.5 rounded bg-[#e9ecef] hover:bg-slate-200 text-slate-800 font-medium text-xs"
              >
                Mark Done
              </button>
              <button
                onClick={() => setShowActivityModal(false)}
                className="px-4 py-1.5 rounded bg-[#e9ecef] hover:bg-slate-200 text-slate-800 font-medium text-xs"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exact Odoo 19 Register Payment Modal matching Real 2-column layout */}
      {showPayModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded shadow-2xl w-full max-w-[760px] border border-slate-200 overflow-hidden text-[13px]">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <h4 className="font-bold text-[15px] text-slate-900">Pay</h4>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-base">×</button>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 text-xs">
              <label className="space-y-1">
                <span className="font-semibold text-slate-700">Journal</span>
                <select value={payForm.journal} onChange={(e) => setPayForm((p) => ({ ...p, journal: e.target.value }))} className="oe-input border-b border-slate-200">
                  <option value="Bank">Bank</option>
                  <option value="Cash">Cash</option>
                  <option value="M-Pesa Paybill">M-Pesa Paybill 522522</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="font-semibold text-slate-700">Amount ({currencyCode})</span>
                <input type="number" value={payForm.amount} onChange={(e) => setPayForm((p) => ({ ...p, amount: Number(e.target.value) }))} className="oe-input border-b border-slate-200 font-mono font-bold" />
              </label>
              <label className="space-y-1">
                <span className="font-semibold text-slate-700">Payment Method</span>
                <select value={payForm.method} onChange={(e) => setPayForm((p) => ({ ...p, method: e.target.value }))} className="oe-input border-b border-slate-200">
                  <option value="Manual Payment">Manual Payment</option>
                  <option value="Electronic Transfer">Electronic Transfer</option>
                  <option value="M-Pesa Express">M-Pesa Express</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="font-semibold text-slate-700">Payment Date</span>
                <input type="date" value={payForm.date} onChange={(e) => setPayForm((p) => ({ ...p, date: e.target.value }))} className="oe-input border-b border-slate-200" />
              </label>
              <label className="space-y-1">
                <span className="font-semibold text-slate-700">Recipient Bank Account</span>
                <input value={payForm.bankAccount} onChange={(e) => setPayForm((p) => ({ ...p, bankAccount: e.target.value }))} className="oe-input border-b border-slate-200" />
              </label>
              <label className="space-y-1">
                <span className="font-semibold text-slate-700">Memo</span>
                <input value={payForm.memo} onChange={(e) => setPayForm((p) => ({ ...p, memo: e.target.value }))} className="oe-input border-b border-slate-200" />
              </label>
            </div>
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
              <button
                onClick={async () => {
                  setShowPayModal(false);
                  const res = await callKw(modelDef.name, 'action_register_payment', {
                    id: recordId,
                    args: {
                      amount: payForm.amount,
                      journal_name: payForm.journal,
                      method: payForm.method,
                      date: payForm.date,
                      memo: payForm.memo,
                    },
                  });
                  if (res.record) setForm(res.record);
                  await loadRecord(recordId);
                  showToast(res.message || 'Payment registered');
                }}
                className="px-4 py-1.5 rounded bg-[var(--oe-brand-primary)] hover:bg-[var(--oe-brand-primary-dark)] text-white font-semibold text-xs"
              >
                Create Payment
              </button>
              <button
                onClick={() => setShowPayModal(false)}
                className="px-4 py-1.5 rounded bg-[#e9ecef] hover:bg-slate-200 text-slate-800 font-medium text-xs"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* M-Pesa Express STK Push Modal */}
      {showMpesaModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded shadow-2xl w-full max-w-[420px] border border-slate-200 overflow-hidden text-xs">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-emerald-600 text-white">
              <h4 className="font-bold text-[15px] flex items-center gap-2"><Smartphone size={16} /> M-Pesa Express (STK Push)</h4>
              <button onClick={() => setShowMpesaModal(false)} className="text-white/80 hover:text-white font-bold text-base">×</button>
            </div>
            <div className="p-5 space-y-3.5">
              <div className="text-slate-600">
                Invoice <strong>{form.name}</strong> — Balance Due: <strong className="font-mono">{currencyCode} {Number(form.amount_residual ?? form.amount_total ?? 0).toLocaleString()}</strong>
              </div>
              <label className="block space-y-1">
                <span className="font-semibold text-slate-700">Safaricom M-Pesa Phone</span>
                <input
                  value={mpesaForm.phone}
                  onChange={(e) => setMpesaForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+254722810400"
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono"
                />
              </label>
              <label className="block space-y-1">
                <span className="font-semibold text-slate-700">Amount ({currencyCode})</span>
                <input
                  type="number"
                  value={mpesaForm.amount}
                  onChange={(e) => setMpesaForm((p) => ({ ...p, amount: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold"
                />
              </label>
            </div>
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center gap-2 justify-end">
              <button onClick={() => setShowMpesaModal(false)} className="px-3.5 py-1.5 rounded bg-[#e9ecef] hover:bg-slate-200 text-slate-800 font-medium">
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowMpesaModal(false);
                  const res = await callKw(modelDef.name, 'pay_mpesa', {
                    id: recordId,
                    args: { phone: mpesaForm.phone, amount: mpesaForm.amount },
                  });
                  if (res.record) setForm(res.record);
                  await loadRecord(recordId);
                  showToast(res.message || 'M-Pesa STK Push settled!');
                }}
                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                Send M-Pesa Prompt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Online Quiz Runner / Exam Preview Modal */}
      {showQuizModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded shadow-2xl w-full max-w-[680px] max-h-[88vh] border border-slate-200 flex flex-col overflow-hidden text-xs">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <h4 className="font-bold text-[15px] text-slate-900">{form.name} — Interactive Quiz Assessment</h4>
              <button onClick={() => setShowQuizModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-base">×</button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              {(!Array.isArray(form.line_ids) || form.line_ids.length === 0) ? (
                <div className="p-6 text-center text-slate-500 border border-dashed border-slate-200 rounded">
                  No questions added to this quiz yet. Add questions in the Questions tab first.
                </div>
              ) : (
                form.line_ids.map((q: any, idx: number) => (
                  <div key={q.id} className="p-3.5 rounded border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="font-bold text-slate-900">{idx + 1}. {q.name} ({q.mark || 5} marks)</div>
                    <input
                      value={quizAnswers[q.id] ?? ''}
                      onChange={(e) => setQuizAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                      placeholder="Enter your answer..."
                      className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                ))
              )}
            </div>
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-slate-500">Time Limit: {form.time_limit_minute || 30} mins · Total Marks: {form.total_marks || 20}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowQuizModal(false)} className="px-3.5 py-1.5 rounded bg-[#e9ecef] text-slate-800 font-medium">Close</button>
                <button
                  onClick={async () => {
                    const lines: any[] = Array.isArray(form.line_ids) ? form.line_ids : [];
                    const totalMarks = lines.reduce((s, l) => s + Number(l.mark || 5), 0) || Number(form.total_marks || 20);
                    const result = await callKw('op.quiz.result', 'web_save', {
                      vals: {
                        name: `QR/${form.id}/${Date.now() % 1000}`,
                        quiz_id: recordId,
                        student_id: user?.student_id || 1,
                        total_marks: totalMarks,
                        state: 'open',
                      },
                    });
                    const resId = result.record.id;
                    for (const l of lines) {
                      const given = String(quizAnswers[l.id] || '').trim();
                      const correct = given && (!l.answer || given.toLowerCase() === String(l.answer).trim().toLowerCase());
                      await callKw('op.quiz.result.line', 'web_save', {
                        vals: {
                          result_id: resId,
                          name: l.name,
                          question_mark: Number(l.mark || 5),
                          mark: correct ? Number(l.mark || 5) : 0,
                          answer: l.answer,
                          given_answer: given || '—',
                        },
                      });
                    }
                    await callKw('op.quiz.result', 'get_action_submit', { id: resId });
                    await callKw('op.quiz.result', 'get_action_done', { id: resId });
                    setShowQuizModal(false);
                    showToast('Quiz submitted and graded!');
                    await loadRecord(recordId);
                  }}
                  className="px-4 py-1.5 rounded bg-[var(--oe-brand-primary)] text-white font-semibold"
                >
                  Submit Quiz & Auto-Grade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QWeb Print / PDF Preview Modal */}
      {printPreviewHtml && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded shadow-2xl w-full max-w-[900px] h-[85vh] border border-slate-200 flex flex-col overflow-hidden text-xs">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <h4 className="font-bold text-[15px] text-slate-900">Printable QWeb Invoice Report — {form.name}</h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const frame = document.getElementById('qweb-print-frame') as HTMLIFrameElement | null;
                    frame?.contentWindow?.print();
                  }}
                  className="px-3.5 py-1.5 rounded bg-[var(--oe-brand-primary)] text-white font-semibold"
                >
                  Print / Save PDF
                </button>
                <button onClick={() => setPrintPreviewHtml(null)} className="px-3 py-1.5 rounded bg-slate-100 text-slate-700 font-semibold">Close</button>
              </div>
            </div>
            <iframe id="qweb-print-frame" srcDoc={printPreviewHtml} title="QWeb Report Preview" className="flex-1 w-full bg-white border-0" />
          </div>
        </div>
      )}
    </div>
  );
};
