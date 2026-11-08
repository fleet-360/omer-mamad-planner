// Storage for users / orders / projects / uploads / exports.
// Postgres (Neon, from the Vercel Marketplace) when DATABASE_URL is set, otherwise a JSON file (local demo, zero setup).
// Every call site goes through these async functions; `match` is a plain equality filter, e.g. { email }.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import { config } from './config.js';

const EMPTY = { users: [], orders: [], projects: [], uploads: [], exports: [] };
const newRow = (doc) => ({ id: doc.id || crypto.randomUUID(), createdAt: new Date().toISOString(), ...doc });

// ------------------------------------------------------------------ Postgres: one table per collection, (id, data jsonb)
// ponytail: documents in jsonb mirror the JSON store 1:1; move hot fields to real columns if reporting/queries need it.
const sql = config.databaseUrl ? neon(config.databaseUrl) : null;
const t = (table) => {
  if (!(table in EMPTY)) throw new Error(`unknown table ${table}`); // table names are interpolated: whitelist only
  return table;
};

const pgDb = {
  async list(table, match = {}) {
    const rows = await sql.query(`select data from ${t(table)} where data @> $1::jsonb order by created_at`, [JSON.stringify(match)]);
    return rows.map((r) => r.data);
  },
  async find(table, match) {
    const rows = await sql.query(`select data from ${t(table)} where data @> $1::jsonb limit 1`, [JSON.stringify(match)]);
    return rows[0]?.data || null;
  },
  async countIdPrefix(table, prefix) {
    const rows = await sql.query(`select count(*)::int as n from ${t(table)} where id like $1`, [`${prefix}%`]);
    return rows[0].n;
  },
  async insert(table, doc) {
    const row = newRow(doc);
    await sql.query(`insert into ${t(table)} (id, data) values ($1, $2::jsonb)`, [row.id, JSON.stringify(row)]);
    return row;
  },
  async update(table, id, patch) {
    const rows = await sql.query(`update ${t(table)} set data = data || $2::jsonb where id = $1 returning data`, [
      id, JSON.stringify({ ...patch, updatedAt: new Date().toISOString() }),
    ]);
    return rows[0]?.data || null;
  },
};

// ------------------------------------------------------------------ JSON file (data/db.json)
const FILE = path.join(config.dataDir, 'db.json');
const matches = (row, match) => Object.entries(match).every(([k, v]) => row[k] === v);
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

export const dbKind = sql ? 'postgres' : 'file';
export const db = sql ? pgDb : fileDb;
