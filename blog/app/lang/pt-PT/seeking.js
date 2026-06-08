export default {
  title: 'Sorteio de sorte do programador',
  summaryPrefix: 'Pergunte ',
  summary:
    'sobre amor, saúde, código, testes, promoções, mudanças de trabalho, meteoritos, bombas nucleares e qualquer outro tipo de sorte',
  instructions: [
    'Tire uma vez antes de programar, testar, corrigir ou fazer commit para evitar azar e procurar sorte',
    'Escolha o que quer perguntar, concentre-se nisso e clique em "Tirar"',
    'Só pode perguntar sobre a mesma coisa uma vez. Atualize a página antes de tirar novamente'
  ],
  initialCard: 'Selecione o que quer perguntar',
  actionText: 'Tirar',
  itemLabels: {
    coding: 'Programar',
    testing: 'Testar',
    fixingBug: 'Corrigir',
    commitCode: 'Commit de código',
    other: 'Outro'
  },
  todayText: 'Hoje é {week}, {day}/{month}/{year}',
  weeks: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  results: [
    { title: 'Sorte extrema', desc: '' },
    { title: 'Grande sorte', desc: '' },
    { title: 'Sorte', desc: '' },
    { title: 'Pequena sorte', desc: '' },
    { title: ' ', desc: '' },
    { title: 'Pequeno azar', desc: '' },
    { title: 'Azar', desc: '' },
    { title: 'Grande azar', desc: '' },
    { title: 'Azar extremo', desc: '' }
  ]
}
