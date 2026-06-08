export default {
  title: 'Tirage de chance du programmeur',
  summaryPrefix: 'Interrogez ',
  summary:
    'l’amour, la santé, le code, les tests, les promotions, les changements de poste, les météorites, les bombes nucléaires et toutes les autres formes de chance',
  instructions: [
    'Tirez une fois avant de coder, tester, corriger ou commit pour éviter la malchance et chercher la chance',
    'Choisissez votre question, concentrez-vous dessus, puis cliquez sur "Tirer"',
    'Vous ne pouvez poser la même question qu’une fois. Actualisez la page avant de recommencer'
  ],
  initialCard: 'Choisissez ce que vous voulez demander',
  actionText: 'Tirer',
  itemLabels: {
    coding: 'Coder',
    testing: 'Tester',
    fixingBug: 'Corriger',
    commitCode: 'Commit',
    other: 'Autre'
  },
  todayText: 'Nous sommes {week}, le {day}/{month}/{year}',
  weeks: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
  results: [
    { title: 'Chance extrême', desc: '' },
    { title: 'Grande chance', desc: '' },
    { title: 'Chance', desc: '' },
    { title: 'Petite chance', desc: '' },
    { title: ' ', desc: '' },
    { title: 'Petit malheur', desc: '' },
    { title: 'Malheur', desc: '' },
    { title: 'Grand malheur', desc: '' },
    { title: 'Malheur extrême', desc: '' }
  ]
}
