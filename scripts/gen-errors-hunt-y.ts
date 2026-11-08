/**
 * Generador del paquete Y de «Caza de Errores» (errors-hunt-y).
 * Tupla: [frase, palabraErrónea ("" si no hay error), formaCorrecta,
 * [distractores], explicación, [tags], dificultad, cefr]
 * La frase contiene la palabra errónea exactamente una vez (o ninguna).
 * Ejecutar: bun run scripts/gen-errors-hunt-y.ts → src/data/gen/errors-hunt-y.ts
 */
import { writeFileSync, readFileSync } from "node:fs";

type Tup = [string, string, string, string[], string, string[], number, string];

const ERR_PROMPT = "Toca la palabra que esconde el error y elige su corrección.";
const CLEAN_PROMPT = "Busca el error… si lo hay.";

const T: Tup[] = [
  /* ---------------- g / j ---------------- */
  ["El aji de la abuela pica un poco", "aji", "ají", ["ajis", "ajji", "haji"], "«Ají» es aguda terminada en vocal: lleva tilde.", ["tildes", "g-j"], 2, "A2"],
  ["Ese jenero de música encanta en la isla", "jenero", "género", ["jeneró", "génerro", "genéro"], "«Género» se escribe con g; con j no existe.", ["g-j"], 2, "A2"],
  ["El geroglífico del templo se descifró", "geroglífico", "jeroglífico", ["geroglíficco", "jeroglyphico", "xeroglífico"], "«Jeroglífico» lleva j; la g inicial es un error frecuente.", ["g-j"], 3, "B1"],
  ["Los ginetes del desierto montan camellos", "ginetes", "jinetes", ["ginettes", "yinetes", "jinetés"], "«Jinete» (el que cabalga) se escribe con j.", ["g-j"], 3, "B1"],
  ["El zorro vive en su madridguera", "madridguera", "madriguera", ["madridgueras", "madríguera", "madriguerra"], "«Madriguera» (guarida) se escribe sin la d interior que dicta el oído.", ["g-j"], 3, "B2"],
  ["Le dio un jiro al timón y viró", "jiro", "giro", ["jiró", "giros", "yiro"], "«Giro» (del verbo girar) con g; «jiro» no existe.", ["g-j"], 2, "A2"],

  /* ---------------- ll / y ---------------- */
  ["Ese poyo asado huele que alimenta", "poyo", "pollo", ["poyó", "poio", "polló"], "«Pollo» (el ave) con ll; «poyo» es un banco rústico de piedra.", ["ll-y"], 2, "A2"],
  ["La bolla de la merienda está caliente", "bolla", "bollo", ["boyo", "bolló", "bolla"], "«Bollo» (panecillo) con ll; «bolla» no existe en la norma.", ["ll-y"], 2, "A2"],
  ["Siguió la tracyectoria de la estrella", "tracyectoria", "trayectoria", ["trallendoria", "trayectoría", "trayectória"], "«Trayectoria» se escribe con y latina.", ["ll-y"], 3, "B1"],
  ["La yerencia del abuelo era el mapa", "yerencia", "herencia", ["yeréncia", "herencia", "yerencia"], "«Herencia» lleva h inicial.", ["ll-y", "hache"], 3, "B2"],

  /* ---------------- hache ---------------- */
  ["Aprendió a ornear el pan del horno", "ornear", "hornear", ["ornearse", "horniar", "ornearon"], "«Hornear» (cocer en horno) con h; «ornar» es decorar, otra cosa.", ["hache"], 2, "A2"],
  ["La vaca pacía en la ierba alta", "ierba", "hierba", ["hierva", "yerbara", "ierbara"], "«Hierba» (la planta) con h; «hierva» es del verbo hervir.", ["hache"], 1, "A1"],
  ["La haya del bebé la cuida muy bien", "haya", "aya", ["allá", "halla", "ayita"], "«Aya» (niñera) no lleva h; «haya» es del verbo haber o el árbol.", ["hache"], 3, "B1"],
  ["No as probado el arroz con leche", "as", "has", ["haz", "ah", "has"], "«Has» (verbo haber) con h; «as» es un palo de la baraja.", ["hache"], 2, "A2"],
  ["Me ace mucha ilusión el viaje", "ace", "hace", ["haze", "ahce", "haz"], "«Hace» (verbo hacer) con h inicial.", ["hache"], 1, "A1"],
  ["La oja del cuaderno se rompió", "oja", "hoja", ["ojas", "holla", "ojá"], "«Hoja» (de árbol o papel) con h; «holla» es del verbo hollar.", ["hache"], 1, "A1"],
  ["El ermano mayor llegó antes", "ermano", "hermano", ["ermanó", "herman", "hermano"], "«Hermano» lleva h inicial.", ["hache"], 1, "A1"],
  ["El eclipse fue un echo memorable", "echo", "hecho", ["hechizo", "hechó", "echó"], "«Hecho» (participio de hacer) con h; «echo» es de echar.", ["hache"], 2, "A2"],
  ["Hecha un cable con la mudanza", "Hecha", "Echa", ["Hechando", "Hecha", "Echando"], "El imperativo de «echar» es «echa», sin h.", ["hache", "verbos"], 2, "A2"],

  /* ---------------- b / v ---------------- */
  ["Se rompió un baso en la cocina", "baso", "vaso", ["bazo", "vasó", "vasos"], "«Vaso» (recipiente) con v; «bazo» es un órgano del cuerpo.", ["b-v"], 1, "A1"],
  ["El agua baha por la ladera", "baha", "baja", ["vaja", "balla", "baja"], "«Baja» (del verbo bajar) con b final; «baha» no existe.", ["b-v"], 2, "A2"],
  ["Buscaban al probeidor del mercado", "probeidor", "proveedor", ["proovedor", "probeedora", "proveedora"], "«Proveedor» con v: se escribe pro-vee-dor.", ["b-v"], 3, "B1"],
  ["La cuerda del bajo bibró un rato", "bibró", "vibró", ["bibro", "bibrar", "vivbró"], "«Vibrar» y sus formas se escriben con v.", ["b-v"], 2, "A2"],
  ["Compraron una bobeda nueva para el salón", "bobeda", "bóveda", ["bóbeda", "vóveda", "bobedá"], "«Bóveda» con v y con tilde: es palabra esdrújula.", ["b-v", "tildes"], 3, "B1"],
  ["Trabajó como boluntario en la playa", "boluntario", "voluntario", ["boluntário", "voluntáriо", "boluntarios"], "«Voluntario» con v inicial.", ["b-v"], 2, "A2"],
  ["La seda del vesido brilla al sol", "vesido", "vestido", ["vestido", "vestído", "bestido"], "«Vestido» con v: ver-bo vestir.", ["b-v"], 2, "A2"],
  ["Fue un acto bandálico contra el faro", "bandálico", "vandálico", ["bandálicо", "vandalico", "bandalico"], "«Vandálico» (de vándalo) se escribe con v.", ["b-v"], 4, "B2"],

  /* ---------------- que / qui / gue / gui ---------------- */
  ["Pidió un kezo con pan para merendar", "kezo", "queso", ["kezzo", "quezar", "keso"], "El sonido /k/ ante e-i se escribe «qu»: queso.", ["que-qui"], 1, "A1"],
  ["Aprendo a tocar la quitarra", "quitarra", "guitarra", ["quitarra", "guitarrha", "kitarra"], "«Guitarra» con g: el sonido /g/ ante e-i se escribe «gu».", ["gue-gui"], 2, "A2"],

  /* ---------------- tildes ---------------- */
  ["El sábado salio temprano del puerto", "salio", "salió", ["salío", "saliró", "salieron"], "Los pretéritos en -ó llevan tilde: «salió».", ["tildes", "verbos"], 1, "A1"],
  ["La musica del bar es agradable", "musica", "música", ["musíca", "mussica", "musicao"], "«Música» es esdrújula: siempre lleva tilde.", ["tildes"], 1, "A1"],
  ["El medico de a bordo recetó reposo", "medico", "médico", ["medíco", "medicos", "médicо"], "«Médico» es esdrújula: siempre lleva tilde.", ["tildes"], 1, "A1"],
  ["Compro las entradas esta misma mañana", "Compro", "Compró", ["Compróse", "Compraba", "Compró"], "Entre «compró» (ayer) y «compro» (hoy), el sentido pide pretérito con tilde.", ["tildes", "verbos"], 2, "A2"],
  ["El cafe de la esquina estaba frío", "cafe", "café", ["cafee", "cafée", "cafés"], "«Café» es aguda terminada en vocal: lleva tilde.", ["tildes"], 1, "A1"],
  ["El jersey que me comprastes queda grande", "comprastes", "compraste", ["comprasté", "comprarás", "compras"], "El pretérito de 2.ª persona es «compraste»: nunca «comprastes».", ["verbos"], 3, "B1"],
  ["El arbitro pitó el final del partido", "arbitro", "árbitro", ["árbítro", "arbitró", "arbitrо"], "«Árbitro» es esdrújula: lleva tilde.", ["tildes"], 2, "A2"],
  ["El rapido tren llegó al muelle", "rapido", "rápido", ["rapído", "rapidо", "rápidos"], "«Rápido» es esdrújula: lleva tilde.", ["tildes"], 1, "A1"],
  ["Es una persona muy util en la travesía", "util", "útil", ["utíl", "utiles", "útil"], "«Útil» es llana terminada en -l: lleva tilde.", ["tildes"], 2, "A2"],
  ["El movil vibra sobre la mesa", "movil", "móvil", ["movíl", "moviles", "móvil"], "«Móvil» es llana terminada en -l: lleva tilde.", ["tildes"], 1, "A1"],
  ["La cancion del verano ya suena", "cancion", "canción", ["cancíon", "canciones", "cancíón"], "«Canción» es aguda terminada en -n: lleva tilde.", ["tildes"], 1, "A1"],
  ["Una imagen vale mas que mil palabras", "mas", "más", ["más", "mass", "maás"], "«Más» (cantidad) con tilde; «mas» sin tilde significa «pero».", ["tildes", "diacríticas"], 2, "A2"],
  ["El jamon ibérico corta fino", "jamon", "jamón", ["jamóm", "jamonés", "jamón"], "«Jamón» es aguda terminada en -n: lleva tilde.", ["tildes"], 1, "A1"],
  ["Tiene mucho caracter su capitán", "caracter", "carácter", ["carácter", "caractér", "caracteres"], "«Carácter» es llana terminada en -r: lleva tilde.", ["tildes"], 3, "B1"],
  ["La felicidad no se bende en el mercado", "bende", "vende", ["bende", "vende", "prende"], "«Vender» se escribe con v.", ["b-v"], 2, "A2"],
  ["El liquido de la botella está fresco", "liquido", "líquido", ["liquído", "liquidos", "líquidо"], "«Líquido» es esdrújula: lleva tilde.", ["tildes"], 2, "A2"],
  ["Mi papa trabaja en el faro", "papa", "papá", ["papá", "papas", "papá"], "«Papá» (padre) lleva tilde; «papa» es la patata.", ["tildes"], 1, "A1"],
  ["El examen te hara sudar tinta", "hara", "hará", ["hará", "haría", "harás"], "El futuro «hará» lleva tilde.", ["tildes", "verbos"], 2, "A2"],
  ["Cuando llegues, dimelo todo", "dimelo", "dímelo", ["dimeló", "dimelo", "dimélo"], "Los pronombres tras imperativo forman sobresdrújula: «dímelo».", ["tildes"], 3, "B1"],
  ["Las matematicas de la ruta son fáciles", "matematicas", "matemáticas", ["matemáticas", "matemáticas", "matemáticos"], "«Matemáticas» es esdrújula: lleva tilde.", ["tildes"], 1, "A1"],
  ["El pais entero celebró la hazaña", "pais", "país", ["país", "pais", "países"], "«País» lleva tilde por el hiato a-í.", ["tildes", "hiatos"], 1, "A1"],
  ["El album de fotos del faro", "album", "álbum", ["álbum", "albumes", "álibum"], "«Álbum» es llana terminada en -m: lleva tilde.", ["tildes"], 2, "A2"],
  ["El cesped del campo está impecable", "cesped", "césped", ["césped", "cespé", "cespedes"], "«Césped» es llana terminada en -d: lleva tilde.", ["tildes"], 3, "B1"],
  ["La orden del dia está clavada en la puerta", "dia", "día", ["día", "días", "díal"], "«Día» lleva tilde por el hiato i-a.", ["tildes", "hiatos"], 1, "A1"],
  ["Se sento en el muelle a ver el mar", "sento", "sentó", ["sentó", "sénto", "sentado"], "Pretérito en -ó con tilde: «sentó».", ["tildes", "verbos"], 2, "A2"],
  ["El volumen de la radio subio mucho", "subio", "subió", ["subió", "subío", "subiró"], "Pretérito en -ó con tilde: «subió».", ["tildes", "verbos"], 2, "A2"],
  ["El pequeño comio sin probar bocado", "comio", "comió", ["comió", "comío", "comeró"], "Pretérito en -ó con tilde: «comió».", ["tildes", "verbos"], 2, "A2"],
  ["El cortacespe hace un ruido horrible", "cortacespe", "cortacésped", ["cortacéspedes", "cortacespé", "corta-césped"], "«Cortacésped» conserva la tilde de «césped».", ["tildes"], 3, "B2"],
  ["El proximo tren sale a las ocho", "proximo", "próximo", ["próximo", "proximos", "próximо"], "«Próximo» es esdrújula: lleva tilde.", ["tildes"], 1, "A1"],
  ["El examen de ingles es el jueves", "ingles", "inglés", ["inglés", "inglеs", "ingleses"], "«Inglés» (el idioma) lleva tilde; «ingles» son las ingles.", ["tildes"], 2, "A2"],
  ["Una leccion aprendida para siempre", "leccion", "lección", ["lección", "leccíon", "lecciones"], "«Lección» es aguda terminada en -n: lleva tilde.", ["tildes"], 2, "A2"],
  ["El avion aterrizó entre nubes bajas", "avion", "avión", ["avión", "aviones", "avíon"], "«Avión» es aguda terminada en -n: lleva tilde.", ["tildes"], 1, "A1"],
  ["La television nueva es enorme", "television", "televisión", ["televisión", "televisíon", "televisores"], "«Televisión» es aguda terminada en -n: lleva tilde.", ["tildes"], 1, "A1"],
  ["Me gusta el café recien hecho", "recien", "recién", ["recién", "recente", "recentísimо"], "«Recién» (adverbio) lleva tilde.", ["tildes"], 2, "A2"],
  ["Ayer ceno con los abuelos en el puerto", "ceno", "cenó", ["cenó", "céno", "cenado"], "Pretérito en -ó con tilde: «cenó».", ["tildes", "verbos"], 2, "A2"],
  ["No cabian más cajas en el barco", "cabian", "cabían", ["cabían", "cabian", "cavían"], "El imperfecto «cabían» lleva tilde en la í.", ["tildes", "hiatos"], 3, "B1"],
  ["El remero batio el récord del canal", "batio", "batió", ["batió", "batío", "batiró"], "Pretérito en -ó con tilde: «batió».", ["tildes", "verbos"], 2, "A2"],
  ["Se rompio la viga del tejado", "rompio", "rompió", ["rompió", "rompío", "romperó"], "Pretérito en -ó con tilde: «rompió».", ["tildes", "verbos"], 2, "A2"],

  /* ---------------- concordancia ---------------- */
  ["La problema del viaje es el precio", "La", "El", ["Esa", "Los", "Unas"], "«Problema» es masculino aunque termine en -a (como «tema»).", ["género"], 2, "A2"],
  ["El agua del norte está muy frío", "frío", "fría", ["fríos", "friosas", "friada"], "«Agua» es femenina: el adjetivo va en femenino, «fría».", ["concordancia"], 2, "A2"],
  ["Las faldas roja destacan en el baile", "roja", "rojas", ["rojas", "rojas", "rojiza"], "Adjetivo en plural: «rojas» concuerda con «faldas».", ["concordancia"], 1, "A1"],
  ["Unos libros muy interesante para el viaje", "interesante", "interesantes", ["interesantes", "interesantе", "interesado"], "Adjetivo en plural: «interesantes».", ["concordancia"], 2, "A2"],
  ["Estas casas es muy viejas", "es", "son", ["son", "están", "ser"], "Sujeto plural, verbo plural: «son».", ["concordancia"], 1, "A1"],
  ["La gente piensan distinto en la isla", "piensan", "piensa", ["piensa", "piensas", "pensad"], "«Gente» es singular en la norma: «la gente piensa».", ["concordancia"], 3, "B1"],
  ["Veinte aves vuela sobre el faro", "vuela", "vuelan", ["vuelan", "volaban", "volaran"], "Sujeto plural: «vuelan».", ["concordancia"], 2, "A2"],
  ["La silla nueva es muy cómodo", "cómodo", "cómoda", ["cómoda", "cómodos", "comodidad"], "«Silla» es femenina: «cómoda».", ["concordancia"], 1, "A1"],
  ["El aula estaba lleno de marineros", "lleno", "llena", ["llena", "llenos", "llenando"], "«Aula» es femenina: «el aula llena» (el artículo va en masculino solo por la «a» tónica inicial).", ["concordancia"], 3, "B1"],

  /* ---------------- verbos ---------------- */
  ["Hubieron muchas quejas por el retraso", "Hubieron", "Hubo", ["Hubo", "Haban", "Hicieron"], "«Haber» impersonal: siempre «hubo», nunca «hubieron».", ["verbos", "haber"], 3, "B1"],
  ["Si tuviera tiempo, viajaba más a menudo", "viajaba", "viajaría", ["viajaría", "viajará", "viajase"], "Condicional en la parte principal: «si tuviera… viajaría».", ["verbos", "condicional"], 4, "B2"],
  ["El verano pasado fuistes a la feria", "fuistes", "fuiste", ["fuiste", "fuisteis", "fuístes"], "El pretérito de 2.ª persona es «fuiste», sin -s final.", ["verbos"], 3, "B1"],
  ["Ojalá que llueve mañana en la viña", "llueve", "llueva", ["llueva", "lloviera", "lloverá"], "Tras «ojalá», el subjuntivo: «llueva».", ["verbos", "subjuntivo"], 4, "B2"],
  ["Es importante que vienes pronto al muelle", "vienes", "vengas", ["vengas", "vinieras", "vendrás"], "Tras «es importante que», subjuntivo: «vengas».", ["verbos", "subjuntivo"], 4, "B2"],
  ["Si tendría dinero, compraría un velero", "tendría", "tuviera", ["tuviera", "tuviese", "tendrá"], "La condición pide imperfecto de subjuntivo: «tuviera».", ["verbos", "subjuntivo"], 4, "B2"],
  ["Me di cuenta que llovió de madrugada", "que", "de que", ["de que", "a que", "en que"], "«Darse cuenta DE que»: el «de» no puede faltar.", ["queísmo"], 4, "B2"],

  /* ---------------- que / qué / porque ---------------- */
  ["Dime porqué te vas tan pronto", "porqué", "por qué", ["por qué", "porque", "por que"], "Para preguntar, dos palabras: «por qué»; «porqué» es el sustantivo.", ["diacríticas"], 3, "B1"],
  ["El porque de su enfado lo saben todos", "porque", "porqué", ["porqué", "por qué", "por que"], "El sustantivo es «porqué»: «el porqué de su enfado».", ["diacríticas"], 3, "B1"],
  ["Que bonito amanece hoy en la bahía", "Que", "Qué", ["Qué", "Como", "Cuánto"], "Ante exclamación, «qué» con tilde.", ["diacríticas"], 2, "A2"],
  ["No entiendo que dices por el teléfono", "que", "qué", ["qué", "cual", "como"], "Pregunta indirecta: «no entiendo qué dices».", ["diacríticas"], 2, "A2"],

  /* ---------------- a / ha ---------------- */
  ["A ido al mercado con su madre", "A", "Ha", ["Ha", "Ah", "Hay"], "«Ha» (verbo haber) con h; «a» es preposición.", ["hache"], 2, "A2"],
  ["El tren a llegado con retraso", "a", "ha", ["ha", "ah", "hay"], "«Ha llegado» (verbo haber) con h.", ["hache"], 2, "A2"],

  /* ---------------- sino / si no ---------------- */
  ["No vino al faro, si no al puerto", "si", "sino", ["sino", "sí", "si"], "«Sino» (conjunción adversativa) tras negación: una sola palabra.", ["sino"], 3, "B1"],

  /* ---------------- él / tu / si / más ---------------- */
  ["Él libro de los faros es antiguo", "Él", "El", ["El", "Ese", "Al"], "«El» artículo no lleva tilde; «él» es pronombre.", ["diacríticas"], 1, "A1"],
  ["Tu sabes nadar de sobra", "Tu", "Tú", ["Tú", "Tu", "Te"], "«Tú» pronombre con tilde; «tu» es posesivo.", ["diacríticas"], 1, "A1"],
  ["Estoy mas o menos listo para zarpar", "mas", "más", ["más", "mas", "más"], "«Más o menos» (cantidad) con tilde.", ["diacríticas"], 2, "A2"],
  ["Aun no ha vuelto la patrulla", "Aun", "Aún", ["Aún", "Aun", "Aúna"], "«Aún» (todavía) con tilde; «aun» significa «incluso».", ["diacríticas"], 3, "B1"],

  /* ---------------- homófonos ---------------- */
  ["La baca del coche estaba llena de maletas", "", "baca", ["vaca", "baka", "bacá"], "Frase limpia: «baca» (portaequipajes) con b; «vaca» es el animal.", ["no-error", "b-v"], 3, "B1"],
  ["El grifo echa agua fría del manantial", "", "echa", ["hecha", "echando", "hecho"], "Frase limpia: «echa» (de echar) sin h; «hecha» es participio de hacer.", ["no-error", "hache"], 2, "A2"],
  ["El asta de la bandera cruje con el viento", "", "asta", ["hasta", "asma", "haya"], "Frase limpia: «asta» (mástil) sin h; «hasta» es preposición.", ["no-error"], 4, "C1"],
  ["La vara de medir es de madera vieja", "", "vara", ["barra", "vaja", "vará"], "Frase limpia: «vara» (palo delgado) con v.", ["no-error"], 4, "C1"],
  ["Una ola gigante rozó el muelle", "", "ola", ["hola", "holas", "olá"], "Frase limpia: «ola» (de mar) sin h; «hola» es el saludo.", ["no-error"], 2, "A2"],
  ["El hada del cuento perdió su varita", "", "hada", ["ada", "alla", "hallas"], "Frase limpia: «hada» femenino con artículo «el» por la «a» tónica inicial.", ["no-error", "género"], 3, "B1"],

  /* ---------------- frases limpias (trampas sin error) ---------------- */
  ["El agua fría del manantial sabe a gloria", "", "fría", ["frío", "frías", "friadas"], "Frase limpia: «agua» es femenina y el adjetivo concuerda («fría»).", ["no-error"], 2, "A2"],
  ["Esta es la casa que compré en abril", "", "Esta", ["Ésta", "Está", "Estás"], "Frase limpia: «esta» demostrativo sin tilde (la tilde de «ésta» ya no se usa).", ["no-error", "tildes"], 2, "A2"],
  ["El resto de los alumnos llegó tarde", "", "llegó", ["llegaron", "llegaba", "llega"], "Frase limpia: «el resto» concuerda en singular, «llegó».", ["no-error", "concordancia"], 4, "B2"],
  ["Se lo dio ayer por la tarde", "", "dio", ["dió", "dío", "dieron"], "Frase limpia: «dio» es monosílabo y no lleva tilde.", ["no-error", "tildes"], 2, "A2"],
  ["Llegó tarde porque había atasco en el puerto", "", "porque", ["porqué", "por qué", "por que"], "Frase limpia: «porque» (causa) sin tilde y en una sola palabra.", ["no-error", "diacríticas"], 3, "B1"],
  ["Si no llega pronto, empezamos sin él", "", "Si", ["Sí", "Sino", "Ése"], "Frase limpia: «si no» son dos palabras aquí (condición + negación).", ["no-error"], 3, "B1"],
  ["Todos rieron, aun el capitán serio", "", "aun", ["aún", "auna", "aúna"], "Frase limpia: «aun» significa «incluso» y no lleva tilde.", ["no-error", "diacríticas"], 3, "B1"],
  ["El tambor suena a lo lejos en la niebla", "", "tambor", ["támbor", "tambóra", "tamboril"], "Frase limpia: «tambor» es aguda terminada en -r: no lleva tilde.", ["no-error", "tildes"], 2, "A2"],
  ["El joven del faro apunta las mareas", "", "joven", ["jóven", "jovén", "jóvenes"], "Frase limpia: «joven» es llana terminada en -n: no lleva tilde.", ["no-error", "tildes"], 2, "A2"],
  ["El reloj del abuelo aún anda", "", "reloj", ["relój", "relojes", "relós"], "Frase limpia: «reloj» es aguda terminada en -j: no lleva tilde.", ["no-error", "tildes"], 2, "A2"],
  ["El juez oyó a todos los testigos", "", "oyó", ["oyo", "oyóo", "oio"], "Frase limpia: «oyó» (de oír) lleva tilde en la ó.", ["no-error", "tildes"], 3, "B1"],
  ["El águila planea sobre el acantilado", "", "águila", ["aguila", "águilas", "aguíla"], "Frase limpia: «águila» es esdrújula con tilde y artículo «el» por la «a» tónica.", ["no-error", "género"], 3, "B1"],
  ["El hambre aprieta en el barco a la deriva", "", "hambre", ["ambre", "hambres", "hambre"], "Frase limpia: «hambre» femenina con artículo «el».", ["no-error", "género"], 4, "B2"],
  ["El piano sonaba por encima del rumor del mar", "", "sonaba", ["sonavа", "sonaba", "sonaría"], "Frase limpia: el imperfecto «sonaba» está bien construido.", ["no-error", "verbos"], 3, "B1"],
  ["La mitad de la tarta desapareció en un minuto", "", "desapareció", ["desaparecío", "desapareció", "desaparecería"], "Frase limpia: «la mitad» concuerda en singular.", ["no-error", "concordancia"], 3, "B1"],
  ["Doscientos cincuenta cromos llenan el álbum", "", "Doscientos", ["Docientos", "Dos mil quinientos", "Doscientas"], "Frase limpia: «doscientos» se escribe así (nunca «docientos»).", ["no-error"], 3, "B1"],

  /* ---------------- colchón de margen ---------------- */
  ["El jardin del café da buena sombra", "jardin", "jardín", ["jardín", "jardines", "jardínes"], "«Jardín» es aguda terminada en -n: lleva tilde.", ["tildes"], 1, "A1"],
  ["El autobus de las ocho no falla", "autobus", "autobús", ["autobús", "autobusos", "autovús"], "«Autobús» es aguda terminada en -s: lleva tilde.", ["tildes"], 1, "A1"],
  ["El arbol del patio cruje al viento", "arbol", "árbol", ["árbol", "arboles", "árbol"], "«Árbol» es llana terminada en -l: lleva tilde.", ["tildes"], 1, "A1"],
  ["La semilla germino en una semana", "germino", "germinó", ["germinó", "germínio", "germinara"], "Pretérito en -ó con tilde: «germinó».", ["tildes", "verbos"], 2, "A2"],
  ["Se hizó tarde en la biblioteca", "hizó", "hizo", ["hizo", "hició", "hacer"], "«Hizo» (pretérito de hacer) no lleva tilde.", ["tildes", "verbos"], 2, "A2"],
  ["Exíje tu derecho a la siesta", "Exíje", "Exige", ["Exige", "Exigió", "Exigirá"], "«Exigir» y sus formas no llevan tilde: la fuerza recae en -gi-.", ["tildes", "verbos"], 3, "B1"],
  ["La azotea del hotel mira al mar", "", "azotea", ["asotea", "azotear", "azoteas"], "Frase limpia: «azotea» (la terraza) se escribe con z.", ["no-error"], 2, "A2"],
  ["El lápiz del dibujante está mordido", "", "lápiz", ["lapiz", "lápises", "lapíz"], "Frase limpia: «lápiz» es llana terminada en -z y lleva tilde.", ["no-error", "tildes"], 2, "A2"],
  ["El viento azota las velas del puerto", "", "azota", ["asota", "azotá", "azotas"], "Frase limpia: «azota» (de azotar) se escribe con z.", ["no-error"], 3, "B1"],
  ["La marmota duerme todo el invierno", "", "marmota", ["marmota", "marmóta", "marmotas"], "Frase limpia: «marmota» es llana terminada en vocal: no lleva tilde.", ["no-error", "tildes"], 2, "A2"],
];

/* ---------------- Generación ---------------- */
interface Out {
  id: string; type: "errores"; skill: "ortografia"; difficulty: number; cefr: string;
  tokens: string[]; errorIndex: number; options: string[]; answerIndex: number;
  prompt: string; explanation: string; tags: string[];
}

const items: Out[] = [];
const errors: string[] = [];

T.forEach(([sentence, wrong, correct, distractors, explanation, tags, diff, cefr], i) => {
  const tokens = sentence.split(" ");
  const hasError = wrong !== "";
  let errorIndex = -1;
  if (hasError) {
    const hits = tokens.map((t, idx) => (t === wrong ? idx : -1)).filter((x) => x >= 0);
    if (hits.length !== 1) { errors.push(`${sentence}: la palabra «${wrong}» aparece ${hits.length} veces`); return; }
    errorIndex = hits[0];
  }
  // Opciones: la correcta + 3 distractores, rotadas de forma determinista.
  const opts = [correct, ...distractors.filter((d) => d !== correct)].slice(0, 4);
  if (new Set(opts).size !== opts.length) { errors.push(`${sentence}: opciones repetidas`); return; }
  const shift = i % opts.length;
  const rotated = [...opts.slice(opts.length - shift), ...opts.slice(0, opts.length - shift)];
  const answerIndex = rotated.indexOf(correct);
  items.push({
    id: `ehy-${String(i + 1).padStart(3, "0")}`,
    type: "errores",
    skill: "ortografia",
    difficulty: diff,
    cefr,
    tokens,
    errorIndex,
    options: rotated,
    answerIndex,
    prompt: hasError ? ERR_PROMPT : CLEAN_PROMPT,
    explanation,
    tags,
  });
});

/* ---------------- Validaciones ---------------- */
if (new Set(items.map((x) => x.id)).size !== items.length) errors.push("ids duplicados");
for (const it of items) {
  if (it.options[it.answerIndex] !== (it.errorIndex === -1 ? it.options[it.answerIndex] : it.options[it.answerIndex])) errors.push("unreachable");
  if (it.errorIndex >= 0 && it.tokens[it.errorIndex] === it.options[it.answerIndex]) {
    errors.push(`${it.id}: el token ya contiene la forma correcta`);
  }
  if (new Set(it.tags).size !== it.tags.length) errors.push(`${it.id}: tags repetidos`);
}
const oldPacks = readFileSync(new URL("../src/data/errors-hunt.ts", import.meta.url).pathname, "utf8")
  + readFileSync(new URL("../src/data/gen/errors-hunt-x.ts", import.meta.url).pathname, "utf8");
const norm = (s: string) => s.toLowerCase().replace(/[^a-zñáéíóúü ]/g, "");
for (const it of items) {
  if (oldPacks.includes(norm(it.tokens.join(" ")))) errors.push(`frase ya existente: ${it.tokens.join(" ")}`);
}

/* ---------------- Emisión ---------------- */
const head = `/**
 * Caza de Errores · Paquete Y de ampliación (${items.length} ítems:
 * ${items.filter((x) => x.errorIndex >= 0).length} con error + ${items.filter((x) => x.errorIndex === -1).length} limpias).
 * Generado por scripts/gen-errors-hunt-y.ts · NO editar a mano.
 * Cubre: g/j, ll/y, h, b/v, que-qui, tildes, concordancia, verbos
 * (haber, subjuntivo, condicional), queísmo, diacríticas, homófonos
 * y frases limpias de trampa.
 */
import type { ErrorHuntExercise } from "@/types";

export const ERRORS_PACK_Y: ErrorHuntExercise[] = [
`;

const body = items.map((it) => `  { id: "${it.id}", type: "errores", skill: "ortografia", difficulty: ${it.difficulty}, cefr: "${it.cefr}",
    tokens: [${it.tokens.map((t) => `"${t}"`).join(", ")}],
    errorIndex: ${it.errorIndex},
    options: [${it.options.map((o) => `"${o}"`).join(", ")}],
    answerIndex: ${it.answerIndex},
    prompt: ${JSON.stringify(it.prompt)},
    explanation: ${JSON.stringify(it.explanation)},
    tags: [${it.tags.map((t) => `"${t}"`).join(", ")}] },`).join("\n");

writeFileSync(new URL("../src/data/gen/errors-hunt-y.ts", import.meta.url).pathname, head + body + "\n];\n", "utf8");

console.log(`Generados ${items.length} ítems (${items.filter((x) => x.errorIndex >= 0).length} con error)`);
console.log("Total errores:", 144 + 240 + items.length);
if (errors.length) {
  console.error(`\n✗ ERRORES (${errors.length}):`);
  for (const e of errors) console.error("  -", e);
  process.exit(1);
}
console.log("✓ Validaciones correctas");
