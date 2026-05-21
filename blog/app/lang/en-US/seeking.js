export default {
  title: 'Programmer Fortune Draw',
  summaryPrefix: 'Ask ',
  summary:
    'about love, illness, coding, tests, promotions, job changes, meteorites, nuclear bombs, and every other kind of luck',
  instructions: [
    'Draw once before coding, testing, fixing bugs, or committing to dodge bad luck and chase good luck',
    'Choose what you want to ask about, focus on it, then click "Draw"',
    'You can ask about the same thing only once. Refresh the page before drawing again'
  ],
  initialCard: 'Select what you want to ask about',
  actionText: 'Draw',
  itemLabels: {
    coding: 'Coding',
    testing: 'Testing',
    fixingBug: 'Fix bugs',
    commitCode: 'Commit code',
    other: 'Other'
  },
  todayText: 'Today is {week}, {month}/{day}/{year}',
  weeks: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  results: [
    { title: 'Extreme luck', desc: '' },
    { title: 'Great luck', desc: '' },
    { title: 'Luck', desc: '' },
    { title: 'Slight luck', desc: '' },
    { title: ' ', desc: '' },
    { title: 'Slight misfortune', desc: '' },
    { title: 'Misfortune', desc: '' },
    { title: 'Great misfortune', desc: '' },
    { title: 'Extreme misfortune', desc: '' }
  ]
}
