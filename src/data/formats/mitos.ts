import type { MitosExercise } from "@/types";

/**
 * Pack · Biblioteca de Mitos y Leyendas (Biblioteca Infinita) · Etapa 2 completa
 * ----------------------------------------------------------------
 * Ocho leyendas del patrimonio oral hispanoamericano, vividas desde
 * dentro: el jugador recorre cada mito con decisiones y, al final,
 * responde una pregunta de comprensión sobre su lógica y su moraleja.
 * Las versiones son respetuosas y breves: la tradición oral no se
 * transcribe, se cuenta de nuevo.
 */

export const MITOS_PACK: MitosExercise[] = [
  {
    id: "mt-01", type: "mitos", skill: "lectura", difficulty: 3, cefr: "B1",
    title: "La Llorona",
    origin: "México · tradición oral",
    start: 0,
    prompt: "Has recorrido la leyenda: responde.",
    explanation: "La Llorona busca a sus hijos perdidos: el griego «ay, mis hijos» delata a la madre de la tradición, y su pena es la advertencia que ahuyenta a los desvelados.",
    tags: ["mitos", "México", "comprensión"],
    nodes: [
      { id: "n1", text: "Cuentan en el valle que, pasada la medianoche, un llanto de mujer recorre los callejones: «ay, mis hijos…». Los vecinos cierran las ventanas; tú, recién llegado, aún no sabes por qué.",
        choices: [
          { label: "Seguir el llanto hasta su fuente", next: 1, feedback: "Avanzas entre las jacarandas. El llanto se acerca y, con él, un frío que no es del todo de la noche." },
          { label: "Preguntar a la vecina más vieja", next: 2, feedback: "Doña Refugio aparta la cortina: «Eso es la Llorona, hijo. Busca a sus niños desde hace siglos y no conviene verla de cerca»." },
        ] },
      { id: "n2", text: "El llanto te lleva al cauce viejo del río. Allí, entre la niebla, una figura con vestido blanco se inclina sobre el agua, peinando con los dedos lo que no son ya dedos. Repite su griego sin cansarse: «ay, mis hijos…».",
        choices: [
          { label: "Hablarle con voz firme", next: 3, feedback: "«Señora —dices—, sus hijos no están aquí». La figura se vuelve despacio. Por un instante, su pena te atraviesa como una corriente de río." },
          { label: "Esconderse tras las piedras", next: 3, feedback: "Te acurrucas entre las rocas. Ella pasa tan cerca que escuchas el agua en su vestido. No te ve… o finge no verte." },
        ] },
      { id: "n3", text: "Doña Refugio te sirve café de olla y cuenta: «Fue una mujer que perdió a sus hijos junto al río, y Dios no le dio descanso. Camina buscándolos. Al que la ve llorar de pena se le alborota el alma; al que se burla, se le descompone el sueño para siempre».",
        choices: [
          { label: "Preguntar cómo se le ayuda", next: 3, feedback: "«Ayudándole no se puede —dice doña Refugio—. Solo se le respeta: no se le silba, no se le sigue, y si llora cerca, se le enciende una vela»." },
          { label: "Volver a la calle a verla de lejos", next: 3, feedback: "Desde el portal, entre los faroles, ves el vestido blanco cruzar la plaza. El llanto se apaga hacia el río, como una marea que se retira." },
        ] },
      { id: "n4", text: "Al amanecer, el valle vuelve a sus maízales y nadie habla de la noche. En la plaza, un viejo talla una gárgola de leño y murmura: «La Llorona no espanta: recuerda. El llanto es la vela que el olvido no sopla».",
        choices: [
          { label: "Encender una vela en la capilla", next: -1, feedback: "La flama se queda quieta aunque entra viento. En el valle, dicen, esa vela arde por los niños que no vuelven." },
          { label: "Anotar la leyenda en tu bitácora", next: -1, feedback: "Escribes: «La Llorona busca lo que perdió; quien la escucha, aprende a no burlarse del dolor ajeno»." },
        ] },
    ],
    question: "Según la leyenda, ¿por qué recorre la Llorona las noches del valle?",
    options: [
      "Busca a los hijos que perdió junto al río",
      "Custodia el tesoro de un viejo faro",
      "Espera al barco que nunca volvió",
      "Castiga a quien duerme sin vela",
    ],
    answerIndex: 0,
  },

  {
    id: "mt-02", type: "mitos", skill: "lectura", difficulty: 3, cefr: "B1",
    title: "El Cadejo",
    origin: "Centroamérica · tradición oral",
    start: 0,
    prompt: "Has recorrido la leyenda: responde.",
    explanation: "La tradición centroamericana cuenta dos cadejos: el blanco acompaña y protege a los caminantes de noche; el negro, con ojos de brasa, presagia el mal camino. Elegir bien la sombra es la mitad del viaje.",
    tags: ["mitos", "Centroamérica", "comprensión"],
    nodes: [
      { id: "n1", text: "Vuelves del pueblo por el camino real, ya sin luna. A la altura del pochote, escuchas un paso acompasado detrás del tuyo: no persigue, ni alcanza. Solo sigue.",
        choices: [
          { label: "Voltiar despacio, sin correr", next: 1, feedback: "Te giras con calma y lo ves: un perro grande como un becerro, el pelo blanco como la sal, los ojos serenos. El cadejo blanco inclina la cabeza." },
          { label: "Echar a correr hacia el puente", next: 2, feedback: "Corres. El paso acompasado se multiplica a tus espaldas: ahora son dos, y uno de ellos huele a candela mojada. El puente aún queda lejos." },
        ] },
      { id: "n2", text: "El cadejo blanco camina a tu lado sin mirarte. Cuentan los viejos que ese perro escoge a los caminantes de conciencia limpia y los escolta hasta su puerta; donde él para, el camino ya no hace daño.",
        choices: [
          { label: "Caminar con él hasta el caserío", next: 3, feedback: "Camináis en silencio. En la primera calle con luz, el cadejo se sienta, te mira una vez y se vuelve sombra entre las matas de café." },
          { label: "Preguntarle a dónde va", next: 3, feedback: "El cadejo no habla con palabras: mueve la cola hacia el caserío y luego hacia el monte. Entiendes que solo escolta: el destino es tuyo." },
        ] },
      { id: "n3", text: "El otro perro llega al puente a la vez que tú: negro como boca de lobo, los ojos como brasas de azufre. El blanco aparece de pronto entre ustedes, y los dos animales se enredan en una nube de polvo y relámpago sin ruido.",
        choices: [
          { label: "Cruzar el puente sin mirar atrás", next: 3, feedback: "Cruzas con el corazón en la garganta. Del otro lado, el blanco te espera como si jamás hubiera peleado: el negro no pasó el agua." },
          { label: "Ayudar al cadejo blanco con tu farol", next: 3, feedback: "Alzas el farol: la luz corta la pelea. El negro retrocede —no soporta la llama limpia— y se pierde en el cañaveral." },
        ] },
      { id: "n4", text: "En el caserío te reciben con tortillas recientes y la noticia: anoche, en el camino real, a un caminante borracho lo encontraron sin aliento y con los ojos abiertos. La abuela suspira: «El cadejo negro castiga la senda torcida; el blanco, la endereza».",
        choices: [
          { label: "Dar las gracias al cadejo blanco en voz baja", next: -1, feedback: "Dices «gracias» hacia el monte. Una brisa tibia como aliento de perro te toca la cara, y el camino de vuelta ya no parece tan largo." },
          { label: "Contar la historia a los niños del caserío", next: -1, feedback: "Los niños escuchan con los ojos muy grandes. La abuela asiente: así se guarda una leyenda: contándola a quien aún pregunta." },
        ] },
    ],
    question: "¿Qué distingue al cadejo blanco del cadejo negro en la leyenda?",
    options: [
      "El blanco acompaña y protege; el negro presagia y castiga",
      "El blanco ladra al amanecer; el negro, al anochecer",
      "El blanco cuida puentes; el negro, caminos rectos",
      "Los dos son el mismo animal con distinto pelaje",
    ],
    answerIndex: 0,
  },

  {
    id: "mt-03", type: "mitos", skill: "lectura", difficulty: 4, cefr: "B2",
    title: "El Silbón",
    origin: "Venezuela y Colombia · llanos",
    start: 0,
    prompt: "Has recorrido la leyenda: responde.",
    explanation: "El Silbón silba cerca cuando está lejos y lejos cuando está cerca: la tradición llanera enseña que su silbido invierte la distancia, y que solo un olor a ají o un perro fiel lo detiene.",
    tags: ["mitos", "llanos", "comprensión"],
    nodes: [
      { id: "n1", text: "En el hato te avisan: no silbes de noche en el llano, y si oyes un silbido largo y fino, no corras hacia él. El Silbón carga un hueso y una tambaya, y cuenta los pecados ajenos mientras cuenta huesos.",
        choices: [
          { label: "Preguntar por qué silba", next: 1, feedback: "El peón apaga el cigarro: «Silba cerca cuando está lejos, y lejos cuando está cerca. Por eso caen los que corren al oírlo… corren hacia su boca»." },
          { label: "Pedir que alguien te acompañe al corral", next: 2, feedback: "El peón te presta al perro chucuto, el único del hato que no huye de nada. «Si se arranca —te dice—, no mires atrás»." },
        ] },
      { id: "n2", text: "A medianoche, el silbido entra por la ventana como una aguja: fino, largo, modulado como quién está a diez pasos. Pero la puerta está a diez pasos, y el silbido sonaba a un susurro pegado a tu oído.",
        choices: [
          { label: "Recuerda la regla: el silbido cerca significa lejos", next: 3, feedback: "Te quedas quieto. El silbido se va haciendo pequeño, de verdad, hacia el palmar. La regla de los viejos acaba de salvarte el paso." },
          { label: "Cerrar los ojos y taparse los oídos", next: 3, feedback: "Te tapas los oídos. Silba adentro igual, como si el sonido naciera del propio miedo. Entonces el perro chucuto gruñe hacia la ventana… y el silbido se cansa." },
        ] },
      { id: "n3", text: "En el corral, el perro chucuto olfatea el aire y eriza el lomo: huele a ají machacado. El peón había dicho: «Al Silbón lo corre un perro bravo o el ají en la puerta: él no entra donde pican los olores fuertes».",
        choices: [
          { label: "Colgar ajíes en la puerta del corral", next: 3, feedback: "Cuelgas las guirnaldas de ají. A la madrugada, junto al corral, la tierra amanece removida en círculo, como si algo hubiera girado toda la noche sin atreverse a entrar." },
          { label: "Confiar solo en el perro", next: 3, feedback: "El chucuto se echa frente al portón, entre tú y la noche. Dos veces ronronea un gruñido; dos veces el silbido se cambia de lado. Al alba, el perro sigue en su puesto." },
        ] },
      { id: "n4", text: "El viejo del hato escucha tu relato y asiente despacio: «El Silbón fue un hijo que no quiso a su padre, dicen, y por eso anda contando huesos ajenos. Su penitencia es no poder entrar donde lo reciben con olor de casa: ají, perro y gente despierta».",
        choices: [
          { label: "Preguntar si alguna vez descansará", next: -1, feedback: "«Descansará cuando deje de contar —dice el viejo—. Mientras haya quien silbe de noche, él tendrá a quién contestar.» El llano amanece enorme y quieto." },
          { label: "Escribir la regla en tu bitácora", next: -1, feedback: "Anotas: «Cerquísimo es estar lejos: no corras hacia el silbido». Suena a consejo de llano y, a partir de esta noche, también a consejo tuyo." },
        ] },
    ],
    question: "¿Qué truco juega el Silbón con su silbido, según la leyenda?",
    options: [
      "Silba cerca cuando está lejos, y lejos cuando está cerca",
      "Silba dos veces para contar los huesos que lleva",
      "Imita la voz de la madre del caminante",
      "Solo silba dentro de los corrales cerrados",
    ],
    answerIndex: 0,
  },

  {
    id: "mt-04", type: "mitos", skill: "lectura", difficulty: 3, cefr: "B1",
    title: "El Trauco",
    origin: "Chiloé · Chile",
    start: 0,
    prompt: "Has recorrido la leyenda: responde.",
    explanation: "El Trauco de Chiloé habita entre los quilantos y, con su mirada, encela a las mujeres y destraba a los hombres: la tradición es una advertencia sobre la responsabilidad y las excusas que la comunidad fabrica.",
    tags: ["mitos", "Chiloé", "comprensión"],
    nodes: [
      { id: "n1", text: "En la isla te avisan al bajar del barco: no te quedes dormido entre los quilantos (matorrales de quila) ni contestes si alguien te habla desde dentro. Un hombrecito de sombrero de lana y un palo retorcido los cuida.",
        choices: [
          { label: "Preguntar quién es el hombrecito", next: 1, feedback: "La machi de la isla sonríe con medio humor: «Ese es el Trauco. No es malo ni bueno: es puro trabajo del bosque. Solo atiende a quien lo busca o lo provoca»." },
          { label: "Marchar directo a la casa de la familia", next: 2, feedback: "Vas por el camino real, pero el atajo entre quilantos ahorra media hora y la tarde cae… Conoces la advertencia. Aun así, el atajo te mira." },
        ] },
      { id: "n2", text: "El Trauco es pequeño, feo y fuerte, dicen, con el rostro como la corteza del canelo. Viste quillango y carga el trunque, un palo con el que golpea los árboles. Con solo mirar a una mujer la deja pensándolo; con solo mirar a un hombre lo deja torcido de celos.",
        choices: [
          { label: "Preguntar cómo se le respeta", next: 3, feedback: "La machi dice: «No entrando a su quila después del Ángelus, no silbando en su monte, y no culpándolo de lo que hacen los vivos»." },
          { label: "Preguntar si es cierto lo de la mirada", next: 3, feedback: "«La mirada es un consejo —dice—. Le enseña a las muchachas que el deseo también se piensa, y a los mozos, que el celo se maneja con espejo, no con palo»." },
        ] },
      { id: "n3", text: "En el atajo, algo pasa entre los quilantos: un silbido corto, luego el golpe seco de un palo contra un tronco. Podría ser un pájaro carpintero. Podría ser el trunque. La luz se va como una marea apurada.",
        choices: [
          { label: "Volver al camino real aunque sea más largo", next: 3, feedback: "Das media vuelta con respeto, sin correr. Al rato, el silbido se queda atrás, y en la casa de la familia te dicen: «Anoche el Trauco golpeó tres veces. Alguien andaba cerca de su quila»." },
          { label: "Contestar el silbido con otro silbido", next: 3, feedback: "Silbas. El bosque calla entero, como si toda la isla contuviera el aire. Vuelves al camino real sin mirar atrás y prometes no silbar jamás en monte ajeno." },
        ] },
      { id: "n4", text: "En la cocina, el fogón chilote cruje y la familia ríe de tu susto, pero la abuela pone su observación: «Cuando una joven tenía un hijo y nadie sabía de quién, antes se decía: fue el Trauco. Así se salvaban los hombres de mentir. El Trauco carga con culpas ajenas desde entonces».",
        choices: [
          { label: "Preguntar si el Trauco existe de verdad", next: -1, feedback: "La abuela sonríe: «Existe la quila y existe la mentira. Todo lo demás son los dos tomando el té». El fogón chisporrotea como dándole la razón." },
          { label: "Anotar la lección en tu bitácora", next: -1, feedback: "Escribes: «El Trauco no encela a nadie: solo le prestan encargos que no son suyos». Chiloé amanece con su luz de lana sobre el mar." },
        ] },
    ],
    question: "¿Para qué usa la comunidad chilota al Trauco, según la abuela?",
    options: [
      "Para explicar embarazos sin nombrar al padre verdadero",
      "Para asustar a los niños que entran al bosque",
      "Para proteger los quilantos de los leñadores",
      "Para encontrar objetos perdidos en la marea",
    ],
    answerIndex: 0,
  },

  {
    id: "mt-05", type: "mitos", skill: "lectura", difficulty: 3, cefr: "B1",
    title: "El Pombero",
    origin: "Argentina y Paraguay · litoral",
    start: 0,
    prompt: "Has recorrido la leyenda: responde.",
    explanation: "El Pombero del litoral cuida los campos y a los pájaros: si le dejan tabaco y algo de comer, protege la hacienda y devuelve perdidos; si lo molestan, espanta caballos y enreda soga. Es un trato de reciprocidad, no un castigo.",
    tags: ["mitos", "litoral", "comprensión"],
    nodes: [
      { id: "n1", text: "En el monte del litoral te enseñan la cortesía del campo: al pasar junto al nido de pájaros del Pombero, se le deja tabaco, miel o un cigarro encendido en una tapera. No es oro lo que quiere: es el gesto de quien lo saluda.",
        choices: [
          { label: "Dejar un poco de tabaco en la tapera", next: 1, feedback: "Dejas el tabaco envuelto en papel de estraza. A la mañana, el paquete ya no está; en su lugar, el pasto amanece peinado como por manos chiquitas." },
          { label: "Guardar el tabaco para el viaje", next: 2, feedback: "No dejas nada. Esa noche, los caballos del campamento se despiertan espantados y una soga aparece enredada en el techo del rancho, en nudos que nadie sabe hacer." },
        ] },
      { id: "n2", text: "El Pombero es bajito, rellenito, cubierto de pelo oscuro y con un sombrero de paja enorme. Anda de noche, silba bajito como un colega discreto y conoce todos los senderos del monte: los que existen y los que todavía no.",
        choices: [
          { label: "Silbar bajito para devolver el saludo", next: 3, feedback: "Silbas bajito. Desde el monte contestan un silbido corto, como una contraseña. Esa noche, ningún animal se desbanda y el fuego no se apaga ni con la tormenta." },
          { label: "Buscarlo con una linterna para verlo", next: 3, feedback: "La luz no encuentra nada: solo la linterna se agota en cinco minutos, aunque fuera nueva. En el monte no se busca al Pombero: se le respeta." },
        ] },
      { id: "n3", text: "Al día siguiente, el capataz revisa la hacienda: falta un ternero. Antes de darlo por perdido, te mira: «Dejaste tabaco? El Pombero no roba: guarda. Si le cae bien, mañana lo tienes en el mismo potrero, como si nunca hubiera faltado».",
        choices: [
          { label: "Esperar hasta el alba con paciencia", next: 3, feedback: "Al alba, el ternero pasta junto a la tapera, tranquilo como si nada. En la cerca, el tabaco que dejaste ya no está. El trato del campo quedó firmado." },
          { label: "Enojo y buscar huellas toda la tarde", next: 3, feedback: "Buscas y buscas: las huellas dan vueltas en círculo y terminan donde empezaron. Al volver, el ternero está en el potrero. Comprendes la lección sin que nadie te la explique." },
        ] },
      { id: "n4", text: "El viejo capataz remata mientras ceba mate: «El Pombero no es un espanto. Es un tratado viejo entre el monte y la gente: él cuida lo que se le encariña, y cobra que lo traten bien a los pájaros y a los perros del campo».",
        choices: [
          { label: "Dejarle tabaco cada vez que pases", next: -1, feedback: "Cada viaje, tu paquete de cortesía. Cada viaje, el monte amanece más quieto y los pájaros cantan cerca del rancho, como escolta." },
          { label: "Contar el trato a los peones nuevos", next: -1, feedback: "Los peones escuchan y sonríen: cada uno tenía su propia historia. Así andan las leyendas del litoral: de fogón en fogón, con azúcar y tabaco." },
        ] },
    ],
    question: "¿Qué espera el Pombero de la gente, según la leyenda?",
    options: [
      "Respeto y pequeños gestos de cortesía, como el tabaco",
      "Que le construyan altares en el monte",
      "Que nadie silbe de noche en su territorio",
      "Que le entreguen un pájaro cada luna llena",
    ],
    answerIndex: 0,
  },

  {
    id: "mt-06", type: "mitos", skill: "lectura", difficulty: 4, cefr: "B2",
    title: "La Patasola",
    origin: "Colombia · vertientes andinas",
    start: 0,
    prompt: "Has recorrido la leyenda: responde.",
    explanation: "La Patasola, de un solo pie y pechos de lamento, aparece a los cazadores y leñadores que entran solos a la montaña: es la montaña defendiéndose de la codicia, y solo se le vence con un palo de abejorro, un perro o la memoria de casa.",
    tags: ["mitos", "Colombia", "comprensión"],
    nodes: [
      { id: "n1", text: "Subes por la trocha a recoger leña. El guía deja de hablar de golpe, señala un palo grueso en el suelo y dice: «El palo de abejorro. Cárgalo. Si ella llega, no corras: corre el que corre».",
        choices: [
          { label: "Cargar el palo de abejorro", next: 1, feedback: "Cargas el palo. Pesa lo justo. El guía asiente: «Con esto en la mano, ella busca otro monte. Es el palo de los que respetan la montaña»." },
          { label: "Confiar en tus piernas", next: 2, feedback: "Sonríes con la seguridad de la ciudad. El guía no discute: «Cuando oigas que llora una mujer arriba, no subas a ayudarla». Sigue caminando." },
        ] },
      { id: "n2", text: "La leña se junta despacio cuando el aire cambia: huele a monte mojado y a flores viejas. Entre los yarumos aparece ella: una mujer de un solo pie, hermosa y triste, que se queja de un dolor que no tiene nombre.",
        choices: [
          { label: "Levantar el palo sin apurarse", next: 3, feedback: "Alzas el palo de abejorro. La Patasola te mira, comprende que este monte ya está tratado, y se deshace en yarumos como si el viento la pidiera de vuelta." },
          { label: "Ofrecerle ayuda", next: 3, feedback: "Das un paso hacia ella. El pie único marca el barro, la tristeza se le agranda, y de pronto el uno-pie es mucho más cerca de lo que gritaste. El guía te jala del hombro y la trocha vuelve a existir." },
        ] },
      { id: "n3", text: "Corriste. La trocha se abre en tres, todas bajando, y en las tres hay un llanto fino que llama. La montaña, dicen, guarda a los que corren asustados y les enseña el camino largo: el que solo sale con abejorro, perro o recordar el nombre de casa.",
        choices: [
          { label: "Pronunciar en voz alta el nombre de casa", next: 3, feedback: "Dices el nombre de tu casa, de tu gente, de la comida que espera. El llanto se escucha lejos de golpe, como desenchufado. La trocha de la izquierda baja clara y sin trucos." },
          { label: "Sentarse a esperar al guía", next: 3, feedback: "Te sientas sobre la leña y no miras las tres trochas. A los diez minutos, el guía llega con dos perros flacos. Los perros gruñen a la espesura y la espesura se aplaca." },
        ] },
      { id: "n4", text: "Al bajar, el guía enciende un cigarro para la montaña y suelta el humo al aire: «La Patasola era una mujer de monte, dicen, que no dejó a nadie en paz. Ahora solo quiere compañía, y la pide llorando. Cuidado con los llantos que se ofrecen solos».",
        choices: [
          { label: "Preguntar si la montaña la escucha", next: -1, feedback: "«La montaña ES ella —dice el guía—. La montaña se cansó de hachas y de gritos, y puso una voz bonita en la trocha». El valle respira abajo, verde y en paz." },
          { label: "Guardar el palo de abejorro de recuerdo", next: -1, feedback: "El guía te lo permite: «El palo no es amuleto: es costumbre. Llévalo para no olvidar que la montaña se entra con permiso»." },
        ] },
    ],
    question: "¿Quién es, según el guía, la Patasola?",
    options: [
      "La voz con que la montaña se defiende de la codicia",
      "Un espíritu que cuida el ganado en la trocha",
      "La madre de los abejorros de la vertiente",
      "Una mujer que espera a los caminantes para guiarlos",
    ],
    answerIndex: 0,
  },

  {
    id: "mt-07", type: "mitos", skill: "lectura", difficulty: 3, cefr: "B1",
    title: "El Sombrerón",
    origin: "Guatemala · tradición oral",
    start: 0,
    prompt: "Has recorrido la leyenda: responde.",
    explanation: "El Sombrerón de Guatemala persigue a las muchachas de pelo largo con su guitarra y sus maldades musicales: la tradición recomienda cortarse el pelo y no escuchar la serenata de noche, porque el que se enamora del acorde perdido pierde el sueño y el apetito.",
    tags: ["mitos", "Guatemala", "comprensión"],
    nodes: [
      { id: "n1", text: "En La Antigua te alquilan un cuarto con patio de luceros. La dueña, doña Chenta, avisa desde el umbral: «Si de noche oye guitarrita, ni se asome, ni se antoje, ni salga a bailar. Ese no es un mariachi».",
        choices: [
          { label: "Preguntar quién toca esa guitarra", next: 1, feedback: "Doña Chenta se santigua: «El Sombrerón: bajito, con sombrero enorme y botas de Relámpago. Anda detrás de las muchachas de trenza larga, tocándoles lo que ellas más quieren oír»." },
          { label: "Cerrar la ventana temprano y no averiguar", next: 2, feedback: "Cieras la ventana temprano. Al filo de la medianoche, el patio se llena de una guitarra dulce y de un caballo que relincha despacito, como si masticara la calle." },
        ] },
      { id: "n2", text: "Cuentan que a la muchacha que le gusta, el Sombrerón le deshace las trenzas mientras duerme y le deja la guitarra prendida en los sueños: por eso las abuelas recomiendan pelo corto, calzones al revés y no escuchar la serenata hasta el final.",
        choices: [
          { label: "Preguntar qué pasa si se escucha hasta el final", next: 3, feedback: "Doña Chenta baja la voz: «Se le queda adentro. La muchacha deja de comer, de dormir y se va apagando como vela sin cazo. Por eso se le corta el pelo: sin trenzas, no la encuentra»." },
          { label: "Preguntar si alguna vez se le ha visto", next: 3, feedback: "«Verlo, lo vieron los abuelos: sombrero como tinaja y ojos de brasa fría. Ahora solo se le oye. Y es peor, porque el oído no tiene párpados»." },
        ] },
      { id: "n3", text: "Esa noche, la guitarra llega con su paso de caballo chiquito. Toca una canción de feria antigua, tan dulce que duele. En la pensión vecina, la muchacha del balcón se asoma hecha un sueño, moviendo su trenza al compás.",
        choices: [
          { label: "Avisar a doña Chenta de la muchacha del balcón", next: 3, feedback: "Doña Chenta cruza el patio con una vela y unas tijeras de pastor. A la mañana, la muchacha amanece con el pelo a la altura de la pena y un hambre de olla que no se explican de otro modo." },
          { label: "Taparse con la cobija y aguantar el encanto", next: 3, feedback: "Te cubres la cabeza con la cobija. La guitarra se aleja rabiosa, con un tropel de cuatro cascos de caballo chiquito. El sueño vuelve, con sabor a vela y a triunfo pequeño." },
        ] },
      { id: "n4", text: "Al alba, doña Chenta barre el patio y recoge cuatro herraduras de caballo chiquito que nadie recuerda haber visto entrar. «Póngalas en la puerta —te dice—. Que sepa que esta casa ya tiene música propia».",
        choices: [
          { label: "Colgar las herraduras con respeto", next: -1, feedback: "Las cuelgas junto a la aldaba. Las noches siguientes, la guitarra pasa de largo, y el patio se queda con sus propios grillos: una orquesta modesta y a prueba de Sombrerón." },
          { label: "Preguntar por la muchacha del balcón", next: -1, feedback: "«Está bien —dice doña Chenta—. Le cortamos las trenzas y le dimos pozole hasta que se le olvidó la canción». En La Antigua, la leyenda se cura con tijeras y con caldo." },
        ] },
    ],
    question: "¿Por qué las abuelas recomiendan cortarse el pelo frente al Sombrerón?",
    options: [
      "Porque sin trenzas largas el Sombrerón no encuentra a su presa",
      "Porque el pelo corto ahuyenta a los caballos chiquitos",
      "Porque la guitarra se enreda en el pelo y se rompe",
      "Porque es señal de luto por las serenatas perdidas",
    ],
    answerIndex: 0,
  },

  {
    id: "mt-08", type: "mitos", skill: "lectura", difficulty: 4, cefr: "B2",
    title: "El Basilisco de Chiloé",
    origin: "Chiloé · Chile",
    start: 0,
    prompt: "Has recorrido la leyenda: responde.",
    explanation: "El Basilisco chilote nace del huevo de gallo cuidado siete años bajo el brasero: serpiente con cresta de gallo, mata con la mirada a quien lo mira primero; su debilidad es la luz del día y el espejo que le devuelve su propia cara.",
    tags: ["mitos", "Chiloé", "comprensión"],
    nodes: [
      { id: "n1", text: "En la casa de los sectores antiguos, la abuela aparta un huevo redondito de los demás y lo mira con disgusto: «Huevo de gallo. Si uno lo guarda siete años bajo el brasero, del cascarón sale el Basilisco. Este lo vamos a romper antes».",
        choices: [
          { label: "Preguntar cómo es el Basilisco", next: 1, feedback: "«Serpiente con cresta de gallo, unos dos palmos, con dientes y una mirada que no conviene recibir: el primero que lo ve, cae muerto antes de que suene el cascarón»." },
          { label: "Sugerir quemarlo esa misma noche", next: 2, feedback: "La abuela asiente, pero con calma: «Se quema, sí, pero primero se le busca el nido. Si hay un huevo de gallo, puede haber una nidada entera bajo otro brasero»." },
        ] },
      { id: "n2", text: "Cuentan que el Basilisco sale de noche a sorber el aire de los gallineros y, a veces, el aire de los dormidos. Vive en el hueco bajo la casa, y por donde pasa, el pasto se amarillea en línea recta, como si un carbón invisible lo arrastrara.",
        choices: [
          { label: "Buscar la línea de pasto amarillo en el patio", next: 3, feedback: "La encuentras: un surco seco que entra bajo la galería. En el hueco, algo respira con un silbido de brasero encendido. No te agachas. La curiosidad ya cumplió su parte." },
          { label: "Pedirle a la abuela un espejo antes de mirar", next: 3, feedback: "La abuela te da un espejo ovalado: «Al Basilisco no se le mira de frente: se le pone un espejo. Que se vea él primero, que se le caiga la maña de matar de vista»." },
        ] },
      { id: "n3", text: "El hueco bajo la galería respira. La abuela llega con el espejo en una mano y una lámpara en la otra, y se sienta como quien espera un ómnibus: «El Basilisco solo manda de noche y de frente. Con espejo y lámpara, la leyenda se le vuelve en contra».",
        choices: [
          { label: "Alzar la lámpara al borde del hueco", next: 3, feedback: "La luz entra al hueco. Hay un silbido corto, un olor a brasero apagado y un ruido seco de cresta contra el madero: la bestia de la mirada ya no puede mirar." },
          { label: "Dejar que la abuela haga el rito sola", next: 3, feedback: "La abuela sujeta el espejo hacia el hueco y tararea una canción de iglesia. Poco después sale arrastrándose una cresta vencida, y la lámpara apenas tiembla. A veces, el mejor papel es sostener la luz." },
        ] },
      { id: "n4", text: "Al amanecer, bajo la galería, aparece el Basilisco quieto como una raíz: la tradición se cumplió. La abuela lo mira sin miedo: «Nació de un huevo descuidado y de siete años de descuido encima. Las leyendas no se vencen con valor: se vencen con espejo, con luz y con no descuidar las cosas calientes».",
        choices: [
          { label: "Ayudar a sellar el hueco con ceniza caliente", next: -1, feedback: "Tapan el hueco con ceniza del brasero, el único fuego que el Basilisco respeta. La casa queda limpia de sustos y la abuela reparte tortillas como quien firma un tratado." },
          { label: "Anotar la lección en tu bitácora", next: -1, feedback: "Escribes: «El Basilisco mata al que lo mira primero: por eso los espejos y las lámparas son armas antiguas». Chiloé amanece lloviendo luz suave, como si no hubiera pasado nada." },
        ] },
    ],
    question: "¿Cómo se derrota al Basilisco, según la tradición chilota?",
    options: [
      "Con un espejo y una lámpara, para que se mire a sí mismo y de noche no mande",
      "Corriéndole más rápido que su mirada al amanecer",
      "Con gallinas jóvenes que confunden su cresta",
      "Guardando su huevo bajo el brasero otros siete años",
    ],
    answerIndex: 0,
  },
];
