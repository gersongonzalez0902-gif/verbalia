import type { VfExercise, SkillId } from "@/types";
import { REFRANES_PACK } from "../refranes";
import { CEFR_BY_DIFFICULTY, fmtId } from "./shared";

/**
 * Pack «Verdadero o falso» · Afirmaciones con veredicto y corrección.
 * Formato de fila: [afirmación, esVerdadera (0/1), corrección si es falsa, explicación, dificultad]
 * La variante «torre» se genera desde el pack de refranes: el significado
 * atribuido unas veces es el bueno (verdadero) y otras un señuelo (falso).
 */

type Row = [string, 0 | 1, string, string, 1 | 2 | 3 | 4 | 5];

interface VariantSpec {
  variant: string;
  skill: SkillId;
  rows: Row[];
}

const VARIANTS: VariantSpec[] = [
  {
    variant: "bosque",
    skill: "vocabulario",
    rows: [
      ["«librería» y «biblioteca» significan lo mismo", 0, "librería vende libros; biblioteca los presta", "La librería cobra; la biblioteca presta. El falso amigo del francés library amplía la confusión.", 2],
      ["«céfiro» es un viento suave y agradable", 1, "", "El céfiro es el viento del oeste, suave: los poetas del Siglo de Oro lo llamaban «el aura». ", 4],
      ["«currar» es la forma coloquial de decir «trabajar»", 1, "", "Es coloquial, no grosero: entre amigos se dice currar; en una entrevista, mejor trabajar.", 1],
      ["«zurdo» se escribe con z inicial", 1, "", "Con z nace y con z se queda: «surdo» no existe en el español estándar.", 1],
      ["«efímero» describe algo que dura muy poco", 1, "", "Del griego «de un solo día»: lo efímero aparece y se desvanece enseguida.", 1],
      ["«apología» significa lo contrario de «alabanza»", 0, "apología es alabanza o defensa", "Hacer la apología de algo es ensalzarlo o defenderlo: no guarda ningún reproche.", 1],
      ["«mapamundi» es un mapa de todo el mundo", 1, "", "Su nombre lo anuncia: mapa más mundi, «del mundo» en latín.", 1],
      ["«bruma» es la niebla propia del mar", 1, "", "La bruma es el velo del mar; la niebla puede cubrir cualquier lugar.", 2],
      ["«sagaz» significa torpe", 0, "sagaz significa astuto y perspicaz", "La sagacidad es olfato: el sagaz ve venir lo que los demás no advierten.", 2],
      ["«zanahoria» se escribe con z inicial", 1, "", "Con z siempre: la grafía con s es un error de quien escribe deprisa.", 2],
      ["«colaborar» significa trabajar en contra de alguien", 0, "colaborar es trabajar con alguien", "El prefijo co- («con») lo delata: colaborar es laborar juntos.", 2],
      ["«estreno» se refiere solo al cine", 0, "estreno es el primer uso de algo", "Se estrena una película, pero también una prenda o un coche: lo estrenado se usa por primera vez.", 2],
      ["«la cometa» es el astro que cruza el cielo", 0, "el cometa es el astro", "El género distingue referentes: el cometa es el astro; la cometa, el juguete que se vuela con hilo.", 3],
      ["«aposta» significa «a propósito»", 1, "", "Hacer algo aposta es hacerlo con intención: adverbio de registro cuidado que sigue vivo.", 3],
      ["«candor» es sinceridad e inocencia", 1, "", "El candor es la blancura del alma: candoroso es quien no sospecha maldad.", 3],
      ["«mendigar» es vender a muy bajo precio", 0, "mendigar es pedir limosna", "Mendigar es pedir por necesidad; malvender es lo de vender barato.", 3],
      ["«ociosidad» es sinónimo de «descanso merecido»", 0, "ociosidad es holganza improductiva", "El ocio puede ser creativo; la ociosidad señala la holganza sin fruto.", 3],
      ["«penumbra» es la zona entre la luz y la sombra", 1, "", "Penumbra es casi-sombra: ni claridad plena ni oscuridad cerrada.", 3],
      ["«hortera» es un elogio a la elegancia", 0, "hortera significa de mal gusto", "Es coloquial y despectivo: describe ropa, decoración o personas de gusto estridente.", 4],
      ["«palurdo» es un término coloquial para la persona rústica", 1, "", "Palurdo nombra al simplón de aldea: coloquial, nunca elogioso.", 4],
      ["«dilucidar» es aclarar lo confuso", 1, "", "Dilucidar echa luz sobre lo enredado: un problema, un misterio, un párrafo oscuro.", 4],
      ["«tacaño» y «roñoso» son antónimos", 0, "son sinónimos: ambos mezquinos", "Los dos aprietan la bolsa: sinónimos coloquiales del que no suelta el dinero.", 4],
      ["«espurio» significa auténtico y legítimo", 0, "espurio significa falso o ilegítimo", "Del latín spurius: lo espurio es bastardo, adulterado, de origen dudoso.", 5],
      ["«prolijidad» es la virtud de ser conciso", 0, "prolijidad es exceso de detalles", "Lo prolijo se enreda en pormenores: la prolijidad es lo contrario de la concisión.", 5],
      ["«acendrado» significa puro, sin mezcla", 1, "", "Amor acendrado, lealtad acendrada: lo acendrado está depurado del todo.", 5],
      ["«secesión» y «sucesión» significan lo mismo", 0, "secesión separa; sucesión encadena", "Secesión rompe la unión; sucesión enlaza etapas o herencias: parónimos con cuidado.", 5],
    ],
  },
  {
    variant: "ciudad",
    skill: "gramatica",
    rows: [
      ["«Del» es la contracción de «de el»", 1, "", "De + el se funden en del; pero de + él (con tilde, pronombre) nunca se contrae.", 2],
      ["Es correcto decir «habían muchos niños»", 0, "había muchos niños", "Con «haber» impersonal el verbo se queda en singular: había muchos niños.", 3],
      ["En «vamos al cine», «al» es la contracción de «a el»", 1, "", "Ante el artículo el, la preposición a se funde con él: a + el = al.", 1],
      ["Es correcto decir «pienso de que vendrá»", 0, "pienso que vendrá", "Es dequeísmo: el verbo pensar no necesita la preposición de.", 1],
      ["Es correcto decir «los libros es caros»", 0, "los libros son caros", "Sujeto plural, verbo plural: la concordancia básica exige son.", 1],
      ["«Usted» concuerda con el verbo en tercera persona", 1, "", "Usted es cortés, pero gramaticalmente es tercera persona: usted es, usted viene.", 1],
      ["Es correcto decir «me alegro que vengas»", 0, "me alegro de que vengas", "Es queísmo: alegrarse pide la preposición de.", 1],
      ["En la escritura cuidada, las siglas no varían en plural: «las ONG»", 1, "", "La grafía de la sigla no cambia: el artículo es quien marca el plural.", 2],
      ["«Ojalá» se construye con indicativo", 0, "se construye con subjuntivo", "Ojalá expresa deseo, y el deseo se formula en subjuntivo: ojalá llueva, ojalá vinieras.", 2],
      ["Es correcto decir «estoy de acuerdo de ti»", 0, "de acuerdo contigo", "La fórmula es estar de acuerdo con; ante pronombre, contigo.", 2],
      ["«Es listo» y «está listo» significan lo mismo", 0, "ser es esencia; estar, estado", "Es listo lo es de nacimiento; está listo lo está en ese momento.", 2],
      ["El gerundio de «ir» es «yendo»", 1, "", "El verbo ir no acepta «iendo»: la i inicial se refuerza en y → yendo.", 2],
      ["Es correcto decir «el agua fría»", 1, "", "Agua es femenina, pero ante a- tónica el singular femenino toma la forma el.", 3],
      ["«Si tuviera tiempo, viajaría» está bien construido", 1, "", "Imperfecto de subjuntivo más condicional: la hipótesis irreal más clásica del español.", 3],
      ["«Don Quijote» se escribe con la «d» en mayúscula", 0, "don va en minúscula", "Los tratamientos van en minúscula: don Quijote, fray Servando, san Martín.", 3],
      ["Es correcto decir «le lo dije ayer»", 0, "se lo dije", "Le no puede preceder a lo: la secuencia se convierte en se lo.", 3],
      ["«La gente llegó puntual» es correcto en singular", 1, "", "Gente es un singular colectivo: el verbo concuerda con él, no con las personas que nombra.", 3],
      ["«Deber de estudiar» y «deber estudiar» significan lo mismo", 0, "deber de supone; deber obliga", "«Debo de estar enfermo» conjetura; «debo estudiar» obliga: el de cambia el sentido.", 4],
      ["«Ando buscando las llaves» es correcto", 1, "", "Andar más gerundio marca acción en curso, como estar + gerundio pero con aire de empeño.", 4],
      ["Es correcto decir «se me olvidó las llaves»", 0, "se me olvidaron las llaves", "Las llaves mandan: el verbo de inadvertencia concuerda con lo olvidado.", 4],
      ["La sigla «ONU» se usa con artículo femenino: «la ONU»", 1, "", "Las siglas que nombran organizaciones toman el género de la palabra organización.", 4],
      ["El orden «te lo dije» no puede cambiarse a «lo te dije»", 1, "", "Los pronombres átonos guardan una jerarquía fija: la segunda persona precede a la tercera.", 4],
      ["Tras «como si», el verbo va en condicional", 0, "va en subjuntivo", "Como si abre una hipótesis no real: como si fuera, como si hubiera visto.", 5],
      ["«El agua» en plural vuelve al artículo femenino: «las aguas»", 1, "", "El artículo el ante a- tónica solo opera en singular: las aguas tranquilas.", 5],
      ["«Que yo sepa, no ha llamado» significa «hasta donde yo sé»", 1, "", "El subjuntivo suspende la afirmación: que yo sepa es la fórmula para no comprometerse del todo.", 5],
      ["Es correcto decir «el problema es de que nadie escucha»", 0, "el problema es que", "La cópula ser no admite la preposición de: el dequeísmo sobra también aquí.", 5],
    ],
  },
  {
    variant: "fortaleza",
    skill: "ortografia",
    rows: [
      ["«excepción» se escribe con «pc»", 1, "", "Se escribe con «pc»: no hay que confundirla con «acesión»/«sesión», que llevan otra raíz.", 3],
      ["«cómo» lleva tilde en «no sé cómo lo hizo»", 1, "", "Con valor interrogativo indirecto mantiene la tilde: qué, cómo, cuándo y dónde.", 2],
      ["«baca» del coche se escribe con v", 0, "baca", "La baca del coche (portaequipajes) se escribe con b; con v es el verbo basar.", 2],
      ["«hola» se escribe con h", 1, "", "La hache es muda pero obligatoria: «ola» sin hache es la del mar.", 1],
      ["«gente» se escribe con j", 0, "gente, con g", "Gente lleva g, como gentío: la grafía con j no existe.", 1],
      ["«jirafa» se escribe con g", 0, "jirafa, con j", "Jirafa va con j, como jinete y jerez: esa familia nunca viste g.", 1],
      ["«ahora» se escribe con h intercalada", 1, "", "La hache de ahora es muda pero obligatoria: «aora» es un error de descuido.", 1],
      ["«sofá» se escribe sin tilde", 0, "sofá lleva tilde", "Palabra aguda terminada en vocal: la tilde es obligatoria.", 1],
      ["«Echa la basura» se escribe sin h", 1, "", "Echa viene de echar, sin hache; hecha, con h, es del verbo hacer.", 2],
      ["«halla» es una forma del verbo haber", 0, "halla viene de hallar", "Halla significa «encuentra», de hallar; haber da haya, con hache y una sola ele.", 2],
      ["«exigió» se escribe con j", 0, "exigió, con g", "Exigir conserva la g en todas sus formas: exijo, exigía, exigió.", 2],
      ["«sólo» lleva tilde obligatoria cuando significa «solamente»", 0, "hoy la tilde es opcional", "La norma actual solo la recomienda si hay riesgo de ambigüedad: escribir solo sin tilde es correcto.", 2],
      ["«hierba» y «yerba» son formas correctas", 1, "", "Ambas están en el diccionario: hierba es la más general; yerba se conserva en usos como la yerba mate.", 3],
      ["Ante consonante, el sonido /b/ se escribe siempre con b", 1, "", "Abrir, brazo, objeto: ante consonante no existe opción, siempre b.", 3],
      ["«ésto» con tilde es la escritura correcta", 0, "esto, sin tilde", "La tilde de esto, eso y aquello se eliminó hace décadas: hoy es incorrecta.", 3],
      ["«porque» y «por qué» se escriben igual", 0, "por qué (pregunta) lleva tilde", "«¿Por qué te vas?» pregunta; «porque me voy» responde: la tilde separa pregunta y causa.", 3],
      ["«exhausto» se escribe con h", 1, "", "Conserva la h de su origen latino: exhalar, exhibir y exhausto la mantienen.", 3],
      ["«válido» lleva tilde por ser palabra llana terminada en vocal", 0, "lleva tilde por el hiato", "La vocal cerrada tónica en hiato siempre se tilda: vál-i-do, como ba-úl o rí-o.", 4],
      ["La abreviatura «etc.» se escribe siempre con punto", 1, "", "Etc. abrevia etcétera: las abreviaturas se cierran con punto.", 4],
      ["En los títulos de libros solo la primera palabra lleva mayúscula", 1, "", "A diferencia del inglés, el español no mayuscula cada palabra: «Cien años de soledad».", 4],
      ["«quehacer» (tarea) se escribe en una sola palabra", 1, "", "En una sola palabra nombra la tarea pendiente; «algo que hacer» va separado porque son dos piezas.", 4],
      ["«hasta» y «asta» se escriben igual", 0, "hasta con h; asta sin h", "Hasta (preposición) lleva hache; asta (de la bandera, del toro) no.", 4],
      ["El pronombre «ti» lleva tilde", 0, "ti se escribe sin tilde", "Mí y sí la llevan para distinguirse; ti no la necesita: no existe otra «ti» rival.", 5],
      ["Los adverbios en -mente conservan la tilde del adjetivo", 1, "", "Fácil da fácilmente y rápida da rápidamente: el adverbio hereda el acento de su base.", 5],
      ["«aún» con tilde significa «todavía»", 1, "", "«Aún no llega» (todavía) lleva tilde; «aun así» (incluso) va sin tilde.", 5],
      ["«Oí un ruido» se escribe sin tilde", 0, "oí lleva tilde", "La í tónica en hiato exige tilde: oí, como caí, reí, leí.", 5],
    ],
  },
  {
    variant: "biblioteca",
    skill: "lectura",
    rows: [
      ["El subtítulo de un texto suele anticipar su tema", 1, "", "El subtítulo sitúa al lector: es el mapa antes de entrar al territorio.", 2],
      ["Leer «en diagonal» garantiza comprender un texto técnico", 0, "la lectura en diagonal solo capta la superficie", "La lectura diagonal sirve para rastrear datos, no para comprender argumentos encadenados.", 3],
      ["El índice de un libro muestra el orden de sus partes", 1, "", "El índice es el mapa del libro: capítulos y páginas de un vistazo.", 1],
      ["El prólogo siempre aparece al principio del libro", 1, "", "El prólogo antecede a la obra: presenta, contextualiza o justifica la lectura.", 1],
      ["El título de un texto nunca da pistas sobre su contenido", 0, "el título anticipa el contenido", "El título es el primer gancho: suele condensar tema, tono o enfoque.", 1],
      ["Un resumen recoge las ideas principales con menos palabras", 1, "", "Resumir es destilar: quedarse con lo esencial y soltar lo accesorio.", 1],
      ["La conclusión se escribe antes del desarrollo del texto", 0, "la conclusión cierra el texto", "La conclusión llega al final: recoge y valora lo desarrollado en el cuerpo.", 1],
      ["«Sin embargo» introduce un contraste", 1, "", "El conector adversativo enfrenta dos ideas: «llovió; sin embargo, salimos».", 2],
      ["«Es decir» sirve para ejemplificar", 0, "sirve para reformular lo dicho", "Es decir repite la idea con otras palabras para aclararla; para ejemplificar está «por ejemplo».", 2],
      ["La solapa de un libro suele presentar la obra y al autor", 1, "", "La solapa es el escaparate del libro: atrapa al lector que lo hojea.", 2],
      ["La idea principal de un párrafo aparece siempre en su primera frase", 0, "puede ir en cualquier parte", "Puede abrir, cerrar o esconderse entre las frases: detectarla exige leer el párrafo entero.", 2],
      ["«Además» introduce una causa", 0, "introduce una adición", "Además suma argumentos o datos: encadena, no causa.", 2],
      ["Parafrasear es repetir un texto palabra por palabra", 0, "parafrasear es decirlo con otras palabras", "Parafrasear es traducir dentro de la misma lengua: la misma idea con nuevas palabras.", 3],
      ["El narrador de una historia no siempre coincide con el autor", 1, "", "El narrador es una voz creada por el autor: puede ser personaje, testigo o un yo que todo lo sabe.", 3],
      ["La denotación es el significado literal de una palabra", 1, "", "La denotación es lo que dice el diccionario; la connotación, lo que la palabra sugiere.", 3],
      ["Leer un gráfico no forma parte de la comprensión de un texto", 0, "los gráficos también informan", "Un gráfico, una tabla o un mapa aportan datos que el texto no dice: leerlos también es comprender.", 3],
      ["«Por lo tanto» introduce una consecuencia", 1, "", "Conector consecutivo: lo segundo se deduce de lo primero.", 3],
      ["Un glosario reúne términos difíciles con su definición", 1, "", "Al final de los textos técnicos, el glosario despeja las palabras oscuras.", 4],
      ["La conclusión y el resumen son exactamente lo mismo", 0, "la conclusión valora; el resumen recoge", "El resumen reproduce lo esencial sin opinar; la conclusión extrae consecuencias y cierra el razonamiento.", 4],
      ["La estructura deductiva va de lo general a lo particular", 1, "", "Un párrafo deductivo abre con la idea general y baja a los ejemplos; el inductivo hace el camino inverso.", 4],
      ["El prólogo siempre lo escribe el autor del libro", 0, "puede escribirlo otra persona", "Muchos prólogos pertenecen a otra voz: un especialista o un escritor invitado que presenta la obra.", 4],
      ["«Casa» y «hogar» denotan lo mismo pero connotan distinto", 1, "", "Las dos nombran la vivienda, pero «hogar» connota afecto, calor y refugio.", 4],
      ["Un texto expositivo tiene como propósito convencer al lector", 0, "convencer es del texto argumentativo", "Exponer explica sin tomar partido; argumentar defiende una tesis con razones.", 5],
      ["La estructura inductiva cierra con la idea principal", 1, "", "De los ejemplos a la regla: el párrafo inductivo guarda la conclusión para el final.", 5],
      ["Parafrasear un texto evita la necesidad de citar la fuente", 0, "parafrasear también exige citar", "Cambiar las palabras no cambia la deuda: la idea sigue siendo de quien la creó.", 5],
      ["La idea implícita de un texto aparece escrita literalmente", 0, "la implícita se infiere", "Lo implícito no está escrito: el lector lo deduce de las pistas que el texto deja.", 5],
    ],
  },
  {
    variant: "puerto",
    skill: "audicion",
    rows: [
      ["«¿Y a mí qué me importa?» siempre expresa indiferencia", 0, "según el tono, puede ser pregunta o desafío", "El tono lo decide todo: con voz queda suena a desdén; con voz tensa, a confrontación.", 3],
      ["Un hablante que alarga las vocales suele buscar énfasis o ironía", 1, "", "Alargar vocales es la forma hablada de subrayar: «sííí, claro que sííí» puede significar lo contrario.", 2],
      ["En español, las preguntas de sí o no suben la entonación al final", 1, "", "La curva ascendente del final es la firma sonora de la pregunta cerrada.", 1],
      ["Gritar siempre hace el mensaje más claro", 0, "gritar no garantiza claridad", "El volumen alto no aclara: la articulación y el ritmo sí.", 1],
      ["Un «gracias» siempre expresa gratitud sincera", 0, "según el tono, puede ser queja", "Un «gracias» seco o helado no agradece: el tono decide la sinceridad.", 1],
      ["«Qué guapo» solo puede usarse como elogio", 0, "puede ser una ironía", "Con tono plano y cejas caídas, «qué guapo» hunde: la ironía invierte el elogio.", 1],
      ["«Por favor» convierte cualquier orden en petición cortés", 0, "el tono también decide", "«¡Siéntate, por favor!» gritado no suaviza: la cortesía es palabra y melodía a la vez.", 1],
      ["El voseo usa «vos» en lugar de «tú»", 1, "", "En el Río de la Plata y otros países, vos tenés sustituye a tú tienes.", 2],
      ["«Usted» es la forma de cortesía en el trato formal", 1, "", "Usted mantiene la distancia del respeto: desconocidos, jefes y contextos formales.", 2],
      ["La coma indica una pausa breve al leer en voz alta", 1, "", "La puntuación es la partitura del lector: coma, pausa corta; punto, pausa larga.", 2],
      ["La ironía siempre se anuncia diciendo que es ironía", 0, "se detecta por tono y contexto", "La ironía viaja de incógnito: la delatan el tono, el gesto o la situación.", 2],
      ["«¡Qué bien te sale!» nunca puede ser una crítica", 0, "según el tono, puede herir", "Si lo que te sale mal es sabido, la frase invierte su sentido: el tono lo delata.", 2],
      ["La entonación descendente al final es propia de las afirmaciones", 1, "", "La voz cae al cerrar un enunciado afirmativo; la duda o la pregunta la levanta.", 3],
      ["Los puntos suspensivos dibujan vacilación o insinuación", 1, "", "«No sé... quizá...»: los puntos suspenden la voz y dejan el resto en el aire.", 3],
      ["Un gesto de asentimiento puede sustituir a un «sí» hablado", 1, "", "En la conversación cara a cara, la cabeza asiente por la boca: cuerpo y voz se turnan.", 3],
      ["Hablar muy rápido transmite calma y tranquilidad", 0, "la rapidez sugiere prisa o nervio", "Acelerar el ritmo suena a urgencia o emoción; la calma pide un tempo lento.", 3],
      ["«Perdone» solo sirve para pedir perdón", 0, "también abre interrupciones", "«Perdone, ¿puedo preguntar?» no pide perdón: es una fórmula de cortesía para entrar en conversación.", 3],
      ["Cambiar la palabra enfatizada cambia el foco de la frase", 1, "", "«TÚ lo dijiste» no señala igual que «tú LO dijiste»: el acento de intensidad elige al protagonista.", 4],
      ["En una enumeración, la voz se mantiene alta hasta el último elemento", 1, "", "«Compré pan, queso y aceite»: la voz cuelga arriba en las pausas y cae en el cierre.", 4],
      ["En América, «ustedes» cubre cualquier plural de trato", 1, "", "Sin vosotros, ustedes sirve para lo formal y lo informal: el plural es uno solo.", 4],
      ["Una disculpa dicha con tono agresivo sigue siendo cortés", 0, "el tono deshace la cortesía", "«Perdón, ¿eh?» entre dientes no apacigua: las palabras piden paz, el tono la niega.", 4],
      ["En el voseo rioplatense se dice «vos tenéis»", 0, "vos tenés", "El voseo tiene formas propias y agudas: vos tenés, sos, querés.", 4],
      ["El tono puede invertir por completo el significado literal", 1, "", "«¡Genial!» dicho con desánimo significa desastre: la melodía manda sobre el diccionario.", 5],
      ["El silencio nunca comunica nada", 0, "el silencio también comunica", "Una pausa larga puede asentir, incomodar o despreciar: callar también habla.", 5],
      ["«Usted» siempre expresa distancia y formalidad", 0, "en algunas regiones, también cercanía", "En países como Colombia o Costa Rica, «usted» se dice hasta a la pareja: el mapa manda.", 5],
      ["Una misma frase puede ser elogio o insulto según quién y cómo la diga", 1, "", "«Eres un sol» con ternura enamora; con sorna, hunde: contexto, gesto y tono deciden.", 5],
    ],
  },
  {
    variant: "observatorio",
    skill: "cultura",
    rows: [
      ["«café» llegó al español desde el turco a través del italiano y el francés", 1, "", "Qahwa (árabe) → kahve (turco) → caffè/café: el vocablo tomó tres barcos antes del español.", 4],
      ["«chocolate» viene del quechua", 0, "náhuatl", "Es náhuatl puro: xocolātl es la espuma amarga del cacao, no un préstamo andino.", 3],
      ["El español solo se habla en España y México", 0, "se habla en más de veinte países", "Es lengua oficial en más de veinte países de América, Europa y África: un idioma transatlántico.", 1],
      ["«Coche» es la palabra usual para «automóvil» en México", 0, "en México, carro", "España conduce coches; México, carros; Argentina, autos: tres palabras para el mismo motor.", 1],
      ["El español procede del latín hablado en Hispania", 1, "", "Es una lengua romance: nació del latín que los romanos dejaron en la península.", 1],
      ["«Zumo» en España y «jugo» en América nombran la misma bebida", 1, "", "Dos palabras, un vaso: zumo prefiere España; jugo, América.", 1],
      ["«Jitomate» es la palabra usual para el tomate en España", 0, "se usa en México", "Jitomate es un mexicanismo heredado del náhuatl xitomatl: en España se dice tomate.", 1],
      ["«Guagua» significa «bebé» en Chile y «autobús» en Cuba", 1, "", "Una misma palabra viaja con sentidos opuestos: en Chile llora en la cuna; en Cuba toca la bocina.", 2],
      ["En el Río de la Plata es habitual el voseo", 1, "", "Argentina y Uruguay hablan de vos: el voseo es seña de identidad del español rioplatense.", 2],
      ["«Palta» es la palabra mexicana para el aguacate", 0, "palta es andina; México, aguacate", "En Perú y Chile se dice palta; en México, aguacate, heredado del náhuatl.", 2],
      ["«Ordenador» y «computadora» se usan igual en todo el mundo hispano", 0, "ordenador, España; computadora, América", "España ordena; América computa: hasta la técnica tiene acentos regionales.", 2],
      ["Hay comunidades hispanohablantes en los cinco continentes", 1, "", "El español es una lengua global: se habla en Europa, América, África y en comunidades de Asia y Oceanía.", 2],
      ["«Coger» significa lo mismo en todas partes", 0, "en el Río de la Plata es vulgar", "Coger el autobús es normal en España; en el Río de la Plata la palabra es tabú: mejor tomar.", 2],
      ["«Algoritmo» viene del nombre del matemático Al-Juarismi", 1, "", "El apellido de al-Juarismi se convirtió en algoritmo: las matemáticas le deben el nombre.", 3],
      ["«Ojalá» procede del árabe", 1, "", "De law šāʾa llāh, «si Dios quisiera»: ojalá guarda un deseo árabe de hace más de mil años.", 3],
      ["«Huracán» y «hamaca» proceden del náhuatl", 0, "huracán y hamaca son taínas", "Son palabras taínas del Caribe; del náhuatl son chocolate, tomate o aguacate.", 3],
      ["«Inca» y «cóndor» llegaron del quechua al español", 1, "", "El quechua prestó cóndor, inca, pampa o cancha: la huella andina vive en el diccionario.", 3],
      ["«Barbacoa» viene del francés «barbecue»", 0, "viene del taíno barbacoa", "Fue al revés: del taíno barbacoa pasó al español, y del español a otras lenguas.", 3],
      ["«Almohada» llegó del árabe al español", 1, "", "Lo delata su arranque en al-: algodón, aceite y almohada son arabismos con artículo incorporado.", 4],
      ["La mayoría de los hispanohablantes pronuncia igual «calló» y «cayó»", 1, "", "Es el yeísmo: para la mayoría, ll e y suenan igual, aunque algunas zonas conservan la distinción.", 4],
      ["El español es la lengua con más hablantes nativos del mundo", 0, "la primera es el chino mandarín", "Por hablantes nativos, el chino mandarín encabeza la lista; el español va segundo.", 4],
      ["El voseo solo existe en Argentina", 0, "se usa en muchos países", "Vos se dice en Argentina, Uruguay, Paraguay y buena parte de Centroamérica: cruza el continente.", 4],
      ["«Alcohol» y «álgebra» guardan el artículo árabe en su origen", 1, "", "Al-kuhl y al-ŷabr viajaron del árabe al español con el artículo pegado a la palabra.", 5],
      ["«Cero» procede del latín", 0, "procede del árabe ṣifr", "Los matemáticos medievales tomaron ṣifr del árabe: de ahí cero y también cifra.", 5],
      ["«Tobogán» es una palabra de origen español", 0, "procede de lenguas algonquinas", "Llegó del francés de Canadá, que la tomó de lenguas algonquinas: los trineos la prestaron.", 5],
      ["«Chocolate», «tomate» y «aguacate» comparten origen náhuatl", 1, "", "Xocolātl, tomatl y ahuacatl: tres regalos del náhuatl a las cocinas del mundo.", 5],
    ],
  },
];

/** Torre: V/F generados desde el pack de refranes (mitad verdad, mitad señuelo). */
function refranRows(): Row[] {
  const rows: Row[] = [];
  for (let i = 0; i < REFRANES_PACK.length && rows.length < 40; i++) {
    const r = REFRANES_PACK[i];
    const trueMeaning = r.options[r.answerIndex];
    const decoy = r.options[(r.answerIndex + 1) % r.options.length];
    const claimTrue = i % 2 === 0;
    rows.push([
      `«${r.saying}» significa: «${claimTrue ? trueMeaning : decoy}»`,
      claimTrue ? 1 : 0,
      claimTrue ? "" : trueMeaning,
      `Dicho de ${r.region}. Su sentido real: «${trueMeaning}».`,
      Math.min(5, Math.max(1, r.difficulty)) as 1 | 2 | 3 | 4 | 5,
    ]);
  }
  return rows;
}

const ALL_ROWS: { variant: string; skill: SkillId; rows: Row[] }[] = [
  ...VARIANTS,
  { variant: "torre", skill: "expresion", rows: refranRows() },
];

export const VF_PACKS: VfExercise[] = ALL_ROWS.flatMap((v) =>
  v.rows.map((r, i) => ({
    id: fmtId("vf", v.variant, i),
    type: `vf-${v.variant}` as VfExercise["type"],
    skill: v.skill,
    difficulty: r[4],
    cefr: CEFR_BY_DIFFICULTY[r[4]],
    prompt: "¿Verdadero o falso?",
    explanation: r[3],
    tags: ["verdadero-falso", v.variant],
    statement: r[0],
    answer: r[1] === 1,
    correction: r[2] || undefined,
  })),
);
