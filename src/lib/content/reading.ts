/** Kurze Lesetexte mit je einer Verständnisfrage. Die erste Antwort ist die richtige. */

export interface ReadingText {
  id: string;
  level: 1 | 2 | 3;
  text: string;
  question: string;
  answers: [string, string, string];
}

export const READING_TEXTS: ReadingText[] = [
  { id: 'hund', level: 1, text: 'Der Hund ist im Garten. Er sucht den Ball.', question: 'Was sucht der Hund?', answers: ['den Ball', 'den Hut', 'den Keks'] },
  { id: 'rad', level: 1, text: 'Oma hat ein Rad. Das Rad ist rot.', question: 'Welche Farbe hat das Rad?', answers: ['rot', 'blau', 'grün'] },
  { id: 'apfel', level: 1, text: 'Tim isst eine Banane. Lena isst einen Apfel.', question: 'Wer isst den Apfel?', answers: ['Lena', 'Tim', 'Oma'] },
  { id: 'fisch', level: 1, text: 'Der Fisch ist im Teich. Er schwimmt schnell.', question: 'Wo ist der Fisch?', answers: ['im Teich', 'im Bett', 'im Auto'] },
  { id: 'mond', level: 1, text: 'Es ist Nacht. Der Mond scheint.', question: 'Was scheint in der Nacht?', answers: ['der Mond', 'die Lampe', 'die Sonne'] },
  { id: 'katze', level: 1, text: 'Die Katze schläft auf dem Sofa.', question: 'Wo schläft die Katze?', answers: ['auf dem Sofa', 'unter dem Tisch', 'im Korb'] },
  { id: 'schirm', level: 1, text: 'Es regnet. Ali nimmt den Schirm.', question: 'Was nimmt Ali?', answers: ['den Schirm', 'den Ball', 'die Mütze'] },
  { id: 'ente', level: 1, text: 'Die Ente hat drei Küken.', question: 'Wie viele Küken hat die Ente?', answers: ['drei', 'zwei', 'fünf'] },
  { id: 'brot', level: 1, text: 'Papa backt Brot. Es riecht gut.', question: 'Was backt Papa?', answers: ['Brot', 'Kuchen', 'Pizza'] },
  { id: 'schnee', level: 1, text: 'Im Winter liegt Schnee. Mia baut einen Schneemann.', question: 'Was baut Mia?', answers: ['einen Schneemann', 'ein Haus', 'einen Turm'] },

  { id: 'fuchs', level: 2, text: 'Der Fuchs läuft durch den Wald. Er hat Hunger. Da sieht er eine Maus, aber die Maus ist schneller.', question: 'Wer ist schneller?', answers: ['die Maus', 'der Fuchs', 'der Hase'] },
  { id: 'geburtstag', level: 2, text: 'Heute hat Noah Geburtstag. Er wird sieben Jahre alt. Alle Kinder singen für ihn.', question: 'Wie alt wird Noah?', answers: ['sieben Jahre', 'sechs Jahre', 'acht Jahre'] },
  { id: 'bus', level: 2, text: 'Emma fährt mit dem Bus zur Schule. Heute kommt der Bus zu spät. Emma wartet an der Haltestelle.', question: 'Wo wartet Emma?', answers: ['an der Haltestelle', 'in der Schule', 'im Bus'] },
  { id: 'herbst', level: 2, text: 'Im Herbst werden die Äpfel reif. Opa holt die Leiter. Dann pflückt er die Äpfel vom Baum.', question: 'Wann werden die Äpfel reif?', answers: ['im Herbst', 'im Frühling', 'im Winter'] },
  { id: 'schluessel', level: 2, text: 'Ben sucht seinen Schlüssel. Er schaut unter das Bett und in die Tasche. Der Schlüssel liegt in der Küche.', question: 'Wo liegt der Schlüssel?', answers: ['in der Küche', 'unter dem Bett', 'in der Tasche'] },
  { id: 'biene', level: 2, text: 'Die Biene fliegt von Blüte zu Blüte. Sie sammelt Nektar. Daraus wird im Bienenstock Honig.', question: 'Was wird aus dem Nektar?', answers: ['Honig', 'Milch', 'Saft'] },
  { id: 'pause', level: 2, text: 'In der Pause regnet es. Die Kinder bleiben im Klassenzimmer. Sie spielen ein Brettspiel.', question: 'Warum bleiben die Kinder drinnen?', answers: ['Weil es regnet.', 'Weil es schneit.', 'Weil sie müde sind.'] },
  { id: 'kaninchen', level: 2, text: 'Lotta hat ein Kaninchen. Es heißt Flocke. Am liebsten frisst es Möhren.', question: 'Wie heißt das Kaninchen?', answers: ['Flocke', 'Lotta', 'Möhre'] },

  { id: 'eichhoernchen', level: 3, text: 'Im Herbst sammelt das Eichhörnchen Nüsse. Es versteckt sie an vielen Stellen im Wald. Im Winter findet es nicht alle wieder. Aus manchen Nüssen wachsen dann neue Bäume.', question: 'Was wächst aus manchen Nüssen?', answers: ['neue Bäume', 'Pilze', 'Blumen'] },
  { id: 'reifen', level: 3, text: 'Samira will mit dem Rad zum Sportplatz fahren. Doch der Hinterreifen ist platt. Ihr Bruder holt die Pumpe und hilft ihr. Danach kommt sie noch pünktlich an.', question: 'Wer hilft Samira?', answers: ['ihr Bruder', 'ihre Mutter', 'ihre Freundin'] },
  { id: 'butter', level: 3, text: 'Jonas möchte einen Kuchen backen. Er hat Mehl und Eier, aber keine Butter. Deshalb geht er schnell zur Nachbarin. Frau Kaya gibt ihm ein Stück Butter.', question: 'Was fehlt Jonas?', answers: ['Butter', 'Mehl', 'Eier'] },
  { id: 'frosch', level: 3, text: 'Im Teich schlüpfen kleine Kaulquappen. Sie haben einen langen Schwanz und leben im Wasser. Nach einigen Wochen wachsen ihnen Beine. Am Ende ist aus jeder Kaulquappe ein Frosch geworden.', question: 'Was wächst den Kaulquappen nach einigen Wochen?', answers: ['Beine', 'Flügel', 'Federn'] },
  { id: 'buecherei', level: 3, text: 'Am Freitag geht die Klasse in die Bücherei. Jedes Kind darf zwei Bücher ausleihen. Amir nimmt ein Buch über Dinosaurier und eines über Piraten. Nach zwei Wochen bringt er sie zurück.', question: 'Wie viele Bücher darf jedes Kind ausleihen?', answers: ['zwei', 'eines', 'fünf'] },
  { id: 'sturm', level: 3, text: 'In der Nacht gab es einen Sturm. Am Morgen liegen überall Äste auf der Straße. Deshalb kann der Schulbus nicht fahren. Die Kinder gehen heute zu Fuß.', question: 'Warum kann der Schulbus nicht fahren?', answers: ['Äste liegen auf der Straße.', 'Der Bus ist kaputt.', 'Es liegt viel Schnee.'] }
];
