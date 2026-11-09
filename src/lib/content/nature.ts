/** Wissensinhalte der Naturspiele. Namen immer mit Artikel, damit Sätze wie „Wo wohnt der Fuchs?“ passen. */

export interface SortZone {
  id: string;
  name: string;
  icon: string;
  color: string;
  /** Ortsangabe für Sätze, z. B. „im Wald“ oder „in die Biotonne“. */
  at: string;
}

export interface SortItem {
  emoji: string;
  name: string;
  zone: string;
  fact: string;
}

export interface SortConfig {
  title: string;
  icon: string;
  intro: string;
  zones: SortZone[];
  zonesPerRound: number;
  items: SortItem[];
  question: (item: SortItem) => string;
  wrong: (item: SortItem, zone: SortZone) => string;
}

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ---------------------------------------------------------------- Lebensräume

const HABITATS: SortZone[] = [
  { id: 'wald', name: 'Wald', icon: '🌲', color: '#74c69d', at: 'im Wald' },
  { id: 'meer', name: 'Meer', icon: '🌊', color: '#48cae4', at: 'im Meer' },
  { id: 'hof', name: 'Bauernhof', icon: '🚜', color: '#f4d35e', at: 'auf dem Bauernhof' },
  { id: 'eis', name: 'Eis & Schnee', icon: '❄️', color: '#caf0f8', at: 'im Eis' },
  { id: 'dschungel', name: 'Dschungel', icon: '🌴', color: '#40916c', at: 'im Dschungel' },
];

const ANIMALS: SortItem[] = [
  { emoji: '🦊', name: 'der Fuchs', zone: 'wald', fact: 'Der Fuchs wohnt in einer Höhle unter der Erde. Die heißt Fuchsbau.' },
  { emoji: '🦔', name: 'der Igel', zone: 'wald', fact: 'Der Igel frisst Käfer und Schnecken. Im Winter schläft er unter einem Laubhaufen.' },
  { emoji: '🐿️', name: 'das Eichhörnchen', zone: 'wald', fact: 'Das Eichhörnchen versteckt im Herbst Nüsse. Davon isst es im Winter.' },
  { emoji: '🦉', name: 'die Eule', zone: 'wald', fact: 'Die Eule schläft am Tag. In der Nacht jagt sie Mäuse.' },
  { emoji: '🦌', name: 'das Reh', zone: 'wald', fact: 'Das Reh frisst Gras und Blätter. Ein Rehbaby heißt Kitz und hat weiße Punkte.' },
  { emoji: '🐳', name: 'der Wal', zone: 'meer', fact: 'Der Blauwal ist das größte Tier der Welt. Und er ist gar kein Fisch – er atmet Luft!' },
  { emoji: '🐬', name: 'der Delfin', zone: 'meer', fact: 'Delfine sind sehr schlau. Sie müssen zum Atmen an die Wasseroberfläche.' },
  { emoji: '🐙', name: 'der Krake', zone: 'meer', fact: 'Der Krake hat acht Arme und kann seine Farbe ändern.' },
  { emoji: '🦀', name: 'die Krabbe', zone: 'meer', fact: 'Die Krabbe läuft seitwärts. Ihr harter Panzer schützt sie.' },
  { emoji: '🐢', name: 'die Meeresschildkröte', zone: 'meer', fact: 'Die Meeresschildkröte schwimmt durchs Meer. Ihre Eier legt sie in den Sand am Strand.' },
  { emoji: '🐄', name: 'die Kuh', zone: 'hof', fact: 'Die Kuh frisst Gras und gibt uns Milch. Aus Milch macht man Käse und Butter.' },
  { emoji: '🐖', name: 'das Schwein', zone: 'hof', fact: 'Schweine wälzen sich gern im Schlamm. So kühlen sie sich ab und schützen sich vor Sonnenbrand.' },
  { emoji: '🐔', name: 'das Huhn', zone: 'hof', fact: 'Das Huhn legt Eier. Scharren und picken macht es am liebsten.' },
  { emoji: '🐑', name: 'das Schaf', zone: 'hof', fact: 'Das Schaf hat dicke Wolle. Daraus kann man warme Pullover stricken.' },
  { emoji: '🐴', name: 'das Pferd', zone: 'hof', fact: 'Das Pferd kann sogar im Stehen schlafen.' },
  { emoji: '🐧', name: 'der Pinguin', zone: 'eis', fact: 'Der Pinguin kann nicht fliegen, aber super schwimmen. Er lebt am Südpol.' },
  { emoji: '🐻‍❄️', name: 'der Eisbär', zone: 'eis', fact: 'Der Eisbär lebt am Nordpol. Unter seinem weißen Fell ist seine Haut schwarz – so bleibt er warm.' },
  { emoji: '🦭', name: 'die Robbe', zone: 'eis', fact: 'Die Robbe hat eine dicke Fettschicht. Die hält sie im eiskalten Wasser warm.' },
  { emoji: '🐒', name: 'der Affe', zone: 'dschungel', fact: 'Der Affe klettert von Baum zu Baum und hält sich mit Händen und Füßen fest.' },
  { emoji: '🦜', name: 'der Papagei', zone: 'dschungel', fact: 'Der Papagei ist ganz bunt. Manche Papageien können Wörter nachsprechen.' },
  { emoji: '🐅', name: 'der Tiger', zone: 'dschungel', fact: 'Der Tiger ist die größte Katze der Welt. Seine Streifen helfen ihm, sich zu verstecken.' },
  { emoji: '🦥', name: 'das Faultier', zone: 'dschungel', fact: 'Das Faultier hängt fast den ganzen Tag im Baum und bewegt sich ganz langsam.' },
];

export const HABITAT_GAME: SortConfig = {
  title: 'Wo wohnt das Tier?',
  icon: '🐾',
  intro: 'Hallo, ich bin Bruno Biber! Hilf den Tieren, nach Hause zu finden.',
  zones: HABITATS,
  zonesPerRound: 4,
  items: ANIMALS,
  question: (a) => `Wo wohnt ${a.name}?`,
  wrong: (a, z) => `${capitalize(a.name)} wohnt nicht ${z.at}. Versuch es nochmal!`,
};

// ---------------------------------------------------------------- Mülltrennung

const BINS: SortZone[] = [
  { id: 'gelb', name: 'Gelbe Tonne', icon: '🥤', color: '#ffd60a', at: 'in die gelbe Tonne' },
  { id: 'papier', name: 'Papier', icon: '📚', color: '#3a86ff', at: 'in die Papiertonne' },
  { id: 'bio', name: 'Bio', icon: '🥬', color: '#9c6644', at: 'in die Biotonne' },
  { id: 'glas', name: 'Glas', icon: '🍶', color: '#52b788', at: 'in den Glascontainer' },
  { id: 'rest', name: 'Restmüll', icon: '🗑️', color: '#6c757d', at: 'in den Restmüll' },
];

const TRASH: SortItem[] = [
  { emoji: '🧴', name: 'die Shampooflasche', zone: 'gelb', fact: 'Plastik kommt in die gelbe Tonne. Daraus können neue Sachen aus Plastik werden.' },
  { emoji: '🥫', name: 'die Konservendose', zone: 'gelb', fact: 'Die Dose ist aus Metall. Das kann man einschmelzen und neue Dosen daraus machen.' },
  { emoji: '🧃', name: 'der Saftkarton', zone: 'gelb', fact: 'Saftkartons sind Verpackungen und kommen in die gelbe Tonne.' },
  { emoji: '📰', name: 'die Zeitung', zone: 'papier', fact: 'Aus altem Papier wird neues Papier. Dafür müssen weniger Bäume gefällt werden.' },
  { emoji: '📦', name: 'der Karton', zone: 'papier', fact: 'Kartons macht man vorher klein, dann passen mehr in die Papiertonne.' },
  { emoji: '✉️', name: 'der Briefumschlag', zone: 'papier', fact: 'Briefumschläge sind aus Papier und kommen in die Papiertonne.' },
  { emoji: '🍌', name: 'die Bananenschale', zone: 'bio', fact: 'Aus Bioabfall wird Kompost. Das ist gute Erde, in der Pflanzen wachsen.' },
  { emoji: '🍎', name: 'der Apfelrest', zone: 'bio', fact: 'Regenwürmer und kleine Tiere machen aus Obstresten neue Erde.' },
  { emoji: '🥚', name: 'die Eierschale', zone: 'bio', fact: 'Eierschalen kommen in die Biotonne und werden zu Kompost.' },
  { emoji: '🍂', name: 'das Laub', zone: 'bio', fact: 'Laub verrottet und wird wieder zu Erde. Im Laubhaufen schlafen im Winter auch Igel.' },
  { emoji: '🍾', name: 'die Glasflasche', zone: 'glas', fact: 'Glas kann man immer wieder einschmelzen und neue Flaschen daraus machen.' },
  { emoji: '🫙', name: 'das Marmeladenglas', zone: 'glas', fact: 'Leere Gläser kommen in den Glascontainer. Der Deckel kommt in die gelbe Tonne.' },
  { emoji: '🪥', name: 'die alte Zahnbürste', zone: 'rest', fact: 'Alte Zahnbürsten kommen in den Restmüll. Der wird verbrannt.' },
  { emoji: '🧽', name: 'der alte Schwamm', zone: 'rest', fact: 'Der alte Schwamm kommt in den Restmüll.' },
  { emoji: '🩹', name: 'das Pflaster', zone: 'rest', fact: 'Benutzte Pflaster kommen in den Restmüll.' },
];

export const TRASH_GAME: SortConfig = {
  title: 'Müll trennen',
  icon: '♻️',
  intro: 'Hallo, ich bin Bruno Biber! Wenn wir Müll richtig trennen, kann man daraus wieder neue Sachen machen.',
  zones: BINS,
  zonesPerRound: 5,
  items: TRASH,
  question: (t) => `Wohin gehört ${t.name}?`,
  wrong: (t, z) => `${capitalize(t.name)} gehört nicht ${z.at}. Versuch es nochmal!`,
};

export const SORT_GAMES: Record<string, SortConfig> = {
  lebensraum: HABITAT_GAME,
  muell: TRASH_GAME,
};

// ---------------------------------------------------------------- Tier-Rätsel

export interface Riddle {
  emoji: string;
  name: string;
  clues: [string, string, string];
}

export const RIDDLES: Riddle[] = [
  { emoji: '🐰', name: 'der Hase', clues: ['Ich habe lange Ohren.', 'Ich hoppele über die Wiese.', 'Ich knabbere gern an Möhren.'] },
  { emoji: '🐘', name: 'der Elefant', clues: ['Ich bin sehr groß und grau.', 'Ich habe große Ohren und lebe in Afrika.', 'Mit meinem langen Rüssel kann ich trinken und duschen.'] },
  { emoji: '🦒', name: 'die Giraffe', clues: ['Mein Fell hat braune Flecken.', 'Ich fresse Blätter ganz oben aus den Bäumen.', 'Ich habe den längsten Hals von allen Tieren.'] },
  { emoji: '🐌', name: 'die Schnecke', clues: ['Ich bin ganz langsam.', 'Wo ich krieche, bleibt eine Schleimspur.', 'Ich trage mein Haus auf dem Rücken.'] },
  { emoji: '🐝', name: 'die Biene', clues: ['Ich kann fliegen und summen.', 'Ich fliege von Blüte zu Blüte.', 'Ich mache leckeren Honig.'] },
  { emoji: '🐸', name: 'der Frosch', clues: ['Ich bin grün und kann weit springen.', 'Früher war ich eine Kaulquappe.', 'Ich sage Quak!'] },
  { emoji: '🦔', name: 'der Igel', clues: ['Ich bin klein und rund.', 'Wenn ich Angst habe, rolle ich mich zu einer Kugel.', 'Auf meinem Rücken habe ich viele Stacheln.'] },
  { emoji: '🦉', name: 'die Eule', clues: ['Ich habe riesige Augen.', 'Ich schlafe am Tag und bin in der Nacht wach.', 'Ich rufe Schuhu!'] },
  { emoji: '🐄', name: 'die Kuh', clues: ['Ich lebe auf dem Bauernhof.', 'Ich fresse den ganzen Tag Gras.', 'Ich gebe Milch und sage Muh!'] },
  { emoji: '🐧', name: 'der Pinguin', clues: ['Ich habe Flügel, aber ich kann nicht fliegen.', 'Ich bin ein super Schwimmer.', 'Ich lebe am eiskalten Südpol und sehe aus wie im Frack.'] },
  { emoji: '🕷️', name: 'die Spinne', clues: ['Ich habe acht Beine.', 'Ich kann Fäden machen.', 'In meinem Netz fange ich Fliegen.'] },
  { emoji: '🦋', name: 'der Schmetterling', clues: ['Ich habe ganz bunte Flügel.', 'Ich trinke Nektar aus Blüten.', 'Früher war ich eine Raupe.'] },
  { emoji: '🐊', name: 'das Krokodil', clues: ['Ich schwimme im Fluss und liege gern in der Sonne.', 'Meine Haut ist grün und schuppig.', 'Ich habe ein riesiges Maul mit vielen spitzen Zähnen.'] },
  { emoji: '🦓', name: 'das Zebra', clues: ['Ich sehe aus wie ein kleines Pferd.', 'Ich lebe in Afrika.', 'Ich habe schwarze und weiße Streifen.'] },
  { emoji: '🐿️', name: 'das Eichhörnchen', clues: ['Ich habe einen buschigen Schwanz.', 'Ich klettere flink auf Bäume.', 'Im Herbst verstecke ich Nüsse für den Winter.'] },
  { emoji: '🐶', name: 'der Hund', clues: ['Ich wedle mit dem Schwanz, wenn ich mich freue.', 'Ich habe eine sehr gute Nase.', 'Ich sage Wau wau!'] },
];

// ---------------------------------------------------------------- Wie wächst das?

export interface Step {
  emoji: string;
  label: string;
}

export interface Cycle {
  question: string;
  steps: Step[];
  explain: string;
}

export const CYCLES: Cycle[] = [
  {
    question: 'Wie wird aus einem Ei ein Schmetterling?',
    steps: [
      { emoji: '🥚', label: 'das Ei' },
      { emoji: '🐛', label: 'die Raupe' },
      { emoji: '🦋', label: 'der Schmetterling' },
    ],
    explain: 'Aus dem kleinen Ei schlüpft eine Raupe. Die frisst ganz viele Blätter. Dann spinnt sie sich ein, wird zur Puppe – und heraus kommt ein Schmetterling!',
  },
  {
    question: 'Wie wird aus einem Ei ein Huhn?',
    steps: [
      { emoji: '🥚', label: 'das Ei' },
      { emoji: '🐣', label: 'das Küken schlüpft' },
      { emoji: '🐥', label: 'das Küken' },
      { emoji: '🐔', label: 'das Huhn' },
    ],
    explain: 'Die Henne wärmt das Ei drei Wochen lang. Dann pickt das Küken die Schale auf. Es wächst und wird ein Huhn.',
  },
  {
    question: 'Wie wächst ein Baum?',
    steps: [
      { emoji: '🌰', label: 'die Kastanie' },
      { emoji: '🌱', label: 'der Keimling' },
      { emoji: '🌳', label: 'der Baum' },
    ],
    explain: 'In der Kastanie steckt ein Samen. In der Erde keimt er, wenn er Wasser bekommt. Nach vielen, vielen Jahren wird ein großer Baum daraus.',
  },
  {
    question: 'Wie wächst ein Apfel?',
    steps: [
      { emoji: '🌸', label: 'die Blüte' },
      { emoji: '🍏', label: 'der kleine grüne Apfel' },
      { emoji: '🍎', label: 'der reife Apfel' },
    ],
    explain: 'Im Frühling blüht der Apfelbaum. Bienen tragen Blütenstaub von Blüte zu Blüte. Daraus wächst ein kleiner Apfel, der im Herbst reif ist.',
  },
  {
    question: 'Wie wird ein Mensch groß?',
    steps: [
      { emoji: '👶', label: 'das Baby' },
      { emoji: '🧒', label: 'das Kind' },
      { emoji: '🧑', label: 'der Erwachsene' },
      { emoji: '🧓', label: 'die Oma' },
    ],
    explain: 'Erst bist du ein Baby, jetzt bist du ein Kind. Später wirst du erwachsen – und irgendwann vielleicht Oma oder Opa.',
  },
  {
    question: 'Wie geht ein Tag vorbei?',
    steps: [
      { emoji: '🌅', label: 'der Morgen' },
      { emoji: '☀️', label: 'der Mittag' },
      { emoji: '🌇', label: 'der Abend' },
      { emoji: '🌙', label: 'die Nacht' },
    ],
    explain: 'Am Morgen geht die Sonne auf. Mittags steht sie ganz hoch. Am Abend geht sie unter – und in der Nacht leuchten Mond und Sterne.',
  },
  {
    question: 'Was ist die richtige Reihenfolge der Jahreszeiten?',
    steps: [
      { emoji: '🌷', label: 'der Frühling' },
      { emoji: '🏖️', label: 'der Sommer' },
      { emoji: '🍂', label: 'der Herbst' },
      { emoji: '⛄', label: 'der Winter' },
    ],
    explain: 'Im Frühling blühen die Blumen, im Sommer ist es warm, im Herbst fallen die Blätter und im Winter schneit es. Dann fängt alles von vorne an!',
  },
  {
    question: 'Was passiert mit dem Schneemann?',
    steps: [
      { emoji: '❄️', label: 'der Schnee' },
      { emoji: '⛄', label: 'der Schneemann' },
      { emoji: '💧', label: 'das Wasser' },
    ],
    explain: 'Schnee ist gefrorenes Wasser. Wenn die Sonne scheint und es warm wird, schmilzt der Schneemann und wird wieder zu Wasser.',
  },
];

// ---------------------------------------------------------------- Waldentdecker

export interface ForestThing {
  id: string;
  emoji: string;
  name: string;
  fact: string;
  x: number;
  y: number;
  size: number;
  litter?: boolean;
}

export interface ForestQuestion {
  question: string;
  answer: string;
}

/** Positionen in Prozent der Szene (Mittelpunkt); Größe relativ zur Szenenbreite (1 ≈ 1.6 % der Breite). */
export const FOREST: ForestThing[] = [
  { id: 'tanne', emoji: '🌲', name: 'die Tanne', fact: 'Die Tanne bleibt auch im Winter grün. Sie hat Nadeln statt Blätter.', x: 55, y: 32, size: 9 },
  { id: 'eule', emoji: '🦉', name: 'die Eule', fact: 'Die Eule schläft am Tag. In der Nacht geht sie auf Mäusejagd.', x: 29, y: 24, size: 3 },
  { id: 'specht', emoji: '🐦', name: 'der Specht', fact: 'Der Specht klopft mit seinem Schnabel Löcher in die Baumrinde und sucht Käfer.', x: 80, y: 30, size: 2.5 },
  { id: 'eichhoernchen', emoji: '🐿️', name: 'das Eichhörnchen', fact: 'Das Eichhörnchen sammelt im Herbst Nüsse und versteckt sie für den Winter.', x: 12, y: 52, size: 3.5 },
  { id: 'fuchs', emoji: '🦊', name: 'der Fuchs', fact: 'Der Fuchs wohnt in einer Höhle unter der Erde, dem Fuchsbau.', x: 66, y: 68, size: 4 },
  { id: 'reh', emoji: '🦌', name: 'das Reh', fact: 'Das Reh ist sehr scheu. Wenn es Menschen hört, rennt es schnell weg.', x: 87, y: 60, size: 5 },
  { id: 'igel', emoji: '🦔', name: 'der Igel', fact: 'Der Igel hat Stacheln. Er frisst Käfer und Schnecken und hält Winterschlaf.', x: 22, y: 80, size: 3 },
  { id: 'pilz', emoji: '🍄', name: 'der Fliegenpilz', fact: 'Der Fliegenpilz ist giftig! Pilze aus dem Wald darf man nie einfach essen.', x: 40, y: 74, size: 3 },
  { id: 'ameise', emoji: '🐜', name: 'die Ameise', fact: 'Ameisen sind winzig, aber sie können viel mehr tragen, als sie selbst wiegen.', x: 47, y: 90, size: 1.8 },
  { id: 'schnecke', emoji: '🐌', name: 'die Schnecke', fact: 'Die Schnecke trägt ihr Haus immer mit sich herum.', x: 7, y: 89, size: 2.5 },
  { id: 'biene', emoji: '🐝', name: 'die Biene', fact: 'Die Biene fliegt von Blüte zu Blüte und macht daraus Honig.', x: 93, y: 76, size: 2 },
  { id: 'becher', emoji: '🥤', name: 'der Becher', fact: 'Oh, Müll im Wald! Danke, dass du ihn aufhebst. Müll kann Tieren sehr schaden.', x: 58, y: 88, size: 2.5, litter: true },
  { id: 'dose', emoji: '🥫', name: 'die Dose', fact: 'Noch mehr Müll! Gut, dass du aufräumst. Müll gehört in den Mülleimer.', x: 31, y: 63, size: 2, litter: true },
];

/** Nicht anklickbare Deko der Waldszene. */
export const FOREST_DECOR = [
  { emoji: '🌲', x: 3, y: 46, size: 3.5 },
  { emoji: '🌲', x: 19, y: 45, size: 4 },
  { emoji: '🌲', x: 42, y: 44, size: 3.5 },
  { emoji: '🌲', x: 68, y: 45, size: 4 },
  { emoji: '🌲', x: 95, y: 44, size: 4.5 },
  { emoji: '🌳', x: 88, y: 42, size: 5 },
  { emoji: '🌳', x: 8, y: 36, size: 10 },
  { emoji: '🌳', x: 30, y: 32, size: 11 },
  { emoji: '🌳', x: 78, y: 34, size: 10 },
  { emoji: '☁️', x: 18, y: 8, size: 4 },
  { emoji: '☁️', x: 68, y: 6, size: 3.5 },
  { emoji: '🌼', x: 92, y: 88, size: 2 },
  { emoji: '🌼', x: 88, y: 92, size: 1.6 },
  { emoji: '🌿', x: 45, y: 62, size: 3 },
  { emoji: '🪨', x: 76, y: 84, size: 2.5 },
];

export const FOREST_QUESTIONS: ForestQuestion[] = [
  { question: 'Wer schläft am Tag und ist in der Nacht wach?', answer: 'eule' },
  { question: 'Wer versteckt Nüsse für den Winter?', answer: 'eichhoernchen' },
  { question: 'Welcher Pilz ist giftig?', answer: 'pilz' },
  { question: 'Wer hat Stacheln?', answer: 'igel' },
  { question: 'Wer trägt sein Haus auf dem Rücken?', answer: 'schnecke' },
  { question: 'Wer macht Honig?', answer: 'biene' },
  { question: 'Wer wohnt in einem Bau unter der Erde?', answer: 'fuchs' },
  { question: 'Welcher Baum ist auch im Winter grün?', answer: 'tanne' },
  { question: 'Wer klopft Löcher in die Bäume?', answer: 'specht' },
  { question: 'Wer ist winzig klein, aber ganz stark?', answer: 'ameise' },
  { question: 'Wer rennt weg, wenn er Menschen hört?', answer: 'reh' },
  { question: 'Was gehört nicht in den Wald?', answer: 'litter' },
];
