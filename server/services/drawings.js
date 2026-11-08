// DWG-only drawing upload. The browser sends the file straight to storage (Vercel caps request bodies at 4.5MB),
// then the API checks the DWG signature in the first 6 bytes and deletes anything that isn't a real DWG.
//   Vercel Blob (BLOB_READ_WRITE_TOKEN set): private store, client upload with a token from POST /api/uploads/blob.
//   Local (no token): PUT /api/uploads/local/:file -> uploads/
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { get, head, del } from '@vercel/blob';
import { handleUpload } from '@vercel/blob/client';
import { config } from '../config.js';

export const useBlob = !!config.blobToken;
const LOCAL_NAME = /^\d+-[0-9a-f]{12}\.dwg$/;
// same shape before and after Blob appends its random suffix (drawings/drawing.dwg -> drawings/drawing-AbC123.dwg)
const BLOB_NAME = /^drawings\/[A-Za-z0-9_-]+\.dwg$/;

export const isStoredName = (p) => (useBlob ? BLOB_NAME : LOCAL_NAME).test(String(p || ''));
export const isLocalName = (p) => LOCAL_NAME.test(String(p || ''));

/** -> { blob: true } (client uploads with @vercel/blob) or { path, uploadUrl } (local PUT, relative to /api) */
export function startUpload() {
  if (useBlob) return { blob: true };
  const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.dwg`;
  return { path: name, uploadUrl: `/uploads/local/${name}` };
}

/** Blob only: issues the short-lived client upload token (DWG name, size cap, random suffix, overwrite off) */
export function blobUploadToken(req) {
  return handleUpload({
    request: req,
    body: req.body,
    onBeforeGenerateToken: async (pathname) => {
      if (!BLOB_NAME.test(pathname)) throw Object.assign(new Error('ניתן להעלות קובץ DWG בלבד'), { status: 400, expose: true });
      return { maximumSizeInBytes: config.maxUploadMb * 1024 * 1024, addRandomSuffix: true, allowOverwrite: false };
    },
  });
}

/** -> { head: first 6 bytes, size } of a stored drawing, or null if it doesn't exist */
export async function readStored(name) {
  if (!useBlob) {
    const file = path.join(config.uploadDir, name);
    if (!fs.existsSync(file)) return null;
    const fd = fs.openSync(file, 'r');
    const buf = Buffer.alloc(6);
    fs.readSync(fd, buf, 0, 6, 0);
    fs.closeSync(fd);
    return { head: buf, size: fs.statSync(file).size };
  }
  const meta = await head(name).catch(() => null);
  if (!meta) return null;
  const r = await get(name, { access: 'private', headers: { Range: 'bytes=0-5' } });
  if (!r?.stream) return null;
  // read only the first chunk even if Range is ignored
  const reader = r.stream.getReader();
  let buf = Buffer.alloc(0);
  while (buf.length < 6) {
    const { done, value } = await reader.read();
    if (done) break;
    buf = Buffer.concat([buf, value]);
  }
  reader.cancel().catch(() => {});
  return { head: buf.subarray(0, 6), size: meta.size };
}

export async function removeDrawing(name) {
  if (!useBlob) return fs.promises.unlink(path.join(config.uploadDir, name)).catch(() => {});
  await del(name).catch(() => {});
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
export function inspectDwg(head6) {
  const code = head6 ? head6.toString('latin1') : '';
  const ok = /^AC(10\d\d|1\.\d\d|2\.\d\d)$/.test(code);
  return { ok, code, version: VERSIONS[code] || (ok ? code : null) };
}
