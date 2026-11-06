import type { ConectaExercise, SkillId } from "@/types";
import { SRS_WORDS } from "../words-srs";
import { REFRANES_PACK } from "../refranes";
import { ORIGINS } from "./origins";
import { CEFR_BY_DIFFICULTY, fmtId, shortDef } from "./shared";

/**
 * Pack «Conecta» · Unir columnas por pares.
 * - Bosque (palabra ↔ definición), Torre (refrán ↔ significado) y
 *   Observatorio (palabra ↔ origen): generados desde datos existentes.
 * - Ciudad (inicio ↔ final), Biblioteca (concepto ↔ definición) y
 *   Puerto (frase ↔ intención): curados.
 * Formato de fila: [pares "izq=der · izq=der · izq=der · izq=der", explicación, dificultad]
 */

type Row = [string, string, 1 | 2 | 3 | 4 | 5];

interface VariantSpec {
  variant: string;
  skill: SkillId;
  rows: Row[];
}

/** Pares palabra↔definición desde el SRS (B2-C1). */
function bosqueRows(): Row[] {
  const words = SRS_WORDS.filter(
    (w) => w.difficulty >= 3 && w.difficulty <= 4 && w.definition.length <= 90,
  ).slice(0, 60);
  const rows: Row[] = [];
  for (let i = 0; i + 4 <= words.length && rows.length < 12; i += 4) {
    const chunk = words.slice(i, i + 4);
    rows.push([
      chunk.map((w) => `${w.word}=${shortDef(w.definition, 46)}`).join(" · "),
      chunk.map((w) => `«${w.word}»: ${shortDef(w.definition, 60)}`).join(" "),
      3,
    ]);
  }
  return rows;
}

/** Refrán↔significado desde el pack de refranes. */
function torreRows(): Row[] {
  const rows: Row[] = [];
  for (let i = 0; i + 4 <= REFRANES_PACK.length && rows.length < 10; i += 4) {
    const chunk = REFRANES_PACK.slice(i, i + 4);
    rows.push([
      chunk.map((r) => `${r.saying}=${r.options[r.answerIndex]}`).join(" · "),
      chunk.map((r) => `«${r.saying}» (${r.region}): ${r.options[r.answerIndex]}`).join(" "),
      Math.min(5, Math.max(1, chunk[0].difficulty)) as 1 | 2 | 3 | 4 | 5,
    ]);
  }
  return rows;
}

/** Palabra↔origen: cada tablero usa orígenes únicos. */
function observatorioRows(): Row[] {
  const byOrigin = new Map<string, string[]>();
  for (const o of ORIGINS) {
    if (!byOrigin.has(o.origin)) byOrigin.set(o.origin, []);
    byOrigin.get(o.origin)!.push(o.word);
  }
  const originList = [...byOrigin.keys()];
  const rows: Row[] = [];
  const per = Math.min(5, originList.length);
  for (let round = 0; rows.length < 9; round++) {
    const chunk: { word: string; origin: string }[] = [];
    for (let k = 0; k < per; k++) {
      const origin = originList[(k + round) % originList.length];
      const words = byOrigin.get(origin)!;
      const word = words[(round + k) % words.length];
      if (word && !chunk.some((c) => c.word === word)) chunk.push({ word, origin });
    }
    if (chunk.length < 4) break;
    if (new Set(chunk.map((c) => c.origin)).size !== chunk.length) continue;
    const notes = chunk
      .map((c) => ORIGINS.find((o) => o.word === c.word && o.origin === c.origin))
      .filter((o): o is (typeof ORIGINS)[number] => Boolean(o));
    rows.push([
      chunk.map((c) => `${c.word}=${c.origin}`).join(" · "),
      notes.map((o) => `${o.word}: ${o.note}`).join(" "),
      4,
    ]);
  }
  return rows;
}

const CURATED: VariantSpec[] = [
  {
    variant: "ciudad",
    skill: "gramatica",
    rows: [
      [
        "Si estudias esta tarde=aprobarás el examen · Aunque llovía mucho=seguro salimos a caminar · Cuando llegues a la esquina=dobla a la derecha · Para que la masa suba=deja reposar una hora",
        "Subordinadas: la condicional abre con «si», la concesiva con «aunque», la temporal con «cuando» y la final con «para que».",
        3,
      ],
      [
        "Si llueve mañana=cancelaremos el picnic · Si terminas los deberes=podrás ver la tele · Si me llamas esta noche=te cuento la novedad · Si hace buen tiempo=iremos a la playa",
        "Condicionales con «si»: lo primero es la hipótesis y lo segundo, lo que pasará si se cumple.",
        1,
      ],
      [
        "Cuando termine la película=te devuelvo la llamada · Cuando cumplas los dieciocho=podrás sacar el carné · Cuando era pequeño=creía en los Reyes Magos · Cuando sonó la alarma=todos salieron corriendo",
        "Temporales con «cuando»: el tiempo verbal del inicio ancla el del final; la concordancia cronológica guía el emparejamiento.",
        1,
      ],
      [
        "Aunque estaba agotado=terminó el informe · Aunque no tengo hambre=probaré la tarta igualmente · Aunque el partido fue malo=nos quedamos hasta el final · Aunque me lo pidas mil veces=no te prestaré el coche",
        "Concesivas con «aunque»: lo segundo ocurre a pesar del obstáculo; persona y tiempo verbales deshacen las dudas.",
        2,
      ],
      [
        "Para que no te mojes=lleva paraguas · Para que el bizcocho salga esponjoso=bate las claras a punto de nieve · Para que el niño duerma=baja la luz de su cuarto · Para que te llegue el paquete=escribe bien la dirección",
        "Finales con «para que»: expresan la intención de lo que se manda, siempre con subjuntivo detrás.",
        2,
      ],
      [
        "Ana suspendió el examen=porque no estudió nada · El equipo ganó la liga=porque encajó muy pocos goles · Me duele la cabeza=porque dormí pocas horas · Los tomates se marchitaron=porque no llovió en todo el verano",
        "Causales con «porque»: el hecho inicial queda justificado por su causa; la concordancia de personas guía el enlace.",
        3,
      ],
      [
        "Se ha roto la lavadora=así que lavaremos a mano · El examen es el lunes=así que este fin de semana toca estudiar · Se ha acabado el pan=así que pasaré por la panadería · Ha empezado a nevar=así que pon las cadenas al coche",
        "Consecutivas con «así que»: lo primero fuerza lo segundo; la consecuencia se deduce de la situación.",
        3,
      ],
      [
        "El escritor que ganó el premio=dedicó el discurso a su madre · La novela que me prestaste=me la leí en una tarde · El pueblo donde nacieron mis abuelos=no tiene ni un semáforo · La librería a la que vamos los sábados=cierra por las tardes",
        "Relativas con que, donde y a la que: amplían un antecedente; el género y el sentido señalan el único enlace posible.",
        4,
      ],
      [
        "Dame el informe=¿Me podrías dar el informe? · Calla un momento=¿Te importaría guardar silencio? · Espera aquí=¿Puedes esperar un momento, por favor? · Ayúdame con esto=¿Me echas una mano, si no te molesta?",
        "El imperativo directo puede vestirse de cortés: la interrogativa, el condicional y las fórmulas suavizan la orden sin cambiar su contenido.",
        5,
      ],
    ],
  },
  {
    variant: "biblioteca",
    skill: "lectura",
    rows: [
      [
        "símil=comparación con «como» · metáfora=la cosa por su imagen · hipérbole=exageración desaforada · ironía=decir lo contrario con guiño",
        "Figuras del estante: el símil compara, la metáfora sustituye, la hipérbole dispara y la ironía sonríe al revés.",
        3,
      ],
      [
        "portada=página del título y el autor · índice=lista ordenada de los capítulos · capítulo=cada parte en que se divide el libro · contraportada=la cara trasera del libro",
        "Cada parte del libro tiene su oficio: la portada presenta, el índice ordena, el capítulo divide y la contraportada cierra por detrás.",
        1,
      ],
      [
        "novela=narración extensa de ficción · poesía=género escrito en verso · teatro=obra pensada para representarse · ensayo=reflexión personal sobre un tema",
        "Los géneros se distinguen por forma y propósito: narrar largo, decir en verso, representar o pensar en voz alta.",
        1,
      ],
      [
        "sin embargo=introduce contraste · es decir=reformula lo dicho · por lo tanto=introduce consecuencia · además=añade información",
        "Los conectores son las señales de tráfico del texto: contraponen, reformulan, deducen o suman.",
        2,
      ],
      [
        "noticia=informa con objetividad de un hecho · crónica=narra hechos ordenados en el tiempo · editorial=opinión oficial del periódico · reportaje=profundiza en un tema con testimonios",
        "Cada tipo de texto responde una pregunta distinta: qué pasó, cómo pasó, qué opina el medio y qué hay detrás.",
        2,
      ],
      [
        "narrador=voz que cuenta la historia · protagonista=impulsa la acción principal · antagonista=se enfrenta al protagonista · secundario=acompaña la trama sin protagonizarla",
        "En la narración hay jerarquías: el narrador cuenta, el protagonista empuja, el antagonista se opone y el secundario acompaña.",
        3,
      ],
      [
        "prólogo=texto que antecede a la obra · dedicatoria=ofrece el libro a alguien · epílogo=texto que cierra la obra · solapa=la pestaña de la cubierta",
        "El paratexto rodea al texto sin ser el texto: prólogo, dedicatoria, epílogo y solapa preparan, ofrecen y despiden la lectura.",
        3,
      ],
      [
        "personificación=da cualidades humanas a las cosas · aliteración=repite sonidos parecidos · hipérbaton=altera el orden natural de las palabras · anáfora=repite la misma palabra al empezar",
        "Más figuras para el estante: la personificación humaniza, la aliteración musicaliza, el hipérbaton retuerce el orden y la anáfora martillea el inicio.",
        4,
      ],
      [
        "denso=exige esfuerzo y concentración · ágil=se lee con ligereza · coral=suma muchas voces y miradas · costumbrista=retrata costumbres de una época",
        "Palabras de la crítica: denso pesa, ágil vuela, coral multiplica voces y costumbrista pinta costumbres.",
        5,
      ],
    ],
  },
  {
    variant: "puerto",
    skill: "audicion",
    rows: [
      [
        "¿Te importaría cerrar la ventana?=petición cortés · Menudo día llevamos, ¿eh?=queja cómplice · ¡Vaya golazo vimos anoche!=entusiasmo · Ya llegará tu turno, tranquilo=consuelo",
        "La intención viaja en el tono: pedir con cortesía, desahogarse, celebrar y consolar son cuatro puertos distintos.",
        2,
      ],
      [
        "Hasta mañana=la cita queda para mañana · Nos vemos=cita sin hora fija · Un placer haber coincidido=despedida formal · Que tengas suerte=despedida que desea algo",
        "Despedirse también tiene registros: fijar el día, dejarlo abierto, la formalidad del encuentro o el deseo de buena suerte.",
        1,
      ],
      [
        "Qué bien te queda ese abrigo=elogio al aspecto · Has hecho un trabajo impresionante=elogio al trabajo · Qué buena idea la tuya=elogio a una ocurrencia · Se nota que has estudiado=elogio al esfuerzo",
        "Los elogios apuntan a blancos distintos: el aspecto, el trabajo, la ocurrencia o el esfuerzo que se nota.",
        1,
      ],
      [
        "¿Sería tan amable de repetirlo?=petición muy formal · ¿Me pasas la sal?=petición de confianza · ¿Te molesta que abra la ventana?=petición que pide permiso · Firme aquí, por favor=petición administrativa",
        "La cortesía se gradúa: de la confianza del «pásame» a la formalidad del «sería tan amable».",
        2,
      ],
      [
        "Última llamada, puerta 12=el embarque se cierra ya · El vuelo se retrasa una hora=saldrá más tarde · Próxima parada: Atocha=llegamos enseguida · Abrochen sus cinturones=el avión va a despegar",
        "Los avisos oficiales usan fórmulas fijas: cierre de embarque, retraso, llegada y despegue.",
        2,
      ],
      [
        "Vaya atasco tenemos hoy=queja resignada · ¡Otra vez sin agua caliente!=queja indignada · Es la tercera vez que aviso=queja por desatención · Ya no puedo más con este ruido=queja de agobio",
        "Quejarse tiene colores: resignación, indignación, desatención sufrida o agobio puro.",
        3,
      ],
      [
        "¿Qué onda?=saludo casual de México · ¿Qué hacés?=saludo con voseo rioplatense · ¿Todo bien?=saludo de confianza · Muy buenas=saludo neutro de España",
        "El saludo delata la procedencia: México pregunta por la onda, el Río de la Plata vosea y España estrena el día con «muy buenas».",
        3,
      ],
      [
        "No pasa nada, estás aprendiendo=consuelo tras un error · Mañana será otro día=consuelo que invita a seguir · Al menos lo intentaste=consuelo que valora el intento · Piensa en lo que has avanzado=consuelo que mira lo positivo",
        "Consolar es elegir el consuelo justo: tras el error, para seguir, para valorar el intento o para mirar lo logrado.",
        4,
      ],
      [
        "¡Claro, como no!=en realidad dice que no · ¡Muy puntual, como siempre!=en realidad llegó tarde · ¡Qué original tu regalo!=en realidad no lo es · ¡Genial, justo lo que faltaba!=en realidad es mala noticia",
        "La ironía dice lo contrario: solo el tono y el contexto revelan que «muy puntual» significa tarde.",
        5,
      ],
    ],
  },
];

export const CONECTA_PACKS: ConectaExercise[] = [
  ...bosqueRows().map((r, i) => buildRow("bosque", "vocabulario", r, i)),
  ...torreRows().map((r, i) => buildRow("torre", "expresion", r, i)),
  ...observatorioRows().map((r, i) => buildRow("observatorio", "cultura", r, i)),
  ...CURATED.flatMap((v) => v.rows.map((r, i) => buildRow(v.variant, v.skill, r, i))),
];

function buildRow(variant: string, skill: SkillId, r: Row, i: number): ConectaExercise {
  const pairs = r[0].split(" · ").map((p) => {
    const [left, right] = p.split("=");
    return { left: left.trim(), right: right.trim() };
  });
  return {
    id: fmtId("cn", variant, i),
    type: `conecta-${variant}` as ConectaExercise["type"],
    skill,
    difficulty: r[2],
    cefr: CEFR_BY_DIFFICULTY[r[2]],
    prompt: "Une cada par tocando las dos columnas",
    explanation: r[1],
    tags: ["conecta", variant],
    pairs,
  };
}
