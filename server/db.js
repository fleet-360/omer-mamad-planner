// Storage for users / orders / projects / uploads / exports.
// Supabase when SUPABASE_URL is set (production on Vercel), otherwise a JSON file (local demo, zero setup).
// Every call site goes through these async functions; `match` is a plain equality filter, e.g. { email }.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

export const supabase = config.supabase.url
  ? createClient(config.supabase.url, config.supabase.serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

const newRow = (doc) => ({ id: doc.id || crypto.randomUUID(), createdAt: new Date().toISOString(), ...doc });
const matches = (row, match) => Object.entries(match).every(([k, v]) => row[k] === v);

// ------------------------------------------------------------------ Supabase: one table per collection, (id, data jsonb)
// ponytail: documents in jsonb mirror the JSON store 1:1; move hot fields to real columns if reporting/queries need it.
const unwrap = ({ data, error }) => { if (error) throw error; return data; };
const col = (k) => (k === 'id' ? 'id' : `data->>${k}`);
const where = (q, match) => Object.entries(match).reduce((q2, [k, v]) => q2.eq(col(k), String(v)), q);

const supabaseDb = {
  async list(table, match = {}) {
    return unwrap(await where(supabase.from(table).select('data'), match).order('created_at')).map((r) => r.data);
  },
  async find(table, match) {
    return unwrap(await where(supabase.from(table).select('data'), match).limit(1).maybeSingle())?.data || null;
  },
  async countIdPrefix(table, prefix) {
    const { count, error } = await supabase.from(table).select('id', { count: 'exact', head: true }).like('id', `${prefix}%`);
    if (error) throw error;
    return count;
  },
  async insert(table, doc) {
    const row = newRow(doc);
    unwrap(await supabase.from(table).insert({ id: row.id, data: row }));
    return row;
  },
  async update(table, id, patch) {
    const row = await this.find(table, { id });
    if (!row) return null;
    Object.assign(row, patch, { updatedAt: new Date().toISOString() });
    unwrap(await supabase.from(table).update({ data: row }).eq('id', id));
    return row;
  },
};

// ------------------------------------------------------------------ JSON file (data/db.json)
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

const fileDb = {
  async list(table, match = {}) {
    return load()[table].filter((r) => matches(r, match));
  },
  async find(table, match) {
    return load()[table].find((r) => matches(r, match)) || null;
  },
  async countIdPrefix(table, prefix) {
    return load()[table].filter((r) => r.id.startsWith(prefix)).length;
  },
  async insert(table, doc) {
    const row = newRow(doc);
    load()[table].push(row);
    persist();
    return row;
  },
  async update(table, id, patch) {
    const row = load()[table].find((r) => r.id === id);
    if (!row) return null;
    Object.assign(row, patch, { updatedAt: new Date().toISOString() });
    persist();
    return row;
  },
};

export const db = supabase ? supabaseDb : fileDb;
