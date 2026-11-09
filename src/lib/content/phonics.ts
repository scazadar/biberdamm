/** Wortlisten für `lautbruecke` und `silben`. Laute und Silben sind von Hand festgelegt und nicht berechnet. */

export interface SoundWord {
  word: string;
  emoji: string;
  sounds: string[];
}

export interface SyllableWord {
  word: string;
  emoji: string;
  syllables: string[];
}

/** Schreibweise, mit der die Sprachausgabe einen Laut gedehnt spricht statt den Buchstabennamen. */
export const SPOKEN_SOUNDS: Record<string, string> = {
  A: 'Aaa',
  E: 'Eee',
  I: 'Iii',
  O: 'Ooo',
  Ö: 'Ööö',
  U: 'Uuu',
  AI: 'Ei',
  EI: 'Ei',
  AU: 'Au',
  EU: 'Eu',
  F: 'Fff',
  L: 'Lll',
  M: 'Mmm',
  N: 'Nnn',
  R: 'Rrr',
  S: 'Sss',
  SCH: 'Schhh',
  W: 'Www'
};

const sound = (word: string, emoji: string, sounds: string): SoundWord => ({ word, emoji, sounds: sounds.split(' ') });

/** Nur Wörter aus dehnbaren Lauten: Verschlusslaute wie T oder K lassen sich einzeln nicht sauber sprechen. */
export const SOUND_WORDS: SoundWord[] = [
  sound('Uhr', '⏰', 'U R'),
  sound('Ohr', '👂', 'O R'),
  sound('Fee', '🧚', 'F E'),
  sound('Schuh', '👟', 'SCH U'),
  sound('Wal', '🐋', 'W A L'),
  sound('Reis', '🍚', 'R EI S'),
  sound('Mais', '🌽', 'M AI S'),
  sound('Maus', '🐭', 'M AU S'),
  sound('Schaf', '🐑', 'SCH A F'),
  sound('Nuss', '🥜', 'N U S'),
  sound('Oma', '👵', 'O M A'),
  sound('Ufo', '🛸', 'U F O'),
  sound('Eule', '🦉', 'EU L E'),
  sound('Rose', '🌹', 'R O S E'),
  sound('Nase', '👃', 'N A S E'),
  sound('Sofa', '🛋️', 'S O F A'),
  sound('Mofa', '🛵', 'M O F A'),
  sound('Lama', '🦙', 'L A M A'),
  sound('Limo', '🥤', 'L I M O'),
  sound('Sonne', '☀️', 'S O N E'),
  sound('Wolle', '🧶', 'W O L E'),
  sound('Wolf', '🐺', 'W O L F'),
  sound('Löwe', '🦁', 'L Ö W E'),
  sound('Ameise', '🐜', 'A M EI S E')
];

const syllable = (emoji: string, parts: string): SyllableWord => {
  const syllables = parts.split('-');
  return { word: syllables.join(''), emoji, syllables };
};

export const SYLLABLE_WORDS: SyllableWord[] = [
  syllable('🏠', 'Haus'),
  syllable('🌳', 'Baum'),
  syllable('🐶', 'Hund'),
  syllable('🐟', 'Fisch'),
  syllable('⭐', 'Stern'),
  syllable('🌙', 'Mond'),
  syllable('📖', 'Buch'),
  syllable('🐰', 'Ha-se'),
  syllable('🌹', 'Ro-se'),
  syllable('🍎', 'Ap-fel'),
  syllable('🐱', 'Kat-ze'),
  syllable('🌸', 'Blu-me'),
  syllable('☀️', 'Son-ne'),
  syllable('☕', 'Tas-se'),
  syllable('🚗', 'Au-to'),
  syllable('🐞', 'Kä-fer'),
  syllable('🍐', 'Bir-ne'),
  syllable('🏫', 'Schu-le'),
  syllable('🍌', 'Ba-na-ne'),
  syllable('🍅', 'To-ma-te'),
  syllable('🚀', 'Ra-ke-te'),
  syllable('🍉', 'Me-lo-ne'),
  syllable('🦋', 'Schmet-ter-ling'),
  syllable('☎️', 'Te-le-fon'),
  syllable('🐊', 'Kro-ko-dil'),
  syllable('🐘', 'E-le-fant'),
  syllable('🦜', 'Pa-pa-gei'),
  syllable('🍍', 'A-na-nas'),
  syllable('🦒', 'Gi-raf-fe'),
  syllable('🥕', 'Ka-rot-te'),
  syllable('🌈', 'Re-gen-bo-gen')
];
