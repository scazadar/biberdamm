// Erstellt eine konsistente Kopie der Datenbank: node scripts/backup.mjs [Zielordner]
import { DatabaseSync, backup } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const source = process.env.BIBERDAMM_DB ?? 'data/biberdamm.db';
const dir = process.argv[2] ?? 'backups';
mkdirSync(dir, { recursive: true });
const target = join(dir, `biberdamm-${new Date().toISOString().replace(/[:.]/g, '-')}.db`);
const db = new DatabaseSync(source, { readOnly: true });
await backup(db, target);
db.close();
console.log(`Sicherung erstellt: ${target}`);
