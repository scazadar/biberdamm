# Biberdamm – Spezifikation

| | |
|---|---|
| **Produkt** | Biberdamm: Lernplattform für Vorschule und Klasse 1–2, begleitet von Biber Bruno |
| **Herkunft** | Weiterentwicklung der Ideen und Inhalte aus `lernspiele` (Angular-PWA) |
| **Version** | 1.0 · Stand 08.11.2026 |
| **Sprache** | Deutsch |

## 1. Ausgangslage und Ziel

`lernspiele` enthält elf gute Spiele mit Sprachausgabe, Touch- und Tastaturbedienung und erklärenden Rückmeldungen. Für die Schule fehlt aber alles außerhalb des Spiels: Es gibt keine Konten und keine Klassen, Fortschritt besteht nur aus einem Sternezähler im Browser, und Lehrkräfte können weder Aufgaben geben noch sehen, wer wo Hilfe braucht.

**Ziel:** Eine Schule installiert Biberdamm auf einem eigenen Server. Lehrkräfte legen in wenigen Minuten eine Klasse an, Kinder melden sich ohne Lesen und ohne E-Mail an, und die Lehrkraft sieht je Kind und Kompetenz, wo es steht.

### Übernommene Ideen

| Idee aus `lernspiele` | Umsetzung in Biberdamm |
|---|---|
| Zwei Spielwelten | Bleiben erhalten, dazu Welt „Lesen & Rechnen“ für Klasse 1–2 |
| Motorik (Maus, Tastatur, Touch) als Lernziel | Je Spiel ausgewiesen, im Spielekatalog für Lehrkräfte sichtbar |
| Biber Bruno erklärt das *Warum* | Durchgängige Figur, Sprechblase immer auch als Text |
| Sprachausgabe, synthetische Töne | Keine Audiodateien, keine externen Dienste |
| Immer ein alternativer Eingabeweg | Verbindliche Regel (Abschnitt 8) |
| Inhalte als Daten | Inhalte getrennt vom Code, Lehrkräfte erstellen eigene Quizze |
| Sterne | Sterne plus Stickeralbum, ohne Vergleich zwischen Kindern |

## 2. Rollen

| Rolle | Darf |
|---|---|
| **Kind** | Eigene Aufgaben und Spiele der eigenen Klasse, eigenes Album |
| **Lehrkraft** | Eigene Klassen: Kinder, Aufgaben, Fortschritt, Einstellungen, eigene Quizze |
| **Schuladmin** | Wie Lehrkraft für alle Klassen, zusätzlich Lehrkräfte, Schuleinstellungen, Protokoll |

Eine Installation bedient genau eine Schule. Das hält Betrieb und Datenschutz einfach und vermeidet Mandantentrennung im Code.

## 3. Funktionale Anforderungen

### 3.1 Einrichtung und Anmeldung

- **F-01** Beim ersten Start führt `/setup` durch das Anlegen von Schule und Admin. Danach ist `/setup` gesperrt.
- **F-02** Lehrkräfte melden sich mit Benutzername und Passwort an (mindestens 10 Zeichen). Vom Admin vergebene Startpasswörter müssen beim ersten Login geändert werden.
- **F-03** Kinder melden sich in drei Schritten an: Klassencode eingeben (6 Zeichen, entfällt per QR-Code der Login-Karte), Namenskachel antippen, drei Bilder in der richtigen Reihenfolge antippen.
- **F-04** Die Lehrkraft kann die Kinder-Anmeldung je Klasse öffnen und schließen. Bei geschlossener Klasse wird keine Namensliste ausgegeben.
- **F-05** Nach 5 Fehlversuchen ist das Kind 10 Minuten gesperrt. Die Lehrkraft kann die Sperre aufheben und ein neues Bilderpasswort erzeugen.
- **F-06** Sitzungen enden automatisch: Kinder nach 4 Stunden, Lehrkräfte nach 12 Stunden. Lehrkraft-Logins sind pro Benutzername und Adresse begrenzt.

### 3.2 Klassen und Kinder

- **F-10** Lehrkraft legt Klassen an, jede Klasse erhält einen eindeutigen Code ohne verwechselbare Zeichen.
- **F-11** Kinder werden als Liste eingefügt, ein Name pro Zeile. Die App empfiehlt Vorname plus Initial oder ein Pseudonym und erfragt keine weiteren Daten.
- **F-12** Login-Karten sind druckbar (A4, je Kind: Name, Klassencode, QR-Code, Bilderpasswort).
- **F-13** Kind umbenennen und löschen; Löschen entfernt alle Lerndaten sofort und endgültig.
- **F-14** Klasseneinstellungen: Spiele ein- und ausschalten, Sprachausgabe, Ruhemodus (Abschnitt 8).
- **F-15** Klassen können archiviert werden: Anmeldung gesperrt, Daten nur noch lesbar, Löschung jederzeit möglich.
- **F-16** Admin kann weitere Lehrkräfte einer Klasse zuordnen.

### 3.3 Lernen

- **F-20** Die Startseite des Kindes zeigt offene Aufgaben zuerst, danach die Welten. Bedienbar ohne Lesen: Symbole und Vorlesen.
- **F-21** Eine Spielrunde besteht aus 3–10 Aufgaben. Es gibt keine Zeitlimits.
- **F-22** Falsche Antworten werden erklärt und dürfen wiederholt werden. Es gibt keine Punktabzüge.
- **F-23** Jedes Spiel hat Stufen 1–3. Ohne Aufgabe schlägt das System die Stufe vor (5.2); mit Aufgabe gilt die Stufe der Lehrkraft.
- **F-24** Aufgaben werden so gewählt, dass unsichere Inhalte häufiger vorkommen (5.3).
- **F-25** Pro richtig gelöster Aufgabe gibt es einen Stern, alle 10 Sterne einen neuen Sticker im Album.
- **F-26** Kinder sehen nie Ranglisten oder Daten anderer Kinder, außer der Namenskachel beim Anmelden.
- **F-27** Inhalte werden über die Zeit verteilt wiederholt (5.3).
- **F-28** Solange ein Kind heute noch keine `lesen`-Runde gespielt hat, zeigt die Startseite die Kachel „Heute schon gelesen?“. Sie ist ein Angebot ohne Serien, Erinnerungsdruck oder Verlustmechanik.
- **F-29** Jede Seite verlinkt den Quellcode (AGPL 3.0, §13). Ausgenommen sind die laufende Spielrunde, damit Kinder nicht versehentlich hinausgelangen, und der Ausdruck.

### 3.4 Aufgaben (Lehrkraft)

- **F-30** Aufgabe = Spiel + Stufe + Anzahl Runden + optionales Fälligkeitsdatum, gilt für die Klasse.
- **F-31** Die Lehrkraft sieht je Aufgabe, welche Kinder fertig sind.
- **F-32** Eigene Quizze: Frage, Symbol, 2–4 Antworten, Erklärung. Quizze sind nur über Aufgaben spielbar.

### 3.5 Fortschritt

- **F-40** Klassenmatrix Kinder × Kompetenzen mit Ampelstatus. Der Status ist zusätzlich als Text oder Symbol codiert, nie nur als Farbe.
- **F-41** Hinweisliste „Braucht Unterstützung“ pro Klasse.
- **F-42** Kindansicht: Kompetenzen, zuletzt gespielte Runden, häufigste Fehler auf Inhaltsebene (z. B. „verwechselt b/d“ erkennbar an Einzelwerten).
- **F-43** CSV-Export je Klasse. Der Status ist Beobachtungshilfe und ausdrücklich keine Benotung.

### 3.6 Administration

- **F-50** Lehrkräfte anlegen, deaktivieren, Passwort zurücksetzen.
- **F-51** Schuleinstellungen: Name, Aufbewahrungsfrist für Lerndaten (Standard 365 Tage).
- **F-52** Protokoll sicherheitsrelevanter Aktionen (Logins, Löschungen, Exporte, Rollenänderungen).
- **F-53** Auskunft: vollständiger Datenexport eines Kindes als JSON.

## 4. Spielekatalog

Motorik: T = Tastatur, K = Klick/Tippen, Z = Ziehen, M = Malen.

| ID | Spiel | Kompetenz | Motorik | Stufe 1 / 2 / 3 |
|---|---|---|---|---|
| `tasten` | Buchstaben-Tasten | Buchstaben erkennen | T K | Großbuchstaben / Kleinbuchstaben / gemischt ohne Bildhilfe |
| `zaehlen` | Zählen | Mengen erfassen | K T | bis 5 / bis 10 / bis 15 |
| `ballons` | Luftballons | Zeichen wiedererkennen | K | Ziffern / Großbuchstaben / Kleinbuchstaben |
| `anlaute` | Anfangsbuchstaben | Anlaute | Z K T | 2 / 3 / 4 Auswahlbuchstaben |
| `punkte` | Punkte verbinden | Zahlenreihe | K | kurze Formen / alle Formen / in Zweierschritten |
| `spuren` | Nachspuren | Schreibmotorik | M | Ziffern / Großbuchstaben / Kleinbuchstaben |
| `lebensraum` | Wo wohnt das Tier? | Lebensräume | Z K T | 3 / 4 / 5 Lebensräume |
| `muell` | Müll trennen | Abfall und Recycling | Z K T | 3 / 4 / 5 Tonnen |
| `raetsel` | Wer bin ich? | Tierwissen | K T | 2 / 3 / 4 Antworten |
| `wachsen` | Wie wächst das? | Kreisläufe | Z K | 3 Bilder / bis 4 Bilder / alle, ohne Beschriftung |
| `wald` | Waldentdecker | Lebensraum Wald | K | 3 / 5 / 8 Fragen |
| `rechnen` *(neu)* | Rechenbiber | Addition, Subtraktion | K T | + bis 10 mit Bildern / ± bis 10 / ± bis 20 |
| `woerter` *(neu)* | Wörter bauen | Rechtschreibung | K T | kurze Wörter / alle Wörter / mit Extrabuchstaben |
| `zahlenstrahl` *(neu)* | Zahlenstrahl | Größenvorstellung von Zahlen | Z K T | bis 10 / bis 20 / bis 100 in Fünferschritten |
| `lesen` *(neu)* | Lesezeit | Texte lesen und verstehen | K | 1–2 Sätze / 3 Sätze / kurze Geschichten (je 3 Texte) |
| `lautbruecke` *(neu)* | Lautbrücke | Laute zu Wörtern verbinden | K T | 2–3 Laute, 2 Bilder / 3–4 Laute, 3 Bilder / 4–5 Laute, 4 Bilder |
| `silben` *(neu)* | Silbenklatschen | Silben erkennen | K T | 1–2 Silben zählen / 2–3 Silben zählen / Wort aus Silben zusammensetzen |
| `zahlenhaus` *(neu)* | Zahlenhaus | Zahlzerlegung | K T | Zahlen bis 5 / bis 10 / bis 20 |
| `blitzblick` *(neu)* | Blitzblick | Mengen auf einen Blick erfassen | K T | bis 5 Punkte, geordnet / bis 10 im Zehnerfeld / bis 20 in zwei Zehnerfeldern |
| `quiz` *(neu)* | Eigenes Quiz | von der Lehrkraft | K T | keine Stufen |

**`zahlenstrahl`:** Das Kind bringt Bruno an die genannte Zahl. Nur Eckpunkte sind beschriftet, damit die Lage geschätzt und nicht abgelesen wird. Rückmeldung bei Fehlern: genannte Position und Richtung („Das ist die 6. Die 7 liegt weiter rechts.“).

**`lesen`:** Das Kind liest den Text selbst laut und beantwortet danach eine Frage; der Text bleibt sichtbar. Der Text wird nicht als Ganzes vorgelesen. Abweichend von B-02 gilt: Einzelne Wörter lassen sich antippen und anhören, das zählt als Tipp. Ob wirklich laut gelesen wurde, kann die App nicht prüfen; Lautlese-Tandems bleiben Sache des Unterrichts.

**`lautbruecke`:** Bruno spricht ein Wort gedehnt in einzelnen Lauten vor, das Kind tippt das passende Bild an. Das Vorsprechen lässt sich beliebig oft wiederholen. Wörter stehen in einer geprüften Liste mit Lautfolge und nutzen lautgetreue Wörter; ein Laut ist nicht dasselbe wie ein Buchstabenname („mmm“, nicht „em“). Die Liste enthält nur dehnbare Laute, keine Verschlusslaute wie T oder K. Die Stimme erhält die Laute in gedehnter Schreibweise („Mmm.“). *Offen:* Diese Aussprache ist nach Dauer geprüft, aber noch nicht abgehört. Klingt sie unsauber, ersetzen vorab erzeugte oder eingesprochene Audiodateien die Schreibweise.

**`silben`:** Das Kind hört ein Wort, tippt je Silbe einmal auf die Trommel und bestätigt. Auf Stufe 3 setzt es Wortkarten aus Silben richtig zusammen. Die Silbentrennung steht geprüft in der Wortliste und wird nicht automatisch berechnet. Rückmeldung bei Fehlern: Das Wort wird silbenweise vorgesprochen.

**`zahlenhaus`:** In jedem Stockwerk steht eine Zerlegung der Dachzahl, das Kind ergänzt die fehlende Zahl (7 = 3 + ?). Bildpunkte in zwei Farben zeigen die Zerlegung als Hilfe. Rückmeldung bei Fehlern: Die Punkte werden gezeigt und die Summe genannt („3 und 5 sind 8. Wir brauchen 7.“).

**`blitzblick`:** Eine Menge erscheint kurz, das Kind wählt danach die Anzahl aus. Die Anzeigedauer beträgt je nach Stufe 2 / 1,5 / 1 Sekunde und lässt sich in den Klasseneinstellungen nicht verkürzen. B-06 bleibt gewahrt: Für die Antwort gibt es kein Zeitlimit, und „Noch mal zeigen“ ist jederzeit möglich, zählt aber als Tipp. Die Menge erscheint und verschwindet ohne Animation. Rückmeldung bei Fehlern: Die Menge bleibt stehen und wird in Gruppen gezeigt („Hier sind 5 und noch 2, das sind 7.“).

## 5. Lernmodell

Das Modell ist bewusst einfach, damit Lehrkräfte es erklären können.

### 5.1 Beherrschung

Jeder Versuch erhält einen Wert:

| Ergebnis | Wert |
|---|---|
| Beim ersten Versuch richtig, ohne Tipp | 1,0 |
| Beim ersten Versuch richtig, mit Tipp | 0,7 |
| Beim zweiten Versuch richtig | 0,4 |
| Später richtig | 0,0 |

Die **Beherrschung** ist der Mittelwert der letzten 15 Versuche einer Kompetenz.

| Status | Bedingung |
|---|---|
| Noch offen | weniger als 5 Versuche |
| Braucht Unterstützung | unter 0,5 |
| Übt noch | 0,5 bis unter 0,8 |
| Sicher | ab 0,8 |

### 5.2 Stufenvorschlag

Betrachtet werden die letzten zwei abgeschlossenen Runden im selben Spiel. Sind beide ≥ 0,85, steigt die Stufe um eins. Ist die letzte < 0,5, sinkt sie um eins. Sonst bleibt sie. Neue Kinder beginnen auf Stufe 1.

### 5.3 Aufgabenauswahl

Gewicht je Inhalt: ungesehen 2; gesehen `1 + 3 × (1 − Mittelwert der letzten 5 Werte)`. Die Auswahl erfolgt gewichtet zufällig ohne direkte Wiederholung.

Das Gewicht gesehener Inhalte wird mit einem **Zeitfaktor** für verteiltes Üben multipliziert: `Tage seit dem letzten Üben ÷ Wiederholungsabstand`, begrenzt auf 0,25 bis 2.

| Mittelwert der letzten 5 Werte | Wiederholungsabstand |
|---|---|
| unter 0,5 | keiner, Faktor immer 1 |
| 0,5 bis unter 0,8 | 2 Tage |
| ab 0,8 | 7 Tage |

### 5.4 Fachliche Grundlage

| Entscheidung | Beleg | Stand der Belege |
|---|---|---|
| Laut-Buchstaben-Zuordnung, Wörter erlesen und schreiben (`anlaute`, `woerter`) | WWC/IES *Foundational Skills K–3* (2016/2019) | stark; Effektgröße umstritten (d ≈ 0,12–0,44) |
| Laute und Silben heraushören und verbinden (`lautbruecke`, `silben`) | WWC/IES *Foundational Skills K–3* (2016/2019) | stark für das Bewusstsein für Sprachlaute; die konkreten Spiele sind nicht eigens untersucht |
| Zahlzerlegung und Mengen auf einen Blick erfassen (`zahlenhaus`, `blitzblick`) | Fachdidaktische Praxis; hier noch nicht mit Quellen belegt | offen, vor Veröffentlichung nachzutragen |
| Tägliches Lesen zusammenhängender Texte (`lesen`, F-28) | ebenda; Forschung zu Lautleseverfahren | mittel |
| Zahlenstrahl und lineare Zahlenspiele (`zahlenstrahl`, `punkte`) | WWC/IES *Assisting Students Struggling with Mathematics* (2021); Metaanalyse zu Zahlenbrettspielen (18 Studien); Siegler | gut, kurzfristige Effekte |
| Bildliche Darstellungen (`rechnen`, Stufe 1) | WWC/IES 2021; Carbonneau u. a. 2013 | klein bis mittel |
| Verteiltes Üben und Abrufen mit Rückmeldung (5.3) | Dunlosky u. a. 2013 | hoch, Übertragung auf das Grundschulrechnen nicht eigens belegt |
| Apps nur als Ergänzung zur Lehrkraft | Kim u. a. 2021 (+0,31 SD); Outhwaite u. a. 2023 | Vorschule und abgegrenzte Fertigkeiten am stärksten |

Die Abstände und Faktoren in 5.3 sind Designentscheidungen und nicht aus Studien abgeleitet. Zeitübungen werden trotz WWC 2021 nicht umgesetzt: Die Leitlinie betrifft gezielte Förderung, und B-06 schließt Zeitlimits aus.

### 5.5 Sprachausgabe

Ist `BIBERDAMM_TTS_URL` gesetzt, spricht eine neuronale Stimme (Piper) aus einem Dienst im eigenen Netz. `/api/sprache` steht nur angemeldeten Kindern offen, nimmt bis zu 300 Zeichen an und speichert jeden Satz 30 Tage zwischen. Fällt der Dienst aus, spricht für 60 Sekunden die beste lokale Gerätestimme. Texte verlassen die Schulinstallation nicht.

## 6. Datenschutz

Die App ist auf Kinderdaten im Schulbetrieb ausgelegt. Die rechtliche Prüfung (Auftragsverarbeitung, Verzeichnis, Einwilligungen) bleibt Aufgabe der Schule und kann durch die Software nicht ersetzt werden.

- **D-01** Datensparsamkeit: Von Kindern werden nur Anzeigename, Klasse, Bilderpasswort und Lerndaten gespeichert. Kein Geburtsdatum, keine E-Mail.
- **D-02** Selbst gehostet: Keine Tracker, keine CDNs, keine externen Schriften, kein Aufruf fremder Server.
- **D-03** Löschfristen: Lerndaten älter als die Aufbewahrungsfrist werden täglich automatisch gelöscht.
- **D-04** Löschung und Auskunft sind direkt in der App möglich (F-13, F-53).
- **D-05** Sprachausgabe erfolgt nur über den eigenen Piper-Dienst (5.5) oder die Web Speech API. Hinweis: Einige Browser reichen „Online“-Stimmen an ihren Hersteller weiter. Deshalb verwendet Biberdamm im Browser nur lokal installierte Stimmen (`localService`), auch wenn diese schlechter klingen.
- **D-06** Geteilte Geräte: Der Service Worker speichert keine personenbezogenen Seiten. Lokal liegen nur noch nicht übertragene Spielergebnisse.

## 7. Sicherheit

- **S-01** Passwörter mit scrypt und individuellem Salt.
- **S-02** Sitzungstoken: 256 Bit zufällig, in der Datenbank nur als SHA-256-Hash; Cookie `HttpOnly`, `SameSite=Lax`, `Secure` im Regelbetrieb.
- **S-03** Bilderpasswörter sind absichtlich im Klartext gespeichert, denn Login-Karten müssen nachgedruckt werden können und ein Hash über 504 Kombinationen böte keinen Schutz. Die Sicherheit beruht auf Klassencode, öffnen/schließen der Klasse (F-04), Sperre (F-05) und kurzer Laufzeit (F-06). Das Bilderpasswort schützt Spielstände, keine sensiblen Inhalte.
- **S-04** Jede Datenabfrage für Lehrkräfte prüft serverseitig die Klassenzugehörigkeit.
- **S-05** Ergebnisse werden serverseitig validiert (bekannte Spiel-ID, Größenlimits, Plausibilität) und sind idempotent über eine vom Client erzeugte Runden-ID.
- **S-06** HTTP-Sicherheitsheader inklusive CSP ohne externe Quellen.
- **S-07** Betrieb nur über HTTPS. Für lokale Tests lässt sich `Secure` per Umgebungsvariable abschalten.

## 8. Barrierefreiheit und Pädagogik

- **B-01** Jede Eingabe hat einen alternativen Weg: Ziehen ist immer auch als Antippen und per Taste möglich. Ausnahme ist `spuren`, dessen Lernziel die Malbewegung selbst ist; es lässt sich pro Klasse abschalten.
- **B-02** Alles Vorgelesene steht auch als Text, und alles Geschriebene lässt sich vorlesen.
- **B-03** Tippziele mindestens 44 × 44 CSS-Pixel, Kontrast nach WCAG 2.1 AA.
- **B-04** Ruhemodus (Klassen-Einstellung, automatisch bei `prefers-reduced-motion`): keine Animationen, Luftballons stehen still.
- **B-05** Lehrkraft-Bereich: vollständig per Tastatur bedienbar, semantisches HTML.
- **B-06** Keine Zeitlimits, keine Verlustmechanik, kein Glücksspielelement, keine Werbung.

## 9. Nicht-funktionale Anforderungen

- **N-01** Geräte: aktuelle Chrome-, Edge-, Safari- und Firefox-Versionen; Tablet, Whiteboard, Laptop, Handy.
- **N-02** Eine Schule mit 500 Kindern läuft auf einem kleinen Server (2 Kerne, 2 GB RAM).
- **N-03** Verbindungsabbrüche im Spiel verlieren keine Ergebnisse. Runden werden lokal vorgehalten, einem Kind zugeordnet, nur in dessen Sitzung übertragen und nach 7 Tagen verworfen.
- **N-04** Installierbar als PWA. Eine Offline-Anmeldung gibt es bewusst nicht.
- **N-05** Betrieb: `node build`, eine SQLite-Datei; Sicherung durch Kopie mittels Backup-Skript.

## 10. Technische Entscheidungen

| Entscheidung | Wahl | Begründung |
|---|---|---|
| Framework | **SvelteKit + Svelte 5, TypeScript** | Server und Oberfläche in einem Projekt; kleine Bundles für ältere Schul-Tablets; Formular-Actions funktionieren für den Verwaltungsbereich ohne eigene API; Runes passen zum Signal-Stil des Altprojekts |
| Datenbank | **SQLite** über `node:sqlite` | Keine Datenbankserver-Administration an Schulen, keine nativen Abhängigkeiten, einfache Sicherung |
| Hosting | `adapter-node` | Läuft auf jedem Schulserver mit Node.js, ohne Cloud-Pflicht |
| Styling | Eigenes CSS mit Variablen | Kein Framework nötig, keine externen Quellen |
| Tests | Vitest (Logik, Datenzugriff), Playwright (Abläufe) | |

### Architektur

```
src/lib/content/    Lerninhalte (reine Daten)
src/lib/games/      Spielkatalog, Auswahl, Spielkomponenten
src/lib/client/     Sprache, Töne, Ergebnis-Warteschlange
src/lib/server/     Datenbank, Sitzungen, Autorisierung, Fachlogik
src/routes/kind     Anmeldung Kinder
src/routes/lernen   Kinderbereich
src/routes/lehrkraft, /admin, /api
```

**Spielvertrag:** Jedes Spiel ist eine Komponente, die eine `GameContext`-Instanz erhält (Stufe, Rundenzahl, gewichtete Auswahl, Bruno, Töne) und pro Aufgabe `ctx.record({ item, wrongTries, hints })` aufruft. Rahmen, Fortschritt, Sterne und Speicherung liegen im `GameShell`, sodass neue Spiele nichts davon kennen müssen.

### Datenmodell

`school`, `users`, `sessions`, `classes`, `class_teachers`, `students`, `assignments`, `game_rounds`, `attempts`, `quizzes`, `quiz_questions`, `audit_log`. Sterne und Sticker werden aus `game_rounds` berechnet und nicht separat gespeichert.

## 11. Abgrenzung (nicht Teil von Version 1)

- Anbindung an Schul-Logins (SSO, IServ, Moodle/LTI)
- Mehrere Schulen pro Installation
- Mehrsprachigkeit
- Eltern-Zugang
- Vollwertige Offline-Nutzung ohne vorherige Anmeldung
- Abgleich mit konkreten Lehrplänen einzelner Bundesländer

## 12. Bekannte Einschränkungen

- Emojis dienen als Grafik und sehen je Betriebssystem anders aus. Auf Windows 10 fehlen einzelne neuere Zeichen (z. B. 🦭, 🫙); dort sollten eigene Grafiken folgen.
- Die Qualität der Sprachausgabe hängt von den auf dem Gerät installierten deutschen Stimmen ab.
- Die Lerninhalte stammen aus dem Altprojekt und sollten vor dem Einsatz fachlich von einer Lehrkraft geprüft werden. Regeln zur Mülltrennung unterscheiden sich außerdem regional.

## 13. Abnahmekriterien

1. Eine frische Installation ist in unter 5 Minuten eingerichtet, inklusive erster Klasse mit Kindern.
2. Ein Kind meldet sich ohne Tastatureingabe an (QR-Link), spielt eine Runde, und das Ergebnis erscheint bei der Lehrkraft.
3. Eine Lehrkraft kann Klassen fremder Lehrkräfte weder lesen noch ändern (automatisiert getestet).
4. Unterbrochene Verbindung: Eine beendete Runde wird nachträglich genau einmal übertragen und nie einem anderen Kind zugerechnet.
5. Löschen eines Kindes entfernt alle zugehörigen Datensätze.
6. Das Ablaufprotokoll im Browser zeigt keine Anfragen an fremde Server.
7. Alle Spiele des Katalogs (Abschnitt 4), die nicht als *geplant* markiert sind, lassen sich starten und beenden.
