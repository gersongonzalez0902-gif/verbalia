import type { OyeExercise, SkillId } from "@/types";
import { SRS_WORDS } from "../words-srs";
import { CEFR_BY_DIFFICULTY, fmtId } from "./shared";

/**
 * Pack «Oye» · Escuchar (TTS) y elegir la escritura correcta.
 * - Bosque: generado desde el paquete SRS con errores fonéticos verosímiles.
 * - Fortaleza (b/v, g/j, h) y Puerto (frases cortas): curado.
 * Formato de fila: [palabra o frase que suena, escrituras erróneas con " · ", explicación, dificultad]
 */

type Row = [string, string, string, 1 | 2 | 3 | 4 | 5];

interface VariantSpec {
  variant: string;
  skill: SkillId;
  rows: Row[];
}

/** Errores fonéticos deterministas para una palabra (b/v, c/z/s, g/j, h, ll/y). */
function phoneticWrongs(word: string): string[] {
  const wrongs = new Set<string>();
  const push = (w: string) => {
    if (w !== word && w.length > 1) wrongs.add(w);
  };
  if (/[bv]/.test(word)) {
    push(word.replace(/[bv]/g, (c) => (c === "b" ? "v" : "b")));
  }
  if (/[cs]/.test(word)) {
    push(word.replace(/c(?=[eéi])/g, "s"));
    push(word.replace(/s/g, "c"));
  }
  if (/[gj]/.test(word) && /[eéi]/.test(word)) {
    push(word.replace(/g(?=[eéi])/g, "j"));
    push(word.replace(/j(?=[eéi])/g, "g"));
  }
  if (word.startsWith("h")) push(word.slice(1));
  if (!word.startsWith("h")) {
    // Añadir h solo a palabras que empiezan por vocal «e» o «o» (hábito real).
    if (/^[eéoó]/.test(word)) push(`h${word}`);
  }
  if (word.includes("ll")) push(word.replace(/ll/g, "y"));
  if (word.includes("y") && !word.startsWith("y")) push(word.replace(/y/g, "ll"));
  if (/[áéíóú]/.test(word)) {
    push(word.normalize("NFD").replace(/\p{Diacritic}/gu, ""));
  }
  return [...wrongs].slice(0, 3);
}

/** Bosque: palabras del SRS con al menos dos errores fonéticos generables. */
function bosqueRows(): Row[] {
  const words = SRS_WORDS.filter(
    (w) =>
      w.difficulty <= 3 &&
      /^[a-záéíóúüñ]+$/.test(w.word) &&
      w.word.length <= 10,
  );
  const rows: Row[] = [];
  for (const w of words) {
    if (rows.length >= 80) break;
    const wrongs = phoneticWrongs(w.word);
    if (wrongs.length >= 2) {
      rows.push([
        w.word,
        wrongs.join(" · "),
        `«${w.word}»: ${w.definition}`,
        w.difficulty as 1 | 2 | 3,
      ]);
    }
  }
  return rows;
}

const CURATED: VariantSpec[] = [
  {
    variant: "fortaleza",
    skill: "ortografia",
    rows: [
      ["vaca", "baca · vaka", "Con v es el animal de la leche; con b, el portaequipajes del coche.", 1],
      ["haber", "a ver · aber", "«Haber» es verbo o sustantivo; «a ver» es ir a mirar.", 2],
      ["jeringa", "geringa · jerinja", "Con j ante e/i: las jeringas pinchan con jota.", 3],
      ["exhalar", "exalar · esalar", "Con h intercalada: ex-halar, expulsar el aire.", 4],
      ["abeja", "aveja · habeja", "Abeja con b, como boca; «aveja» no existe, aunque suene igual.", 1],
      ["vaso", "baso · vazo", "Vaso con v y con s; «baso» y «vazo» son trampas de dictado.", 1],
      ["gente", "jente · hente", "Gente con g ante e: suena como j, pero se escribe con g.", 1],
      ["estación", "estacion · estasión", "Las palabras en -ción llevan tilde y c: estación.", 1],
      ["pollo", "polo · poyo", "El ave es «pollo» con ll; «polo» es el helado o el deporte.", 1],
      ["jefe", "gefe · jefé", "Jefe con j ante e: «gefe» es el error clásico de quien solo escucha.", 2],
      ["girasol", "jirasol · girasól", "Girasol con g, como girar: la flor que sigue al sol.", 2],
      ["hierba", "hierva · ierba", "La planta es «hierba», con h y con rb; «hierva», con rv, es del verbo hervir.", 2],
      ["bicicleta", "vicicleta · bicycleta", "Bicicleta se escribe con b y sin y: la bici no necesita extranjerismos.", 2],
      ["olla", "hoya · oya", "«Olla» con ll y sin h es la de cocer; «hoya» es un hundimiento del terreno.", 2],
      ["valla", "vaya · baya", "«Valla» con ll es la cerca; «vaya», con y, es del verbo ir.", 2],
      ["prenda", "prienda · brenda", "La prenda de vestir no lleva diptongo: prenda, de «prender», nunca «prienda».", 2],
      ["hierva", "hierba · ierva", "«Hierva», con rv, es forma del verbo hervir: que el agua hierva a borbotones.", 3],
      ["brújula", "brúgula · brujula", "Brújula con j y tilde en la u: la que siempre señala el norte.", 3],
      ["cárcel", "carcel · cársel", "Cárcel es llana terminada en -l: la tilde va en la á.", 3],
      ["líquido", "liquido · liqido", "El sustantivo es esdrújula: líquido. «Liquido», sin tilde, sería del verbo liquidar.", 3],
      ["polo", "pollo · poyo", "«Polo» con una sola l: el helado, el deporte o la camiseta.", 3],
      ["coser", "cocer · cozer", "Coser con s: unir con aguja e hilo. «Cocer», con c, es cocinar.", 3],
      ["cocer", "coser · cozer", "Cocer con c, como cocina: hacer en agua hirviendo. «Coser» es lo de la aguja.", 3],
      ["haya", "halla · aya", "«Haya» con h es el árbol o el verbo haber (que haya suerte); «halla» es de hallar.", 4],
      ["halla", "haya · aya", "«Halla» viene de hallar, encontrar; el árbol y el haber se escriben «haya».", 4],
      ["vaya", "valla · baya", "«Vaya», con y, es del verbo ir o expresa sorpresa; «valla» es la cerca.", 4],
      ["exámenes", "examenes · hexámenes", "Exámenes es esdrújula: tilde en la á, y sin h.", 4],
      ["echo", "hecho · echó", "«Echo» sin h es del verbo echar: yo echo la carta. «Hecho» es de hacer.", 4],
      ["hecho", "echo · hechó", "«Hecho» con h es participio de hacer; «echo», sin h, es de echar.", 4],
      ["baya", "vaya · valla", "«Baya» con b es el fruto carnoso; «vaya» es del verbo ir y «valla» la cerca.", 5],
      ["aya", "haya · halla", "«Aya», sin h, es la niñera; «haya» es el árbol o el verbo haber.", 5],
      ["brebaje", "brevaje · brebage", "Brebaje con b y con j: poción o mezcla de bebidas.", 5],
      ["exuberante", "exhuberante · esuberante", "Exuberante no lleva h y empieza con ex: la abundancia no la necesita.", 5],
      ["vehículo", "behículo · vehiculo", "Vehículo lleva h intercalada y tilde: es esdrújula.", 5],
      ["hola", "ola · olla", "«Hola», el saludo, lleva h muda; «ola» es la del mar y «olla», con ll, la de cocinar.", 1],
      ["hongo", "ongo · jongo", "«Hongo» lleva h muda inicial: se escribe aunque no suene; «ongo» y «jongo» no existen.", 1],
      ["examen", "éxamen · ecámen", "«Examen» es llana terminada en -n: no lleva tilde. La de «éxamen» sobra y la x nunca se cambia por c.", 2],
      ["llave", "yave · llabe", "«Llave» se escribe con ll, como «lluvia»; «yave» no existe y termina en -e, nunca en -be.", 2],
      ["género", "jenero · genero", "«Género» lleva g ante e, aunque suene como j, y tilde en la é; «genero», sin tilde, es del verbo generar.", 3],
      ["cerebro", "serebro · cebrero", "«Cerebro» se escribe con c inicial y b en el medio: «serebro» y «cebrero» son trampas de dictado.", 3],
      ["bilingüe", "vilingüe · bilingue", "«Bilingüe» lleva b inicial y diéresis sobre la u: sin las diéresis, la u sería muda.", 4],
      ["huevo", "güevo · uevo", "«Huevo» lleva h muda y no lleva g: la u suena fuerte; «güevo» y «uevo» son fallos de oído.", 4],
      ["invierno", "inbierno · imbierno", "«Invierno» lleva v: el oído empuja hacia la b o la m, pero se escribe con v, como «nieve».", 4],
      ["hormiga", "ormiga · horminga", "«Hormiga» lleva h muda y no mete la n de más: «horminga» es el error clásico del dictado.", 5],
      ["hierro", "yerro · ierro", "«Hierro», el metal, lleva h y rr; «yerro» suena igual pero es un descuido del verbo yerrar.", 5],
      ["oveja", "obeja · hoveja", "«Oveja» con v y sin h: la h no se cuela al principio; «obeja» y «hoveja» son trampas del oído.", 5],
    ],
  },
  {
    variant: "puerto",
    skill: "audicion",
    rows: [
      ["El barco zarpó al amanecer", "El barco salpó al amanecer · El barco zarpo al amanecer", "Zarpó, de zarpar: levar anclas. Salpó no existe y zarpo perdió su tilde.", 2],
      ["Había una vez un puerto tranquilo", "Avía una vez un puerto tranquilo · Había una bes un puerto tranquilo", "«Había» con h y de haber; una vez con z final.", 2],
      ["Buen viaje a la isla", "Vuen viaje a la isla · Buen biage a la isla", "«Buen» se escribe con b y «viaje» con v: el buen viaje mezcla las dos letras.", 1],
      ["El tren llega a las ocho", "El tren yega a las ocho · El tren llega alas ocho", "«Llega» con ll; y «a las» va separado: «alas» son las de los pájaros.", 1],
      ["El café está muy caliente", "El cafe está muy caliente · El café esta muy caliente", "«Café» y «está» son agudas terminadas en vocal: las dos llevan tilde.", 1],
      ["Hola, ¿hay barcos hoy?", "Ola, ¿hay barcos hoy? · Hola, ¿ay barcos hoy?", "«Hola» y «hay» llevan h: el saludo y el verbo haber.", 1],
      ["El tren va muy rápido", "El tren ba muy rápido · El tren va muy rapido", "«Va» con v, de ir; «rápido» es esdrújula, con tilde en la á.", 1],
      ["El avión despega en diez minutos", "El avión despeja en diez minutos · El avión despega en dies minutos", "«Despega», de despegar, con g; «diez» termina en z, no en s.", 2],
      ["El marinero coge el cabo", "El marinero coje el cabo · El marinero coge el cavo", "«Coge» con g (nunca «coje») y «cabo» con b: la cuerda del barco.", 2],
      ["¿Qué tal el viaje en ferry?", "¿Que tal el viaje en ferry? · ¿Qué tal el biage en ferry?", "El «qué» de la pregunta lleva tilde; «viaje» con v.", 2],
      ["La estación está llena de gente", "La estación esta llena de gente · La estación está llena de jente", "«Está» con tilde; «gente» con g ante e, aunque suene j.", 2],
      ["Vamos a ver el atardecer", "Vamos a ber el atardecer · Vamos a haber el atardecer", "«A ver» separado es ir a mirar; «haber» es el verbo o el auxiliar.", 2],
      ["El barco echa el ancla en la bahía", "El barco hecha el ancla en la bahía · El barco echa el ancla en la baía", "«Echa», de echar, no lleva h; «bahía» sí que la lleva.", 3],
      ["El sendero de grava lleva al faro", "El sendero de graba lleva al faro · El sendero de grava yeba al faro", "«Grava» con v son las piedrecitas; «graba», con b, es del verbo grabar.", 3],
      ["El camión carga las cajas", "El camion carga las cajas · El camión carja las cajas", "«Camión» con tilde por aguda; «carga», de cargar, con g.", 3],
      ["Ayer viajé en tren nocturno", "Ayer viaje en tren nocturno · Ayer biage en tren nocturno", "«Viajé» con tilde: sin ella sería el sustantivo «viaje».", 3],
      ["El equipaje pasa por la máquina", "El equipaje pasa por la maquina · El equipaje pasa por la makina", "«Máquina» es esdrújula con qu: tilde en la á.", 3],
      ["¿Por qué el ferry se detiene?", "¿Porque el ferry se detiene? · ¿Por que el ferry se detiene?", "En preguntas, «por qué» va separado y con tilde; «porque», junto, responde.", 3],
      ["Ojalá el capitán dé la señal", "Ojalá el capitan dé la señal · Ojalá el capitán de la señal", "«Dé» con tilde es del verbo dar; «de» sin tilde es preposición.", 3],
      ["He hecho las maletas sin ayuda", "Echo las maletas sin ayuda · E hecho las maletas sin ayuda", "«He hecho»: el «he» es de haber y «hecho», participio de hacer. «Echo», sin h, es de echar.", 4],
      ["Las olas rompen en el dique", "Las holas rompen en el dique · Las olas rompen en el dike", "«Ola», la del mar, no lleva h; «hola» es el saludo.", 4],
      ["El billete de ida y vuelta", "El villete de ida y vuelta · El billete de ida y buelta", "«Billete» con b y «vuelta» con v: la pareja b/v del viajero.", 4],
      ["El patrón revisa la hoja de ruta", "El patrón revisa la oja de ruta · El patrón rebisa la hoja de ruta", "«Hoja» con h, como «hola»; «revisa», de ver, con v.", 4],
      ["A ver si hay plazas en el ferry", "Haber si hay plazas en el ferry · A ver si ay plazas en el ferry", "«A ver» (ir a mirar), «hay» (haber) y «ay» (exclamación): tres hermanas del dictado.", 5],
      ["Quizá llueva en la travesía", "Quizas llueva en la travesía · Quizá llueva en la travesia", "«Quizá» y «travesía» piden tilde: una por aguda, la otra por romper el diptongo.", 5],
      ["El equipaje excede el peso permitido", "El equipaje escede el peso permitido · El equipaje excéde el peso permitido", "«Excede» lleva x (ex- + cede) y no lleva tilde.", 5],
      ["El barco navega hacia el norte", "El barco navega asia el norte · El barco nabega hacia el norte", "«Hacia» lleva h, como «hoy»; «Asia» es el continente. «Navega», de navegar, con v.", 1],
      ["El ferry parte al mediodía", "El ferri parte al mediodía · El ferry parte al mediodia", "«Ferry» se escribe con y doble, préstamo del inglés; «mediodía» es aguda: la tilde va en la í, como en «día».", 1],
      ["El horario del tren cambió", "El orario del tren cambió · El horario del tren cambio", "«Horario» lleva h muda, como «hora»; «cambió», aguda terminada en vocal, lleva tilde.", 2],
      ["Los viajeros esperan en el andén", "Los viajeros esperan en el anden · Los biageros esperan en el andén", "«Viajeros», con v, de viaje; «andén», aguda terminada en -n, lleva tilde en la é.", 2],
      ["El pasaje sube al barco", "El paisaje sube al barco · El pasaje suve al barco", "«Pasaje» son los viajeros o el billete; «paisaje» es el de las montañas. «Sube», de subir, con b.", 3],
      ["Echa el ancla con cuidado", "Hecha el ancla con cuidado · Echo el ancla con cuidado", "«Echa», de echar, no lleva h; «hecha» es participio de hacer y «echo» es la forma de yo.", 3],
      ["Ojalá no llueva esta noche", "Ojala no llueva esta noche · Ojalá no lueva esta noche", "«Ojalá» lleva tilde en la á; «llueva», de llover, con ll: sin ella, «lueva» no existe.", 4],
      ["El barco atracó en el muelle", "El barco atracó en el mueble · El barco atraco en el muelle", "«Muelle», con m y ll, es el desembarcadero; «mueble» es de la casa. «Atracó», aguda, con tilde.", 4],
      ["Voy a ver si hay billetes", "Voy a haber si ay billetes · Boy a ver si hay billetes", "«A ver» es ir a mirar y «haber» es el verbo; «hay» lleva h y «voy» nunca se escribe «boy».", 5],
      ["Ayer hubo mucha marea", "Ayer ubo mucha marea · Ayer hubieron mucha marea", "«Hubo», con h, es haber impersonal: siempre singular; nunca «ubo» ni «hubieron marea».", 5],
    ],
  },
];

export const OYE_PACKS: OyeExercise[] = [
  ...bosqueRows().map((r, i) => buildRow("bosque", "vocabulario", r, i)),
  ...CURATED.flatMap((v) => v.rows.map((r, i) => buildRow(v.variant, v.skill, r, i))),
];

function buildRow(variant: string, skill: SkillId, r: Row, i: number): OyeExercise {
  return {
    id: fmtId("oy", variant, i),
    type: `oye-${variant}` as OyeExercise["type"],
    skill,
    difficulty: r[3],
    cefr: CEFR_BY_DIFFICULTY[r[3]],
    prompt: "Escucha y elige la escritura correcta",
    explanation: r[2],
    tags: ["oye", variant],
    word: r[0],
    wrongs: r[1].split(" · ").map((s) => s.trim()),
  };
}
