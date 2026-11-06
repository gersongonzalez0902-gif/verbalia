/**
 * Léxico, el búho bibliotecario · Repertorio de intervenciones breves.
 * Solo aparece en momentos clave y nunca interrumpe una partida.
 */

export const TINTA = {
  name: "Léxico",
  role: "búho bibliotecario del Archipiélago",
};

export interface LexicoLine {
  id: string;
  text: string;
}

/** Bienvenida en el onboarding (paso a paso). */
export const LEXICO_ONBOARDING: Record<string, string> = {
  welcome:
    "¡Bienvenido al Archipiélago de las Palabras! Yo soy Léxico, guardián de este mapa. Aterrizar aquí ya te hace explorador.",
  name: "Los mapas antiguos dicen que cada explorador merece un nombre. ¿Cómo te llamamos en la bitácora?",
  gender: "Los rangos del viaje se escriben de mil maneras: dime cómo prefieres el tuyo y afino la bitácora.",
  avatar: "Elige la compañía de tu viaje. Yo ya tengo plumas de sobra.",
  goal: "Todo viaje tiene rumbo. El tuyo nos ayudará a recomendarte sesiones.",
  experience: "Sin trampas: no pasa nada por empezar desde la orilla. Adaptaremos la dificultad a tu ritmo.",
  theme: "Las lechuzas preferimos la noche, pero tú eliges. Podrás cambiarlo siempre en Ajustes.",
  placement:
    "Es hora de la prueba de faro: ocho preguntas para calibrar tu nivel. Si prefieres, sáltala y empezamos suave.",
};

/** Saludos del dashboard según el estado del jugador. */
export const LEXICO_GREETINGS: {
  id: string;
  condition: (ctx: { streak: number; xpToday: number; dailyGoal: number; hasErrors: number; dueCards: number }) => boolean;
  text: (ctx: { name: string; streak: number; dueCards: number }) => string;
}[] = [
  {
    id: "g-goal-hero",
    condition: (c) => c.xpToday >= c.dailyGoal * 2,
    text: () =>
      "Objetivo cumplido y por partida doble: el faro ha encendido todos sus anillos. Hoy has navegado más lejos que el mapa.",
  },
  {
    id: "g-goal-done",
    condition: (c) => c.xpToday >= c.dailyGoal,
    text: () => "¡Objetivo diario cumplido! El Archipiélago te da las buenas noches… o las buenas tardes. Tú mandas.",
  },
  {
    id: "g-goal-close",
    condition: (c) => c.xpToday >= c.dailyGoal * 0.7,
    text: (c) => `${c.name}, rozas ya el objetivo del día: un empujón más y el faro se enciende hasta mañana.`,
  },
  {
    id: "g-goal-half",
    condition: (c) => c.xpToday >= c.dailyGoal * 0.4,
    text: () =>
      "A mitad de camino del objetivo. Los cartógrafos ya repasan en tinta fresca la parte que has ganado hoy.",
  },
  {
    id: "g-goal-start",
    condition: (c) => c.xpToday >= c.dailyGoal * 0.15,
    text: () => "Primeras gotas de XP en la bitácora: el día acaba de estrenar tinta. Sigue escribiéndolo.",
  },
  {
    id: "g-due-jungle",
    condition: (c) => c.dueCards >= 15,
    text: (c) =>
      `El jardín se ha vuelto selva: ${c.dueCards} tarjetas piden riego. Toma la manguera con calma, de una en una.`,
  },
  {
    id: "g-due-orchard",
    condition: (c) => c.dueCards >= 9,
    text: (c) =>
      `Huerto copado: ${c.dueCards} tarjetas esperan su turno. Cinco minutos de manguera y el jardín respira.`,
  },
  {
    id: "g-due-cards",
    condition: (c) => c.dueCards >= 5,
    text: (c) => `El jardín tiene ${c.dueCards} tarjetas esperando riego. Las palabras son plantas: responden a la constancia.`,
  },
  {
    id: "g-errors-heavy",
    condition: (c) => c.hasErrors >= 15,
    text: () =>
      "Quince tretas o más acumuladas en el cuaderno. Consejo de bibliotecaria: empieza por las más viejas, que ya maduraron.",
  },
  {
    id: "g-errors-pile",
    condition: (c) => c.hasErrors >= 10,
    text: () =>
      "El cuaderno de errores engorda, y eso es buena señal de viaje. Corrige dos o tres y vuelve a mirar el mar.",
  },
  {
    id: "g-errors",
    condition: (c) => c.hasErrors >= 5,
    text: () => "Tu cuaderno de errores se está llenando. No es mala señal: es exactamente ahí donde más se aprende.",
  },
  {
    id: "g-streak-month",
    condition: (c) => c.streak >= 30,
    text: (c) =>
      `Un mes entero de racha, ${c.name}. Las constelaciones del Archipiélago ya se orientan con tu faro.`,
  },
  {
    id: "g-streak-twin",
    condition: (c) => c.streak >= 14,
    text: (c) => `Dos semanas de racha: ${c.streak} días. Las mareas sincronizan su reloj contigo.`,
  },
  {
    id: "g-streak-week",
    condition: (c) => c.streak >= 7,
    text: (c) => `Racha de ${c.streak} días: una semana completa. Las velas ya saben tu nombre de pila.`,
  },
  {
    id: "g-streak",
    condition: (c) => c.streak >= 3,
    text: (c) => `Racha de ${c.streak} días, ${c.name}. Las mareas respetan tu constancia.`,
  },
  {
    id: "g-comeback",
    condition: (c) => c.streak === 1,
    text: () =>
      "Ayer volviste a zarpar: toda racha empieza con un solo día, y el faro ya memorizó tu regreso.",
  },
  {
    id: "g-streak-two",
    condition: (c) => c.streak === 2,
    text: () =>
      "Dos días seguidos: el impulso se nota. Tres es la marea que falta para que el Archipiélago te cuente entre los suyos.",
  },
  {
    id: "g-dawn",
    condition: () => new Date().getHours() < 6,
    text: (c) =>
      `Madrugada, ${c.name}: ni las gaviotas han despertado y ya mueves el mapa. Las lechuzas lo aprobamos.`,
  },
  {
    id: "g-morning",
    condition: () => {
      const h = new Date().getHours();
      return h >= 6 && h < 13;
    },
    text: (c) =>
      `Buenos días, ${c.name}. El Archipiélago huele a tinta fresca y a plan: las mañanas son de los valientes.`,
  },
  {
    id: "g-afternoon",
    condition: () => {
      const h = new Date().getHours();
      return h >= 13 && h < 20;
    },
    text: () =>
      "Buenas tardes. Las olas de la siesta son perfectas para una sesión corta: cinco minutos y a lo tuyo.",
  },
  {
    id: "g-evening",
    condition: () => new Date().getHours() >= 20,
    text: () =>
      "Buenas noches. Los mapas se dibujan mejor con lámpara: una sesión serena antes de que el faro se quede solo.",
  },
  {
    id: "g-warm",
    condition: () => true,
    text: (c) => `Hola de nuevo, ${c.name}. Una sesión de tres minutos basta para que el mapa se mueva un poco.`,
  },
];

/** Comentarios de Léxico en la pantalla de resultados. Cada franja tiene un
 * repertorio: la misma exactitud nunca cansa con la misma frase. */
function pick<T>(pool: T[]): T {
  return pool[Math.floor(Math.random() * pool.length)];
}

export function lexicoResultQuip(accuracy: number | null, mode: string): string {
  if (mode === "review") {
    return accuracy !== null && accuracy >= 0.8
      ? pick([
          "Los errores de hoy son los aciertos de mañana. Buen trabajo de corrección.",
          "Corregir es la parte aburrida que hace a los buenos. El cuaderno brilla limpio.",
          "Eso es cerrar cuentas pendientes con estilo. El faro se apaga tranquilo.",
          "Cuentas saldadas con elegancia: el cuaderno vuelve a estar impecable, página a página.",
          "Corregir sin miedo es de navegantes con criterio. Enhorabuena en el repaso.",
          "El faro te ha visto corregir con pulso firme: esos errores ya no volverán a engañarte.",
          "Repaso de nivel: donde otros borran, tú has reescrito.",
          "Buen trabajo: los escollos de ayer ya son faros pequeños que has encendido tú.",
          "Repasando así, el cuaderno acabará en la vitrina de rarezas de la biblioteca.",
          "Has domado a las palabras tramposas. Que conste en acta: el cuaderno brilla.",
          "Repaso impecable: las gaviotas aplauden aleteando desde la costa.",
          "El mar de errores se seca a base de repasos como este.",
          "Bien: has vuelto la vista atrás sin marearte. Pocos navegantes lo logran.",
        ])
      : pick([
          "Repasar duele menos que repetir el error. Vuelve al cuaderno cuando quieras.",
          "El cuaderno no juzga: espera. Las segundas lecturas son mejores amigas.",
          "Marea baja en el repaso: mañana estas mismas palabras te saludarán distinto.",
          "Repasar cansa menos que tropezar dos veces con la misma piedra. El cuaderno espera.",
          "No es un expediente: es un mapa del tesoro de lo que falta. Mañana se excava.",
          "Los repasos valen más por lo que enseñan que por lo que puntúan. La marea sube despacio.",
          "El faro no juzga la nota del repaso: ilumina para que mañana veas mejor.",
          "Corregir es silbar bajito: no suena mucho, pero mantiene el rumbo.",
          "Las palabras falladas hoy te esperarán más mansitas la próxima vez.",
          "Un repaso flojo también quita óxido del casco. La próxima bordada será más limpia.",
          "Faro encendido y cuaderno abierto: sigues exactamente en la ruta correcta.",
          "Marea baja hoy, pero el barco sigue a flote: eso ya es navegar bien.",
        ]);
  }
  if (accuracy === null) {
    return pick([
      "El jardín ya está ajustando el calendario de cada tarjeta. Volverá a preguntarte justo a tiempo.",
      "He anotado tus valoraciones en el libro de riego. Las palabras saben esperar.",
      "Sesión de jardinería registrada. Las raíces crecen justo cuando nadie mira.",
      "El calendario del jardín ya toma nota: las palabras florecen a su ritmo, no al nuestro.",
      "Valorarte con honestidad es el abono secreto del jardín. He apuntado la sesión.",
      "Otra ronda de riego registrada: las raíces trabajan mientras tú descansas.",
      "El jardín agradece la visita más que la prisa: las flores saben esperar su hora.",
      "Tarjetas regadas, bitácora al día: las lechuzas llevamos siglos haciendo esto.",
      "Buen riego: el jardín sabe que puede confiar en ti, aunque tardes en volver.",
      "Las palabras esperan sin prisa: tienen la paciencia del papel y de la tinta.",
      "No se ve, pero bajo la tierra del jardín acaban de pasar cosas muy serias.",
      "Regar hoy es ahorrarse olvidos mañana: la aritmética secreta del jardín.",
    ]);
  }
  if (accuracy >= 0.9) {
    return pick([
      "Impecable. El faro principal te ha visto desde aquí.",
      "Nueve de cada diez o más: los cartógrafos tendrán que redibujar tu frontera.",
      "Si esto fuera un viaje, ya habrías descubierto la isla siguiente. Bravísimo.",
      "Nueve de cada diez o más: el faro principal te sigue con la mirada, orgulloso.",
      "Navegación casi perfecta: los cartógrafos piden tu autógrafo.",
      "Si sigues así, habrá que ampliar el mapa: no caben más fronteras tuyas.",
      "Lechuza certificada: precisión de biblioteca. Enhorabuena.",
      "Diez menos uno… y ese uno ya lo tengo apuntado para que no se te escape.",
      "Ola tras ola, acierto tras acierto: el mar te está tomando cariño.",
      "Con este pulso, la tinta se estira sola. Sesión de manual.",
      "Los faros secundarios aprenden de ti. Casi pleno: bravo.",
      "Puntería de albatros: ojos que no fallan y marea que no distrae.",
      "El Archipiélago entero ha oído el repique de tus aciertos.",
    ]);
  }
  if (accuracy >= 0.7) {
    return pick([
      "Buen pulso. Con un poco más de ritmo, la región entera será tuya.",
      "Viento a favor. Solo un par de escollos entre tú y la navegación perfecta.",
      "Siete o más: la bitácora registra buena mar. Las explicaciones te esperan abajo.",
      "Buen viento y buena mar: un par de escollos, nada que una bordada no arregle.",
      "Siete o más: navegación digna de marco, vidrio y firma en la biblioteca.",
      "Viento a favor casi constante: apunta los fallados y esta nota se queda corta.",
      "Buen pulso de pluma: las explicaciones de abajo guardan la clave de lo que faltó.",
      "Sólido: el barco apenas cabeceó. Mañana, con calma, a por el pleno.",
      "Navegación limpia con algún salpicón: salpicar también enseña.",
      "Tres cuartos de faro encendido: el último cuarto se enciende solo con el hábito.",
      "Buena sesión: el mapa gana color y el cuaderno pierde una página.",
      "Más brújula que catalejo: rumbo claro y aciertos a montones.",
      "Siete de cada diez boyas bien pasadas: los guardacostas aplauden.",
    ]);
  }
  if (accuracy >= 0.5) {
    return pick([
      "Mitad y mitad: el terreno exacto donde más se aprende. Toca reintentar lo fallado.",
      "Ni tormenta ni calma: mar de entrenamiento. Los errores de hoy valen oro mañana.",
      "La mitad del tesoro ya es tuyo. El resto está en el cuaderno, esperándote.",
      "Mitad del faro encendido: las explicaciones de abajo encenderán el resto.",
      "Aciertos a proa, errores a estribor: buen equilibrio para maniobrar y aprender.",
      "Navegable con avisos: lee las explicaciones y la próxima marejada te parecerá un charco.",
      "Sesión de las que dejan poso: reintenta lo fallado y esto pasa de medio faro a faro entero.",
      "El mapa se rellena por mitades: así se dibujaron todos los mapas viejos.",
      "Marea a media asta: nada que un repaso de tres minutos no suba entera.",
      "Aprendizaje de verdad: lo que fallaste hoy ya tiene fecha de reencuentro.",
      "Cinco sobre diez: el oleaje justo para ejercitar el remo. Sigue así.",
      "La mitad del recorrido con la vela bien alta. El viento hará el resto.",
    ]);
  }
  return pick([
    "Día de marea baja. Respira, lee las explicaciones y vuelve: el Archipiélago no se mueve de sitio.",
    "Hasta las gaviotas fallan sus aterrizajes. Lo importante es que has salido a navegar.",
    "Los mejores capitanes empezaron zozobrando. Repasa el cuaderno y verás la marea subir.",
    "Hasta los albatros caen en picado alguna vez: la gracia está en remontar.",
    "Los mapas nuevos empiezan en borrador: hoy has hecho un boceto muy útil.",
    "Mala mar no significa mal navegante: el clima de hoy ya está fichado en el cuaderno.",
    "Respira: cada capitán tiene su primera tormenta, y esta ha sido la tuya.",
    "Naufragio pequeño, aprendizaje grande: las tablillas de este barco flotan siempre.",
    "La tinta de hoy se ha corrido un poco, pero el papel sigue entero y la bitácora abierta.",
    "Cero drama: las palabras que hoy se resistieron ya están fichadas una a una.",
    "Sembrar con temporal es de valientes: mañana la mar estará más plana para ti.",
  ]);
}

/** Consejos puntuales (se muestran como máximo una vez al día). */
export const LEXICO_TIPS: LexicoLine[] = [
  { id: "tip-srs", text: "Truco de bibliotecaria: en el jardín, sé sincero al valorarte. Fin de cuento." },
  { id: "tip-combo", text: "Los combos suben el XP, pero un error no rompe nada importante. Arriesgar es gratis aquí." },
  { id: "tip-errors", text: "Todo lo que fallas va a tu cuaderno de errores. Reintentarlo vale XP casi completo." },
  { id: "tip-offline", text: "¿Sabías que VerbalIA funciona sin conexión? El barco sigue navegando sin internet." },
  { id: "tip-streak", text: "La racha tiene escudos: si un día no puedes, la misión semanal te protege. Sin ansiedad." },
  { id: "tip-dictado", text: "En el Dictado del Faro puedes escuchar tres veces. La segunda escucha oye mejor que la primera: bosteza menos." },
  { id: "tip-minuto", text: "En el Reto del Minuto no se borra ni se juzga: después llegará tu propia revisión con criterios. Primero, fluye." },
  { id: "tip-matices", text: "En los Ecos del Puerto, la puntuación y las muletillas delatan la intención antes que las palabras." },
  { id: "tip-night", text: "¿Juegas de noche? Activa el modo lectura nocturna en Ajustes: el Archipiélago baja la luz por ti." },
  { id: "tip-lectura", text: "En la Lectura Inmersiva puedes escuchar el texto mientras sigues las líneas resaltadas. Los oídos también aprenden a leer." },
  { id: "tip-historias", text: "En las Historias Ramificadas no hay malas decisiones: hay ramas. Explorar todas es parte del juego." },
  { id: "tip-refranes", text: "Los refranes viajan de país en país cambiando de ropa. El mismo consejo, distinto acento: fíjate en la etiqueta de región." },
  { id: "tip-tildes", text: "Truco del Tribunal: las esdrújulas siempre llevan tilde, sin excepción. Empieza por ahí." },
  { id: "tip-puentes", text: "En los Puentes de Palabras, lee la oración completa en voz baja antes de tocar: el oído oye los huecos antes que la vista." },
  { id: "tip-export", text: "Cada tanto, exporta tu copia desde Perfil. Los náufragos serios llevan chaleco salvavidas de respaldo." },
  { id: "tip-sonido", text: "¿Te molesta el tintineo del Archipiélago? En Ajustes puedes silenciar los efectos sin apagar la voz del faro." },
  { id: "tip-sinonimos", text: "En la Batalla de Sinónimos, sinónimo no significa «palabra igual»: significa «palabra que cabe en el mismo hueco sin romper el sentido»." },
  { id: "tip-sprint", text: "En el Sprint de Vocabulario, la primera definición que descartes suele ser la trampa favorita del redactor. Lee dos, elige una." },
  { id: "tip-trivia", text: "En la Trivia Relámpago, la palabra destacada manda: fíate del contexto, no del parecido entre opciones." },
  { id: "tip-puzzle-sujeto", text: "En los puzzles de sintaxis, busca primero el sujeto y el verbo: el resto de la oración se engancha a ellos como vagones." },
  { id: "tip-cloze-hueco", text: "En el Cloze, el hueco no quiere la palabra más bonita: quiere la única que encaja sin romper el sentido." },
  { id: "tip-conectores", text: "En el Constructor de Párrafos, los conectores (pero, entonces, además) son las señales de tráfico del texto." },
  { id: "tip-sin-error", text: "En la Caza de Errores hay frases sin trampa: atreverse a decir «aquí no hay error» también es parte de la caza." },
  { id: "tip-ma-griegas", text: "Truco de biblioteca: las palabras griegas terminadas en -ma suelen ser masculinas —el problema, el tema, el clima—. Excepciones hay, pero pocas." },
  { id: "tip-coma-aire", text: "La coma marca pausas, no adornos: si al leer en voz alta no respiras, no va coma." },
  { id: "tip-mayusculas-faro", text: "Los nombres propios llevan mayúscula incluso en mitad de la frase: el faro de Alejandría no es un faro cualquiera." },
  { id: "tip-dictado-volumen", text: "Si el Dictado del Faro llega en silencio, revisa el volumen del dispositivo: a veces el faro calla por cortesía." },
  { id: "tip-misiones-rotan", text: "Las misiones diarias rotan cada madrugada: mirarlas antes de la primera sesión es leer el parte meteorológico del XP." },
  { id: "tip-misiones-cobran", text: "Las misiones se completan solas mientras juegas: el XP del premio llega sin papeleo, como marea de fondo." },
  { id: "tip-escudo-semanal", text: "La misión semanal regala un Escudo de Racha: cinco días de juego y tu racha viaja blindada." },
  { id: "tip-objetivo-velas", text: "¿Día flojo? Baja el objetivo diario en Ajustes: los buenos capitanes ajustan las velas, no las rompen." },
  { id: "tip-niveles-mapa", text: "Subir de nivel reordena el mapa: cada tanto, date una vuelta para ver qué isla nueva ha asomado." },
  { id: "tip-estadistica-floja", text: "En Estadísticas vive tu habilidad más floja: jugar en su región sabe doble, porque sana." },
  { id: "tip-coleccion-indice", text: "En la Colección, las tarjetas dominadas llevan su propia vitrina: no es vanidad, es el índice de tu biblioteca." },
  { id: "tip-logros-paciencia", text: "Los logros no caducan: llegan cuando llegan. La biblioteca nunca ha corrido detrás de nadie." },
  { id: "tip-sesiones-cortas", text: "Aprender de golpe es como beberse el mar de un trago: apostar por sesiones cortas y frecuentes es el modo correcto de beber la marea." },
  { id: "tip-riego-diario", text: "El jardín agradece más cinco minutos diarios que una hora un domingo: la constancia riega mejor que el entusiasmo." },
  { id: "tip-alterna-habilidades", text: "Alternar habilidades —vocabulario, ortografía, escucha— cansa menos y fija más: el cerebro aborrece el carril único." },
  { id: "tip-dictado-ojos", text: "Antes de escribir un dictado, escucha una vez entera con los ojos cerrados: la segunda escucha oye con las manos." },
  { id: "tip-comprension-descarte", text: "En las preguntas de comprensión, descarta primero las opciones absurdas: dos velas menos y el rumbo se ve solo." },
  { id: "tip-minuto-esfuerzo", text: "En el Reto del Minuto, la meta de palabras premia el esfuerzo, no el talento: si fluyó, ya ganaste." },
  { id: "tip-refran-mercado", text: "Si un refrán no te suena, búscale la lógica al oficio o al mercado que menciona: casi todos nacieron regateando." },
  { id: "tip-antonimo-choca", text: "En la Batalla de Sinónimos, un antónimo no encaja: acompaña o choca. Si choca, descártalo sin piedad." },
  { id: "tip-sprint-respira", text: "El Sprint tiene reloj, pero no adrenalina obligatoria: respira, lee dos, dispara una." },
  { id: "tip-matices-intencion", text: "En los Ecos del Puerto pregúntate qué quiere el que habla: la intención pesa más que las palabras dichas." },
  { id: "tip-historias-eco", text: "En las Historias Ramificadas, tu primera elección dice quién eres; la segunda, qué aprendiste en la primera." },
  { id: "tip-silabas-chicle", text: "Truco del Tribunal: estira la palabra como un chicle y escucha por dentro la sílaba que duele: esa lleva la tilde." },
  { id: "tip-errores-viejos", text: "En el cuaderno de errores, empieza por los más viejos: maduran solos, pero nunca caducan." },
  { id: "tip-racha-metronomo", text: "La racha es un compás, no un latigazo: se pierde sin drama y se reconquista con un solo día de riego." },
  { id: "tip-texto-tamano", text: "En Ajustes el texto puede crecer hasta tamaño XL: los ojos también son navegantes y merecen buen trato." },
  { id: "tip-movimiento-calmo", text: "Si el balanceo del barco te marea, activa «reducir movimiento» en Ajustes: el mapa se queda quieto por ti." },
  { id: "tip-pwa-bolsillo", text: "Instala VerbalIA desde el navegador («Añadir a pantalla de inicio»): el Archipiélago cabe en un bolsillo." },
  { id: "tip-contexto-frases", text: "Las palabras en contexto se quedan a vivir; las sueltas se van con la primera marea. Aprende frases, no listas." },
  { id: "tip-frase-absurda", text: "Inventa una frase absurda con cada palabra nueva del jardín: el cerebro recuerda mejor aquello que le da risa." },
  { id: "tip-voz-alta", text: "Repetir en voz alta no es de locos: es de actores, de poetas y de estudiantes con futuro mar adentro." },
  { id: "tip-again-amable", text: "En el jardín, marcar «otra vez» no es fracasar: es decirle a la tarjeta «aún no nos conocemos bien»." },
  { id: "tip-descanso-marea", text: "¿Día de descanso? Para eso existen los escudos y las mareas bajas: descansar también es parte de la navegación." },
  { id: "tip-constancia-velitas", text: "En Estadísticas no mires los picos, mira la fila de días encendidos: la constancia es el gráfico más bonito." },
  { id: "tip-mapa-escaleras", text: "Las regiones se desbloquean por nivel: la curiosidad tiene recompensa, pero también escaleras. Pisa los peldaños con gusto." },
  { id: "tip-tarjetas-ritmo", text: "Las tarjetas nuevas por día se ajustan en Ajustes: ocho es un buen compás, pero tuya es la orquesta." },
  { id: "tip-siembra-cosecha", text: "Empareja el día: el jardín siembra, las misiones de región cosechan. Con dos sesiones ya tienes el arado completo." },
  { id: "tip-oidos-cuerdas", text: "Escucha despacio la frase difícil y repítela luego a tu ritmo: los oídos son cuerdas de guitarra, se afinan con el uso." },
  { id: "tip-bosque-desde-arriba", text: "En Lectura Inmersiva, lee el texto una vez entera antes de las preguntas: los bosques se entienden desde arriba, no árbol a árbol." },
  { id: "tip-mayusculas-grito", text: "Las mayúsculas no dan énfasis: escriben nombres. El énfasis lo ponen las palabras, no el tamaño de la letra." },
  { id: "tip-horario-fijo", text: "Ponle hora a tu sesión: la misma tinta, cada día, seca antes. Los hábitos son rachas con horario de faro." },
  { id: "tip-faro-ladrillos", text: "Un ejercicio difícil no es un enemigo: es un faro aún sin construir. Cada intento le añade un ladrillo." },
  { id: "tip-mapa-recorrer", text: "La gramática se aprende usándola, como las cartas de navegación: nadie memorizó un mapa, todos lo recorrieron." },
  { id: "tip-dictado-inesperado", text: "En el Dictado del Faro escribe lo que oigas, no lo que esperas: el faro no dicta por costumbre." },
  { id: "tip-placer-lento", text: "El español no se aprende con prisa: se aprende con tinta. Las prisas eran de los telegramas, que ya no existen." },
  { id: "tip-palabras-propias", text: "Usa la palabra nueva el mismo día que la riegas: las palabras abandonan el barco de quien no las invita a cenar." },
  { id: "tip-equilibrio-puertos", text: "Un día redondo toca tres puertos: el jardín, una misión y un paseo por el cuaderno. Ni más, ni menos." },
  { id: "tip-marea-postre", text: "Si solo te quedan dos minutos, riega tres tarjetas: el postre también cuenta como navegación." },
];

/** Frases de Léxico al llegar a cada región (una se elige al azar).
 * Claves = ids de región (ver `RegionId` en types). Listas para rotar sin repetir. */
export const TINTA_REGION_ARRIVALS: Record<string, string[]> = {
  bosque: [
    "Bienvenido al Bosque del Vocabulario: aquí hasta las setas saben sinonimia.",
    "El Bosque del Vocabulario. Respira: huele a musgo, a papel nuevo y a palabras a medio crecer.",
    "Has entrado en el Bosque: si te pierdes, sigue la senda de las palabras más gruesas.",
    "El Bosque te reconoce: los árboles murmuran definiciones a tu paso.",
  ],
  ciudad: [
    "Ciudad de la Gramática: cruza por los pasos de cebra sintácticos y no te saltes los conectores.",
    "Bienvenida a la Ciudad: aquí las oraciones circulan en fila y los semáforos son puntos y comas.",
    "La Ciudad abre sus puentes: cada cruce es una oración bien atada.",
    "Ojo en la Ciudad: los fragmentos sueltos pagan multa de sentido.",
  ],
  fortaleza: [
    "Fortaleza de la Ortografía: los muros se dibujan tilde a tilde.",
    "La Fortaleza recibe a su inspección: buen día para cazar grietas.",
    "Bienvenido a la Fortaleza: los errores escalan de noche; tú escalas de día.",
    "Fortaleza de la Ortografía: aquí una tilde vale más que un cañón.",
  ],
  biblioteca: [
    "Biblioteca Infinita: guarda silencio, que los párrafos están durmiendo.",
    "Bienvenido a la Biblioteca: los estantes se reordenan solos, pero prefieren que leas.",
    "La Biblioteca te registra con cariño: eres el primer libro nuevo del día.",
    "Biblioteca Infinita: si te pierdes, quédate perdido. Es la mejor página.",
  ],
  puerto: [
    "Puerto de las Voces: amarra bien, que aquí hasta las olas llevan acento.",
    "Bienvenido al Puerto: escucha con paciencia, que el mar dicta despacio.",
    "El Puerto iza bandera en tu honor: los dictados llegan con la marea.",
    "Puerto de las Voces: los ecos dicen lo que las letras callan.",
  ],
  torre: [
    "Torre de la Expresión: sube despacio, que las historias no tienen ascensor.",
    "Bienvenido a la Torre: desde arriba, hasta tus errores se ven pequeños.",
    "La Torre te presta una pluma; yo tengo de sobra. Escribe sin miedo.",
    "Torre de la Expresión: cada escalón, una frase tuya que no existía.",
  ],
};

/** Ánimos de Léxico para momentos señalados (nivel, rachas, misiones…).
 * Claves estables de evento; el consumidor elige una al azar o rota. */
export const TINTA_MILESTONES: Record<string, string[]> = {
  "level-up": [
    "¡Nivel nuevo! El faro ha subido de luz: el mapa entero lo nota.",
    "Subes de nivel: los cartógrafos abren una botella de tinta en tu honor.",
    "Nivel conseguido: las mareas te deben una reverencia.",
  ],
  "streak-7": [
    "Una semana de racha: las velas ya responden a tu nombre.",
    "Siete días seguidos: el calendario del barco te llama tripulación fija.",
    "Racha de siete: las constelaciones se ajustan a tu ritmo.",
  ],
  "streak-30": [
    "¡Un mes de racha! El Archipiélago te declara isla honoraria.",
    "Treinta días: hay noches en que la bitácora escribe sola.",
    "Mes completo de constancia: hasta las gaviotas siguen tu horario.",
  ],
  "mission-done": [
    "Misión cumplida: el XP ya viaja hacia tu barco.",
    "Misión cerrada con sello de biblioteca. Bien hecho.",
    "Otra misión cumplida: el mapa se colorea a mareas tuyas.",
  ],
  "region-unlock": [
    "Región desbloqueada: el mapa acaba de ganar una isla.",
    "Nueva isla a la vista: atraca con orgullo de navegante.",
    "Se desbloquea una región: las cartas náuticas ya la incluyen, en tinta fresca.",
  ],
  "garden-clear": [
    "Jardín al día: ni una tarjeta vencida. Las raíces agradecen el pulso.",
    "Riego completo: hoy el jardín no pide nada. Disfruta de la calma.",
    "Jardín en orden: pocas cosas huelen mejor que un huerto sin deudas.",
  ],
  "errors-cleared": [
    "Cuaderno de errores limpio: página nueva, tinta nueva.",
    "Errores corregidos: has pasado la escoba por la bodega del barco.",
    "Cuaderno en blanco otra vez: el silencio de las páginas es un aplauso.",
  ],
  "shield-earned": [
    "Escudo de racha conseguido: tu constancia ya lleva armadura.",
    "Escudo a bordo: una noche de tormenta no podrá contigo.",
    "Escudo ganado: las mareas fieras respetan ahora a tu racha.",
  ],
};
