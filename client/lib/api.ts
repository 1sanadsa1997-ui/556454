export function authHeaders() {
  const token = localStorage.getItem('ph_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch(path: string, opts: RequestInit = {}) {
  const headers = { ...(opts.headers || {}), ...authHeaders(), 'Content-Type': (opts.headers as any)?.['Content-Type'] || 'application/json' };
  const res = await fetch(path, { ...opts, headers });
  return res;
}
