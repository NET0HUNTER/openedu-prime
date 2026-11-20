export interface ApiContextHeaders {
  userId?: number;
  companyIds?: number[];
}

let ctxHeaders: ApiContextHeaders = {};

export function setApiContext(next: ApiContextHeaders) {
  ctxHeaders = { ...next };
}

export async function apiFetch<T = any>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type') && init?.body) headers.set('Content-Type', 'application/json');
  if (ctxHeaders.userId) headers.set('X-User-Id', String(ctxHeaders.userId));
  if (ctxHeaders.companyIds && ctxHeaders.companyIds.length > 0) {
    headers.set('X-Company-Ids', ctxHeaders.companyIds.join(','));
  }
  const res = await fetch(url, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  return data as T;
}

export function callKw<T = any>(model: string, method: string, body: Record<string, unknown> = {}): Promise<T> {
  return apiFetch<T>(`/api/v1/dataset/call_kw/${encodeURIComponent(model)}/${encodeURIComponent(method)}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
