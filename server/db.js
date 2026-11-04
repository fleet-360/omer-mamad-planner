// Minimal JSON-file store so the system works out of the box.
// Swap for Postgres / Supabase / MongoDB later — every call site goes through these functions.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { config } from './config.js';

const FILE = path.join(config.dataDir, 'db.json');
const EMPTY = { users: [], orders: [], projects: [], uploads: [], exports: [] };

let state = null;

function load() {
  if (state) return state;
  try {
    state = { ...EMPTY, ...JSON.parse(fs.readFileSync(FILE, 'utf8')) };
  } catch {
    state = structuredClone(EMPTY);
  }
  return state;
}

function persist() {
  fs.mkdirSync(config.dataDir, { recursive: true });
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, FILE);
}

export const db = {
  all(col) {
    return load()[col];
  },
  find(col, pred) {
    return load()[col].find(pred) || null;
  },
  insert(col, doc) {
    const row = { id: doc.id || crypto.randomUUID(), createdAt: new Date().toISOString(), ...doc };
    load()[col].push(row);
    persist();
    return row;
  },
  update(col, id, patch) {
    const row = load()[col].find((r) => r.id === id);
    if (!row) return null;
    Object.assign(row, patch, { updatedAt: new Date().toISOString() });
    persist();
    return row;
  },
};
