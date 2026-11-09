/**
 * Bancos de contenido y generadores del Salón · Mega-actualización 6.
 * ----------------------------------------------------------------
 * Todo el contenido educativo de los 29 juegos nuevos del Salón vive
 * aquí, separado de la vista. Formatos:
 *  - Bancos de frases: [pregunta, respuesta, distractor1, distractor2, distractor3]
 *  - Generadores: función pura (nivel) → { q, hint?, options, correct }
 * El contenido es original y de uso educativo (sin imágenes ni citas
 * protegidas: solo frases hechas del español y referencias breves a
 * la cultura popular, que no son material protegible).
 */

export interface BlitzItem {
  q: string;
  hint?: string;
  options: string[];
  correct: number;
}

/** Rota las 4 opciones de un ítem para repartir la correcta entre las
 *  posiciones de forma estable por índice (sin random en render). */
function rotItem(q: string, a: string, d1: string, d2: string, d3: string, i: number): BlitzItem {
  const flat = [a, d1, d2, d3].map((o) => o.trim());
  const rot = i % 4;
  const options = flat.slice(rot).concat(flat.slice(0, rot));
  return { q, options, correct: options.indexOf(a.trim()) };
}

type Bank4 = [string, string, string, string, string];

/* ============================ MEMES Y CULTURA POP ============================
 * «Traducción» al español estándar de expresiones de internet y cultura
 * popular: humor en contexto, con registro coloquial bien marcado. */

const MEMES_RAW: Bank4[] = [
  ["«Ir a su bola» significa…", "hacer las cosas por su cuenta, sin el grupo", "ir muy rápido en bici", "buscar pelea", "estar perdido"],
  ["«Molar» significa…", "gustar, ser genial", "ser aburrido", "moleder algo", "estar roto"],
  ["«Curro» es, en España…", "el trabajo", "una fiesta", "un postre", "un baile"],
  ["«Estar hecho polvo» significa…", "estar muy cansado", "ensuciarse con polvo", "estar enfadado", "estar perdido"],
  ["«Meter la pata» significa…", "cometer un error", "pisar el césped", "hacer trampa", "llegar tarde"],
  ["«Dar en el clavo» significa…", "acertar de lleno", "golpear una pared", "clavar un cuadro", "hacerse daño"],
  ["«Tomar el pelo» significa…", "burlarse en broma", "peinarse a otro", "halagar de verdad", "contar un secreto"],
  ["«Ser un crac» significa…", "ser muy bueno en algo", "estar agrietado", "hacer mucho ruido", "romper cosas"],
  ["«Ponerse las pilas» significa…", "esforzarse de verdad", "cambiar baterías", "ponerse nervioso", "irse de viaje"],
  ["«Echar una mano» significa…", "ayudar", "despedir a alguien", "saludar de lejos", "pedir permiso"],
  ["«Ser pan comido» significa…", "ser muy fácil", "comer mucho pan", "estar delicioso", "acabar mal"],
  ["«Tirar la toalla» significa…", "rendirse", "irse a duchar", "terminar el ejercicio", "perder la llave"],
  ["«Estar en el quinto pino» significa…", "estar muy lejos", "estar en una fiesta", "estar contento", "estar de guardia"],
  ["«Ir viento en popa» significa…", "avanzar muy bien", "tener mucho frío", "hablar sin parar", "estar mareado"],
  ["«Matar dos pájaros de un tiro» significa…", "resolver dos cosas a la vez", "gastar doble", "perder dos veces", "apuntar muy bien"],
  ["«No tener pelos en la lengua» significa…", "hablar con franqueza", "hablar con acento", "estar sin voz", "contar chistes"],
  ["«Pagar el pato» significa…", "cargar con la culpa sin ser culpable", "comprar un pato", "invitar a todos", "perder dinero en la feria"],
  ["«Ser agua pasada» significa…", "haber quedado en el pasado", "haber causado una inundación", "estar mojado", "ser muy lento"],
  ["«Al pie de la letra» significa…", "exactamente como está escrito", "con letra muy pequeña", "con muchos errores", "firma incluida"],
  ["«Quedarse de piedra» significa…", "quedarse muy sorprendido", "ponerse rígido de frío", "olvidarlo todo", "no poder moverse"],
  ["«Estar entre la espada y la pared» significa…", "tener que elegir entre dos opciones malas", "esconderse de alguien", "estar en un pasillo estrecho", "practicar esgrima"],
  ["«Ponerse las botas» significa…", "comer en abundancia", "equiparse de montaña", "ponerse furioso", "aprobar todo"],
  ["«Ser uña y mugre» significa…", "ser amigos inseparables", "estar muy sucios", "pelearse siempre", "compartir comida"],
  ["«No es un bug, es una función no documentada» es humor de…", "programación: presentar el error como si fuera intencional", "cocina: recetas sin pasos", "cine: guiones sin final", "moda: estilos sin etiqueta"],
  ["«F en el chat» se usa para…", "dejar un tributo humorístico a un fracaso", "calificar con la letra F", "escribir más rápido", "pedir el fin del juego"],
  ["«Ser basado» (slang de internet) significa…", "opinar con valentía sin importar lo que digan", "vivir en la montaña", "hablar solo de datos", "copiar a otros"],
  ["«Dar ratio» significa…", "superar a alguien en apoyos para dejarlo en ridículo", "calcular mal", "responder muy rápido", "dar las gracias"],
  ["«Hacer speedrun» significa…", "hacer algo muy rápido, saltándose pasos", "correr cada mañana", "grabar un vídeo largo", "jugar sin ganas"],
  ["«Ser un NPC» significa…", "actuar en piloto automático, sin pensar", "ser el protagonista", "ganar siempre", "tener muchos seguidores"],
  ["El «lore» de algo es…", "su historia de fondo, su mitología propia", "su precio", "su manual de uso", "su equipo técnico"],
  ["«Estar roto» u «OP» (de videojuegos) significa…", "estar desequilibradamente poderoso", "necesitar reparación", "estar fuera de pantalla", "haber perdido el internet"],
  ["Un «spoiler» es…", "revelar un giro de la historia antes de tiempo", "un anuncio oficial", "un personaje secundario", "el final feliz"],
  ["Un «canon event» es…", "un suceso inevitable que te forma como persona", "una reunión de fans", "un capítulo recortado", "una frase de marketing"],
  ["«Vibear» significa…", "disfrutar del ambiente sin pensar demasiado", "vibrar con la música alta", "trabajar en ritmo", "dormir siesta"],
  ["«Cancelar» a alguien (en redes) significa…", "dejar de apoyarlo públicamente por algo que hizo", "borrar su cumpleaños", "escribirle una carta", "ponerle un apodo"],
  ["«Qué chafa» (México) significa…", "de mala calidad", "muy barato solo hoy", "muy divertido", "de mucha suerte"],
  ["«Ser buena onda» (LatAm) significa…", "ser simpático y amable", "tener mala suerte", "estar enfermo", "ser el jefe"],
  ["«Estar como una cabra» significa…", "estar loco (dicho con cariño)", "trepar mucho", "comer de todo", "dormir en la montaña"],
  ["«De tal palo, tal astilla» enseña que…", "los hijos se parecen a los padres", "la madera se parte sola", "los árboles crecen derechos", "hay que recoger leña"],
  ["«Dime con quién andas y te diré quién eres» enseña que…", "tus compañías dicen mucho de ti", "hay que caminar acompañado", "los nombres importan", "andar es salud"],
];

export const MEMES_BANK: BlitzItem[] = MEMES_RAW.map(([q, a, d1, d2, d3], i) => rotItem(q, a, d1, d2, d3, i));

/* ============================ SINÓNIMOS ============================ */

const SINONIMOS_RAW: Bank4[] = [
  ["alegre", "contento", "triste", "cansado", "serio"],
  ["triste", "apenado", "feliz", "furioso", "brillante"],
  ["rápido", "veloz", "lento", "pesado", "tierno"],
  ["lento", "pausado", "veloz", "brusco", "efímero"],
  ["bonito", "hermoso", "horrible", "minúsculo", "barato"],
  ["grande", "enorme", "diminuto", "frágil", "oscuro"],
  ["pequeño", "minúsculo", "gigante", "ruidoso", "valiente"],
  ["inteligente", "listo", "torpe", "olvidadizo", "dulce"],
  ["fuerte", "robusto", "frágil", "suave", "miedo"],
  ["débil", "frágil", "robusto", "salvaje", "brillante"],
  ["valiente", "audaz", "cobarde", "vago", "silencioso"],
  ["cobarde", "miedoso", "audaz", "orgulloso", "generoso"],
  ["limpio", "impecable", "mugriento", "pegajoso", "ralo"],
  ["sucio", "mugriento", "impecable", "brillante", "seco"],
  ["fácil", "sencillo", "complicado", "inútil", "lento"],
  ["difícil", "complicado", "sencillo", "barato", "dulce"],
  ["caminar", "andar", "volar", "nadie", "dormir"],
  ["saltar", "brincar", "arrastrarse", "susurrar", "temblar"],
  ["pensar", "reflexionar", "gritar", "olvidar", "brillar"],
  ["responder", "contestar", "preguntar", "callar", "olvidar"],
  ["empezar", "comenzar", "terminar", "pausar", "perder"],
  ["terminar", "finalizar", "comenzar", "iniciar", "romper"],
  ["guardar", "almacenar", "botar", "mostrar", "olvidar"],
  ["encontrar", "hallar", "extraviar", "ignorar", "vender"],
  ["perder", "extraviar", "hallar", "ganar", "hallazgo"],
  ["ayudar", "auxiliar", "estorbar", "dañar", "ignorar"],
  ["dañar", "perjudicar", "sanar", "curar", "mejorar"],
  ["amar", "adorar", "detestar", "ignorar", "temer"],
  ["odiar", "detestar", "adorar", "querer", "admirar"],
  ["hablar", "conversar", "silenciar", "escribir", "dormir"],
  ["mirar", "observar", "ignorar", "ocultar", "tocar"],
  ["comprar", "adquirir", "vender", "regalar", "perder"],
  ["contento", "satisfecho", "furioso", "nervioso", "hambriento"],
  ["tranquilo", "sereno", "agitado", "ruidoso", "frío"],
  ["listo", "astuto", "lento", "dormido", "salado"],
  ["gracioso", "divertido", "serio", "aburrido", "malo"],
  ["valioso", "preciado", "barato", "inservible", "ligero"],
  ["antiguo", "añejo", "modernísimo", "nuevo", "pequeño"],
  ["seguro", "fiable", "peligroso", "dudoso", "frágil"],
  ["silencioso", "callado", "estridente", "musical", "veloz"],
];

export const SINONIMOS_BANK: BlitzItem[] = SINONIMOS_RAW.map(([w, a, d1, d2, d3], i) =>
  rotItem(`¿Qué palabra significa lo mismo que «${w}»?`, a, d1, d2, d3, i));

/* ============================ ANTÓNIMOS ============================ */

const ANTONIMOS_RAW: Bank4[] = [
  ["alto", "bajo", "elevado", "grande", "claro"],
  ["ancho", "estrecho", "grueso", "largo", "abierto"],
  ["claro", "oscuro", "brillante", "limpio", "suave"],
  ["caliente", "frío", "tibio", "ardiente", "dulce"],
  ["nuevo", "viejo", "moderno", "recién", "brillante"],
  ["joven", "anciano", "niño", "alegre", "pequeño"],
  ["dulce", "amargo", "azucarado", "sabroso", "blando"],
  ["seco", "húmedo", "árido", "cálido", "frío"],
  ["lleno", "vacío", "colmado", "rebosante", "cerrado"],
  ["abierto", "cerrado", "libre", "ancho", "nuevo"],
  ["arriba", "abajo", "encima", "cerca", "dentro"],
  ["antes", "después", "pronto", "ahora", "temprano"],
  ["siempre", "nunca", "otra vez", "hoy", "aún"],
  ["todo", "nada", "mucho", "cada", "más"],
  ["día", "noche", "mañana", "tarde", "sol"],
  ["entrar", "salir", "llegar", "quedar", "abrir"],
  ["subir", "bajar", "trepar", "escalar", "saltar"],
  ["avanzar", "retroceder", "correr", "seguir", "pasar"],
  ["ganar", "perder", "triunfar", "lograr", "compartir"],
  ["dar", "recibir", "ofrecer", "entregar", "compartir"],
  ["amor", "odio", "cariño", "afecto", "paz"],
  ["guerra", "paz", "batalla", "tregua", "arma"],
  ["ruido", "silencio", "música", "grito", "eco"],
  ["luz", "oscuridad", "brillo", "faro", "fuego"],
  ["cerca", "lejos", "al lado", "próximo", "junto"],
  ["temprano", "tarde", "pronto", "ayer", "luego"],
  ["rápido", "despacio", "ligero", "presto", "vivo"],
  ["duro", "blando", "rígido", "sólido", "frío"],
  ["caro", "barato", "costoso", "valioso", "rico"],
  ["largo", "corto", "extenso", "grande", "alto"],
  ["gordo", "delgado", "regordete", "ancho", "pesado"],
  ["feliz", "triste", "alegre", "radiante", "suerte"],
  ["generoso", "tacaño", "dadivoso", "noble", "rico"],
  ["amable", "grosero", "cortés", "dulce", "bueno"],
  ["ordenado", "desordenado", "limpio", "metódico", "listo"],
  ["mojado", "seco", "húmedo", "empapado", "frío"],
  ["juntos", "separados", "unidos", "mezclados", "cerca"],
  ["empezar", "acabar", "iniciar", "abrir", "seguir"],
  ["ahorrar", "gastar", "guardar", "invertir", "comprar"],
  ["recordar", "olvidar", "anotar", "repasar", "guardar"],
];

export const ANTONIMOS_BANK: BlitzItem[] = ANTONIMOS_RAW.map(([w, a, d1, d2, d3], i) =>
  rotItem(`¿Cuál es el antónimo de «${w.trim()}»?`, a, d1, d2, d3, i));

/* ============================ ORTOGRAFÍA RELÁMPAGO ============================ */

const ORTOGRAFIA_RAW: Bank4[] = [
  ["«Vamos ____ cómo acaba la serie»", "a ver", "haber", "aver", "saber"],
  ["«¿____ terminado ya la tarea?»", "Has", "As", "Haz", "Hace"],
  ["«Ayer no ____ luz en todo el barrio»", "hubo", "tubo", "uso", "abuso"],
  ["«El agua salió por el ____ roto»", "tubo", "tuvo", "tobo", "dubo"],
  ["«El pastel ya está ____»", "hecho", "echo", "pesco", "recho"],
  ["«Te ____ de menos»", "echo", "hecho", "huso", "osho"],
  ["«Ojalá ____ pronto la visita»", "vaya", "baya", "valla", "calle"],
  ["«La ____ maduró en el arbusto»", "baya", "vaya", "valla", "gaya"],
  ["«La moto saltó la ____»", "valla", "baya", "vaya", "paya"],
  ["«Ante la pregunta, se ____»", "calló", "cayó", "caló", "halló"],
  ["«La taza ____ al suelo»", "cayó", "calló", "caló", "vayó"],
  ["«El impuesto ____ los refrescos»", "grava", "graba", "clava", "lava"],
  ["«Ayer ____ un vídeo de búhos»", "grabé", "gravé", "clavé", "lavé"],
  ["«Caminamos ____ la orilla»", "hasta", "asta", "posta", "data"],
  ["«Izaron la ____ del barco»", "asta", "hasta", "posta", "gasta"],
  ["«La piscina es muy ____»", "honda", "onda", "ronda", "fonda"],
  ["«Una ____ sonora viajó por el aire»", "onda", "honda", "ronda", "fonda"],
  ["«Cubrió el tejado con ____ nuevas»", "losa", "loza", "musa", "lusa"],
  ["«El vaso era de ____ pintada»", "loza", "losa", "goza", "poza"],
  ["«____ estudias, no apruebas» (condicional)", "Si no", "Sino", "Sinó", "Asino"],
  ["«No es caro, ____ barato»", "sino", "si no", "destino", "camino"],
  ["«No dudó, ____ que lo hizo sin miedo»", "sino", "si no", "destino", "camino"],
  ["«Compró pan ____ leche»", "y", "lli", "hi", "í"],
  ["«____ mucho frío aquí»", "Hace", "Ase", "Hase", "Asse"],
  ["«Vamos ____ norte»", "hacia", "hasia", "acía", "pacia"],
  ["«____ muchas ganas de verte»", "Tengo", "Tiengo", "Tango", "Tinga"],
  ["«El ____ del bosque cantaba»", "ruiseñor", "ruiceñor", "ruisseñot", "ruiceñot"],
  ["«Casi ____ de la risa»", "lloro", "yoro", "yorro", "llorro"],
  ["«Qué buen ____ tienen estas flores»", "olor", "odol", "ollor", "olór"],
  ["«El chef preparó un ____ delicioso»", "guiso", "guizo", "guisso", "duzo"],
  ["«Aprobé ____ estudiar mucho» (causa)", "por", "para", "pór", "pork"],
  ["«Lo hago ____ ayudarte» (finalidad)", "para", "por", "póra", "pork"],
  ["«Guardó el secreto bajo ____» (llave)", "llave", "yave", "lave", "yabe"],
];

export const ORTOGRAFIA_BANK: BlitzItem[] = ORTOGRAFIA_RAW.map(([q, a, d1, d2, d3], i) => ({
  q,
  options: [a, d1, d2, d3].map((o) => o.replace(/-2$/, "")),
  correct: i % 4,
}));

/* ============================ GÉNERO (EL / LA) ============================ */

const GENERO_RAW: Bank4[] = [
  ["____ agua está fría", "El", "La", "Lo", "Los"],
  ["____ águila voló alto", "El", "La", "Lo", "Un"],
  ["____ ave cantaba al alba", "El", "La", "Lo", "Una"],
  ["____ arma era antigua", "El", "La", "Lo", "Un"],
  ["____ alma es generosa", "El", "La", "Lo", "Un"],
  ["____ mapa es de Europa", "El", "La", "Lo", "Los"],
  ["____ mano está fría", "La", "El", "Lo", "Las"],
  ["____ día es largo", "El", "La", "Lo", "Un"],
  ["____ problema es grave", "El", "La", "Lo", "Las"],
  ["____ tema gusta mucho", "El", "La", "Lo", "Las"],
  ["____ idioma es difícil", "El", "La", "Lo", "Las"],
  ["____ clima es húmedo", "El", "La", "Lo", "Las"],
  ["____ sistema funciona", "El", "La", "Lo", "Las"],
  ["____ poema es breve", "El", "La", "Lo", "Las"],
  ["____ síntoma mejoró", "El", "La", "Lo", "Las"],
  ["____ programa es nuevo", "El", "La", "Lo", "Las"],
  ["____ diploma está listo", "El", "La", "Lo", "Las"],
  ["____ avión aterrizó", "El", "La", "Lo", "Las"],
  ["____ mesa es de roble", "La", "El", "Lo", "Los"],
  ["____ sol brilla", "El", "La", "Lo", "Los"],
  ["____ luna salió", "La", "El", "Lo", "Las"],
  ["____ libro es bueno", "El", "La", "Lo", "Los"],
  ["____ señal es clara", "La", "El", "Lo", "Las"],
  ["____ piel es sensible", "La", "El", "Lo", "Las"],
  ["____ miel es dulce", "La", "El", "Lo", "Las"],
  ["____ clase empieza", "La", "El", "Lo", "Las"],
  ["____ lección es fácil", "La", "El", "Lo", "Las"],
  ["____ puerta está abierta", "La", "El", "Lo", "Las"],
];

export const GENERO_BANK: BlitzItem[] = GENERO_RAW.map(([q, a, d1, d2, d3], i) => ({
  q: `Completa con el artículo correcto: «${q}»`,
  options: [a, d1, d2, d3],
  correct: i % 4,
}));

/* ============================ REFRANES ============================ */

const REFANES_RAW: Bank4[] = [
  ["«Más vale tarde que ____»", "nunca", "siempre", "mañana", "ayer"],
  ["«No dejes para mañana lo que puedas hacer ____»", "hoy", "luego", "tarde", "ya"],
  ["«A quien madruga, ____ le ayuda»", "Dios", "el sol", "la cama", "el café"],
  ["«En casa del herrero, cuchillo de ____»", "palo", "oro", "acero", "hierro"],
  ["«El que la hace la ____»", "paga", "gana", "come", "ve"],
  ["«Camarón que se duerme se lo lleva la ____»", "corriente", "ola", "red", "marea"],
  ["«Obras son amores, que no buenas ____»", "razones", "palabras", "cartas", "flores"],
  ["«Donde manda capitán no ____ marinero»", "manda", "obedece", "nada", "cobra"],
  ["«El que busca, ____»", "encuentra", "duerme", "vuela", "canta"],
  ["«Perro que ladra no ____»", "muerde", "corre", "come", "late"],
  ["«Agua que no has de beber, ____»", "déjala correr", "guárdala", "bébela", "véndela"],
  ["«Zapatero a tus ____»", "zapatos", "herramientas", "medias", "hijos"],
  ["«Aunque la mona se vista de seda, mona ____»", "se queda", "se va", "se ríe", "se viste"],
  ["«El tiempo lo ____ todo»", "cura", "gana", "bora", "mide"],
  ["«Quien siembra vientos, recoge ____»", "tempestades", "flores", "trigo", "granos"],
  ["«No hay mal que dure cien años, ni cuerpo que lo ____»", "resista", "duerma", "baile", "compre"],
  ["«Cuando el río suena, agua ____»", "lleva", "falta", "bebe", "vende"],
  ["«Un clavo saca otro ____»", "clavo", "martillo", "palo", "hierro"],
  ["«Quien canta su mal ____»", "espanta", "come", "dobra", "olvida"],
  ["«En boca cerrada no entran ____»", "moscas", "palabras", "llaves", "problemas"],
  ["«Quien mucho abarca, poco ____»", "aprieta", "alcanza", "gana", "cobra"],
  ["«A buen entendedor, ____ palabras bastan»", "pocas", "muchas", "largas", "duras"],
  ["«Lo hecho, ____ está»", "hecho", "cocido", "vendido", "firmado"],
  ["«Gato escaldado, del agua fría ____»", "huye", "bebe", "se baña", "duerme"],
  ["«Tanto va el cántaro a la fuente que al final se ____»", "rompe", "llena", "cansa", "pierde"],
  ["«Más vale prevenir que ____»", "curar", "llorar", "correr", "gastar"],
  ["«Cada uno sabe dónde le aprieta el ____»", "zapato", "sombrero", "cinturón", "botón"],
  ["«Más vale pájaro en mano que ____ volando»", "cien", "dos", "mil", "muchos"],
];

export const REFANES_BANK: BlitzItem[] = REFANES_RAW.map(([q, a, d1, d2, d3], i) => ({
  q,
  options: [a.trim(), d1.trim().replace(/-2$/, ""), d2.trim().replace(/-2$/, ""), d3.trim().replace(/-2$/, "")],
  correct: i % 4,
}));

/* ============================ COLECTIVOS ============================ */

const COLECTIVOS_RAW: Bank4[] = [
  ["lobos", "manada", "enjambre", "bandada", "piara"],
  ["abejas", "enjambre", "manada", "cardumen", "jauría"],
  ["peces", "cardumen", "bandada", "piara", "manada"],
  ["aves", "bandada", "enjambre", "jauría", "rebaño"],
  ["cerdos", "piara", "rebaño", "manada", "flota"],
  ["ovejas", "rebaño", "jauría", "bandada", "enjambre"],
  ["perros (de caza)", "jauría", "manada", "rebaño", "piara"],
  ["barcos", "flota", "bandada", "cardumen", "alameda"],
  ["libros", "biblioteca", "archivo", "ramillete", "viñedo"],
  ["flores", "ramillete", "bosque", "olivar", "jauría"],
  ["álamos", "alameda", "olivar", "viñedo", "pinar"],
  ["olivos", "olivar", "alameda", "arboleda", "maizal"],
  ["vides", "viñedo", "olivar", "pinar", "cañaveral"],
  ["árboles", "arboleda", "escuela", "ramillete", "flota"],
  ["pinos", "pinar", "olivar", "viñedo", "zarzal"],
  ["cañas", "cañaveral", "pinar", "arboleda", "manada"],
  ["zarzas", "zarzal", "cañaveral", "olivar", "rebaño"],
  ["maíz (plantas)", "maizal", "cafetal", "arrozal", "viñedo"],
  ["cafetos", "cafetal", "maizal", "arrozal", "trigal"],
  ["trigo (plantas)", "trigal", "cafetal", "maizal", "olivar"],
  ["soldados", "ejército", "jauría", "bandada", "clero"],
  ["clérigos", "clero", "ejército", "bandada", "piara"],
  ["billetes (papel)", "fajo", "haz", "ramillete", "flota"],
  ["leña", "haz", "fajo", "piara", "arboleda"],
  ["focas", "colonia", "manada", "piara", "bandada"],
  ["lobos marinos", "colonial", "bandada", "flota", "haz"],
];

export const COLECTIVOS_BANK: BlitzItem[] = COLECTIVOS_RAW.map(([w, a, d1, d2, d3], i) => ({
  q: `¿Cómo se llama el conjunto de ${w}?`,
  options: [a.replace(/-2$/, ""), d1.replace(/-2$/, ""), d2.replace(/-2$/, ""), d3.replace(/-2$/, "")],
  correct: i % 4,
}));

/* ============================ AUMENTATIVOS Y DIMINUTIVOS ============================ */

const SUFIJOS_RAW: Bank4[] = [
  ["«casona»", "casa grande", "casa pequeña", "casa antigua", "casa barata"],
  ["«casita»", "casa pequeña (con cariño)", "casa enorme", "casa vacía", "casa ruidosa"],
  ["«librote»", "libro grande y pesado", "libro pequeño", "libro caro", "libro roto"],
  ["«papelote»", "papel grande", "papel diminuto", "papel arrugado", "papel caro"],
  ["«hombrón»", "hombre grande y fuerte", "hombre amable", "hombre pequeño", "hombre joven"],
  ["«hombrecito»", "hombre pequeño (a veces con cariño)", "hombre gigante", "hombre feroz", "hombre rico"],
  ["«perrito»", "perro pequeño o querido", "perro feroz", "perro gigante", "perro callado"],
  ["«gatito»", "gato pequeño o querido", "gato salvaje", "gato enorme", "gato veloz"],
  ["«vozarrón»", "voz muy fuerte", "voz muy baja", "voz dulce", "voz rota"],
  ["«manaza»", "mano muy grande", "mano diminuta", "mano fría", "mano rápida"],
  ["«abuelito»", "abuelo querido", "abuelo severo", "abuelo joven", "abuelo lejano"],
  ["«libraco»", "libro grande", "libro malo", "libro corto", "libro nuevo"],
  ["«portazo»", "golpe fuerte de una puerta", "puerta pequeña", "puerta abierta", "puerta dorada"],
  ["«campanazo»", "golpe fuerte de campana (o suceso resonante)", "campana pequeña", "campana silenciosa", "campana antigua"],
  ["«golpazo»", "golpe fuerte", "golpe suave", "golpe rápido", "golpe fingido"],
  ["«momentazo»", "gran momento", "momento breve", "momento aburrido", "momento final"],
  ["«juegazo»", "juego buenísimo", "juego malo", "juego corto", "juego caro"],
  ["«gordito»", "con cariño: un poco regordete", "muy delgado", "muy alto", "muy rápido"],
  ["«riachuelo»", "río pequeño", "río caudaloso", "río helado", "río sucio"],
  ["«callejón»", "calle estrecha y larga", "calle ancha", "calle nueva", "calle principal"],
  ["«sillón»", "silla grande y cómoda", "silla de madera", "silla plegable", "silla pequeña"],
  ["«ventanilla»", "ventana pequeña", "ventana enorme", "puerta principal", "techo"],
];

export const SUFIJOS_BANK: BlitzItem[] = SUFIJOS_RAW.map(([q, a, d1, d2, d3], i) => ({
  q: `¿Qué significa ${q}?`,
  options: [a, d1, d2, d3],
  correct: i % 4,
}));

/* ============================ CONECTORES ============================ */

const CONECTORES_RAW: Bank4[] = [
  ["Estudio mucho; ____, apruebo los exámenes.", "por lo tanto", "sin embargo", "aunque", "mientras"],
  ["No me gusta el café; ____, lo bebo por la mañana.", "sin embargo", "por eso", "además", "es decir"],
  ["____ llovía, fuimos a la playa.", "Aunque", "Porque", "Por lo tanto", "Es decir"],
  ["Llegó tarde ____ el tráfico.", "debido a", "sin embargo", "aunque", "por lo tanto"],
  ["No vino ____ estaba enfermo.", "porque", "aunque", "sin embargo", "por lo tanto"],
  ["Quiero viajar; ____, necesito ahorrar.", "así que", "aunque", "es decir", "sin embargo"],
  ["El plan falló; ____, todos disfrutamos.", "aun así", "por eso", "debido a", "es decir"],
  ["____ estudies cada día, aprobarás.", "Siempre que", "A pesar de", "Debido a", "Sin embargo"],
  ["____ terminar el trabajo, fuimos a cenar.", "Al", "Aunque", "Debido a", "Sin embargo"],
  ["Le pregunté ____ vendría mañana.", "si", "que", "por", "aunque"],
  ["____ el calor, salimos a caminar.", "A pesar de", "Debido a", "Por lo tanto", "Es decir"],
  ["Era tarde; ____, decidimos continuar.", "no obstante", "por eso", "así que", "es decir"],
  ["Resumiendo: ____, el viaje fue un éxito.", "en definitiva", "sin embargo", "aunque", "mientras"],
  ["Ni estudia ____ trabaja.", "ni", "y", "o", "que"],
  ["¿Quieres té ____ café?", "o", "ni", "y", "que"],
  ["Hablamos ____ llegáramos a un acuerdo.", "hasta que", "desde que", "mientras", "porque"],
  ["____ nació, vive en la misma casa.", "Desde que", "Hasta que", "Aunque", "Debido a"],
  ["No aprobará ____ no estudie.", "a menos que", "porque", "debido a", "es decir"],
  ["El examen fue fácil; ____, nadie suspendió.", "de hecho", "sin embargo", "aunque", "por eso"],
  ["Compré pan, leche ____ huevos.", "y", "ni", "o", "que"],
  ["____ cansado, siguió trabajando.", "Aunque estaba", "Debido a", "Por lo tanto", "Es decir"],
  ["Trabaja ____ herramienta del taller.", "como", "que", "de", "si"],
  ["____ oye, no entiende nada.", "Por más que", "Debido a", "Por lo tanto", "Es decir"],
  ["Gritó ____ lo oyera todo el vecindario.", "para que", "porque", "aunque", "que"],
  ["Salió ____ llovía fuerte.", "aunque", "porque", "para que", "por lo tanto"],
  ["____ digan los demás, sigue tu rumbo.", "Lo que", "Debido a", "Por lo tanto", "Es decir"],
];

export const CONECTORES_BANK: BlitzItem[] = CONECTORES_RAW.map(([q, a, d1, d2, d3], i) => ({
  q,
  options: [a, d1, d2, d3],
  correct: i % 4,
}));

/* ============================ CURIOSIDADES (VERDADERO / FALSO) ============================ */

const CURIOSIDADES_RAW: [string, boolean][] = [
  ["El corazón de un camarón está en su cabeza.", true],
  ["Los pulpos tienen tres corazones.", true],
  ["La miel caduca en pocos meses.", false],
  ["Un rayo es más caliente que la superficie del Sol.", true],
  ["Los tiburones existían antes que los árboles.", true],
  ["La Torre Eiffel crece unos centímetros en verano.", true],
  ["Un día en Venus dura más que su año.", true],
  ["El animal más rápido del mundo es el guepardo.", false],
  ["Botánicamente, la fresa es una baya y el plátano no.", false],
  ["En la Antártida hay un desierto.", true],
  ["La Gran Muralla se ve a simple vista desde la Luna.", false],
  ["Los murciélagos son ciegos.", false],
  ["Botánicamente, el tomate es una fruta.", true],
  ["Napoleón era mucho más bajo que la media de su época.", false],
  ["La montaña más lejana al centro de la Tierra es el Chimborazo.", true],
  ["Solo los mosquitos hembras pican.", true],
  ["La palabra «sándwich» viene de un conde inglés.", true],
  ["Las medusas no tienen cerebro ni corazón.", true],
  ["Los pingüinos viven en el Ártico.", false],
  ["El ajedrez nació en la India.", true],
  ["El papel se inventó en China.", true],
  ["Los romanos usaban orina como detergente.", true],
  ["El primer «bug» informático fue literalmente un insecto.", true],
  ["La sangre venosa es azul.", false],
  ["El idioma con más hablantes nativos es el mandarín.", true],
  ["El español tiene más hablantes nativos que el inglés.", true],
  ["El chocolate nació en Europa.", false],
  ["Las jirafas rugen como los leones.", false],
  ["Las bananas son bayas botánicamente.", true],
  ["El agua caliente nunca se congela más rápido que la fría.", false],
  ["Los humanos compartimos más del 50 % de genes con el plátano.", true],
  ["Un siglo tiene 100 años y un milenio, 1000.", true],
  ["La capital de Australia es Sídney.", false],
  ["El océano más grande es el Pacífico.", true],
  ["El espresso contiene más cafeína por mililitro que el café de filtro.", true],
  ["Los dientes de leche de un bebé empiezan a formarse antes de nacer.", true],
];

export const CURIOSIDADES_BANK: BlitzItem[] = CURIOSIDADES_RAW.map(([q, v]) => ({
  q,
  // La correcta siempre queda primera; el orden se alterna para no adivinar por posición.
  options: v ? ["Verdadero", "Falso"] : ["Falso", "Verdadero"],
  correct: 0,
}));

/* ============================ MAYÚSCULAS Y MINÚSCULAS ============================ */

const MAYUSCULAS_RAW: [string, boolean][] = [
  ["los lunes", false],
  ["Juan", true],
  ["España", true],
  ["enero", false],
  ["«río» en «el río Ebro»", false],
  ["Madrid", true],
  ["«señor» en «el señor García»", false],
  ["«Universidad» en «la Universidad Complutense»", true],
  ["medicina (la carrera)", false],
  ["Navidad", true],
  ["Dios (en religión)", true],
  ["«dioses» en «los dioses griegos»", false],
  ["argentino (gentilicio)", false],
  ["«Mayor» en «calle Mayor»", true],
  ["«calle» en «calle Mayor»", false],
  ["español (idioma)", false],
  ["«Segunda» en «la Segunda Guerra Mundial»", true],
  ["«siglo» en «el siglo XX»", false],
  ["la Biblia", true],
  ["el Principado de Asturias", true],
  ["martes (día de la semana)", false],
  ["primavera (estación)", false],
  ["«sur» en «vivimos en el sur»", false],
  ["ONU", true],
  ["Nike (marca)", true],
  ["«después» en «Después almorzamos» (tras punto)", true],
  ["un libro de historias", false],
  ["«pacífico» en «el océano Pacífico»", false],
];

export const MAYUSCULAS_BANK: BlitzItem[] = MAYUSCULAS_RAW.map(([q, mayus]) => ({
  q: `¿Se escribe con mayúscula: «${q}»?`,
  options: mayus ? ["Mayúscula", "Minúscula"] : ["Minúscula", "Mayúscula"],
  correct: 0,
}));

/* ============================ GENERADORES PROCEDURALES ============================ */

const rnd = (a: number, b: number) => Math.floor(a + Math.random() * (b - a + 1));

/** Fracciones: ¿cuánto es a/b de c? */
export function genFracciones(level: number): BlitzItem {
  const b = rnd(2, 5 + level);
  const a = rnd(1, b - 1);
  const c = b * rnd(2, 4 + level);
  const res = (c / b) * a;
  const wrong1 = res + b, wrong2 = res - a <= 0 ? res + a : res - a, wrong3 = res + a;
  const options = [`${res}`, `${wrong1}`, `${wrong2}`, `${wrong3}`];
  return { q: `¿Cuánto es ${a}/${b} de ${c}?`, options, correct: 0 };
}

/** Potencias y raíces. */
export function genPotencias(level: number): BlitzItem {
  if (Math.random() < 0.5) {
    const base = rnd(2, 6 + Math.min(level, 6));
    const exp = rnd(2, 3);
    const res = base ** exp;
    return { q: `${base}${exp === 2 ? "²" : "³"}`, options: [`${res}`, `${base * exp}`, `${res + base}`, `${res - base > 0 ? res - base : res + 1}`], correct: 0 };
  }
  const root = rnd(2, 12 + level * 2);
  return { q: `√${root * root}`, options: [`${root}`, `${root + 1}`, `${root - 1 > 0 ? root - 1 : root + 2}`, `${root * 2}`], correct: 0 };
}

/** Porcentajes. */
export function genPorcentajes(level: number): BlitzItem {
  const pcts = [10, 20, 25, 50, 75, level >= 4 ? 15 : 30];
  const p = pcts[rnd(0, pcts.length - 1)];
  const n = rnd(2, 20 + level * 8) * 10;
  const res = (n * p) / 100;
  return { q: `El ${p} % de ${n}`, options: [`${res}`, `${res + p}`, `${n / 2}`, `${res * 2}`], correct: 0 };
}

/** Series numéricas: ¿qué sigue? */
export function genSeries(level: number): BlitzItem {
  const kind = level < 3 ? rnd(0, 1) : rnd(0, 2);
  let seq: number[] = [];
  if (kind === 0) { const s = rnd(2, 9), d = rnd(2, 7 + level); seq = [s, s + d, s + 2 * d, s + 3 * d, s + 4 * d]; }
  else if (kind === 1) { const s = rnd(2, 5), m = rnd(2, 3); seq = [s, s * m, s * m * m, s * m ** 3, s * m ** 4]; }
  else { const s = rnd(1, 4); seq = [s, s + 1, s + 1 + 2, s + 1 + 2 + 3, s + 1 + 2 + 3 + 4]; }
  const next = kind === 0 ? seq[4] + (seq[1] - seq[0]) : kind === 1 ? seq[4] * (seq[1] / seq[0]) : seq[4] + 5;
  return { q: `Serie: ${seq.join(", ")}, … ¿qué número sigue?`, options: [`${next}`, `${next + 1}`, `${next - 1 > 0 ? next - 1 : next + 2}`, `${next + 10}`], correct: 0 };
}

/** Unidades de medida. */
export function genUnidades(level: number): BlitzItem {
  const kinds: [string, string, number][] = [
    ["kilómetros", "metros", 1000], ["metros", "centímetros", 100], ["kilos", "gramos", 1000],
    ["litros", "mililitros", 1000], ["horas", "minutos", 60], ["minutos", "segundos", 60],
  ];
  const [from, to, mul] = kinds[rnd(0, kinds.length - 1)];
  const n = rnd(2, 9 + level * 3);
  return { q: `¿Cuántos ${to} son ${n} ${from}?`, options: [`${n * mul} ${to}`, `${Math.round((n / mul) * 100) / 100} ${to}`, `${n * mul * 2} ${to}`, `${n + mul} ${to}`], correct: 0 };
}

/** Tiempos: suma de horas y minutos. */
export function genTiempos(level: number): BlitzItem {
  const h1 = rnd(1, 10), m1 = rnd(0, 55), add = rnd(20, 45 + level * 5);
  const total = h1 * 60 + m1 + add;
  const h = Math.floor(total / 60) % 24, m = total % 60;
  const fmt = (hh: number, mm: number) => `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  return { q: `Son las ${fmt(h1, m1)}. ¿Qué hora será dentro de ${add} minutos?`, options: [fmt(h, m), fmt((h + 1) % 24, m), fmt((h + 23) % 24, m), fmt(h, (m + 10) % 60)], correct: 0 };
}

/** Analogías numéricas: 3 : 9 :: 5 : ? */
export function genAnalogiasNum(level: number): BlitzItem {
  const a = rnd(2, 8 + level), b = a * a;
  const c = rnd(2, 9), d = c * c;
  return { q: `Si ${a} → ${b}, entonces ${c} → ¿?`, options: [`${d}`, `${c * 2}`, `${d + c}`, `${c ** 3}`], correct: 0 };
}

/** Series alfabéticas: ¿qué letra sigue? */
export function genSiguienteLetra(level: number): BlitzItem {
  const ABC = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
  const s = rnd(0, ABC.length - 6);
  const step = level < 3 ? 1 : rnd(1, 2);
  const idxs = [s, s + step, s + 2 * step, s + 3 * step].filter((i) => i < ABC.length);
  const nextIdx = idxs[idxs.length - 1] + step;
  if (nextIdx >= ABC.length) return genSiguienteLetra(level);
  const q = idxs.map((i) => ABC[i]).join(", ");
  const wrongs = [ABC[Math.min(nextIdx + 1, ABC.length - 1)], ABC[Math.max(nextIdx - 2, 0)], ABC[Math.min(nextIdx + step, ABC.length - 1)]];
  return { q: `Letras: ${q}, … ¿sigue?`, options: [ABC[nextIdx], ...wrongs], correct: 0 };
}

/* --------- Memoria de palabras: memoriza y detecta la intrusa --------- */
const PALABRAS_POOL = ["ancla", "brújula", "farol", "marea", "vela", "bote", "coral", "arena", "faro", "nivel", "timón", "gora", "cabo", "isla", "cielo", "viento", "estrella", "mapa", "botín", "puerto", "ballena", "delfín", "gaviota", "alga", "niebla", "lluvia", "ola", "cangrejo", "pulpo", "perla"];

export function genMemoriaPalabras(level: number): BlitzItem {
  const n = Math.min(3 + level, 7);
  const picks: string[] = [];
  while (picks.length < n) {
    const w = PALABRAS_POOL[rnd(0, PALABRAS_POOL.length - 1)];
    if (!picks.includes(w)) picks.push(w);
  }
  const intrusa = PALABRAS_POOL.find((w) => !picks.includes(w))!;
  const show = Math.random() < 0.5 ? intrusa : picks[rnd(0, picks.length - 1)];
  const estaba = show !== intrusa;
  const options = estaba ? ["Estaba", "No estaba"] : ["No estaba", "Estaba"];
  return {
    q: `Memoriza: ${picks.join(", ")}. ¿«${show}» estaba en la lista?`,
    options,
    correct: 0,
  };
}

/** Números al revés: repite la cifra invertida. */
export function genInversos(level: number): BlitzItem {
  const digits = level < 3 ? 2 : level < 6 ? 3 : 4;
  let num = "";
  for (let i = 0; i < digits; i++) num += String(rnd(0, 9));
  num = String(Number(num)); // sin ceros a la izquierda
  const rev = num.split("").reverse().join("");
  const wrong = String(Number(rev.split("").reverse().join(""))) === String(Number(rev)) ? String(Number(rev) + 11) : String(Number(num.split("").reverse().join("")));
  return { q: `Repite al revés: ${num}`, options: [rev, wrong, num, String(Number(rev) + 9)], correct: 0 };
}

/** Memoria de compras: ¿estaba en la lista? */
const COMPRAS_POOL = ["pan", "leche", "huevos", "arroz", "manzanas", "café", "azúcar", "aceite", "queso", "atún", "papel", "jabón", "plátanos", "zanahorias", "galletas", "gambas"];
export function genCompras(level: number): BlitzItem {
  const n = Math.min(4 + Math.floor(level / 2), 8);
  const list: string[] = [];
  while (list.length < n) { const it = COMPRAS_POOL[rnd(0, COMPRAS_POOL.length - 1)]; if (!list.includes(it)) list.push(it); }
  const test = COMPRAS_POOL[rnd(0, COMPRAS_POOL.length - 1)];
  const estaba = list.includes(test);
  return { q: `Lista: ${list.join(", ")}. ¿Estaba «${test}»?`, options: ["Sí", "No"], correct: estaba ? 0 : 1 };
}

/** Par o impar. */
export function genParImpar(_level: number): BlitzItem {
  const n = rnd(10, 999);
  return { q: `${n}`, options: ["Par", "Impar"], correct: n % 2 === 0 ? 0 : 1 };
}

/** ¿Vocal o consonante? (primera letra de la palabra) */
export function genVocalConsonante(_level: number): BlitzItem {
  const words: [string, boolean][] = [["Isla", true], ["Faro", false], ["Ancla", true], ["Timón", false], ["Uva", true], ["Nave", false], ["Arena", true], ["Coral", false], ["Ola", true], ["Puerto", false], ["Eco", true], ["Marea", false], ["Agua", true], ["Brújula", false], ["Océano", true], ["Vela", false]];
  const [w, vocal] = words[rnd(0, words.length - 1)];
  return { q: `¿La primera letra de «${w}» es…?`, options: ["Vocal", "Consonante"], correct: vocal ? 0 : 1 };
}

/** ¿Cuántas veces aparece la letra X? */
export function genCuentaLetras(_level: number): BlitzItem {
  const words = ["estrella", "murciélago", "biblioteca", "archipiélago", "palabra", "navegante", "aventura", "consonante", "vocabulario", "tinta", "farola", "gaviota"];
  const w = words[rnd(0, words.length - 1)];
  const letra = "aeioustnrl"[rnd(0, 9)];
  const count = w.split("").filter((c) => c === letra).length;
  const opts = new Set<number>([count]);
  while (opts.size < 4) opts.add(rnd(Math.max(0, count - 2), count + 2));
  const options = [...opts];
  return { q: `¿Cuántas «${letra}» tiene «${w}»?`, options: options.map(String), correct: options.indexOf(count) };
}

/** Suma encadenada: tres sumandos de un vistazo. */
export function genSumasEncadenadas(level: number): BlitzItem {
  const a = rnd(2, 20 + level * 10), b = rnd(2, 20 + level * 10), c = rnd(2, 20 + level * 10);
  const res = a + b + c;
  return { q: `${a} + ${b} + ${c}`, options: [`${res}`, `${res + a}`, `${res - b > 0 ? res - b : res + 7}`, `${a * b}`], correct: 0 };
}

/** ¿Cuál es el número mayor? */
export function genMayorMenor(_level: number): BlitzItem {
  const nums = new Set<number>();
  while (nums.size < 4) nums.add(rnd(100, 9999));
  const arr = [...nums];
  const max = Math.max(...arr);
  return { q: "¿Cuál es el número más grande?", options: arr.map(String), correct: arr.indexOf(max) };
}

/** ¿Qué letra va entre X e Y? */
export function genLetraVecina(_level: number): BlitzItem {
  const ABC = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
  const i = rnd(1, ABC.length - 2);
  const prev = ABC[i - 1], mid = ABC[i], next = ABC[i + 1];
  const opts = new Set<string>([mid]);
  while (opts.size < 4) opts.add(ABC[rnd(0, ABC.length - 1)]);
  const options = [...opts];
  return { q: `¿Qué letra va entre «${prev}» y «${next}»?`, options, correct: options.indexOf(mid) };
}
