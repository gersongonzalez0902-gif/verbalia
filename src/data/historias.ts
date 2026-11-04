import type { HistoriasExercise } from "@/types";

/**
 * PAQUETE · Historias Ramificadas (Torre de la Expresión) · Etapa 2
 * Relatos originales con decisiones. Las elecciones son libres
 * (explorar no se castiga); al final, una pregunta de comprensión
 * sobre lo vivido valida la lectura.
 */
export const HISTORIAS_PACK: HistoriasExercise[] = [
  { id: "hi-01", type: "historias", skill: "expresion", difficulty: 2, cefr: "A2",
    title: "El farol apagado",
    start: 0,
    nodes: [
      { id: "n1", text: "Caminas de vuelta al faro. Es tarde y, al mirar la cima, descubres que la luz está apagada. Don Emilio no está en su cabaña.",
        choices: [
          { label: "Subir corriendo a encenderlo", next: 1, feedback: "Subes los escalones de dos en dos. La puerta del faro está entreabierta." },
          { label: "Buscar a don Emilio por el puerto", next: 2, feedback: "Bajas al puerto. Un pescador te dice que vio al farero ir hacia las rocas." },
        ] },
      { id: "n2", text: "Arriba, el mechero del faro está frío. Junto a la palanca hay una nota: «Se me acabó el petróleo. Las reservas están en el cobertizo. Vuelvo enseguida. —E.»",
        choices: [
          { label: "Ir al cobertizo por las reservas", next: 3, feedback: "El cobertizo huele a sal y a madera vieja. Encuentras las latas de petróleo." },
          { label: "Esperar sentado a don Emilio", next: 3, feedback: "Te sientas en la escalera. A los diez minutos ves una silueta subiendo con un farolillo: es él, con las reservas." },
        ] },
      { id: "n3", text: "Entre las rocas encuentras a don Emilio: se le ha enganchado la bota entre las piedras y no puede solo, pero no gritó porque no quería asustar a nadie.",
        choices: [
          { label: "Ayudarlo a liberar la bota", next: 3, feedback: "Entre los dos tiráis con cuidado. La bota sale, con don Emilio dentro, y los dos caéis sentados riendo." },
          { label: "Correr al pueblo a pedir ayuda", next: 3, feedback: "Vuelves con dos marineros y una cuerda. Don Emilio, ya libre, finge estar enfadado... pero te guiña el ojo." },
        ] },
      { id: "n4", text: "Cuando por fin la luz del faro vuelve a encenderse, el mar entero parece suspirar aliviado. Don Emilio, ya con el petróleo repuesto y la bota librada, te confiesa que se quedó atascado entre las rocas sin pedir ayuda a gritos para no asustar al pueblo. Te ofrece un té caliente en su cabaña.",
        choices: [
          { label: "Aceptar el té y su historia", next: -1, feedback: "«Cuarenta años encendiendo luces —dice—, y esta es la primera vez que alguien llega antes que yo.»" },
          { label: "Volver a casa con la faena hecha", next: -1, feedback: "Bajas por el sendero. A tu espalda, el haz del faro barre el mar como un aplauso lento." },
        ] },
    ],
    question: "¿Por qué don Emilio no pidió ayuda a gritos?",
    options: [
      "Porque no quiso asustar a nadie",
      "Porque estaba dormido entre las rocas",
      "Porque perdió la voz de viejo",
      "Porque quería apagar el faro a propósito",
    ],
    answerIndex: 0,
    prompt: "Has vivido la historia: ahora responde.",
    explanation: "El texto lo dice en el tercer nodo: no gritó para no asustar a nadie.",
    tags: ["comprensión", "valentía"] },

  { id: "hi-02", type: "historias", skill: "expresion", difficulty: 3, cefr: "B1",
    title: "La carta sin destinatario",
    start: 0,
    nodes: [
      { id: "n1", text: "Trabajas en la oficina de correos de una isla donde todos se conocen. Entre el saco de hoy aparece una carta sin destinatario, solo con un dibujo de una gaviota en el reverso.",
        choices: [
          { label: "Preguntar en el pueblo quién la envió", next: 1, feedback: "La tendera dice: «Una gaviota dibujada... Eso hacía la maestra jubilada, doña Vera, para sus antiguos alumnos.»" },
          { label: "Abrirla con cuidado, solo para buscar pistas", next: 2, feedback: "Dentro hay una sola frase: «Gracias por volver a mirar el mar conmigo». Sin firma. Te sientes un poco intruso." },
        ] },
      { id: "n2", text: "Doña Vera vive junto a la capilla. Al explicarle el caso, sonríe con tristeza: «La escribí para el farero. Pero se me olvidó poner el nombre. Temo que ya no pueda leerla.»",
        choices: [
          { label: "Llevarla igualmente al faro", next: 2, feedback: "Decides intentar el último viaje de la carta. El camino al faro huele a romero y a sal." },
          { label: "Proponerle entregarla en mano, juntos", next: 2, feedback: "Doña Vera agarra su bastón y, por primera vez en años, sale del pueblo contigo." },
        ] },
      { id: "n3", text: "La gaviota del reverso coincide con la veleta del faro: la carta parece escrita para su farero. Allí, un marinero joven te atiende: don Emilio, el farero viejo, murió el pasado invierno. La carta, sin embargo, parece escrita hace apenas dos días.",
        choices: [
          { label: "Devolver la carta a doña Vera", next: 3, feedback: "Vuelves al pueblo con la carta. Doña Vera te espera en el mismo banco de la capilla." },
          { label: "Leérsela en voz alta al mar", next: -1, feedback: "Lees la frase mirando el horizonte. El marinero joven, desde la puerta, se une en silencio a tu lectura." },
        ] },
      { id: "n4", text: "Doña Vera escucha la noticia con los ojos muy abiertos. Luego mira la carta y dice: «La escribí anoche, sabiendo que nunca llegaría. A veces se escribe para despedirse, no para enviar.»",
        choices: [
          { label: "Ofrecerle echarla al mar juntos", next: -1, feedback: "Desde el muelle, la carta vuela un instante y el agua se la lleva como si la esperara." },
          { label: "Proponerle enmarcarla en la capilla", next: -1, feedback: "La carta cuelga ahora junto a las ofrendas, con su gaviota mirando a la puerta." },
        ] },
    ],
    question: "¿Qué se entiende de la frase final de doña Vera («a veces se escribe para despedirse»)?",
    options: [
      "Escribía para asumir la pérdida, no para comunicarse",
      "Se había olvidado de poner el sello a propósito",
      "Esperaba que el marinero la leyera en voz alta",
      "Quería que la carta viajara hasta otro país",
    ],
    answerIndex: 0,
    prompt: "Has vivido la historia: ahora responde.",
    explanation: "Doña Vera sabía que el destinatario había muerto: escribir era su modo de despedirse.",
    tags: ["comprensión profunda", "duelo"] },

  { id: "hi-03", type: "historias", skill: "expresion", difficulty: 4, cefr: "B2",
    title: "La palabra que faltaba",
    start: 0,
    nodes: [
      { id: "n1", text: "Escribes la crónica semanal del periódico de la isla. Esta noche, la última palabra del artículo se te ha borrado del cuaderno, y la imprenta cierra en una hora.",
        choices: [
          { label: "Cerrar el artículo con otra palabra cualquiera", next: 1, feedback: "Escribes «cosas» y el artículo se cierra con un sabor raro, como un plato sin sal." },
          { label: "Volver al muelle a buscar la palabra perdida", next: 2, feedback: "Vuelves al muelle, donde tomaste las notas. La marea alta se ha llevado hasta las gaviotas." },
        ] },
      { id: "n2", text: "El imprentero lee tu cierre con «cosas» y pone cara de dolor: «Tu crónica hablaba del reencuentro de los hermanos pescadores. 'Cosas' mata la emoción. ¿Qué palabra tenías?»",
        choices: [
          { label: "Reconocer que no la recuerdas", next: 3, feedback: "«Tranquilo —dice—. A veces la palabra perdida vuelve sola, cuando ya no la buscas.»" },
          { label: "Inventar una palabra nueva que la sustituya", next: 3, feedback: "Escribes «hermanura»: la mezcla de hermano y ternura. El imprentero la mira largo rato y sonríe." },
        ] },
      { id: "n3", text: "En el muelle, el hermano menor de los pescadores remienda una red. Le cuentas lo de la palabra perdida. Suelta el hilo y dice: «¿Era 'regazo'? Lo dije yo, hablando de mi hermano: volver a su regazo de redes.»",
        choices: [
          { label: "Correr a la imprenta con «regazo»", next: -1, feedback: "Llegas con la camisa empapada. El artículo sale al alba y, con ella, alguien llora de alegría en el muelle." },
          { label: "Elegir tu propia palabra final", next: -1, feedback: "Escribes: «...y el mar, que todo lo separa, ayer aprendió a devolver». El imprentero, al despedirte, te suelta: «¿Ves? La palabra venía camino de vuelta»." },
        ] },
      { id: "n4", text: "La imprenta cierra y la crónica saldrá al alba con lo que haya. Caminas a casa bajo un cielo lavado. En tu cuaderno, escribes la palabra que creías perdida... y no es la que recordabas: es mejor.",
        choices: [
          { label: "Guardarla para la próxima crónica", next: -1, feedback: "La subrayas dos veces. Las buenas palabras, como los buenos vientos, siempre regresan." },
          { label: "Escribir con ella una carta al lector", next: -1, feedback: "La carta sale en la última página: «Gracias por prestarme los ojos: esta isla se ve mejor contigo.»" },
        ] },
    ],
    question: "¿Qué enseñanza deja la historia sobre la palabra perdida?",
    options: [
      "Las palabras justas suelen volver cuando dejamos de perseguirlas",
      "Hay que escribir siempre con tiempo de sobra",
      "La imprenta nunca debe cerrar tan temprano",
      "Las palabras inventadas están prohibidas en la prensa",
    ],
    answerIndex: 0,
    prompt: "Has vivido la historia: ahora responde.",
    explanation: "«La palabra perdida vuelve sola cuando ya no la buscas»: la idea atraviesa los dos caminos de la historia.",
    tags: ["tema", "escritura"] },

  { id: "hi-04", type: "historias", skill: "expresion", difficulty: 5, cefr: "C1",
    title: "El traductor de silencios",
    start: 0,
    nodes: [
      { id: "n1", text: "En la isla hay un oficio raro: el traductor de silencios. Cuando dos personas dejan de hablarse, se le contrata para interpretar lo que ya no se dicen. Hoy te toca el puesto.",
        choices: [
          { label: "Escuchar primero a la persona mayor", next: 1, feedback: "La abuela Rosa habla sin pausa durante media hora... y no menciona ni una sola vez a su hijo." },
          { label: "Escuchar primero a la persona joven", next: 2, feedback: "Tomás, el nieto, rema solo en su bote. Responde con monosílabos y remienda una red que no necesita remiendo." },
        ] },
      { id: "n2", text: "La abuela Rosa guarda, junto a la ventana, la taza de Tomás: la lava cada tarde, aunque él no viene a casa desde hace tres meses. «No es que esté enfadada —te dice—. Es que no sé empezar.»",
        choices: [
          { label: "Proponerle una excusa para invitarlo", next: 3, feedback: "«Dile que el naranjo tiene demasiadas naranjas y que no puedo con todas.» Sonríe como quien aprende un idioma nuevo." },
          { label: "Sugerirle escribirle una carta corta", next: 3, feedback: "Escribe tres líneas y las tacha todas. A la cuarta, deja de tachar: «Ya está. Se las doy mañana.»" },
        ] },
      { id: "n3", text: "En el bote, Tomás deja de remendar y confiesa: «Yo tampoco sé empezar. Cada tarde lavo mi taza y la pongo junto a la ventana de mi casa. Creo que los dos lavamos la misma taza ausente.»",
        choices: [
          { label: "Contarle lo de la taza de su abuela", next: -1, feedback: "Se queda quieto largo rato. Al día siguiente, su taza aparece de nuevo junto a la ventana de ella: con dos tazas ahora." },
          { label: "Proponerle remar juntos hasta su casa", next: -1, feedback: "El silencio del remo a dos es distinto: va acompañado. La abuela, en el muelle, ve llegar el bote y se seca las manos en el delantal." },
        ] },
      { id: "n4", text: "El reencuentro ocurre sin frases grandes: un naranjo cargado, una excusa tonta, dos tazas en una ventana. Tomás te cuenta después que él también lavaba su taza cada tarde, pensando en la de su abuela: los dos lavaban la misma taza ausente. Antes de irte, la abuela te paga y agrega: «¿Y el silencio del traductor? ¿Quién lo traduce?».",
        choices: [
          { label: "Responder que los traductores solo callan a tiempo", next: -1, feedback: "Recoges tu gorra y tu cuaderno. En la última página anotas: «El silencio también se conjuga, y hoy quedó en pasado.»" },
          { label: "Confesar que este oficio también te pesa", next: -1, feedback: "«Todos los oficios de puente —dice ella— pesan. Por eso los puentes se hacen de dos orillas.»" },
        ] },
    ],
    question: "¿Qué significa que abuela y nieto «laven la misma taza ausente»?",
    options: [
      "Que ambos echan de menos el mismo vínculo y lo cuidan en secreto",
      "Que discuten por quién debe lavar los platos",
      "Que ninguno de los dos tiene agua en casa",
      "Que la taza se perdió en el último viaje en bote",
    ],
    answerIndex: 0,
    prompt: "Has vivido la historia: ahora responde.",
    explanation: "Lavar una taza que nadie usa es un ritual de ausencia: los dos cuidan, sin decirlo, el mismo cariño.",
    tags: ["metáfora", "vínculos"] },
];
