export default {
  title: 'Calendário de sorte do programador',
  loading: 'A calcular a sorte de hoje...',
  goodTitle: 'Fazer',
  badTitle: 'Evitar',
  seatDirectionLabel: 'Direção do assento:',
  seatDirectionText:
    'Olhe para {direction} enquanto programa para encontrar menos problemas.',
  drinkLabel: 'Bebida do dia:',
  goddessLabel: 'Afinidade com o crush:',
  todayText: 'Hoje é {week}, {day}/{month}/{year}',
  drinkSeparator: ', ',
  weeks: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  directions: [
    'Norte',
    'Nordeste',
    'Este',
    'Sudeste',
    'Sul',
    'Sudoeste',
    'Oeste',
    'Noroeste'
  ],
  activities: [
    {
      name: 'Escrever testes unitários',
      good: 'Os testes unitários vão reduzir erros',
      bad: 'Os testes unitários vão abrandar o ritmo de desenvolvimento'
    },
    {
      name: 'Tomar banho',
      good: 'Já passaram alguns dias, não foi?',
      bad: 'Pode lavar também a sua inspiração de design',
      weekend: true
    },
    {
      name: 'Fazer exercício',
      good: 'Está na hora de alongar esses músculos rígidos',
      bad: 'Vai gastar pouca energia e comer ainda mais',
      weekend: true
    },
    {
      name: 'Fumar',
      good: 'Pode ajudar a acordar, embora fumar continue a fazer mal',
      bad: 'Fumar faz mal à saúde',
      weekend: true
    },
    {
      name: 'Deploy de dia',
      good: 'Um lançamento diurno é seguro hoje',
      bad: 'Pode levar a consequências catastróficas'
    },
    {
      name: 'Refatorizar',
      good: 'A qualidade do código vai melhorar',
      bad: 'Pode ficar preso em regressões'
    },
    {
      name: 'Usar %t',
      good: 'Vai parecer ter mais bom gosto',
      bad: 'As pessoas podem pensar que está a exibir-se'
    },
    {
      name: 'Mudar de trabalho',
      good: 'Quando é hora de largar, largue',
      bad: 'Com esta economia, o próximo trabalho pode não ser melhor'
    },
    {
      name: 'Contratar alguém',
      good: 'Esta pessoa pode ter verdadeiro potencial',
      bad: 'Esta pessoa sabe sequer programar?'
    },
    {
      name: 'Entrevista',
      good: 'A pessoa entrevistadora está bem-disposta hoje',
      bad: 'Está irritada e pode descarregar em si'
    },
    {
      name: 'Entregar a demissão',
      good: 'A empresa encontrou alguém mais barato e capaz',
      bad: 'Com esta economia, o próximo trabalho pode não ser melhor'
    },
    {
      name: 'Pedir aumento',
      good: 'O chefe está bem-disposto hoje',
      bad: 'A empresa está a considerar despedimentos'
    },
    {
      name: 'Fazer horas extra esta noite',
      good: 'A noite é quando os programadores estão mais alerta',
      bad: 'Já está esgotado, descanse',
      weekend: true
    },
    {
      name: 'Exibir-se perante o crush',
      good: 'A sua imagem melhora um pouco',
      bad: 'Será percebido imediatamente',
      weekend: true
    },
    {
      name: 'Tirar cartas no Wikimoe',
      good: 'É provável que consiga a carta que quer',
      bad: 'Cartas inúteis vão cair do céu',
      weekend: true
    },
    {
      name: 'Escrever um artigo técnico',
      good: 'Uma nova obra-prima de conteúdo está prestes a nascer',
      bad: 'O seu artigo pode ser copiado',
      weekend: true
    },
    {
      name: 'Dar a uma variável o nome "%v"',
      good: 'O nome da variável parece inesperadamente fofo',
      bad: 'Nunca mais vai referenciar esta variável'
    },
    {
      name: 'Escrever um método com mais de %l linhas',
      good: 'O seu código está organizado o suficiente para sobreviver ao tamanho',
      bad: 'O código tornar-se-á uma confusão incompreensível'
    },
    {
      name: 'Commit de código',
      good: 'A hipótese de conflitos está no mínimo',
      bad: 'Uma montanha de conflitos fá-lo-á duvidar do calendário'
    },
    {
      name: 'Rever código',
      good: 'É muito mais provável encontrar problemas importantes',
      bad: 'Não vai encontrar nada e perderá a sessão inteira'
    },
    {
      name: 'Participar numa reunião',
      good: 'Uma pequena sesta longe do código faz bem à saúde',
      bad: 'Pode acabar a assumir a culpa'
    },
    {
      name: 'Jogar Overwatch',
      good: 'Vai sentir-se abençoado pelos deuses',
      bad: 'Vai ser completamente derrotado',
      weekend: true
    },
    {
      name: 'Deploy à noite',
      good: 'A noite é quando os programadores estão mais alerta',
      bad: 'Já gastou toda a energia durante o dia'
    },
    {
      name: 'Corrigir problemas',
      good: 'O seu instinto para problemas está invulgarmente apurado hoje',
      bad: 'Vai criar mais problemas do que corrige'
    },
    {
      name: 'Revisão de design',
      good: 'A revisão tornar-se-á uma verdadeira sessão de ideias',
      bad: 'Todos ficarão exaustos e nada útil acontecerá'
    },
    {
      name: 'Revisão de requisitos',
      good: 'Este requisito parece fácil',
      bad: 'A empresa quer uma pele de app que mude com a capa do telefone'
    },
    {
      name: 'Ler blogs',
      good: 'As histórias de hoje valem a pena',
      bad: 'A blogosfera está cheia de energia negativa hoje',
      weekend: true
    },
    {
      name: 'Navegar por sites de anime',
      good: 'Precisa mesmo de uma razão?',
      bad: 'A secção de comentários está cheia de guerreiros do teclado',
      weekend: true
    },
    {
      name: 'Jogar MapleStory Online',
      good: 'Pode conseguir uma configuração divina de 25 estrelas',
      bad: 'A menos que queira partir o computador',
      weekend: true
    }
  ],
  specials: [
    {
      date: 20140214,
      type: 'bad',
      name: 'Ficar com a sua cara-metade',
      description:
        'O Dia dos Namorados castiga solteiros e recompensa casais.'
    }
  ],
  tools: [
    'Programar no Eclipse',
    'Escrever documentos no MS Office',
    'Programar no Notepad',
    'Windows 8',
    'Linux',
    'macOS',
    'Internet Explorer',
    'Dispositivo Android',
    'Dispositivo iOS'
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
    'Água',
    'Chá',
    'Chá preto',
    'Chá verde',
    'Café',
    'Chá com leite',
    'Cola',
    'Leite fresco',
    'Leite de soja',
    'Sumo',
    'Refrigerante de fruta',
    'Água com gás',
    'Bebida desportiva',
    'Iogurte',
    'Álcool'
  ]
}
