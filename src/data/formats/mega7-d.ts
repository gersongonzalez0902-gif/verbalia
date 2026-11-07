import type {
  ClasificaExercise,
  EligeExercise,
  OyeAcentoExercise,
  OyeNumeroExercise,
  SkillId,
} from "@/types";
import { CEFR_BY_DIFFICULTY, fmtId } from "./shared";

/**
 * Mega-7 · Pack D (Biblioteca 8, Puerto 3, Torre 3, Observatorio 2).
 * Lectura (título, idea, resumen, tono, inferencia, secuencia,
 * propósito, vocabulario en contexto), escucha (entonación, sílaba
 * tónica, números), expresión (aperturas, cierres, descripciones) y
 * cultura (regionalismos, falsos amigos).
 */

type Row = [string, string[], number, string, 1 | 2 | 3 | 4 | 5];

function elige(
  prefix: string,
  variant: string,
  type: EligeExercise["type"],
  skill: SkillId,
  rows: Row[],
  prompt: string,
  question: string,
): EligeExercise[] {
  return rows.map(([context, options, answerIndex, explanation, difficulty], i) => ({
    id: fmtId(prefix, variant, i),
    type,
    skill,
    difficulty,
    cefr: CEFR_BY_DIFFICULTY[difficulty],
    prompt,
    context,
    question,
    options,
    answerIndex,
    explanation,
    tags: [skill],
  }));
}

/* ============================ Biblioteca (lectura) ============================ */

const LECT: SkillId = "lectura";

/** El mejor titular: [texto, opciones, respuesta, explicación, dif] */
const TITULO_ROWS: Row[] = [
  ["Los faros modernos se controlan por satélite y casi no necesitan fareros: de los 200 que había en España hoy quedan menos de 20. El oficio se apaga con las luces que cuida.", ["Los últimos fareros: un oficio que se apaga", "Los faros de España", "Cómo funciona un satélite"], 0, "El titular debe condensar el enfoque central (la desaparición del oficio), no solo el tema.", 3],
  ["Las abejas urbanas prosperan en las azoteas de la ciudad: los tejados ofrecen flores sin pesticidas y el calor ayudaa la colmena. La miel «de azotea» ya se vende en mercados locales.", ["La ciudad se vuelve apícola: abejas en las azoteas", "Las flores de los tejados", "Cómo se vende la miel"], 0, "El enfoque es el fenómeno urbano completo, no un detalle secundario.", 3],
  ["Estudio tras estudio confirma que leer antes de dormir mejora el sueño: seis minutos bastan para reducir el estrés. Eso sí: mejor papel que pantalla.", ["Leer antes de dormir (en papel) ayuda a dormir mejor", "Seis minutos", "Las pantallas son malas"], 0, "El titular recoge la idea completa con su matiz clave.", 3],
  ["El español hablado en Buenos Aires canta las eses y las come: «calle» suena «cashe». Ese rasgo, herencia de los inmigrantes italianos, es la marca sonora del Río de la Plata.", ["El «sheísmo» del Río de la Plata: la herencia italiana que se oye", "Los inmigrantes italianos", "Cómo se dice «calle»"], 0, "El fenómeno lingüístico concreto es el protagonista.", 4],
  ["La Biblioteca de Alejandría no ardió en una sola noche: se fue apagando entre traslados, recortes y olvido a lo largo de siglos. El mito es más dramático que la historia.", ["La lenta agonía de Alejandría: el mito de la gran hoguera", "La Biblioteca de Alejandría", "Los recortes de la Antigüedad"], 0, "El titular anticipa la tesis del texto: desmontar el mito.", 4],
  ["Cada año llegan al mar ocho millones de toneladas de plástico. Una botella tarda 450 años en desaparecer. Las gaviotas del Archipiélago ya fabrican sus nidos con pajitas.", ["El plástico ya anida: el mar que fabrica nidos sintéticos", "Toneladas de plástico", "La vida de una botella"], 0, "La imagen final (nidos de pajitas) es el gancho: el titular la aprovecha.", 5],
  ["Receta: batir dos huevos con azúcar, añadir harina tamizada y levadura, hornear 40 minutos. El secreto es no abrir el horno antes de tiempo.", ["Bizcocho esponjoso: receta y el secreto del horno", "Huevos y azúcar", "Cómo tamizar harina"], 0, "En textos prácticos, el titular anuncia el contenido y su plus (el secreto).", 2],
  ["Carta al director: «Solicito que se reparen las farolas del paseo marítimo. Caminar a oscuras no es romántico: es peligroso». Firmado: un vecino cansado de tropezar.", ["Farolas apagadas, vecinos tropezando: una carta al director", "El paseo marítimo", "Cómo escribir cartas"], 0, "El titular resume la denuncia ciudadana.", 4],
];

export const TITULO_PACK = elige("ti", "biblioteca", "titulo", LECT, TITULO_ROWS, "El mejor titular", "¿Qué titular captura mejor el texto?");

/** Idea central */
const IDEA_ROWS: Row[] = [
  ["Los mapas antiguos dibujaban monstruos donde no llegaba el conocimiento: «aquí hay dragones», escribían en los bordes. El miedo a lo desconocido tiene forma de bestia.", ["Los mapas antiguos reflejaban el miedo a lo desconocido", "Los monstruos marinos existían", "Los cartógrafos dibujaban muy bien"], 0, "La idea central une mapas y miedo; los detalles son adornos.", 3],
  ["El texto cuenta que las plantas se comunican mediante señales químicas: una acacia avisada libera taninos amargos. Los árboles del mismo bosque se pasan información.", ["Las plantas se comunican entre sí químicamente", "Las acacias son amargas", "Los bosques son silenciosos"], 0, "La idea global supera al ejemplo concreto de la acacia.", 3],
  ["Antes se creía que el talento era innato; la investigación actual insiste en la práctica deliberada: diez años de trabajo enfocado separan al aficionado del maestro.", ["El talento se construye con práctica deliberada", "Nadie nace con talento", "Diez años son muchos"], 0, "La tesis es la síntesis de ambas ideas (práctica + tiempo).", 4],
  ["Descripción del mercado: las frutas se apilan en pirámides perfectas; las voces de los vendedores golpean el aire; huele a mango y a gasolina. El caos tiene su coreografía.", ["Un mercado vivo donde el caos es también orden", "Las frutas del mercado", "Los vendedores gritan"], 0, "La idea central es la síntesis final: el caos con coreografía.", 4],
  ["Las lenguas mueren a razón de una cada dos semanas. Con cada una desaparece una forma única de nombrar la lluvia, el miedo o el mar. Un diccionario perdido es un mundo perdido.", ["La extinción de lenguas es una pérdida de mundos enteros", "Hay muchas lenguas", "Los diccionarios son importantes"], 0, "La idea central vincula muerte lingüística y pérdida cultural.", 5],
  ["Instrucciones: llene la tinta hasta la línea, no la agite, guarde la pluma en horizontal. La tinta fluye mejor con la pluma descansada.", ["Cuidados básicos de la pluma estilográfica", "La tinta y sus misterios", "Cómo escribir bonito"], 0, "El propósito instructivo del texto define su idea central.", 2],
  ["«Me gusta el mar cuando se enfada», decía la abuela. Y lo decía con los pies bien plantados en la arena, lejos del alcance de las olas: le gustaba mirar la fuerza, no mojarse en ella.", ["A la abuela le gustaba contemplar el mar encrespado desde la seguridad", "La abuela tenía miedo", "El mar se enfada a menudo"], 0, "La idea central captura el matiz: amar la fuerza desde lejos.", 5],
  ["El primer telegrama decía «What hath God wrought»; el último SMS comercial, «pack doble a mitad de precio». La tecnología cambia, la prisa por decir sigue igual.", ["Del primer telegrama al spam: la prisa por comunicarse no cambia", "Los telegramas antiguos", "El marketing agresivo"], 0, "La idea central es la comparación con remate.", 5],
];

export const IDEA_PACK = elige("id", "biblioteca", "idea", LECT, IDEA_ROWS, "Idea central", "¿Cuál es la idea que sostiene todo el texto?");

/** Resumen fiel (paráfrasis correcta) */
const RESUMEN_ROWS: Row[] = [
  ["Texto: La imprenta de Gutenberg no inventó la lectura: la multiplicó. Antes de 1450, un libro costaba lo que una casa pequeña; cincuenta años después, las casas ya tenían estanterías.",
   ["La imprenta abarató los libros y llevó la lectura a los hogares", "Gutenberg inventó la lectura en 1450", "Las casas pequeñas tenían estanterías"],
   0, "El resumen condensa causa y efecto sin copiar literalmente.", 3],
  ["Texto: Las ballenas jorobadas cantan para navegar la oscuridad: sus cantos rebotan en montañas sumergidas y regresan con el mapa del fondo. La música, para ellas, es un sonar.",
   ["Los cantos de las jorobadas funcionan como un sonar que les devuelve el mapa del fondo marino", "Las ballenas cantan porque les gusta la música", "El fondo del mar tiene montañas"],
   0, "Resumir es reformular la función esencial con otras palabras.", 3],
  ["Texto: El ajedrez moderno nació cuando la dama, que apenas podía saltar una casilla, recibió poderes totales en el siglo XV. Dicen que fue un halago a Isabel la Católica: la reña que todo lo puede.",
   ["El poder actual de la dama nació en el siglo XV, quizá como halago a una reina", "Isabel la Católica jugaba al ajedrez", "La dama es la pieza más antigua"],
   0, "El resumen conserva la hipótesis («quizá») del original.", 4],
  ["Texto: La siesta perfecta dura entre diez y veinte minutos: más tiempo hunde el sueño en fase profunda y despierta con más sueño del que curó. Los romanos lo sabían: la sexta hora se hizo para descansar.",
   ["La siesta breve (10-20 min) recompone; la larga puede despertar con más sueño", "Hay que dormir veinte minutos exactos", "Los romanos inventaron la siesta"],
   0, "El resumen respeta los datos y la advertencia central.", 3],
  ["Texto: En la isla de Gavio, los pescadores nombran veinte tipos de lluvia: la que corrige el viento, la que miente, la que solo moja a los de afuera. Hablar del tiempo es, allí, un arte fino.",
   ["En Gavio el vocabulario para la lluvia es tan rico que hablar del clima es un arte", "En Gavio llueve veinte veces al día", "Los pescadores se mojan mucho"],
   0, "El resumen capta la tesis cultural, no los ejemplos.", 5],
  ["Texto: Receta de la sopa de piedra: se cuece una piedra limpia con agua y sal; luego se le va pidiendo al vecino «solo un toque de zanahoria», «solo un hueso». Al final, sobra sopa para todos.",
   ["La sopa de piedra se hace pidiendo ingredientes prestados uno a uno", "Las piedras son comestibles si se cocinan", "Hay que pedir a los vecinos"],
   0, "El resumen del cuento recoge el mecanismo del ingenio.", 4],
];

export const RESUMEN_PACK = elige("rs", "biblioteca", "resumen", LECT, RESUMEN_ROWS, "Resumen fiel", "¿Qué opción resume mejor el texto?");

/** Termómetro de tono */
const TONO_ROWS: Row[] = [
  ["«¿De nuevo sin lavar los platos? Qué sorpresa tan enorme. Me encantan las sorpresas.», dijo con la mirada gélida.", ["Irónico", "Solemne", "Entusiasta"], 0, "El elogio exagerado con mirada gélida delata la ironía.", 3],
  ["«Hemos de honrar la memoria de quienes entregaron su vida por esta tierra, y hemos de hacerlo con la frente alta.», leyó el alcalde.", ["Solemne", "Jocoso", "Coloquial"], 0, "El registro ceremonial y la sintaxis elevada marcan solemnidad.", 3],
  ["«Tío, qué guay el concierto de anoche, flips total.», escribió en el chat.", ["Coloquial", "Formal", "Poético"], 0, "Lexicón juvenil y chat: coloquial puro.", 2],
  ["«La luna, that white voyeuse, espiaba los tejados mojados de plata.» (poemilla del farero)", ["Poético / lírico", "Instructivo", "Periodístico"], 0, "Imágenes sensoriales y metaforas: tono lírico.", 4],
  ["«Se prohíbe el acceso al personal ajeno a la obra. El incumplimiento será sancionado conforme a la normativa vigente.»", ["Formal / administrativo", "Publicitario", "Nostájico"], 0, "La fórmula pasiva y el léxico jurídico delatan el registro administrativo.", 3],
  ["«¡Compra ya! ¡Solo hoy! ¡La oferta que estabas esperando toda tu vida (o al menos esta semana)!»", ["Publicitario", "Académico", "Melancólico"], 0, "El ritmo exclamativo y el imperativo son puro anuncio.", 2],
  ["«Combinar dos tazas de harina con una de agua tibia. Amasar sin miedo: la masa avisa cuando está lista.»", ["Cálido y cercano (didáctico amable)", "Frío y técnico", "Amenazante"], 0, "El tono didáctico con afecto («sin miedo») es cercano.", 3],
  ["«Aquellos veranos en la casa del abuelo ya no volverán; el olor a hierba mojada vive solo en la memoria.»", ["Nostálgico", "Sarcástico", "Informativo"], 0, "La mirada al pasado irrecuperable: nostalgia.", 4],
];

export const TONO_PACK = elige("tn", "biblioteca", "tono", LECT, TONO_ROWS, "Termómetro de tono", "¿Qué tono tiene el texto?");

/** Entre líneas (inferencia) */
const INFERENCIA_ROWS: Row[] = [
  ["Paula cerró la ventana, se puso el abrigo y aun así tiritaba. El radiador, mudo, parecía de adorno.", ["Hace frío en la habitación y la calefacción no funciona", "Paula tiene gripe", "Paula quiere salir a la calle"], 0, "Abrigo + tiritona + radiador mudo: la inferencia es de frío por calefacción rota.", 2],
  ["El perro se escondió bajo el sofá justo cuando Marta guardó la aspiradora en el armario.", ["El perro teme la aspiradora (o algo que ocurrió con ella)", "El perro está cansado", "El sofá es su cama favorita"], 0, "La acción doble (esconderse + guardar la aspiradora) revela la asociación de miedo.", 3],
  ["«El café de Juan era tan malo que hasta la májara del café pidió té.»", ["El café de Juan es notoriamente malo", "La máquina está rota", "A todos les gusta el té"], 0, "El exagero delata la conclusión: café pésimo.", 3],
  ["La casa tenía una sola lámpara encendida y una sopa tibia en la mesa para dos. El segundo plato seguía impecablemente limpio.", ["Alguien esperaba a una segunda persona que no llegó", "La familia es muy limpia", "Sobró comida"], 0, "Mesa para dos con un plato intacto: espera fallida.", 4],
  ["Don Ramiro enseñó el libro: cada página tenía anotaciones de tres tintas distintas, la más vieja ya descolorida.", ["Don Ramiro ha leído y releído ese libro durante años", "El libro tiene tres dueños", "Las tintas viejas cuestan menos"], 0, "Tres tintas y una descolorida: lecturas a lo largo del tiempo.", 4],
  ["En el pueblo nadie compraba ya pan en la tienda de Rosa; sin embargo, cada tarde alguien dejaba un flor en su mostrador.", ["Rosa era apreciada aunque su negocio no fuera rentable", "Las flores son baratas", "La panadería olía a flores"], 0, "Detalle tierno que revela afecto sin comercio.", 5],
];

export const INFERENCIA_PACK = elige("if", "biblioteca", "inferencia", LECT, INFERENCIA_ROWS, "Entre líneas", "¿Qué se puede deducir del texto?");

/** Línea de tiempo (secuencia) */
const SECUENCIA_ROWS: Row[] = [
  ["Historia: Luna despertó con el canto del gallo. Antes del alba ya había ordeñado las vacas. Después desayunó y, ya de noche, escribió su diario. ¿Qué hizo ANTES de desayunar?", ["Ordeñar las vacas", "Escribir su diario", "Despertar con el gallo"], 0, "El orden: despertar → ordeñar → desayunar → diario. Antes de desayunar: ordeñar.", 2],
  ["Relato: El barco zarpó al amanecer, cruzó la tormenta al mediodía y arribó al atardecer. ¿Qué pasó INMEDIATAMENTE DESPUÉS de la tormenta?", ["Arribó al atardecer", "Zarpó al amanecer", "Cruzó la tormenta"], 0, "Zarpar → tormenta → arribar: después de la tormenta llega a puerto.", 2],
  ["Cuento: Primero sembró la semilla; la regó durante meses; la flor brotó en primavera; el vecino se la pidió en verano. ¿Qué pasó ANTES de que brotara la flor?", ["La regó durante meses", "El vecino la pidió", "Sembró en primavera"], 0, "El riego precede al brote.", 2],
  ["Crónica: El volcán rugió el lunes; el pueblo evacuó el martes; los científicos llegaron el miércoles. ¿Qué hizo el pueblo el martes?", ["Evacuó", "Rugió el volcán", "Llegaron los científicos"], 0, "Lectura literal de la secuencia.", 1],
  ["Proceso: Se recoge la uva, se prensa, se fermenta el mosto y se embotella el vino. ¿Qué se hace JUSTO DESPUÉS de prensar?", ["Fermentar el mosto", "Recoger la uva", "Embotellar"], 0, "Proceso ordenado: vendimia → prensado → fermentación → embotellado.", 3],
  ["Relato histórico: La imprenta llegó antes que el periódico; la radio llegó después del teléfono y antes que la televisión. ¿Qué invento llegó enmedio?", ["La radio", "La imprenta", "El teléfono"], 0, "Orden: imprenta → teléfono → radio → TV… ojo: el texto dice radio después del teléfono y antes que la TV: el «enmedio» es la radio.", 5],
];

export const SECUENCIA_PACK = elige("sq", "biblioteca", "secuencia", LECT, SECUENCIA_ROWS, "Línea de tiempo", "Responde sobre el orden de los hechos.");

/** ¿Para qué se escribió? */
const PROPOSITO_ROWS: Row[] = [
  ["«Compre el nuevo diccionario ilustrado: 40.000 voces, 2.000 imágenes, un universo en sus manos.»", ["Persuadir (vender)", "Informar", "Entretener"], 0, "El imperativo y las cifras seductoras: anuncio.", 2],
  ["«La fotosíntesis convierte la luz en alimento: las plantas toman CO₂ y devuelven oxígeno. Sin ellas, no habría aire que respirar.»", ["Informar", "Persuadir", "Entretener"], 0, "Explicar un proceso con datos: propósito informativo.", 2],
  ["«Érase un faro tan viejo que se aburría de encenderse solo. Una noche, se le ocurrió guiñar…»", ["Entretener", "Informar", "Protestar"], 0, "«Érase…» y fantasía: cuento para entretener.", 1],
  ["«Exigimos la retirada inmediata del proyecto de ley. La plaza se llenará el sábado a las once. Traigan ollas.»", ["Protestar / convocar", "Informar", "Vender"], 0, "Exigencia + convocatoria: texto reivindicativo.", 3],
  ["«Querido diario: hoy el mar estaba como una tabla de planchar. Hasta las gaviotas bostezaban.»", ["Expresar sentimientos", "Informar datos", "Dar instrucciones"], 0, "Diario íntimo: propósito expresivo.", 3],
  ["«Paso 1: Calentar el horno a 180 grados. Paso 2: Batir los huevos…»", ["Instruir", "Entretener", "Persuadir"], 0, "Estructura de pasos: propósito instructivo.", 1],
  ["«Se busca redactor/a con pasión por las palabras y alergia a las faltas de ortografía.»", ["Convencer (anuncio de empleo)", "Informar estadísticas", "Entretener"], 0, "Anuncio con voz de marca: persuadir al candidato.", 3],
  ["«La lengua es un animal vivo: crece, muda la piel, se adapta. Castigar sus cambios es querer encarcelar al viento.»", ["Expresar una opinión (tesis ensayística)", "Informar", "Instruir"], 0, "Tesis con metáfora: texto de opinión.", 4],
];

export const PROPOSITO_PACK = elige("pt", "biblioteca", "proposito", LECT, PROPOSITO_ROWS, "¿Para qué se escribió?", "¿Cuál es el propósito del texto?");

/** Detective de contexto (vocabulario raro) */
const VOCABCTX_ROWS: Row[] = [
  ["Tras tres días de tormenta, el mar seguía ___encrespado___: olas como edificios rompían contra el rompeolas.", ["agitado, con olas grandes", "tranquilo, en calma", "helado, muy frío"], 0, "El contexto (olas como edificios) define «encrespado» = agitado.", 3],
  ["El interino llegó con su ___yacija___ de libros bajo el brazo: no cabía ni un folio más.", ["pila, montón", "maleta con ruedas", "lista de nombres"], 0, "«No cabía ni un folio más» apunta a montón apretado.", 4],
  ["Abuela era ___parca___ en palabras: «Bien», decía, y con eso bastaba para saber que estábamos salvados.", ["escasa, de pocas palabras", "habladora", "gritona"], 0, "«Bien» y basta: parca = de pocas palabras.", 3],
  ["El relojero desmontó la máquina con ___pericia___: cada pieza caía en su bandeja como si le obedeciera.", ["destreza, habilidad", "prisa", "miedo"], 0, "La precisión del gesto revela pericia = habilidad.", 3],
  ["La noticia resultó ___efímera___: al día siguiente ya nadie se acordaba del titular.", ["pasajera, de corta vida", "falsa", "interesante"], 0, "«Al día siguiente nadie se acordaba»: efímero = breve.", 3],
  ["Su sonrisa ___cándida___ desarmó a la comisión: nadie se atrevió a seguir interrogando.", ["inocente, sin doblez", "burlona", "forzada"], 0, "Desarmar a la comisión: candidez = inocencia que convence.", 4],
  ["El viejo pirata hablaba con ___sorna___: «Buscad el tesoro si tenéis tiempo que perder».", ["burla, ironía", "tristeza", "respeto"], 0, "El consejo envenenado delata la sorna.", 5],
  ["El ayuntamiento ___ingenió___ una solución simple: pintar de amarillo los aparcamientos libres.", ["inventó, ideó", "compró", "prohibió"], 0, "Ingeniárselas = idear con ingenio.", 4],
];

export const VOCABCTX_PACK = elige("vc", "biblioteca", "vocabctx", LECT, VOCABCTX_ROWS, "Detective de contexto", "¿Qué significa la palabra destacada según el contexto?");

/* ============================ Puerto (escucha) ============================ */

const AUDI: SkillId = "audicion";

/** Onda de entonación: clasifica lo que suena. */
const ENTONACION_ITEMS: [string, "pregunta" | "exclamacion" | "afirmacion", string, 1 | 2 | 3 | 4 | 5][] = [
  ["¿Vienes mañana a la playa?", "pregunta", "El signo ¿ abre la pregunta: la voz sube al final.", 1],
  ["¡Qué oleaje tan brutal!", "exclamacion", "La exclamación sorpresa o emociona: ¡…!", 1],
  ["Hoy el faro brilla más que nunca.", "afirmacion", "Frase enunciativa: punto final.", 1],
  ["¡Auxilio! ¡Nos hundimos!", "exclamacion", "Grito de socorro: exclamación pura.", 1],
  ["¿De quién es esta red?", "pregunta", "Pregunta con «de quién».", 2],
  ["Me encanta el olor a sal.", "afirmacion", "Declaración de gusto: punto.", 1],
  ["¡Cuidado con la borda!", "exclamacion", "Advertencia con emoción: exclamación.", 1],
  ["¿Sabes dónde guarda el timón?", "pregunta", "Pregunta indirecta pero directa al escribirse: interrogación.", 3],
  ["Ni un alma en cubierta esta noche.", "afirmacion", "Enunciado con matiz literario: punto.", 3],
  ["¡Marea viva, marea alegre, marea de faro!", "exclamacion", "Ritmo poético exclamativo.", 4],
];

export const ENTONACION_PACK: ClasificaExercise[] = ENTONACION_ITEMS.map(([item, kind, explanation, difficulty], i) => ({
  id: fmtId("en", "puerto", i),
  type: "entonacion",
  skill: AUDI,
  difficulty,
  cefr: CEFR_BY_DIFFICULTY[difficulty],
  prompt: "Onda de entonación",
  explanation,
  tags: ["entonación", "escucha"],
  item,
  buckets: ["¿Pregunta?", "¡Exclamación!", "Afirmación."],
  answerIndex: kind === "pregunta" ? 0 : kind === "exclamacion" ? 1 : 2,
}));

/** Sílaba tónica al oído. */
const OYE_ACENTO_ITEMS: [string, string[], number, string, 1 | 2 | 3 | 4 | 5][] = [
  ["ratón", ["ra", "tón"], 1, "La fuerza cae al final: aguda.", 1],
  ["casa", ["ca", "sa"], 0, "Fuerza en la primera: llana.", 1],
  ["teléfono", ["te", "lé", "fo", "no"], 1, "Esdrújula: fuerza en lé.", 2],
  ["ventana", ["ven", "ta", "na"], 1, "Llana: ven-TA-na.", 2],
  ["cárcel", ["cár", "cel"], 0, "Llana con tilde: CÁR-cel.", 3],
  ["corazón", ["co", "ra", "zón"], 2, "Aguda: cora-ZÓN.", 2],
  ["murciélago", ["mur", "cié", "la", "go"], 1, "Esdrújula: mur-CIÉ-la-go.", 4],
  ["sacamuelas", ["sa", "ca", "mue", "las"], 3, "Aguda sin tilde: sacamue-LAS.", 5],
  ["esperanza", ["es", "pe", "ran", "za"], 2, "Llana: espe-RAN-za.", 3],
  ["cocoliche", ["co", "co", "li", "che"], 3, "Aguda: cocoli-CHE.", 5],
];

export const OYE_ACENTO_PACK: OyeAcentoExercise[] = OYE_ACENTO_ITEMS.map(([word, syllables, answerSyllable, explanation, difficulty], i) => ({
  id: fmtId("oa", "puerto", i),
  type: "oye-acento",
  skill: AUDI,
  difficulty,
  cefr: CEFR_BY_DIFFICULTY[difficulty],
  prompt: "Escucha y marca la sílaba fuerte",
  explanation,
  tags: ["escucha", "prosodia"],
  word,
  syllables,
  answerSyllable,
}));

/** Números al oído. */
const OYE_NUM_ITEMS: [string, string[], number, string, 1 | 2 | 3 | 4 | 5][] = [
  ["cuarenta y dos", ["42", "52", "412"], 0, "Cuatro decenas y dos: 42.", 1],
  ["mil novecientos noventa y cuatro", ["1994", "1984", "1904"], 0, "Mil + novecientos + noventa y cuatro.", 3],
  ["dos mil veinticinco", ["2025", "2005", "2125"], 0, "Veinticinco años del siglo XXI: 2025.", 2],
  ["el once de marzo de dos mil", ["11/03/2000", "13/11/2000", "11/03/2002"], 0, "Día once, mes tres, año 2000.", 3],
  ["tres cuartos", ["3/4", "4/3", "34"], 0, "Tres de cuatro partes: 3/4.", 3],
  ["la mitad", ["1/2", "1/4", "12"], 0, "La mitad = una de dos partes.", 1],
  ["veinticinco por ciento", ["25%", "52%", "0,25"], 0, "Un cuarto del total: 25%.", 2],
  ["ciento cincuenta mil", ["150.000", "15.000", "1.500.000"], 0, "Ciento cincuenta mil: 150.000.", 3],
  ["la una y media", ["1:30", "13:00", "12:30"], 0, "La una hora y media: 1:30.", 2],
  ["nueve coma siete cinco", ["9,75", "975", "97,5"], 0, "Nueve unidades y 75 centésimas.", 4],
];

export const OYE_NUM_PACK: OyeNumeroExercise[] = OYE_NUM_ITEMS.map(([speech, options, answerIndex, explanation, difficulty], i) => ({
  id: fmtId("on", "puerto", i),
  type: "oyenumero",
  skill: AUDI,
  difficulty,
  cefr: CEFR_BY_DIFFICULTY[difficulty],
  prompt: "Escucha el número",
  explanation,
  tags: ["escucha", "cifras"],
  speech,
  options,
  answerIndex,
}));

/* ============================ Torre (expresión) ============================ */

const EXPR: SkillId = "expresion";

/** Chispa inicial: mejor frase de apertura. */
const INICIADORES_ROWS: Row[] = [
  ["Un correo para pedir un aumento de sueldo. ¿Cómo arrancar?", ["Estimada directora: le escribo para exponer los motivos de mi solicitud.", "Hola, ¿qué tal? Te cuento un rollo del curro.", "Soy el mejor empleado de la historia de esta empresa."], 0, "La apertura formal presenta el propósito sin humildad falsa ni sobredosis.", 3],
  ["Una carta al director sobre los perros sin correa en el parque. Primera frase:", ["Cada tarde, el parque se convierte en una pista de obstáculos sin dueño al timón.", "Los perros son malos.", "Os escribo porque mi tía tiene un perro."], 0, "La apertura pintora engancha con la escena y el problema.", 4],
  ["Un cuento infantil. Primera frase:", ["En el Archipiélago de las Palabras había una ballena que coleccionaba mareas.", "Érase una vez un niño.", "Voy a contaros un cuento muy bonito."], 0, "La apertura concreta con imagen mágica invita a seguir leyendo.", 2],
  ["Una redacción sobre la contaminación del mar. Arranque:", ["Cada año, ocho millones de toneladas de plástico encuentran el camino del mar.", "La contaminación es un tema muy importante.", "Yo opino que el mar está sucio."], 0, "El dato con imagen fija el tema con fuerza; las frases vacías no abren nada.", 3],
  ["Una invitación de cumpleaños. Primera frase:", ["¡Prepara tu mejor disfraz de pirata: zarpamos el sábado!", "Te invito a mi cumpleaños, espero que vengas.", "El sábado hay una cosa."], 0, "La invitación con gancho y datos (día + tema) bienvenida.", 2],
  ["Un ensayo sobre los beneficios de la siesta. Apertura:", ["Diez minutos de sueño valen más que una hora de cafeína: la ciencia lo respalda.", "La siesta es buena.", "Voy a hablar de la siesta."], 0, "Tesis con gancho numérico: la mejor apertura de ensayo.", 4],
];

export const INICIADORES_PACK = elige("ii", "torre", "iniciadores", EXPR, INICIADORES_ROWS, "Chispa inicial", "¿Cuál es la mejor frase de apertura?");

/** Cierre redondo. */
const CIERRE_ROWS: Row[] = [
  ["Un discurso de despedida del capitán del barco. Última frase:", ["Que el mar os guarde el rumbo y las palabras.", "Bueno, eso es todo.", "Me voy, adiós."], 0, "El cierre retoma el tema (mar + palabras) con ritmo memorable.", 4],
  ["Una redacción sobre proteger los arrecifes. Remate:", ["Sin coral no hay color: protejamos lo que nos sostiene.", "Y eso fue todo sobre los arrecifes.", "Los arrecifes son bonitos."], 0, "El juego verbal + llamado a la acción cierran con fuerza.", 3],
  ["Un correo pidiendo información sobre un curso. Despedida:", ["Quedo a la espera de su respuesta. Un cordial saludo.", "Contesta pronto.", "Chao."], 0, "La fórmula completa (espera + saludo) es el cierre estándar formal.", 2],
  ["Un cuento donde la ballena aprende a cantar. Frase final:", ["Y desde entonces, cada marea nueva llevaba su canción.", "Fin.", "La ballena seguía ahí."], 0, "El cierre de cuento proyecta el cambio hacia el futuro.", 3],
  ["Una crítica de un restaurante. Cierre:", ["Volveré por el postre; el resto, que lo revise el mar.", "El restaurante es normal.", "No volveré jamás en mi vida."], 0, "El cierre con matiz (volver por el postre) resume el veredicto con gracejo.", 5],
  ["Una carta de agradecimiento a la maestra. Última frase:", ["Gracias por enseñarme que las palabras también saben cuidar.", "Gracias.", "Bueno, gracias por todo."], 0, "El cierre concreta el agradecimiento con la lección aprendida.", 3],
];

export const CIERRE_PACK = elige("ce", "torre", "cierre", EXPR, CIERRE_ROWS, "Cierre redondo", "¿Qué frase cierra mejor el texto?");

/** Retrato con palabras (descripción precisa). */
const DESCRIPCIONES_ROWS: Row[] = [
  ["Describir un atardecer sin la palabra «bonito»:", ["El cielo se derramó en naranjas encendidos y la línea del mar bebió el último oro.", "El atardecer fue muy bonito de verdad.", "Había colores en el cielo."], 0, "La descripción con imágenes concretas y verbos activos pinta sin adjetivos vagos.", 3],
  ["Describir el cansancio de un corredor:", ["Las piernas le pesaban como anclas y el aliento le llegó en sobres.", "Estaba muy cansado.", "Corrió mucho y se agotó."], 0, "La imagen física (anclas, sobres) encarna la sensación.", 3],
  ["Describir un mercado al mediodía:", ["El mercado hervía en gritos redondos y olor a mango tibio.", "Había mucha gente y mucho ruido.", "El mercado estaba lleno."], 0, "Verbos y sensaciones concretas frente a lo genérico.", 4],
  ["Describir la casa de la abuela:", ["La casa olía a pan de ayer y a rosa de papel; los cajones recordaban manos que ya no están.", "La casa era vieja y acogedora.", "Había muebles antiguos."], 0, "La memoria sensorial + el detalle emotivo elevan la descripción.", 5],
  ["Describir un examen difícil:", ["Las preguntas se reían de mí desde el papel; la hora corría más que yo.", "El examen fue dificilísimo.", "No me fue nada bien."], 0, "La personificación transmite la experiencia íntima.", 4],
  ["Describir la lluvia primera del otoño:", ["Las primeras gotas estrenaron el otoño con tambor sobre los tejados.", "Llovió bastante fuerte.", "La lluvia empezó a caer."], 0, "«Estrenaron» y «tambor» hacen presente lo cotidiano.", 3],
];

export const DESCRIPCIONES_PACK = elige("ds", "torre", "descripciones", EXPR, DESCRIPCIONES_ROWS, "Retrato con palabras", "¿Qué versión describe mejor?");

/* ============================ Observatorio (cultura) ============================ */

const CULT: SkillId = "cultura";

/** Mapa de regionalismos. */
const REGIONES_ROWS: Row[] = [
  ["«Che, ¿vamos a tomar unos mates?»", ["Argentina / Uruguay", "España", "México"], 0, "El «che» y el mate son la marca del Río de la Plata.", 2],
  ["«Órale, compadre, ese taco está bien bueno.»", ["México", "Chile", "Cuba"], 0, "«Órale» y los tacos: México.", 2],
  ["«Está pololeando con el vecino.» ( salir con alguien )", ["Chile", "España", "Argentina"], 0, "Pololear es el chilenismo por tener novio.", 3],
  ["«Vamos a la guagua que ya se va.» ( autobús )", ["Cuba / Canarias", "México", "Perú"], 0, "Guagua: Cuba y Canarias comparten la palabra.", 3],
  ["«Pásame la chamarra que hace frío.» ( chaqueta )", ["México", "Argentina", "España"], 0, "Chamarra es la chaqueta en el español mexicano.", 3],
  ["«Qué lindo ese pibe.» ( chico )", ["Argentina", "México", "Colombia"], 0, "Pibe nació en el lunfardo porteño.", 3],
  ["«Traeme una gaseosa bien fría.» ( refresco )", ["Argentina y gran parte de América", "Solo España", "Solo México"], 0, "Gaseosa es el término general en América; en España, refresco.", 3],
  ["«El_auto_está en la cochera.» ( garaje )", ["México", "España", "España y México ambas la usan"], 2, "Ojo: cochera se usa en México y también en España con matices; la opción correcta es la tercera.", 5],
  ["«¿Vamos a un picada de amigos?» ( reunión para picar algo )", ["Argentina", "Cuba", "Perú"], 0, "La picada es el aperitivo argentino por excelencia.", 4],
  ["«Ese plátano está a precio de regalo.»", ["España (y Canarias) ", "México", "Argentina"], 0, "Plátano es el término español; en México, guineo o plátano según la zona; en Argentina, banana.", 3],
];

export const REGIONES_PACK = elige("rg", "observatorio", "regiones", CULT, REGIONES_ROWS, "Mapa de regionalismos", "¿Dónde se dice así?");

/** Falsos amigos. */
const FALSOS_ROWS: Row[] = [
  ["«Estoy embarazada» significa…", ["estar encinta", "estar avergonzada", "estar ocupada"], 0, "Falso amigo clásico: embarrassed ≠ embarazada.", 2],
  ["En inglés, «library» es…", ["biblioteca", "librería", "libertad"], 0, "Library = biblioteca; bookstore = librería.", 2],
  ["«Actualmente» significa…", ["en la actualidad, ahora", "realmente, de hecho", "actualmente y actualmente"], 0, "Actually ≠ actualmente: actually es «de hecho».", 3],
  ["El inglés «assist» es…", ["ayudar, asistir", "asistir a un evento", "ser asistente"], 0, "Attend = asistir a; assist = ayudar.", 4],
  ["«Suceso» en español es…", ["un acontecimiento", "un éxito", "un fracaso"], 0, "Success = éxito; suceso = acontecimiento (bueno o malo).", 3],
  ["El inglés «sensible» es…", ["sensato, razonable", "sensible, sensible", "sensual"], 0, "Sensible (en) = sensato; sensitive = sensible.", 4],
  ["«Constipado» significa…", ["estar resfriado", "estar estreñido", "estar harto"], 0, "Constipated ≠ constipado: resfriado.", 3],
  ["El inglés «lecture» es…", ["una clase o conferencia", "una lectura", "una conferencia de prensa"], 0, "Lecture = disertación académica; reading = lectura.", 4],
  ["«Largo» significa…", ["de gran longitud", "ancho", "pesado"], 0, "Large = grande; largo = de gran longitud (no «large»).", 3],
  ["El inglés «fabric» es…", ["tela", "fábrica", "fabricación"], 0, "Fabric = tela; factory = fábrica.", 3],
];

export const FALSOS_PACK = elige("fs", "observatorio", "falsosamigos", CULT, FALSOS_ROWS, "Falsos amigos ES-EN", "Cuidado con la traducción: ¿cuál es la correcta?");
