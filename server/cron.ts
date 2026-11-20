import { store } from './store.js';
import { runCronJob } from './methods.js';

let timer: NodeJS.Timeout | null = null;
let lastTickMinute = '';

function matchField(expr: string, val: number): boolean {
  if (expr === '*') return true;
  if (expr.startsWith('*/')) {
    const step = Number(expr.slice(2));
    return step > 0 && val % step === 0;
  }
  return expr.split(',').some((part) => {
    if (part.includes('-')) {
      const [a, b] = part.split('-').map(Number);
      return val >= a && val <= b;
    }
    return Number(part) === val;
  });
}

export function cronMatches(cronExpr: string, d: Date): boolean {
  const parts = cronExpr.trim().split(/\s+/);
  if (parts.length !== 5) return false;
  const [min, hour, dom, mon, dow] = parts;
  return (
    matchField(min, d.getMinutes()) &&
    matchField(hour, d.getHours()) &&
    matchField(dom, d.getDate()) &&
    matchField(mon, d.getMonth() + 1) &&
    matchField(dow, d.getDay())
  );
}

export function startCronScheduler(): void {
  if (timer) return;
  timer = setInterval(() => {
    const now = new Date();
    const minuteKey = now.toISOString().slice(0, 16);
    if (minuteKey === lastTickMinute) return;
    lastTickMinute = minuteKey;

    for (const job of store.all('ir.cron')) {
      if (!job.active) continue;
      if (cronMatches(String(job.cron), now)) {
        try {
          runCronJob(job.id, 1);
        } catch {
          // Recorded via queue.job if failed
        }
      }
    }
  }, 15_000);
}

export function stopCronScheduler(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
