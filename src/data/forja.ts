import type {
  ConectoresExercise,
  Exercise,
  IroniaExercise,
  MetaforasExercise,
  RegistroExercise,
  TitulosExercise,
} from "@/types";

/**
 * Pack «Forja del Escritor» · Etapa 4 · El Códice Infinito.
 *
 * Cinco formatos de estilo y retórica para la octava isla:
 * metáforas, registro lingüístico, conectores lógicos, ironía y
 * redundancias léxicas (la censura del editor).
 */

/* ============================ Forja de Metáforas ============================ */

const METAFORAS: Omit<MetaforasExercise, "id" | "type" | "cefr">[] = [
  {
    skill: "expresion",
    difficulty: 3,
    prompt: "Elige la imagen literaria que completa la metáfora.",
    stem: "Sus palabras fueron un ___ que calmó la tormenta del debate.",
    options: ["bálsamo", "conjunto de frases", "sintagma"],
    answerIndex: 0,
    explanation:
      "«Bálsamo» es la imagen: convierte las palabras en ungüento que sana. Las otras opciones son descripciones técnicas, sin figura.",
    tags: ["metáfora", "imagen"],
  },
  {
    skill: "expresion",
    difficulty: 2,
    prompt: "Elige la imagen literaria que completa la metáfora.",
    stem: "El tiempo es un ___ que nunca deja de correr.",
    options: ["dato del calendario", "río", "horario"],
    answerIndex: 1,
    explanation:
      "El río presta al tiempo su fluir irreversible: por eso «el tiempo es un río» es una metáfora clásica, no una simple etiqueta.",
    tags: ["metáfora", "clásica"],
  },
  {
    skill: "expresion",
    difficulty: 3,
    prompt: "Elige la imagen literaria que completa la metáfora.",
    stem: "A las ocho, las calles de la ciudad se llenan: son las ___ de la mañana por donde corre la gente.",
    options: ["venas", "calzadas", "vías de tráfico"],
    answerIndex: 0,
    explanation:
      "La metáfora del cuerpo convierte la ciudad en organismo y las calles en venas: la circulación de coches es la sangre.",
    tags: ["metáfora", "ciudad"],
  },
  {
    skill: "expresion",
    difficulty: 4,
    prompt: "Elige la imagen literaria que completa la metáfora.",
    stem: "La noche clavó ___ de plata en su manto.",
    options: ["farolas urbanas", "satélites", "alfileres"],
    answerIndex: 2,
    explanation:
      "«Alfileres de plata» convierte las estrellas en puntos brillantes prendidos en la tela de la noche: imagen pura, evocadora y luminosa.",
    tags: ["metáfora", "noche"],
  },
  {
    skill: "expresion",
    difficulty: 3,
    prompt: "Elige la imagen literaria que completa la metáfora.",
    stem: "La risa de los niños es un ___ que alegra todo el patio.",
    options: ["fenómeno acústico", "cascabel", "ruido elevado"],
    answerIndex: 1,
    explanation:
      "El cascabel aporta sonido claro y ligero, como la risa infantil: pequeña, metálica y alegre. «Ruido elevado» es medición, no imagen.",
    tags: ["metáfora", "sensaciones"],
  },
  {
    skill: "expresion",
    difficulty: 4,
    prompt: "Elige la imagen literaria que completa la metáfora.",
    stem: "El poeta forjó sus versos en el ___ de las noches en vela.",
    options: ["editor de textos", "yunque", "cuaderno de notas"],
    answerIndex: 1,
    explanation:
      "«Forjar» pide el yunque: el escritor como herrero que golpea el verso hasta darle forma. Es la metáfora del oficio, coherente de principio a fin.",
    tags: ["metáfora", "oficio"],
  },
  {
    skill: "expresion",
    difficulty: 5,
    prompt: "Elige la imagen literaria que completa la metáfora.",
    stem: "El mar guarda sus secretos en ___ de sal.",
    options: ["cofres", "botellas de plástico", "contenedores marinos"],
    answerIndex: 0,
    explanation:
      "El cofre evoca tesoro y misterio; «de sal» teje la imagen con el propio mar. Las botellas y los contenedores son restos, no guardan nada bello.",
    tags: ["metáfora", "mar"],
  },
  {
    skill: "expresion",
    difficulty: 3,
    prompt: "Elige la imagen literaria que completa la metáfora.",
    stem: "Las palabras del orador fueron ___ que encendieron al público.",
    options: ["chispas", "palabras con energía", "decibelios altos"],
    answerIndex: 0,
    explanation:
      "La chispa propaga el fuego: así el discurso enciende la emotividad del público. El resto describe el volumen o la energía sin figurar.",
    tags: ["metáfora", "oratoria"],
  },
  {
    skill: "expresion",
    difficulty: 4,
    prompt: "Elige la imagen literaria que completa la metáfora.",
    stem: "La abuela tenía manos de papel ___: suaves, con pliegues y siempre listas para contar algo.",
    options: ["de la piel humana", "arrugado", "con dedos y huesos"],
    answerIndex: 1,
    explanation:
      "«Papel arrugado» presta a la piel la textura del papel viejo: fino, doblado por los años. Es imagen táctil, no descripción anatómica.",
    tags: ["metáfora", "vejez"],
  },
  {
    skill: "expresion",
    difficulty: 4,
    prompt: "Elige la imagen literaria que completa la metáfora.",
    stem: "Los pensamientos se le enredaban como ___ trepadora.",
    options: ["hiedra", "una lista desordenada", "una sinapsis cerebral"],
    answerIndex: 0,
    explanation:
      "La hiedra crece y se enreda sin control: perfecta para los pensamientos que se atan unos con otros. La lista y la sinapsis clasifican, no imaginan.",
    tags: ["metáfora", "mente"],
  },
  {
    skill: "expresion",
    difficulty: 5,
    prompt: "Elige la imagen literaria que completa la metáfora.",
    stem: "La luna, ___ del cielo, velaba el sueño del pueblo.",
    options: ["un satélite natural", "un fanal", "un cuerpo celeste"],
    answerIndex: 1,
    explanation:
      "El fanal (farol de vidrio) transforma a la luna en lámpara vigilante: luz cálida y cuidadora. Las otras son etiquetas de astronomía.",
    tags: ["metáfora", "luna"],
  },
  {
    skill: "expresion",
    difficulty: 3,
    prompt: "Elige la imagen literaria que completa la metáfora.",
    stem: "La maestra sembró ___ en el aula; hoy, sus alumnos cosechan libros.",
    options: ["un temario completo", "semillas", "un listado de deberes"],
    answerIndex: 1,
    explanation:
      "Enseñar como sembrar y aprender como cosechar: la metáfora agrícola recorre la educación entera, del brote a la recolección.",
    tags: ["metáfora", "escuela"],
  },
];

/* ============================ Registro Correcto ============================ */

const REGISTRO: Omit<RegistroExercise, "id" | "type" | "cefr">[] = [
  {
    skill: "expresion",
    difficulty: 3,
    prompt: "Elige la versión adecuada a la situación.",
    context: "Mensaje a tu jefa pidiendo un día libre.",
    register: "formal",
    options: [
      "Le agradecería que valorara la posibilidad de que disfrute de un día de permiso mañana.",
      "Oye jefa, mañana no me apetece venir, ¿te parece?",
      "Solicitito el permiso de día libre que me corresponde como trabajador activo de esta empresa.",
    ],
    answerIndex: 0,
    explanation:
      "Cortesía y claridad sin exagerar: «le agradecería que valorara» es formal natural. La segunda es coloquial y desconsiderada; la tercera suena a burocracia inventada.",
    tags: ["registro", "formal"],
  },
  {
    skill: "expresion",
    difficulty: 2,
    prompt: "Elige la versión adecuada a la situación.",
    context: "Avisar a tu mejor amigo de que llegas tarde al cine.",
    register: "coloquial",
    options: [
      "Le comunico que mi llegada experimentará un retraso aproximado de veinte minutos.",
      "¡Tarda! Se me hizo el tuyano, ya voy volando, guardame la butaca.",
      "El evento cinematográfico dará inicio sin mi presencia momentánea.",
    ],
    answerIndex: 1,
    explanation:
      "Con un amigo cercano, el registro coloquial es el natural: vocativos, aumentativos y humor. Las otras dos son parodias de formalidad fuera de lugar.",
    tags: ["registro", "coloquial"],
  },
  {
    skill: "expresion",
    difficulty: 3,
    prompt: "Elige la versión adecuada a la situación.",
    context: "Correo a un profesor de universidad pidiendo bibliografía.",
    register: "formal",
    options: [
      "Estimado profesor: le escribo para solicitarle, si es posible, algunas referencias bibliográficas sobre el tema. Agradezco de antemano su tiempo.",
      "Hola profe, mándame unos PDFs de esos que te gustan, que me urge.",
      "Se me informa que requiero la bibliografía. Favor de remitirla a la brevedad.",
    ],
    answerIndex: 0,
    explanation:
      "Saludo apropiado, petición conditional («si es posible») y agradecimiento final: el correo formal ideal con un profesor.",
    tags: ["registro", "correo"],
  },
  {
    skill: "expresion",
    difficulty: 2,
    prompt: "Elige la versión adecuada a la situación.",
    context: "Dedicatoria divertida en el regalo de tu hermana menor.",
    register: "coloquial",
    options: [
      "Para mi estimada hermana, con el más sincero de mis afectos fraternales.",
      "Pa ti, pesadita: este regalo y un abrazo del tamaño de tu carrete.",
      "Se hace entrega del presente adjunto en señal de aprecio familiar.",
    ],
    answerIndex: 1,
    explanation:
      "Las dedicatorias entre hermanos se escriben como se habla: juego de palabras y cariño con humor. Lo formal aquí sonaría a documento notarial.",
    tags: ["registro", "dedicatoria"],
  },
  {
    skill: "expresion",
    difficulty: 3,
    prompt: "Elige la versión adecuada a la situación.",
    context: "Nota en la puerta del vecino: la música alta no deja dormir.",
    register: "neutro",
    options: [
      "Vecino: la música hasta la madrugada no deja descansar. ¿Podríamos buscar un horario que nos sirva a los dos? Gracias por leer.",
      "Oye, si no bajas esa música te vas a enterar de lo que es bueno.",
      "Estimado señor vecino: me permito poner en su conocimiento que la emisión sonora procedente de su domicilio excede los límites de decibelios permitidos.",
    ],
    answerIndex: 0,
    explanation:
      "Con un vecino desconocido, el neutro cortés gana: expone el problema, pide acuerdo y agradece. Ni agresividad coloquial ni frialdad administrativa.",
    tags: ["registro", "convivencia"],
  },
  {
    skill: "expresion",
    difficulty: 2,
    prompt: "Elige la versión adecuada a la situación.",
    context: "Mensaje al grupo de senderismo proponiendo una ruta.",
    register: "neutro",
    options: [
      "¡Eh, ganado! El domingo me vais a seguir montaña arriba o os arreo.",
      "Hola a todos: propongo la ruta del faro el domingo a las nueve. ¿Os parece bien ese horario? Podemos compartir coches.",
      "Se convoca asamblea extraordinaria de socios para deliberar sobre la propuesta de itinerario dominical.",
    ],
    answerIndex: 1,
    explanation:
      "El neutro funciona en grupos: cercano pero claro, con propuesta concreta y pregunta abierta para organizarse.",
    tags: ["registro", "grupos"],
  },
  {
    skill: "expresion",
    difficulty: 4,
    prompt: "Elige la versión adecuada a la situación.",
    context: "Correo al museo preguntando horarios para un grupo escolar.",
    register: "formal",
    options: [
      "Buenas, ¿a qué hora abren y cuánto cuesta meter a veinte crios?",
      "Estimados señores: quisiera información sobre horarios de visita y tarifas grupales para un grupo escolar de veinte alumnos. Atentamente.",
      "Requiero horarios y tarifas del museo. Conteste rápido.",
    ],
    answerIndex: 1,
    explanation:
      "Saludo institucional, petición concreta y despedida breve: el formal no es sinónimo de largo, sino de respetuoso y preciso.",
    tags: ["registro", "instituciones"],
  },
  {
    skill: "expresion",
    difficulty: 2,
    prompt: "Elige la versión adecuada a la situación.",
    context: "Avisar en el chat del equipo de juego de que te ausentas media hora.",
    register: "coloquial",
    options: [
      "Me ausentaré de la partida durante un periodo aproximado de treinta minutos.",
      "Chicos, afk media hora, la nevera no se llena sola. Volad el mundo sin mí.",
      "Se notifica la interrupción temporal de mi participación lúdica.",
    ],
    answerIndex: 1,
    explanation:
      "«Afk», humor y despedida breve: el registro coloquial del gaming. Cualquier formalidad aquí sería una broma… y probablemente también lo sería allí.",
    tags: ["registro", "gaming"],
  },
  {
    skill: "expresion",
    difficulty: 3,
    prompt: "Elige la versión adecuada a la situación.",
    context: "Comentario público en el blog de una autora que admiras.",
    register: "neutro",
    options: [
      "Te follows poco pero tus libros son una basura, no sé cómo los publican.",
      "Llevo tres años leyendo su obra y esta novela me acompañó en un viaje importante; gracias por escribir con tanta luz.",
      "Querida ilustrísima señora autora: me permito felicitarla efusivamente por su magnífica producción literaria.",
    ],
    answerIndex: 1,
    explanation:
      "En internet, lo neutro-cálido es el tono perfecto: personal, sincero y sin sombras ni exageraciones. Ni dureza ni reverencia teatral.",
    tags: ["registro", "internet"],
  },
  {
    skill: "expresion",
    difficulty: 4,
    prompt: "Elige la versión adecuada a la situación.",
    context: "Reclamar por escrito a una tienda: el pedido no llegó.",
    register: "formal",
    options: [
      "A la atención del servicio al cliente: el pedido n.º 4521, comprado el día 3, no ha llegado. Solicito su revisión y respuesta. Quedo a la espera, saludos cordiales.",
      "¿Pero qué clase de timo es este? ¡O me mandáis el paquete HOY o os denuncio en todas las redes!",
      "Uy, creo que mi paquete se perdió, qué mal rollo, ¿le importaría verlo si puede cuando pueda?",
    ],
    answerIndex: 0,
    explanation:
      "Una reclamación eficaz es formal y precisa: número de pedido, fecha, petición concreta. La furia quita credibilidad y el exceso de suavidad diluye la petición.",
    tags: ["registro", "reclamación"],
  },
  {
    skill: "expresion",
    difficulty: 2,
    prompt: "Elige la versión adecuada a la situación.",
    context: "Invitar por chat a tu prima, muy cercana, al cine.",
    register: "coloquial",
    options: [
      "Estimada prima: me dirijo a usted a fin de proponerle la asistencia conjunta a una proyección cinematográfica.",
      "¿Cine el viernes? Te invito, pero vas a las palomitas, ¿trato?",
      "Se realiza propuesta de actividad recreativa compartida. Confirme asistencia.",
    ],
    answerIndex: 1,
    explanation:
      "La cercanía pide directa y con humor: pregunta corta y reparto de tareas jugando. Lo formal entre primas cercanas es una broma, no una invitación.",
    tags: ["registro", "familia"],
  },
  {
    skill: "expresion",
    difficulty: 4,
    prompt: "Elige la versión adecuada a la situación.",
    context: "Responder a una empresa confirmando la entrevista de trabajo.",
    register: "formal",
    options: [
      "Ok, ahí estaré. ¿Hay parking cerca?",
      "Confirmo mi asistencia a la entrevista del jueves 12 a las 10:00. Agradezco la oportunidad y quedo a su disposición para cualquier información adicional.",
      "Me parece bien la entrevista, aunque preferiría que fuera otro día, ese me viene fatal.",
    ],
    answerIndex: 1,
    explanation:
      "Confirmar fecha y hora, agradecer y ofrecerse: la respuesta formal breve que las empresas esperan. Cambiar la fecha así, sin proponer alternativa, resta seriedad.",
    tags: ["registro", "trabajo"],
  },
];

/* ============================ Taller de Conectores ============================ */

const CONECTORES: Omit<ConectoresExercise, "id" | "type" | "cefr">[] = [
  {
    skill: "gramatica",
    difficulty: 3,
    prompt: "Elige el conector que encaja en el hueco.",
    sentence: "Estudié todo el fin de semana; ___, no saqué la nota que esperaba.",
    options: ["sin embargo", "por lo tanto", "es decir"],
    answerIndex: 0,
    explanation: "«Sin embargo» introduce contraste: esfuerzo y resultado van en direcciones opuestas.",
    tags: ["conectores", "contraste"],
  },
  {
    skill: "gramatica",
    difficulty: 3,
    prompt: "Elige el conector que encaja en el hueco.",
    sentence: "El bosque es un ecosistema frágil; ___, debemos cuidarlo.",
    options: ["mientras que", "por lo tanto", "aun así"],
    answerIndex: 1,
    explanation: "«Por lo tanto» marca consecuencia: de la fragilidad se deduce la necesidad de cuidado.",
    tags: ["conectores", "consecuencia"],
  },
  {
    skill: "gramatica",
    difficulty: 2,
    prompt: "Elige el conector que encaja en el hueco.",
    sentence: "___ llovía a cántaros, la expedición siguió adelante.",
    options: ["Sin embargo", "Aunque", "Debido a"],
    answerIndex: 1,
    explanation: "«Aunque» concede: admite el obstáculo (lluvia) y afirma el avance en una sola oración.",
    tags: ["conectores", "concesión"],
  },
  {
    skill: "gramatica",
    difficulty: 4,
    prompt: "Elige el conector que encaja en el hueco.",
    sentence: "Le gusta todo lo marinero: ___, faros, barcos, mareas y faros.",
    options: ["por ejemplo", "es decir", "en cambio"],
    answerIndex: 1,
    explanation: "«Es decir» aclara y precisa el sentido anterior; «por ejemplo» abriría una lista abierta, no una definición completa.",
    tags: ["conectores", "reformulación"],
  },
  {
    skill: "gramatica",
    difficulty: 3,
    prompt: "Elige el conector que encaja en el hueco.",
    sentence: "El bosque respira calma; ___, la ciudad vibra sin parar.",
    options: ["además", "en cambio", "por lo tanto"],
    answerIndex: 1,
    explanation: "«En cambio» opone dos realidades que se comparan: bosque tranquilo frente a ciudad inquieta.",
    tags: ["conectores", "oposición"],
  },
  {
    skill: "gramatica",
    difficulty: 2,
    prompt: "Elige el conector que encaja en el hueco.",
    sentence: "Aprobó el examen con nota; ___, ganó el premio de la clase.",
    options: ["además", "pero", "es decir"],
    answerIndex: 0,
    explanation: "«Además» suma hechos que van en la misma dirección favorable; «pero» los opondría sin motivo.",
    tags: ["conectores", "adición"],
  },
  {
    skill: "gramatica",
    difficulty: 3,
    prompt: "Elige el conector que encaja en el hueco.",
    sentence: "___ la tormenta, el ferry no zarpó del puerto.",
    options: ["Debido a", "A pesar de", "Aunque"],
    answerIndex: 0,
    explanation: "«Debido a» expresa causa: la tormenta es el motivo directo de la suspensión, no un obstáculo superado.",
    tags: ["conectores", "causa"],
  },
  {
    skill: "gramatica",
    difficulty: 4,
    prompt: "Elige el conector que encaja en el hueco.",
    sentence: "___ su miedo a las alturas, subió hasta la cima del faro.",
    options: ["Debido a", "A pesar de", "Por lo tanto"],
    answerIndex: 1,
    explanation: "«A pesar de» es concesivo: el miedo no impidió la acción. Con «debido a», el miedo sería la causa de subirla.",
    tags: ["conectores", "concesión"],
  },
  {
    skill: "gramatica",
    difficulty: 4,
    prompt: "Elige el conector que encaja en el hueco.",
    sentence: "Tú prefieres la ficción; ___, yo devoro biografías.",
    options: ["mientras que", "porque", "es decir"],
    answerIndex: 0,
    explanation: "«Mientras que» enfrenta dos gustos simultáneos y comparables; «porque» explicaría una causa que aquí no se pide.",
    tags: ["conectores", "comparación"],
  },
  {
    skill: "gramatica",
    difficulty: 5,
    prompt: "Elige el conector que encaja en el hueco.",
    sentence: "___ el plazo vence mañana, redacté la carta esta misma noche.",
    options: ["Dado que", "Aunque", "En cambio"],
    answerIndex: 0,
    explanation: "«Dado que» introduce la causa conocida que justifica la decisión: el plazo apremia, luego se actúa.",
    tags: ["conectores", "causa"],
  },
  {
    skill: "gramatica",
    difficulty: 5,
    prompt: "Elige el conector que encaja en el hueco.",
    sentence: "Le advirtieron del riesgo; ___, se lanzó en parapente.",
    options: ["por eso", "aun así", "es decir"],
    answerIndex: 1,
    explanation: "«Aun así» insiste en la contravención: hubo advertencia y, sin embargo, la acción siguió adelante.",
    tags: ["conectores", "concesión"],
  },
  {
    skill: "gramatica",
    difficulty: 3,
    prompt: "Elige el conector que encaja en el hueco.",
    sentence: "No abandonó el manuscrito; ___, redobló el esfuerzo cada noche.",
    options: ["por el contrario", "es decir", "en conclusión"],
    answerIndex: 0,
    explanation: "«Por el contrario» niega la expectativa (abandonar) y afirma lo opuesto (esfuerzo redoblado).",
    tags: ["conectores", "oposición"],
  },
];

/* ============================ Detector de Ironía ============================ */

const IRONIA: Omit<IroniaExercise, "id" | "type" | "cefr">[] = [
  {
    skill: "lectura",
    difficulty: 2,
    prompt: "¿La frase se dice en sentido literal o con ironía?",
    statement: "¡Genial! Otra multa. Justo lo que necesitaba para acabar el mes.",
    context: "Es la tercera multa del mes y el bolsillo ya está en rojo.",
    answer: "ironico",
    explanation:
      "«Genial» y «justo lo que necesitaba» chocan con la situación: decir lo contrario de lo que se siente es la marca de la ironía.",
    tags: ["ironía", "contraste"],
  },
  {
    skill: "lectura",
    difficulty: 2,
    prompt: "¿La frase se dice en sentido literal o con ironía?",
    statement: "Has trabajado mucho en este pastel; se nota en cada capa.",
    context: "El pastel de cumpleaños salió delicioso y bien decorado.",
    answer: "literal",
    explanation: "El comentario coincide con los hechos y con el tono del hablante: no hay señal de decir lo contrario.",
    tags: ["ironía", "literal"],
  },
  {
    skill: "lectura",
    difficulty: 3,
    prompt: "¿La frase se dice en sentido literal o con ironía?",
    statement: "Muy puntual llegaste: casi te pierdes el avión entero.",
    context: "Llegó dos horas tarde y el avión ya había despegado.",
    answer: "ironico",
    explanation:
      "Alabar la puntualidad cuando fue todo lo contrario es ironía. El contexto, no las palabras, revela el tono real.",
    tags: ["ironía", "contexto"],
  },
  {
    skill: "lectura",
    difficulty: 3,
    prompt: "¿La frase se dice en sentido literal o con ironía?",
    statement: "Me encanta cuando llueve y me olvido el paraguas: es mi talento natural.",
    context: "Va empapado camino del examen final.",
    answer: "ironico",
    explanation: "«Me encanta» y «talento natural» exageran para quejarse con humor: la base de la ironía amable.",
    tags: ["ironía", "exageración"],
  },
  {
    skill: "lectura",
    difficulty: 2,
    prompt: "¿La frase se dice en sentido literal o con ironía?",
    statement: "Qué sorpresa tan agradable encontrarte por aquí.",
    context: "Se cruzan con una vieja amiga a quien llevaban años queriendo ver.",
    answer: "literal",
    explanation: "Gusto, sorpresa y deseo coinciden: todo apunta al sentido recto de las palabras.",
    tags: ["ironía", "literal"],
  },
  {
    skill: "lectura",
    difficulty: 4,
    prompt: "¿La frase se dice en sentido literal o con ironía?",
    statement: "Este teléfono es de otra galaxia: solo se apaga tres veces al día.",
    context: "Lleva una semana con el mismo móvil reiniciándose sin parar.",
    answer: "ironico",
    explanation: "El elogio («de otra galaxia») se desmonta con el dato negativo: la alabanza imposible delata la queja.",
    tags: ["ironía", "tecnología"],
  },
  {
    skill: "lectura",
    difficulty: 3,
    prompt: "¿La frase se dice en sentido literal o con ironía?",
    statement: "El examen fue pan comido.",
    context: "Estudió dos semanas y todas las preguntas cayeron en lo repasado.",
    answer: "literal",
    explanation: "«Pan comido» es una expresión figurada, pero se usa con su significado real de facilidad: no hay ironía, solo idioma figurado.",
    tags: ["ironía", "figurado"],
  },
  {
    skill: "lectura",
    difficulty: 4,
    prompt: "¿La frase se dice en sentido literal o con ironía?",
    statement: "Ya decidió el «genio» del grupo: borró media carpeta del proyecto sin avisar.",
    context: "Las comillas delatan el tono al pronunciar «genio».",
    answer: "ironico",
    explanation: "Las comillas y el verbo «delatan» invierten el elogio: llamárle genio a quien borra archivos es puro sarcasmo.",
    tags: ["ironía", "comillas"],
  },
  {
    skill: "lectura",
    difficulty: 3,
    prompt: "¿La frase se dice en sentido literal o con ironía?",
    statement: "Nadie escribió mejor que ella esa noche: el público lloró con cada verso.",
    context: "Recital de poesía con sala llena y ovación final.",
    answer: "literal",
    explanation: "Los hechos confirman el elogio: no hay contradicción entre lo dicho y lo ocurrido.",
    tags: ["ironía", "literal"],
  },
  {
    skill: "lectura",
    difficulty: 5,
    prompt: "¿La frase se dice en sentido literal o con ironía?",
    statement: "El fontanero 'solucionó' la gotera: ahora hay dos.",
    context: "La cocina amanece con un segundo charco bajo el fregadero.",
    answer: "ironico",
    explanation: "El verbo entre comillas más la aritmética del desastre (ahora dos goteras) dicen lo contrario de lo que afirman.",
    tags: ["ironía", "sarcasmo"],
  },
  {
    skill: "lectura",
    difficulty: 4,
    prompt: "¿La frase se dice en sentido literal o con ironía?",
    statement: "Aprendí muchísimo con tus correcciones; el texto quedó redondo.",
    context: "Después de la sesión de revisión, reescribió el cuento entero agradeciendo cada sugerencia.",
    answer: "literal",
    explanation: "La acción posterior (reescribir y agradecer) confirma que las palabras se dicen con su sentido pleno.",
    tags: ["ironía", "literal"],
  },
  {
    skill: "lectura",
    difficulty: 5,
    prompt: "¿La frase se dice en sentido literal o con ironía?",
    statement: "Claro, como no: encantado de quedarme el sábado a las siete de la mañana.",
    context: "Es su único día libre del mes y suspira mirando el calendario.",
    answer: "ironico",
    explanation: "«Claro, como no» dicho con resignación convierte la aceptación en negativa: el tono y el contexto invierten el mensaje.",
    tags: ["ironía", "tono"],
  },
];

/* ============================ Censura del Editor ============================ */

const TITULOS: Omit<TitulosExercise, "id" | "type" | "cefr">[] = [
  {
    skill: "ortografia",
    difficulty: 3,
    prompt: "Tacha la palabra redundante (o declara el texto limpio).",
    sentence: "El gato subió arriba por las ramas del árbol.",
    tokens: ["El", "gato", "subió", "arriba", "por", "las", "ramas"],
    answerIndex: 3,
    explanation: "«Subir» ya implica ir hacia arriba: «subió arriba» es una redundancia clásica.",
    tags: ["redundancia", "direcciones"],
  },
  {
    skill: "ortografia",
    difficulty: 2,
    prompt: "Tacha la palabra redundante (o declara el texto limpio).",
    sentence: "Salimos afuera a ver las estrellas del verano.",
    tokens: ["Salimos", "afuera", "a", "ver", "las", "estrellas"],
    answerIndex: 1,
    explanation: "«Salir» apunta ya hacia el exterior: «salimos afuera» repite la misma idea.",
    tags: ["redundancia", "direcciones"],
  },
  {
    skill: "ortografia",
    difficulty: 3,
    prompt: "Tacha la palabra redundante (o declara el texto limpio).",
    sentence: "Entra adentro, que en la calle hace frío.",
    tokens: ["Entra", "adentro", ",", "que", "en", "la", "calle", "hace", "frío"],
    answerIndex: 1,
    explanation: "«Entrar» significa pasar al interior: añadir «adentro» duplica el sentido.",
    tags: ["redundancia", "direcciones"],
  },
  {
    skill: "ortografia",
    difficulty: 4,
    prompt: "Tacha la palabra redundante (o declara el texto limpio).",
    sentence: "Los corredores avanzaron hacia adelante en la fila del maratón.",
    tokens: ["Los", "corredores", "avanzaron", "hacia", "adelante", "en", "la", "fila"],
    answerIndex: 4,
    explanation: "«Avanzar» ya es moverse hacia delante: el complemento repite la dirección.",
    tags: ["redundancia", "movimiento"],
  },
  {
    skill: "ortografia",
    difficulty: 4,
    prompt: "Tacha la palabra redundante (o declara el texto limpio).",
    sentence: "En mi opinión personal, el libro es mejor que la película.",
    tokens: ["En", "mi", "opinión", "personal", ",", "el", "libro", "es", "mejor"],
    answerIndex: 3,
    explanation: "Toda opinión es personal por definición: el adjetivo no añade nada.",
    tags: ["redundancia", "pleonasmo"],
  },
  {
    skill: "ortografia",
    difficulty: 4,
    prompt: "Tacha la palabra redundante (o declara el texto limpio).",
    sentence: "Vi el cometa con mis propios ojos desde el tejado.",
    tokens: ["Vi", "el", "cometa", "con", "mis", "propios", "ojos"],
    answerIndex: 5,
    explanation: "Si lo viste con tus ojos, no podían ser ajenos: «propios» sobra en la frase.",
    tags: ["redundancia", "pleonasmo"],
  },
  {
    skill: "ortografia",
    difficulty: 5,
    prompt: "Tacha la palabra redundante (o declara el texto limpio).",
    sentence: "Ambos dos hermanos heredaron el faro de su abuelo.",
    tokens: ["Ambos", "dos", "hermanos", "heredaron", "el", "faro"],
    answerIndex: 1,
    explanation: "«Ambos» ya significa «los dos»: la pareja «ambos dos» duplica el número.",
    tags: ["redundancia", "números"],
  },
  {
    skill: "ortografia",
    difficulty: 5,
    prompt: "Tacha la palabra redundante (o declara el texto limpio).",
    sentence: "Caminamos por un bosque de árboles centenarios.",
    tokens: ["Caminamos", "por", "un", "bosque", "de", "árboles", "centenarios"],
    answerIndex: 5,
    explanation: "Un bosque es, por definición, un conjunto de árboles: «bosque de árboles» repite la idea.",
    tags: ["redundancia", "naturaleza"],
  },
  {
    skill: "ortografia",
    difficulty: 4,
    prompt: "Tacha la palabra redundante (o declara el texto limpio).",
    sentence: "Los estudiantes memorizan de memoria los apuntes la noche antes.",
    tokens: ["Los", "estudiantes", "memorizan", "de", "memoria", "los", "apuntes"],
    answerIndex: 4,
    explanation: "«Memorizar» es fijar algo en la memoria: «de memoria» vuelve a decir lo mismo.",
    tags: ["redundancia", "pleonasmo"],
  },
  {
    skill: "ortografia",
    difficulty: 5,
    prompt: "Tacha la palabra redundante (o declara el texto limpio).",
    sentence: "La decisión final y definitiva del jurado llegó al mediodía.",
    tokens: ["La", "decisión", "final", "y", "definitiva", "del", "jurado"],
    answerIndex: 4,
    explanation: "Si es final, ya es definitiva: los dos adjetivos dicen lo mismo dos veces.",
    tags: ["redundancia", "adjetivos"],
  },
  {
    skill: "ortografia",
    difficulty: 2,
    prompt: "Tacha la palabra redundante (o declara el texto limpio).",
    sentence: "La soprano cantó una melodía suave para el público.",
    tokens: ["La", "soprano", "cantó", "una", "melodía", "suave"],
    answerIndex: -1,
    explanation: "Este texto está limpio: cada palabra aporta información distinta. «Melodía suave» no repite ninguna idea.",
    tags: ["redundancia", "limpio"],
  },
  {
    skill: "ortografia",
    difficulty: 3,
    prompt: "Tacha la palabra redundante (o declara el texto limpio).",
    sentence: "El faro parpadea cada noche sobre el acantilado.",
    tokens: ["El", "faro", "parpadea", "cada", "noche", "sobre", "el", "acantilado"],
    answerIndex: -1,
    explanation: "No hay redundancia: el faro puede parpadear y el acantilado no forma parte del faro. El editor no tacharía nada.",
    tags: ["redundancia", "limpio"],
  },
];

/* ============================ Construcción del pack ============================ */

function build(): Exercise[] {
  const out: Exercise[] = [];
  METAFORAS.forEach((e, i) => {
    out.push({ ...e, id: `mf-fj-${String(i + 1).padStart(2, "0")}`, type: "metaforas", cefr: "B1", tags: ["forja", ...e.tags] });
  });
  REGISTRO.forEach((e, i) => {
    const cefr = e.difficulty <= 2 ? "A2" : e.difficulty >= 4 ? "C1" : "B1";
    out.push({ ...e, id: `rg-fj-${String(i + 1).padStart(2, "0")}`, type: "registro", cefr, tags: ["forja", ...e.tags] });
  });
  CONECTORES.forEach((e, i) => {
    const cefr = e.difficulty <= 2 ? "A2" : e.difficulty >= 4 ? "C1" : "B1";
    out.push({ ...e, id: `ct-fj-${String(i + 1).padStart(2, "0")}`, type: "conectores", cefr, tags: ["forja", ...e.tags] });
  });
  IRONIA.forEach((e, i) => {
    const cefr = e.difficulty <= 2 ? "A2" : e.difficulty >= 4 ? "C1" : "B1";
    out.push({ ...e, id: `ir-fj-${String(i + 1).padStart(2, "0")}`, type: "ironia", cefr, tags: ["forja", ...e.tags] });
  });
  TITULOS.forEach((e, i) => {
    const cefr = e.difficulty <= 2 ? "A2" : e.difficulty >= 4 ? "C1" : "B1";
    out.push({ ...e, id: `ed-fj-${String(i + 1).padStart(2, "0")}`, type: "titulos", cefr, tags: ["forja", ...e.tags] });
  });
  return out;
}

export const FORJA_METAFORAS: MetaforasExercise[] = build().filter(
  (e): e is MetaforasExercise => e.type === "metaforas",
);
export const FORJA_REGISTRO: RegistroExercise[] = build().filter(
  (e): e is RegistroExercise => e.type === "registro",
);
export const FORJA_CONECTORES: ConectoresExercise[] = build().filter(
  (e): e is ConectoresExercise => e.type === "conectores",
);
export const FORJA_IRONIA: IroniaExercise[] = build().filter(
  (e): e is IroniaExercise => e.type === "ironia",
);
export const FORJA_TITULOS: TitulosExercise[] = build().filter(
  (e): e is TitulosExercise => e.type === "titulos",
);

export const FORJA_PACKS: Exercise[] = build();
