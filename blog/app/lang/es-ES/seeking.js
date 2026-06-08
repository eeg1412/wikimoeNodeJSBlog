export default {
  title: 'Sorteo de fortuna del programador',
  summaryPrefix: 'Pregunta ',
  summary:
    'sobre amor, salud, código, pruebas, ascensos, cambios de trabajo, meteoritos, bombas nucleares y cualquier otra suerte',
  instructions: [
    'Saca una vez antes de programar, probar, corregir o hacer commit para esquivar la mala suerte y buscar la buena',
    'Elige lo que quieres preguntar, concéntrate y haz clic en "Sacar"',
    'Solo puedes preguntar lo mismo una vez. Actualiza la página antes de sacar otra vez'
  ],
  initialCard: 'Selecciona lo que quieres preguntar',
  actionText: 'Sacar',
  itemLabels: {
    coding: 'Programar',
    testing: 'Probar',
    fixingBug: 'Corregir',
    commitCode: 'Commit de código',
    other: 'Otro'
  },
  todayText: 'Hoy es {week}, {day}/{month}/{year}',
  weeks: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  results: [
    { title: 'Suerte extrema', desc: '' },
    { title: 'Gran suerte', desc: '' },
    { title: 'Suerte', desc: '' },
    { title: 'Pequeña suerte', desc: '' },
    { title: ' ', desc: '' },
    { title: 'Pequeña desgracia', desc: '' },
    { title: 'Desgracia', desc: '' },
    { title: 'Gran desgracia', desc: '' },
    { title: 'Desgracia extrema', desc: '' }
  ]
}
