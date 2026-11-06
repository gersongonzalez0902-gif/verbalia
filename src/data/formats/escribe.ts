import type { EscribeExercise, SkillId } from "@/types";
import { SRS_WORDS } from "../words-srs";
import { CEFR_BY_DIFFICULTY, fmtId } from "./shared";

/**
 * Pack «Escribe la palabra» · Escribir el término exacto a partir de la pista.
 * - Bosque: generado desde el paquete SRS (definición → palabra, A1-B1).
 * - Ciudad (conjugación), Fortaleza (ortografía) y Torre (sinónimo): curado.
 * Formato de fila: [pista, palabra, segunda pista, explicación, dificultad]
 */

type Row = [string, string, string, string, 1 | 2 | 3 | 4 | 5];

interface VariantSpec {
  variant: string;
  skill: SkillId;
  rows: Row[];
}

/** Bosque: definición → palabra, determinista y estable. */
function bosqueRows(): Row[] {
  const words = SRS_WORDS.filter(
    (w) =>
      w.difficulty <= 2 &&
      /^[a-záéíóúüñ]+$/.test(w.word) &&
      w.word.length <= 10,
  );
  return words.slice(0, 90).map((w) => [
    w.definition,
    w.word,
    `${w.pos} · ${w.word.length} letras`,
    `«${w.word}»: ${w.definition} Ejemplo: «${w.example}»`,
    w.difficulty as 1 | 2,
  ]);
}

const CURATED: VariantSpec[] = [
  {
    variant: "ciudad",
    skill: "gramatica",
    rows: [
      ["(yo, pretérito perfecto simple) tener → ___", "tuve", "4 letras", "Tener es fuerte: tengo/tuve, como vengo/vine. La raíz cambia entera.", 2],
      ["(tú, presente) ir → ___", "vas", "3 letras", "Ir y ser comparten formas: tú vas y tú eres comparten «fuiste» en pretérito.", 1],
      ["(nosotros, presente de subjuntivo) hablar → ___", "hablemos", "empieza por h", "El subjuntivo de 1.ª persona plural: -emos sin tilde y con h muda.", 3],
      ["(yo, presente) ver → ___", "veo", "3 letras", "Yo veo: ver solo tuerce la primera persona; el resto va decidido por su cuenta (ves, ve, vemos).", 1],
      ["(yo, presente) dar → ___", "doy", "3 letras", "Dar imita a estar, ser e ir: doy, estoy, soy, voy. Cuatro irregulares con la misma y final.", 1],
      ["(nosotros, presente) ir → ___", "vamos", "5 letras", "Nosotros vamos: la misma forma sirve de presente y de puente al futuro (vamos a viajar).", 1],
      ["(tú, presente) ser → ___", "eres", "4 letras", "Ser es el rey de la irregularidad, pero «eres» es de lo primero que se aprende: tú eres.", 1],
      ["(yo, futuro) hablar → ___", "hablaré", "empieza por h", "Futuro regular: infinitivo + é. La h de hablar es muda, pero nunca se cae al escribir.", 1],
      ["(yo, presente) saber → ___", "sé", "lleva tilde", "«Sé», con tilde, es el verbo saber; «se», sin tilde, es pronombre (se fue).", 2],
      ["(yo, pretérito perfecto simple) estar → ___", "estuve", "7 letras", "Estar es fuerte en pretérito: estuve, estuviste, estuvo. La raíz est- gana una u.", 2],
      ["(yo, pretérito perfecto simple) hacer → ___", "hice", "4 letras", "Hacer suelta la c del infinitivo: hice, hiciste, hizo. La h muda se queda.", 2],
      ["(yo, pretérito perfecto simple) venir → ___", "vine", "4 letras", "Venir es fuerte: vine, vino, vinimos. La raíz ven- se convierte en vin-.", 2],
      ["(tú, imperativo) tener → ___", "ten", "3 letras", "Imperativo irregular y sin tilde: ¡ten paciencia! Es la raíz del presente sin decoración.", 2],
      ["(tú, imperativo) hacer → ___", "haz", "3 letras", "¡Haz la cama!: imperativo irregular sin tilde. No lo confundas con «has», de haber (has hecho).", 2],
      ["(yo, pretérito perfecto simple) decir → ___", "dije", "4 letras", "Decir es fuerte y juega con la j: dije, dijiste, dijo, como traje y conduje.", 3],
      ["(yo, pretérito perfecto simple) querer → ___", "quise", "5 letras", "Querer es fuerte: quise, quiso, quisimos. La raíz quis- no lleva tilde.", 3],
      ["(yo, pretérito perfecto simple) poner → ___", "puse", "4 letras", "Poner es fuerte: puse, puso, pusimos. La raíz pus- lo delata.", 3],
      ["(tú, imperativo) venir → ___", "ven", "3 letras", "El imperativo de venir es «ven»: ¡ven aquí! Sin tilde, y distinto de «ve», el imperativo de ver.", 3],
      ["(yo, presente de subjuntivo) ser → ___", "sea", "3 letras", "El subjuntivo de ser es «sea» casi entero: que yo sea, que tú seas, que ellos sean.", 3],
      ["(yo, futuro) tener → ___", "tendré", "con tilde en la e", "Futuro irregular: tener pierde la e final y queda tendré, con tilde en la última sílaba.", 3],
      ["(yo, presente de subjuntivo) ir → ___", "vaya", "4 letras", "El subjuntivo de ir es «vaya»: que yo vaya, que tú vayas, que ellos vayan.", 4],
      ["(yo, presente de subjuntivo) tener → ___", "tenga", "5 letras", "El subjuntivo copia la raíz del presente de yo: tengo → tenga.", 4],
      ["(yo, presente de subjuntivo) saber → ___", "sepa", "4 letras", "Igual que tener: la raíz irregular del presente pasa al subjuntivo. Sé → sepa.", 4],
      ["(él, pretérito perfecto simple) haber → ___", "hubo", "4 letras", "Haber impersonal siempre en singular: hubo, nunca «hubieron personas».", 4],
      ["(yo, condicional) haber → ___", "habría", "lleva tilde", "Condicional de haber: habría, con h. «Abría», de abrir, suena igual pero abre puertas.", 4],
      ["(participio) decir → ___", "dicho", "5 letras", "El participio de decir es irregular: he dicho, habíamos dicho, como escrito o visto.", 4],
      ["(yo, presente de subjuntivo) poner → ___", "ponga", "5 letras", "De pongo sale ponga: el subjuntivo hereda esa g tan suya del presente de yo.", 5],
      ["(yo, presente de subjuntivo) conocer → ___", "conozca", "lleva z", "Conocer guarda la z del presente: conozco → conozca. La z nunca se convierte en s.", 5],
      ["(yo, presente de subjuntivo) oír → ___", "oiga", "lleva g", "De oigo sale oiga: el subjuntivo de oír conserva la g del presente.", 5],
      ["(yo, presente) caber → ___", "quepo", "empieza por q", "Caber es de lo más caprichoso: quepo, cabes, cabe. Solo la primera persona cambia de raíz.", 5],
      ["(yo, condicional) hacer → ___", "haría", "empieza por h", "Hacer acorta futuro y condicional: haré, haría. La raíz har- conserva su h muda.", 5],
      ["(gerundio) haber → ___", "habiendo", "empieza por h", "El gerundio de haber es «habiendo»: habiendo terminado, salimos. Con h, como toda su familia.", 5],
      ["(yo, presente) estar → ___", "estoy", "5 letras", "Estar tuerce la primera persona: yo estoy, con el grupo -oy de soy, voy y doy.", 1],
      ["(yo, presente) haber → ___", "he", "2 letras", "Haber como auxiliar: he comido, he llegado. Con h muda, como toda su familia.", 1],
      ["(yo, pretérito perfecto simple) saber → ___", "supe", "4 letras", "Saber es fuerte: supe, supiste, supo. La raíz sab- se convierte en sup-, como ten- en tuve.", 2],
      ["(tú, imperativo) decir → ___", "di", "2 letras", "El imperativo de decir es «di»: ¡di la verdad! Sin tilde, a diferencia de «sí», la afirmación.", 2],
      ["(tú, imperativo) salir → ___", "sal", "3 letras", "El imperativo de salir es «sal»: ¡sal de aquí! La raíz queda desnuda, sin terminación.", 3],
      ["(tú, imperativo) poner → ___", "pon", "3 letras", "El imperativo de poner es «pon»: ¡pon la mesa! Raíz desnuda y sin tilde, como sal y ten.", 3],
      ["(él, futuro) decir → ___", "dirá", "lleva tilde", "Decir acorta el futuro: diré, diría, dirá. La raíz dic- queda convertida en dir-.", 4],
      ["(yo, futuro) poder → ___", "podré", "termina en é", "Poder pierde la e del infinitivo: podré, como tendré y sabré. La tilde cae en la é final.", 4],
      ["(tú, condicional) hacer → ___", "harías", "empieza por h", "Condicional de hacer: harías, con la raíz har- de haré y haría. La h muda nunca se cae.", 4],
      ["(yo, presente de subjuntivo) dar → ___", "dé", "lleva tilde", "El subjuntivo de dar es «dé»: que yo dé, que tú des. Con tilde, a diferencia de la preposición «de».", 5],
      ["(yo, presente de subjuntivo) estar → ___", "esté", "lleva tilde", "Estar tuerce el subjuntivo: que yo esté, que tú estés. Con tilde, nunca como «este» libro.", 5],
    ],
  },
  {
    variant: "fortaleza",
    skill: "ortografia",
    rows: [
      ["Ave urbana que ronda las plazas buscando migas (plural)", "palomas", "8 letras", "Con m: paloma, palomas. El plural no duplica la m: monosílaba no es, pero la familia vuela igual.", 2],
      ["Recinto acorazado donde el banco custodia el dinero", "bóveda", "empieza por b", "B con b y tilde esdrújula en la ó: del latín volutus (dar vueltas), por su techo curvo.", 3],
      ["Fruta morada de verano, alargada y dulce", "ciruela", "empieza por c", "Ciruela con c inicial: viene del latín pruna (ciruela = pequeña pera).", 1],
      ["Animal de granja que da leche y muu", "vaca", "empieza por v", "Con v es el animal; con b, «baca», sería el portaequipajes del coche.", 1],
      ["Recipiente para beber agua o vino", "vaso", "empieza por v", "Vaso con v, como vino; «baso» solo existe como forma del verbo basar.", 1],
      ["Animal de cuello larguísimo y manchas", "jirafa", "empieza por j", "Jirafa se escribe con j: «girafa» es el error clásico de quien aprende la g.", 1],
      ["Palabra para saludar al llegar", "hola", "4 letras, con h", "«Hola» lleva h muda: se escribe pero no suena. «Ola» es la del mar.", 1],
      ["Insecto que hace miel y zumba en las flores", "abeja", "lleva b", "Abeja con b: su zumbido se escribe con z, pero ella vuela con b.", 1],
      ["Sinónimo de hermoso o precioso", "bello", "5 letras, con b", "Bello, con b, es lo hermoso. Con v, «vello», es el pelo fino de la piel.", 2],
      ["Planta pequeña y verde del prado, la que come la vaca", "hierba", "empieza por h", "La planta es «hierba», con rb. «Hierva», con rv, es forma del verbo hervir.", 2],
      ["Persona que dirige una empresa o un equipo", "jefe", "empieza por j", "Jefe lleva j ante e: «gefe» no existe, aunque suene igual.", 2],
      ["Piedras menudas que cubren los caminos del campo", "grava", "5 letras", "Grava con v: las piedrecitas del camino. «Graba», con b, es del verbo grabar.", 2],
      ["Recipiente grande para cocinar el cocido", "olla", "con ll", "Olla con ll, como calle: la de los guisos. «Hoya» es un hoyo en el terreno.", 2],
      ["Ave de corral que todavía no es gallo", "pollo", "con ll", "Pollo con ll: el ave. «Polo», con una l, es el helado, el deporte o la camiseta.", 2],
      ["Pelo fino y suave que cubre la piel", "vello", "empieza por v", "Vello con v es el pelo de la piel; «bello», con b, es lo hermoso.", 3],
      ["Recipiente de cocina con mango", "cazo", "4 letras, termina en z", "Cazo con z final: el recipiente. «Caso», con s, es un asunto o un ejemplo.", 3],
      ["El que guarda y atiende la caja del banco", "cajero", "lleva j", "Cajero con j: el del banco. «Casero», con s, es lo hecho en casa.", 3],
      ["Soporte del techo del coche para las maletas", "baca", "lleva b", "Baca con b: el portaequipajes. «Vaca», con v, es el animal que da leche.", 3],
      ["Cerca de madera que salta el caballo en la carrera", "valla", "con ll", "Valla con ll es la cerca; «vaya», con y, es forma del verbo ir.", 3],
      ["Parte más alta de la montaña", "cima", "4 letras, con c", "Cima con c: la cumbre. «Sima», con s, es un hoyo muy profundo, lo contrario.", 3],
      ["Hoyo muy profundo, lo contrario de la cima", "sima", "empieza por s", "Sima con s es el abismo; «cima», con c, es la cumbre. Cumbre y c suben juntas.", 4],
      ["Líquido que sube por el tronco y alimenta las hojas", "savia", "5 letras, con v", "Savia con v es la sangre de las plantas; «sabía», con b, es del verbo saber.", 4],
      ["Primera persona del presente del verbo echar", "echo", "sin h", "«Echo», sin h: yo echo la carta al buzón. «Hecho», con h, es participio de hacer.", 4],
      ["Participio del verbo hacer", "hecho", "empieza por h", "«Hecho» con h: ya está hecho. «Echo», sin h, es del verbo echar.", 4],
      ["Aire que sale de los pulmones al respirar", "exhalación", "lleva h", "Exhalación lleva h muda entre la x y la a: ex-halar, echar el aire fuera.", 4],
      ["Condicional del verbo haber", "habría", "empieza por h", "«Habría», de haber, se escribe con h; «abría», de abrir, suena exactamente igual.", 4],
      ["Forma del subjuntivo del verbo hervir", "hierva", "termina en -rva", "«Hierva», con rv, viene de hervir; «hierba», con rb, es la planta del prado.", 5],
      ["Árbol de madera clara; también forma del verbo haber", "haya", "empieza por h", "«Haya» con h es el árbol (o «que haya suerte»); «halla», con ll, es de hallar, y «aya», sin h, es la niñera.", 5],
      ["Forma impersonal de haber que abre los cuentos", "había", "empieza por h", "«Había una vez...»: con h y b. Y siempre singular: «había personas», nunca «hubieron personas».", 5],
      ["Unir telas con aguja e hilo", "coser", "lleva s", "Coser con s: aguja e hilo. «Cocer», con c, es cocinar en agua hirviendo.", 5],
      ["Cocinar un alimento en agua hirviendo", "cocer", "sin s", "Cocer con c, como cocina: cocer el arroz. «Coser» con s es lo de la aguja.", 5],
      ["Pretérito de callar: dejó de hablar", "calló", "con ll", "«Calló», con ll, es de callar (se calló); «cayó», con y, es de caer (se cayó).", 5],
      ["Movimiento del mar que rompe en la playa", "ola", "3 letras, sin h", "«Ola», la del mar, se escribe sin h; «hola», con h, es el saludo.", 1],
      ["Situación o asunto que se estudia o se analiza", "caso", "4 letras, con s", "«Caso», con s, es el asunto o el ejemplo; «cazo», con z, es el recipiente con mango.", 1],
      ["Forma del verbo ir o exclamación de sorpresa: ¡___!", "vaya", "lleva y", "«Vaya», con y, es del verbo ir (que todo vaya bien) o sorpresa; «valla», con ll, es la cerca.", 2],
      ["Forma del verbo grabar: él ___ la película", "graba", "lleva b", "«Graba», con b, es del verbo grabar; «grava», con v, son las piedras menudas del camino.", 2],
      ["Abertura de la ropa donde entra el botón", "ojal", "4 letras, sin tilde", "Ojal, con l final y sin tilde, es el de la camisa; «ojalá», con tilde, expresa deseo.", 3],
      ["Pretérito imperfecto de saber: ella ya lo ___", "sabía", "lleva b y tilde", "«Sabía», con b, es del verbo saber (ella lo sabía); «savia», con v, es el líquido de las plantas.", 3],
      ["Pretérito de tener: él ___ mucha suerte", "tuvo", "lleva v", "«Tuvo», con v, es el pretérito de tener; «tubo», con b, es el cilindro por donde corre el agua.", 4],
      ["Pretérito de caer: el jarrón ___ al suelo", "cayó", "lleva y y tilde", "«Cayó», con y, es de caer (el jarrón cayó); «calló», con ll, es de callar (se calló).", 4],
      ["Forma del verbo hallar: no ___ la solución", "halla", "con ll", "«Halla», con ll, viene de hallar, encontrar; «haya», con y, es el árbol o el verbo haber.", 4],
      ["Fórmula de deseo que va seguida de subjuntivo: ___ que llegue a tiempo", "ojalá", "lleva tilde", "«Ojalá», con tilde en la á, expresa deseo; «ojal», sin tilde, es la abertura del botón.", 5],
      ["Metal gris y duro con el que se hacen clavos y rejas", "hierro", "empieza por h", "«Hierro», con h, es el metal; «yerro», con y, sería del verbo yerrar (equivocarse), hoy apenas usado.", 5],
    ],
  },
  {
    variant: "torre",
    skill: "expresion",
    rows: [
      ["El contraste: «___ salió el sol, seguía haciendo frío» (conector)", "aunque", "6 letras", "«Aunque» introduce la concesión: el sol salió, pero el frío se quedó.", 2],
      ["Lo contrario de «claro»: una respuesta ___", "oscura", "empieza por o", "Respuesta oscura: la que no se entiende. Antónimo de claro en ambos sentidos.", 3],
      ["Lo hizo ___ decir nada", "sin", "3 letras", "«Sin» expresa la carencia: lo hizo sin pronunciar una sola palabra.", 1],
      ["Estudié mucho, ___ suspendí el examen", "pero", "4 letras", "«Pero» introduce el contraste: esperabas aprobar y no fue así.", 1],
      ["No salgo ___ está lloviendo", "porque", "6 letras", "«Porque» junto introduce la causa; «por qué», separado y con tilde, es la pregunta.", 1],
      ["Espero ___ las diez en la puerta", "hasta", "5 letras, con h", "«Hasta» marca el límite en el tiempo, con h muda como hotel.", 1],
      ["Un café ___ leche, por favor", "con", "3 letras", "«Con» expresa unión o compañía: café y leche juntos en la taza.", 1],
      ["Ella canta y ___ toca la guitarra", "también", "7 letras", "«También» añade algo más: es tan + bien, escrito junto y con tilde en la e.", 1],
      ["No solo es lista: ___, es brillante", "además", "6 letras", "«Además» añade un argumento nuevo a lo ya dicho; cuando encabeza, va seguido de coma.", 2],
      ["Salió ___ la lluvia y sin paraguas", "pese a", "locución de 2 palabras", "«Pese a» reconoce el obstáculo y lo supera: aunque llovía, salió.", 2],
      ["No me gusta el frío; ___, voy a esquiar", "sin embargo", "empieza por sin", "«Sin embargo» opone dos ideas con tono más formal que «pero».", 2],
      ["___ los meteorólogos, mañana hará sol", "según", "6 letras", "«Según» cita la fuente de la información: quién lo dice.", 2],
      ["Todos se equivocaron, ___ María", "salvo", "5 letras", "«Salvo» excluye: todos menos ella, la única que acertó.", 2],
      ["___ cocino yo, tú pones la mesa", "mientras", "7 letras", "«Mientras» indica simultaneidad: las dos cosas pasan a la vez.", 2],
      ["Ha llovido mucho; ___, la cosecha será buena", "por tanto", "empieza por por", "«Por tanto» introduce la consecuencia de lo anterior, en registro formal.", 3],
      ["Llegó el lunes, ___ hace ya tres días", "o sea", "empieza por o", "«O sea» reformula lo dicho con otras palabras para aclararlo.", 3],
      ["Vendré el viernes, ___ el día 14", "es decir", "empieza por es", "«Es decir» precisa lo anterior con una equivalencia: viernes = día 14.", 3],
      ["El año pasado viajé mucho; ___, este año me quedo", "en cambio", "empieza por en", "«En cambio» contrapone dos situaciones distintas.", 3],
      ["Me encanta la fruta tropical, ___ el mango", "por ejemplo", "empieza por por", "«Por ejemplo» presenta un caso concreto de lo que acabas de decir.", 3],
      ["Ayudaron todos, ___ el pequeño de la casa", "incluso", "6 letras", "«Incluso» subraya lo inesperado: hasta el más pequeño participó.", 3],
      ["Ganó el partido ___ sus dos lesiones", "a pesar de", "3 palabras", "«A pesar de» es la versión larga de «pese a»: introduce el obstáculo superado.", 4],
      ["No estudió nada; ___, sacó un diez", "aun así", "empieza por aun", "«Aun así» concede lo anterior y lo contradice: aun sin estudiar, aprobó.", 4],
      ["Encontré el hotel ___ tu mapa dibujado", "gracias a", "empieza por g", "«Gracias a» expresa causa positiva; la negativa sería «por culpa de».", 4],
      ["El vuelo se retrasó ___ la niebla", "debido a", "empieza por d", "«Debido a» introduce la causa con tono formal, muy de las noticias.", 4],
      ["Al ver la catedral sentí un ___ enorme", "asombro", "7 letras", "«Asombro» es la sorpresa intensa, la que deja sin palabras.", 4],
      ["La imprenta fue un ___ en la historia de la humanidad", "hito", "4 letras", "«Hito» es el logro que marca un antes y un después.", 4],
      ["Su paso por la escuela dejó una ___ profunda", "impronta", "8 letras", "«Impronta» es la huella personal que alguien deja en personas o proyectos.", 5],
      ["A fin de ___, el viaje salió barato", "cuentas", "7 letras", "La locución «a fin de cuentas» resume: al final, después de todo.", 5],
      ["Saldré de excursión ___ llueva a cántaros", "a menos que", "3 palabras", "«A menos que» presenta la única condición que lo impediría; pide subjuntivo.", 5],
      ["El plan es caro; ___, es el único viable", "no obstante", "empieza por no", "«No obstante» es el «pero» formal de los textos académicos.", 5],
      ["Se puso a estudiar con ___ y aprobó todo", "ahínco", "con h, 5 letras", "«Con ahínco» significa con empeño y esfuerzo: palabra culta con h muda.", 5],
      ["El río baja con ___ tras las lluvias", "ímpetu", "lleva tilde", "«Ímpetu» es la fuerza y la energía con que algo avanza: siempre con tilde.", 5],
      ["No come ___ bebe desde ayer: nada le apetece", "ni", "2 letras", "«Ni» encadena negaciones: no come ni bebe. Sustituye a «o» cuando la frase ya es negativa.", 1],
      ["Llovía a cántaros, ___ nos quedamos en casa (coloquial)", "así que", "2 palabras", "«Así que» introduce la consecuencia con tono coloquial: la versión informal de «por tanto».", 1],
      ["No es español, ___ francés", "sino", "escrito junto", "Tras una negación, «sino» corrige: no esto, sino aquello. Se escribe junto, a diferencia de «si no».", 2],
      ["Bueno, me voy... ___ ¿has visto mis llaves?", "por cierto", "empieza por por", "«Por cierto» introduce algo que se recuerda de pronto y desvía la conversación un momento.", 2],
      ["___ llegue la primavera, pintamos la casa", "en cuanto", "empieza por en", "«En cuanto» equivale a «en el momento en que»: ante el futuro, pide subjuntivo.", 3],
      ["—¿Me ayudas? —___ que sí", "por supuesto", "empieza por por", "«Por supuesto» es la afirmación enfática: responder «sí» sin dejar lugar a dudas.", 3],
      ["Te lo repito ___ lo entiendas", "para que", "2 palabras", "«Para que» expresa finalidad y rige subjuntivo: se repite con esa intención.", 4],
      ["Siente ___ al mirar las fotos de su pueblo natal", "nostalgia", "9 letras", "«Nostalgia» es la tristeza dulce por tiempos y lugares que ya no vuelven.", 4],
      ["Parecía tímido, pero ___ esconde todo un artista", "en realidad", "empieza por en", "«En realidad» rectifica la primera impresión y revela cómo son las cosas de verdad.", 4],
      ["___ no ha llegado, pero podemos esperarlo", "aún", "lleva tilde", "«Aún», con tilde, significa todavía; «aun», sin tilde, equivale a incluso: «aun así» no lleva tilde.", 5],
      ["La gloria es ___: dura solo un instante", "efímero", "empieza por e", "«Efímero» es lo que dura un instante, como las pompas de jabón; lo contrario de eterno.", 5],
    ],
  },
];

export const ESCRIBE_PACKS: EscribeExercise[] = [
  ...bosqueRows().map((r, i) => buildRow("bosque", "vocabulario", r, i)),
  ...CURATED.flatMap((v) => v.rows.map((r, i) => buildRow(v.variant, v.skill, r, i))),
];

function buildRow(variant: string, skill: SkillId, r: Row, i: number): EscribeExercise {
  return {
    id: fmtId("es", variant, i),
    type: `escribe-${variant}` as EscribeExercise["type"],
    skill,
    difficulty: r[4],
    cefr: CEFR_BY_DIFFICULTY[r[4]],
    prompt: "Escribe la palabra exacta",
    explanation: r[3],
    tags: ["escribe", variant],
    clue: r[0],
    word: r[1],
    hint: r[2] || undefined,
  };
}
