const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseDateValue(val: unknown): Date | null {
  if (val === undefined || val === null || val === '') return null;
  const s = String(val).trim();
  if (!s || s === '—') return null;
  // Normalize "YYYY-MM-DD HH:MM" to ISO local-ish parse without timezone shifting for YYYY-MM-DD dates
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const iso = s.includes(' ') && !s.includes('T') ? s.replace(' ', 'T') : s;
  const dt = new Date(iso);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

/** Human-readable Odoo date: "Nov 18, 2026" or "May 6, 1992". Returns "" if blank/invalid. */
export function formatDate(val: unknown): string {
  const dt = parseDateValue(val);
  if (!dt) return val ? String(val) : '';
  return `${MONTHS_SHORT[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
}

/** Short Odoo date without year: "Nov 18". */
export function formatShortDate(val: unknown): string {
  const dt = parseDateValue(val);
  if (!dt) return val ? String(val) : '';
  return `${MONTHS_SHORT[dt.getMonth()]} ${dt.getDate()}`;
}

/** Human-readable Odoo datetime: "Nov 18, 5:24 AM". */
export function formatDateTime(val: unknown): string {
  const dt = parseDateValue(val);
  if (!dt) return val ? String(val) : '';
  const hours24 = dt.getHours();
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  const mins = String(dt.getMinutes()).padStart(2, '0');
  return `${MONTHS_SHORT[dt.getMonth()]} ${dt.getDate()}, ${hours12}:${mins} ${ampm}`;
}

/** Human-readable Odoo date range: "May 1 – May 21" or "Sep 1, 2026 – Jul 18, 2027". */
export function formatDateRange(start: unknown, end: unknown): string {
  const d1 = parseDateValue(start);
  const d2 = parseDateValue(end);
  if (d1 && d2) {
    if (d1.getFullYear() === d2.getFullYear()) {
      return `${MONTHS_SHORT[d1.getMonth()]} ${d1.getDate()} – ${MONTHS_SHORT[d2.getMonth()]} ${d2.getDate()}, ${d1.getFullYear()}`;
    }
    return `${formatDate(start)} – ${formatDate(end)}`;
  }
  if (d1) return formatDate(start);
  if (d2) return formatDate(end);
  return '—';
}

/** Formatted currency with 2 decimal places: "KES 305,000.00". */
export function formatMoney(val: unknown, currency = 'KES'): string {
  const n = Number(val ?? 0);
  const safe = Number.isFinite(n) ? n : 0;
  return `${currency} ${safe.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
