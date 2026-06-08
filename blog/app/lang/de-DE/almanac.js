export default {
  title: 'Programmierer-Glückskalender',
  loading: 'Das heutige Glück wird berechnet...',
  goodTitle: 'Tun',
  badTitle: 'Vermeiden',
  seatDirectionLabel: 'Sitzrichtung:',
  seatDirectionText:
    'Schauen Sie beim Coden nach {direction}, um weniger Probleme zu treffen.',
  drinkLabel: 'Getränk des Tages:',
  goddessLabel: 'Crush-Affinität:',
  todayText: 'Heute ist {week}, der {day}.{month}.{year}',
  drinkSeparator: ', ',
  weeks: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  directions: [
    'Norden',
    'Nordosten',
    'Osten',
    'Südosten',
    'Süden',
    'Südwesten',
    'Westen',
    'Nordwesten'
  ],
  activities: [
    {
      name: 'Unit-Tests schreiben',
      good: 'Unit-Tests werden Fehler reduzieren',
      bad: 'Unit-Tests werden Ihr Entwicklungstempo bremsen'
    },
    {
      name: 'Duschen',
      good: 'Es ist schon ein paar Tage her, oder?',
      bad: 'Vielleicht spülen Sie Ihre Design-Inspiration weg',
      weekend: true
    },
    {
      name: 'Trainieren',
      good: 'Zeit, die steifen Muskeln zu dehnen',
      bad: 'Sie verbrennen wenig Energie und essen noch mehr',
      weekend: true
    },
    {
      name: 'Rauchen',
      good: 'Es könnte wach machen, auch wenn Rauchen weiterhin schadet',
      bad: 'Rauchen ist schlecht für die Gesundheit',
      weekend: true
    },
    {
      name: 'Tagsüber deployen',
      good: 'Ein Release am Tag ist heute sicher',
      bad: 'Es kann katastrophale Folgen haben'
    },
    {
      name: 'Refactoren',
      good: 'Die Codequalität wird steigen',
      bad: 'Sie könnten in Regressionen stecken bleiben'
    },
    {
      name: '%t verwenden',
      good: 'Sie wirken geschmackvoller',
      bad: 'Andere könnten denken, Sie geben an'
    },
    {
      name: 'Job wechseln',
      good: 'Loslassen, wenn es Zeit ist',
      bad: 'Bei dieser Wirtschaft ist der nächste Job vielleicht nicht besser'
    },
    {
      name: 'Jemanden einstellen',
      good: 'Diese Person könnte echtes Potenzial haben',
      bad: 'Kann diese Person überhaupt coden?'
    },
    {
      name: 'Vorstellungsgespräch',
      good: 'Der Interviewer ist heute gut gelaunt',
      bad: 'Der Interviewer ist genervt und lässt es vielleicht an Ihnen aus'
    },
    {
      name: 'Kündigung einreichen',
      good: 'Die Firma hat jemanden Billigeren und Fähigeren gefunden',
      bad: 'Bei dieser Wirtschaft ist der nächste Job vielleicht nicht besser'
    },
    {
      name: 'Gehaltserhöhung verlangen',
      good: 'Der Chef ist heute gut gelaunt',
      bad: 'Die Firma denkt über Entlassungen nach'
    },
    {
      name: 'Heute Nacht Überstunden machen',
      good: 'Nachts sind Programmierer am wachsten',
      bad: 'Sie sind schon erschöpft, ruhen Sie sich aus',
      weekend: true
    },
    {
      name: 'Vor dem Crush prahlen',
      good: 'Ihr Image verbessert sich ein wenig',
      bad: 'Sie werden sofort durchschaut',
      weekend: true
    },
    {
      name: 'Karten auf Wikimoe ziehen',
      good: 'Sie haben gute Chancen auf die gewünschte Karte',
      bad: 'Nutzlose Karten werden vom Himmel fallen',
      weekend: true
    },
    {
      name: 'Technikbeitrag schreiben',
      good: 'Ein neues Content-Meisterwerk entsteht',
      bad: 'Ihr Beitrag könnte kopiert werden',
      weekend: true
    },
    {
      name: 'Eine Variable "%v" nennen',
      good: 'Der Variablenname wirkt unerwartet niedlich',
      bad: 'Sie werden diese Variable nie wieder referenzieren'
    },
    {
      name: 'Eine Methode mit mehr als %l Zeilen schreiben',
      good: 'Ihr Code ist gut genug organisiert, um die Länge zu überstehen',
      bad: 'Der Code wird zu einem unverständlichen Durcheinander'
    },
    {
      name: 'Code committen',
      good: 'Die Chance auf Konflikte ist am niedrigsten',
      bad: 'Ein Berg von Konflikten lässt Sie am Zeitplan zweifeln'
    },
    {
      name: 'Code reviewen',
      good: 'Sie entdecken deutlich eher wichtige Probleme',
      bad: 'Sie finden nichts und verschwenden die ganze Sitzung'
    },
    {
      name: 'An einem Meeting teilnehmen',
      good: 'Ein kurzes Nickerchen weg vom Code ist gesund',
      bad: 'Am Ende tragen Sie vielleicht die Schuld'
    },
    {
      name: 'Overwatch spielen',
      good: 'Sie fühlen sich von den Göttern gesegnet',
      bad: 'Sie werden komplett überrollt',
      weekend: true
    },
    {
      name: 'Nachts deployen',
      good: 'Nachts sind Programmierer am wachsten',
      bad: 'Sie haben tagsüber schon alle Energie verbraucht'
    },
    {
      name: 'Probleme korrigieren',
      good: 'Ihr Gespür für Probleme ist heute ungewöhnlich scharf',
      bad: 'Sie schaffen mehr Probleme, als Sie lösen'
    },
    {
      name: 'Designreview',
      good: 'Das Review wird zu einer echten Brainstorming-Runde',
      bad: 'Alle sind erschöpft und nichts Sinnvolles passiert'
    },
    {
      name: 'Anforderungsreview',
      good: 'Diese Anforderung sieht einfach aus',
      bad: 'Die Firma will eine App-Haut, die zur Handyhülle passt'
    },
    {
      name: 'Blogs lesen',
      good: 'Die heutigen Geschichten lohnen sich',
      bad: 'Die Blogosphäre ist heute voller negativer Energie',
      weekend: true
    },
    {
      name: 'Anime-Seiten ansehen',
      good: 'Brauchen Sie wirklich einen Grund?',
      bad: 'Die Kommentare sind voller Tastaturkrieger',
      weekend: true
    },
    {
      name: 'MapleStory Online spielen',
      good: 'Sie könnten ein göttliches 25-Sterne-Setup rollen',
      bad: 'Außer Sie wollen Ihren Computer zerschlagen',
      weekend: true
    }
  ],
  specials: [
    {
      date: 20140214,
      type: 'bad',
      name: 'Bei Ihrem Partner bleiben',
      description:
        'Der Valentinstag bestraft Singles und belohnt Paare.'
    }
  ],
  tools: [
    'In Eclipse coden',
    'Dokumente in MS Office schreiben',
    'In Notepad coden',
    'Windows 8',
    'Linux',
    'macOS',
    'Internet Explorer',
    'Android-Gerät',
    'iOS-Gerät'
  ],
  varNames: [
    'result',
    'event',
    'payment',
    'expire',
    'bill',
    'each',
    'free',
    'i1',
    'a',
    'virtual',
    'ad',
    'spider',
    'password',
    'pass',
    'ui'
  ],
  drinks: [
    'Wasser',
    'Tee',
    'Schwarzer Tee',
    'Grüner Tee',
    'Kaffee',
    'Milchtee',
    'Cola',
    'Frische Milch',
    'Sojamilch',
    'Saft',
    'Fruchtsoda',
    'Sprudelwasser',
    'Sportgetränk',
    'Joghurt',
    'Alkohol'
  ]
}
