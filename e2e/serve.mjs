// Startet den lokalen Modus mit einer frischen Testdatenbank.
import { rmSync } from 'node:fs';

for (const suffix of ['', '-wal', '-shm']) rmSync(`${process.env.BIBERDAMM_DB}${suffix}`, { force: true });
await import('../scripts/local.mjs');
