import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test';

const PICTURES = ['🐶', '🐱', '🐸', '🍎', '🌻', '⭐', '🚗', '⚽', '🌈'];
const ADMIN = { user: 'admin', pass: 'admin-passwort-1' };

test.describe.configure({ mode: 'serial' });

// E2E_GAMES=zaehlen spielt für schnelle Läufe nur die genannten Spiele.
const QUICK = process.env.E2E_GAMES?.split(',');

let code = '';
let classUrl = '';
let miaPictures: string[] = [];

async function login(page: Page, user: string, pass: string) {
  await page.goto('/login');
  await page.getByLabel('Benutzername').fill(user);
  await page.getByLabel('Passwort').fill(pass);
  await page.getByRole('button', { name: 'Anmelden' }).click();
}

async function childLogin(page: Page, name: string, pictures: string[]) {
  await page.goto(`/kind/${code}`);
  await page.getByRole('link', { name, exact: true }).click();
  await expect(page.getByRole('heading', { name: `Hallo ${name}!` })).toBeVisible();
  // Warten, bis die Seite interaktiv ist.
  await page.waitForLoadState('networkidle');
  for (const p of pictures) await page.locator(`[data-picture="${PICTURES.indexOf(p)}"]`).click();
  await expect(page).toHaveURL(/\/lernen$/);
}

const overlay = (page: Page) => page.getByRole('dialog', { name: 'Runde beendet' });

async function clickEach(page: Page, selector: string) {
  for (const b of await page.locator(selector).all()) {
    if (await overlay(page).isVisible()) return;
    await b.click({ timeout: 1000 }).catch(() => {});
  }
}

const solvers: Record<string, (page: Page) => Promise<void>> = {
  tasten: async (p) => {
    await p.keyboard.press((await p.getByTestId('target').innerText()).toUpperCase());
  },
  zaehlen: async (p) => {
    const n = await p.getByTestId('things').getAttribute('data-count');
    await p.locator('.choice', { hasText: new RegExp(`^${n}$`) }).click();
  },
  ballons: async (p) => {
    const t = await p.getByTestId('target').innerText();
    await p.locator(`.balloon[data-symbol="${t}"]:not(.pop)`).first().click({ timeout: 1000 });
  },
  anlaute: (p) => clickEach(p, '.choice'),
  punkte: async (p) => {
    const n = await p.locator('[data-dot]').count();
    for (let i = 0; i < n; i++) await p.locator(`[data-dot="${i}"]`).click({ force: true });
  },
  spuren: async (p) => {
    // Nur auf der Vorlage malen, zeilenweise entlang der Maske.
    const rows = await p.evaluate(() => {
      const c = document.querySelector<HTMLCanvasElement>('.drawing canvas')!;
      const d = c.getContext('2d')!.getImageData(0, 0, 500, 500).data;
      const out: [number, number, number][] = [];
      for (let y = 6; y < 500; y += 20) {
        let start = -1;
        for (let x = 0; x <= 500; x += 4) {
          const on = x < 500 && d[(y * 500 + x) * 4 + 3] > 128;
          if (on && start < 0) start = x;
          if (!on && start >= 0) {
            out.push([y, start, x - 4]);
            start = -1;
          }
        }
      }
      return out;
    });
    const box = (await p.getByTestId('ink').boundingBox())!;
    const k = box.width / 500;
    for (const [y, a, b] of rows) {
      await p.mouse.move(box.x + a * k, box.y + y * k);
      await p.mouse.down();
      await p.mouse.move(box.x + b * k, box.y + y * k, { steps: 3 });
      await p.mouse.up();
    }
  },
  lebensraum: (p) => clickEach(p, '.zone'),
  muell: (p) => clickEach(p, '.zone'),
  raetsel: (p) => clickEach(p, '.choice.emoji'),
  wachsen: (p) => clickEach(p, '.card-step'),
  wald: async (p) => {
    const quiz = p.getByRole('button', { name: 'Quiz starten' });
    if (await quiz.isVisible()) await quiz.click();
    await clickEach(p, '[data-thing]');
  },
  rechnen: async (p) => {
    const r = await p.getByTestId('equation').getAttribute('data-result');
    await p.keyboard.type(r!);
    await p.keyboard.press('Enter');
  },
  woerter: async (p) => {
    const w = (await p.getByTestId('word').getAttribute('data-word'))!;
    for (const ch of w) {
      await p.locator(`[data-letter="${ch}"]:not([disabled])`).first().click({ timeout: 1000 });
    }
  },
  zahlenstrahl: async (p) => {
    const line = p.getByTestId('numline');
    const [target, marker, step] = await Promise.all(['data-target', 'aria-valuenow', 'data-step'].map(async (a) => Number(await line.getAttribute(a))));
    const moves = (target - marker) / step;
    for (let i = 0; i < Math.abs(moves); i++) await p.keyboard.press(moves > 0 ? 'ArrowRight' : 'ArrowLeft');
    await p.keyboard.press('Enter');
  },
  lesen: async (p) => {
    const done = p.getByRole('button', { name: 'Fertig gelesen' });
    if (await done.isVisible()) await done.click();
    await p.locator('[data-right="true"]').first().click({ timeout: 1000 });
  },
  lautbruecke: async (p) => {
    await p.locator('[data-right="true"]').first().click({ timeout: 1000 });
  },
  silben: async (p) => {
    if (await p.getByTestId('syllables').isVisible()) {
      for (const s of (await p.getByTestId('syllables').getAttribute('data-parts'))!.split('|')) {
        await p.locator(`[data-syllable="${s}"]:not([disabled])`).first().click({ timeout: 1000 });
      }
      return;
    }
    const taps = p.getByTestId('taps');
    const [target, count] = await Promise.all(['data-target', 'data-count'].map(async (a) => Number(await taps.getAttribute(a))));
    for (let i = count; i < target; i++) await p.getByTestId('drum').click({ timeout: 1000 });
    await p.getByTestId('confirm').click({ timeout: 1000 });
  },
  zahlenhaus: async (p) => {
    const n = await p.getByTestId('house').getAttribute('data-missing');
    await p.locator('.choice', { hasText: new RegExp(`^${n}$`) }).click({ timeout: 1000 });
  },
  blitzblick: async (p) => {
    const n = await p.getByTestId('flash').getAttribute('data-count');
    await p.locator('.choice', { hasText: new RegExp(`^${n}$`) }).click({ timeout: 1000 });
  },
  zehnerfeld: async (p) => {
    const n = await p.getByTestId('bridge').getAttribute('data-answer');
    await p.locator('.choice', { hasText: new RegExp(`^${n}$`) }).click({ timeout: 1000 });
  },
  quatsch: async (p) => {
    await p.locator('[data-right="true"]').first().click({ timeout: 1000 });
  },
  reime: async (p) => {
    await p.locator('[data-right="true"]').first().click({ timeout: 1000 });
  },
  hunderterfeld: async (p) => {
    const n = await p.getByTestId('hundred').getAttribute('data-target');
    await p.locator(`[data-n="${n}"]`).click({ timeout: 1000 });
  },
  quiz: async (p) => {
    await p.locator('[data-right="true"]').first().click({ timeout: 1000 });
  }
};

const GAMES = QUICK ?? Object.keys(solvers).filter((g) => g !== 'quiz');

async function playRound(page: Page, game: string) {
  await expect(page.locator('.stage')).toBeVisible();
  const deadline = Date.now() + 90_000;
  while (!(await overlay(page).isVisible())) {
    expect(Date.now(), `${game} sollte fertig werden`).toBeLessThan(deadline);
    await solvers[game](page).catch(() => {});
    await page.waitForTimeout(150);
  }
}

async function newChildContext(browser: Browser): Promise<BrowserContext> {
  const context = await browser.newContext({ baseURL: 'http://localhost:4173', channel: 'msedge', reducedMotion: 'reduce' } as never);
  // Ohne Stimmen wartet kein Spiel auf die Sprachausgabe, die in Testläufen sporadisch hängt.
  await context.addInitScript(() => {
    speechSynthesis.getVoices = () => [];
  });
  return context;
}

test('Einrichtung, Klasse und Kinder anlegen', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/setup$/);
  await expect(page.getByRole('link', { name: /Quellcode/ })).toHaveAttribute('href', 'https://github.com/scazadar/biberdamm');
  await page.getByLabel('Name der Schule').fill('Biberschule');
  await page.getByLabel('Dein Name').fill('Frau Admin');
  await page.getByLabel('Benutzername').fill(ADMIN.user);
  await page.getByLabel(/Passwort/).fill(ADMIN.pass);
  await page.getByRole('button', { name: 'Einrichten' }).click();
  await expect(page).toHaveURL(/\/login$/);

  await login(page, ADMIN.user, ADMIN.pass);
  await page.getByLabel('Neue Klasse').fill('1a');
  await page.getByRole('button', { name: 'Anlegen' }).click();
  await expect(page.getByRole('heading', { name: 'Klasse 1a' })).toBeVisible();
  classUrl = new URL(page.url()).pathname;

  await page.getByLabel(/Kinder hinzufügen/).fill('Mia K.\nAli S.\nTom B.');
  await page.getByRole('button', { name: 'Hinzufügen' }).click();
  await expect(page.getByText('3 Kinder hinzugefügt.')).toBeVisible();

  code = await page.getByTestId('class-code').innerText();
  expect(code).toMatch(/^[A-Z2-9]{6}$/);
  const pics = await page.locator('tr[data-student="Mia K."] [data-testid="pictures"]').innerText();
  miaPictures = pics.split(' ');
  expect(miaPictures).toHaveLength(3);
});

test('Login-Karten enthalten QR-Code und Bilder', async ({ page }) => {
  await login(page, ADMIN.user, ADMIN.pass);
  await page.goto(`${classUrl}/karten`);
  await expect(page.locator('.login-card')).toHaveCount(3);
  await expect(page.locator('.login-card svg').first()).toBeVisible();
});

test('falsches Bilderpasswort wird abgewiesen, geschlossene Klasse zeigt keine Namen', async ({ page, browser }) => {
  await page.goto(`/kind/${code}`);
  await page.getByRole('link', { name: 'Tom B.', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Hallo Tom B.!' })).toBeVisible();
  await page.waitForLoadState('networkidle');
  // Reihenfolge rückwärts über die Bilder 8, 7, 6: Für ein zufälliges Passwort fast immer falsch.
  await page.locator('[data-picture="8"]').click();
  await page.locator('[data-picture="7"]').click();
  await page.locator('[data-picture="6"]').click();
  await expect(page.getByRole('alert').or(page.locator('[data-testid="stars"]'))).toBeVisible();
  if (await page.getByTestId('stars').isVisible()) test.skip(true, 'Zufallspasswort getroffen');
  await expect(page.getByRole('alert')).toContainText('nicht deine Bilder');

  const context = await browser.newContext({ baseURL: 'http://localhost:4173', channel: 'msedge' } as never);
  const teacher = await context.newPage();
  await login(teacher, ADMIN.user, ADMIN.pass);
  await teacher.goto(classUrl);
  await teacher.getByRole('button', { name: /Anmeldung schließen/ }).click();
  await expect(teacher.getByRole('button', { name: /Anmeldung öffnen/ })).toBeVisible();

  await page.goto(`/kind/${code}`);
  await expect(page.getByText('nicht offen')).toBeVisible();
  await expect(page.getByText('Mia K.')).toHaveCount(0);

  await teacher.getByRole('button', { name: /Anmeldung öffnen/ }).click();
  await expect(teacher.getByRole('button', { name: /Anmeldung schließen/ })).toBeVisible();
  await context.close();
});

test('Zahlenstrahl reagiert auf Tippen; Lese-Kachel verschwindet nach der Leserunde', async ({ browser }) => {
  const context = await newChildContext(browser);
  const page = await context.newPage();
  await childLogin(page, 'Mia K.', miaPictures);
  await expect(page.getByTestId('daily-reading')).toBeVisible();
  await expect(page.getByRole('link', { name: /Quellcode/ })).toBeVisible();

  await page.goto('/lernen/spiel/zahlenstrahl');
  const line = page.getByTestId('numline');
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('link', { name: /Quellcode/ })).toHaveCount(0);
  const box = (await line.boundingBox())!;
  await line.click({ position: { x: box.width / 2, y: 60 } });
  await expect(line).toHaveAttribute('aria-valuenow', '5');
  await line.click({ position: { x: box.width - 28, y: 60 } });
  await expect(line).toHaveAttribute('aria-valuenow', '10');

  await page.goto('/lernen/spiel/lesen');
  await playRound(page, 'lesen');
  await page.waitForLoadState('networkidle');
  await page.goto('/lernen');
  await expect(page.getByTestId('daily-reading')).toHaveCount(0);
  await context.close();
});

test('Server-Stimme liefert Audio an das Spiel', async ({ browser }) => {
  test.skip(!process.env.BIBERDAMM_TTS_URL, 'nur mit laufendem Piper-Dienst');
  const context = await newChildContext(browser);
  const page = await context.newPage();
  const problems: string[] = [];
  page.on('pageerror', (e) => problems.push(e.message));
  await childLogin(page, 'Mia K.', miaPictures);
  // Die erste Ansage startet direkt beim Laden des Spiels.
  const speech = page.waitForResponse((r) => r.url().endsWith('/api/sprache'), { timeout: 20_000 });
  await page.goto('/lernen/spiel/zaehlen');
  const response = await speech;
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toBe('audio/wav');
  expect((await response.body()).length).toBeGreaterThan(1000);
  expect(problems).toEqual([]);
  await context.close();
});

test('alle Spiele lassen sich spielen und das Ergebnis erscheint bei der Lehrkraft', async ({ browser }) => {
  test.setTimeout(900_000);
  const context = await newChildContext(browser);
  const page = await context.newPage();
  const foreign: string[] = [];
  const problems: string[] = [];
  page.on('request', (r) => {
    if (!r.url().startsWith('http://localhost:4173') && !r.url().startsWith('data:')) foreign.push(r.url());
  });
  page.on('console', (m) => {
    if (m.type() === 'error') problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(e.message));

  await childLogin(page, 'Mia K.', miaPictures);

  for (const game of GAMES) {
    await test.step(game, async () => {
      await page.goto(`/lernen/spiel/${game}`);
      await playRound(page, game);
      await expect(page.getByTestId('earned')).toContainText('gesammelt');
    });
  }

  await page.waitForLoadState('networkidle');
  await page.goto('/lernen');
  const stars = Number((await page.getByTestId('stars').innerText()).replace(/\D/g, ''));
  if (!QUICK) expect(stars).toBeGreaterThanOrEqual(70);

  await page.goto('/lernen/album');
  if (!QUICK) expect(Number(await page.getByTestId('album').getAttribute('data-unlocked'))).toBeGreaterThanOrEqual(7);

  expect(foreign, 'keine Anfragen an fremde Server').toEqual([]);
  expect(problems, 'keine Fehler in der Konsole').toEqual([]);
  await context.close();
});

test('Lehrkraft sieht Fortschritt', async ({ page }) => {
  await login(page, ADMIN.user, ADMIN.pass);
  await page.goto(`${classUrl}/fortschritt`);
  const matrix = page.getByTestId('matrix');
  await expect(matrix).toContainText('Mia K.');
  await expect(matrix).toContainText('Mengen zählen');
  const response = await page.request.get(`${classUrl}/export.csv`);
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('Mia K.');
});

test('Aufgabe und eigenes Quiz: von der Lehrkraft zum Kind und zurück', async ({ page, browser }) => {
  await login(page, ADMIN.user, ADMIN.pass);
  await page.goto('/lehrkraft/quiz');
  await page.getByLabel('Neues Quiz').fill('Die Uhr');
  await page.getByRole('button', { name: 'Anlegen' }).click();
  await expect(page.getByRole('heading', { name: 'Die Uhr' })).toBeVisible();
  await page.getByLabel('Frage', { exact: true }).fill('Wie viele Stunden hat ein Tag?');
  await page.getByLabel('Antwort 1', { exact: true }).fill('24');
  await page.getByLabel('Antwort 2', { exact: true }).fill('12');
  await page.getByRole('button', { name: 'Hinzufügen' }).click();
  await expect(page.getByText('Frage hinzugefügt.')).toBeVisible();

  await page.goto(`${classUrl}/aufgaben`);
  await page.getByLabel('Spiel').selectOption('quiz');
  await page.getByRole('button', { name: 'Aufgabe geben' }).click();
  await expect(page.getByTestId('assignment')).toContainText('Offen (3)');

  const context = await newChildContext(browser);
  const child = await context.newPage();
  await childLogin(child, 'Mia K.', miaPictures);
  await child.locator('[data-assignment]').click();
  await playRound(child, 'quiz');
  await child.waitForLoadState('networkidle');
  await child.getByRole('link', { name: /Zurück/ }).last().click();
  await expect(child.locator('[data-assignment]')).toHaveCount(0);
  await context.close();

  await page.reload();
  await expect(page.getByTestId('finished')).toContainText('Mia K.');
});

test('Verbindungsabbruch: Runde wird genau einmal nachträglich übertragen', async ({ browser }) => {
  test.setTimeout(180_000);
  const context = await newChildContext(browser);
  const page = await context.newPage();
  await childLogin(page, 'Mia K.', miaPictures);
  await page.goto('/lernen');
  const before = Number((await page.getByTestId('stars').innerText()).replace(/\D/g, ''));

  await page.goto('/lernen/spiel/raetsel');
  await expect(page.locator('.stage')).toBeVisible();
  await page.waitForLoadState('networkidle');
  await context.setOffline(true);
  await playRound(page, 'raetsel');
  await expect(page.getByTestId('earned')).toBeVisible();
  const queued = await page.evaluate(() => JSON.parse(localStorage.getItem('biberdamm.ergebnisse') ?? '[]').length);
  expect(queued).toBe(1);

  await context.setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('biberdamm.ergebnisse') ?? '[]').length)).toBe(0);

  await page.goto('/lernen');
  const after = Number((await page.getByTestId('stars').innerText()).replace(/\D/g, ''));
  expect(after - before).toBe(6);
  await context.close();
});

test('fremde Lehrkraft kommt nicht an die Klasse; Startpasswort muss geändert werden', async ({ page, browser }) => {
  await login(page, ADMIN.user, ADMIN.pass);
  await page.goto('/admin');
  await page.getByLabel('Name', { exact: true }).fill('Herr Fremd');
  await page.getByLabel('Benutzername').fill('fremd');
  await page.getByRole('button', { name: 'Anlegen' }).click();
  const temp = await page.getByTestId('temp-password').innerText();

  const context = await browser.newContext({ baseURL: 'http://localhost:4173', channel: 'msedge' } as never);
  const other = await context.newPage();
  await login(other, 'fremd', temp);
  await expect(other).toHaveURL(/\/lehrkraft\/passwort$/);
  await other.getByLabel('Aktuelles Passwort').fill(temp);
  await other.getByLabel(/Neues Passwort/).fill('mein-neues-passwort');
  await other.getByRole('button', { name: 'Speichern' }).click();
  await expect(other).toHaveURL(/\/lehrkraft$/);
  await expect(other.getByText('Noch keine Klassen')).toBeVisible();

  for (const path of [classUrl, `${classUrl}/fortschritt`, `${classUrl}/export.csv`, `${classUrl}/karten`]) {
    expect((await other.request.get(path)).status(), path).toBe(404);
  }
  const post = await other.request.post(`${classUrl}?/remove`, {
    form: { studentId: '1' },
    headers: { origin: 'http://localhost:4173' }
  });
  expect(post.status()).toBe(404);
  expect((await other.request.get('/admin', { maxRedirects: 0 })).status()).toBe(303);
  await context.close();
  await page.goto(classUrl);
  await expect(page.locator('tr[data-student]')).toHaveCount(3);
});

test('neue Spiele laufen auch auf den Stufen 2 und 3', async ({ page, browser }) => {
  test.setTimeout(600_000);
  await login(page, ADMIN.user, ADMIN.pass);
  await page.goto(`${classUrl}/aufgaben`);
  const tasks = ['lautbruecke', 'silben', 'zahlenhaus', 'blitzblick', 'zehnerfeld', 'quatsch', 'reime', 'hunderterfeld'].flatMap((game) => [2, 3].map((level) => ({ game, level })));
  for (const { game, level } of tasks) {
    const before = await page.getByTestId('assignment').count();
    await page.getByLabel('Spiel').selectOption(game);
    await page.getByLabel('Stufe').selectOption({ index: level - 1 });
    await page.getByRole('button', { name: 'Aufgabe geben' }).click();
    await expect(page.getByTestId('assignment')).toHaveCount(before + 1);
  }

  const context = await newChildContext(browser);
  const child = await context.newPage();
  const problems: string[] = [];
  child.on('pageerror', (e) => problems.push(e.message));
  await childLogin(child, 'Mia K.', miaPictures);
  for (const { game, level } of tasks) {
    await test.step(`${game} Stufe ${level}`, async () => {
      await child.goto('/lernen');
      await child.locator(`a[href^="/lernen/spiel/${game}?"]`).first().click();
      await playRound(child, game);
      await child.waitForLoadState('networkidle');
    });
  }
  expect(problems).toEqual([]);
  await context.close();
});

test('freies Spielen: ohne Anmeldung direkt zu den Spielen, nichts wird gespeichert', async ({ page, browser }) => {
  const setFreePlay = async (on: boolean) => {
    await page.goto('/admin/schule');
    await page.getByLabel('Freies Spielen ohne Anmeldung').setChecked(on);
    await page.getByRole('button', { name: 'Speichern' }).click();
    await expect(page.getByText('Gespeichert.')).toBeVisible();
  };
  await login(page, ADMIN.user, ADMIN.pass);
  await setFreePlay(true);

  const context = await newChildContext(browser);
  const guest = await context.newPage();
  const results: string[] = [];
  guest.on('request', (r) => {
    if (r.url().includes('/api/ergebnisse')) results.push(r.url());
  });
  await guest.goto('/');
  await expect(guest).toHaveURL(/\/lernen$/);
  await expect(guest.getByTestId('staff-login')).toBeVisible();
  await expect(guest.getByText('Mein Album')).toHaveCount(0);
  await guest.goto('/kind');
  await expect(guest).toHaveURL(/\/lernen$/);

  await guest.goto('/lernen/spiel/zaehlen?stufe=2');
  await expect(guest.getByRole('link', { name: '2', exact: true })).toHaveAttribute('aria-current', 'page');
  await playRound(guest, 'zaehlen');
  await guest.waitForLoadState('networkidle');
  expect(results).toEqual([]);
  expect(await guest.evaluate(() => localStorage.getItem('biberdamm.ergebnisse'))).toBeNull();
  await guest.goto('/lernen/album');
  await expect(guest).toHaveURL(/\/lernen$/);

  // Lehrkraft-Bereich bleibt geschützt.
  await guest.goto('/lehrkraft');
  await expect(guest).toHaveURL(/\/login$/);

  await setFreePlay(false);
  await guest.goto('/lernen');
  await expect(guest).toHaveURL(/\/kind$/);
  await context.close();
});

test('Löschen eines Kindes entfernt es aus der Klasse', async ({ page }) => {
  await login(page, ADMIN.user, ADMIN.pass);
  await page.goto(classUrl);
  page.on('dialog', (d) => d.accept());
  await page.locator('tr[data-student="Tom B."]').getByRole('button', { name: 'Löschen' }).click();
  await expect(page.getByText('alle Lerndaten wurden gelöscht')).toBeVisible();
  await expect(page.locator('tr[data-student="Tom B."]')).toHaveCount(0);
});
