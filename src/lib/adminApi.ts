const TOKEN_KEY = 'gf_admin_token';

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function adminFetch(path: string, init?: RequestInit) {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const parts = [data.error || `Request failed (${res.status})`];
    if (Array.isArray(data.setupSteps) && data.setupSteps.length) {
      parts.push(data.setupSteps.join(' '));
    }
    throw new Error(parts.join(' '));
  }
  return data;
}

export async function adminLogin(password: string) {
  const data = await adminFetch('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
  setAdminToken(data.token);
  return data;
}

export async function fetchSiteContent() {
  return adminFetch('/api/admin/content');
}

export async function fetchPublishStatus() {
  return adminFetch('/api/admin/status');
}

export async function publishSiteContent(content: unknown) {
  return adminFetch('/api/admin/publish', {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export const DRAFT_STORAGE_KEY = 'gf_admin_draft_content';

export function saveDraftLocally(content: unknown) {
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(content));
}

export function loadDraftLocally(): unknown | null {
  const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearDraftLocally() {
  localStorage.removeItem(DRAFT_STORAGE_KEY);
}
