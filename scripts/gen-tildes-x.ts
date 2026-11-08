/**
 * Generador del paquete ampliado de «Tribunal de las Tildes» (tildes-x).
 * Cada tupla: [formaCorrecta, "sí|la|bas" (SIN tilde), índiceSílabaConTilde,
 * fraseCon{w}, categoría, dificultad, cefr, notaPersonalizada?]
 * {w} se sustituye por la forma SIN tilde (como se ve en la frase).
 * Ejecutar: bun run scripts/gen-tildes-x.ts  →  src/data/gen/tildes-x.ts
 */
import { writeFileSync, readFileSync } from "node:fs";

type Cat =
  | "esdrujula" | "sobresdrujula" | "aguda-v" | "aguda-ns" | "aguda-no"
  | "llana-cons" | "llana-no" | "hiato" | "diptongo" | "diacritica"
  | "mono-no" | "dieresis";

type Tup = [string, string, number, string, Cat, number, string, string?];

const T: Tup[] = [
  /* ---------------- Esdrújulas ---------------- */
  ["número", "nu|me|ro", 0, "Me apunté el {w} de la tarjeta en la libreta.", "esdrujula", 1, "A1"],
  ["público", "pu|bli|co", 0, "La biblioteca abre al {w} a las nueve.", "esdrujula", 1, "A1"],
  ["último", "ul|ti|mo", 0, "El {w} tren de la noche sale a las doce.", "esdrujula", 1, "A1"],
  ["único", "u|ni|co", 0, "El {w} invitado fue su hermana.", "esdrujula", 1, "A1"],
  ["periódico", "pe|rio|di|co", 2, "El {w} de los domingos trae historietas.", "esdrujula", 1, "A1"],
  ["sílaba", "si|la|ba", 0, "Cada {w} suena con un solo golpe de voz.", "esdrujula", 2, "A2"],
  ["mágico", "ma|gi|co", 0, "El bosque tenía algo {w} al anochecer.", "esdrujula", 2, "A2"],
  ["lógico", "lo|gi|co", 0, "Es {w}: si llueve, la calle se moja.", "esdrujula", 2, "A2"],
  ["clínica", "cli|ni|ca", 0, "La {w} nueva abre los sábados.", "esdrujula", 2, "A2"],
  ["plástico", "plas|ti|co", 0, "Botella de {w}: mejor una de acero.", "esdrujula", 2, "A2"],
  ["físico", "fi|si|co", 0, "El {w} estudia la energía del movimiento.", "esdrujula", 2, "A2"],
  ["física", "fi|si|ca", 0, "La {w} estudia la luz y el sonido.", "esdrujula", 2, "A2"],
  ["oxígeno", "o|xi|ge|no", 1, "Las plantas liberan {w} de día.", "esdrujula", 2, "A2"],
  ["código", "co|di|go", 0, "El {w} postal de mi barrio es 28004.", "esdrujula", 2, "A2"],
  ["océano", "o|ce|a|no", 1, "El {w} Atlántico baña Cádiz.", "esdrujula", 2, "A2"],
  ["líquido", "li|qui|do", 0, "El agua es un {w} transparente.", "esdrujula", 2, "A2"],
  ["árbitro", "ar|bi|tro", 0, "El {w} pitó penalti en el último minuto.", "esdrujula", 2, "A2"],
  ["relámpago", "re|lam|pa|go", 2, "El {w} iluminó la bahía un segundo.", "esdrujula", 2, "A2"],
  ["pelícano", "pe|li|ca|no", 2, "El {w} guarda peces en su pico.", "esdrujula", 2, "A2"],
  ["kilómetros", "ki|lo|me|tros", 2, "Corrió diez {w} sin parar.", "esdrujula", 2, "A2"],
  ["crédito", "cre|di|to", 0, "Compró el portátil a {w}.", "esdrujula", 3, "B1"],
  ["diálogo", "dia|lo|go", 1, "El {w} de la película es hilarante.", "esdrujula", 3, "B1"],
  ["síntoma", "sin|to|ma", 0, "El primer {w} fue un dolor de cabeza.", "esdrujula", 3, "B1"],
  ["mérito", "me|ri|to", 0, "Subir la montaña tiene su {w}.", "esdrujula", 3, "B1"],
  ["íntimo", "in|ti|mo", 0, "Ese cuaderno es su diario {w}.", "esdrujula", 3, "B1"],
  ["ídolo", "i|do|lo", 0, "El futbolista es el {w} de la afición.", "esdrujula", 3, "B1"],
  ["índice", "in|di|ce", 0, "El {w} del libro lista todos los temas.", "esdrujula", 3, "B1"],
  ["término", "ter|mi|no", 0, "La piscina cierra a fin de {w}.", "esdrujula", 3, "B1"],
  ["táctica", "tac|ti|ca", 0, "Cambió de {w} en el segundo tiempo.", "esdrujula", 3, "B1"],
  ["ráfaga", "ra|fa|ga", 0, "Una {w} de viento se llevó el sombrero.", "esdrujula", 3, "B1"],
  ["ridículo", "ri|di|cu|lo", 2, "Quedó en {w} persiguiendo el autobús.", "esdrujula", 3, "B1"],
  ["góndola", "gon|do|la", 0, "La {w} veneciana se desliza por el canal.", "esdrujula", 3, "B1"],
  ["túnica", "tu|ni|ca", 0, "El emperador llevaba una {w} morada.", "esdrujula", 3, "B1"],
  ["órbita", "or|bi|ta", 0, "El satélite sigue su {w} sin parar.", "esdrujula", 3, "B1"],
  ["clásico", "cla|si|co", 0, "El Quijote es un {w} de la literatura.", "esdrujula", 3, "B1"],
  ["zócalo", "zo|ca|lo", 0, "Las ruinas conservan el {w} del templo.", "esdrujula", 4, "C1"],
  ["epíteto", "e|pi|te|to", 1, "Valiente es un {w} que le pega.", "esdrujula", 4, "C1"],
  ["península", "pe|nin|su|la", 1, "Yucatán es una {w} mexicana.", "esdrujula", 4, "B2"],
  ["hipótesis", "hi|po|te|sis", 1, "Mi {w} es que llovió de madrugada.", "esdrujula", 4, "B2"],
  ["sátira", "sa|ti|ra", 0, "La novela es una {w} de la política.", "esdrujula", 4, "C1"],
  ["síntesis", "sin|te|sis", 0, "Haz una {w} del capítulo en diez líneas.", "esdrujula", 4, "B2"],
  ["paréntesis", "pa|ren|te|sis", 1, "Todo lo que va entre {w} es un inciso.", "esdrujula", 4, "B2"],
  ["parásito", "pa|ra|si|to", 1, "La garrapata es un {w} del perro.", "esdrujula", 4, "B2"],
  ["polígono", "po|li|go|no", 2, "El {w} industrial da trabajo al pueblo.", "esdrujula", 4, "B2"],
  ["políglota", "po|li|glo|ta", 2, "Era {w}: hablaba seis idiomas.", "esdrujula", 4, "C1"],
  ["próspero", "pros|pe|ro", 0, "El puerto vivió años {w}.", "esdrujula", 4, "C1"],
  ["súbito", "su|bi|to", 0, "Un apagón {w} apagó la pantalla.", "esdrujula", 4, "C1"],
  ["vértebra", "ver|te|bra", 0, "El masaje le alivió cada {w}.", "esdrujula", 4, "B2"],
  ["víbora", "vi|bo|ra", 0, "La {w} se esconde entre las piedras.", "esdrujula", 4, "A2"],
  ["vínculo", "vin|cu|lo", 0, "El {w} con la isla era fuerte.", "esdrujula", 4, "B2"],
  ["víspera", "vis|pe|ra", 0, "Llegamos la {w} del concierto.", "esdrujula", 4, "B2"],
  ["régimen", "re|gi|men", 0, "Llevaron un {w} estricto de comidas.", "esdrujula", 4, "B2"],
  ["catástrofe", "ca|tas|tro|fe", 2, "El terremoto fue una {w} natural.", "esdrujula", 4, "B2"],
  ["escándalo", "es|can|da|lo", 2, "El {w} llegó hasta la prensa.", "esdrujula", 2, "A2"],
  ["gramática", "gra|ma|ti|ca", 2, "La {w} del español tiene sus reglas.", "esdrujula", 2, "A2"],
  ["geometría", "ge|o|me|tri|a", 3, "La {w} explica los ángulos del triángulo.", "esdrujula", 3, "B1"],
  ["ética", "e|ti|ca", 0, "La {w} profesional exige honestidad.", "esdrujula", 3, "B2"],
  ["cápsula", "cap|su|la", 0, "Tomó una {w} con un vaso de agua.", "esdrujula", 3, "B1"],
  ["dígito", "di|gi|to", 0, "El {w} de control no coincide.", "esdrujula", 3, "B1"],
  ["márgenes", "mar|ge|nes", 0, "Escribe en los {w} del cuaderno.", "esdrujula", 2, "A2"],
  ["órdenes", "or|de|nes", 0, "Sigue las {w} del paquete a la letra.", "esdrujula", 2, "A2"],
  ["árboles", "ar|bo|les", 0, "Los {w} del paseo huelen a lluvia.", "esdrujula", 1, "A1"],
  ["exámenes", "e|xa|me|nes", 1, "Los {w} de junio se acercan.", "esdrujula", 2, "A2"],
  ["rábanos", "ra|ba|nos", 0, "Los {w} del huerto pican un poco.", "esdrujula", 2, "A2"],
  ["títulos", "ti|tu|los", 0, "Los {w} del capítulo son engañosos.", "esdrujula", 2, "A2"],
  ["límites", "li|mi|tes", 0, "Ponle {w} a la pantalla.", "esdrujula", 3, "B1"],
  ["esdrújulas", "es|dru|ju|las", 1, "Las {w} siempre llevan tilde.", "esdrujula", 3, "B2"],
  ["cronómetro", "cro|no|me|tro", 2, "El {w} marca la vuelta rápida.", "esdrujula", 3, "B1"],
  ["académico", "a|ca|de|mi|co", 2, "El curso va de lo lúdico a lo {w}.", "esdrujula", 3, "B1"],
  ["anónimo", "a|no|ni|mo", 2, "Poema {w} de la Edad de Plata.", "esdrujula", 3, "B2"],
  ["auténtico", "au|ten|ti|co", 1, "El guiso sabe a receta {w}.", "esdrujula", 3, "B1"],
  ["económico", "e|co|no|mi|co", 2, "El mapa {w} colorea los precios.", "esdrujula", 3, "B2"],
  ["ecológico", "e|co|lo|gi|co", 2, "El envase {w} se recicla en azul.", "esdrujula", 3, "B1"],
  ["electrónico", "e|lec|tro|ni|co", 3, "El libro {w} pesa menos que el papel.", "esdrujula", 3, "B1"],
  ["histérico", "his|te|ri|co", 1, "Risas {w} en la última fila.", "esdrujula", 3, "B2"],
  ["idílico", "i|di|li|co", 1, "Una cala {w} sin turistas.", "esdrujula", 4, "C1"],
  ["irónico", "i|ro|ni|co", 2, "Un silencio {w} llenó la sala.", "esdrujula", 3, "B2"],
  ["matemático", "ma|te|ma|ti|co", 2, "Es un acertijo {w}, no un hechizo.", "esdrujula", 3, "B1"],
  ["nostálgico", "nos|tal|gi|co", 2, "Un olor {w} a tinta y papel.", "esdrujula", 3, "B2"],
  ["panorámico", "pa|no|ra|mi|co", 3, "Mirador {w} sobre el valle.", "esdrujula", 4, "C1"],
  ["político", "po|li|ti|co", 2, "El debate {w} se calentó al final.", "esdrujula", 2, "A2"],
  ["práctico", "prac|ti|co", 0, "El curso es {w}: no hay examen.", "esdrujula", 2, "A2"],
  ["científico", "cien|ti|fi|co", 2, "Un {w} desmiente el bulo.", "esdrujula", 2, "A2"],
  ["artístico", "ar|tis|ti|co", 2, "El patinaje {w} dejó boquiabiertos.", "esdrujula", 3, "B1"],
  ["atlético", "at|le|ti|co", 1, "El club {w} sube de categoría.", "esdrujula", 3, "B1"],
  ["crónico", "cro|ni|co", 0, "Un resfriado {w} no es broma.", "esdrujula", 3, "B2"],
  ["doméstico", "do|mes|ti|co", 2, "Un vuelo {w} retrasa la fiesta.", "esdrujula", 3, "B1"],
  ["magnético", "mag|ne|ti|co", 2, "La brújula {w} apunta al norte.", "esdrujula", 3, "B1"],
  ["orgánico", "or|ga|ni|co", 2, "La verdura {w} cuesta un poco más.", "esdrujula", 3, "B1"],
  ["volcánico", "vol|ca|ni|co", 2, "Suelo {w} y negro en la isla.", "esdrujula", 3, "B2"],
  ["geométrico", "ge|o|me|tri|co", 2, "Dibujos {w} de Escher marean la vista.", "esdrujula", 4, "C1"],
  ["neurálgico", "neu|ral|gi|co", 2, "Es un punto {w} del tráfico.", "esdrujula", 4, "C1"],
  ["psicológico", "psi|co|lo|gi|co", 3, "El suspense es puro {w}.", "esdrujula", 4, "C1"],
  ["lingüístico", "lin|guis|ti|co", 2, "El atlas {w} de la academia.", "esdrujula", 4, "C1"],
  ["democrático", "de|mo|cra|ti|co", 2, "El voto es un derecho {w}.", "esdrujula", 3, "B2"],
  ["químico", "qui|mi|co", 0, "El {w} del laboratorio es joven.", "esdrujula", 2, "A2"],
  ["débito", "de|bi|to", 0, "Sin recargo ni {w} extra.", "esdrujula", 4, "C1"],
  ["íntegro", "in|te|gro", 0, "Un ejemplar {w} del mapa de 1748.", "esdrujula", 4, "C1"],

  /* ---------------- Sobresdrújulas ---------------- */
  ["dígamelo", "di|ga|me|lo", 0, "Si recuerda el nombre del libro, {w}, por favor.", "sobresdrujula", 5, "C1"],
  ["cómpramelo", "com|pra|me|lo", 0, "Si ves pan de hoy, {w}, por favor.", "sobresdrujula", 5, "C1"],
  ["devuélvemelo", "de|vuel|ve|me|lo", 2, "Mi bici es la roja: {w} al terminar.", "sobresdrujula", 5, "C1"],
  ["envíamelo", "en|via|me|lo", 2, "La foto salió redonda: {w} cuando puedas.", "sobresdrujula", 5, "C1"],
  ["explícaselo", "ex|pli|ca|se|lo", 2, "Javi no entiende la regla: {w} tú, que controlas.", "sobresdrujula", 5, "C1"],
  ["cómetelo", "co|me|te|lo", 0, "El bocadillo está hoy buenísimo: {w}.", "sobresdrujula", 4, "B1"],
  ["comúnmente", "co|mun|men|te", 1, "Esa seta se conoce {w} como morilla.", "sobresdrujula", 4, "B2"],
  ["únicamente", "u|ni|ca|men|te", 0, "Se vende {w} en la librería del puerto.", "sobresdrujula", 3, "B2"],
  ["lógicamente", "lo|gi|ca|men|te", 0, "Piénsalo {w}: sin red no hay salto.", "sobresdrujula", 3, "B2"],

  /* ---------------- Agudas con tilde ---------------- */
  ["canción", "can|cion", 1, "La {w} del verano suena en todas las radios.", "aguda-ns", 1, "A1"],
  ["sillón", "sil|lon", 1, "Se durmió en el {w} viendo la tele.", "aguda-ns", 1, "A1"],
  ["ratón", "ra|ton", 1, "El {w} se llevó las migas del mantel.", "aguda-ns", 1, "A1"],
  ["balón", "ba|lon", 1, "El {w} rodó hasta la portería.", "aguda-ns", 1, "A1"],
  ["rincón", "rin|con", 1, "Leyó en un {w} de la biblioteca.", "aguda-ns", 1, "A1"],
  ["razón", "ra|zon", 1, "Tiene {w} en lo del ruido.", "aguda-ns", 2, "A2"],
  ["montón", "mon|ton", 1, "Deberes a {w} esta semana.", "aguda-ns", 2, "A2"],
  ["algodón", "al|go|don", 2, "El {w} se cultiva en zonas cálidas.", "aguda-ns", 2, "A2"],
  ["demás", "de|mas", 1, "Los {w} prefirieron quedarse.", "aguda-ns", 2, "A2"],
  ["cortés", "cor|tes", 1, "Fue muy {w} al presentarla.", "aguda-ns", 3, "B1"],
  ["anís", "a|nis", 1, "El roscón se aromatiza con {w}.", "aguda-ns", 2, "A2"],
  ["acción", "ac|cion", 1, "La {w} transcurre en un puerto nórdico.", "aguda-ns", 2, "B1"],
  ["emoción", "e|mo|cion", 2, "La {w} se le nota en la voz.", "aguda-ns", 2, "A2"],
  ["información", "in|for|ma|cion", 3, "La {w} llega cada hora en punto.", "aguda-ns", 2, "A2"],
  ["televisión", "te|le|vi|sion", 3, "Apaga la {w} a la hora de cenar.", "aguda-ns", 1, "A1"],
  ["verás", "ve|ras", 1, "Ya {w} cómo amanece.", "aguda-ns", 2, "A1"],
  ["será", "se|ra", 1, "Mañana {w} otro día.", "aguda-ns", 2, "A1"],
  ["dará", "da|ra", 1, "El concierto {w} comienzo a las nueve.", "aguda-ns", 2, "A2"],
  ["podrá", "po|dra", 1, "{w} con todo: es la capitana.", "aguda-ns", 2, "A2"],
  ["hará", "ha|ra", 1, "¿Quién {w} el turno de noche?", "aguda-ns", 2, "A2"],
  ["tendrá", "ten|dra", 1, "El ferry {w} retraso con la marea.", "aguda-ns", 2, "A2"],
  ["irás", "i|ras", 1, "{w} delante y yo detrás.", "aguda-ns", 2, "A2"],
  ["comerás", "co|me|ras", 2, "Luego {w} mejor.", "aguda-ns", 2, "A1"],
  ["compró", "com|pro", 1, "Le {w} entradas para el cine.", "aguda-v", 2, "A1"],
  ["bajó", "ba|jo", 1, "La marea {w} antes del almuerzo.", "aguda-v", 2, "A2"],
  ["vivió", "vi|vio", 1, "Un año en Madrid y ya lo {w} todo.", "aguda-v", 2, "A2"],
  ["comió", "co|mio", 1, "El gato se {w} las sobras del pescado.", "aguda-v", 2, "A2"],
  ["escribió", "es|cri|bio", 2, "García Márquez {w} una obra inmensa.", "aguda-v", 2, "B1"],
  ["encontró", "en|con|tro", 2, "Quien {w} la peli que avise.", "aguda-v", 2, "A2"],
  ["empezó", "em|pe|zo", 2, "La función {w} con diez minutos de retraso.", "aguda-v", 2, "A2"],
  ["cambió", "cam|bio", 1, "El tiempo {w} de golpe.", "aguda-v", 2, "A2"],
  ["soñó", "so|ño", 1, "Anoche {w} con faros azules.", "aguda-v", 2, "A1"],
  ["lloró", "llo|ro", 1, "El pequeño {w} con la película.", "aguda-v", 2, "A1"],
  ["habló", "ha|blo", 1, "Nunca {w} durante la travesía.", "aguda-v", 2, "A1"],
  ["llevó", "lle|vo", 1, "Se {w} el paraguas por si acaso.", "aguda-v", 2, "A1"],
  ["llegó", "lle|go", 1, "La marea {w} hasta el muelle.", "aguda-v", 2, "A1"],
  ["jugó", "ju|go", 1, "{w} de portero todo el partido.", "aguda-v", 2, "A1"],
  ["pintó", "pin|to", 1, "{w} el faro con cal amarilla.", "aguda-v", 2, "A1"],
  ["sacó", "sa|co", 1, "{w} entradas para el concierto.", "aguda-v", 2, "A1"],
  ["dejó", "de|jo", 1, "Se {w} el sombrero en el tren.", "aguda-v", 2, "A1"],
  ["miró", "mi|ro", 1, "{w} el reloj y siguió su camino.", "aguda-v", 2, "A1"],
  ["bailó", "bai|lo", 1, "Toda la noche {w} sin parar.", "aguda-v", 2, "A1"],
  ["cantó", "can|to", 1, "{w} en el coro de la escuela.", "aguda-v", 2, "A1"],
  ["aprendió", "a|pren|dio", 2, "En un verano {w} a nadar.", "diptongo", 2, "A1", "«Aprendió» es aguda terminada en vocal: la tilde cae sobre la o del diptongo -ió."],
  ["entendió", "en|ten|dio", 2, "Al final {w} la lección.", "diptongo", 2, "A2", "«Entendió» es aguda terminada en vocal: la tilde cae sobre la o del diptongo -ió."],
  ["pidió", "pi|dio", 1, "{w} el menú del día.", "diptongo", 2, "A1", "«Pidió» es aguda terminada en vocal: la tilde cae sobre la o del diptongo -ió."],
  ["sirvió", "sir|vio", 1, "La camarera {w} el café primero.", "diptongo", 2, "A1", "«Sirvió» es aguda terminada en vocal: la tilde cae sobre la o del diptongo -ió."],
  ["leyó", "le|yo", 1, "El farero {w} hasta la madrugada.", "diptongo", 2, "A2", "«Leyó» es aguda terminada en vocal: la tilde cae sobre la o del diptongo -yó."],
  ["creyó", "cre|yo", 1, "Que {w} que nadie lo vio.", "diptongo", 2, "A2", "«Creyó» es aguda terminada en vocal: la tilde cae sobre la o del diptongo -yó."],
  ["champú", "cham|pu", 1, "Vacía el {w} antes del viaje.", "aguda-v", 2, "A2"],

  /* ---------------- Agudas SIN tilde (trampas) ---------------- */
  ["farol", "fa|rol", -1, "Encendió el {w} del patio.", "aguda-no", 2, "A2"],
  ["feliz", "fe|liz", -1, "Un año {w} te desea la tripulación.", "aguda-no", 1, "A1"],
  ["canal", "ca|nal", -1, "El {w} de Panamá une dos océanos.", "aguda-no", 2, "A2"],
  ["cantar", "can|tar", -1, "Se puso a {w} bajito.", "aguda-no", 1, "A1"],
  ["azar", "a|zar", -1, "Decidió por puro {w}.", "aguda-no", 3, "B1"],
  ["tractor", "trac|tor", -1, "El {w} ara el campo en minutos.", "aguda-no", 2, "A2"],
  ["español", "es|pa|ñol", -1, "El {w} se habla en veinte países.", "aguda-no", 1, "A1"],
  ["mujer", "mu|jer", -1, "La {w} del faro sube con la marea.", "aguda-no", 1, "A1"],
  ["papel", "pa|pel", -1, "Guardó el {w} del regalo.", "aguda-no", 1, "A1"],
  ["viajar", "via|jar", -1, "Van a {w} en tren nocturno.", "aguda-no", 1, "A1"],

  /* ---------------- Llanas con tilde ---------------- */
  ["fértil", "fer|til", 0, "El valle del río es tierra {w}.", "llana-cons", 3, "B2"],
  ["táctil", "tac|til", 0, "La pantalla {w} responde al instante.", "llana-cons", 3, "B2"],
  ["cárcel", "car|cel", 0, "La obra empieza en una {w} del siglo de oro.", "llana-cons", 3, "B1"],
  ["ángel", "an|gel", 0, "Su hermano pequeño es un {w}.", "llana-cons", 2, "A2"],
  ["ámbar", "am|bar", 0, "Collar de {w} del mar Báltico.", "llana-cons", 4, "C1"],
  ["cómico", "co|mi|co", 0, "El número {w} cerró la función.", "llana-cons", 2, "A2"],
  ["módem", "mo|dem", 0, "Reinicia el {w} y listo.", "llana-cons", 3, "B1"],
  ["líder", "li|der", 0, "El {w} del equipo arengó a los suyos.", "llana-cons", 2, "A2"],
  ["túnel", "tu|nel", 0, "El {w} atraviesa la montaña.", "llana-cons", 2, "A2"],
  ["azúcar", "a|zu|car", 1, "El café con poco {w}, por favor.", "llana-cons", 1, "A1"],
  ["mástil", "mas|til", 0, "El {w} del velero cruje con el viento.", "llana-cons", 3, "B1"],
  ["cráter", "cra|ter", 0, "El {w} del volcán dormido es un lago.", "llana-cons", 3, "B1"],
  ["hámster", "ham|ster", 0, "El {w} corre en su rueda toda la noche.", "llana-cons", 3, "B1"],
  ["prócer", "pro|cer", 0, "Un {w} de la independencia.", "llana-cons", 4, "C1"],
  ["textil", "tex|til", 0, "El sector {w} se mecanizó.", "llana-cons", 3, "B2"],
  ["dúctil", "duc|til", 0, "El cobre es {w} y maleable.", "llana-cons", 4, "C1"],
  ["hábil", "ha|bil", 0, "Zurció la vela con dedos {w}.", "llana-cons", 2, "A2"],
  ["almíbar", "al|mi|bar", 2, "Las torrijas se bañan en {w}.", "llana-cons", 4, "C1"],
  ["alféizar", "al|fei|zar", 1, "Puso macetas de albahaca en el {w}.", "llana-cons", 4, "B2", "«Alféizar» es llana terminada en -r: la tilde cae sobre la e del diptongo -ei."],

  /* ---------------- Llanas SIN tilde (trampas) ---------------- */
  ["mesa", "me|sa", -1, "La {w} del comedor es de nogal.", "llana-no", 1, "A1"],
  ["casa", "ca|sa", -1, "La {w} del farero es blanca y cuadrada.", "llana-no", 1, "A1"],
  ["piano", "pia|no", -1, "Toca el {w} del bar los sábados.", "llana-no", 1, "A1"],
  ["libros", "li|bros", -1, "Los {w} viajan en cajas de cartón.", "llana-no", 1, "A1"],
  ["cantan", "can|tan", -1, "Las gaviotas {w} sobre el muelle.", "llana-no", 1, "A1"],
  ["mañana", "ma|ña|na", -1, "Te espera a primera hora de la {w}.", "llana-no", 1, "A1"],
  ["temporada", "tem|po|ra|da", -1, "La {w} de naranjas empieza en noviembre.", "llana-no", 2, "A2"],
  ["problema", "pro|ble|ma", -1, "El {w} es la lluvia, no el frío.", "llana-no", 1, "A1"],
  ["sistema", "sis|te|ma", -1, "El {w} de riego gotea en las noches.", "llana-no", 2, "A2"],
  ["origen", "o|ri|gen", -1, "El {w} del río está en la sierra.", "llana-no", 3, "B1"],
  ["naranjas", "na|ran|jas", -1, "Las {w} amargan si se cocinan mucho.", "llana-no", 1, "A1"],
  ["cuaderno", "cua|der|no", -1, "El {w} nuevo huele a bosque.", "llana-no", 1, "A1"],
  ["cuidado", "cui|da|do", -1, "{w} con el escalón del muelle.", "llana-no", 1, "A1"],
  ["peine", "pei|ne", -1, "Se ató el {w} con una cinta.", "llana-no", 2, "A2"],
  ["insomnio", "in|som|nio", -1, "El {w} se cura contando ovejas.", "llana-no", 3, "B1"],
  ["yunque", "yun|que", -1, "Golpea el {w} del herrero.", "llana-no", 3, "B1"],
  ["simplemente", "sim|ple|men|te", -1, "La respuesta era {w} una errata.", "llana-no", 3, "A2", "El adverbio conserva la tilde del adjetivo: como «simple» no la lleva, «simplemente» tampoco."],
  ["lentamente", "len|ta|men|te", -1, "El ferry cruzó {w} la bahía.", "llana-no", 2, "A2", "El adverbio conserva la tilde del adjetivo: como «lenta» no la lleva, tampoco el adverbio."],
  ["alegremente", "a|le|gre|men|te", -1, "La charla transcurrió {w}.", "llana-no", 3, "B1", "El adverbio conserva la tilde del adjetivo: como «alegre» no la lleva, tampoco el adverbio."],

  /* ---------------- Hiatos ---------------- */
  ["raíz", "ra|iz", 1, "Arranca la hierba desde la {w}.", "hiato", 2, "A2"],
  ["día", "di|a", 0, "El {w} amaneció nublado.", "hiato", 1, "A1"],
  ["mía", "mi|a", 0, "La mochila {w} pesa menos.", "hiato", 2, "A2"],
  ["frío", "fri|o", 0, "Hace un {w} que pela en la cima.", "hiato", 1, "A1"],
  ["lío", "li|o", 0, "Se formó un {w} con las entradas.", "hiato", 2, "A2"],
  ["grúa", "gru|a", 0, "Levantaron la viga con la {w}.", "hiato", 3, "B1"],
  ["actúa", "ac|tu|a", 2, "El fiscal {w} de oficio.", "hiato", 4, "B2"],
  ["evalúa", "e|va|lu|a", 2, "El tribunal {w} las obras mañana.", "hiato", 4, "B2"],
  ["oía", "o|i|a", 1, "Desde la ventana {w} campanas.", "hiato", 2, "A2"],
  ["comía", "co|mi|a", 1, "El pequeño {w} sin ayuda.", "hiato", 2, "A2"],
  ["vivía", "vi|vi|a", 1, "Entonces {w} en Cádiz.", "hiato", 2, "A2"],
  ["creía", "cre|i|a", 1, "No {w} lo que veía.", "hiato", 2, "A2"],
  ["alegría", "a|le|gri|a", 2, "La {w} se le escapó en un grito.", "hiato", 1, "A1"],
  ["filosofía", "fi|lo|so|fi|a", 3, "Estudia {w} los jueves.", "hiato", 2, "A2"],
  ["mediodía", "me|dio|di|a", 2, "Comemos a las dos del {w}.", "hiato", 2, "A2"],
  ["vacío", "va|ci|o", 1, "El granero está casi {w}.", "hiato", 2, "A2"],
  ["vacía", "va|ci|a", 1, "La calle estaba {w} a las siete.", "hiato", 2, "A2"],

  /* ---------------- Tildes diacríticas ---------------- */
  ["tú", "tu", 0, "Sin {w} no hay partida de naipes.", "diacritica", 1, "A1", "«Tú» con tilde es pronombre personal; «tu» sin tilde es posesivo."],
  ["cómo", "como", 0, "¿{w} se llega a la isla?", "diacritica", 1, "A1", "Con tilde, «cómo» pregunta; sin tilde, «como» compara."],
  ["cuándo", "cuando", 0, "¿{w} zarpa el barco?", "diacritica", 1, "A1", "Con tilde, «cuándo» pregunta; sin tilde, «cuando» indica tiempo."],
  ["dónde", "donde", 0, "¿{w} está mi mochila?", "diacritica", 1, "A1", "Con tilde, «dónde» pregunta; sin tilde, «donde» indica lugar."],

  /* ---------------- Monosílabos sin tilde ---------------- */
  ["fue", "fue", -1, "El ferry {w} puntual.", "mono-no", 2, "A1"],
  ["fui", "fui", -1, "{w} a comprar tinta roja.", "mono-no", 2, "A1"],
  ["sol", "sol", -1, "El {w} de febrero entra por la ventana.", "mono-no", 1, "A1"],
  ["pan", "pan", -1, "Huele a {w} recién hecho.", "mono-no", 1, "A1"],
  ["flor", "flor", -1, "Le regaló una {w} de papel.", "mono-no", 1, "A1"],
  ["mar", "mar", -1, "El {w} estaba en calma.", "mono-no", 1, "A1"],
  ["tres", "tres", -1, "Quedan {w} paradas.", "mono-no", 1, "A1"],
  ["hoy", "hoy", -1, "{w} cierra el museo.", "mono-no", 1, "A1"],
  ["muy", "muy", -1, "Camina {w} despacio.", "mono-no", 1, "A1"],
  ["rey", "rey", -1, "El {w} de la bahía ancló al atardecer.", "mono-no", 2, "A2"],
  ["seis", "seis", -1, "Duerme {w} horas y despierta nuevo.", "mono-no", 1, "A1"],

  /* ---------------- Diéresis (ü) ---------------- */
  ["pingüino", "pin|gui|no", 1, "Un {w} resbala por el hielo.", "dieresis", 2, "A2"],
  ["cigüeña", "ci|gue|ña", 1, "La {w} anida en la torre.", "dieresis", 3, "B1"],
  ["vergüenza", "ver|guen|za", 1, "Le dio {w} llegar el último.", "dieresis", 2, "A2"],
  ["bilingüe", "bi|lin|gue", 2, "Su hija es {w} desde la cuna.", "dieresis", 3, "B1"],
  ["lengüeta", "len|gue|ta", 1, "Aprende a tocar con la {w} del acordeón.", "dieresis", 4, "C1"],
  ["nicaragüense", "ni|ca|ra|guen|se", 3, "El café {w} es suave.", "dieresis", 4, "C1"],

  /* ---------------- Ampliación · esdrújulas nuevas ---------------- */
  ["ánimo", "a|ni|mo", 0, "Con buen {w} se subió al escenario.", "esdrujula", 3, "B1"],
  ["ánade", "a|na|de", 0, "Un {w} cruza el estanque al alba.", "esdrujula", 4, "C1"],
  ["áureo", "au|re|o", 0, "Una luz {w} baña el puerto al atardecer.", "esdrujula", 4, "C1"],
  ["época", "e|po|ca", 0, "En aquella {w}, los mapas dejaban bordes en blanco.", "esdrujula", 2, "A2"],
  ["íbero", "i|be|ro", 0, "El lince {w} cazaba en la dehesa.", "esdrujula", 4, "C1"],
  ["ígneo", "ig|ne|o", 0, "Rocas {w} brotan del volcán.", "esdrujula", 4, "C1"],
  ["índigo", "in|di|go", 0, "Un tinte {w} para la vela mayor.", "esdrujula", 3, "B2"],
  ["héroes", "he|ro|es", 0, "Los {w} de la isla firman el acta.", "esdrujula", 3, "B1"],
  ["huérfano", "huer|fa|no", 0, "El {w} del cuento hereda un mapa.", "esdrujula", 3, "B2"],
  ["párroco", "par|ro|co", 0, "El {w} bendice la flota en abril.", "esdrujula", 4, "C1"],
  ["péndulo", "pen|du|lo", 0, "El {w} del abuelo marca segundos eternos.", "esdrujula", 3, "B2"],
  ["pródigo", "pro|di|go", 0, "Tierra {w} en peces y naranjas.", "esdrujula", 4, "C1"],
  ["rígido", "ri|gi|do", 0, "El mantel estaba {w} de tanto almidón.", "esdrujula", 3, "B2"],
  ["sábado", "sa|ba|do", 0, "El {w} hay mercado en la plaza.", "esdrujula", 1, "A1"],
  ["tímido", "ti|mi|do", 0, "Un aplauso para el poeta {w}.", "esdrujula", 2, "A2"],
  ["título", "ti|tu|lo", 0, "El {w} del cuento es «La marea alta».", "esdrujula", 2, "A2"],
  ["típico", "ti|pi|co", 0, "Un viento {w} del sur en la isla.", "esdrujula", 2, "A2"],
  ["vértice", "ver|ti|ce", 0, "El alpinista llegó al {w} antes del alba.", "esdrujula", 3, "B2"],
  ["zángano", "zan|ga|no", 0, "Un {w} de utilería sostiene la torre.", "esdrujula", 4, "C1"],
  ["áspero", "as|pe|ro", 0, "La lana del jersey es {w} al tacto.", "esdrujula", 3, "B2"],
  ["amígdala", "a|mig|da|la", 1, "Al niño le creció la {w} y no cenó.", "esdrujula", 3, "B2"],
  ["artículo", "ar|ti|cu|lo", 2, "Escribe un {w} para la gazeta del puerto.", "esdrujula", 3, "B1"],
  ["cráneo", "cra|ne|o", 0, "El casco protege también el {w}.", "esdrujula", 3, "B2"],
  ["déspota", "des|po|ta", 0, "No soporta a su jefe: es un {w} con corbata.", "esdrujula", 4, "C1"],
  ["empírico", "em|pi|ri|co", 2, "El método {w} prueba primero y teoriza después.", "esdrujula", 4, "C1"],
  ["endémico", "en|de|mi|co", 2, "El pinzón {w} solo vive en esta isla.", "esdrujula", 4, "C1"],
  ["espárrago", "es|pa|rra|go", 2, "La olla huele a {w} silvestre.", "esdrujula", 3, "B2"],
  ["gárgola", "gar|go|la", 0, "Una {w} escupe agua en la cornisa.", "esdrujula", 4, "C1"],
  ["hipócrita", "hi|po|cri|ta", 2, "Sonrisa de {w} la del político.", "esdrujula", 3, "B2"],
  ["nitrógeno", "ni|tro|ge|no", 2, "El {w} compone casi todo el aire.", "esdrujula", 3, "B2"],
  ["píldora", "pil|do|ra", 0, "Una {w} y al agua: quita el hipo.", "esdrujula", 3, "B1"],
  ["témpanos", "tem|pa|nos", 0, "Los {w} derivan hacia el sur.", "esdrujula", 4, "C1"],
  ["tórrido", "tor|ri|do", 0, "Un agosto {w} achicharra la piedra.", "esdrujula", 4, "C1"],
  ["válido", "va|li|do", 0, "Tu billete sigue {w} hasta el domingo.", "esdrujula", 3, "B1"],
  ["vértigo", "ver|ti|go", 0, "Le dio {w} al asomarse al puente.", "esdrujula", 3, "B2"],
  ["vítreo", "vit|re|o", 0, "Un mar {w} de calma chicha.", "esdrujula", 4, "C1"],
  ["cáscara", "cas|ca|ra", 0, "La {w} del cacahuete salta al partirlo.", "esdrujula", 3, "B1"],
  ["víveres", "vi|ve|res", 0, "El barco carga {w} para tres meses.", "esdrujula", 4, "C1"],
  ["rúbrica", "ru|bri|ca", 0, "El notario pide su {w} al pie del acta.", "esdrujula", 4, "C1"],
  ["tóxico", "to|xi|co", 0, "El {w} de las setas de colores es mortal.", "esdrujula", 3, "B1"],
  ["cósmico", "cos|mi|co", 0, "Un silencio {w} llenó el observatorio.", "esdrujula", 3, "B2"],
  ["diagnóstico", "dia|gnos|ti|co", 2, "El {w} llegó tarde pero claro.", "esdrujula", 3, "B2"],
  ["romántico", "ro|man|ti|co", 2, "Un paseo {w} por el faro al anochecer.", "esdrujula", 3, "B1"],
  ["práctica", "prac|ti|ca", 0, "Con {w} se aprende a virar el timón.", "esdrujula", 2, "A2"],
  ["década", "de|ca|da", 0, "El disco era un éxito de la {w} pasada.", "esdrujula", 2, "A2"],
  ["álgebra", "al|ge|bra", 0, "El {w} de la revista trae acertijos.", "esdrujula", 4, "C1"],

  /* ---------------- Ampliación · agudas nuevas ---------------- */
  ["llegué", "lle|gue", 1, "Ayer {w} con la marea alta.", "aguda-v", 1, "A1"],
  ["empecé", "em|pe|ce", 2, "La carta {w} con «Querido faro».", "aguda-v", 2, "A2"],
  ["aprendí", "a|pren|di", 2, "Hoy {w} la diferencia entre «hay» y «ahí».", "aguda-v", 2, "A2"],
  ["escribí", "es|cri|bi", 2, "{w} tu nombre en la arena mojada.", "aguda-v", 2, "A2"],
  ["bebé", "be|be", 1, "El {w} tomó su biberón sin despertarse.", "aguda-v", 2, "A2"],
  ["seré", "se|re", 1, "Mañana {w} el primero en subir.", "aguda-v", 2, "A2"],
  ["estaré", "es|ta|re", 2, "{w} en el muelle antes de las ocho.", "aguda-v", 2, "A2"],
  ["tendré", "ten|dre", 1, "{w} la respuesta el viernes.", "aguda-v", 2, "A2"],
  ["haré", "ha|re", 1, "Lo {w} en cuanto salga el sol.", "aguda-v", 2, "A2"],
  ["iré", "i|re", 1, "{w} andando, que está cerca.", "aguda-v", 2, "A2"],
  ["veré", "ve|re", 1, "{w} si el velero entra hoy.", "aguda-v", 2, "A2"],
  ["sabré", "sa|bre", 1, "Antes del examen ya lo {w} todo.", "aguda-v", 2, "A2"],
  ["botón", "bo|ton", 1, "Se le cayó un {w} de la chaqueta.", "aguda-ns", 1, "A1"],
  ["comilón", "co|mi|lon", 2, "De pequeño era un {w}: repetía postre.", "aguda-ns", 3, "B1"],
  ["cordón", "cor|don", 1, "Ató las cortinas con un {w}.", "aguda-ns", 1, "A1"],
  ["peón", "pe|on", 1, "Cada {w} de la viña carga su cesta.", "aguda-ns", 3, "B1"],
  ["piñón", "pi|ñon", 1, "El {w} del reloj saltó de la rueda.", "aguda-ns", 3, "B2"],
  ["carbón", "car|bon", 1, "El {w} de la vieja lumbre aún huele.", "aguda-ns", 2, "A2"],
  ["pulmón", "pul|mon", 1, "El aire limpio se agradece a cada {w}.", "aguda-ns", 3, "B1"],
  ["marrón", "ma|rron", 1, "Busca el sobre de color {w}.", "aguda-ns", 1, "A1"],
  ["avión", "a|vi|on", 2, "El {w} sobrevoló el faro.", "aguda-ns", 1, "A1"],
  ["camaleón", "ca|ma|le|on", 3, "El {w} del zoo mira sin parpadear.", "aguda-ns", 3, "B1"],
  ["banderín", "ban|de|rin", 2, "Un {w} indica la entrada del puerto.", "aguda-ns", 3, "B2"],
  ["alhelí", "al|he|li", 2, "Un tiesto de {w} alegra el balcón.", "aguda-v", 4, "C1"],
  ["benjamín", "ben|ja|min", 2, "El pequeño de la cuadrilla es el {w}.", "aguda-ns", 3, "B2"],
  ["situación", "si|tua|cion", 2, "La {w} del estrecho es delicada.", "aguda-ns", 3, "B1"],
  ["atún", "a|tun", 1, "Una lata de {w} para la excursión.", "aguda-ns", 1, "A1"],
  ["jacarandá", "ja|ca|ran|da", 3, "La {w} tiñe la plaza de lila.", "aguda-v", 4, "C1"],
  ["ajonjolí", "a|jon|jo|li", 3, "El pan de {w} se hornea en diciembre.", "aguda-v", 4, "C1"],
  ["ñandú", "ñan|du", 1, "El {w} corre por la estepa.", "aguda-v", 4, "C1"],
  ["cañón", "ca|ñon", 1, "El {w} del río corta la roca.", "aguda-ns", 2, "A2"],

  /* ---------------- Ampliación · agudas SIN tilde (trampas) ---------------- */
  ["tambor", "tam|bor", -1, "El {w} da la señal de partir.", "aguda-no", 2, "A2"],
  ["reptil", "rep|til", -1, "El {w} del terrario se camufla.", "aguda-no", 2, "A2"],
  ["evaluar", "e|va|luar", -1, "El jurado se toma su tiempo para {w}.", "aguda-no", 3, "B2"],
  ["leer", "le|er", -1, "Le gusta {w} bajo el faro.", "aguda-no", 2, "A2"],
  ["creer", "cre|er", -1, "Los niños {w} en la gaviota de tres patas.", "aguda-no", 2, "A2"],

  /* ---------------- Ampliación · llanas nuevas ---------------- */
  ["hábitat", "ha|bi|tat", 0, "El {w} del cangrejo se pierde con las obras.", "llana-cons", 4, "C1"],
  ["cáliz", "ca|liz", 0, "Un {w} de plata corona la copa.", "llana-cons", 4, "C1"],
  ["cónclave", "con|cla|ve", 0, "El {w} de los capitanes dura hasta el alba.", "llana-cons", 4, "C1"],
  ["sílex", "si|lex", 0, "Los cuchillos de {w} cortan como el acero.", "llana-cons", 4, "C1"],
  ["límite", "li|mi|te", 0, "Nadar hasta el {w} de las boyas.", "llana-cons", 3, "B1"],
  ["tapiz", "ta|piz", 0, "El {w} de la pared cuenta una batalla naval.", "llana-cons", 3, "B1"],
  ["matiz", "ma|tiz", 0, "Un {w} de azul distinto en cada vela.", "llana-cons", 3, "B1"],

  /* ---------------- Ampliación · llanas SIN tilde (trampas) ---------------- */
  ["oveja", "o|ve|ja", -1, "La {w} del pastor se llama Perla.", "llana-no", 1, "A1"],
  ["conejo", "co|ne|jo", -1, "El {w} de la isla no teme a nadie.", "llana-no", 1, "A1"],
  ["aceituna", "a|cei|tu|na", -1, "La {w} de esta tierra es pequeña y sabrosa.", "llana-no", 2, "A2"],
  ["paloma", "pa|lo|ma", -1, "Una {w} mensajera llegó al balcón.", "llana-no", 1, "A1"],
  ["cadena", "ca|de|na", -1, "La {w} del puerto cruje con el oleaje.", "llana-no", 1, "A1"],
  ["faroles", "fa|ro|les", -1, "Los {w} del muelle se encienden al anochecer.", "llana-no", 2, "A2"],
  ["aldea", "al|de|a", -1, "La {w} celebra su fiesta en agosto.", "llana-no", 2, "A2"],
  ["museo", "mu|se|o", -1, "El {w} del faro abre en julio.", "llana-no", 1, "A1"],
  ["idea", "i|de|a", -1, "Se le ocurre una {w} brillante cada minuto.", "llana-no", 1, "A1"],
  ["continuo", "con|ti|nu|o", -1, "El {w} de la tinta mancha la página.", "llana-no", 3, "B2"],

  /* ---------------- Ampliación · hiatos nuevos ---------------- */
  ["ahí", "a|hi", 1, "El libro que buscas está {w}, en la mesilla.", "hiato", 2, "A2", "«Ahí» tiene hiato: las dos vocales se separan y la cerrada tónica (í) lleva tilde."],
  ["dúo", "du|o", 0, "Un {w} de guitarras abre la función.", "hiato", 3, "B1"],
  ["caótico", "ca|o|ti|co", 1, "El tráfico del puerto era {w}.", "hiato", 3, "B2", "«Caótico» tiene hiato (a-ó): las dos vocales fuertes se separan; la tónica lleva tilde."],
  ["ataúd", "a|ta|ud", 2, "Sacó un {w} de sombreros del armario.", "hiato", 3, "B2", "«Ataúd» lleva tilde en la ú para romper el diptongo: sin ella sonaría «a-taud»."],
  ["cafeína", "ca|fe|i|na", 2, "Un refresco con {w} para el turno de noche.", "hiato", 3, "B2"],
  ["baúles", "ba|u|les", 1, "Los {w} viejos guardan mapas.", "hiato", 2, "A2"],
  ["podría", "po|dri|a", 2, "Me {w} quedar un rato más.", "hiato", 2, "A2"],
  ["guía", "gu|i|a", 1, "La {w} de la cueva es la del farol.", "hiato", 1, "A1"],
  ["eólico", "e|o|li|co", 1, "El parque {w} se ve desde el pueblo.", "hiato", 3, "B2", "«Eólico» tiene hiato (e-ó): las dos vocales fuertes se separan; la tónica lleva tilde."],
  ["coágulo", "co|a|gu|lo", 1, "El {w} cerró la herida al instante.", "hiato", 4, "C1", "«Coágulo» tiene hiato (o-á): las dos vocales fuertes se separan; la tónica lleva tilde."],

  /* ---------------- Ampliación · diacríticas nuevas ---------------- */
  ["cuál", "cu|al", 1, "¿{w} de los dos veleros es el tuyo?", "diacritica", 1, "A1", "Con tilde, «cuál» pregunta; sin tilde, «cual» une oraciones."],
  ["porqué", "por|que", 1, "El {w} de su enfado nadie lo sabe.", "diacritica", 3, "B2", "«Porqué» con tilde es el sustantivo («el porqué»); «porque» indica causa y «por qué» pregunta."],

  /* ---------------- Ampliación · monosílabos nuevos ---------------- */
  ["gran", "gran", -1, "Tuvo una {w} idea a mitad de la travesía.", "mono-no", 1, "A1"],
  ["san", "san", -1, "{w} Telmo guarda a los marineros.", "mono-no", 1, "A1"],
  ["buey", "buey", -1, "Un {w} tira del carro de la huerta.", "mono-no", 2, "A2"],
  ["hui", "hui", -1, "No pude evitarlo: tuve que {w}.", "mono-no", 3, "B2", "«Hui» es monosílabo: la forma antigua «huí» con tilde ya no se usa."],
  ["bien", "bien", -1, "Lo hizo {w} a la primera.", "mono-no", 1, "A1"],
  ["mal", "mal", -1, "Le fue {w} en el examen.", "mono-no", 1, "A1"],
  ["ya", "ya", -1, "{w} sale el sol.", "mono-no", 1, "A1"],
  ["yo", "yo", -1, "{w} aviso si la veo.", "mono-no", 1, "A1"],
  ["haz", "haz", -1, "{w} la maleta mientras cierro.", "mono-no", 2, "A2"],
  ["he", "he", -1, "{w} traído el parte del tiempo.", "mono-no", 1, "A1"],
  ["mes", "mes", -1, "Cada {w} hay cuento nuevo.", "mono-no", 1, "A1"],
  ["dos", "dos", -1, "Faltan {w} estaciones para llegar.", "mono-no", 1, "A1"],
  ["luz", "luz", -1, "Una {w} tiembla en el horizonte.", "mono-no", 1, "A1"],
  ["pez", "pez", -1, "Un {w} plateado salta del agua.", "mono-no", 2, "A2"],
  ["sed", "sed", -1, "El agua mata la {w}.", "mono-no", 1, "A1"],
  ["red", "red", -1, "Remendó la {w} con hilo de vela.", "mono-no", 1, "A1"],
  ["tren", "tren", -1, "El {w} de las siete no falla.", "mono-no", 1, "A1"],
  ["plan", "plan", -1, "El {w} B era volver en barca.", "mono-no", 1, "A1"],

  /* ---------------- Ampliación · diéresis ---------------- */
  ["ambigüedad", "am|bi|gue|dad", 2, "La {w} del poema es intencionada.", "dieresis", 4, "C1"],

];

/* ---------------- Plantillas de explicación ---------------- */
const TEMPLATES: Record<Cat, (c: string) => string> = {
  esdrujula: (c) => `«${c}» es esdrújula: las palabras esdrújulas y sobresdrújulas siempre llevan tilde.`,
  sobresdrujula: (c) => `«${c}» es sobresdrújula: las sobresdrújulas siempre llevan tilde.`,
  "aguda-v": (c) => `«${c}» es aguda terminada en vocal: las agudas llevan tilde cuando terminan en vocal, -n o -s.`,
  "aguda-ns": (c) => `«${c}» es aguda terminada en -n o -s: las agudas llevan tilde al terminar en vocal, -n o -s.`,
  "aguda-no": (c) => `«${c}» es aguda terminada en consonante distinta de -n y -s: las agudas solo llevan tilde si acaban en vocal, -n o -s. Aquí no lleva.`,
  "llana-cons": (c) => `«${c}» es llana terminada en consonante distinta de -n y -s: por eso lleva tilde.`,
  "llana-no": (c) => `«${c}» es llana terminada en vocal, -n o -s: las llanas solo llevan tilde si NO terminan así. Aquí no lleva.`,
  hiato: (c) => `«${c}» tiene hiato: la vocal tónica (i o u) rompe el diptongo y siempre lleva tilde.`,
  diptongo: (c) => `«${c}» lleva la tilde sobre la vocal abierta del diptongo.`,
  diacritica: () => "Tilde diacrítica.",
  "mono-no": (c) => `«${c}» es monosílabo: no lleva tilde (solo algunos, como «sí» o «más», la llevan para distinguir significados).`,
  dieresis: (c) => `«${c}» lleva diéresis (ü) para que la u suene tras la g.`,
};

const TAGS: Record<Cat, string[]> = {
  esdrujula: ["esdrújulas"],
  sobresdrujula: ["sobresdrújulas"],
  "aguda-v": ["agudas"],
  "aguda-ns": ["agudas"],
  "aguda-no": ["agudas", "trampa"],
  "llana-cons": ["llanas"],
  "llana-no": ["llanas", "trampa"],
  hiato: ["hiatos"],
  diptongo: ["diptongos"],
  diacritica: ["diacríticas"],
  "mono-no": ["monosílabos", "trampa"],
  dieresis: ["diéresis"],
};

/* ---------------- Utilidades ---------------- */
const TILDE_MAP: Record<string, string> = { á: "a", é: "e", í: "i", ó: "o", ú: "u", ü: "u", Á: "A", É: "E", Í: "I", Ó: "O", Ú: "U", Ü: "U" };
const sinTilde = (w: string) => [...w].map((ch) => TILDE_MAP[ch] ?? ch).join("");

interface Out {
  id: string; type: "tildes"; skill: "ortografia"; difficulty: number; cefr: string;
  sentence: string; word: string; syllables: string[]; answerSyllable: number;
  correctForm: string; prompt: string; explanation: string; tags: string[];
}

const PROMPT = "¿Qué sílaba lleva la tilde?";
const items: Out[] = [];
const errors: string[] = [];

T.forEach(([form, syls, idx, tpl, cat, diff, cefr, note], i) => {
  const word = sinTilde(form);
  const syllables = syls.split("|");
  const sentence = tpl.replace("{w}", word);
  const problems: string[] = [];
  if (syllables.join("") !== word) problems.push(`sílabas (${syls}) ≠ palabra (${word})`);
  if (idx >= syllables.length) problems.push("índice fuera de rango");
  if (!sentence.includes(word)) problems.push("la frase no contiene la palabra");
  if (idx >= 0 && idx === -1) problems.push("unreachable");
  if (cat === "diacritica" && !note) problems.push("diacrítica sin nota");
  if (problems.length) errors.push(`${form}: ${problems.join("; ")}`);
  items.push({
    id: `tx-${String(i + 1).padStart(3, "0")}`,
    type: "tildes",
    skill: "ortografia",
    difficulty: diff,
    cefr,
    sentence,
    word,
    syllables,
    answerSyllable: idx,
    correctForm: form,
    prompt: PROMPT,
    explanation: note ?? TEMPLATES[cat](form),
    tags: TAGS[cat],
  });
});

/* ---------------- Validaciones globales ---------------- */
const ids = new Set(items.map((x) => x.id));
if (ids.size !== items.length) errors.push("ids duplicados");
const old = readFileSync(new URL("../src/data/tildes.ts", import.meta.url).pathname, "utf8");
for (const it of items) {
  if (old.includes(`word: "${it.word}", syllables: [${it.syllables.map((s) => `"${s}"`).join(", ")}]`)) {
    errors.push(`duplicado con paquete original: ${it.word}`);
  }
  if (it.sentence.split(it.word).length - 1 !== 1) {
    errors.push(`la palabra aparece ≠1 vez en la frase: ${it.word}`);
  }
}

/* ---------------- Emisión ---------------- */
const head = `/**
 * Tribunal de las Tildes · Paquete ampliado X (${items.length} ítems).
 * Generado por scripts/gen-tildes-x.ts · NO editar a mano.
 * Cubre: esdrújulas, sobresdrújulas (y adverbios en -mente), agudas y
 * llanas con y sin tilde (con trampas), hiatos, diptongos, diacríticas,
 * monosílabos y diéresis (ü).
 */
import type { TildeExercise } from "@/types";

export const TILDES_PACK_X: TildeExercise[] = [
`;

const body = items
  .map((it) => `  { id: "${it.id}", type: "tildes", skill: "ortografia", difficulty: ${it.difficulty}, cefr: "${it.cefr}",
    sentence: ${JSON.stringify(it.sentence)},
    word: "${it.word}", syllables: [${it.syllables.map((s) => `"${s}"`).join(", ")}], answerSyllable: ${it.answerSyllable}, correctForm: "${it.correctForm}",
    prompt: ${JSON.stringify(it.prompt)},
    explanation: ${JSON.stringify(it.explanation)},
    tags: [${it.tags.map((t) => `"${t}"`).join(", ")}] },`)
  .join("\n");

const out = head + body + "\n];\n";
writeFileSync(new URL("../src/data/gen/tildes-x.ts", import.meta.url).pathname, out, "utf8");

console.log(`Generados ${items.length} ítems en src/data/gen/tildes-x.ts`);
console.log("Total con paquete original:", 180 + items.length);
if (errors.length) {
  console.error(`\n✗ ERRORES (${errors.length}):`);
  for (const e of errors) console.error("  -", e);
  process.exit(1);
}
console.log("✓ Validaciones correctas (sílabas, frases, ids, duplicados)");
