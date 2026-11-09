/** Inhalte für `quatsch` (Satz zum Bild prüfen) und `reime`. Selbst geschrieben, vor dem Einsatz von einer Lehrkraft prüfen lassen. */

export interface PictureSentence {
  picture: string;
  /** Satz, der zum Bild passt. */
  fits: string;
  /** Satz, der nicht passt. */
  nonsense: string;
}

const s = (picture: string, fits: string, nonsense: string): PictureSentence => ({ picture, fits, nonsense });

/** Je Stufe: kurze Sätze / zwei Dinge im Bild / Anzahl und Lage genau lesen. */
export const PICTURE_SENTENCES: PictureSentence[][] = [
  [
    s('🐶', 'Da ist ein Hund.', 'Da ist ein Haus.'),
    s('🍎', 'Der Apfel ist rot.', 'Der Apfel ist blau.'),
    s('🚗', 'Das Auto fährt.', 'Das Auto ist ein Baum.'),
    s('🐱', 'Da ist eine Katze.', 'Da ist eine Maus.'),
    s('🌳', 'Der Baum ist grün.', 'Der Baum ist lila.'),
    s('🍌', 'Die Banane ist gelb.', 'Die Banane ist rot.'),
    s('🐸', 'Der Frosch ist grün.', 'Der Frosch ist rosa.'),
    s('⚽', 'Das ist ein Ball.', 'Das ist ein Bett.'),
    s('🐟', 'Das ist ein Fisch.', 'Das ist ein Hut.'),
    s('🌙', 'Da ist der Mond.', 'Da ist ein Igel.')
  ],
  [
    s('🐶 🦴', 'Der Hund hat einen Knochen.', 'Der Hund hat einen Ball.'),
    s('🐱 🧶', 'Die Katze spielt mit Wolle.', 'Die Katze spielt mit einem Auto.'),
    s('🐰 🥕', 'Der Hase hat eine Möhre.', 'Der Hase hat einen Apfel.'),
    s('🐝 🌻', 'Die Biene fliegt zur Blume.', 'Die Biene fliegt zum Auto.'),
    s('🐵 🍌', 'Der Affe hat eine Banane.', 'Der Affe hat eine Gurke.'),
    s('🦁 👑', 'Der Löwe trägt eine Krone.', 'Der Löwe trägt eine Brille.'),
    s('⛄ ❄️', 'Der Schneemann steht im Schnee.', 'Der Schneemann steht im Sand.'),
    s('🐦 🌳', 'Da sind ein Vogel und ein Baum.', 'Da sind ein Vogel und ein Haus.'),
    s('🧒 🎈', 'Das Kind hat einen Luftballon.', 'Das Kind hat einen Eimer.'),
    s('🐻 🍯', 'Der Bär hat einen Topf Honig.', 'Der Bär hat einen Korb Äpfel.')
  ],
  [
    s('🍎 🍎 🍎', 'Hier sind drei Äpfel.', 'Hier sind zwei Äpfel.'),
    s('🐥 🐥', 'Hier sind zwei Küken.', 'Hier ist nur ein Küken.'),
    s('🐶 🐱', 'Links ist der Hund, rechts die Katze.', 'Links ist die Katze, rechts der Hund.'),
    s('⭐ ⭐ ⭐ ⭐', 'Am Himmel sind vier Sterne.', 'Am Himmel sind fünf Sterne.'),
    s('🚗 🚲', 'Neben dem Auto steht ein Fahrrad.', 'Neben dem Auto steht ein Bus.'),
    s('🐔 🥚 🥚', 'Das Huhn hat zwei Eier gelegt.', 'Das Huhn hat drei Eier gelegt.'),
    s('🐢 🐇', 'Links ist die Schildkröte, rechts der Hase.', 'Links ist der Hase, rechts die Schildkröte.'),
    s('🌧️', 'Es regnet.', 'Die Sonne scheint.'),
    s('🐟 🐟 🐟 🐟 🐟', 'Im Bild schwimmen fünf Fische.', 'Im Bild schwimmen vier Fische.'),
    s('🌙 ⭐', 'Es ist Nacht.', 'Es ist Mittag.')
  ]
];

export interface RhymeWord {
  word: string;
  emoji: string;
}

/** Reimpaare: Jedes Wort reimt sich nur auf seinen Partner. */
export const RHYME_PAIRS: [RhymeWord, RhymeWord][] = (
  [
    ['Maus', '🐭', 'Haus', '🏠'],
    ['Rose', '🌹', 'Hose', '👖'],
    ['Hase', '🐰', 'Nase', '👃'],
    ['Kuh', '🐄', 'Schuh', '👟'],
    ['Bein', '🦵', 'Schwein', '🐷'],
    ['Brot', '🍞', 'Boot', '⛵'],
    ['Glocke', '🔔', 'Socke', '🧦'],
    ['Zahn', '🦷', 'Hahn', '🐓'],
    ['Tasche', '👜', 'Flasche', '🍾'],
    ['Igel', '🦔', 'Spiegel', '🪞'],
    ['Krone', '👑', 'Zitrone', '🍋'],
    ['Puppe', '🪆', 'Suppe', '🍲'],
    ['Klee', '🍀', 'Schnee', '❄️'],
    ['Katze', '🐱', 'Tatze', '🐾']
  ] as const
).map(([a, ea, b, eb]) => [
  { word: a, emoji: ea },
  { word: b, emoji: eb }
]);
