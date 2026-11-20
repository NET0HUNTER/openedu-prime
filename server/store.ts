import fs from 'node:fs';
import path from 'node:path';
import {
  ALL_MODELS,
  CORE_SAFE_READ_MODELS,
  MODEL_MAP,
  buildDefaultAccessBlueprint,
  buildDefaultRuleBlueprint,
  classifyModelGroup,
  type ModelDef,
  type Role,
} from '../shared/meta/index.js';

export type Rec = Record<string, any> & { id: number };

export interface DbState {
  seedProfile: 'oshwal' | 'default';
  nextIds: Record<string, number>;
  tables: Record<string, Rec[]>;
}

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export class Store {
  private state: DbState = { seedProfile: 'oshwal', nextIds: {}, tables: {} };
  private batchDepth = 0;

  withBatch<T>(fn: () => T): T {
    this.batchDepth++;
    try {
      return fn();
    } finally {
      this.batchDepth--;
      if (this.batchDepth === 0) this.save();
    }
  }

  load(): boolean {
    if (!fs.existsSync(DB_FILE)) return false;
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    this.state = JSON.parse(raw);
    return true;
  }

  save(): void {
    if (this.batchDepth > 0 || process.env.VITEST) return;
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2), 'utf8');
  }

  reset(profile: 'oshwal' | 'default'): void {
    this.state = { seedProfile: profile, nextIds: {}, tables: {} };
    for (const m of Object.keys(MODEL_MAP)) {
      this.state.tables[m] = [];
      this.state.nextIds[m] = 1;
    }
  }

  getSeedProfile(): 'oshwal' | 'default' {
    return this.state.seedProfile;
  }

  all(model: string): Rec[] {
    if (!this.state.tables[model]) this.state.tables[model] = [];
    return this.state.tables[model];
  }

  byId(model: string, id: number): Rec | undefined {
    return this.all(model).find((r) => r.id === Number(id));
  }

  getSettings(): Rec {
    return this.all('res.config.settings')[0] ?? { id: 1 };
  }

  nextId(model: string): number {
    const n = this.state.nextIds[model] ?? 1;
    this.state.nextIds[model] = n + 1;
    return n;
  }

  displayName(model: string, rec: Rec | undefined): string {
    if (!rec) return '';
    const def = MODEL_MAP[model];
    if (model === 'op.student' || model === 'op.faculty' || model === 'op.admission') {
      return [rec.first_name, rec.middle_name, rec.last_name].filter(Boolean).join(' ') || rec.name || `#${rec.id}`;
    }
    const key = def?.recName ?? 'name';
    return String(rec[key] ?? rec.name ?? rec.title ?? rec.subject ?? `#${rec.id}`);
  }

  private applyDomain(rows: Rec[], domain: Record<string, unknown> | undefined, modelDef?: ModelDef, companyIds?: number[], search?: string): Rec[] {
    let out = rows;
    if (companyIds && companyIds.length > 0 && modelDef?.company) {
      out = out.filter((r) => !r.company_id || companyIds.includes(Number(r.company_id)));
    }
    if (domain) {
      for (const [k, v] of Object.entries(domain)) {
        if (v === undefined || v === null || v === '') continue;
        if (Array.isArray(v)) {
          out = out.filter((r) => v.includes(r[k]));
        } else {
          out = out.filter((r) => r[k] === v);
        }
      }
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter((r) =>
        Object.values(r).some((val) => val !== null && val !== undefined && String(val).toLowerCase().includes(q)),
      );
    }
    return out;
  }

  hydrate(model: string, rec: Rec): Rec {
    const def = MODEL_MAP[model];
    if (!def) return rec;
    const out: Rec = { ...rec, display_name: this.displayName(model, rec) };
    for (const f of Object.values(def.fields)) {
      if (f.type === 'many2one' && f.relation && rec[f.name] !== undefined && rec[f.name] !== null) {
        const target = this.byId(f.relation, Number(rec[f.name]));
        out[`${f.name}__label`] = target ? this.displayName(f.relation, target) : `#${rec[f.name]}`;
      }
      if (f.type === 'many2many' && f.relation && Array.isArray(rec[f.name])) {
        out[`${f.name}__labels`] = rec[f.name].map((tid: number) => ({
          id: tid,
          label: this.displayName(f.relation!, this.byId(f.relation!, tid)),
        }));
      }
      if (f.type === 'one2many' && f.relation && f.inverse) {
        out[f.name] = this.all(f.relation)
          .filter((child) => Number(child[f.inverse!]) === rec.id)
          .map((c) => this.hydrate(f.relation!, c));
      }
    }
    if (def.smart.length > 0) {
      out._smart_counts = def.smart.map((s) => {
        if (s.field.startsWith('#')) {
          const m2m = rec[s.field.slice(1)];
          const count = Array.isArray(m2m) ? m2m.length : 0;
          const domain = Array.isArray(m2m) && m2m.length > 0 ? { id: m2m } : undefined;
          return { string: s.string, model: s.model, field: s.field, domain, count };
        }
        let matchVal = rec.id;
        let targetField = s.field;
        if (s.field === 'partner_id' && model !== 'res.partner' && rec.partner_id) {
          matchVal = Number(rec.partner_id);
        } else if (s.field === 'id' && s.model === 'account.move') {
          const linkId = Number(rec.move_id || rec.invoice_id || rec.account_move_id || 0);
          matchVal = linkId;
          targetField = 'id';
        }
        const matches = matchVal
          ? this.all(s.model).filter((t) => Number(t[targetField]) === Number(matchVal))
          : [];
        const sum = s.sum ? matches.reduce((acc, m) => acc + Number(m[s.sum!] ?? 0), 0) : undefined;
        const domain = matchVal ? { [targetField]: matchVal } : { [targetField]: -1 };
        return { string: s.string, model: s.model, field: targetField, domain, count: matches.length, sum };
      });
    }
    if (model === 'op.admission.register') {
      const apps = this.all('op.admission').filter((a) => Number(a.register_id) === rec.id);
      out._register_stats = {
        draft: apps.filter((a) => ['draft', 'online', 'submit'].includes(String(a.state))).length,
        confirm: apps.filter((a) => ['confirm', 'interview', 'pending', 'esign', 'signed', 'admission', 'sign_received', 'sign_confirmed'].includes(String(a.state))).length,
        enroll: apps.filter((a) => a.state === 'done').length,
      };
    }
    if (model === 'op.department') {
      const programs = this.all('op.program').filter((p) => Number(p.department_id) === rec.id).length || this.all('op.program').length;
      const coursesList = this.all('op.course').filter((c) => Number(c.department_id) === rec.id);
      const courses = coursesList.length;
      const courseIds = new Set(coursesList.map((c) => c.id));
      const faculties = this.all('op.faculty').filter((f) => Number(f.main_department_id) === rec.id).length;
      const students = this.all('op.student').filter((s) => courseIds.has(Number(s.course_id))).length;
      const subjects = this.all('op.subject').filter((s) => Number(s.department_id) === rec.id).length;
      const batches = this.all('op.batch').filter((b) => courseIds.has(Number(b.course_id))).length;
      out._dept_stats = { programs, courses, faculties, students, subjects, batches };
    }
    if (model === 'op.attendance.register') {
      out._register_sheet_count = this.all('op.attendance.sheet').filter((s) => Number(s.register_id) === rec.id).length;
    }
    if (model === 'op.attendance.sheet') {
      const lines = this.all('op.attendance.line').filter((l) => Number(l.attendance_id) === rec.id);
      out._attendance_stats = {
        present: lines.filter((l) => Boolean(l.present)).length,
        absent: lines.filter((l) => Boolean(l.absent)).length,
        excused: lines.filter((l) => Boolean(l.excused)).length,
        late: lines.filter((l) => Boolean(l.late)).length,
      };
    }
    if (model === 'op.media.type') {
      const mediaIds = new Set(this.all('op.media').filter((m) => Number(m.media_type_id) === rec.id).map((m) => m.id));
      const units = this.all('op.media.unit').filter((u) => mediaIds.has(Number(u.media_id)));
      const movements = this.all('op.media.movement').filter((mv) => mediaIds.has(Number(mv.media_id)) && mv.state === 'issued');
      const todayIso = new Date().toISOString().slice(0, 10);
      const monthPrefix = todayIso.slice(0, 7);
      out._library_stats = {
        issued: units.filter((u) => u.state === 'issued').length || movements.length,
        available: units.filter((u) => u.state === 'available').length,
        dueToday: movements.filter((mv) => String(mv.return_date).slice(0, 10) === todayIso).length,
        dueMonth: movements.filter((mv) => String(mv.return_date).slice(0, 7) === monthPrefix).length || movements.length,
      };
    }
    if (model === 'account.journal') {
      const moves = this.all('account.move');
      const matching = rec.type === 'sale'
        ? moves.filter((m) => m.move_type === 'out_invoice')
        : rec.type === 'purchase'
        ? moves.filter((m) => m.move_type === 'in_invoice')
        : [];
      const draftMoves = matching.filter((m) => m.state === 'draft');
      const unpaidMoves = matching.filter((m) => m.state === 'posted' && m.payment_state !== 'paid');
      const todayIso = new Date().toISOString().slice(0, 10);
      const lateMoves = unpaidMoves.filter((m) => m.invoice_date_due && String(m.invoice_date_due) < todayIso);
      const txDone = this.all('payment.transaction').filter((t) => t.state === 'done');
      const bankBalance = txDone.reduce((s, t) => s + Number(t.amount ?? 0), 0);
      const unpaidAmount = unpaidMoves.reduce((s, m) => s + Number(m.amount_residual ?? m.amount_total ?? 0), 0);
      const lateAmount = lateMoves.reduce((s, m) => s + Number(m.amount_residual ?? m.amount_total ?? 0), 0);
      out._journal_stats = {
        toValidate: draftMoves.length,
        unpaidCount: unpaidMoves.length,
        unpaidAmount,
        lateCount: lateMoves.length,
        lateAmount,
        balance: rec.type === 'bank' ? bankBalance : rec.type === 'cash' ? 45000 : matching.reduce((s, m) => s + Number(m.amount_total ?? 0), 0),
        chartBars: rec.type === 'sale' ? [32, 58, 44, 78, 65, 92] : rec.type === 'purchase' ? [18, 28, 22, 35, 14, 26] : [40, 62, 55, 74, 82, 95],
      };
    }
    if (model === 'helpdesk.team') {
      const tickets = this.all('helpdesk.ticket');
      out._team_stats = {
        open: tickets.filter((t) => t.stage !== 'done').length,
        slaPct: 96,
        closed: tickets.filter((t) => t.stage === 'done').length,
        newCount: tickets.filter((t) => t.stage === 'new' || t.stage === 'draft').length,
        unassigned: tickets.filter((t) => t.stage === 'draft').length,
        urgent: tickets.filter((t) => Number(t.priority ?? 0) >= 2 && t.stage !== 'done').length,
        overdue: 0,
      };
    }
    if (model === 'op.route.register') {
      out._agreement_count = this.all('op.transportation.agreement').filter((a) => Number(a.route_register_id) === rec.id).length;
    }
    if (model === 'fleet.vehicle') {
      out._contract_count = this.all('fleet.vehicle.log.contract').filter((ct) => Number(ct.vehicle_id) === rec.id).length;
    }
    if (model === 'account.move' && rec.partner_id) {
      const p = this.byId('res.partner', Number(rec.partner_id));
      if (p) {
        const ctry = p.country_id ? this.byId('res.country', Number(p.country_id))?.name : undefined;
        out._partner_address = [p.street, p.city, ctry].filter(Boolean).join(', ');
      }
    }
    return out;
  }

  searchRead(
    model: string,
    opts: { domain?: Record<string, unknown>; companyIds?: number[]; search?: string; limit?: number; offset?: number } = {},
  ): { records: Rec[]; total: number } {
    const def = MODEL_MAP[model];
    const filtered = this.applyDomain(this.all(model), opts.domain, def, opts.companyIds, opts.search);
    const total = filtered.length;
    const offset = opts.offset ?? 0;
    const limit = opts.limit ?? 80;
    const slice = filtered.slice(offset, offset + limit).map((r) => this.hydrate(model, r));
    return { records: slice, total };
  }

  readGroup(model: string, groupBy: string, opts: { domain?: Record<string, unknown>; companyIds?: number[]; search?: string } = {}) {
    const def = MODEL_MAP[model];
    const filtered = this.applyDomain(this.all(model), opts.domain, def, opts.companyIds, opts.search);
    const f = def?.fields[groupBy];
    const groups = new Map<string, { key: unknown; label: string; count: number; records: Rec[] }>();
    if (f?.type === 'selection' && f.selection) {
      for (const [k, label] of f.selection) {
        groups.set(k, { key: k, label, count: 0, records: [] });
      }
    }
    for (const r of filtered) {
      const raw = r[groupBy];
      const keyStr = raw === undefined || raw === null || raw === '' ? '__none__' : String(raw);
      let label = keyStr === '__none__' ? 'Undefined' : keyStr;
      if (f?.type === 'many2one' && f.relation && raw) {
        label = this.displayName(f.relation, this.byId(f.relation, Number(raw)));
      } else if (f?.type === 'selection' && f.selection) {
        label = f.selection.find(([k]) => k === raw)?.[1] ?? label;
      }
      if (!groups.has(keyStr)) groups.set(keyStr, { key: raw, label, count: 0, records: [] });
      const g = groups.get(keyStr)!;
      g.count += 1;
      g.records.push(this.hydrate(model, r));
    }
    return Array.from(groups.values());
  }

  create(model: string, vals: Record<string, unknown>, authorId = 1, logChatter = true): Rec {
    const def = MODEL_MAP[model];
    const id = this.nextId(model);
    const rec: Rec = { id };
    if (def) {
      for (const f of Object.values(def.fields)) {
        if (vals[f.name] !== undefined) continue;
        if (f.default === 'now') rec[f.name] = new Date().toISOString().slice(0, 16).replace('T', ' ');
        else if (f.default === 'today') rec[f.name] = new Date().toISOString().slice(0, 10);
        else if (f.default === 'true') rec[f.name] = true;
        else if (f.default === 'false') rec[f.name] = false;
        else if (f.default === 'company') rec[f.name] = this.all('res.company')[0]?.id ?? 1;
        else if (f.default !== undefined) {
          rec[f.name] = f.type === 'integer' || f.type === 'float' || f.type === 'monetary' ? Number(f.default) : f.default;
        }
      }
    }
    Object.assign(rec, vals, { id });
    if (def) {
      for (const f of Object.values(def.fields)) {
        if (f.type === 'one2many') {
          delete rec[f.name];
        }
      }
    }
    if (model === 'op.admission' && !rec.application_number) rec.application_number = `AD${String(id).padStart(4, '0')}`;
    if (model === 'op.student' && !rec.gr_no) rec.gr_no = `OAN/${new Date().getFullYear()}/${String(id).padStart(4, '0')}`;
    if (model === 'account.move' && !rec.name) rec.name = `INV/${new Date().getFullYear()}/${String(id).padStart(4, '0')}`;
    if (model === 'account.move' && rec.amount_residual === undefined && rec.amount_total !== undefined) rec.amount_residual = rec.amount_total;
    if (model === 'op.notice' && !rec.notice_number) rec.notice_number = `NTC/${String(id).padStart(4, '0')}`;
    if (model === 'op.circular' && !rec.circular_number) rec.circular_number = `CIR/${String(id).padStart(4, '0')}`;
    if (model === 'helpdesk.ticket' && !rec.ticket_seq) rec.ticket_seq = `TKT${String(id).padStart(4, '0')}`;
    if (model === 'op.assignment' && !rec.sequence) rec.sequence = `ASG/${String(id).padStart(4, '0')}`;
    if (model === 'grading.assignment' && !rec.sequence) rec.sequence = `GA/${String(id).padStart(4, '0')}`;
    if (model === 'op.subject.registration' && !rec.name) rec.name = `SUBREG/${String(id).padStart(4, '0')}`;
    if (model === 'op.student.withdrawal' && !rec.name) rec.name = `WD/${String(id).padStart(4, '0')}`;
    if (model === 'op.library.card' && !rec.number) rec.number = `LCB${String(id).padStart(7, '0')}`;
    if (model === 'e.sign.request' && !rec.name) rec.name = `ESIGN/${String(id).padStart(4, '0')}`;
    if (model === 'sale.order' && !rec.name) rec.name = `S${String(id).padStart(5, '0')}`;
    if (model === 'purchase.order' && !rec.name) rec.name = `P${String(id).padStart(5, '0')}`;
    if (model === 'op.fees.plan' && !rec.name) rec.name = `FP/${String(id).padStart(4, '0')}`;

    if (model === 'op.exam.attendees' && rec.marks !== undefined && !rec.grade) {
      const m = Number(rec.marks);
      rec.grade = m >= 90 ? '9' : m >= 80 ? '8' : m >= 70 ? '7' : m >= 60 ? '6' : m >= 50 ? '5' : m >= 40 ? '4' : m >= 30 ? '3' : m >= 20 ? '2' : m >= 10 ? '1' : 'U';
    }
    if (model === 'account.move.line') {
      rec.price_subtotal = Number(rec.quantity ?? 1) * Number(rec.price_unit ?? 0);
    }
    if ((model === 'ir.model.access' || model === 'ir.rule') && rec.model_id) {
      const mRec = this.byId('ir.model', Number(rec.model_id));
      if (mRec) {
        rec.model_name = mRec.model;
        if (model === 'ir.model.access') rec.module_group = mRec.app_category || classifyModelGroup(String(mRec.model));
        if (!rec.name) rec.name = `${mRec.name} (${mRec.model})`;
      }
    }

    this.all(model).push(rec);
    if (def) {
      for (const f of Object.values(def.fields)) {
        if (f.type === 'one2many' && f.relation && f.inverse && Array.isArray(vals[f.name])) {
          for (const childItem of vals[f.name] as Record<string, unknown>[]) {
            if (!childItem || typeof childItem !== 'object') continue;
            const childVals = { ...childItem, [f.inverse]: id };
            delete childVals.id;
            this.create(f.relation, childVals, authorId, false);
          }
        }
      }
    }
    if (model === 'res.users.role' && !Array.isArray(vals.access_ids)) {
      const hasLines = this.all('ir.model.access').some((l) => Number(l.role_id) === id);
      if (!hasLines) {
        this.populateRolePermissions(id, (rec.base_role || 'faculty') as Role, false);
      }
    }
    if ((model === 'ir.model.access' || model === 'ir.rule') && rec.role_id) {
      this.recomputeRoleCounts(Number(rec.role_id));
    }
    if (model === 'account.move.line' && logChatter && rec.move_id) {
      this.recomputeInvoiceTotals(Number(rec.move_id));
    }
    if (model === 'op.course.enrollment.line' && rec.enrollment_id) {
      this.recomputeEnrollmentProgress(Number(rec.enrollment_id));
    }
    if (logChatter && model !== 'mail.message' && model !== 'queue.job') {
      this.logMessage(model, id, `${def?.string ?? model} created.`, authorId, 'notification');
    }
    this.save();
    return this.hydrate(model, rec);
  }

  syncSystemModelsCatalog(): void {
    const existing = this.all('ir.model');
    const byModelName = new Map(existing.map((r) => [String(r.model), r]));
    let changed = false;
    for (const def of ALL_MODELS) {
      const cat = classifyModelGroup(def.name);
      const isCore = CORE_SAFE_READ_MODELS.has(def.name);
      const found = byModelName.get(def.name);
      if (!found) {
        const id = this.nextId('ir.model');
        existing.push({
          id,
          name: def.string,
          model: def.name,
          app_category: cat,
          is_core_infra: isCore,
          create_date: new Date().toISOString(),
          write_date: new Date().toISOString(),
        });
        changed = true;
      } else if (found.app_category !== cat || found.is_core_infra !== isCore) {
        found.app_category = cat;
        found.is_core_infra = isCore;
        changed = true;
      }
    }
    if (changed) this.save();
  }

  recomputeRoleCounts(roleId: number): void {
    const role = this.byId('res.users.role', roleId);
    if (!role) return;
    const accessCount = this.all('ir.model.access').filter(
      (l) => Number(l.role_id) === roleId && l.active !== false && (l.perm_read || l.perm_write || l.perm_create || l.perm_unlink),
    ).length;
    const rulesCount = this.all('ir.rule').filter(
      (r) => Number(r.role_id) === roleId && r.active !== false,
    ).length;
    role.model_access_count = accessCount;
    role.rules_count = rulesCount;
  }

  populateRolePermissions(roleId: number, baseRole: Role, resetExisting = false): void {
    this.syncSystemModelsCatalog();
    const role = this.byId('res.users.role', roleId);
    if (!role) return;
    const modelRecords = this.all('ir.model');
    const modelIdByName = new Map(modelRecords.map((m) => [String(m.model), m.id]));

    if (resetExisting) {
      this.state.tables['ir.model.access'] = this.all('ir.model.access').filter((l) => Number(l.role_id) !== roleId);
      this.state.tables['ir.rule'] = this.all('ir.rule').filter((r) => Number(r.role_id) !== roleId);
    }

    const existingAccess = new Set(
      this.all('ir.model.access')
        .filter((l) => Number(l.role_id) === roleId)
        .map((l) => String(l.model_name)),
    );
    const accessBlueprint = buildDefaultAccessBlueprint(baseRole, ALL_MODELS);
    const accessTable = this.all('ir.model.access');
    for (const bp of accessBlueprint) {
      if (existingAccess.has(bp.model_name)) continue;
      const mid = modelIdByName.get(bp.model_name);
      accessTable.push({
        id: this.nextId('ir.model.access'),
        name: `${bp.model_label} (${role.code || baseRole})`,
        role_id: roleId,
        model_id: mid,
        model_name: bp.model_name,
        module_group: bp.module_group,
        perm_read: bp.perm_read,
        perm_write: bp.perm_write,
        perm_create: bp.perm_create,
        perm_unlink: bp.perm_unlink,
        active: true,
        create_date: new Date().toISOString(),
        write_date: new Date().toISOString(),
      });
    }

    const existingRules = new Set(
      this.all('ir.rule')
        .filter((r) => Number(r.role_id) === roleId)
        .map((r) => String(r.name)),
    );
    const ruleBlueprint = buildDefaultRuleBlueprint(baseRole);
    const ruleTable = this.all('ir.rule');
    for (const rp of ruleBlueprint) {
      if (existingRules.has(rp.name)) continue;
      const mid = modelIdByName.get(rp.model_name);
      ruleTable.push({
        id: this.nextId('ir.rule'),
        name: rp.name,
        role_id: roleId,
        model_id: mid,
        model_name: rp.model_name,
        scope_preset: rp.scope_preset,
        perm_read: rp.perm_read,
        perm_write: rp.perm_write,
        perm_create: rp.perm_create,
        perm_unlink: rp.perm_unlink,
        global: rp.global,
        active: true,
        create_date: new Date().toISOString(),
        write_date: new Date().toISOString(),
      });
    }

    this.recomputeRoleCounts(roleId);
    this.save();
  }

  ensureSecurityBootstrap(): void {
    this.syncSystemModelsCatalog();
    const roles = this.all('res.users.role');
    const roleIds = new Set(roles.map((r) => r.id));
    this.state.tables['ir.model.access'] = this.all('ir.model.access').filter((l) => roleIds.has(Number(l.role_id)));
    this.state.tables['ir.rule'] = this.all('ir.rule').filter((r) => roleIds.has(Number(r.role_id)));
    for (const r of roles) {
      if (!r.base_role) {
        const code = String(r.code || '').toUpperCase();
        const name = String(r.name || '').toLowerCase();
        if (code.includes('ADMIN') || name.includes('admin')) r.base_role = 'admin';
        else if (code.includes('FACULTY') || name.includes('faculty') || name.includes('teacher')) r.base_role = 'faculty';
        else r.base_role = 'backoffice';
      }
      const hasAccess = this.all('ir.model.access').some((l) => Number(l.role_id) === r.id);
      if (!hasAccess) {
        this.populateRolePermissions(r.id, (r.base_role || 'faculty') as Role, false);
      } else {
        this.recomputeRoleCounts(r.id);
      }
    }
    const users = this.all('res.users');
    for (const u of users) {
      if (!u.role_id && u.role) {
        const matched = roles.find((r) => r.base_role === u.role);
        if (matched) u.role_id = matched.id;
      }
    }
    this.save();
  }

  private recomputeInvoiceTotals(moveId: number): void {
    const inv = this.byId('account.move', moveId);
    if (!inv) return;
    const lines = this.all('account.move.line').filter((l) => Number(l.move_id) === moveId);
    if (lines.length === 0) return;
    const prevTotal = Number(inv.amount_total ?? 0);
    const prevResidual = Number(inv.amount_residual ?? prevTotal);
    const alreadyPaid = Math.max(0, prevTotal - prevResidual);
    const nextTotal = lines.reduce((sum, l) => sum + Number(l.price_subtotal ?? (Number(l.quantity ?? 1) * Number(l.price_unit ?? 0))), 0);
    inv.amount_total = nextTotal;
    inv.amount_residual = Math.max(0, nextTotal - alreadyPaid);
  }

  private recomputeEnrollmentProgress(enrollmentId: number): void {
    const enr = this.byId('op.course.enrollment', enrollmentId);
    if (!enr) return;
    const lines = this.all('op.course.enrollment.line').filter((l) => Number(l.enrollment_id) === enrollmentId);
    if (lines.length === 0) return;
    const done = lines.filter((l) => Boolean(l.is_completed)).length;
    const pct = Math.round((done / lines.length) * 100);
    enr.progress = pct;
    if (pct === 100) {
      enr.state = 'done';
      enr.completion_date = new Date().toISOString();
    } else if (done > 0 && enr.state === 'draft') {
      enr.state = 'in_progress';
    }
  }

  write(model: string, id: number, vals: Record<string, unknown>, authorId = 1, logChatter = true): Rec {
    const rec = this.byId(model, id);
    if (!rec) throw new Error(`${model}#${id} not found`);
    const def = MODEL_MAP[model];
    const diffs: string[] = [];
    for (const [k, v] of Object.entries(vals)) {
      if (k === 'id' || k === 'display_name' || k === '_smart_counts' || k.endsWith('__label') || k.endsWith('__labels')) continue;
      if (def?.fields[k]?.type === 'one2many') continue;
      if (rec[k] !== v) {
        const label = def?.fields[k]?.string ?? k;
        diffs.push(`${label}: ${rec[k] ?? '—'} → ${v ?? '—'}`);
        rec[k] = v;
      }
    }
    if (model === 'account.move.line') {
      rec.price_subtotal = Number(rec.quantity ?? 1) * Number(rec.price_unit ?? 0);
      if (rec.move_id) this.recomputeInvoiceTotals(Number(rec.move_id));
    }
    if ((model === 'ir.model.access' || model === 'ir.rule') && rec.model_id) {
      const mRec = this.byId('ir.model', Number(rec.model_id));
      if (mRec) {
        rec.model_name = mRec.model;
        if (model === 'ir.model.access') rec.module_group = mRec.app_category || classifyModelGroup(String(mRec.model));
      }
    }
    if ((model === 'ir.model.access' || model === 'ir.rule') && rec.role_id) {
      this.recomputeRoleCounts(Number(rec.role_id));
    }
    if (model === 'res.users' && vals.role_id !== undefined && rec.role_id) {
      const roleRec = this.byId('res.users.role', Number(rec.role_id));
      if (roleRec?.base_role) rec.role = roleRec.base_role;
    }
    if (model === 'op.course.enrollment.line' && rec.enrollment_id) {
      this.recomputeEnrollmentProgress(Number(rec.enrollment_id));
    }
    if (model === 'op.exam.attendees' && rec.marks !== undefined) {
      const m = Number(rec.marks);
      rec.grade = m >= 90 ? '9' : m >= 80 ? '8' : m >= 70 ? '7' : m >= 60 ? '6' : m >= 50 ? '5' : m >= 40 ? '4' : m >= 30 ? '3' : m >= 20 ? '2' : m >= 10 ? '1' : 'U';
    }
    if (logChatter && diffs.length > 0 && model !== 'ir.cron' && model !== 'queue.job') {
      this.logMessage(model, id, diffs.join(' | '), authorId, 'tracking');
    }
    this.save();
    return this.hydrate(model, rec);
  }

  unlink(model: string, id: number): boolean {
    const list = this.all(model);
    const idx = list.findIndex((r) => r.id === Number(id));
    if (idx === -1) return false;
    const removed = list[idx];
    list.splice(idx, 1);
    if (model === 'account.move.line' && removed?.move_id) {
      this.recomputeInvoiceTotals(Number(removed.move_id));
    }
    if ((model === 'ir.model.access' || model === 'ir.rule') && removed?.role_id) {
      this.recomputeRoleCounts(Number(removed.role_id));
    }
    if (model === 'res.users.role') {
      this.state.tables['ir.model.access'] = this.all('ir.model.access').filter((l) => Number(l.role_id) !== Number(id));
      this.state.tables['ir.rule'] = this.all('ir.rule').filter((r) => Number(r.role_id) !== Number(id));
    }
    this.save();
    return true;
  }

  copy(model: string, id: number, authorId = 1): Rec {
    const orig = this.byId(model, id);
    if (!orig) throw new Error(`${model}#${id} not found to duplicate`);
    const clone: Record<string, unknown> = { ...orig };
    delete clone.id;
    delete clone.create_date;
    delete clone.write_date;
    delete clone._smart_counts;
    if (typeof clone.name === 'string') clone.name = `${clone.name} (copy)`;
    if (typeof clone.first_name === 'string') clone.first_name = `${clone.first_name} (copy)`;
    if (clone.state && clone.state !== 'draft') clone.state = 'draft';
    if (model === 'op.admission') delete clone.application_number;
    if (model === 'op.student') delete clone.gr_no;
    if (model === 'account.move') delete clone.name;
    if (model === 'sale.order') delete clone.name;
    if (model === 'purchase.order') delete clone.name;
    return this.create(model, clone, authorId);
  }

  logMessage(res_model: string, res_id: number, body: string, author_id = 1, message_type = 'comment'): Rec {
    const id = this.nextId('mail.message');
    const msg: Rec = {
      id,
      res_model,
      res_id,
      body,
      author_id,
      message_type,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    this.all('mail.message').unshift(msg);
    return msg;
  }
}

export const store = new Store();
