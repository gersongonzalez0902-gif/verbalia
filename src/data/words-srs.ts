import type { SrsWord } from "@/types";

/**
 * Paquete SRS · Vocabulario progresivo A1-C2.
 * Incluye registro formal, coloquial y regionalismos del mundo hispanohablante.
 * 73 palabras (49 originales + 24 nuevas en Etapa 2): dificultad
 * progresiva A1-C2 con registro formal, coloquial y regionalismos.
 */
export const SRS_WORDS: SrsWord[] = [
  // ---------- A1 ----------
  { id: "w-casa", word: "casa", pos: "sustantivo", definition: "Edificio donde vive una persona o una familia.", example: "Volví a casa antes del anochecer.", difficulty: 1, cefr: "A1", tags: ["básico", "hogar"] },
  { id: "w-perro", word: "perro", pos: "sustantivo", definition: "Animal doméstico de la familia de los cánidos; fiel compañero de las personas.", example: "El perro ladra cuando llegan visitas.", difficulty: 1, cefr: "A1", tags: ["básico", "animales"] },
  { id: "w-comer", word: "comer", pos: "verbo", definition: "Masticar y tragar un alimento.", example: "Vamos a comer paella el domingo.", difficulty: 1, cefr: "A1", tags: ["básico", "comida"] },
  { id: "w-libro", word: "libro", pos: "sustantivo", definition: "Conjunto de hojas impresas y encuadernadas para leer.", example: "Guardo cada libro como un tesoro.", difficulty: 1, cefr: "A1", tags: ["básico", "lectura"] },
  { id: "w-agua", word: "agua", pos: "sustantivo", definition: "Líquido transparente e incoloro que forma mares, ríos y lluvias.", example: "Bebe dos litros de agua al día.", difficulty: 1, cefr: "A1", tags: ["básico", "naturaleza"] },
  { id: "w-correr", word: "correr", pos: "verbo", definition: "Ir a más velocidad que andando.", example: "Salgo a correr por el parque cada mañana.", difficulty: 1, cefr: "A1", tags: ["básico", "deporte"] },
  { id: "w-grande", word: "grande", pos: "adjetivo", definition: "Que tiene mucho tamaño.", example: "Vive en una casa grande con jardín.", difficulty: 1, cefr: "A1", tags: ["básico", "descripción"] },
  { id: "w-dia", word: "día", pos: "sustantivo", definition: "Periodo de veinticuatro horas; también, el tiempo en que hay luz.", example: "Hoy es mi día libre.", difficulty: 1, cefr: "A1", tags: ["básico", "tiempo"] },
  { id: "w-ciudad", word: "ciudad", pos: "sustantivo", definition: "Conjunto de calles y edificios con muchos habitantes.", example: "La ciudad brilla de noche.", difficulty: 1, cefr: "A1", tags: ["básico", "urbanismo"] },
  { id: "w-feliz", word: "feliz", pos: "adjetivo", definition: "Que siente alegría o contento.", example: "Ser feliz también se entrena.", difficulty: 1, cefr: "A1", tags: ["básico", "emociones"] },

  // ---------- A2 ----------
  { id: "w-viaje", word: "viaje", pos: "sustantivo", definition: "Traslado de un lugar a otro, sobre todo por ocio.", example: "Este viaje me cambió la mirada.", difficulty: 2, cefr: "A2", tags: ["viajes"] },
  { id: "w-herramienta", word: "herramienta", pos: "sustantivo", definition: "Instrumento que sirve para realizar un trabajo.", example: "La paciencia también es una herramienta.", difficulty: 2, cefr: "A2", tags: ["trabajo"] },
  { id: "w-crecer", word: "crecer", pos: "verbo", definition: "Aumentar de tamaño o desarrollarse.", example: "Las plantas crecen con calma.", difficulty: 2, cefr: "A2", tags: ["naturaleza"] },
  { id: "w-olvidar", word: "olvidar", pos: "verbo", definition: "Perder la memoria de algo o de alguien.", example: "No olvides cerrar la puerta con llave.", difficulty: 2, cefr: "A2", tags: ["memoria"] },
  { id: "w-ahorro", word: "ahorro", pos: "sustantivo", definition: "Dinero que se guarda en previsión de gastos futuros.", example: "El ahorro me acerca al viaje soñado.", difficulty: 2, cefr: "A2", tags: ["dinero"] },
  { id: "w-vecino", word: "vecino", pos: "sustantivo", definition: "Persona que vive cerca de otra o en la misma zona.", example: "Mi vecina me prestó azúcar para el bizcocho.", difficulty: 2, cefr: "A2", tags: ["comunidad"] },
  { id: "w-suave", word: "suave", pos: "adjetivo", definition: "De textura agradable y delicada; también, poco intenso.", example: "La manta es tan suave que da gusto tocarla.", difficulty: 2, cefr: "A2", tags: ["descripción"] },
  { id: "w-mercado", word: "mercado", pos: "sustantivo", definition: "Lugar público donde se compran y venden alimentos y otros productos.", example: "El mercado huele a fruta fresca.", difficulty: 2, cefr: "A2", tags: ["comida", "compras"] },
  { id: "w-dibujar", word: "dibujar", pos: "verbo", definition: "Trazar figuras o imágenes con lápiz u otro instrumento.", example: "Me gusta dibujar mapas de islas imaginarias.", difficulty: 2, cefr: "A2", tags: ["arte"] },
  { id: "w-fuerte", word: "fuerte", pos: "adjetivo", definition: "Que tiene fuerza; también se aplica a sabores y sonidos intensos.", example: "El café está muy fuerte para mi gusto.", difficulty: 2, cefr: "A2", tags: ["descripción"] },

  // ---------- B1 ----------
  { id: "w-desafio", word: "desafío", pos: "sustantivo", definition: "Prueba o reto que exige esfuerzo y habilidad.", example: "Aceptó el desafío de escribir una novela en un año.", difficulty: 3, cefr: "B1", tags: ["retos"] },
  { id: "w-logro", word: "logro", pos: "sustantivo", definition: "Resultado positivo que se consigue con esfuerzo.", example: "Terminar la carrera fue su mayor logro.", difficulty: 3, cefr: "B1", tags: ["trabajo"] },
  { id: "w-esquivo", word: "esquivo", pos: "adjetivo", definition: "Que evita el trato o resulta difícil de atrapar.", example: "El gato era esquivo con los desconocidos.", difficulty: 3, cefr: "B1", tags: ["carácter"] },
  { id: "w-heredar", word: "heredar", pos: "verbo", definition: "Recibir algo de otra persona, en especial al morir esta.", example: "Heredó de su abuelo el don de contar historias.", difficulty: 3, cefr: "B1", tags: ["familia"] },
  { id: "w-indole", word: "índole", pos: "sustantivo", definition: "Naturaleza o carácter propio de algo.", example: "Es un problema de otra índole: no tiene que ver con el dinero.", difficulty: 3, cefr: "B1", tags: ["formal"] },
  { id: "w-meticuloso", word: "meticuloso", pos: "adjetivo", definition: "Que cuida los detalles con mucho esmero.", example: "Es una traductora meticulosa: revisa cada coma.", difficulty: 3, cefr: "B1", tags: ["carácter", "trabajo"] },
  { id: "w-madrugada", word: "madrugada", pos: "sustantivo", definition: "Tiempo transcurrido entre la medianoche y el amanecer.", example: "Terminé el libro de madrugada, sin poder soltarlo.", difficulty: 3, cefr: "B1", tags: ["tiempo"] },
  { id: "w-atasco", word: "atasco", pos: "sustantivo", definition: "Obstrucción que impide avanzar, en especial de tráfico.", example: "Hubo un atasco de diez kilómetros a la entrada de la ciudad.", difficulty: 3, cefr: "B1", tags: ["urbanismo"] },
  { id: "w-proverbio", word: "proverbio", pos: "sustantivo", definition: "Frase breve que expresa una enseñanza o sabiduría popular.", example: "Cada proverbio guarda un pueblo entero.", difficulty: 3, cefr: "B1", tags: ["cultura", "lectura"] },
  { id: "w-desastre", word: "desastre", pos: "sustantivo", definition: "Suceso que causa grandes daños o sale muy mal.", example: "La fiesta fue un desastre: se fue la luz y se quemó la tarta.", difficulty: 3, cefr: "B1", tags: ["emociones"] },

  // ---------- B2 / C1 ----------
  { id: "w-efimero", word: "efímero", pos: "adjetivo", definition: "Que dura muy poco tiempo.", example: "La gloria es a veces efímera; la costumbre de escribir, no.", difficulty: 4, cefr: "B2", tags: ["literario"] },
  { id: "w-elocuente", word: "elocuente", pos: "adjetivo", definition: "Que se expresa con belleza y convicción; muy expresivo.", example: "Su silencio fue más elocuente que cualquier discurso.", difficulty: 4, cefr: "B2", tags: ["comunicación"] },
  { id: "w-sesgo", word: "sesgo", pos: "sustantivo", definition: "Inclinación o perspectiva parcial que condiciona un juicio.", example: "Hay que leer la noticia sin sesgo y con contexto.", difficulty: 4, cefr: "B2", tags: ["pensamiento crítico"] },
  { id: "w-ardid", word: "ardid", pos: "sustantivo", definition: "Astucia o artimaña para engañar o conseguir algo.", example: "Escapó del examen con un ardid ingenioso pero visible.", difficulty: 4, cefr: "C1", tags: ["literario"] },
  { id: "w-prolijo", word: "prolijo", pos: "adjetivo", definition: "Demasiado largo y detallado al explicar algo.", example: "El informe era tan prolijo que nadie llegó al final.", difficulty: 4, cefr: "C1", tags: ["formal"] },
  { id: "w-morrinha", word: "morriña", pos: "sustantivo", definition: "Añoranza melancólica de la tierra propia (término gallego).", example: "La morriña le llegó al oír la gaita en la distancia.", difficulty: 4, cefr: "B2", tags: ["regionalismo", "Galicia", "emociones"] },
  { id: "w-guagua", word: "guagua", pos: "sustantivo", definition: "Autobús (uso en Canarias, Antillas y partes de América).", example: "Cogí la guagua de las ocho para bajar a la playa.", difficulty: 4, cefr: "B1", tags: ["regionalismo", "Canarias", "Caribe", "viajes"] },
  { id: "w-chapulin", word: "chapulín", pos: "sustantivo", definition: "Saltamontes (México); por extensión, persona inconstante que cambia de bando.", example: "Los chapulines cantan en el maizal al atardecer.", difficulty: 4, cefr: "B2", tags: ["regionalismo", "México", "naturaleza"] },
  { id: "w-ordago", word: "órdago", pos: "sustantivo", definition: "Reto o noticia impactante que cambia la situación (del eusquera, uso general).", example: "Soltó el órdago en la reunión: se va a vivir a Patagonia.", difficulty: 4, cefr: "C1", tags: ["regionalismo", "cultura", "coloquial"] },
  { id: "w-impetu", word: "ímpetu", pos: "sustantivo", definition: "Fuerza o energía con la que se inicia o impulsa algo.", example: "Defendió su idea con un ímpetu que convenció a todos.", difficulty: 4, cefr: "B2", tags: ["emociones"] },
  { id: "w-parco", word: "parco", pos: "adjetivo", definition: "Moderado y breve, especialmente al hablar o gastar.", example: "Fue parco en promesas y generoso en hechos.", difficulty: 4, cefr: "C1", tags: ["carácter", "formal"] },
  { id: "w-declinar", word: "declinar", pos: "verbo", definition: "Rechazar algo con cortesía; también, debilitarse o ir a menos.", example: "Declinó la invitación con elegancia.", difficulty: 4, cefr: "C1", tags: ["formal"] },

  // ---------- C2 ----------
  { id: "w-zaherir", word: "zaherir", pos: "verbo", definition: "Reprender o herir a alguien con palabras ásperas.", example: "Nunca zahería a sus alumnos: corregía con paciencia.", difficulty: 5, cefr: "C2", tags: ["literario"] },
  { id: "w-divagar", word: "divagar", pos: "verbo", definition: "Apartarse el pensamiento del asunto principal.", example: "Divagó tanto que olvidó la pregunta que intentaba responder.", difficulty: 5, cefr: "C2", tags: ["literario"] },
  { id: "w-garbo", word: "garbo", pos: "sustantivo", definition: "Elegancia y desenfreso en el porte o en la manera de hacer algo.", example: "Bailó con un garbo imposible de imitar.", difficulty: 5, cefr: "C2", tags: ["cultura"] },
  { id: "w-cacumen", word: "cacumen", pos: "sustantivo", definition: "Entendimiento agudo y penetrante (coloquial y culto a la vez).", example: "Sacó su cacumen cuando el mapa se quedó sin norte.", difficulty: 5, cefr: "C2", tags: ["coloquial"] },
  { id: "w-perenne", word: "perenne", pos: "adjetivo", definition: "Que dura siempre o muchísimo tiempo.", example: "Su ironía perenne sobrevive en cada una de sus cartas.", difficulty: 5, cefr: "C2", tags: ["literario"] },
  { id: "w-estampa", word: "estampa", pos: "sustantivo", definition: "Imagen o escena que destaca por su gracia o carácter.", example: "Aquellos pescadores remendando redes al alba fueron una estampa inolvidable.", difficulty: 5, cefr: "C2", tags: ["literario"] },

/* ==================== Ampliación Etapa 2 (+24) ==================== */
  // ---------- A1 ----------
  { id: "w-ventana", word: "ventana", pos: "sustantivo", definition: "Abertura en la pared que deja pasar la luz y el aire.", example: "Abre la ventana: el mar se oye desde aquí.", difficulty: 1, cefr: "A1", tags: ["básico", "hogar"] },
  { id: "w-buscar", word: "buscar", pos: "verbo", definition: "Intentar encontrar algo o a alguien.", example: "Busco las llaves por toda la casa.", difficulty: 1, cefr: "A1", tags: ["básico"] },

  // ---------- A2 ----------
  { id: "w-harina", word: "harina", pos: "sustantivo", definition: "Polvo fino que se obtiene de moler el trigo u otros cereales.", example: "Con harina y agua se hace el pan de siempre.", difficulty: 2, cefr: "A2", tags: ["comida", "hache"] },
  { id: "w-recado", word: "recado", pos: "sustantivo", definition: "Mensaje que una persona encarga transmitir a otra.", example: "Déjale un recado a tu hermano: vuelvo a las seis.", difficulty: 2, cefr: "A2", tags: ["comunicación"] },
  { id: "w-marea", word: "marea", pos: "sustantivo", definition: "Subida y bajada periódica del nivel del mar.", example: "Con la marea baja aparecen las pozas de cangrejos.", difficulty: 2, cefr: "A2", tags: ["mar"] },
  { id: "w-jamás", word: "jamás", pos: "adverbio", definition: "Nunca, en ningún momento.", example: "Jamás había visto un atardecer así.", difficulty: 2, cefr: "A2", tags: ["tiempo", "agudas"] },

  // ---------- B1 ----------
  { id: "w-vendaval", word: "vendaval", pos: "sustantivo", definition: "Viento fuerte, impetuoso y de larga duración.", example: "El vendaval tumbó los sombrillos del chiringo.", difficulty: 3, cefr: "B1", tags: ["clima", "mar"] },
  { id: "w-pesar", word: "pesar", pos: "sustantivo", definition: "Sentimiento de tristeza o arrepentimiento por algo.", example: "Con gran pesar, vendió la barca de su padre.", difficulty: 3, cefr: "B1", tags: ["emociones", "formal"] },
  { id: "w-esmero", word: "esmero", pos: "sustantivo", definition: "Cuidado y dedicación con que se hace algo.", example: "Coció la cena con esmero, como quien firma un cuadro.", difficulty: 3, cefr: "B1", tags: ["trabajo"] },
  { id: "w-candor", word: "candor", pos: "sustantivo", definition: "Sinceridad e inocencia propias de quien no sospecha el mal.", example: "Contó su plan con la candor de un niño.", difficulty: 3, cefr: "B1", tags: ["carácter", "literario"] },
  { id: "w-atardecer", word: "atardecer", pos: "sustantivo / verbo", definition: "Caída de la tarde; último tramo de luz del día.", example: "El atardecer pinta de cobre las ventanas.", difficulty: 3, cefr: "B1", tags: ["tiempo", "descripción"] },
  { id: "w-holgado", word: "holgado", pos: "adjetivo", definition: "Que tiene de sobra (dinero, tiempo); también, ancho de ropa.", example: "Con lo que ganó vive holgado, sin lujos ni apuros.", difficulty: 3, cefr: "B1", tags: ["dinero", "registro"] },
  { id: "w-quimera", word: "quimera", pos: "sustantivo", definition: "Ilusión o proyecto sin posibilidad real; monstruo de la mitología griega.", example: "Cazar esa fortuna era una quimera de juventud.", difficulty: 3, cefr: "B1", tags: ["abstracto", "mitología"] },

  // ---------- B2 ----------
  { id: "w-sosiego", word: "sosiego", pos: "sustantivo", definition: "Tranquilidad y calma del ánimo.", example: "Bucear le devuelve el sosiego que la ciudad le quita.", difficulty: 4, cefr: "B2", tags: ["emociones", "formal"] },
  { id: "w-honda", word: "honda", pos: "adjetivo", definition: "Profunda (en sentido literal y en sentido moral).", example: "Sintió una honda tristeza al ver el puerto vacío.", difficulty: 4, cefr: "B2", tags: ["hache", "literario"] },
  { id: "w-azuceo", word: "azuceo", pos: "sustantivo", definition: "Impulso o apuro repentino para llegar a tiempo (uso andaluz y americano).", example: "Con un azuceo último, alcanzó el ferry por un segundo.", difficulty: 4, cefr: "B2", tags: ["regionalismo", "Andalucía"] },
  { id: "w-atrapar", word: "atrapar", pos: "verbo", definition: "Coger o alcanzar a algo o alguien que se mueve.", example: "Atrapó la pelota al vuelo, sin mirarla.", difficulty: 4, cefr: "B2", tags: ["verbos"] },
  { id: "w-cavilar", word: "cavilar", pos: "verbo", definition: "Pensar largo y hondamente en algo, dando vueltas.", example: "Caviló toda la noche sobre la carta sin firma.", difficulty: 4, cefr: "B2", tags: ["verbos", "literario"] },
  { id: "w-ahínco", word: "ahínco", pos: "sustantivo", definition: "Esfuerzo vehemente y constante con que se persigue algo.", example: "Estudió sonidos de ballenas con enorme ahínco.", difficulty: 4, cefr: "B2", tags: ["formal", "esdrújulas"] },

  // ---------- C1 ----------
  { id: "w-melancolía", word: "melancolía", pos: "sustantivo", definition: "Tristeza suave y sin causa precisa, parecida a la nostalgia.", example: "La melancolía le entraba con el olor a sal.", difficulty: 5, cefr: "C1", tags: ["emociones", "hiatos"] },
  { id: "w-inquebrantable", word: "inquebrantable", pos: "adjetivo", definition: "Que no se puede romper ni doblegar.", example: "Guardó una fe inquebrantable en el regreso de las ballenas.", difficulty: 5, cefr: "C1", tags: ["carácter"] },
  { id: "w-bregar", word: "bregar", pos: "verbo", definition: "Luchar o trabajar con esfuerzo contra algo difícil.", example: "Bregó quince años para que el puerto tuviera luz.", difficulty: 5, cefr: "C1", tags: ["verbos", "literario"] },
  { id: "w-desazón", word: "desazón", pos: "sustantivo", definition: "Inquietud y disgusto interior que no se sabe nombrar.", example: "Le dejó una desazón rara aquella despedida sin abrazo.", difficulty: 5, cefr: "C1", tags: ["emociones", "literario"] },
  { id: "w-sereno", word: "sereno", pos: "sustantivo / adjetivo", definition: "Rocío de la noche; y también, quien mantiene la calma.", example: "El sereno de la madrugada mojaba las redes.", difficulty: 5, cefr: "C1", tags: ["polisemia", "mar"] },
  { id: "w-zozobrar", word: "zozobrar", pos: "verbo", definition: "Hundirse o tambalearse un barco; perder el ánimo la calma.", example: "Zozobró la barca en la roca y, con ella, su paciencia.", difficulty: 5, cefr: "C1", tags: ["náutica", "metafórico"] },
];

export const SRS_WORDS_BY_ID: Record<string, SrsWord> = SRS_WORDS.reduce(
  (acc, w) => {
    acc[w.id] = w;
    return acc;
  },
  {} as Record<string, SrsWord>,
);
