// DWG-only drawing upload. The browser sends the file straight to storage (Vercel caps request bodies at 4.5MB),
// then the API checks the DWG signature in the first 6 bytes and deletes anything that isn't a real DWG.
//   Supabase: signed upload URL into a private bucket.   Local (no Supabase): PUT /api/uploads/local/:file -> uploads/
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { config } from '../config.js';
import { supabase } from '../db.js';

export const STORED_NAME = /^\d+-[0-9a-f]{12}\.dwg$/;
const bucket = () => supabase.storage.from(config.supabase.bucket);

/** -> { path, uploadUrl } ; uploadUrl is absolute (Supabase) or relative to /api (local) */
export async function startUpload() {
  const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.dwg`;
  if (!supabase) return { path: name, uploadUrl: `/uploads/local/${name}` };
  const { data, error } = await bucket().createSignedUploadUrl(name);
  if (error) throw error;
  return { path: name, uploadUrl: data.signedUrl };
}

/** first 6 bytes of a stored drawing, or null if it doesn't exist */
export async function readHead(name) {
  if (!supabase) {
    const file = path.join(config.uploadDir, name);
    if (!fs.existsSync(file)) return null;
    const fd = fs.openSync(file, 'r');
    const buf = Buffer.alloc(6);
    fs.readSync(fd, buf, 0, 6, 0);
    fs.closeSync(fd);
    return buf;
  }
  const { data, error } = await bucket().createSignedUrl(name, 60);
  if (error) return null;
  const res = await fetch(data.signedUrl, { headers: { Range: 'bytes=0-5' } });
  if (!res.ok) return null;
  // read only the first chunk even if the server ignores Range
  const reader = res.body.getReader();
  let buf = Buffer.alloc(0);
  while (buf.length < 6) {
    const { done, value } = await reader.read();
    if (done) break;
    buf = Buffer.concat([buf, value]);
  }
  reader.cancel().catch(() => {});
  return buf.subarray(0, 6);
}

export async function removeDrawing(name) {
  if (!supabase) return fs.promises.unlink(path.join(config.uploadDir, name)).catch(() => {});
  await bucket().remove([name]);
}

/** local mode only: raw PUT body -> uploads/<name> */
export function saveLocal(name, body) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
  fs.writeFileSync(path.join(config.uploadDir, name), body);
}

// AutoCAD release by DWG header (first 6 bytes)
const VERSIONS = {
  AC1009: 'AutoCAD R12', AC1012: 'AutoCAD R13', AC1014: 'AutoCAD R14', AC1015: 'AutoCAD 2000',
  AC1018: 'AutoCAD 2004', AC1021: 'AutoCAD 2007', AC1024: 'AutoCAD 2010', AC1027: 'AutoCAD 2013', AC1032: 'AutoCAD 2018',
};

/** returns { ok, code, version } from the file's magic bytes */
export function inspectDwg(head) {
  const code = head ? head.toString('latin1') : '';
  const ok = /^AC(10\d\d|1\.\d\d|2\.\d\d)$/.test(code);
  return { ok, code, version: VERSIONS[code] || (ok ? code : null) };
}
