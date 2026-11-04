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

/** Upload with progress (fetch has no upload progress, so XHR). */
function uploadFile(path, field, file, onProgress) {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append(field, file);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', BASE + path);
    if (token()) xhr.setRequestHeader('Authorization', 'Bearer ' + token());
    xhr.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => {
      let data = null;
      try { data = JSON.parse(xhr.responseText); } catch { /* ignore */ }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject(new Error((data && data.error) || 'ההעלאה נכשלה'));
    };
    xhr.onerror = () => reject(new Error('אין חיבור לשרת'));
    xhr.send(fd);
  });
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
    drawing: (file, onProgress) => uploadFile('/uploads/drawing', 'drawing', file, onProgress),
  },
  exports: {
    create: (body) => request('/exports', { method: 'POST', body }),
  },
  billing: {
    invoices: () => request('/billing/invoices'),
  },
};
