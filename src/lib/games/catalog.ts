export type WorldId = 'zeichen' | 'natur' | 'schule';

export interface World {
  id: WorldId;
  title: string;
  icon: string;
}

export const WORLDS: World[] = [
  { id: 'zeichen', title: 'Zahlen & Buchstaben', icon: '🔤' },
  { id: 'natur', title: 'Natur & Tiere', icon: '🌳' },
  { id: 'schule', title: 'Lesen & Rechnen', icon: '🎒' }
];

export const SKILLS: Record<string, string> = {
  'letters.recognize': 'Buchstaben erkennen',
  'letters.sounds': 'Anlaute',
  'letters.write': 'Buchstaben schreiben',
  'numbers.recognize': 'Ziffern erkennen',
  'numbers.count': 'Mengen zählen',
  'numbers.order': 'Zahlenreihe',
  'numbers.write': 'Ziffern schreiben',
  'numbers.line': 'Zahlenstrahl',
  'numbers.compose': 'Zahlzerlegung',
  'numbers.subitize': 'Mengen auf einen Blick',
  'math.add': 'Addition',
  'math.sub': 'Subtraktion',
  'words.spell': 'Wörter schreiben',
  'reading.texts': 'Texte lesen und verstehen',
  'reading.blend': 'Laute verbinden',
  'reading.syllables': 'Silben',
  'nature.habitats': 'Lebensräume',
  'nature.recycling': 'Müll & Recycling',
  'nature.animals': 'Tierwissen',
  'nature.cycles': 'Kreisläufe',
  'nature.forest': 'Wald',
  'custom.quiz': 'Eigene Quizze'
};

export interface GameDef {
  id: string;
  world: WorldId | null;
  title: string;
  icon: string;
  motor: string;
  /** Beschreibung je Stufe; die Länge bestimmt die Anzahl der Stufen. */
  levels: string[];
  /** Aufgaben pro Runde je Stufe (Index = Stufe − 1). */
  tasks: number[];
  skill: (level: number, item: string) => string;
}

const fixed = (s: string) => () => s;

export const GAMES: GameDef[] = [
  { id: 'tasten', world: 'zeichen', title: 'Buchstaben-Tasten', icon: '⌨️', motor: 'Tastatur, Tippen', levels: ['Großbuchstaben', 'Kleinbuchstaben', 'Gemischt ohne Bildhilfe'], tasks: [8, 8, 10], skill: fixed('letters.recognize') },
  { id: 'zaehlen', world: 'zeichen', title: 'Zählen', icon: '🍎', motor: 'Tippen, Zifferntasten', levels: ['Bis 5', 'Bis 10', 'Bis 15'], tasks: [8, 8, 8], skill: fixed('numbers.count') },
  { id: 'ballons', world: 'zeichen', title: 'Luftballons', icon: '🎈', motor: 'Bewegte Ziele treffen', levels: ['Ziffern', 'Großbuchstaben', 'Kleinbuchstaben'], tasks: [8, 8, 8], skill: (l) => (l === 1 ? 'numbers.recognize' : 'letters.recognize') },
  { id: 'anlaute', world: 'zeichen', title: 'Anfangsbuchstaben', icon: '🐒', motor: 'Ziehen, Tippen, Tastatur', levels: ['2 Buchstaben zur Wahl', '3 Buchstaben zur Wahl', '4 Buchstaben zur Wahl'], tasks: [8, 8, 8], skill: fixed('letters.sounds') },
  { id: 'punkte', world: 'zeichen', title: 'Punkte verbinden', icon: '✏️', motor: 'Kleine Ziele treffen', levels: ['Kurze Formen', 'Alle Formen', 'In Zweierschritten'], tasks: [3, 3, 3], skill: fixed('numbers.order') },
  { id: 'spuren', world: 'zeichen', title: 'Nachspuren', icon: '🖍️', motor: 'Malen', levels: ['Ziffern', 'Großbuchstaben', 'Kleinbuchstaben'], tasks: [5, 5, 5], skill: (l) => (l === 1 ? 'numbers.write' : 'letters.write') },
  { id: 'lebensraum', world: 'natur', title: 'Wo wohnt das Tier?', icon: '🐾', motor: 'Ziehen, Tippen, Tastatur', levels: ['3 Lebensräume', '4 Lebensräume', '5 Lebensräume'], tasks: [8, 8, 8], skill: fixed('nature.habitats') },
  { id: 'muell', world: 'natur', title: 'Müll trennen', icon: '♻️', motor: 'Ziehen, Tippen, Tastatur', levels: ['3 Tonnen', '4 Tonnen', '5 Tonnen'], tasks: [8, 8, 8], skill: fixed('nature.recycling') },
  { id: 'raetsel', world: 'natur', title: 'Wer bin ich?', icon: '🔍', motor: 'Tippen, Tastatur', levels: ['2 Antworten', '3 Antworten', '4 Antworten'], tasks: [6, 6, 6], skill: fixed('nature.animals') },
  { id: 'wachsen', world: 'natur', title: 'Wie wächst das?', icon: '🌱', motor: 'Ziehen, Tippen', levels: ['3 Bilder', '4 Bilder', 'Alle, ohne Beschriftung'], tasks: [4, 4, 5], skill: fixed('nature.cycles') },
  { id: 'wald', world: 'natur', title: 'Waldentdecker', icon: '🌲', motor: 'Tippen, Suchen im Bild', levels: ['3 Fragen', '5 Fragen', '8 Fragen'], tasks: [3, 5, 8], skill: fixed('nature.forest') },
  { id: 'rechnen', world: 'schule', title: 'Rechenbiber', icon: '➕', motor: 'Tippen, Zifferntasten', levels: ['Plus bis 10 mit Bildern', 'Plus und Minus bis 10', 'Plus und Minus bis 20'], tasks: [8, 8, 10], skill: (_, item) => (item.includes('-') ? 'math.sub' : 'math.add') },
  { id: 'woerter', world: 'schule', title: 'Wörter bauen', icon: '🧩', motor: 'Tippen, Tastatur', levels: ['Kurze Wörter', 'Alle Wörter', 'Mit Extrabuchstaben'], tasks: [6, 6, 6], skill: fixed('words.spell') },
  { id: 'zahlenstrahl', world: 'schule', title: 'Zahlenstrahl', icon: '📏', motor: 'Ziehen, Tippen, Pfeiltasten', levels: ['Bis 10', 'Bis 20', 'Bis 100 in Fünferschritten'], tasks: [8, 8, 8], skill: fixed('numbers.line') },
  { id: 'lesen', world: 'schule', title: 'Lesezeit', icon: '📖', motor: 'Tippen', levels: ['Ein bis zwei Sätze', 'Drei Sätze', 'Kurze Geschichten'], tasks: [3, 3, 3], skill: fixed('reading.texts') },
  { id: 'lautbruecke', world: 'schule', title: 'Lautbrücke', icon: '👂', motor: 'Tippen, Zifferntasten', levels: ['2–3 Laute, 2 Bilder', '3–4 Laute, 3 Bilder', '4–5 Laute, 4 Bilder'], tasks: [8, 8, 8], skill: fixed('reading.blend') },
  { id: 'silben', world: 'schule', title: 'Silbenklatschen', icon: '🥁', motor: 'Tippen, Leertaste, Zifferntasten', levels: ['1–2 Silben zählen', '2–3 Silben zählen', 'Wort aus Silben bauen'], tasks: [6, 6, 6], skill: fixed('reading.syllables') },
  { id: 'zahlenhaus', world: 'schule', title: 'Zahlenhaus', icon: '🏠', motor: 'Tippen, Zifferntasten', levels: ['Bis 5', 'Bis 10', 'Bis 20'], tasks: [5, 5, 5], skill: fixed('numbers.compose') },
  { id: 'blitzblick', world: 'schule', title: 'Blitzblick', icon: '⚡', motor: 'Tippen, Zifferntasten', levels: ['Bis 5, geordnet', 'Bis 10 im Zehnerfeld', 'Bis 20 in zwei Zehnerfeldern'], tasks: [8, 8, 8], skill: fixed('numbers.subitize') },
  { id: 'quiz', world: null, title: 'Eigenes Quiz', icon: '❓', motor: 'Tippen, Tastatur', levels: ['Standard'], tasks: [20], skill: fixed('custom.quiz') }
];

export const GAME_BY_ID = new Map(GAMES.map((g) => [g.id, g]));

export const MAX_ROUND_ATTEMPTS = 20;
export const MAX_QUIZ_QUESTIONS = 20;

/** Tierbilder des Stickeralbums in Freischalt-Reihenfolge. */
export const STICKERS =
  '🦫 🦊 🦔 🐿️ 🦉 🦌 🐳 🐬 🐙 🦀 🐢 🐄 🐖 🐔 🐑 🐴 🐧 🐻‍❄️ 🐒 🦜 🐅 🦥 🐰 🐘 🦒 🐌 🐝 🐸 🕷️ 🦋 🐊 🦓 🐶 🐱 🦁 🐼'.split(' ');
