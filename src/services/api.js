// Client-side API layer. Every screen talks to the server only through this file.
// All endpoints live under /api (proxied to the Express server in dev — see vite.config.js).

const BASE = import.meta.env.VITE_API_BASE || '/api';

function token() {
  try { return localStorage.getItem('omer-token') || ''; } catch { return ''; }
}

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token() ? { Authorization: 'Bearer ' + token() } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  if (!res.ok) throw new Error((data && data.error) || `שגיאת שרת (${res.status})`);
  return data;
}

function saveToken(r) {
  if (r && r.token) { try { localStorage.setItem('omer-token', r.token); } catch { /* ignore */ } }
  return r;
}

/** PUT the raw file to a storage URL, with progress (fetch has no upload progress, so XHR). */
function putFile(url, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    xhr.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('ההעלאה נכשלה')));
    xhr.onerror = () => reject(new Error('אין חיבור לשרת'));
    xhr.send(file);
  });
}

/** DWG upload: reserve a path -> browser uploads straight to storage -> server checks the DWG signature */
async function uploadDrawing(file, onProgress) {
  const meta = { name: file.name, size: file.size };
  const s = await request('/uploads/drawing/start', { method: 'POST', body: meta });
  await putFile(/^https?:/.test(s.uploadUrl) ? s.uploadUrl : BASE + s.uploadUrl, file, onProgress);
  return request('/uploads/drawing', { method: 'POST', body: { ...meta, path: s.path } });
}

export const api = {
  health: () => request('/health'),
  auth: {
    login: (body) => request('/auth/login', { method: 'POST', body }).then(saveToken),
    signup: (body) => request('/auth/signup', { method: 'POST', body }).then(saveToken),
  },
  payments: {
    /** returns { orderId, status } (direct) or { redirectUrl } (hosted payment page) */
    checkout: (body) => request('/payments/checkout', { method: 'POST', body }),
  },
  projects: {
    submit: (body) => request('/projects', { method: 'POST', body }),
  },
  uploads: {
    drawing: uploadDrawing,
  },
  exports: {
    create: (body) => request('/exports', { method: 'POST', body }),
  },
  billing: {
    invoices: () => request('/billing/invoices'),
  },
};
