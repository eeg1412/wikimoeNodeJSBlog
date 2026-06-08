export default {
  title: 'Calendario de fortuna del programador',
  loading: 'Calculando la suerte de hoy...',
  goodTitle: 'Conviene',
  badTitle: 'Evita',
  seatDirectionLabel: 'Dirección del asiento:',
  seatDirectionText:
    'Mira hacia {direction} mientras programas para encontrar menos problemas.',
  drinkLabel: 'Bebida del día:',
  goddessLabel: 'Afinidad con tu crush:',
  todayText: 'Hoy es {week}, {day}/{month}/{year}',
  drinkSeparator: ', ',
  weeks: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  directions: [
    'Norte',
    'Noreste',
    'Este',
    'Sureste',
    'Sur',
    'Suroeste',
    'Oeste',
    'Noroeste'
  ],
  activities: [
    {
      name: 'Escribir pruebas unitarias',
      good: 'Las pruebas unitarias reducirán errores',
      bad: 'Las pruebas unitarias ralentizarán tu ritmo de desarrollo'
    },
    {
      name: 'Ducharte',
      good: 'Ya han pasado unos días, ¿no?',
      bad: 'Podrías lavar también tu inspiración de diseño',
      weekend: true
    },
    {
      name: 'Hacer ejercicio',
      good: 'Hora de estirar esos músculos rígidos',
      bad: 'Quemarás poca energía y comerás aún más',
      weekend: true
    },
    {
      name: 'Fumar',
      good: 'Puede despertarte, aunque fumar sigue siendo dañino',
      bad: 'Fumar es malo para la salud',
      weekend: true
    },
    {
      name: 'Deploy de día',
      good: 'Un lanzamiento diurno es seguro hoy',
      bad: 'Puede tener consecuencias catastróficas'
    },
    {
      name: 'Refactorizar',
      good: 'La calidad del código mejorará',
      bad: 'Puedes quedarte atrapado en regresiones'
    },
    {
      name: 'Usar %t',
      good: 'Parecerás tener más estilo',
      bad: 'La gente puede pensar que presumes'
    },
    {
      name: 'Cambiar de trabajo',
      good: 'Suelta cuando sea el momento de soltar',
      bad: 'Con esta economía, el siguiente trabajo quizá no sea mejor'
    },
    {
      name: 'Contratar a alguien',
      good: 'Esta persona puede tener potencial real',
      bad: '¿Esta persona sabe programar?'
    },
    {
      name: 'Entrevista',
      good: 'La persona entrevistadora está de buen humor hoy',
      bad: 'Está molesta y puede desahogarse contigo'
    },
    {
      name: 'Presentar tu renuncia',
      good: 'La empresa encontró a alguien más barato y capaz',
      bad: 'Con esta economía, el siguiente trabajo quizá no sea mejor'
    },
    {
      name: 'Pedir un aumento',
      good: 'El jefe está de buen humor hoy',
      bad: 'La empresa está considerando despidos'
    },
    {
      name: 'Trabajar horas extra esta noche',
      good: 'La noche es cuando los programadores están más alerta',
      bad: 'Ya estás agotado, descansa',
      weekend: true
    },
    {
      name: 'Presumir ante tu crush',
      good: 'Tu imagen mejora un poco',
      bad: 'Te descubrirán al instante',
      weekend: true
    },
    {
      name: 'Sacar cartas en Wikimoe',
      good: 'Es probable que consigas la carta que quieres',
      bad: 'Lloverán cartas inútiles del cielo',
      weekend: true
    },
    {
      name: 'Escribir un post técnico',
      good: 'Está por nacer una nueva obra maestra de contenido',
      bad: 'Tu post puede ser copiado',
      weekend: true
    },
    {
      name: 'Nombrar una variable "%v"',
      good: 'El nombre de la variable se ve inesperadamente adorable',
      bad: 'Nunca volverás a referenciar esta variable'
    },
    {
      name: 'Escribir un método de más de %l líneas',
      good: 'Tu código está lo bastante ordenado para sobrevivir a esa longitud',
      bad: 'El código se convertirá en algo imposible de entender'
    },
    {
      name: 'Commit de código',
      good: 'La probabilidad de conflictos está en su mínimo',
      bad: 'Una montaña de conflictos te hará dudar del calendario'
    },
    {
      name: 'Revisar código',
      good: 'Es mucho más probable que detectes problemas importantes',
      bad: 'No encontrarás nada y perderás toda la sesión'
    },
    {
      name: 'Asistir a una reunión',
      good: 'Una pequeña siesta lejos del código es buena para la salud',
      bad: 'Podrías acabar cargando con la culpa'
    },
    {
      name: 'Jugar Overwatch',
      good: 'Te sentirás bendecido por los dioses',
      bad: 'Te arrasarán',
      weekend: true
    },
    {
      name: 'Deploy de noche',
      good: 'La noche es cuando los programadores están más alerta',
      bad: 'Ya gastaste toda tu energía durante el día'
    },
    {
      name: 'Corregir problemas',
      good: 'Tu olfato para los problemas está especialmente fino hoy',
      bad: 'Crearás más problemas de los que corriges'
    },
    {
      name: 'Revisión de diseño',
      good: 'La revisión se convertirá en una verdadera lluvia de ideas',
      bad: 'Todos estarán agotados y no saldrá nada útil'
    },
    {
      name: 'Revisión de requisitos',
      good: 'Este requisito parece fácil',
      bad: 'La empresa quiere una piel de app que cambie con la funda del teléfono'
    },
    {
      name: 'Leer blogs',
      good: 'Las historias de hoy merecen la pena',
      bad: 'La blogosfera está llena de energía negativa hoy',
      weekend: true
    },
    {
      name: 'Visitar sitios de anime',
      good: '¿De verdad necesitas una razón?',
      bad: 'La sección de comentarios está llena de guerreros del teclado',
      weekend: true
    },
    {
      name: 'Jugar MapleStory Online',
      good: 'Puedes conseguir una configuración divina de 25 estrellas',
      bad: 'A menos que quieras romper tu ordenador',
      weekend: true
    }
  ],
  specials: [
    {
      date: 20140214,
      type: 'bad',
      name: 'Estar con tu pareja',
      description:
        'San Valentín castiga a quienes están solteros y premia a las parejas.'
    }
  ],
  tools: [
    'Programar en Eclipse',
    'Escribir documentos en MS Office',
    'Programar en Notepad',
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
    'Agua',
    'Té',
    'Té negro',
    'Té verde',
    'Café',
    'Té con leche',
    'Cola',
    'Leche fresca',
    'Leche de soja',
    'Zumo',
    'Refresco de frutas',
    'Agua con gas',
    'Bebida deportiva',
    'Yogur',
    'Alcohol'
  ]
}
