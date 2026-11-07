/**
 * BANCOS 3 · Minirrelatos para los juegos de lectura.
 * Cada plantilla define el texto (3 frases) y sus preguntas:
 * idea (central), tono, inf (inferencia), prop (propósito),
 * voc (palabra en contexto), tit (titular), res (resumen).
 */

export interface StoryTpl {
  txt: [string, string, string];
  idea: [string, string, string];
  tono: [string, string, string];
  inf: [string, string, string, string]; // [pregunta, correcta, falsa1, falsa2]
  prop: [string, string, string];
  voc: [string, string, string, string]; // [palabra, significado, falsa1, falsa2]
  tit: [string, string, string];
  res: [string, string, string];
}

export const STORIES: StoryTpl[] = [
  {
    txt: [
      "El faro de {N} llevaba tres noches apagado.",
      "Los pescadores decidieron turnarse para vigilar la costa a oscuras.",
      "Al amanecer del cuarto día, un barco de ayuda llegó con una nueva lámpara.",
    ],
    idea: ["Un pueblo se organiza ante el fallo de su faro", "Los faros modernos funcionan con barcos", "Los pescadores temen la luz del día"],
    tono: ["Narrativo y esperanzador", "Científico y frío", "Humorístico y burlón"],
    inf: ["¿Qué se deduce del texto?", "El faro era importante para la seguridad del pueblo", "Los pescadores querían apagar el faro", "El barco de ayuda se perdió"],
    prop: ["Contar cómo un pueblo afrontó un problema", "Vender lámparas nuevas", "Enseñar a pescar de noche"],
    voc: ["turnarse", "relevarse por turnos", "pelearse", "dormir a la vez"],
    tit: ["El faro apagado", "Cómo pescar de noche", "Un barco sin rumbo"],
    res: ["El faro se apagó y el pueblo se organizó hasta recibir ayuda", "Los pescadores vendieron el faro a un barco", "El faro nunca volvió a funcionar"],
  },
  {
    txt: [
      "En la biblioteca del pueblo, {N} descubrió un atlas de mapas antiguos.",
      "Una de las páginas mostraba una isla que no aparecía en ningún otro libro.",
      "Desde entonces, guarda el atlas como su mayor tesoro.",
    ],
    idea: ["Un hallazgo curioso despierta el interés de {N}", "Los atlas antiguos no tienen valor", "Las islas desaparecen de los mapas"],
    tono: ["Narrativo y asombrado", "Periodístico y neutro", "Sarcástico y crítico"],
    inf: ["¿Qué se deduce del texto?", "A {N} le fascinan los enigmas de los mapas", "{N} quiere vender el atlas", "La isla era inventada y lo sabía"],
    prop: ["Relatar un descubrimiento personal", "Promover la lectura de mapas", "Criticar las bibliotecas"],
    voc: ["tesoro", "objeto muy valioso", "mueble", "deuda"],
    tit: ["La isla que no existía", "Manual de cartografía", "Una biblioteca aburrida"],
    res: ["{N} encontró un atlas con una isla misteriosa y lo atesora", "Los mapas antiguos están mal hechos", "La biblioteca regaló todos sus atlas"],
  },
  {
    txt: [
      "La plaza amaneció cubierta de pétalos rosas tras la tormenta.",
      "{N} barrió durante horas mientras los vecinos sacaban las mesas.",
      "Por la tarde, la verbena se celebró como si nada hubiera pasado.",
    ],
    idea: ["El barrio se esfuerza por salvar su fiesta", "Las tormentas arruinan todas las verbenas", "Los vecinos culpan a {N} del desorden"],
    tono: ["Narrativo y luminoso", "Lamentoso y oscuro", "Técnico y preciso"],
    inf: ["¿Qué se deduce del texto?", "La fiesta era muy valorada por el barrio", "La verbena se canceló al final", "Los pétalos eran de plástico"],
    prop: ["Mostrar la resiliencia de un barrio", "Explicar cómo barren las plazas", "Promover jardines sin árboles"],
    voc: ["verbena", "fiesta popular al aire libre", "planta medicinal", "tormenta fuerte"],
    tit: ["Pétalos y verbena", "Cómo barrer una plaza", "La tormenta que arruinó todo"],
    res: ["Tras la tormenta, el barrio trabajó y la fiesta salió adelante", "La tormenta arruinó la fiesta para siempre", "Los vecinos prohibieron los árboles de la plaza"],
  },
  {
    txt: [
      "{N} ensayó el discurso frente al espejo toda la tarde.",
      "En el escenario, las primeras palabras le salieron temblorosas.",
      "Cuando terminó, el aplauso duró más que todos sus ensayos juntos.",
    ],
    idea: ["El esfuerzo del ensayo dio fruto en el momento final", "Hablar en público es imposible", "Los aplausos asustan a {N}"],
    tono: ["Narrativo y emotivo", "Médico y detallista", "Irónico y mordaz"],
    inf: ["¿Qué se deduce del texto?", "El público valoró el discurso pese al nervio inicial", "{N} olvidó todo el discurso", "El espejo le dio la solución mágica"],
    prop: ["Inspirar ante los retos personales", "Desaconsejar hablar en público", "Vender espejos de ensayo"],
    voc: ["temblorosas", "inseguras, con temblor", "perfectas", "gritadas"],
    tit: ["El aplauso más largo", "Manual de oratoria", "Un espejo parlante"],
    res: ["{N} ensayó mucho, empezó nervioso y acabó ovacionado", "El discurso fue un desastre total", "El espejo aplaudió más fuerte"],
  },
  {
    txt: [
      "La moto de {N} se detuvo en mitad del desfiladero.",
      "Un pastor le prestó su mula para llegar al pueblo más cercano.",
      "Al volver con el mecánico, la mula lo esperaba junto a la moto custodiada.",
    ],
    idea: ["La ayuda inesperada resuelve un aprieto", "Las motos nunca fallan", "Los pastores odian las motos"],
    tono: ["Narrativo con toques de humor", "Trágico y sombrío", "Legal y protocolario"],
    inf: ["¿Qué se deduce del texto?", "La gente del lugar fue generosa con {N}", "El pastor robó la moto", "El mecánico arregló el desfiladero"],
    prop: ["Divertir con una anécdota de viaje", "Comparar mulas y motos técnicamente", "Aconsejar no viajar"],
    voc: ["desfiladero", "paso estrecho entre montañas", "autopista ancha", "plaza central"],
    tit: ["Una mula prestada", "Cómo comprar una mula", "La moto que no fallaba"],
    res: ["La moto se paró y un pastor ayudó a {N} con su mula", "{N} abandonó la moto para siempre", "El mecánico vivía en el desfiladero"],
  },
  {
    txt: [
      "El mercado olía a pan recién hecho y a azahar.",
      "{N} regateó un queso tanto que la vendedora acabó riéndose.",
      "Volvió a casa sin queso, pero con una receta y una amiga.",
    ],
    idea: ["Un regateo fallido acabó en amistad", "En el mercado no se vende queso", "{N} se enfadó con la vendedora"],
    tono: ["Costumbrista y cálido", "Deportivo y tenso", "Académico y serio"],
    inf: ["¿Qué se deduce del texto?", "La relación humana valió más que la compra", "El queso estaba en mal estado", "La receta era de azahar"],
    prop: ["Pintar una escena cotidiana con humor", "Enseñar a regatear paso a paso", "Criticar los precios del queso"],
    voc: ["regatear", "negociar el precio", "robar", "pagar doble"],
    tit: ["Sin queso, con amiga", "Guía del regateo", "El pan de azahar"],
    res: ["{N} no compró el queso, pero ganó una receta y una amistad", "La vendedora le regaló todo el queso", "El mercado cerró por el olor"],
  },
  {
    txt: [
      "El río bajaba tan claro ese agosto que se veían las truchas quietas.",
      "{N} y su abuelo tiraron la caña y esperaron sin hablar.",
      "Volvieron sin peces, con la sensación de un día perfecto.",
    ],
    idea: ["Compartir el rato importa más que la pesca", "Las truchas se pescan gritando", "El abuelo era un mal pescador"],
    tono: ["Lírico y sereno", "Urgente y dramático", "Burocrático"],
    inf: ["¿Qué se deduce del texto?", "Ambos valoran el silencio compartido", "Las truchas estaban muertas", "El día resultó aburrido"],
    prop: ["Evocar la calma de un día de pesca", "Instruir sobre la pesca de truchas", "Prohibir bañarse en agosto"],
    voc: ["caña", "vara de pescar", "red grande", "bote"],
    tit: ["Un día sin peces", "Manual de truchas", "El río turbio"],
    res: ["Pescaron nada, pero vivieron un día sereno juntos", "Llenaron la cesta de truchas", "El abuelo se cayó al río"],
  },
  {
    txt: [
      "El colegio organizó un trueque de libros usados.",
      "{N} llevó tres novelas y se fue con un atlas y un tebeo de ciencias.",
      "La profesora anotó cada cambio en un cuaderno forrado de azul.",
    ],
    idea: ["El trueque fomenta la lectura y el intercambio", "Los libros usados están prohibidos", "La profesora cobraba por cada cambio"],
    tono: ["Narrativo escolar y amable", "Polémico y agresivo", "Publicitario"],
    inf: ["¿Qué se deduce del texto?", "El trueque estaba organizado y controlado", "Los libros eran nuevos", "El atlas no le gustó a nadie"],
    prop: ["Explicar una actividad escolar solidaria", "Vender novelas de segunda mano", "Criticar los tebeos"],
    voc: ["trueque", "intercambio sin dinero", "robo", "compra cara"],
    tit: ["Libros que viajan", "El cuaderno azul de cuentas", "Prohibido leer tebeos"],
    res: ["En el colegio intercambiaron libros y lo registraron todo", "El trueque acabó en pelea", "La profesora regaló novelas nuevas"],
  },
  {
    txt: [
      "La niebla se comió las calles del puerto al amanecer.",
      "{N} guió el camión de pescado con la cabeza fuera de la ventanilla.",
      "Los faros del muelle le indicaron el último giro hacia la lonja.",
    ],
    idea: ["La niebla obliga a conducir con ingenio", "El pescado se entrega al mediodía", "Los faros están apagados siempre"],
    tono: ["Narrativo ambiental", "Cómico exagerado", "Técnico estadístico"],
    inf: ["¿Qué se deduce del texto?", "El oficio de {N} exige esfuerzo y oficio", "La niebla solo afecta a los barcos", "La lonja estaba cerrada"],
    prop: ["Pintar la dureza de un oficio marinero", "Criticar a los camioneros", "Vender faros nuevos"],
    voc: ["lonja", "mercado de pescado", "casa de vecinos", "fábrica de hielo"],
    tit: ["Camión entre nieblas", "La lonja vacía", "Manual de faros"],
    res: ["Entre la niebla, {N} llevó el pescado a la lonja", "El camión se perdió en la niebla", "Los faros se apagaron a propósito"],
  },
  {
    txt: [
      "En el examen de música, a {N} le tocó afinar la flauta rota.",
      "Sopló, destapó y volvió a soplar hasta que sonó un la perfecto.",
      "El profesor, sin querer, empezó a aplaudir con la batuta en la mano.",
    ],
    idea: ["La constancia arregla lo roto", "Las flautas rotas no suenan nunca", "El profesor se burló de {N}"],
    tono: ["Narrativo con humor final", "Trágico", "Médico"],
    inf: ["¿Qué se deduce del texto?", "El profesor acabó sorprendido para bien", "El examen se suspendió", "La flauta era de madera nueva"],
    prop: ["Divertir con una anécdota de examen", "Vender flautas afinadas", "Criticar los exámenes de música"],
    voc: ["afinar", "ajustar el sonido exacto", "romper del todo", "tocar fuerte"],
    tit: ["El la perfecto", "Cómo romper flautas", "La batuta rota"],
    res: ["{N} logró afinar la flauta rota y el profesor aplaudió", "El examen terminó en suspenso total", "La flauta se rompió más al soplar"],
  },
  {
    txt: [
      "El huerto comunitario tenía un cartel: «Faltan tomates, sobra calabaza».",
      "{N} plantó tres tomillares y cubrió la calabaza con paciencia.",
      "En septiembre, el cartel cambió: «Sobran tomates, gracias».",
    ],
    idea: ["La comunidad comparte lo que cultiva", "Los tomates crecen solos", "La calabaza arruinó el huerto"],
    tono: ["Narrativo comunitario y alegre", "Melancólico", "De manual agrícola"],
    inf: ["¿Qué se deduce del texto?", "El huerto refleja el trabajo compartido", "El cartel era una advertencia legal", "Nadie quería tomates"],
    prop: ["Celebrar la colaboración vecinal", "Enseñar injertos de calabaza", "Prohibir los carteles"],
    voc: ["comunitario", "de uso compartido", "privado", "municipal"],
    tit: ["Sobran tomates, gracias", "El cartel de la calabaza", "Cómo podar tomillares"],
    res: ["El cartel del huerto contaba la cosecha y la generosidad", "El huerto se secó por falta de riego", "El cartel lo puso el ayuntamiento"],
  },
  {
    txt: [
      "La abuela de {N} tejía bufandas mientras veía las noticias.",
      "Cada invierno, el árbol de Navidad amanecía con una nueva alrededor del tronco.",
      "Nadie jamás la vio comprar lana.",
    ],
    idea: ["Un regalo silencioso se repite cada año", "La abuela olvidaba dónde compraba", "Las bufandas caían del árbol"],
    tono: ["Narrativo entrañable", "Investigativo", "Publicitario"],
    inf: ["¿Qué se deduce del texto?", "La abuela regalaba su trabajo sin decirlo", "El árbol tejía las bufandas", "Las noticias enseñaban a tejer"],
    prop: ["Evocar el cariño en pequeños gestos", "Vender lana navideña", "Criticar las noticias de invierno"],
    voc: ["tejía", "hacía punto con agujas", "compraba", "cosía a máquina"],
    tit: ["Bufandas del árbol", "El misterio de la lana", "Cómo ver las noticias"],
    res: ["La abuela tejía bufandas y el árbol las estrenaba", "El árbol se congeló sin bufandas", "La abuela tejía por dinero"],
  },
];
