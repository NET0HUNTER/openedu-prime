import type { Role } from './menus.js';

export interface ModelAccessRule {
  model: string;
  read: Role[];
  write: Role[];
  create: Role[];
  unlink: Role[];
}

export interface IrModelAccess {
  id?: number;
  name?: string;
  role_id: number;
  model_id?: number;
  model_name: string;
  module_group?: string;
  perm_read: boolean;
  perm_write: boolean;
  perm_create: boolean;
  perm_unlink: boolean;
  active?: boolean;
}

export type ScopePreset = 'all' | 'own_campus' | 'own_records' | 'assigned_faculty' | 'protect_posted';

export interface IrRule {
  id?: number;
  name: string;
  role_id: number;
  model_id?: number;
  model_name: string;
  scope_preset: ScopePreset;
  domain_force?: string;
  perm_read: boolean;
  perm_write: boolean;
  perm_create: boolean;
  perm_unlink: boolean;
  global?: boolean;
  active?: boolean;
}

export const FINANCIAL_MODELS = new Set([
  'account.move',
  'account.move.line',
  'account.journal',
  'account.payment',
  'account.batch.payment',
  'sale.order',
  'sale.order.line',
  'purchase.order',
  'purchase.order.line',
  'stock.picking',
  'stock.quant',
  'stock.warehouse',
  'res.config.settings',
  'ir.module.module',
  'ir.model.access',
  'ir.rule',
  'res.users',
  'res.users.role',
  'res.company',
]);

/** Core infrastructure tables safely readable so unchecking business modules never crashes shell navigation */
export const CORE_SAFE_READ_MODELS = new Set([
  'res.company',
  'res.country',
  'res.country.state',
  'res.country.group',
  'res.lang',
  'res.partner.category',
  'res.partner.title',
  'mail.message',
  'mail.activity',
  'op.academic.year',
  'op.academic.term',
  'ir.model',
]);

export const ACADEMIC_WRITE_MODELS = new Set([
  'op.session',
  'op.attendance.sheet',
  'op.attendance.line',
  'op.assignment',
  'op.assignment.sub.line',
  'op.quiz',
  'op.quiz.result',
  'op.exam.attendees',
  'op.thesis.registration',
  'op.thesis.progress',
  'hr.leave',
  'hr.expense',
]);

export const PORTAL_SELF_SERVICE_MODELS = new Set([
  'op.assignment.sub.line',
  'op.quiz.result',
  'op.quiz.result.line',
  'op.course.enrollment',
  'op.course.enrollment.line',
  'op.subject.registration',
  'op.student.course.change.req',
  'op.media.queue',
  'helpdesk.ticket',
  'grievance',
  'student.leave.request',
  'mail.message',
  'mail.activity',
]);

export function classifyModelGroup(modelName: string): string {
  if (modelName.startsWith('hr.')) return 'HR & Payroll';
  if (modelName.startsWith('op.media') || modelName.startsWith('op.library') || modelName === 'barcode.issue.media') {
    return 'Library';
  }
  if (
    modelName.startsWith('account.') ||
    modelName.startsWith('payment.') ||
    modelName.startsWith('sale.') ||
    modelName.startsWith('purchase.') ||
    modelName.startsWith('stock.') ||
    modelName.startsWith('product.') ||
    modelName.startsWith('op.fees') ||
    modelName.startsWith('op.scholarship')
  ) {
    return 'Finance & Accounting';
  }
  if (modelName.startsWith('op.admission') || modelName.startsWith('admission.')) {
    return 'Admissions';
  }
  if (
    modelName.startsWith('op.course.module') ||
    modelName.startsWith('op.course.enrollment') ||
    modelName.startsWith('op.course.question') ||
    modelName.startsWith('op.course.category') ||
    modelName.startsWith('op.course.tag') ||
    modelName.startsWith('op.course.announcement') ||
    modelName.startsWith('op.lms') ||
    modelName.startsWith('op.digital.library')
  ) {
    return 'LMS & E-Learning';
  }
  if (
    modelName.startsWith('op.session') ||
    modelName.startsWith('op.attendance') ||
    modelName === 'op.timing' ||
    modelName === 'op.classroom'
  ) {
    return 'Timetable & Attendance';
  }
  if (
    modelName.startsWith('op.exam') ||
    modelName.startsWith('op.quiz') ||
    modelName.startsWith('op.assignment') ||
    modelName.startsWith('gradebook.') ||
    modelName.startsWith('grading.') ||
    modelName.startsWith('op.omr') ||
    modelName === 'op.honorroll' ||
    modelName.startsWith('op.thesis') ||
    modelName === 'course.outcome' ||
    modelName === 'course.credit' ||
    modelName.startsWith('op.result')
  ) {
    return 'Exams & Gradebook';
  }
  if (
    modelName.startsWith('op.student') ||
    modelName.startsWith('op.faculty') ||
    modelName.startsWith('op.parent') ||
    modelName === 'op.course' ||
    modelName === 'op.batch' ||
    modelName === 'op.section' ||
    modelName.startsWith('op.subject') ||
    modelName.startsWith('op.program') ||
    modelName === 'op.department' ||
    modelName.startsWith('op.academic') ||
    modelName === 'op.achievement' ||
    modelName === 'op.activity' ||
    modelName === 'op.health' ||
    modelName.startsWith('op.board')
  ) {
    return 'Academics & SIS';
  }
  if (
    modelName.startsWith('op.transport') ||
    modelName === 'op.vehicle' ||
    modelName.startsWith('op.hostel') ||
    modelName.startsWith('op.campus') ||
    modelName.startsWith('op.facility') ||
    modelName.startsWith('op.canteen') ||
    modelName.startsWith('event.') ||
    modelName.startsWith('op.alumni') ||
    modelName.startsWith('op.placement') ||
    modelName.startsWith('op.notice') ||
    modelName === 'grievance' ||
    modelName === 'student.leave.request'
  ) {
    return 'Campus & Student Life';
  }
  if (
    modelName.startsWith('res.') ||
    modelName.startsWith('ir.') ||
    modelName.startsWith('queue.') ||
    modelName.startsWith('mail.') ||
    modelName.startsWith('comm.') ||
    modelName.startsWith('e.sign')
  ) {
    return 'Settings & Security';
  }
  return 'Comms, AI & Backoffice';
}

export interface AccessBlueprintItem {
  model_name: string;
  model_label: string;
  module_group: string;
  perm_read: boolean;
  perm_write: boolean;
  perm_create: boolean;
  perm_unlink: boolean;
}

/**
 * Generates the complete model access table for a base role so admins can inspect
 * all models & uncheck specific modules/tables cleanly.
 */
export function buildDefaultAccessBlueprint(
  baseRole: Role,
  models: { name: string; string: string }[],
): AccessBlueprintItem[] {
  return models.map((m) => {
    const model = m.name;
    const module_group = classifyModelGroup(model);
    if (baseRole === 'admin') {
      return {
        model_name: model,
        model_label: m.string,
        module_group,
        perm_read: true,
        perm_write: true,
        perm_create: true,
        perm_unlink: true,
      };
    }
    if (baseRole === 'faculty') {
      const isRestricted = FINANCIAL_MODELS.has(model) || model === 'ir.cron' || model === 'queue.job';
      const isCoreSafe = CORE_SAFE_READ_MODELS.has(model);
      const isAcademicWrite =
        ACADEMIC_WRITE_MODELS.has(model) ||
        module_group === 'LMS & E-Learning' ||
        module_group === 'Timetable & Attendance' ||
        module_group === 'Exams & Gradebook';
      return {
        model_name: model,
        model_label: m.string,
        module_group,
        perm_read: isRestricted ? isCoreSafe : true,
        perm_write: isRestricted ? false : isAcademicWrite || !model.startsWith('res.'),
        perm_create: isRestricted ? false : isAcademicWrite || !model.startsWith('res.'),
        perm_unlink: isRestricted ? false : model.startsWith('op.quiz') || model.startsWith('op.assignment') || model.startsWith('op.course.module'),
      };
    }
    if (baseRole === 'backoffice') {
      const isSystemAdminOnly =
        model === 'ir.model.access' ||
        model === 'ir.rule' ||
        model === 'res.users.role' ||
        model === 'res.config.settings';
      const protectDelete = model === 'account.move' || model === 'res.users' || model === 'res.company';
      return {
        model_name: model,
        model_label: m.string,
        module_group,
        perm_read: !isSystemAdminOnly || CORE_SAFE_READ_MODELS.has(model),
        perm_write: !isSystemAdminOnly,
        perm_create: !isSystemAdminOnly,
        perm_unlink: !isSystemAdminOnly && !protectDelete,
      };
    }
    // Portal roles (student / parent)
    const selfService = PORTAL_SELF_SERVICE_MODELS.has(model);
    const blockedInternal = model.startsWith('hr.') || model.startsWith('ir.') || model === 'res.users.role';
    return {
      model_name: model,
      model_label: m.string,
      module_group,
      perm_read: !blockedInternal,
      perm_write: selfService,
      perm_create: selfService,
      perm_unlink: false,
    };
  });
}

export interface RuleBlueprintItem {
  name: string;
  model_name: string;
  scope_preset: ScopePreset;
  perm_read: boolean;
  perm_write: boolean;
  perm_create: boolean;
  perm_unlink: boolean;
  global: boolean;
}

export function buildDefaultRuleBlueprint(baseRole: Role): RuleBlueprintItem[] {
  if (baseRole === 'admin') {
    return [
      {
        name: 'Multi-Campus Student Access (All Campuses)',
        model_name: 'op.student',
        scope_preset: 'all',
        perm_read: true,
        perm_write: true,
        perm_create: true,
        perm_unlink: true,
        global: true,
      },
      {
        name: 'Audit Trail Protection (Chatter Messages)',
        model_name: 'mail.message',
        scope_preset: 'all',
        perm_read: true,
        perm_write: true,
        perm_create: true,
        perm_unlink: false,
        global: true,
      },
      {
        name: 'Campus Financial Ledger Governance',
        model_name: 'account.move',
        scope_preset: 'all',
        perm_read: true,
        perm_write: true,
        perm_create: true,
        perm_unlink: true,
        global: false,
      },
    ];
  }
  if (baseRole === 'faculty') {
    return [
      {
        name: 'Own Campus Students (Read-Only Roster)',
        model_name: 'op.student',
        scope_preset: 'own_campus',
        perm_read: true,
        perm_write: false,
        perm_create: false,
        perm_unlink: false,
        global: false,
      },
      {
        name: 'Assigned Timetable Sessions',
        model_name: 'op.session',
        scope_preset: 'assigned_faculty',
        perm_read: true,
        perm_write: true,
        perm_create: true,
        perm_unlink: false,
        global: false,
      },
      {
        name: 'Own Campus Class Attendance',
        model_name: 'op.attendance.sheet',
        scope_preset: 'own_campus',
        perm_read: true,
        perm_write: true,
        perm_create: true,
        perm_unlink: false,
        global: false,
      },
      {
        name: 'Own Campus Gradebook Assessments',
        model_name: 'gradebook.gradebook',
        scope_preset: 'own_campus',
        perm_read: true,
        perm_write: true,
        perm_create: true,
        perm_unlink: false,
        global: false,
      },
      {
        name: 'Own HR Leave Requests',
        model_name: 'hr.leave',
        scope_preset: 'own_records',
        perm_read: true,
        perm_write: true,
        perm_create: true,
        perm_unlink: false,
        global: false,
      },
    ];
  }
  if (baseRole === 'backoffice') {
    return [
      {
        name: 'Block Delete on Posted Invoices',
        model_name: 'account.move',
        scope_preset: 'protect_posted',
        perm_read: true,
        perm_write: true,
        perm_create: true,
        perm_unlink: false,
        global: false,
      },
      {
        name: 'Own Campus Admissions Applications',
        model_name: 'op.admission',
        scope_preset: 'own_campus',
        perm_read: true,
        perm_write: true,
        perm_create: true,
        perm_unlink: true,
        global: false,
      },
      {
        name: 'Own Campus Student Profiles',
        model_name: 'op.student',
        scope_preset: 'own_campus',
        perm_read: true,
        perm_write: true,
        perm_create: true,
        perm_unlink: false,
        global: false,
      },
      {
        name: 'Own Campus HR Staff Records',
        model_name: 'hr.employee',
        scope_preset: 'own_campus',
        perm_read: true,
        perm_write: true,
        perm_create: true,
        perm_unlink: false,
        global: false,
      },
    ];
  }
  return [
    {
      name: 'Portal Self-Service Own Records',
      model_name: 'op.assignment.sub.line',
      scope_preset: 'own_records',
      perm_read: true,
      perm_write: true,
      perm_create: true,
      perm_unlink: false,
      global: false,
    },
  ];
}

export interface CheckAccessOptions {
  accessLines?: IrModelAccess[];
  roleName?: string;
}

/**
 * Checks if a given role (and optional custom role Access Rights checkboxes)
 * is permitted to perform the specified CRUD action on a model.
 */
export function checkModelAccess(
  model: string,
  role: Role,
  action: 'read' | 'write' | 'create' | 'unlink',
  options?: CheckAccessOptions,
): { allowed: boolean; reason?: string } {
  // 1. Dynamic checkbox override if role has explicit ir.model.access lines
  if (options?.accessLines && options.accessLines.length > 0) {
    const line = options.accessLines.find((l) => l.model_name === model && l.active !== false);
    if (line) {
      const permMap: Record<'read' | 'write' | 'create' | 'unlink', boolean> = {
        read: Boolean(line.perm_read),
        write: Boolean(line.perm_write),
        create: Boolean(line.perm_create),
        unlink: Boolean(line.perm_unlink),
      };
      if (action === 'read' && CORE_SAFE_READ_MODELS.has(model)) {
        return { allowed: true };
      }
      if (!permMap[action]) {
        const label = options.roleName || role;
        return {
          allowed: false,
          reason: `Access Denied: Role '${label}' (${role}) has '${action}' unchecked on model '${model}' (ir.model.access restriction).`,
        };
      }
      return { allowed: true };
    }
  }

  // 2. Fallback static RBAC rules by base profile
  if (role === 'admin') return { allowed: true };

  if (role === 'faculty' && FINANCIAL_MODELS.has(model)) {
    if (action === 'read' && CORE_SAFE_READ_MODELS.has(model)) return { allowed: true };
    return {
      allowed: false,
      reason: `Access Denied: Role 'faculty' is restricted from ${action} operations on financial/system model '${model}' (RBAC ir.model.access restriction).`,
    };
  }

  if (role === 'backoffice') {
    if (action === 'unlink' && (model === 'account.move' || model === 'res.users')) {
      return {
        allowed: false,
        reason: `Access Denied: Backoffice users cannot unlink system audit records in '${model}'.`,
      };
    }
    return { allowed: true };
  }

  if (role === 'student' || role === 'parent') {
    if (action === 'read') return { allowed: true };
    if ((action === 'create' || action === 'write') && PORTAL_SELF_SERVICE_MODELS.has(model)) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: `Access Denied: Portal role '${role}' cannot directly ${action} backend model '${model}'.`,
    };
  }

  return { allowed: true };
}

/**
 * Evaluates active ir.rule row-level policies for a single record on write/unlink/create.
 */
export function evaluateRecordRuleWrite(
  model: string,
  action: 'read' | 'write' | 'create' | 'unlink',
  user: Record<string, any> | undefined,
  record: Record<string, any> | undefined,
  rules: IrRule[],
): { allowed: boolean; reason?: string } {
  if (!user || user.role === 'admin' && !rules.some((r) => r.model_name === model && r.active !== false)) {
    return { allowed: true };
  }
  const matching = rules.filter((r) => r.model_name === model && r.active !== false);
  if (matching.length === 0) return { allowed: true };

  for (const rule of matching) {
    const permAllowed =
      action === 'read' ? Boolean(rule.perm_read) :
      action === 'write' ? Boolean(rule.perm_write) :
      action === 'create' ? Boolean(rule.perm_create) :
      Boolean(rule.perm_unlink);

    if (rule.scope_preset === 'protect_posted') {
      if (record && (record.state === 'posted' || record.state === 'done') && !permAllowed) {
        return {
          allowed: false,
          reason: `Access Denied by Record Rule '${rule.name}': '${action}' is unchecked for posted/finalized records in '${model}'.`,
        };
      }
      continue;
    }

    if (rule.scope_preset === 'own_campus' && record?.company_id) {
      const allowedCampuses: number[] = Array.isArray(user.company_ids) && user.company_ids.length > 0
        ? user.company_ids.map(Number)
        : user.company_id ? [Number(user.company_id)] : [];
      if (allowedCampuses.length > 0 && !allowedCampuses.includes(Number(record.company_id))) {
        return {
          allowed: false,
          reason: `Access Denied by Record Rule '${rule.name}': Record belongs to another campus.`,
        };
      }
    }

    if (rule.scope_preset === 'assigned_faculty' && user.faculty_id && record?.faculty_id) {
      if (Number(record.faculty_id) !== Number(user.faculty_id)) {
        if (!permAllowed) {
          return {
            allowed: false,
            reason: `Access Denied by Record Rule '${rule.name}': Only your assigned sessions/classes can be modified.`,
          };
        }
      }
    }

    if (rule.scope_preset === 'own_records' && record) {
      const isOwner =
        (user.id && Number(record.user_id) === Number(user.id)) ||
        (user.id && Number(record.create_uid) === Number(user.id)) ||
        (user.employee_id && Number(record.employee_id) === Number(user.employee_id)) ||
        (user.student_id && Number(record.student_id) === Number(user.student_id));
      if (!isOwner && !permAllowed) {
        return {
          allowed: false,
          reason: `Access Denied by Record Rule '${rule.name}': Restricted to your own records.`,
        };
      }
    }

    if (!permAllowed) {
      return {
        allowed: false,
        reason: `Access Denied by Record Rule '${rule.name}': '${action}' checkbox is unchecked on '${model}'.`,
      };
    }
  }
  return { allowed: true };
}

/**
 * Filters read query rows based on active ir.rule policies for the user's role.
 */
export function filterRowsByRecordRules<T extends Record<string, any>>(
  model: string,
  user: Record<string, any> | undefined,
  rows: T[],
  rules: IrRule[],
): T[] {
  if (!user) return rows;
  const matching = rules.filter((r) => r.model_name === model && r.active !== false);
  if (matching.length === 0) return rows;

  return rows.filter((rec) => {
    for (const rule of matching) {
      if (!rule.perm_read) return false;
      if (rule.scope_preset === 'own_campus' && rec.company_id) {
        const allowedCampuses: number[] = Array.isArray(user.company_ids) && user.company_ids.length > 0
          ? user.company_ids.map(Number)
          : user.company_id ? [Number(user.company_id)] : [];
        if (allowedCampuses.length > 0 && !allowedCampuses.includes(Number(rec.company_id))) {
          return false;
        }
      }
      if (rule.scope_preset === 'own_records') {
        const isOwner =
          (user.id && Number(rec.user_id) === Number(user.id)) ||
          (user.id && Number(rec.create_uid) === Number(user.id)) ||
          (user.employee_id && Number(rec.employee_id) === Number(user.employee_id)) ||
          (user.student_id && Number(rec.student_id) === Number(user.student_id));
        // Only apply own_records filter if any ownership column is populated on the row
        if ((rec.user_id || rec.employee_id || rec.student_id) && !isOwner) {
          return false;
        }
      }
      if (rule.domain_force) {
        try {
          const filter = JSON.parse(rule.domain_force);
          if (filter && typeof filter === 'object' && !Array.isArray(filter)) {
            for (const [fk, fv] of Object.entries(filter)) {
              if (rec[fk] !== fv) return false;
            }
          }
        } catch {
          // ignore malformed custom JSON filter string safely
        }
      }
    }
    return true;
  });
}
