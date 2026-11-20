import type { Role } from './menus.js';

export interface ModelAccessRule {
  model: string;
  read: Role[];
  write: Role[];
  create: Role[];
  unlink: Role[];
}

export const FINANCIAL_MODELS = new Set([
  'account.move',
  'account.move.line',
  'account.journal',
  'account.payment',
  'sale.order',
  'sale.order.line',
  'purchase.order',
  'purchase.order.line',
  'stock.picking',
  'stock.quant',
  'res.config.settings',
  'ir.module.module',
  'res.users',
  'res.company',
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

/**
 * Checks if a given role is permitted to perform the specified CRUD action on a model.
 */
export function checkModelAccess(
  model: string,
  role: Role,
  action: 'read' | 'write' | 'create' | 'unlink'
): { allowed: boolean; reason?: string } {
  // Admin has unconditional root privileges across all models
  if (role === 'admin') return { allowed: true };

  // Financial and System Configuration models: strictly forbidden to Faculty
  if (role === 'faculty' && FINANCIAL_MODELS.has(model)) {
    return {
      allowed: false,
      reason: `Access Denied: Role 'faculty' is restricted from ${action} operations on financial/system model '${model}' (RBAC ir.model.access restriction).`,
    };
  }

  // Backoffice users can manage student records and administrative workflows, but cannot delete audit journals
  if (role === 'backoffice') {
    if (action === 'unlink' && (model === 'account.move' || model === 'res.users')) {
      return {
        allowed: false,
        reason: `Access Denied: Backoffice users cannot unlink system audit records in '${model}'.`,
      };
    }
    return { allowed: true };
  }

  // Student and Parent: Read-only on backend master models, full self-service on portal request models
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
