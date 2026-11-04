// DWG-only drawing upload: extension filter, 80MB limit, and a check of the DWG file signature.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import { config } from '../config.js';

fs.mkdirSync(config.uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: config.uploadDir,
  filename: (_req, _file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.dwg`),
});

export const uploadDrawing = multer({
  storage,
  limits: { fileSize: config.maxUploadMb * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() !== '.dwg') {
      return cb(Object.assign(new Error('ניתן להעלות קובץ DWG בלבד'), { status: 400 }));
    }
    cb(null, true);
  },
}).single('drawing');

// AutoCAD release by DWG header (first 6 bytes)
const VERSIONS = {
  AC1009: 'AutoCAD R12', AC1012: 'AutoCAD R13', AC1014: 'AutoCAD R14', AC1015: 'AutoCAD 2000',
  AC1018: 'AutoCAD 2004', AC1021: 'AutoCAD 2007', AC1024: 'AutoCAD 2010', AC1027: 'AutoCAD 2013', AC1032: 'AutoCAD 2018',
};

/** returns { ok, code, version } from the file's magic bytes */
export function inspectDwg(filePath) {
  const fd = fs.openSync(filePath, 'r');
  const buf = Buffer.alloc(6);
  fs.readSync(fd, buf, 0, 6, 0);
  fs.closeSync(fd);
  const code = buf.toString('latin1');
  const ok = /^AC(10\d\d|1\.\d\d|2\.\d\d)$/.test(code);
  return { ok, code, version: VERSIONS[code] || (ok ? code : null) };
}
