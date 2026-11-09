# 🦫 Biberdamm

Lernplattform für Vorschule und Klasse 1–2 zum Selbst-Hosten an Schulen. Die Fachanforderungen stehen in [docs/SPEZIFIKATION.md](docs/SPEZIFIKATION.md).

**Technik:** SvelteKit 3, Svelte 5, TypeScript, SQLite (`node:sqlite`). Voraussetzung ist Node.js 24 oder neuer.

## Ausprobieren

```bash
npm install
npm run build
npm run lokal      # http://localhost:3000
```

Beim ersten Aufruf führt `/setup` durch das Anlegen von Schule und Admin-Konto. Der lokale Modus lauscht nur auf diesem Rechner und ist nicht für den Schulbetrieb gedacht.

## Start mit Docker

```bash
docker compose up -d --build     # https://localhost, Zertifikatswarnung ist hier normal
```

Das startet App, HTTPS-Proxy (Caddy) und die neuronale Stimme (Piper, Stimme `de_DE-thorsten-high`, CC0). Der erste Build lädt das Stimmmodell (rund 110 MB). Für den Schulbetrieb in `.env` die eigene Adresse setzen: `BIBERDAMM_DOMAIN=lernen.meine-schule.de`. Ohne öffentlich erreichbaren Namen braucht Caddy `tls internal` oder ein eigenes Zertifikat.

**Sicherung:** `docker compose exec app node scripts/backup.mjs /data/backups`, danach mit `docker compose cp app:/data/backups .` auf den Host kopieren.

Mit Podman lautet der Befehl `podman compose up -d --build`. Damit die App installierbar und offline nutzbar ist, muss das Gerät dem Zertifikat vertrauen; bei `tls internal` also die Caddy-Stammzertifizierung auf den Geräten einspielen.

Der Piper-Dienst steht unter GPL und läuft deshalb als eigener Container im Netz ohne Internetzugang. Wer das Piper-Image weitergibt, muss die GPL-Pflichten beachten.

## Fertige Images

Jeder Push auf `main` baut nach bestandener Typprüfung und Unit-Tests `ghcr.io/scazadar/biberdamm` und `ghcr.io/scazadar/biberdamm-tts`, jeweils mit den Tags `latest` und `sha-<commit>`. Für den Betrieb ohne Quellcode genügt [compose.example.yaml](compose.example.yaml).

## Betrieb an der Schule

```bash
npm ci
npm run build
PORT=3000 ADDRESS_HEADER=x-forwarded-for XFF_DEPTH=1 node build
```

Der Server muss hinter einem HTTPS-Reverse-Proxy laufen (z. B. nginx oder Caddy), der den `Host`-Header und `X-Forwarded-For` weitergibt. Ohne HTTPS funktionieren weder die Anmeldung noch die PWA-Installation.

| Variable | Bedeutung | Standard |
|---|---|---|
| `BIBERDAMM_DB` | Pfad zur Datenbank | `data/biberdamm.db` |
| `PORT` | Port des Servers | `3000` |
| `ADDRESS_HEADER`, `XFF_DEPTH` | Echte Client-Adresse hinter dem Proxy, nötig für die Login-Begrenzung | – |
| `BIBERDAMM_TTS_URL` | Adresse des Piper-Dienstes; ohne Angabe nur Gerätestimmen | – |
| `BODY_SIZE_LIMIT` | Maximale Anfragegröße | `512K` |

**Sicherung:** `npm run backup -- /pfad/zum/ordner` erstellt im laufenden Betrieb eine konsistente Kopie der Datenbank. Die Sicherungen enthalten Kinderdaten und müssen entsprechend geschützt werden. Löschfristen greifen in alten Sicherungen nicht, daher sollten auch diese regelmäßig entfernt werden.

## Entwicklung

```bash
npm run dev        # Entwicklungsserver
npm run check      # Typprüfung
npm test           # Unit-Tests
npm run build && npm run test:e2e   # Browser-Tests (nutzt installiertes Microsoft Edge)
```

### Neues Spiel hinzufügen

1. Eintrag in `src/lib/games/catalog.ts` (Stufen, Aufgaben pro Runde, Kompetenz).
2. Komponente in `src/lib/games/views/` anlegen: `const ctx = useGame()` liefert Stufe, Auswahl (`ctx.choose`), Bruno (`ctx.tell`) und meldet Ergebnisse (`ctx.complete`).
3. In `src/lib/games/views.ts` registrieren und einen Löser in `e2e/app.spec.ts` ergänzen.

Inhalte wie Tiere, Rätsel und Kreisläufe liegen in `src/lib/content/`.

## Lizenz

[GNU AGPL 3.0](LICENSE). Wer eine veränderte Fassung über das Netz anbietet, muss deren Nutzern den Quellcode zugänglich machen.
